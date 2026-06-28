import { o as __toESM } from "../_runtime.mjs";
import { M as redirect, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, o as require_react, r as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as homeRouteHead } from "./route-config-Bms7DLDW.mjs";
import { t as Route$17 } from "./routes-CiD1r9WN.mjs";
import { n as Route$18 } from "./team._engineerId._tab-CheJettd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-D0J3uLxQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-Cdcz3xIo.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast relative group-[.toaster]:bg-white group-[.toaster]:text-[#172B4D] group-[.toaster]:border-[#DFE1E6] group-[.toaster]:rounded-md group-[.toaster]:shadow-sm group-[.toaster]:px-3 group-[.toaster]:py-2 group-[.toaster]:text-sm",
			description: "group-[.toast]:text-[#42526E] group-[.toast]:text-xs",
			title: "group-[.toast]:font-semibold",
			success: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#36B37E]",
			error: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#DE350B]",
			warning: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#FFAB00]",
			info: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#0052CC]",
			actionButton: "group-[.toast]:bg-[#0052CC] group-[.toast]:text-white group-[.toast]:h-7 group-[.toast]:text-xs",
			cancelButton: "group-[.toast]:bg-[#F4F5F7] group-[.toast]:text-[#42526E] group-[.toast]:h-7 group-[.toast]:text-xs"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$16 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Evitrace" },
			{
				name: "description",
				content: "Evitrace Compass is a SaaS frontend for engineering competency and promotion tracking."
			},
			{
				name: "author",
				content: "Lovable"
			},
			{
				property: "og:title",
				content: "Evitrace"
			},
			{
				property: "og:description",
				content: "Evitrace Compass is a SaaS frontend for engineering competency and promotion tracking."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			},
			{
				name: "twitter:title",
				content: "Evitrace"
			},
			{
				name: "twitter:description",
				content: "Evitrace Compass is a SaaS frontend for engineering competency and promotion tracking."
			},
			{
				property: "og:image",
				content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/5c37ba1b-6d2b-4e6b-b738-05c7773a7689"
			},
			{
				name: "twitter:image",
				content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/5c37ba1b-6d2b-4e6b-b738-05c7773a7689"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/png",
				href: "/icons/favicon.png?v=20260621"
			},
			{
				rel: "shortcut icon",
				href: "/icons/favicon.png?v=20260621"
			},
			{
				rel: "apple-touch-icon",
				href: "/icons/icon128.png?v=20260621"
			},
			{
				rel: "stylesheet",
				href: styles_default
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$16.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			position: "top-right",
			closeButton: true
		})]
	});
}
var $$splitComponentImporter$15 = () => import("./settings-Gmwbh02b.mjs");
var Route$15 = createFileRoute("/settings")({
	head: homeRouteHead,
	beforeLoad: ({ location }) => {
		if (location.pathname === "/settings") throw redirect({ to: "/settings/profile" });
	},
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./report-B1opvXP3.mjs");
var Route$14 = createFileRoute("/report")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./radar-D0XveDhH.mjs");
var Route$13 = createFileRoute("/radar")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./privacy-penxR3Vz.mjs");
var Route$12 = createFileRoute("/privacy")({
	head: () => ({ meta: [{ title: "Evitrace Privacy Policy" }, {
		name: "description",
		content: "Privacy policy for Evitrace web app and browser extension."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./objectives-CA0Or05X.mjs");
var Route$11 = createFileRoute("/objectives")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./knowledge-BvDrpSp3.mjs");
var Route$10 = createFileRoute("/knowledge")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./invite-DpPGMSCA.mjs");
var Route$9 = createFileRoute("/invite")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./feedback-ae9dEeRJ.mjs");
var Route$8 = createFileRoute("/feedback")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./evidence-B-ElmHzI.mjs");
var Route$7 = createFileRoute("/evidence")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./team._engineerId-CnuN4WuR.mjs");
var Route$6 = createFileRoute("/team/$engineerId")({
	beforeLoad: ({ params, location }) => {
		if (location.pathname === `/team/${params.engineerId}`) throw redirect({
			to: "/team/$engineerId/$tab",
			params: {
				engineerId: params.engineerId,
				tab: "evidence"
			},
			replace: true
		});
	},
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./settings.team-Debyh8Ue.mjs");
var Route$5 = createFileRoute("/settings/team")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./settings.profile-0PfOGu4G.mjs");
var Route$4 = createFileRoute("/settings/profile")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./settings.notifications-jKp4qjW9.mjs");
var Route$3 = createFileRoute("/settings/notifications")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./settings.framework-DLqqjI4D.mjs");
var Route$2 = createFileRoute("/settings/framework")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./settings.extension-BkILJzh-.mjs");
var Route$1 = createFileRoute("/settings/extension")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./settings.dashboard-N0Gw8sIr.mjs");
var Route = createFileRoute("/settings/dashboard")({
	head: homeRouteHead,
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var SettingsRoute = Route$15.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$16
});
var ReportRoute = Route$14.update({
	id: "/report",
	path: "/report",
	getParentRoute: () => Route$16
});
var RadarRoute = Route$13.update({
	id: "/radar",
	path: "/radar",
	getParentRoute: () => Route$16
});
var PrivacyRoute = Route$12.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => Route$16
});
var ObjectivesRoute = Route$11.update({
	id: "/objectives",
	path: "/objectives",
	getParentRoute: () => Route$16
});
var KnowledgeRoute = Route$10.update({
	id: "/knowledge",
	path: "/knowledge",
	getParentRoute: () => Route$16
});
var InviteRoute = Route$9.update({
	id: "/invite",
	path: "/invite",
	getParentRoute: () => Route$16
});
var FeedbackRoute = Route$8.update({
	id: "/feedback",
	path: "/feedback",
	getParentRoute: () => Route$16
});
var EvidenceRoute = Route$7.update({
	id: "/evidence",
	path: "/evidence",
	getParentRoute: () => Route$16
});
var IndexRoute = Route$17.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$16
});
var TeamEngineerIdRoute = Route$6.update({
	id: "/team/$engineerId",
	path: "/team/$engineerId",
	getParentRoute: () => Route$16
});
var SettingsTeamRoute = Route$5.update({
	id: "/team",
	path: "/team",
	getParentRoute: () => SettingsRoute
});
var SettingsProfileRoute = Route$4.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => SettingsRoute
});
var SettingsNotificationsRoute = Route$3.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => SettingsRoute
});
var SettingsFrameworkRoute = Route$2.update({
	id: "/framework",
	path: "/framework",
	getParentRoute: () => SettingsRoute
});
var SettingsExtensionRoute = Route$1.update({
	id: "/extension",
	path: "/extension",
	getParentRoute: () => SettingsRoute
});
var SettingsDashboardRoute = Route.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => SettingsRoute
});
var TeamEngineerIdTabRoute = Route$18.update({
	id: "/$tab",
	path: "/$tab",
	getParentRoute: () => TeamEngineerIdRoute
});
var SettingsRouteChildren = {
	SettingsDashboardRoute,
	SettingsExtensionRoute,
	SettingsFrameworkRoute,
	SettingsNotificationsRoute,
	SettingsProfileRoute,
	SettingsTeamRoute
};
var SettingsRouteWithChildren = SettingsRoute._addFileChildren(SettingsRouteChildren);
var TeamEngineerIdRouteChildren = { TeamEngineerIdTabRoute };
var rootRouteChildren = {
	IndexRoute,
	EvidenceRoute,
	FeedbackRoute,
	InviteRoute,
	KnowledgeRoute,
	ObjectivesRoute,
	PrivacyRoute,
	RadarRoute,
	ReportRoute,
	SettingsRoute: SettingsRouteWithChildren,
	TeamEngineerIdRoute: TeamEngineerIdRoute._addFileChildren(TeamEngineerIdRouteChildren)
};
var routeTree = Route$16._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
