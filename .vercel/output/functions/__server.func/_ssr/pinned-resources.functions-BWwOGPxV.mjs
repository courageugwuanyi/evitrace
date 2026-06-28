import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { n as objectType, r as stringType, t as enumType } from "../_libs/zod.mjs";
import { t as sendNotification } from "./notifications.functions-B1I7p-if.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as createServerRpc } from "./createServerRpc-BbGffMfs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pinned-resources.functions-BWwOGPxV.js
var RESOURCE_TYPES = [
	"evidence",
	"objective",
	"generic"
];
function getSupabaseConfig() {
	const url = process.env.VITE_SUPABASE_URL;
	const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
	if (!url) throw new Error("Missing VITE_SUPABASE_URL");
	if (!anonKey) throw new Error("Missing VITE_SUPABASE_ANON_KEY");
	return {
		url,
		anonKey
	};
}
function createTokenScopedSupabaseClient(token) {
	const { url, anonKey } = getSupabaseConfig();
	return createClient(url, anonKey, {
		global: { headers: { Authorization: `Bearer ${token}` } },
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});
}
async function requireAuthenticatedUser(token) {
	const supabase = createTokenScopedSupabaseClient(token);
	const { data: { user }, error } = await supabase.auth.getUser(token);
	if (error || !user) throw new Error("Unauthorized");
	return {
		supabase,
		user
	};
}
var pinResource_createServerFn_handler = createServerRpc({
	id: "5e36f4344700e168a06cf2c350df6b5bcaa4fd289326c477c118fd954c57b4c3",
	name: "pinResource",
	filename: "src/lib/api/pinned-resources.functions.ts"
}, (opts) => pinResource.__executeServer(opts));
var pinResource = createServerFn({ method: "POST" }).validator(objectType({
	token: stringType().min(1),
	workspaceId: stringType().uuid(),
	title: stringType().trim().min(1),
	url: stringType().url().optional(),
	resourceType: enumType(RESOURCE_TYPES),
	evidenceId: stringType().uuid().optional(),
	objectiveId: stringType().uuid().optional(),
	notifyUserId: stringType().uuid()
})).handler(pinResource_createServerFn_handler, async ({ data }) => {
	const { supabase, user } = await requireAuthenticatedUser(data.token);
	const payload = {
		workspace_id: data.workspaceId,
		title: data.title.trim(),
		url: data.url?.trim() || null,
		resource_type: data.resourceType,
		evidence_id: data.evidenceId ?? null,
		objective_id: data.objectiveId ?? null,
		pinned_by: user.id
	};
	const { error: insertError } = await supabase.from("pinned_resources").insert(payload);
	if (insertError) throw new Error(insertError.message);
	await sendNotification({ data: {
		userId: data.notifyUserId,
		type: "auto_capture",
		title: "New workspace resource pinned",
		description: "A critical knowledge asset was anchored to your main dashboard view."
	} });
	return { success: true };
});
var unpinResource_createServerFn_handler = createServerRpc({
	id: "6e5409543fe62dfd74de78d794986f43d00419f3fbc29bd137e794ae919de5c1",
	name: "unpinResource",
	filename: "src/lib/api/pinned-resources.functions.ts"
}, (opts) => unpinResource.__executeServer(opts));
var unpinResource = createServerFn({ method: "POST" }).validator(objectType({
	token: stringType().min(1),
	pinId: stringType().uuid()
})).handler(unpinResource_createServerFn_handler, async ({ data }) => {
	const { supabase } = await requireAuthenticatedUser(data.token);
	const { error } = await supabase.from("pinned_resources").delete().eq("id", data.pinId);
	if (error) throw new Error(error.message);
	return { success: true };
});
//#endregion
export { pinResource_createServerFn_handler, unpinResource_createServerFn_handler };
