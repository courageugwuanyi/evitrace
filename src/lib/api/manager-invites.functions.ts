import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const RELATION_TYPES = ["manager", "skip_level"] as const;

type InviteRelationType = (typeof RELATION_TYPES)[number];
type RelationshipType = "direct_manager" | "skip_level";

type VerifiedInviteRow = {
  id: string;
  engineer_id: string;
  relation_type: InviteRelationType;
  expires_at: string;
};

type ReportingRelationshipRow = {
  id: string;
  engineer_id: string;
  manager_id: string;
  relation_type: RelationshipType;
  status: "active" | "in_handover" | "archived";
};

type TeamOverviewRelationshipRow = {
  engineer_id: string;
  status: "active" | "in_handover";
};

type TeamOverviewProfileRow = {
  id: string;
  full_name: string | null;
  job_title: string | null;
  avatar_url: string | null;
};

type TeamOverviewObjectiveRow = {
  user_id: string;
  status: string | null;
};

type TeamOverviewEvidenceRow = {
  user_id: string;
  status: string | null;
  created_at: string | null;
};

export type ManagerTeamOverviewItem = {
  engineerId: string;
  fullName: string;
  currentTitle: string | null;
  avatarUrl: string | null;
  pendingReviewsCount: number;
  lastActivityAt: string | null;
  completedObjectivesCount: number;
  totalObjectivesCount: number;
  promotionReadinessIndex: number;
  relationshipStatus: "active" | "in_handover";
};

type AcceptManagerInviteRpcErrorCode =
  | "INVALID_OR_EXPIRED"
  | "DOMAIN_MISMATCH"
  | "ACTIVE_MANAGER_CONFLICT"
  | "ALREADY_LINKED";

type AcceptManagerInviteRpcResponse =
  | {
      success: true;
      engineer_id?: string;
      relation_type?: InviteRelationType;
      already_linked?: boolean;
    }
  | {
      success: false;
      error_code: AcceptManagerInviteRpcErrorCode;
      message?: string;
      expected_domain?: string;
      received_domain?: string;
      active_manager?: string;
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

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getRuntimeCrypto(): Crypto {
  const runtimeCrypto = globalThis.crypto;
  if (!runtimeCrypto?.subtle || typeof runtimeCrypto.getRandomValues !== "function") {
    throw new Error("Runtime crypto is not available in this environment.");
  }
  return runtimeCrypto;
}

async function hashInviteCode(rawCode: string): Promise<string> {
  const runtimeCrypto = getRuntimeCrypto();
  const payload = new TextEncoder().encode(rawCode);
  const digest = await runtimeCrypto.subtle.digest("SHA-256", payload);
  return bytesToHex(new Uint8Array(digest));
}

function isSha256Hash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value.trim());
}

function generateInviteCode(): string {
  const runtimeCrypto = getRuntimeCrypto();
  const randomBytes = new Uint8Array(4);
  runtimeCrypto.getRandomValues(randomBytes);
  return bytesToHex(randomBytes);
}

