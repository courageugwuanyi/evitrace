import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { n as objectType, r as stringType, t as enumType } from "../_libs/zod.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as createServerRpc } from "./createServerRpc-BbGffMfs.mjs";
import crypto from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/manager-invites.functions-BF0wB6d8.js
var RELATION_TYPES = ["manager", "skip_level"];
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
function hashInviteCode(rawCode) {
	return crypto.createHash("sha256").update(rawCode).digest("hex");
}
function isSha256Hash(value) {
	return /^[a-f0-9]{64}$/i.test(value.trim());
}
function generateInviteCode() {
	return crypto.randomBytes(4).toString("hex");
}
var createManagerInvite_createServerFn_handler = createServerRpc({
	id: "0335eba1913e3e3ec3262a2aadf14ad33f1c541c7987ef8414a0737e39063fae",
	name: "createManagerInvite",
	filename: "src/lib/api/manager-invites.functions.ts"
}, (opts) => createManagerInvite.__executeServer(opts));
var createManagerInvite = createServerFn({ method: "POST" }).validator(objectType({
	relationType: enumType(RELATION_TYPES),
	token: stringType().min(1)
})).handler(createManagerInvite_createServerFn_handler, async ({ data }) => {
	const supabase = createTokenScopedSupabaseClient(data.token);
	const { data: { user }, error: authError } = await supabase.auth.getUser(data.token);
	if (authError || !user) {
		console.error("[Explicit Auth Breakdown]:", authError);
		throw new Error("Unauthorized: Invalid or expired session token provided.");
	}
	const rawCode = generateInviteCode();
	const codeHash = hashInviteCode(rawCode);
	const expiresAt = new Date(Date.now() + 720 * 60 * 60 * 1e3).toISOString();
	const { error } = await supabase.from("manager_invites").insert({
		engineer_id: user.id,
		relation_type: data.relationType,
		code_hash: codeHash,
		expires_at: expiresAt
	});
	if (error) throw new Error(error.message);
	return {
		code: rawCode,
		expiresAt
	};
});
var resolveManagerInviteHash_createServerFn_handler = createServerRpc({
	id: "d06f54cdb10e4b889543d980db49e88f1b3cc1acd1fa08bd21c8dd672c1d0b39",
	name: "resolveManagerInviteHash",
	filename: "src/lib/api/manager-invites.functions.ts"
}, (opts) => resolveManagerInviteHash.__executeServer(opts));
var resolveManagerInviteHash = createServerFn({ method: "POST" }).validator(objectType({ rawToken: stringType().min(1) })).handler(resolveManagerInviteHash_createServerFn_handler, async ({ data }) => {
	const normalized = data.rawToken.trim();
	if (isSha256Hash(normalized)) return normalized.toLowerCase();
	return hashInviteCode(normalized);
});
var revokeActiveInvite_createServerFn_handler = createServerRpc({
	id: "863b4d1d73e96f502e6d71004ec0f6dbfd9fd498f0de5a7206a96b141166a947",
	name: "revokeActiveInvite",
	filename: "src/lib/api/manager-invites.functions.ts"
}, (opts) => revokeActiveInvite.__executeServer(opts));
var revokeActiveInvite = createServerFn({ method: "POST" }).validator(objectType({ token: stringType().min(1) })).handler(revokeActiveInvite_createServerFn_handler, async ({ data }) => {
	const { supabase, user } = await requireAuthenticatedUser(data.token);
	const { error } = await supabase.from("manager_invites").delete().eq("engineer_id", user.id).is("used_at", null);
	if (error) throw new Error(error.message);
	return { success: true };
});
var redeemManagerInvite_createServerFn_handler = createServerRpc({
	id: "6079ec156c2b3c21290182ddaf2de403911b5ed040966d8bd3bb744d6dd2f85d",
	name: "redeemManagerInvite",
	filename: "src/lib/api/manager-invites.functions.ts"
}, (opts) => redeemManagerInvite.__executeServer(opts));
var redeemManagerInvite = createServerFn({ method: "POST" }).validator(objectType({
	rawCode: stringType().min(1),
	token: stringType().min(1)
})).handler(redeemManagerInvite_createServerFn_handler, async ({ data }) => {
	const { supabase, user: managerUser } = await requireAuthenticatedUser(data.token);
	const codeHash = hashInviteCode(data.rawCode.trim());
	const { data: invite, error: inviteError } = await supabase.rpc("verify_and_get_invite", { target_hash: codeHash }).maybeSingle();
	if (inviteError) {
		const rawMessage = inviteError.message ?? "Failed to verify invitation link.";
		if (rawMessage.includes("verify_and_get_invite") && rawMessage.toLowerCase().includes("schema cache")) throw new Error("Invite verification is still being deployed. Please retry in a minute or ask your workspace admin to run the latest database migration.");
		throw new Error(rawMessage);
	}
	if (!invite) throw new Error("This invitation link is invalid or has expired.");
	const { data: response, error: rpcError } = await supabase.rpc("accept_manager_invite", {
		target_hash: codeHash,
		current_manager_id: managerUser.id
	});
	if (rpcError) {
		console.error("[RPC Handshake Failure]:", rpcError);
		const message = rpcError.message || "Failed to complete onboarding connection.";
		const normalized = message.toLowerCase();
		if (normalized.includes("unique_active_direct_manager") || normalized.includes("already has an active direct manager")) throw new Error("This engineer already has an active direct manager assigned. Ask the engineer to revoke old manager access before using a new direct-manager invite.");
		throw new Error(message);
	}
	const responseRow = Array.isArray(response) ? response[0] : response;
	if (responseRow && typeof responseRow === "object" && responseRow.success === false) return {
		success: false,
		error_code: responseRow.error_code,
		message: responseRow.message ?? null,
		expected_domain: responseRow.expected_domain ?? null,
		received_domain: responseRow.received_domain ?? null,
		active_manager: responseRow.active_manager ?? null
	};
	return {
		success: true,
		engineerId: responseRow && typeof responseRow === "object" && "engineer_id" in responseRow ? String(responseRow.engineer_id) : invite.engineer_id
	};
});
var signOffTransfer_createServerFn_handler = createServerRpc({
	id: "161a56f7582aa7cef9135360ee24b04ad0dd569f9f2e92b7c4702233208b52a1",
	name: "signOffTransfer",
	filename: "src/lib/api/manager-invites.functions.ts"
}, (opts) => signOffTransfer.__executeServer(opts));
var signOffTransfer = createServerFn({ method: "POST" }).validator(objectType({
	engineerId: stringType().uuid(),
	workEthicsNotes: stringType().optional(),
	token: stringType().min(1)
})).handler(signOffTransfer_createServerFn_handler, async ({ data }) => {
	const { supabase, user } = await requireAuthenticatedUser(data.token);
	const { data: outgoingRelationship, error: relationshipError } = await supabase.from("reporting_relationships").select("id, engineer_id, manager_id, relation_type, status").eq("engineer_id", data.engineerId).eq("manager_id", user.id).eq("relation_type", "direct_manager").eq("status", "in_handover").maybeSingle();
	if (relationshipError) throw new Error(relationshipError.message);
	if (!outgoingRelationship) throw new Error("No in-progress handover found for this engineer.");
	const { error: dossierError } = await supabase.from("handover_dossiers").insert({
		engineer_id: data.engineerId,
		old_manager_id: user.id,
		new_manager_id: null,
		ai_compiled_achievements: {},
		work_ethics_notes: data.workEthicsNotes?.trim() || null,
		completed_at: (/* @__PURE__ */ new Date()).toISOString()
	});
	if (dossierError) throw new Error(dossierError.message);
	const { error: archiveError } = await supabase.from("reporting_relationships").update({
		status: "archived",
		ends_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", outgoingRelationship.id);
	if (archiveError) throw new Error(archiveError.message);
	return {
		success: true,
		engineerId: data.engineerId
	};
});
function isPendingStatus(value) {
	if (!value) return false;
	const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
	return normalized === "pending_approval" || normalized === "pending_review" || normalized === "awaiting_approval";
}
function isCompletedStatus(value) {
	if (!value) return false;
	return value.trim().toLowerCase().replace(/\s+/g, "_") === "completed";
}
var getManagerTeamOverview_createServerFn_handler = createServerRpc({
	id: "b6fc16b40f44f635071a80aab42f3a50fbb208885e05ccd5711da17bbda69623",
	name: "getManagerTeamOverview",
	filename: "src/lib/api/manager-invites.functions.ts"
}, (opts) => getManagerTeamOverview.__executeServer(opts));
var getManagerTeamOverview = createServerFn({ method: "POST" }).validator(objectType({ token: stringType().min(1) })).handler(getManagerTeamOverview_createServerFn_handler, async ({ data }) => {
	const { supabase, user } = await requireAuthenticatedUser(data.token);
	const { data: relationships, error: relationshipsError } = await supabase.from("reporting_relationships").select("engineer_id, status").eq("manager_id", user.id).in("status", ["active", "in_handover"]);
	if (relationshipsError) throw new Error(relationshipsError.message);
	const relationshipRows = relationships ?? [];
	if (relationshipRows.length === 0) return [];
	const statusByEngineer = relationshipRows.reduce((acc, row) => {
		if (!acc[row.engineer_id] || row.status === "in_handover") acc[row.engineer_id] = row.status;
		return acc;
	}, {});
	const engineerIds = Object.keys(statusByEngineer);
	const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, full_name, job_title, avatar_url").in("id", engineerIds);
	if (profilesError) throw new Error(profilesError.message);
	const { data: objectives, error: objectivesError } = await supabase.from("objectives").select("user_id, status").in("user_id", engineerIds).eq("is_archived", false);
	if (objectivesError) throw new Error(objectivesError.message);
	const { data: evidence, error: evidenceError } = await supabase.from("evidence").select("user_id, status, created_at").in("user_id", engineerIds).eq("is_archived", false);
	if (evidenceError) throw new Error(evidenceError.message);
	const objectiveRows = objectives ?? [];
	const evidenceRows = evidence ?? [];
	const objectiveStatsByEngineer = objectiveRows.reduce((acc, row) => {
		if (!acc[row.user_id]) acc[row.user_id] = {
			completedCount: 0,
			totalCount: 0,
			pendingCount: 0
		};
		acc[row.user_id].totalCount += 1;
		if (isCompletedStatus(row.status)) acc[row.user_id].completedCount += 1;
		if (isPendingStatus(row.status)) acc[row.user_id].pendingCount += 1;
		return acc;
	}, {});
	const evidenceStatsByEngineer = evidenceRows.reduce((acc, row) => {
		if (!acc[row.user_id]) acc[row.user_id] = {
			pendingCount: 0,
			lastActivityAt: null
		};
		if (isPendingStatus(row.status)) acc[row.user_id].pendingCount += 1;
		const existing = acc[row.user_id].lastActivityAt;
		if (row.created_at && (!existing || row.created_at > existing)) acc[row.user_id].lastActivityAt = row.created_at;
		return acc;
	}, {});
	const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
	return engineerIds.map((engineerId) => {
		const profile = profileMap.get(engineerId);
		const objectiveStats = objectiveStatsByEngineer[engineerId] ?? {
			completedCount: 0,
			totalCount: 0,
			pendingCount: 0
		};
		const evidenceStats = evidenceStatsByEngineer[engineerId] ?? {
			pendingCount: 0,
			lastActivityAt: null
		};
		const pendingReviewsCount = objectiveStats.pendingCount + evidenceStats.pendingCount;
		const promotionReadinessIndex = objectiveStats.totalCount > 0 ? Math.round(objectiveStats.completedCount / objectiveStats.totalCount * 100) : 0;
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
			relationshipStatus: statusByEngineer[engineerId] ?? "active"
		};
	}).sort((a, b) => {
		const aTs = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
		return (b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0) - aTs;
	});
});
//#endregion
export { createManagerInvite_createServerFn_handler, getManagerTeamOverview_createServerFn_handler, redeemManagerInvite_createServerFn_handler, resolveManagerInviteHash_createServerFn_handler, revokeActiveInvite_createServerFn_handler, signOffTransfer_createServerFn_handler };
