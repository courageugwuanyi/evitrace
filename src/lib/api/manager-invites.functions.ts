import crypto from "node:crypto";

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const RELATION_TYPES = ["manager", "skip_level"] as const;

type InviteRelationType = (typeof RELATION_TYPES)[number];
type RelationshipType = "direct_manager" | "skip_level";
type AccountRole = "engineer" | "manager" | "both";

type VerifiedInviteRow = {
  id: string;
  engineer_id: string;
  relation_type: InviteRelationType;
  expires_at: string;
  engineer_email: string | null;
};

type ReportingRelationshipRow = {
  id: string;
  engineer_id: string;
  manager_id: string;
  relation_type: RelationshipType;
  status: "active" | "in_handover" | "archived";
};

function getSupabaseConfig() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Missing VITE_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing VITE_SUPABASE_ANON_KEY");

  return { url, anonKey };
}

function createTokenScopedSupabaseClient(token: string) {
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function requireAuthenticatedUser(token: string) {
  const supabase = createTokenScopedSupabaseClient(token);
  const authResult = await supabase.auth.getUser(token);
  const {
    data: { user },
    error,
  } = authResult;

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

function hashInviteCode(rawCode: string): string {
  return crypto.createHash("sha256").update(rawCode).digest("hex");
}

function generateInviteCode(): string {
  return crypto.randomBytes(4).toString("hex");
}

function mapInviteToRelationshipType(inviteType: InviteRelationType): RelationshipType {
  return inviteType === "manager" ? "direct_manager" : "skip_level";
}

function extractDomain(email: string): string {
  const domain = email.split("@")[1]?.trim().toLowerCase() ?? "";
  if (!domain) throw new Error("Unable to validate email domain for invite redemption.");
  return domain;
}

function nextRoleForManager(
  existingRole: AccountRole | null,
): Extract<AccountRole, "manager" | "both"> {
  if (existingRole === "both") return "both";
  if (existingRole === "engineer") return "both";
  return "manager";
}

export const createManagerInvite = createServerFn({ method: "POST" })
  .validator(z.object({ relationType: z.enum(RELATION_TYPES), token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const supabase = createTokenScopedSupabaseClient(data.token);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(data.token);

    if (authError || !user) {
      console.error("[Explicit Auth Breakdown]:", authError);
      throw new Error("Unauthorized: Invalid or expired session token provided.");
    }

    const rawCode = generateInviteCode();
    const codeHash = hashInviteCode(rawCode);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from("manager_invites").insert({
      engineer_id: user.id,
      relation_type: data.relationType,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

    if (error) throw new Error(error.message);

    return {
      code: rawCode,
      expiresAt,
    };
  });

export const revokeActiveInvite = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { supabase, user } = await requireAuthenticatedUser(data.token);

    const { error } = await supabase
      .from("manager_invites")
      .delete()
      .eq("engineer_id", user.id)
      .is("used_at", null);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true as const };
  });

export const redeemManagerInvite = createServerFn({ method: "POST" })
  .validator(z.object({ rawCode: z.string().min(1), token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { supabase, user: managerUser } = await requireAuthenticatedUser(data.token);

    const normalizedCode = data.rawCode.trim();
    const codeHash = hashInviteCode(normalizedCode);

    const { data: invite, error: inviteError } = await supabase
      .rpc("verify_and_get_invite", { target_hash: codeHash })
      .maybeSingle<VerifiedInviteRow>();

    if (inviteError) {
      const rawMessage = inviteError.message ?? "Failed to verify invitation link.";
      const missingVerifyFn =
        rawMessage.includes("verify_and_get_invite") &&
        rawMessage.toLowerCase().includes("schema cache");
      if (missingVerifyFn) {
        throw new Error(
          "Invite verification is still being deployed. Please retry in a minute or ask your workspace admin to run the latest database migration.",
        );
      }
      throw new Error(rawMessage);
    }
    if (!invite) {
      throw new Error("This invitation link is invalid or has expired.");
    }

    const managerEmail = managerUser.email?.trim().toLowerCase();
    if (!managerEmail) {
      throw new Error("Unable to redeem invite: your account email is missing.");
    }

    const engineerEmail = invite.engineer_email?.trim().toLowerCase();
    if (!engineerEmail) {
      throw new Error("Unable to redeem invite: engineer profile email is missing.");
    }

    const engineerDomain = extractDomain(engineerEmail);
    const managerDomain = extractDomain(managerEmail);
    if (engineerDomain !== managerDomain) {
      throw new Error("Use your company email to join this engineer workspace.");
    }

    const { data: response, error: rpcError } = await supabase.rpc("accept_manager_invite", {
      target_hash: codeHash,
      current_manager_id: managerUser.id,
    });

    if (rpcError) {
      console.error("[RPC Handshake Failure]:", rpcError);
      const message = rpcError.message || "Failed to complete onboarding connection.";
      const normalized = message.toLowerCase();
      if (
        normalized.includes("unique_active_direct_manager") ||
        normalized.includes("already has an active direct manager")
      ) {
        throw new Error(
          "This engineer already has an active direct manager assigned. Ask the engineer to revoke old manager access before using a new direct-manager invite.",
        );
      }
      throw new Error(message);
    }

    const responseRow = Array.isArray(response) ? response[0] : response;
    const engineerId =
      responseRow && typeof responseRow === "object" && "engineer_id" in responseRow
        ? String((responseRow as { engineer_id: string }).engineer_id)
        : invite.engineer_id;

    return {
      success: true as const,
      engineerId,
    };
  });

export const signOffTransfer = createServerFn({ method: "POST" })
  .validator(
    z.object({
      engineerId: z.string().uuid(),
      workEthicsNotes: z.string().optional(),
      token: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { supabase, user } = await requireAuthenticatedUser(data.token);

    const { data: outgoingRelationship, error: relationshipError } = await supabase
      .from("reporting_relationships")
      .select("id, engineer_id, manager_id, relation_type, status")
      .eq("engineer_id", data.engineerId)
      .eq("manager_id", user.id)
      .eq("relation_type", "direct_manager")
      .eq("status", "in_handover")
      .maybeSingle<ReportingRelationshipRow>();

    if (relationshipError) throw new Error(relationshipError.message);
    if (!outgoingRelationship) {
      throw new Error("No in-progress handover found for this engineer.");
    }

    const { error: dossierError } = await supabase.from("handover_dossiers").insert({
      engineer_id: data.engineerId,
      old_manager_id: user.id,
      new_manager_id: null,
      ai_compiled_achievements: {},
      work_ethics_notes: data.workEthicsNotes?.trim() || null,
      completed_at: new Date().toISOString(),
    });
    if (dossierError) throw new Error(dossierError.message);

    const { error: archiveError } = await supabase
      .from("reporting_relationships")
      .update({
        status: "archived",
        ends_at: new Date().toISOString(),
      })
      .eq("id", outgoingRelationship.id);
    if (archiveError) throw new Error(archiveError.message);

    return { success: true as const, engineerId: data.engineerId };
  });
