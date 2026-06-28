//#region node_modules/.nitro/vite/services/ssr/assets/route-config-Bms7DLDW.js
function validateHomeSearch(search) {
	return {
		tab: typeof search.tab === "string" ? search.tab : void 0,
		section: typeof search.section === "string" ? search.section : void 0,
		action: typeof search.action === "string" ? search.action : void 0
	};
}
function homeRouteHead() {
	return { meta: [
		{ title: "Evitrace - Engineering Competency & Promotion Tracking" },
		{
			name: "description",
			content: "Capture evidence of your work, map it to competencies, and close the gap to your next promotion."
		},
		{
			property: "og:title",
			content: "Evitrace - Promotion Radar for Engineers"
		},
		{
			property: "og:description",
			content: "Track competency, evidence, and SMART objectives in one trusted workspace."
		},
		{
			property: "og:type",
			content: "website"
		}
	] };
}
//#endregion
export { validateHomeSearch as n, homeRouteHead as t };
