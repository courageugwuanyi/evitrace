import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const notificationPayloadSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(["feedback", "auto_capture", "objective", "assessment"]),
  title: z.string().min(1),
  description: z.string().min(1),
});

function createNotificationsClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Missing VITE_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing VITE_SUPABASE_ANON_KEY");

  return createClient(url, anonKey);
}

export const sendNotification = createServerFn({ method: "POST" })
  .validator(notificationPayloadSchema)
  .handler(async ({ data }) => {
    const supabase = createNotificationsClient();
    const { error } = await supabase.from("notifications").insert({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      description: data.description,
      is_read: false,
    });

    if (error) {
      console.error("[Notification Dispatch Error]:", error);
      return { success: false as const };
    }

    return { success: true as const };
  });
