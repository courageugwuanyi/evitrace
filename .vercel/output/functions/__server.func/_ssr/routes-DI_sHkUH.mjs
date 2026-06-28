import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as resolveLegacyHomePath, t as HomeRouteApp } from "./home-route-app-BenyDmPt.mjs";
import { t as Route } from "./routes-CiD1r9WN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DI_sHkUH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HomeIndexRedirect({ search, children }) {
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		const nextPath = resolveLegacyHomePath(search);
		if (!nextPath) return;
		navigate({
			to: nextPath,
			replace: true
		});
	}, [navigate, search]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: children(search.action === "capture") });
}
function HomeIndexRoute() {
	const { tab, section, action } = Route.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeIndexRedirect, {
		search: {
			tab,
			section,
			action
		},
		children: (openCaptureOnLoad) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeRouteApp, {
			activeTab: "dashboard",
			openCaptureOnLoad
		})
	});
}
//#endregion
export { HomeIndexRoute as component };
