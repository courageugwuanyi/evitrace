import { i as TSS_SERVER_FUNCTION } from "./esm-B50dUWcE.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-B2CVU3I9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createSsrRpc-Cuw0XVNx.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
export { createSsrRpc as t };
