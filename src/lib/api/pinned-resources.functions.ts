import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { sendNotification } from "./notifications.functions";

const RESOURCE_TYPES = ["evidence", "objective", "generic"] as const;

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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

export const pinResource = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string().min(1),
      workspaceId: z.string().uuid(),
      title: z.string().trim().min(1),
      url: z.string().url().optional(),
      resourceType: z.enum(RESOURCE_TYPES),
      evidenceId: z.string().uuid().optional(),
      objectiveId: z.string().uuid().optional(),
      notifyUserId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    const { supabase, user } = await requireAuthenticatedUser(data.token);
    const payload = {
      workspace_id: data.workspaceId,
      title: data.title.trim(),
      url: data.url?.trim() || null,
      resource_type: data.resourceType,
      evidence_id: data.evidenceId ?? null,
      objective_id: data.objectiveId ?? null,
      pinned_by: user.id,
    };

    const { error: insertError } = await supabase.from("pinned_resources").insert(payload);
    if (insertError) throw new Error(insertError.message);

    await sendNotification({
      data: {
        userId: data.notifyUserId,
        type: "auto_capture",
        title: "New workspace resource pinned",
        description: "A critical knowledge asset was anchored to your main dashboard view.",
      },
    });

    return { success: true as const };
  });

export const unpinResource = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string().min(1),
      pinId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    const { supabase } = await requireAuthenticatedUser(data.token);
    const { error } = await supabase.from("pinned_resources").delete().eq("id", data.pinId);
    if (error) throw new Error(error.message);
    return { success: true as const };
  });
