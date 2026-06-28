import { M as redirect, f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as homeRouteHead } from "./route-config-Bms7DLDW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/team._engineerId._tab-CheJettd.js
var ALLOWED_MANAGER_TABS = [
	"evidence",
	"objectives",
	"radar",
	"report"
];
var NAV_TABS = [
	"dashboard",
	"radar",
	"evidence",
	"objectives",
	"knowledge",
	"feedback",
	"report",
	"settings"
];
function isTab(value) {
	return Boolean(value && NAV_TABS.includes(value));
}
var $$splitComponentImporter = () => import("./team._engineerId._tab-DooQFzKV.mjs");
var Route = createFileRoute("/team/$engineerId/$tab")({
	head: homeRouteHead,
	beforeLoad: ({ params }) => {
		const maybeTab = params.tab;
		if (!isTab(maybeTab) || !ALLOWED_MANAGER_TABS.includes(maybeTab)) throw redirect({
			to: "/team/$engineerId/$tab",
			params: {
				engineerId: params.engineerId,
				tab: "evidence"
			},
			replace: true
		});
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as n, isTab as r, ALLOWED_MANAGER_TABS as t };