function mapInviteToRelationshipType(inviteType: InviteRelationType): RelationshipType {
  return inviteType === "manager" ? "direct_manager" : "skip_level";
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
    const codeHash = await hashInviteCode(rawCode);
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

export const resolveManagerInviteHash = createServerFn({ method: "POST" })
  .validator(z.object({ rawToken: z.string().min(1) }))
  .handler(async ({ data }) => {
    const normalized = data.rawToken.trim();
    if (isSha256Hash(normalized)) {
      return normalized.toLowerCase();
    }
      return await hashInviteCode(normalized);
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
    const codeHash = await hashInviteCode(normalizedCode);

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

    const responseRow = (
      Array.isArray(response) ? response[0] : response
    ) as AcceptManagerInviteRpcResponse | null;
    if (responseRow && typeof responseRow === "object" && responseRow.success === false) {
      return {
        success: false as const,
        error_code: responseRow.error_code,
        message: responseRow.message ?? null,
        expected_domain: responseRow.expected_domain ?? null,
        received_domain: responseRow.received_domain ?? null,
        active_manager: responseRow.active_manager ?? null,
      };
    }

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

function isPendingStatus(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  return (
    normalized === "pending_approval"
    || normalized === "pending_review"
    || normalized === "awaiting_approval"
  );
}

function isCompletedStatus(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  return normalized === "completed";
}

export const getManagerTeamOverview = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { supabase, user } = await requireAuthenticatedUser(data.token);

    const { data: relationships, error: relationshipsError } = await supabase
      .from("reporting_relationships")
      .select("engineer_id, status")
      .eq("manager_id", user.id)
      .in("status", ["active", "in_handover"]);
    if (relationshipsError) throw new Error(relationshipsError.message);

    const relationshipRows = (relationships ?? []) as TeamOverviewRelationshipRow[];
    if (relationshipRows.length === 0) return [] as ManagerTeamOverviewItem[];

    const statusByEngineer = relationshipRows.reduce<Record<string, "active" | "in_handover">>(
      (acc, row) => {
        const existing = acc[row.engineer_id];
        if (!existing || row.status === "in_handover") {
          acc[row.engineer_id] = row.status;
        }
        return acc;
      },
      {},
    );

    const engineerIds = Object.keys(statusByEngineer);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, job_title, avatar_url")
      .in("id", engineerIds);
    if (profilesError) throw new Error(profilesError.message);

    const { data: objectives, error: objectivesError } = await supabase
      .from("objectives")
      .select("user_id, status")
      .in("user_id", engineerIds)
      .eq("is_archived", false);
    if (objectivesError) throw new Error(objectivesError.message);

    const { data: evidence, error: evidenceError } = await supabase
      .from("evidence")
      .select("user_id, status, created_at")
      .in("user_id", engineerIds)
      .eq("is_archived", false);
    if (evidenceError) throw new Error(evidenceError.message);

    const objectiveRows = (objectives ?? []) as TeamOverviewObjectiveRow[];
    const evidenceRows = (evidence ?? []) as TeamOverviewEvidenceRow[];

    const objectiveStatsByEngineer = objectiveRows.reduce<
      Record<string, { completedCount: number; totalCount: number; pendingCount: number }>
    >((acc, row) => {
      if (!acc[row.user_id]) {
        acc[row.user_id] = { completedCount: 0, totalCount: 0, pendingCount: 0 };
      }
      acc[row.user_id].totalCount += 1;
      if (isCompletedStatus(row.status)) acc[row.user_id].completedCount += 1;
      if (isPendingStatus(row.status)) acc[row.user_id].pendingCount += 1;
      return acc;
    }, {});

    const evidenceStatsByEngineer = evidenceRows.reduce<
      Record<string, { pendingCount: number; lastActivityAt: string | null }>
    >((acc, row) => {
      if (!acc[row.user_id]) {
        acc[row.user_id] = { pendingCount: 0, lastActivityAt: null };
      }
      if (isPendingStatus(row.status)) acc[row.user_id].pendingCount += 1;
      const existing = acc[row.user_id].lastActivityAt;
      if (row.created_at && (!existing || row.created_at > existing)) {
        acc[row.user_id].lastActivityAt = row.created_at;
      }
      return acc;
    }, {});

    const profileMap = new Map(
      ((profiles ?? []) as TeamOverviewProfileRow[]).map((profile) => [profile.id, profile]),
    );

    const overviewRows = engineerIds
      .map((engineerId) => {
        const profile = profileMap.get(engineerId);
        const objectiveStats = objectiveStatsByEngineer[engineerId] ?? {
          completedCount: 0,
          totalCount: 0,
          pendingCount: 0,
        };
        const evidenceStats = evidenceStatsByEngineer[engineerId] ?? {
          pendingCount: 0,
          lastActivityAt: null,
        };
        const pendingReviewsCount = objectiveStats.pendingCount + evidenceStats.pendingCount;
        const promotionReadinessIndex =
          objectiveStats.totalCount > 0
            ? Math.round((objectiveStats.completedCount / objectiveStats.totalCount) * 100)
            : 0;

        return {
          engineerId,
          fullName: profile?.full_name?.trim() || "Unknown Engineer",
          currentTitle: profile?.job_title?.trim() || null,
          avatarUrl: profile?.avatar_url ?? null,
          pendingReviewsCount,
          lastActivityAt: evidenceStats.lastActivityAt,
          completedObjectivesCount: objectiveStats.completedCount,
          totalObjectivesCount: objectiveStats.totalCount,
          promotionReadinessIndex,
          relationshipStatus: statusByEngineer[engineerId] ?? "active",
        } as ManagerTeamOverviewItem;
      })
      .sort((a, b) => {
        const aTs = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        const bTs = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
        return bTs - aTs;
      });

    return overviewRows;
  });
