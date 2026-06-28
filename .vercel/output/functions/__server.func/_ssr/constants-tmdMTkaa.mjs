import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Cuw0XVNx.mjs";
import { n as objectType, r as stringType, t as enumType } from "../_libs/zod.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/constants-tmdMTkaa.js
var url = "https://sljzzqxjwtqdzltrjrhc.supabase.co";
var key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsanp6cXhqd3RxZHpsdHJqcmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjcwMDMsImV4cCI6MjA5NzQ0MzAwM30.-lF7OrExs9TfIk8-bN5BFZR6Wd1oeGmixtbi5PH2zYI";
if (url.trim() === "") throw new Error("VITE_SUPABASE_URL is not set");
if (key.trim() === "") throw new Error("VITE_SUPABASE_ANON_KEY is not set");
var supabase = createClient(url, key);
var createManagerInvite = createServerFn({ method: "POST" }).validator(objectType({
	relationType: enumType(["manager", "skip_level"]),
	token: stringType().min(1)
})).handler(createSsrRpc("0335eba1913e3e3ec3262a2aadf14ad33f1c541c7987ef8414a0737e39063fae"));
var resolveManagerInviteHash = createServerFn({ method: "POST" }).validator(objectType({ rawToken: stringType().min(1) })).handler(createSsrRpc("d06f54cdb10e4b889543d980db49e88f1b3cc1acd1fa08bd21c8dd672c1d0b39"));
createServerFn({ method: "POST" }).validator(objectType({ token: stringType().min(1) })).handler(createSsrRpc("863b4d1d73e96f502e6d71004ec0f6dbfd9fd498f0de5a7206a96b141166a947"));
createServerFn({ method: "POST" }).validator(objectType({
	rawCode: stringType().min(1),
	token: stringType().min(1)
})).handler(createSsrRpc("6079ec156c2b3c21290182ddaf2de403911b5ed040966d8bd3bb744d6dd2f85d"));
var signOffTransfer = createServerFn({ method: "POST" }).validator(objectType({
	engineerId: stringType().uuid(),
	workEthicsNotes: stringType().optional(),
	token: stringType().min(1)
})).handler(createSsrRpc("161a56f7582aa7cef9135360ee24b04ad0dd569f9f2e92b7c4702233208b52a1"));
var getManagerTeamOverview = createServerFn({ method: "POST" }).validator(objectType({ token: stringType().min(1) })).handler(createSsrRpc("b6fc16b40f44f635071a80aab42f3a50fbb208885e05ccd5711da17bbda69623"));
var LEVEL_OPTIONS = [
	"L1",
	"L2",
	"L3",
	"L4",
	"L5",
	"L6",
	"L7"
];
var PENDING_INVITE_CODE_KEY = "pending_invite_code";
var PENDING_WORKSPACE_INVITE_HASH_KEY = "pending_workspace_invite_hash";
var ACTIVE_INVITE_URL_STORAGE_KEY = "active_manager_invite_url";
var MANAGER_ONBOARDING_CONTEXT_KEY = "manager_onboarding_context";
//#endregion
export { PENDING_WORKSPACE_INVITE_HASH_KEY as a, resolveManagerInviteHash as c, PENDING_INVITE_CODE_KEY as i, signOffTransfer as l, LEVEL_OPTIONS as n, createManagerInvite as o, MANAGER_ONBOARDING_CONTEXT_KEY as r, getManagerTeamOverview as s, ACTIVE_INVITE_URL_STORAGE_KEY as t, supabase as u };
