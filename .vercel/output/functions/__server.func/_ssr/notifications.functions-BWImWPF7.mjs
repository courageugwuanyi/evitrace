import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { n as objectType, r as stringType, t as enumType } from "../_libs/zod.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as createServerRpc } from "./createServerRpc-BbGffMfs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications.functions-BWImWPF7.js
var notificationPayloadSchema = objectType({
	userId: stringType().uuid(),
	type: enumType([
		"feedback",
		"auto_capture",
		"objective",
		"assessment"
	]),
	title: stringType().min(1),
	description: stringType().min(1)
});
function createNotificationsClient() {
	const url = process.env.VITE_SUPABASE_URL;
	const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
	if (!url) throw new Error("Missing VITE_SUPABASE_URL");
	if (!anonKey) throw new Error("Missing VITE_SUPABASE_ANON_KEY");
	return createClient(url, anonKey);
}
var sendNotification_createServerFn_handler = createServerRpc({
	id: "a08a152c2d4a3293332d4e735611728773caeec6ad91668c0a386481403b6f9d",
	name: "sendNotification",
	filename: "src/lib/api/notifications.functions.ts"
}, (opts) => sendNotification.__executeServer(opts));
var sendNotification = createServerFn({ method: "POST" }).validator(notificationPayloadSchema).handler(sendNotification_createServerFn_handler, async ({ data }) => {
	const { error } = await createNotificationsClient().from("notifications").insert({
		user_id: data.userId,
		type: data.type,
		title: data.title,
		description: data.description,
		is_read: false
	});
	if (error) {
		console.error("[Notification Dispatch Error]:", error);
		return { success: false };
	}
	return { success: true };
});
//#endregion
export { sendNotification_createServerFn_handler };
