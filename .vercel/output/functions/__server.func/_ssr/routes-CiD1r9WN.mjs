import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as validateHomeSearch, t as homeRouteHead } from "./route-config-Bms7DLDW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CiD1r9WN.js
var $$splitComponentImporter = () => import("./routes-DI_sHkUH.mjs");
var Route = createFileRoute("/")({
	validateSearch: validateHomeSearch,
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
