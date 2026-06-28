import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as PENDING_WORKSPACE_INVITE_HASH_KEY, c as resolveManagerInviteHash, r as MANAGER_ONBOARDING_CONTEXT_KEY, u as supabase } from "./constants-tmdMTkaa.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invite-DpPGMSCA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isSha256Hash(value) {
	return /^[a-f0-9]{64}$/i.test(value.trim());
}
async function resolveInviteHash(rawToken) {
	const resolved = await resolveManagerInviteHash({ data: { rawToken } });
	if (!isSha256Hash(resolved)) throw new Error("Invalid workspace connection reference hash.");
	return resolved.toLowerCase();
}
function parseRpcResponse(data) {
	const candidate = Array.isArray(data) ? data[0] : data;
	if (typeof candidate === "string") try {
		const parsed = JSON.parse(candidate);
		return parsed && typeof parsed === "object" ? parsed : null;
	} catch {
		return null;
	}
	return candidate && typeof candidate === "object" ? candidate : null;
}
function InviteRedeemPage() {
	const navigate = useNavigate();
	const [resolving, setResolving] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let active = true;
		async function processIncomingInviteLink() {
			const query = new URLSearchParams(window.location.search);
			const incomingToken = query.get("hash")?.trim() || query.get("code")?.trim();
			if (!incomingToken) {
				toast.error("Invalid workspace connection reference link.");
				navigate({ to: "/" });
				return;
			}
			try {
				const resolvedHash = await resolveInviteHash(incomingToken);
				const { data: { session } } = await supabase.auth.getSession();
				if (session?.user?.id) {
					const { data, error } = await supabase.rpc("accept_manager_invite", {
						target_hash: resolvedHash,
						current_manager_id: session.user.id
					});
					const response = parseRpcResponse(data);
					const isSuccess = response?.success === true;
					if (error || !isSuccess) toast.error(String(response?.message ?? error?.message ?? "Workspace connection linking failed."));
					else toast.success(String(response?.message ?? "Teammate profile successfully added to your organization hierarchy."));
					navigate({ to: "/" });
					return;
				}
				window.localStorage.setItem(PENDING_WORKSPACE_INVITE_HASH_KEY, resolvedHash);
				window.sessionStorage.setItem(MANAGER_ONBOARDING_CONTEXT_KEY, "1");
				toast.message("Workspace invitation detected", { description: "Please sign up or log in to complete your team connection setup." });
				navigate({ to: "/" });
			} catch (error) {
				const message = error instanceof Error ? error.message : "Network synchronization timeout during link analysis.";
				toast.error(message);
				navigate({ to: "/" });
			} finally {
				if (active) setResolving(false);
			}
		}
		processIncomingInviteLink();
		return () => {
			active = false;
		};
	}, [navigate]);
	if (resolving) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-screen w-screen flex flex-col items-center justify-center bg-slate-50 font-sans",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 text-center max-w-xs animate-pulse",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-32 bg-slate-200 rounded-md mx-auto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-48 bg-slate-100 rounded-md mx-auto" })]
		})
	});
	return null;
}
//#endregion
export { InviteRedeemPage as component };
