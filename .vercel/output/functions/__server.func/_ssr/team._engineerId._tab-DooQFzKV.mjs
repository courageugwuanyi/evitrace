import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as HomeRouteApp } from "./home-route-app-BenyDmPt.mjs";
import { n as Route, r as isTab, t as ALLOWED_MANAGER_TABS } from "./team._engineerId._tab-CheJettd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/team._engineerId._tab-DooQFzKV.js
var import_jsx_runtime = require_jsx_runtime();
function RouteComponent() {
	const { engineerId, tab } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeRouteApp, {
		activeTab: isTab(tab) && ALLOWED_MANAGER_TABS.includes(tab) ? tab : "evidence",
		routedEngineerId: engineerId
	});
}
//#endregion
export { RouteComponent as component };
