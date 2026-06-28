//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-B2CVU3I9.js
var manifest = {
	"0335eba1913e3e3ec3262a2aadf14ad33f1c541c7987ef8414a0737e39063fae": {
		functionName: "createManagerInvite_createServerFn_handler",
		importer: () => import("./_ssr/manager-invites.functions-BF0wB6d8.mjs")
	},
	"161a56f7582aa7cef9135360ee24b04ad0dd569f9f2e92b7c4702233208b52a1": {
		functionName: "signOffTransfer_createServerFn_handler",
		importer: () => import("./_ssr/manager-invites.functions-BF0wB6d8.mjs")
	},
	"5e36f4344700e168a06cf2c350df6b5bcaa4fd289326c477c118fd954c57b4c3": {
		functionName: "pinResource_createServerFn_handler",
		importer: () => import("./_ssr/pinned-resources.functions-BWwOGPxV.mjs")
	},
	"6079ec156c2b3c21290182ddaf2de403911b5ed040966d8bd3bb744d6dd2f85d": {
		functionName: "redeemManagerInvite_createServerFn_handler",
		importer: () => import("./_ssr/manager-invites.functions-BF0wB6d8.mjs")
	},
	"6e5409543fe62dfd74de78d794986f43d00419f3fbc29bd137e794ae919de5c1": {
		functionName: "unpinResource_createServerFn_handler",
		importer: () => import("./_ssr/pinned-resources.functions-BWwOGPxV.mjs")
	},
	"863b4d1d73e96f502e6d71004ec0f6dbfd9fd498f0de5a7206a96b141166a947": {
		functionName: "revokeActiveInvite_createServerFn_handler",
		importer: () => import("./_ssr/manager-invites.functions-BF0wB6d8.mjs")
	},
	"a08a152c2d4a3293332d4e735611728773caeec6ad91668c0a386481403b6f9d": {
		functionName: "sendNotification_createServerFn_handler",
		importer: () => import("./_ssr/notifications.functions-BWImWPF7.mjs")
	},
	"b6fc16b40f44f635071a80aab42f3a50fbb208885e05ccd5711da17bbda69623": {
		functionName: "getManagerTeamOverview_createServerFn_handler",
		importer: () => import("./_ssr/manager-invites.functions-BF0wB6d8.mjs")
	},
	"d06f54cdb10e4b889543d980db49e88f1b3cc1acd1fa08bd21c8dd672c1d0b39": {
		functionName: "resolveManagerInviteHash_createServerFn_handler",
		importer: () => import("./_ssr/manager-invites.functions-BF0wB6d8.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
