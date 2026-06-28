import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Cuw0XVNx.mjs";
import { n as objectType, r as stringType, t as enumType } from "../_libs/zod.mjs";
import { t as sendNotification } from "./notifications.functions-B1I7p-if.mjs";
import { a as PENDING_WORKSPACE_INVITE_HASH_KEY, i as PENDING_INVITE_CODE_KEY, l as signOffTransfer, n as LEVEL_OPTIONS, o as createManagerInvite, r as MANAGER_ONBOARDING_CONTEXT_KEY, s as getManagerTeamOverview, t as ACTIVE_INVITE_URL_STORAGE_KEY, u as supabase } from "./constants-tmdMTkaa.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as GitBranch, A as Paperclip, B as LogIn, C as Radar, Ct as Award, D as Pin, Dt as ArchiveRestore, E as Plus, Et as Archive, F as MessageSquarePlus, G as LayoutDashboard, H as LoaderCircle, I as MessageCircleHeart, J as Info, K as Layers, L as Menu, M as PanelLeftClose, N as Notebook, O as Pencil, P as MessageSquare, Q as Github, R as Mail, S as RefreshCcw, St as Bell, T as Presentation, Tt as ArrowLeft, U as ListTodo, V as Lock, W as Link$1, X as GripVertical, Y as History, Z as Gitlab, _ as Share2, _t as ChartBar, a as TriangleAlert, at as Eye, b as Save, bt as Building2, c as Trash2, ct as CloudUpload, d as Target, dt as ClipboardCheck, et as Funnel, f as TableProperties, ft as CircleCheck, g as ShieldAlert, gt as ChevronDown, h as ShieldCheck, ht as ChevronRight, i as UserCheck, it as Figma, j as PanelLeft, k as Pen, l as TextAlignStart, lt as Clock, m as Slack, mt as CircleAlert, n as Wrench, nt as FileSpreadsheet, o as TrendingUp, ot as ExternalLink, p as Sparkles, pt as CircleCheckBig, q as KeyRound, r as User, rt as FileCheckCorner, s as Trello, st as Download, t as X, tt as FileText, u as Terminal, ut as ClipboardList, v as Settings, vt as Camera, w as Puzzle, wt as ArrowRight, x as RotateCcw, xt as BookOpen, y as Search, yt as Calendar, z as LogOut } from "../_libs/lucide-react.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { a as Bar, c as PolarAngleAxis, d as Tooltip, f as Legend, i as XAxis, l as PolarRadiusAxis, n as BarChart, o as CartesianGrid, p as ResponsiveContainer, r as YAxis, s as Radar$1, t as RadarChart, u as PolarGrid } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/home-route-app-BenyDmPt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getCurrentTimeZone() {
	const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
	return resolved && resolved.trim().length > 0 ? resolved : "UTC";
}
function toLocalDateString(date = /* @__PURE__ */ new Date()) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function formatUtcToLocal(input, options) {
	const parsed = new Date(input);
	if (Number.isNaN(parsed.getTime())) return input;
	return parsed.toLocaleString(void 0, options);
}
var generateSafeId = () => {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
};
function normalizeWallClockTime$1(value) {
	if (typeof value !== "string") return null;
	const raw = value.trim();
	if (!raw) return null;
	const directMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
	if (directMatch) {
		const hour = Number(directMatch[1]);
		const minute = Number(directMatch[2]);
		if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
		return null;
	}
	const embedded = raw.match(/(?:T|\s)(\d{2}):(\d{2})/);
	if (embedded) {
		const hour = Number(embedded[1]);
		const minute = Number(embedded[2]);
		if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) return `${embedded[1]}:${embedded[2]}`;
	}
	return null;
}
/**
* Arithmetic mean of a number array, rounded to 2 decimal places.
* Returns 0 for empty arrays.
*/
function avg$1(nums) {
	if (nums.length === 0) return 0;
	return +(nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2);
}
/**
* Recomputes categoryCurrentAvg from questions and derives overallReadinessScore
* as a 0–100 integer (mean score / 5 * 100).
*/
function withDerivedAverages$1(a) {
	const categories = a.categories.map((c) => ({
		...c,
		categoryCurrentAvg: avg$1(c.questions.map((q) => q.currentScore))
	}));
	const allScores = categories.flatMap((c) => c.questions.map((q) => q.currentScore));
	const overall = allScores.length === 0 ? 0 : Math.round(avg$1(allScores) / 5 * 100);
	return {
		...a,
		categories,
		overallReadinessScore: overall
	};
}
function relativeTime(isoString) {
	const diff = Date.now() - new Date(isoString).getTime();
	const mins = Math.floor(diff / 6e4);
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(diff / 36e5);
	if (hrs < 24) return `${hrs}h ago`;
	const days = Math.floor(diff / 864e5);
	if (days === 1) return "Yesterday";
	return `${days}d ago`;
}
/**
* profiles row → AuthUser
*/
function profileRowToAuthUser(row) {
	return {
		fullName: row.full_name,
		email: row.email,
		currentLevel: row.current_level,
		targetLevel: row.target_level,
		team: row.team,
		manager: row.manager,
		managerEmail: row.manager_email,
		...row.skip_level != null ? { skipLevel: row.skip_level } : {},
		...row.avatar_url != null ? { avatarUrl: row.avatar_url } : {},
		...row.job_title != null ? { jobTitle: row.job_title } : {}
	};
}
/**
* evidence row → EvidenceRecord
* date field stays as-is (YYYY-MM-DD)
*/
function evidenceRowToRecord(row) {
	const rawManagerNotes = row.manager_notes ?? "";
	const linkageMatch = rawManagerNotes.match(/\[auto-objective:[^\]]+\]/);
	const sampleMatch = rawManagerNotes.includes("[sample-content]");
	const managerNotes = rawManagerNotes.replace(/\[auto-objective:[^\]]+\]/g, "").replace(/\[sample-content\]/g, "").trim();
	return {
		id: row.id,
		date: row.date,
		source: row.source,
		category: row.category,
		competency: row.competency,
		title: row.title,
		description: row.description,
		link: row.link,
		status: row.status,
		matchState: row.match_state,
		managerNotes,
		...linkageMatch ? { linkageKey: linkageMatch[0] } : {},
		...sampleMatch ? { isSample: true } : {},
		isArchived: row.is_archived,
		...row.archived_date != null ? { archivedDate: row.archived_date } : {},
		createdAt: row.created_at
	};
}
/**
* objectives row → Objective
* Parses links and success_criteria JSONB fields.
*/
function objectiveRowToObjective(row) {
	let links;
	if (Array.isArray(row.links) && row.links.length > 0) links = row.links.map((l) => ({
		label: String(l.label ?? ""),
		url: String(l.url ?? "")
	}));
	else links = [];
	const parseSuccessCriterionArray = (arr) => {
		if (!Array.isArray(arr)) return [];
		return arr.map((item) => ({
			criteria: String(item.criteria ?? ""),
			evidence: String(item.evidence ?? ""),
			...item.attachments != null ? { attachments: item.attachments.map((a) => ({
				label: String(a.label ?? ""),
				url: String(a.url ?? "")
			})) } : {},
			...item.done != null ? { done: Boolean(item.done) } : {}
		}));
	};
	let successCriteria;
	const sc = row.success_criteria;
	if (sc != null && typeof sc === "object" && !Array.isArray(sc) && Object.keys(sc).length > 0) {
		const raw = sc;
		successCriteria = {
			learn: parseSuccessCriterionArray(raw.learn),
			demonstrate: parseSuccessCriterionArray(raw.demonstrate),
			share: parseSuccessCriterionArray(raw.share)
		};
	} else successCriteria = {
		learn: [],
		demonstrate: [],
		share: []
	};
	return {
		id: row.id,
		title: row.title,
		competency: row.competency,
		due: row.due,
		status: row.status,
		...row.statement != null ? { statement: row.statement } : {},
		...row.date_authored != null ? { dateAuthored: row.date_authored } : {},
		isArchived: row.is_archived,
		...row.archived_date != null ? { archivedDate: row.archived_date } : {},
		...row.specific != null ? { specific: row.specific } : {},
		...row.measurable != null ? { measurable: row.measurable } : {},
		...row.achievable != null ? { achievable: row.achievable } : {},
		...row.relevant != null ? { relevant: row.relevant } : {},
		...row.timebound != null ? { timebound: row.timebound } : {},
		...typeof row.success_criteria?.targetSubcategory === "string" ? { targetSubcategory: String(row.success_criteria.targetSubcategory) } : {},
		...Boolean(row.success_criteria?.sampleSeed) ? { isSample: true } : {},
		links,
		...row.notes != null ? { notes: row.notes } : {},
		successCriteria
	};
}
/**
* Builds nested Assessment from flat DB rows.
* Calls withDerivedAverages() to enforce the avg invariant.
*/
function assessmentRowsToAssessment(assessment, categories, questions) {
	const mappedCategories = categories.map((cat) => {
		const catQuestions = questions.filter((q) => q.category_id === cat.id).sort((a, b) => a.sort_order - b.sort_order).map((q) => ({
			questionId: q.question_id,
			questionText: q.question_text,
			previousScore: q.previous_score,
			currentScore: q.current_score,
			targetScore: q.target_score,
			justification: q.justification,
			attachedEvidenceIds: q.attached_evidence_ids
		}));
		return {
			categoryId: cat.category_id,
			categoryName: cat.category_name,
			summary: cat.summary,
			categoryCurrentAvg: cat.category_current_avg,
			categoryTarget: cat.category_target,
			questions: catQuestions
		};
	});
	return withDerivedAverages$1({
		id: assessment.id,
		dateCompleted: assessment.date_completed,
		reviewPeriod: assessment.review_period,
		status: assessment.status,
		engineerName: assessment.engineer_name,
		managerName: assessment.manager_name,
		overallReadinessScore: assessment.overall_readiness_score,
		categories: mappedCategories,
		oneOnOneTopics: Array.isArray(assessment.one_on_one_topics) ? assessment.one_on_one_topics : []
	});
}
/**
* inbox_events row → InboxItem
* icon is set to null (derived client-side from source at render time)
* when is derived from created_at as a relative time string
*/
function inboxRowToItem(row) {
	return {
		id: row.id,
		source: row.source,
		icon: null,
		title: row.title,
		suggestion: row.suggestion,
		when: relativeTime(row.created_at)
	};
}
/**
* user_settings row → { notifications: NotificationPrefs; integrations: IntegrationPrefs }
* Falls back to safe defaults for any missing keys.
*/
function settingsRowToSettings(row) {
	const defaultNotifications = {
		dailyReminder: true,
		managerApprovals: true,
		weeklyDigest: false,
		browserPush: true,
		extensionPromptTimes: ["16:00"],
		extensionSnoozeMinutes: 15,
		extensionWeekdaysOnly: true,
		extensionTimezone: getCurrentTimeZone()
	};
	const defaultIntegrations = {
		autoCaptureEvents: true,
		jira: true,
		github: true,
		bitbucket: false,
		slack: false,
		teams: false,
		confluence: false,
		notion: false
	};
	const rawN = row.notifications != null && typeof row.notifications === "object" && !Array.isArray(row.notifications) ? row.notifications : {};
	const rawI = row.integrations != null && typeof row.integrations === "object" && !Array.isArray(row.integrations) ? row.integrations : {};
	return {
		notifications: {
			dailyReminder: typeof rawN.dailyReminder === "boolean" ? rawN.dailyReminder : defaultNotifications.dailyReminder,
			managerApprovals: typeof rawN.managerApprovals === "boolean" ? rawN.managerApprovals : defaultNotifications.managerApprovals,
			weeklyDigest: typeof rawN.weeklyDigest === "boolean" ? rawN.weeklyDigest : defaultNotifications.weeklyDigest,
			browserPush: typeof rawN.browserPush === "boolean" ? rawN.browserPush : defaultNotifications.browserPush,
			extensionPromptTimes: Array.isArray(rawN.extensionPromptTimes) ? rawN.extensionPromptTimes.map((v) => normalizeWallClockTime$1(v)).filter((v) => Boolean(v)) : defaultNotifications.extensionPromptTimes,
			extensionSnoozeMinutes: typeof rawN.extensionSnoozeMinutes === "number" && Number.isFinite(rawN.extensionSnoozeMinutes) ? Math.max(1, Math.round(rawN.extensionSnoozeMinutes)) : defaultNotifications.extensionSnoozeMinutes,
			extensionWeekdaysOnly: typeof rawN.extensionWeekdaysOnly === "boolean" ? rawN.extensionWeekdaysOnly : defaultNotifications.extensionWeekdaysOnly,
			extensionTimezone: typeof rawN.extensionTimezone === "string" && rawN.extensionTimezone.trim().length > 0 ? rawN.extensionTimezone : defaultNotifications.extensionTimezone
		},
		integrations: {
			autoCaptureEvents: typeof rawI.autoCaptureEvents === "boolean" ? rawI.autoCaptureEvents : defaultIntegrations.autoCaptureEvents,
			jira: typeof rawI.jira === "boolean" ? rawI.jira : defaultIntegrations.jira,
			github: typeof rawI.github === "boolean" ? rawI.github : defaultIntegrations.github,
			bitbucket: typeof rawI.bitbucket === "boolean" ? rawI.bitbucket : defaultIntegrations.bitbucket,
			slack: typeof rawI.slack === "boolean" ? rawI.slack : defaultIntegrations.slack,
			teams: typeof rawI.teams === "boolean" ? rawI.teams : defaultIntegrations.teams,
			confluence: typeof rawI.confluence === "boolean" ? rawI.confluence : defaultIntegrations.confluence,
			notion: typeof rawI.notion === "boolean" ? rawI.notion : defaultIntegrations.notion
		}
	};
}
/**
* EvidenceRecord → evidence Insert
* Omits createdAt/updatedAt (DB-generated).
*/
function evidenceRecordToRow(r, userId) {
	const managerNotes = [[r.linkageKey, r.isSample ? "[sample-content]" : null].filter(Boolean).join(" "), r.managerNotes?.trim() ?? ""].filter(Boolean).join(" ").trim();
	return {
		id: r.id,
		user_id: userId,
		date: r.date,
		source: r.source,
		category: r.category,
		competency: r.competency,
		title: r.title,
		description: r.description,
		link: r.link,
		status: r.status,
		match_state: r.matchState,
		manager_notes: managerNotes,
		is_archived: r.isArchived,
		...r.archivedDate != null ? { archived_date: r.archivedDate } : { archived_date: null }
	};
}
/**
* Objective → objectives Insert
* Serializes links and successCriteria back to JSONB-compatible plain objects.
*/
function objectiveToRow(o, userId) {
	const existingCriteria = o.successCriteria ?? {
		learn: [],
		demonstrate: [],
		share: []
	};
	return {
		id: o.id,
		user_id: userId,
		title: o.title,
		competency: o.competency,
		due: o.due,
		status: o.status,
		statement: o.statement ?? null,
		date_authored: o.dateAuthored ?? null,
		is_archived: o.isArchived ?? false,
		archived_date: o.archivedDate ?? null,
		specific: o.specific ?? null,
		measurable: o.measurable ?? null,
		achievable: o.achievable ?? null,
		relevant: o.relevant ?? null,
		timebound: o.timebound ?? null,
		links: o.links ?? [],
		notes: o.notes ?? null,
		success_criteria: {
			...existingCriteria,
			...o.targetSubcategory ? { targetSubcategory: o.targetSubcategory } : {}
		}
	};
}
/**
* Assessment → flat rows for bulk insert.
* Generates UUIDs per category so questions reference the right category_id.
*/
function assessmentToRows(a, userId) {
	const assessmentInsert = {
		id: a.id,
		user_id: userId,
		date_completed: a.dateCompleted,
		review_period: a.reviewPeriod,
		status: a.status,
		engineer_name: a.engineerName,
		manager_name: a.managerName,
		overall_readiness_score: a.overallReadinessScore,
		one_on_one_topics: a.oneOnOneTopics
	};
	const categoryInserts = [];
	const questionInserts = [];
	a.categories.forEach((cat, ci) => {
		const catUuid = generateSafeId();
		const catAvg = avg$1(cat.questions.map((q) => q.currentScore));
		categoryInserts.push({
			id: catUuid,
			assessment_id: a.id,
			user_id: userId,
			category_id: cat.categoryId,
			category_name: cat.categoryName,
			summary: cat.summary,
			category_current_avg: catAvg,
			category_target: cat.categoryTarget,
			sort_order: ci
		});
		cat.questions.forEach((q, qi) => {
			questionInserts.push({
				category_id: catUuid,
				assessment_id: a.id,
				user_id: userId,
				question_id: q.questionId,
				question_text: q.questionText,
				previous_score: q.previousScore,
				current_score: q.currentScore,
				target_score: q.targetScore,
				justification: q.justification,
				attached_evidence_ids: q.attachedEvidenceIds,
				sort_order: qi
			});
		});
	});
	return {
		assessment: assessmentInsert,
		categories: categoryInserts,
		questions: questionInserts
	};
}
var AUTH_STATE_CHANGE_EVENT = "EVITRACE_AUTH_STATE_CHANGE";
var AuthContext = (0, import_react.createContext)(null);
/** Throws if used outside <AuthProvider>. */
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth() must be used inside <AuthProvider>");
	return ctx;
}
var DEFAULT_NOTIFICATIONS = {
	dailyReminder: true,
	managerApprovals: true,
	weeklyDigest: false,
	browserPush: true,
	extensionPromptTimes: ["16:00"],
	extensionSnoozeMinutes: 15,
	extensionWeekdaysOnly: true,
	extensionTimezone: getCurrentTimeZone()
};
var DEFAULT_INTEGRATIONS = {
	autoCaptureEvents: true,
	jira: true,
	github: true,
	bitbucket: false,
	slack: false,
	teams: false,
	confluence: false,
	notion: false
};
function readString(value) {
	return typeof value === "string" ? value.trim() : "";
}
function getProfileSeedFromMetadata(metadata, email) {
	const emailPrefix = (email ?? "").split("@")[0] || "User";
	const unifiedCurrentLevel = readString(metadata?.current_level) || readString(metadata?.currentLevel) || readString(metadata?.job_title) || readString(metadata?.jobTitle);
	return {
		full_name: readString(metadata?.full_name) || readString(metadata?.fullName) || emailPrefix || "Unknown",
		current_level: unifiedCurrentLevel,
		target_level: readString(metadata?.target_level) || readString(metadata?.targetLevel),
		team: readString(metadata?.team),
		manager: readString(metadata?.manager),
		manager_email: readString(metadata?.manager_email) || readString(metadata?.managerEmail),
		skip_level: readString(metadata?.skip_level) || readString(metadata?.skipLevel) || null,
		job_title: unifiedCurrentLevel || null
	};
}
function getProfileSeedFromSignupInput(u) {
	const unifiedCurrentLevel = u.currentLevel.trim();
	return {
		full_name: u.fullName.trim(),
		current_level: unifiedCurrentLevel,
		target_level: u.targetLevel.trim(),
		team: u.team.trim(),
		manager: u.manager.trim(),
		manager_email: u.managerEmail.trim(),
		skip_level: u.skipLevel?.trim() ? u.skipLevel.trim() : null,
		job_title: unifiedCurrentLevel || null
	};
}
async function fetchProfile(userId) {
	const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
	if (error || !data) return null;
	return profileRowToAuthUser(data);
}
function getChromeApi() {
	return globalThis.chrome;
}
function toBridgeSessionPayload(session) {
	if (!session || typeof session !== "object") return null;
	const candidate = session;
	const accessToken = candidate.access_token;
	const refreshToken = candidate.refresh_token;
	if (typeof accessToken !== "string" || typeof refreshToken !== "string") return null;
	if (!accessToken.trim() || !refreshToken.trim()) return null;
	return {
		access_token: accessToken,
		refresh_token: refreshToken
	};
}
function broadcastAuthStateChangeToBridge(event, session) {
	if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
	const payload = toBridgeSessionPayload(session);
	window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { detail: {
		type: "AUTH_STATE_CHANGE",
		event,
		session: payload
	} }));
}
function normalizeMirroredSession(value) {
	if (!value || typeof value !== "object") return null;
	const session = value;
	const accessToken = typeof session.accessToken === "string" ? session.accessToken : typeof session.access_token === "string" ? session.access_token : null;
	const refreshToken = typeof session.refreshToken === "string" ? session.refreshToken : typeof session.refresh_token === "string" ? session.refresh_token : null;
	if (!accessToken || !refreshToken) return null;
	return {
		accessToken,
		refreshToken,
		storageKey: typeof session.storageKey === "string" ? session.storageKey : void 0,
		sourceUrl: typeof session.sourceUrl === "string" ? session.sourceUrl : void 0,
		syncedAt: typeof session.syncedAt === "number" ? session.syncedAt : void 0
	};
}
async function readMirroredSessionFromChromeStorage() {
	const chromeApi = getChromeApi();
	if (!chromeApi?.storage?.local) return null;
	return await new Promise((resolve) => {
		chromeApi.storage.local.get(["evitrace_supabase_session"], (stored) => {
			resolve(normalizeMirroredSession(stored?.evitrace_supabase_session));
		});
	});
}
async function requestSessionSyncFromWebAppTab() {
	const chromeApi = getChromeApi();
	if (!chromeApi?.runtime?.sendMessage) return;
	await new Promise((resolve) => {
		chromeApi.runtime.sendMessage({
			type: "SYNC_SUPABASE_SESSION",
			source: "auth_provider"
		}, () => {
			resolve();
		});
	});
}
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [userId, setUserId] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const subscriptionRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			if (cancelled) return;
			let activeSession = session;
			if (!activeSession) {
				await requestSessionSyncFromWebAppTab();
				const mirrored = await readMirroredSessionFromChromeStorage();
				if (mirrored) {
					const { data: hydrated, error } = await supabase.auth.setSession({
						access_token: mirrored.accessToken,
						refresh_token: mirrored.refreshToken
					});
					if (!error) activeSession = hydrated.session;
				}
			}
			if (activeSession?.user) {
				const profile = await fetchProfile(activeSession.user.id);
				if (!cancelled) {
					setUser(profile);
					setUserId(activeSession.user.id);
				}
			}
			if (!cancelled) setLoading(false);
		});
		const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
			broadcastAuthStateChangeToBridge(event, session);
			if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
				if (!session?.user) return;
				const profile = await fetchProfile(session.user.id);
				if (!profile && session.user) {
					const seeded = getProfileSeedFromMetadata(session.user.user_metadata ?? {}, session.user.email ?? "");
					await supabase.from("profiles").insert({
						id: session.user.id,
						full_name: seeded.full_name,
						email: session.user.email ?? "",
						current_level: seeded.current_level,
						target_level: seeded.target_level,
						team: seeded.team,
						manager: seeded.manager,
						manager_email: seeded.manager_email,
						skip_level: seeded.skip_level,
						job_title: seeded.job_title
					});
					const { data: existingSettings } = await supabase.from("user_settings").select("id").eq("user_id", session.user.id).maybeSingle();
					if (!existingSettings) await supabase.from("user_settings").insert({
						user_id: session.user.id,
						notifications: DEFAULT_NOTIFICATIONS,
						integrations: DEFAULT_INTEGRATIONS
					});
					setUser(await fetchProfile(session.user.id));
					setUserId(session.user.id);
				} else {
					setUser(profile);
					setUserId(session.user.id);
				}
			} else if (event === "SIGNED_OUT") {
				setUser(null);
				setUserId(null);
			}
		});
		subscriptionRef.current = subscription;
		return () => {
			cancelled = true;
			subscription.unsubscribe();
		};
	}, []);
	const value = {
		user,
		userId,
		loading,
		signin: (0, import_react.useCallback)(async (email, password) => {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (error) {
				toast.error(error.message);
				return false;
			}
			const { data: existingProfile, error: profileLookupError } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
			if (profileLookupError) {
				toast.error(profileLookupError.message);
				return false;
			}
			if (!existingProfile) {
				const seeded = getProfileSeedFromMetadata(data.user.user_metadata ?? {}, data.user.email ?? email);
				const { error: insertProfileError } = await supabase.from("profiles").insert({
					id: data.user.id,
					full_name: seeded.full_name,
					email: data.user.email ?? email,
					current_level: seeded.current_level,
					target_level: seeded.target_level,
					team: seeded.team,
					manager: seeded.manager,
					manager_email: seeded.manager_email,
					skip_level: seeded.skip_level,
					job_title: seeded.job_title
				});
				if (insertProfileError) {
					toast.error(insertProfileError.message);
					return false;
				}
			}
			const { data: existingSettings, error: settingsLookupError } = await supabase.from("user_settings").select("id").eq("user_id", data.user.id).maybeSingle();
			if (settingsLookupError) {
				toast.error(settingsLookupError.message);
				return false;
			}
			if (!existingSettings) {
				const { error: insertSettingsError } = await supabase.from("user_settings").insert({
					user_id: data.user.id,
					notifications: DEFAULT_NOTIFICATIONS,
					integrations: DEFAULT_INTEGRATIONS
				});
				if (insertSettingsError) {
					toast.error(insertSettingsError.message);
					return false;
				}
			}
			setUser(await fetchProfile(data.user.id));
			setUserId(data.user.id);
			return true;
		}, []),
		signup: (0, import_react.useCallback)(async (u) => {
			const seededProfile = getProfileSeedFromSignupInput(u);
			const { data, error } = await supabase.auth.signUp({
				email: u.email,
				password: u.password,
				options: { data: {
					full_name: seededProfile.full_name,
					current_level: seededProfile.current_level,
					target_level: seededProfile.target_level,
					team: seededProfile.team,
					manager: seededProfile.manager,
					manager_email: seededProfile.manager_email,
					skip_level: seededProfile.skip_level,
					job_title: seededProfile.job_title
				} }
			});
			if (error) {
				toast.error(error.message);
				return false;
			}
			if (data.user && !data.session) {
				toast.success("Check your inbox to confirm your email address.");
				return true;
			}
			if (data.user && data.session) {
				await supabase.from("profiles").insert({
					id: data.user.id,
					full_name: seededProfile.full_name,
					email: u.email,
					current_level: seededProfile.current_level,
					target_level: seededProfile.target_level,
					team: seededProfile.team,
					manager: seededProfile.manager,
					manager_email: seededProfile.manager_email,
					skip_level: seededProfile.skip_level,
					avatar_url: u.avatarUrl ?? null,
					job_title: seededProfile.job_title
				});
				await supabase.from("user_settings").insert({
					user_id: data.user.id,
					notifications: DEFAULT_NOTIFICATIONS,
					integrations: DEFAULT_INTEGRATIONS
				});
				setUser(await fetchProfile(data.user.id));
				setUserId(data.user.id);
			}
			return true;
		}, []),
		signout: (0, import_react.useCallback)(async () => {
			const { error } = await supabase.auth.signOut();
			if (error) console.error("[auth] signOut error:", error.message);
			setUser(null);
			setUserId(null);
		}, []),
		updateUser: (0, import_react.useCallback)(async (patch, password) => {
			if (!user) return false;
			const { error: verifyError } = await supabase.auth.signInWithPassword({
				email: user.email,
				password
			});
			if (verifyError) return false;
			const { data: { user: authUser } } = await supabase.auth.getUser();
			if (!authUser) return false;
			if (patch.email && patch.email !== user.email) {
				const { error: emailError } = await supabase.auth.updateUser({ email: patch.email });
				if (emailError) {
					toast.error(emailError.message);
					return false;
				}
			}
			const profilePatch = {};
			if (patch.fullName !== void 0) profilePatch.full_name = patch.fullName;
			if (patch.email !== void 0) profilePatch.email = patch.email;
			if (patch.currentLevel !== void 0) {
				const unifiedCurrentLevel = patch.currentLevel.trim();
				profilePatch.current_level = unifiedCurrentLevel;
				profilePatch.job_title = unifiedCurrentLevel || null;
			}
			if (patch.targetLevel !== void 0) profilePatch.target_level = patch.targetLevel;
			if (patch.team !== void 0) profilePatch.team = patch.team;
			if (patch.manager !== void 0) profilePatch.manager = patch.manager;
			if (patch.managerEmail !== void 0) profilePatch.manager_email = patch.managerEmail;
			if (patch.skipLevel !== void 0) profilePatch.skip_level = patch.skipLevel?.trim() ? patch.skipLevel.trim() : null;
			if (patch.avatarUrl !== void 0) profilePatch.avatar_url = patch.avatarUrl ?? null;
			if (patch.jobTitle !== void 0 && patch.currentLevel === void 0) {
				const unifiedCurrentLevel = patch.jobTitle.trim();
				profilePatch.current_level = unifiedCurrentLevel;
				profilePatch.job_title = unifiedCurrentLevel || null;
			}
			if (Object.keys(profilePatch).length > 0) {
				const { error: updateError } = await supabase.from("profiles").update(profilePatch).eq("id", authUser.id);
				if (updateError) {
					toast.error(updateError.message);
					return false;
				}
			}
			setUser((prev) => prev ? {
				...prev,
				...patch
			} : prev);
			return true;
		}, [user]),
		signInWithGoogle: (0, import_react.useCallback)(async () => {
			await supabase.auth.signInWithOAuth({
				provider: "google",
				options: { redirectTo: window.location.origin }
			});
		}, []),
		signInWithMicrosoft: (0, import_react.useCallback)(async () => {
			await supabase.auth.signInWithOAuth({
				provider: "azure",
				options: { redirectTo: window.location.origin }
			});
		}, [])
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children: loading ? null : children
	});
}
var evidenceKey = (userId, archived, includeSamples) => [
	"evidence",
	userId,
	{
		archived,
		includeSamples
	}
];
function buildSampleEvidence(userId) {
	const today = /* @__PURE__ */ new Date();
	const addDays = (days) => {
		const d = new Date(today);
		d.setDate(d.getDate() + days);
		return toLocalDateString(d);
	};
	return [
		{
			id: "00000000-0000-4000-8000-000000002001",
			user_id: userId,
			date: addDays(-2),
			source: "Manual",
			category: "Code Quality",
			competency: "Maintains adequate unit and integration test coverage",
			title: "Captured test strategy notes from auth service hardening",
			description: "Captured summary of test-matrix decisions and flaky-test fixes after auth refactor.",
			link: "https://example.com/docs/auth-test-strategy",
			status: "Pending Review",
			match_state: "Yes",
			manager_notes: "[sample-content]",
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000002002",
			user_id: userId,
			date: addDays(-6),
			source: "Manual",
			category: "System Design",
			competency: "Designs systems with observability and operational maturity in mind",
			title: "Captured architecture notes from trace instrumentation session",
			description: "Logged design decisions for OpenTelemetry spans, trace propagation, and dashboard ownership.",
			link: "https://example.com/rfc/otel-tracing-plan",
			status: "Pending Review",
			match_state: "Somewhat",
			manager_notes: "[sample-content]",
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000002003",
			user_id: userId,
			date: addDays(-11),
			source: "Manual",
			category: "Delivery",
			competency: "Turns reliability targets into measurable delivery outcomes",
			title: "Captured rollout checklist for checkout canary release",
			description: "Recorded canary checklist, rollback gates, and release readiness criteria from release review.",
			link: "https://example.com/runbooks/checkout-canary",
			status: "Reviewed",
			match_state: "Yes",
			manager_notes: "[sample-content]",
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000002004",
			user_id: userId,
			date: addDays(-15),
			source: "Manual",
			category: "Communication",
			competency: "Communicates status and technical decisions clearly across teams",
			title: "Captured weekly engineering updates summary",
			description: "Saved the structured async update highlighting risks, milestones, and dependencies across squads.",
			link: "",
			status: "Reviewed",
			match_state: "Yes",
			manager_notes: "[sample-content]",
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000002005",
			user_id: userId,
			date: addDays(-4),
			source: "Objective",
			category: "Security",
			competency: "Builds practical vulnerability response workflows",
			title: "Automate dependency vulnerability triage workflow",
			description: "Automate severity triage and ownership routing for dependency CVEs so remediation starts within 24 hours.",
			link: "https://example.com/security/vuln-triage",
			status: "Reviewed",
			match_state: "Yes",
			manager_notes: "[sample-content] [auto-objective:00000000-0000-4000-8000-000000001009]",
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000002006",
			user_id: userId,
			date: addDays(-8),
			source: "Objective",
			category: "Delivery",
			competency: "Delivers work predictably with measurable operational outcomes",
			title: "Deliver CI performance baseline dashboard",
			description: "Published weekly CI baseline dashboard covering runtime, flaky tests, and queue delays; shared with platform leads.",
			link: "https://example.com/dashboards/ci-baseline",
			status: "Reviewed",
			match_state: "Yes",
			manager_notes: "[sample-content] [auto-objective:00000000-0000-4000-8000-000000001005]",
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000002007",
			user_id: userId,
			date: addDays(-12),
			source: "Objective",
			category: "Communication",
			competency: "Leads clear technical communication rituals across teams",
			title: "Complete postmortem template rollout across squads",
			description: "Rolled out standard incident postmortem template and trained three squads on consistent write-up quality.",
			link: "https://example.com/templates/postmortem-v2",
			status: "Reviewed",
			match_state: "Yes",
			manager_notes: "[sample-content] [auto-objective:00000000-0000-4000-8000-000000001010]",
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000002008",
			user_id: userId,
			date: addDays(-18),
			source: "Objective",
			category: "System Design",
			competency: "Designs migration plans with rollback and risk controls",
			title: "Draft migration plan for Redis session storage",
			description: "Created migration plan covering cutover, rollback, and consistency safeguards for moving sessions to Redis.",
			link: "https://example.com/rfc/redis-session-migration",
			status: "Reviewed",
			match_state: "Yes",
			manager_notes: "[sample-content] [auto-objective:00000000-0000-4000-8000-000000001008]",
			is_archived: false
		}
	];
}
/**
* Fetches evidence records for a user, filtered by archived state.
* Key: ['evidence', userId, { archived }]
* staleTime: 60s
*/
function useEvidenceQuery(userId, opts = {}) {
	const archived = opts.archived ?? false;
	const includeSamples = opts.includeSamples ?? true;
	return useQuery({
		queryKey: evidenceKey(userId, archived, includeSamples),
		queryFn: async () => {
			if (!archived && includeSamples) {
				const sampleRows = buildSampleEvidence(userId);
				const { error: seedError } = await supabase.from("evidence").upsert(sampleRows, {
					onConflict: "id",
					ignoreDuplicates: true
				});
				if (seedError) console.warn("[evidence] sample seeding skipped:", seedError.message);
			}
			const { data, error } = await supabase.from("evidence").select("*").eq("user_id", userId).eq("is_archived", archived).order("date", { ascending: false });
			if (error) throw error;
			const records = (data ?? []).map(evidenceRowToRecord);
			if (includeSamples) return records;
			return records.filter((record) => !record.isSample);
		},
		staleTime: 6e4,
		enabled: Boolean(userId)
	});
}
/**
* Updates an existing evidence record with optimistic update.
* onMutate: snapshot → apply optimistic patch
* onError: roll back + toast.error
* onSettled: invalidate ['evidence', userId, *]
*/
function useSaveEvidence(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (record) => {
			const { data: existingRow, error: existingError } = await supabase.from("evidence").select("source, manager_notes").eq("id", record.id).eq("user_id", userId).maybeSingle();
			if (existingError) throw existingError;
			if (existingRow?.source === "Objective" || Boolean(existingRow?.manager_notes?.includes("[auto-objective:"))) throw new Error("Objective-logged evidence is managed from Objectives and cannot be edited here.");
			const row = evidenceRecordToRow(record, userId);
			const { error } = await supabase.from("evidence").update(row).eq("id", record.id).eq("user_id", userId);
			if (error) throw error;
		},
		onMutate: async (record) => {
			const queryKey = evidenceKey(userId, record.isArchived, true);
			await queryClient.cancelQueries({ queryKey });
			const previousData = queryClient.getQueryData(queryKey);
			queryClient.setQueryData(queryKey, (old) => (old ?? []).map((e) => e.id === record.id ? record : e));
			return {
				previousData,
				queryKey
			};
		},
		onError: (error, _record, context) => {
			if (context?.previousData !== void 0 && context?.queryKey) queryClient.setQueryData(context.queryKey, context.previousData);
			toast.error(error.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["evidence", userId] });
		}
	});
}
/**
* Archives an evidence record: sets is_archived = true, archived_date = today.
* Invalidates both archived and active evidence keys.
*/
function useArchiveEvidence(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const today = toLocalDateString();
			const { error } = await supabase.from("evidence").update({
				is_archived: true,
				archived_date: today
			}).eq("id", id).eq("user_id", userId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: evidenceKey(userId, false, true) });
			queryClient.invalidateQueries({ queryKey: evidenceKey(userId, true, true) });
		}
	});
}
/**
* Restores an archived evidence record: sets is_archived = false, archived_date = null.
* Invalidates both archived and active evidence keys.
*/
function useRestoreEvidence(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("evidence").update({
				is_archived: false,
				archived_date: null
			}).eq("id", id).eq("user_id", userId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: evidenceKey(userId, false, true) });
			queryClient.invalidateQueries({ queryKey: evidenceKey(userId, true, true) });
		}
	});
}
/**
* Permanently deletes an evidence record.
* Invalidates the archived evidence key (delete is only available on archived items).
*/
function useDeleteEvidence(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("evidence").delete().eq("id", id).eq("user_id", userId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["evidence", userId] });
		}
	});
}
/**
* Inserts a new evidence record via evidenceRecordToRow().
* Invalidates the active (archived: false) evidence key.
*/
function useInsertEvidence(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (record) => {
			const row = evidenceRecordToRow(record, userId);
			const { id, ...rowWithoutId } = row;
			const insertPayload = id ? row : rowWithoutId;
			const { error } = await supabase.from("evidence").insert(insertPayload);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: evidenceKey(userId, false, true) });
		}
	});
}
var inboxKey = (userId) => ["inbox", userId];
var evidenceActiveKey$1 = (userId) => [
	"evidence",
	userId,
	{ archived: false }
];
/**
* Fetches inbox_events for a user, ordered newest-first.
* Key: ['inbox', userId]
* staleTime: 30s
*/
function useInboxQuery(userId) {
	return useQuery({
		queryKey: inboxKey(userId),
		queryFn: async () => {
			const { data, error } = await supabase.from("inbox_events").select("*").eq("user_id", userId).order("created_at", { ascending: false });
			if (error) throw error;
			return (data ?? []).map(inboxRowToItem);
		},
		staleTime: 3e4,
		enabled: Boolean(userId)
	});
}
/**
* Approves an inbox item by:
*   1. Optimistically removing the inbox item from ['inbox', userId]
*   2. Optimistically prepending the new evidence row to ['evidence', userId, { archived: false }]
*   3. Inserting the evidence row into the DB
*   4. Deleting the inbox_events row from the DB
*
* onError: rolls back both caches to their snapshots + toast.error
* onSuccess: invalidates ['inbox', userId] and ['evidence', userId, { archived: false }]
*/
function useApproveInbox(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ inboxItem, newEvidenceRow }) => {
			const { error: evidenceError } = await supabase.from("evidence").insert(newEvidenceRow);
			if (evidenceError) throw evidenceError;
			const { error: inboxError } = await supabase.from("inbox_events").delete().eq("id", inboxItem.id);
			if (inboxError) throw inboxError;
		},
		onMutate: async ({ inboxItem, newEvidenceRow }) => {
			const inboxQueryKey = inboxKey(userId);
			const evidenceQueryKey = evidenceActiveKey$1(userId);
			await Promise.all([queryClient.cancelQueries({ queryKey: inboxQueryKey }), queryClient.cancelQueries({ queryKey: evidenceQueryKey })]);
			const previousInbox = queryClient.getQueryData(inboxQueryKey);
			const previousEvidence = queryClient.getQueryData(evidenceQueryKey);
			queryClient.setQueryData(inboxQueryKey, (old) => (old ?? []).filter((item) => item.id !== inboxItem.id));
			const optimisticEvidence = {
				id: `optimistic-${inboxItem.id}`,
				date: newEvidenceRow.date ?? toLocalDateString(),
				source: newEvidenceRow.source,
				category: newEvidenceRow.category,
				competency: newEvidenceRow.competency,
				title: newEvidenceRow.title,
				description: newEvidenceRow.description ?? "",
				link: newEvidenceRow.link ?? "",
				status: newEvidenceRow.status ?? "Pending Review",
				matchState: newEvidenceRow.match_state ?? "Unset",
				managerNotes: newEvidenceRow.manager_notes ?? "",
				isArchived: newEvidenceRow.is_archived ?? false,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			queryClient.setQueryData(evidenceQueryKey, (old) => [optimisticEvidence, ...old ?? []]);
			return {
				previousInbox,
				previousEvidence,
				inboxQueryKey,
				evidenceQueryKey
			};
		},
		onError: (error, _variables, context) => {
			if (context?.previousInbox !== void 0 && context?.inboxQueryKey) queryClient.setQueryData(context.inboxQueryKey, context.previousInbox);
			if (context?.previousEvidence !== void 0 && context?.evidenceQueryKey) queryClient.setQueryData(context.evidenceQueryKey, context.previousEvidence);
			toast.error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: inboxKey(userId) });
			queryClient.invalidateQueries({ queryKey: evidenceActiveKey$1(userId) });
		}
	});
}
/**
* Dismisses (deletes) an inbox item without creating evidence.
* Invalidates ['inbox', userId] on success.
*/
function useDismissInbox(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (inboxId) => {
			const { error } = await supabase.from("inbox_events").delete().eq("id", inboxId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: inboxKey(userId) });
		}
	});
}
var objectivesKey = (userId, archived, includeSamples) => [
	"objectives",
	userId,
	{
		archived,
		includeSamples
	}
];
var evidenceActiveKey = (userId) => [
	"evidence",
	userId,
	{ archived: false }
];
var objectiveEvidenceMarker = (objectiveId) => `[auto-objective:${objectiveId}]`;
function patchObjectiveCaches(queryClient, userId, update) {
	queryClient.getQueriesData({ queryKey: ["objectives", userId] }).forEach(([key, value]) => {
		if (!Array.isArray(value)) return;
		const meta = Array.isArray(key) ? key[2] : void 0;
		const archivedView = Boolean(meta?.archived);
		const next = value.map((row) => update(row)).filter((row) => archivedView ? Boolean(row.isArchived) : !row.isArchived);
		queryClient.setQueryData(key, next);
	});
}
function objectiveLinksToLogText(links) {
	if (!links || links.length === 0) return "";
	return links.map((link) => {
		const label = link.label?.trim();
		const url = link.url?.trim();
		if (label && url) return `${label}: ${url}`;
		return url || label || "";
	}).filter(Boolean).join(" | ");
}
function buildSampleObjectives(userId) {
	const today = /* @__PURE__ */ new Date();
	const addDays = (days) => {
		const d = new Date(today);
		d.setDate(d.getDate() + days);
		return toLocalDateString(d);
	};
	const authored = toLocalDateString(today);
	return [
		{
			id: "00000000-0000-4000-8000-000000001001",
			user_id: userId,
			title: "Instrument checkout service with OpenTelemetry traces",
			competency: "System Design",
			due: addDays(21),
			status: "In Progress",
			statement: "Add end-to-end tracing for checkout API, workers, and downstream billing calls to reduce incident triage time.",
			date_authored: authored,
			links: [{
				label: "OTel spec",
				url: "https://opentelemetry.io/docs/"
			}],
			success_criteria: {
				sampleSeed: true,
				targetSubcategory: "Designs systems with observability and operational maturity in mind",
				learn: [],
				demonstrate: [],
				share: []
			},
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000001002",
			user_id: userId,
			title: "Define retry/idempotency policy for payment webhooks",
			competency: "Technical Design",
			due: addDays(35),
			status: "Pending Approval",
			statement: "Publish and align on a robust idempotency and retry policy to prevent duplicate payment side effects.",
			date_authored: authored,
			success_criteria: {
				sampleSeed: true,
				targetSubcategory: "Designs systems with appropriate trade-off analysis",
				learn: [],
				demonstrate: [],
				share: []
			},
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000001003",
			user_id: userId,
			title: "Raise auth service test coverage to 85%",
			competency: "Code Quality",
			due: addDays(45),
			status: "In Progress",
			statement: "Increase confidence in auth service changes by expanding unit and integration test coverage and enforcing CI gates.",
			date_authored: authored,
			success_criteria: {
				sampleSeed: true,
				targetSubcategory: "Maintains adequate unit and integration test coverage",
				learn: [],
				demonstrate: [],
				share: []
			},
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000001004",
			user_id: userId,
			title: "Run incident retrospective facilitation for P1 outages",
			competency: "Communication",
			due: addDays(14),
			status: "Pending Approval",
			statement: "Lead structured post-incident retrospectives and ensure action items are documented, assigned, and tracked.",
			date_authored: authored,
			success_criteria: {
				sampleSeed: true,
				targetSubcategory: "Communicates status and technical decisions clearly across teams",
				learn: [],
				demonstrate: [],
				share: []
			},
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000001005",
			user_id: userId,
			title: "Deliver CI performance baseline dashboard",
			competency: "Delivery",
			due: addDays(-7),
			status: "Completed",
			statement: "Published weekly CI baseline dashboard covering runtime, flaky tests, and queue delays; shared with platform leads.",
			date_authored: addDays(-40),
			success_criteria: {
				sampleSeed: true,
				targetSubcategory: "Delivers work predictably with measurable operational outcomes",
				learn: [],
				demonstrate: [],
				share: []
			},
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000001006",
			user_id: userId,
			title: "Complete secure coding refresher and threat model review",
			competency: "Security",
			due: addDays(-2),
			status: "Completed",
			statement: "Completed internal secure coding refresher and reviewed threat model updates for auth and session boundaries.",
			date_authored: addDays(-28),
			success_criteria: {
				sampleSeed: true,
				targetSubcategory: "Identifies and mitigates common application security risks",
				learn: [],
				demonstrate: [],
				share: []
			},
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000001007",
			user_id: userId,
			title: "Publish SLOs and alert policy for payment APIs",
			competency: "Delivery",
			due: addDays(18),
			status: "In Progress",
			statement: "Define SLOs, error-budget policy, and actionable alert thresholds for checkout and settlement API endpoints.",
			date_authored: authored,
			success_criteria: {
				sampleSeed: true,
				targetSubcategory: "Turns reliability targets into measurable delivery outcomes",
				learn: [],
				demonstrate: [],
				share: []
			},
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000001008",
			user_id: userId,
			title: "Draft migration plan for Redis session storage",
			competency: "System Design",
			due: addDays(32),
			status: "Pending Approval",
			statement: "Create migration plan covering cutover, rollback, and consistency safeguards for moving sessions to Redis.",
			date_authored: authored,
			success_criteria: {
				sampleSeed: true,
				targetSubcategory: "Designs migration plans with rollback and risk controls",
				learn: [],
				demonstrate: [],
				share: []
			},
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000001009",
			user_id: userId,
			title: "Automate dependency vulnerability triage workflow",
			competency: "Security",
			due: addDays(27),
			status: "Pending Approval",
			statement: "Automate severity triage and ownership routing for dependency CVEs so remediation starts within 24 hours.",
			date_authored: authored,
			success_criteria: {
				sampleSeed: true,
				targetSubcategory: "Builds practical vulnerability response workflows",
				learn: [],
				demonstrate: [],
				share: []
			},
			is_archived: false
		},
		{
			id: "00000000-0000-4000-8000-000000001010",
			user_id: userId,
			title: "Complete postmortem template rollout across squads",
			competency: "Communication",
			due: addDays(-4),
			status: "Completed",
			statement: "Rolled out standard incident postmortem template and trained three squads on consistent write-up quality.",
			date_authored: addDays(-46),
			success_criteria: {
				sampleSeed: true,
				targetSubcategory: "Leads clear technical communication rituals across teams",
				learn: [],
				demonstrate: [],
				share: []
			},
			is_archived: false
		}
	];
}
function useObjectivesQuery(userId, opts = {}) {
	const archived = opts.archived ?? false;
	const includeSamples = opts.includeSamples ?? true;
	return useQuery({
		queryKey: objectivesKey(userId, archived, includeSamples),
		queryFn: async () => {
			if (!archived && includeSamples) {
				const sampleRows = buildSampleObjectives(userId);
				const { error: seedError } = await supabase.from("objectives").upsert(sampleRows, {
					onConflict: "id",
					ignoreDuplicates: true
				});
				if (seedError) console.warn("[objectives] sample seeding skipped:", seedError.message);
			}
			const { data, error } = await supabase.from("objectives").select("*").eq("user_id", userId).eq("is_archived", archived).order("due", { ascending: true });
			if (error) throw error;
			const records = (data ?? []).map(objectiveRowToObjective);
			if (includeSamples) return records;
			return records.filter((record) => !record.isSample);
		},
		staleTime: 6e4,
		enabled: Boolean(userId)
	});
}
/**
* Inserts a new objective with status: 'Pending Approval'.
* Invalidates ['objectives', userId] on success.
*/
function useCreateObjective(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (objective) => {
			const row = objectiveToRow({
				...objective,
				status: "Pending Approval"
			}, userId);
			const { id, ...rowWithoutId } = row;
			const insertPayload = id ? row : rowWithoutId;
			const { data, error } = await supabase.from("objectives").insert(insertPayload).select("*").single();
			if (error) throw error;
			return objectiveRowToObjective(data);
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (createdObjective) => {
			queryClient.getQueriesData({ queryKey: ["objectives", userId] }).forEach(([key, value]) => {
				if (!Array.isArray(value)) return;
				if ((Array.isArray(key) ? key[2] : void 0)?.archived) return;
				if (value.some((row) => row.id === createdObjective.id)) return;
				queryClient.setQueryData(key, [...value, createdObjective]);
			});
			queryClient.invalidateQueries({ queryKey: ["objectives", userId] });
		}
	});
}
/**
* Updates the status of an objective.
* When status === 'Completed', also INSERTs a new evidence row with:
*   category: 'Objective', competency: objective.competency,
*   status: 'Pending Review', match_state: 'Unset'
*
* Invalidates ['objectives', userId] on success.
* If Completed, also invalidates ['evidence', userId, { archived: false }].
*/
function useMoveObjective(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, status, objective }) => {
			const previousStatus = objective.status;
			const { error: updateError } = await supabase.from("objectives").update({ status }).eq("id", id).eq("user_id", userId);
			if (updateError) throw updateError;
			if (status === "Completed" && previousStatus !== "Completed") {
				const targetSubcategory = objective.targetSubcategory?.trim() || objective.specific?.trim() || objective.competency;
				const sourceLinks = objectiveLinksToLogText(objective.links);
				const { error: evidenceError } = await supabase.from("evidence").insert({
					user_id: userId,
					title: objective.title,
					description: objective.statement ?? "",
					category: objective.competency,
					competency: targetSubcategory,
					source: "Objective",
					link: sourceLinks,
					status: "Reviewed",
					match_state: "Yes",
					manager_notes: objectiveEvidenceMarker(id),
					date: toLocalDateString(),
					is_archived: false
				});
				if (evidenceError) {
					await supabase.from("objectives").update({ status: previousStatus }).eq("id", id).eq("user_id", userId);
					throw evidenceError;
				}
			}
			if (previousStatus === "Completed" && status === "In Progress") {
				const { error: cleanupError } = await supabase.from("evidence").delete().eq("user_id", userId).eq("source", "Objective").eq("manager_notes", objectiveEvidenceMarker(id));
				if (cleanupError) throw cleanupError;
			}
			if (previousStatus === "Pending Approval" && status === "In Progress") await sendNotification({ data: {
				userId,
				type: "objective",
				title: "Objective approved",
				description: `Your growth metric "${objective.title}" was moved to Approved after manager review.`
			} });
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_data, { status, objective }) => {
			queryClient.invalidateQueries({ queryKey: ["objectives", userId] });
			if (status === "Completed" || objective.status === "Completed") queryClient.invalidateQueries({ queryKey: evidenceActiveKey(userId) });
		}
	});
}
/**
* Updates an existing objective with all fields.
* Invalidates ['objectives', userId] on success.
*/
function useSaveObjective(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (objective) => {
			const row = objectiveToRow(objective, userId);
			const { data, error } = await supabase.from("objectives").update(row).eq("id", objective.id).eq("user_id", userId).eq("status", "Pending Approval").select("id");
			if (error) throw error;
			if (!data || data.length === 0) throw new Error("Only objectives in To Do (Pending Approval) can be edited.");
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["objectives", userId] });
		}
	});
}
/**
* Archives an objective: sets is_archived = true, archived_date = today.
* Invalidates ['objectives', userId] on success.
*/
function useArchiveObjective(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		onMutate: async (id) => {
			patchObjectiveCaches(queryClient, userId, (row) => row.id === id ? {
				...row,
				isArchived: true,
				archivedDate: toLocalDateString()
			} : row);
		},
		mutationFn: async (id) => {
			const today = toLocalDateString();
			const { error } = await supabase.from("objectives").update({
				is_archived: true,
				archived_date: today
			}).eq("id", id).eq("user_id", userId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["objectives", userId] });
		}
	});
}
/**
* Restores an archived objective: sets is_archived = false, archived_date = null.
* Invalidates ['objectives', userId] on success.
*/
function useRestoreObjective(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		onMutate: async (id) => {
			patchObjectiveCaches(queryClient, userId, (row) => row.id === id ? {
				...row,
				isArchived: false,
				archivedDate: void 0
			} : row);
		},
		mutationFn: async (id) => {
			const { error } = await supabase.from("objectives").update({
				is_archived: false,
				archived_date: null
			}).eq("id", id).eq("user_id", userId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["objectives", userId] });
		}
	});
}
/**
* Permanently deletes an objective.
* Invalidates ['objectives', userId] on success.
*/
function useDeleteObjective(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (objectiveOrId) => {
			const id = typeof objectiveOrId === "string" ? objectiveOrId : objectiveOrId.id;
			const { error } = await supabase.from("objectives").delete().eq("id", id).eq("user_id", userId);
			if (error) throw error;
			const { error: cleanupError } = await supabase.from("evidence").delete().eq("user_id", userId).eq("source", "Objective").eq("manager_notes", objectiveEvidenceMarker(id));
			if (cleanupError) throw cleanupError;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["objectives", userId] });
			queryClient.invalidateQueries({ queryKey: ["evidence", userId] });
		}
	});
}
var assessmentsKey = (userId) => ["assessments", userId];
/**
* Fetches all assessments for a user with nested categories and questions.
* Key: ['assessments', userId]
* staleTime: 5 minutes (300_000 ms)
*/
function useAssessmentsQuery(userId) {
	return useQuery({
		queryKey: assessmentsKey(userId),
		queryFn: async () => {
			const { data, error } = await supabase.from("assessments").select("*, assessment_categories(*, assessment_questions(*))").eq("user_id", userId).order("date_completed", { ascending: false });
			if (error) throw error;
			return (data ?? []).map((row) => {
				const categories = row.assessment_categories ?? [];
				return assessmentRowsToAssessment(row, categories, categories.flatMap((cat) => cat.assessment_questions ?? []));
			});
		},
		staleTime: 3e5,
		enabled: Boolean(userId)
	});
}
/**
* Persists (creates or updates) a finalized assessment.
*
* Transaction sequence:
*   1. Call assessmentToRows() to flatten the Assessment into DB rows
*   2. Upsert the assessments row with onConflict: 'id'
*   3. For update case: delete existing categories (CASCADE deletes questions), then bulk insert fresh categories
*   4. Bulk insert questions
*
* On any error: toast.error(error.message) and throw (caller keeps wizard open)
* On success: invalidate ['assessments', userId]
*/
function useFinalizeAssessment(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ assessment, userId: explicitUserId }) => {
			const ownerId = (explicitUserId ?? userId ?? "").trim();
			if (!ownerId) throw new Error("Cannot finalize assessment: Unauthenticated user session");
			const { data: authData, error: authError } = await supabase.auth.getUser();
			if (authError) throw authError;
			const sessionUserId = authData.user?.id;
			if (!sessionUserId) throw new Error("Cannot finalize assessment: Unauthenticated user session");
			if (sessionUserId !== ownerId) {
				const { data: relationship, error: relationshipError } = await supabase.from("reporting_relationships").select("manager_id").eq("manager_id", sessionUserId).eq("engineer_id", ownerId).eq("relation_type", "direct_manager").in("status", ["active", "in_handover"]).maybeSingle();
				if (relationshipError) throw relationshipError;
				if (!relationship?.manager_id) throw new Error("Cannot finalize assessment: missing manager relationship for this engineer");
			}
			const { assessment: assessmentRow, categories, questions } = assessmentToRows(assessment, ownerId);
			const { error: upsertError } = await supabase.from("assessments").upsert(assessmentRow, { onConflict: "id" });
			if (upsertError) throw upsertError;
			const { error: deleteError } = await supabase.from("assessment_categories").delete().eq("assessment_id", assessment.id).eq("user_id", ownerId);
			if (deleteError) throw deleteError;
			if (categories.length > 0) {
				const { error: categoriesError } = await supabase.from("assessment_categories").insert(categories);
				if (categoriesError) throw categoriesError;
			}
			if (questions.length > 0) {
				const { error: questionsError } = await supabase.from("assessment_questions").insert(questions);
				if (questionsError) throw questionsError;
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: (_data, variables) => {
			const ownerId = (variables.userId ?? userId ?? "").trim();
			if (ownerId) queryClient.invalidateQueries({ queryKey: assessmentsKey(ownerId) });
			if (userId && ownerId !== userId) queryClient.invalidateQueries({ queryKey: assessmentsKey(userId) });
		}
	});
}
/**
* Updates the one_on_one_topics JSONB column for a specific assessment.
* Invalidates ['assessments', userId] on success.
*/
function useUpdateOneOnOneTopics(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ assessmentId, topics }) => {
			const { error } = await supabase.from("assessments").update({ one_on_one_topics: topics }).eq("id", assessmentId).eq("user_id", userId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: assessmentsKey(userId) });
		}
	});
}
/**
* Deletes an assessment and its nested category/question rows (via DB cascade).
* Invalidates ['assessments', userId] on success.
*/
function useDeleteAssessment(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ assessmentId }) => {
			const { error } = await supabase.from("assessments").delete().eq("id", assessmentId).eq("user_id", userId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: assessmentsKey(userId) });
		}
	});
}
var FrameworkContext = (0, import_react.createContext)(null);
function cleanText(value) {
	return typeof value === "string" ? value.trim() : "";
}
function toCategoryLabel(key) {
	const normalized = key.replace(/[_-]+/g, " ").trim();
	if (!normalized) return "";
	return normalized.split(/\s+/).map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}
function uniqueStrings(values) {
	const seen = /* @__PURE__ */ new Set();
	const unique = [];
	for (const value of values) {
		const next = value.trim();
		if (!next) continue;
		const lower = next.toLowerCase();
		if (seen.has(lower)) continue;
		seen.add(lower);
		unique.push(next);
	}
	return unique;
}
function normalizeCategoryRootMatrix(matrix) {
	const rawCategories = matrix.categories;
	if (!rawCategories || typeof rawCategories !== "object" || Array.isArray(rawCategories)) return null;
	const subcategoriesMap = {};
	const categories = [];
	for (const [rawName, payload] of Object.entries(rawCategories)) {
		const categoryName = cleanText(rawName);
		if (!categoryName) continue;
		categories.push(categoryName);
		if (Array.isArray(payload)) {
			subcategoriesMap[categoryName] = uniqueStrings(payload.map((item) => cleanText(item)));
			continue;
		}
		if (payload && typeof payload === "object") {
			const rawItems = payload.items;
			subcategoriesMap[categoryName] = Array.isArray(rawItems) ? uniqueStrings(rawItems.map((item) => cleanText(item))) : [];
			continue;
		}
		subcategoriesMap[categoryName] = [];
	}
	return {
		categories: uniqueStrings(categories),
		subcategoriesMap
	};
}
function normalizeLevelMatrix(matrix) {
	const levelKeys = [
		"junior",
		"mid",
		"senior"
	];
	if (!levelKeys.some((levelKey) => matrix[levelKey] && typeof matrix[levelKey] === "object" && !Array.isArray(matrix[levelKey]))) return null;
	const merged = {};
	for (const levelKey of levelKeys) {
		const level = matrix[levelKey];
		if (!level || typeof level !== "object" || Array.isArray(level)) continue;
		for (const [rawCategoryKey, payload] of Object.entries(level)) {
			const categoryLabel = toCategoryLabel(rawCategoryKey);
			if (!categoryLabel) continue;
			if (!merged[categoryLabel]) merged[categoryLabel] = [];
			if (!Array.isArray(payload)) continue;
			for (const item of payload) {
				const question = cleanText(item);
				if (question) merged[categoryLabel].push(question);
			}
		}
	}
	const categories = uniqueStrings(Object.keys(merged));
	return {
		categories,
		subcategoriesMap: categories.reduce((acc, category) => {
			acc[category] = uniqueStrings(merged[category] ?? []);
			return acc;
		}, {})
	};
}
function normalizeFramework(framework) {
	const matrix = framework.matrix && typeof framework.matrix === "object" && !Array.isArray(framework.matrix) ? framework.matrix : null;
	if (!matrix) return {
		id: framework.id,
		name: framework.name,
		matrix: framework.matrix,
		categories: [],
		subcategoriesMap: {},
		isSystemDefault: framework.isSystemDefault
	};
	const fromCategoryRoot = normalizeCategoryRootMatrix(matrix);
	if (fromCategoryRoot) return {
		id: framework.id,
		name: framework.name,
		matrix: framework.matrix,
		categories: fromCategoryRoot.categories,
		subcategoriesMap: fromCategoryRoot.subcategoriesMap,
		isSystemDefault: framework.isSystemDefault
	};
	const fromLevelRoot = normalizeLevelMatrix(matrix);
	if (fromLevelRoot) return {
		id: framework.id,
		name: framework.name,
		matrix: framework.matrix,
		categories: fromLevelRoot.categories,
		subcategoriesMap: fromLevelRoot.subcategoriesMap,
		isSystemDefault: framework.isSystemDefault
	};
	return {
		id: framework.id,
		name: framework.name,
		matrix: framework.matrix,
		categories: [],
		subcategoriesMap: {},
		isSystemDefault: framework.isSystemDefault
	};
}
function FrameworkProvider({ children }) {
	const { userId } = useAuth();
	const { data: currentFramework = null, isLoading } = useQuery({
		queryKey: ["active-framework-context", userId],
		enabled: Boolean(userId),
		queryFn: async () => {
			if (!userId) return null;
			const { data: profile, error: profileError } = await supabase.from("profiles").select("active_framework_id").eq("id", userId).maybeSingle();
			if (profileError) throw profileError;
			const activeFrameworkId = profile?.active_framework_id ?? null;
			if (activeFrameworkId) {
				const { data: activeFramework, error: activeFrameworkError } = await supabase.from("competency_frameworks").select("id,name,matrix,is_system_default").eq("id", activeFrameworkId).maybeSingle();
				if (activeFrameworkError) throw activeFrameworkError;
				if (activeFramework) return normalizeFramework({
					id: cleanText(activeFramework.id),
					name: cleanText(activeFramework.name) || "Unnamed Framework",
					matrix: activeFramework.matrix,
					isSystemDefault: Boolean(activeFramework.is_system_default)
				});
			}
			const { data: fallbackFramework, error: fallbackError } = await supabase.from("competency_frameworks").select("id,name,matrix,is_system_default").or(`is_system_default.eq.true,user_id.eq.${userId}`).order("is_system_default", { ascending: false }).order("created_at", { ascending: false }).limit(1).maybeSingle();
			if (fallbackError) throw fallbackError;
			if (!fallbackFramework) return null;
			return normalizeFramework({
				id: cleanText(fallbackFramework.id),
				name: cleanText(fallbackFramework.name) || "Unnamed Framework",
				matrix: fallbackFramework.matrix,
				isSystemDefault: Boolean(fallbackFramework.is_system_default)
			});
		}
	});
	const categories = (0, import_react.useMemo)(() => currentFramework?.categories ?? [], [currentFramework]);
	const getQuestionsForCategory = (0, import_react.useCallback)((categoryName) => currentFramework?.subcategoriesMap[categoryName] ?? [], [currentFramework]);
	const value = (0, import_react.useMemo)(() => ({
		currentFramework,
		categories,
		getQuestionsForCategory,
		isLoading
	}), [
		categories,
		currentFramework,
		getQuestionsForCategory,
		isLoading
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FrameworkContext.Provider, {
		value,
		children
	});
}
function useFrameworkContext() {
	const context = (0, import_react.useContext)(FrameworkContext);
	if (!context) throw new Error("useFrameworkContext must be used inside <FrameworkProvider>.");
	return context;
}
function useFramework() {
	return useFrameworkContext();
}
function ManagerActionsPanel({ engineerId, currentUserRole }) {
	const { userId } = useAuth();
	const [activeTab, setActiveTab] = (0, import_react.useState)("feedback");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [feedbackRows, setFeedbackRows] = (0, import_react.useState)([]);
	const [feedbackDraft, setFeedbackDraft] = (0, import_react.useState)("");
	const [resourceRows, setResourceRows] = (0, import_react.useState)([]);
	const [resourceTitle, setResourceTitle] = (0, import_react.useState)("");
	const [resourceUrl, setResourceUrl] = (0, import_react.useState)("");
	const [resourceDescription, setResourceDescription] = (0, import_react.useState)("");
	const [businessCase, setBusinessCase] = (0, import_react.useState)(null);
	const [targetRoleTitle, setTargetRoleTitle] = (0, import_react.useState)("");
	const [executiveSummary, setExecutiveSummary] = (0, import_react.useState)("");
	const [competencyGainsSummary, setCompetencyGainsSummary] = (0, import_react.useState)("");
	const [businessCaseStatus, setBusinessCaseStatus] = (0, import_react.useState)("draft");
	const [comments, setComments] = (0, import_react.useState)([]);
	const [commentDraft, setCommentDraft] = (0, import_react.useState)("");
	const [authorNameById, setAuthorNameById] = (0, import_react.useState)({});
	const canWriteManagerTabs = currentUserRole === "manager" || currentUserRole === "both";
	const showCommentModule = currentUserRole === "skip_level" || currentUserRole === "both";
	const tabConfig = (0, import_react.useMemo)(() => [
		{
			id: "feedback",
			label: "Feedback"
		},
		{
			id: "resources",
			label: "Curated Resources"
		},
		{
			id: "business_case",
			label: "Business Case"
		}
	], []);
	(0, import_react.useEffect)(() => {
		let active = true;
		async function loadPanelData() {
			if (!engineerId) return;
			setLoading(true);
			try {
				const [feedbackResponse, resourcesResponse, businessCaseResponse] = await Promise.all([
					supabase.from("manager_feedback").select("id, manager_id, content, created_at").eq("engineer_id", engineerId).order("created_at", { ascending: false }),
					supabase.from("manager_resources").select("id, title, url, description, created_at").eq("engineer_id", engineerId).order("created_at", { ascending: false }),
					supabase.from("business_cases").select("id, target_role_title, executive_summary, competency_gains_summary, status").eq("engineer_id", engineerId).order("updated_at", { ascending: false }).limit(1).maybeSingle()
				]);
				if (!active) return;
				if (feedbackResponse.error) throw feedbackResponse.error;
				if (resourcesResponse.error) throw resourcesResponse.error;
				if (businessCaseResponse.error) throw businessCaseResponse.error;
				const nextFeedback = feedbackResponse.data ?? [];
				const nextResources = resourcesResponse.data ?? [];
				const nextBusinessCase = businessCaseResponse.data ?? null;
				setFeedbackRows(nextFeedback);
				setResourceRows(nextResources);
				setBusinessCase(nextBusinessCase);
				setTargetRoleTitle(nextBusinessCase?.target_role_title ?? "");
				setExecutiveSummary(nextBusinessCase?.executive_summary ?? "");
				setCompetencyGainsSummary(nextBusinessCase?.competency_gains_summary ?? "");
				setBusinessCaseStatus(nextBusinessCase?.status === "submitted" || nextBusinessCase?.status === "approved" ? "submitted" : "draft");
				if (nextBusinessCase?.id) {
					const commentsResponse = await supabase.from("business_case_comments").select("id, author_id, comment, created_at").eq("business_case_id", nextBusinessCase.id).order("created_at", { ascending: false });
					if (commentsResponse.error) throw commentsResponse.error;
					const nextComments = commentsResponse.data ?? [];
					if (!active) return;
					setComments(nextComments);
					const authorIds = Array.from(new Set(nextComments.map((item) => item.author_id)));
					if (authorIds.length > 0) {
						const authorProfiles = await supabase.from("profiles").select("id, full_name").in("id", authorIds);
						if (authorProfiles.error) throw authorProfiles.error;
						if (!active) return;
						setAuthorNameById((authorProfiles.data ?? []).reduce((acc, profile) => {
							acc[profile.id] = profile.full_name?.trim() || "Manager";
							return acc;
						}, {}));
					} else setAuthorNameById({});
				} else {
					setComments([]);
					setAuthorNameById({});
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load manager collaboration data.";
				toast.error(message);
			} finally {
				if (active) setLoading(false);
			}
		}
		loadPanelData();
		return () => {
			active = false;
		};
	}, [engineerId]);
	async function saveFeedback() {
		if (!userId || !feedbackDraft.trim()) return;
		const feedbackContent = feedbackDraft.trim();
		const { error } = await supabase.from("manager_feedback").insert({
			engineer_id: engineerId,
			manager_id: userId,
			content: feedbackContent
		});
		if (error) {
			toast.error(error.message);
			return;
		}
		await sendNotification({ data: {
			userId: engineerId,
			type: "feedback",
			title: "Manager added feedback",
			description: `Your manager left notes: "${feedbackContent.slice(0, 96)}${feedbackContent.length > 96 ? "..." : ""}"`
		} });
		setFeedbackDraft("");
		toast.success("Feedback saved");
		const { data } = await supabase.from("manager_feedback").select("id, manager_id, content, created_at").eq("engineer_id", engineerId).order("created_at", { ascending: false });
		setFeedbackRows(data ?? []);
	}
	async function saveResource() {
		if (!userId || !resourceTitle.trim() || !resourceUrl.trim()) return;
		const { error } = await supabase.from("manager_resources").insert({
			engineer_id: engineerId,
			manager_id: userId,
			title: resourceTitle.trim(),
			url: resourceUrl.trim(),
			description: resourceDescription.trim() || null
		});
		if (error) {
			toast.error(error.message);
			return;
		}
		setResourceTitle("");
		setResourceUrl("");
		setResourceDescription("");
		toast.success("Resource pinned");
		const { data } = await supabase.from("manager_resources").select("id, title, url, description, created_at").eq("engineer_id", engineerId).order("created_at", { ascending: false });
		setResourceRows(data ?? []);
	}
	async function saveBusinessCase() {
		if (!userId || !canWriteManagerTabs || !targetRoleTitle.trim()) return;
		if (businessCase?.id) {
			const { error } = await supabase.from("business_cases").update({
				target_role_title: targetRoleTitle.trim(),
				executive_summary: executiveSummary.trim() || null,
				competency_gains_summary: competencyGainsSummary.trim() || null,
				status: businessCaseStatus,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", businessCase.id);
			if (error) {
				toast.error(error.message);
				return;
			}
		} else {
			const { error } = await supabase.from("business_cases").insert({
				engineer_id: engineerId,
				manager_id: userId,
				target_role_title: targetRoleTitle.trim(),
				executive_summary: executiveSummary.trim() || null,
				competency_gains_summary: competencyGainsSummary.trim() || null,
				status: businessCaseStatus
			});
			if (error) {
				toast.error(error.message);
				return;
			}
		}
		toast.success("Business case saved");
	}
	async function addBusinessCaseComment() {
		if (!businessCase?.id || !commentDraft.trim()) return;
		const { error } = await supabase.from("business_case_comments").insert({
			business_case_id: businessCase.id,
			author_id: userId,
			comment: commentDraft.trim()
		});
		if (error) {
			toast.error(error.message);
			return;
		}
		setCommentDraft("");
		toast.success("Comment added");
		const { data } = await supabase.from("business_case_comments").select("id, author_id, comment, created_at").eq("business_case_id", businessCase.id).order("created_at", { ascending: false });
		setComments(data ?? []);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: tabConfig.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setActiveTab(tab.id),
					className: `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-slate-200 text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"}`,
					children: tab.label
				}, tab.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "border-slate-100 my-4" }),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-slate-500",
				children: "Loading manager collaboration panel..."
			}) : null,
			!loading && activeTab === "feedback" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: feedbackRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-slate-500",
						children: "No feedback logged yet."
					}) : feedbackRows.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-slate-200 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-slate-700 whitespace-pre-wrap",
							children: item.content
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-slate-400",
							children: new Date(item.created_at).toLocaleString()
						})]
					}, item.id))
				}), canWriteManagerTabs && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "border-slate-100 my-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: feedbackDraft,
						onChange: (event) => setFeedbackDraft(event.target.value),
						placeholder: "Provide structured technical feedback. What went well? What can be improved? What are the next steps?",
						className: "w-full min-h-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void saveFeedback(),
						className: "inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors",
						children: "Save Feedback"
					})
				] })]
			}),
			!loading && activeTab === "resources" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-2",
					children: resourceRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-slate-500 md:col-span-2",
						children: "No curated resources yet."
					}) : resourceRows.map((resource) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-slate-200 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: resource.url,
							target: "_blank",
							rel: "noreferrer",
							className: "text-sm font-semibold text-indigo-700 hover:underline",
							children: resource.title
						}), resource.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-slate-600",
							children: resource.description
						}) : null]
					}, resource.id))
				}), canWriteManagerTabs && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "border-slate-100 my-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 md:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: resourceTitle,
								onChange: (event) => setResourceTitle(event.target.value),
								placeholder: "Title",
								className: "h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: resourceUrl,
								onChange: (event) => setResourceUrl(event.target.value),
								placeholder: "URL",
								className: "h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: resourceDescription,
								onChange: (event) => setResourceDescription(event.target.value),
								placeholder: "Description",
								className: "min-h-[90px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all md:col-span-2"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void saveResource(),
						className: "inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors",
						children: "Pin Resource"
					})
				] })]
			}),
			!loading && activeTab === "business_case" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: targetRoleTitle,
							onChange: (event) => setTargetRoleTitle(event.target.value),
							readOnly: !canWriteManagerTabs,
							placeholder: "Target Role Title",
							className: "h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: executiveSummary,
							onChange: (event) => setExecutiveSummary(event.target.value),
							readOnly: !canWriteManagerTabs,
							placeholder: "Executive Summary",
							className: "min-h-[110px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: competencyGainsSummary,
							onChange: (event) => setCompetencyGainsSummary(event.target.value),
							readOnly: !canWriteManagerTabs,
							placeholder: "Competency Gains Summary",
							className: "min-h-[110px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						}),
						canWriteManagerTabs && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: businessCaseStatus,
								onChange: (event) => setBusinessCaseStatus(event.target.value === "submitted" ? "submitted" : "draft"),
								className: "h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "draft",
									children: "draft"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "submitted",
									children: "submitted"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void saveBusinessCase(),
								className: "inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors",
								children: "Save Business Case"
							})]
						})
					]
				}), showCommentModule && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "border-slate-100 my-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-sm font-semibold text-slate-900",
							children: "Business Case Comments"
						}),
						comments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-slate-500",
							children: "No comments yet."
						}) : comments.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-slate-200 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-slate-500",
								children: [
									authorNameById[item.author_id] ?? "Manager",
									" ·",
									" ",
									new Date(item.created_at).toLocaleString()
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-slate-700 whitespace-pre-wrap",
								children: item.comment
							})]
						}, item.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: commentDraft,
							onChange: (event) => setCommentDraft(event.target.value),
							placeholder: "Endorsed. John meets all performance criteria for Senior SWE role transitions.",
							className: "w-full min-h-[100px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void addBusinessCaseComment(),
							disabled: !businessCase?.id,
							className: "inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
							children: "Add Comment"
						})
					]
				})] })]
			})
		]
	});
}
var C = {
	bg: "#FAFBFC",
	card: "#FFFFFF",
	border: "#DFE1E6",
	borderStrong: "#C1C7D0",
	primary: "#0052CC",
	primaryHover: "#0065FF",
	primarySoft: "#DEEBFF",
	navy: "#172B4D",
	slate: "#42526E",
	subtle: "#6B778C",
	green: "#36B37E",
	greenSoft: "#E3FCEF",
	amber: "#FFAB00",
	amberSoft: "#FFFAE6",
	red: "#DE350B"
};
var BRAND_ICON_SRC = "/icons/icon128.png?v=20260621";
function BrandMark({ size = 32 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: BRAND_ICON_SRC,
		alt: "Evitrace",
		width: size,
		height: size,
		className: "rounded object-cover shrink-0"
	});
}
function Card({ children, className = "", ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		...rest,
		className: `bg-white border rounded-md shadow-sm ${className}`,
		style: { borderColor: C.border },
		children
	});
}
function PrimaryBtn({ children, className = "", ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...rest,
		className: `inline-flex items-center gap-2 px-3 h-9 text-sm font-medium text-white rounded transition-colors ${className}`,
		style: { background: C.primary },
		onMouseEnter: (e) => e.currentTarget.style.background = C.primaryHover,
		onMouseLeave: (e) => e.currentTarget.style.background = C.primary,
		children
	});
}
function GhostBtn({ children, className = "", ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...rest,
		className: `inline-flex items-center gap-2 px-3 h-9 text-sm font-medium rounded transition-colors hover:bg-[#F4F5F7] ${className}`,
		style: { color: C.slate },
		children
	});
}
function Badge({ tone = "neutral", children, icon }) {
	const s = {
		neutral: {
			bg: "#F4F5F7",
			fg: C.slate
		},
		success: {
			bg: C.greenSoft,
			fg: "#006644"
		},
		warning: {
			bg: C.amberSoft,
			fg: "#974F00"
		},
		info: {
			bg: C.primarySoft,
			fg: C.primary
		},
		danger: {
			bg: "#FFEBE6",
			fg: "#BF2600"
		}
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 px-2 h-6 text-[11px] font-semibold uppercase tracking-wide rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-full",
		style: {
			background: s.bg,
			color: s.fg
		},
		children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children
		})]
	});
}
var BitbucketIcon = ({ size = 14 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "currentColor",
	"aria-hidden": "true",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.65 3a.65.65 0 0 0-.65.76l2.72 16.5a.88.88 0 0 0 .87.74h13.04a.65.65 0 0 0 .65-.55l2.72-16.69a.65.65 0 0 0-.65-.76zm11.46 11.85h-4.21l-1.14-5.95h6.36z" })
});
var JiraIcon = ({ size = 14 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	width: size,
	height: size,
	viewBox: "0 0 24 24",
	fill: "currentColor",
	"aria-hidden": "true",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M11.53 2a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V2.7a.7.7 0 0 0-.7-.7zM6.18 7.34a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V8.04a.7.7 0 0 0-.7-.7zM.84 12.66a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V13.36a.7.7 0 0 0-.7-.7z",
		transform: "scale(0.85)"
	})
});
var ConfluenceIcon = BookOpen;
function SourceIcon({ source, size = 14 }) {
	const s = source.toLowerCase();
	const cls = "shrink-0";
	if (s.includes("bitbucket")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cls,
		style: { color: "#2684FF" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BitbucketIcon, { size })
	});
	if (s.includes("jira")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cls,
		style: { color: "#2684FF" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JiraIcon, { size })
	});
	if (s.includes("github")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, {
		size,
		className: cls,
		style: { color: "#24292F" }
	});
	if (s.includes("gitlab")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gitlab, {
		size,
		className: cls,
		style: { color: "#FC6D26" }
	});
	if (s.includes("slack")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slack, {
		size,
		className: cls,
		style: { color: "#4A154B" }
	});
	if (s.includes("teams") || s.includes("microsoft")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, {
		size,
		className: cls,
		style: { color: "#5059C9" }
	});
	if (s.includes("excel") || s.includes("sheet")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, {
		size,
		className: cls,
		style: { color: "#21A366" }
	});
	if (s.includes("powerpoint") || s.includes("slides")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presentation, {
		size,
		className: cls,
		style: { color: "#D24726" }
	});
	if (s.includes("confluence")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfluenceIcon, {
		size,
		className: cls,
		style: { color: "#2684FF" }
	});
	if (s.includes("trello")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trello, {
		size,
		className: cls,
		style: { color: "#0079BF" }
	});
	if (s.includes("figma")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Figma, {
		size,
		className: cls,
		style: { color: "#A259FF" }
	});
	if (s.includes("git")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitBranch, {
		size,
		className: cls,
		style: { color: C.slate }
	});
	if (s.includes("word") || s.includes("doc")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
		size,
		className: cls,
		style: { color: "#2B579A" }
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
		size,
		className: cls,
		style: { color: C.slate }
	});
}
function SourceChip({ source }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1.5 px-2 h-6 text-[11px] font-semibold rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-full",
		style: {
			background: "#F4F5F7",
			color: C.slate
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceIcon, {
			source,
			size: 12
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: source
		})]
	});
}
function Input({ icon, className = "", ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex items-center",
		children: [icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute left-2.5 pointer-events-none",
			style: { color: C.subtle },
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			...rest,
			className: `h-9 ${icon ? "pl-8" : "pl-3"} pr-3 w-full text-sm rounded border bg-[#F4F5F7] focus:bg-white outline-none transition-all focus:ring-2 ${className}`,
			style: {
				borderColor: C.border,
				color: C.navy
			},
			onFocus: (e) => {
				e.currentTarget.style.background = "#fff";
				e.currentTarget.style.borderColor = C.primary;
				e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}`;
			},
			onBlur: (e) => {
				e.currentTarget.style.background = "#F4F5F7";
				e.currentTarget.style.borderColor = C.border;
				e.currentTarget.style.boxShadow = "none";
			}
		})]
	});
}
function Select({ icon, children, ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex items-center w-full",
		children: [
			icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute left-2.5 pointer-events-none",
				style: { color: C.subtle },
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				...rest,
				className: `h-9 w-full ${icon ? "pl-8" : "pl-3"} pr-8 text-sm rounded border bg-[#F4F5F7] hover:bg-white outline-none appearance-none cursor-pointer transition-all`,
				style: {
					borderColor: C.border,
					color: C.navy
				},
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
				size: 14,
				className: "absolute right-2.5 pointer-events-none",
				style: { color: C.subtle }
			})
		]
	});
}
function Dropdown({ value, onChange, options, placeholder = "Select…", disabled = false }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const handle = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", handle);
		return () => document.removeEventListener("mousedown", handle);
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "relative w-full max-w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled,
				onClick: () => setOpen((o) => !o),
				className: "w-full max-w-full min-w-0 h-auto py-2 pl-3 pr-8 text-sm rounded border bg-[#F4F5F7] hover:bg-white outline-none focus:ring-2 text-left whitespace-normal break-words leading-snug transition-all disabled:opacity-50",
				style: {
					borderColor: C.border,
					color: C.navy
				},
				children: value || placeholder
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
				size: 14,
				className: "absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none",
				style: { color: C.subtle }
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute z-20 mt-1 w-full max-w-full rounded border bg-white shadow-lg overflow-y-auto max-h-60",
				style: { borderColor: C.border },
				children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						onChange(opt);
						setOpen(false);
					},
					className: "w-full px-3 py-2 text-left text-sm whitespace-normal break-words leading-snug hover:bg-[#F4F5F7]",
					style: { color: C.navy },
					children: opt
				}, opt))
			})
		]
	});
}
function Field({ label, children, required, optional, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between mb-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs font-semibold",
					style: { color: C.slate },
					children: [label, required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-0.5",
						style: { color: "#DE350B" },
						children: "*"
					})]
				}), optional && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] tracking-wide",
					style: { color: C.subtle },
					children: "(optional)"
				})]
			}),
			children,
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] mt-1",
				style: { color: C.subtle },
				children: hint
			})
		]
	});
}
function ConfirmDialog({ title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", destructive, onConfirm, onCancel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backdrop$2, {
		onClose: onCancel,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				scale: .96
			},
			animate: {
				opacity: 1,
				scale: 1
			},
			exit: {
				opacity: 0,
				scale: .96
			},
			transition: { duration: .15 },
			className: "bg-white rounded-lg shadow-2xl w-full max-w-md border",
			style: { borderColor: C.border },
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [destructive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-red-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
							size: 18,
							className: "text-red-600"
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-amber-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							size: 18,
							className: "text-amber-600"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-base font-bold",
							style: { color: C.navy },
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm mt-1.5 leading-relaxed",
							style: { color: C.slate },
							children: description
						})]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 py-3 border-t flex items-center justify-end gap-2",
				style: {
					borderColor: C.border,
					background: C.bg
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					onClick: onCancel,
					children: cancelLabel
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onConfirm,
					className: "px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors",
					style: { background: destructive ? C.red : C.primary },
					children: confirmLabel
				})]
			})]
		})
	});
}
function Backdrop$2({ children, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: .15 },
		className: "fixed inset-0 z-50 flex items-center justify-center p-6",
		style: {
			background: "rgba(9, 30, 66, 0.54)",
			backdropFilter: "blur(2px)"
		},
		onClick: onClose,
		children
	});
}
function Textarea$2({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		...props,
		className: `w-full min-h-[150px] resize-y rounded border bg-[#F4F5F7] p-3 text-sm leading-relaxed outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${className ?? ""}`,
		style: {
			borderColor: C.border,
			color: C.navy,
			overflowWrap: "anywhere"
		}
	});
}
function hasPendingWorkspaceInviteHash() {
	if (typeof window === "undefined") return false;
	const value = window.localStorage.getItem(PENDING_WORKSPACE_INVITE_HASH_KEY);
	return Boolean(value && value.trim().length > 0);
}
function redirectAfterAuthSuccess() {
	if (hasPendingWorkspaceInviteHash()) {
		window.location.href = "/";
		return;
	}
	const pendingInvite = sessionStorage.getItem(PENDING_INVITE_CODE_KEY);
	if (pendingInvite) {
		sessionStorage.removeItem(PENDING_INVITE_CODE_KEY);
		window.location.href = `/invite?code=${encodeURIComponent(pendingInvite)}`;
	} else window.location.href = "/";
}
function SsoButton({ provider }) {
	const { signInWithGoogle, signInWithMicrosoft } = useAuth();
	const letter = provider === "Google" ? "G" : "M";
	const bg = provider === "Google" ? "#EA4335" : "#0078D4";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => provider === "Google" ? signInWithGoogle() : signInWithMicrosoft(),
		className: "w-full h-10 px-3 rounded border flex items-center justify-center gap-2 text-sm font-semibold hover:bg-[#F4F5F7] transition-colors",
		style: {
			borderColor: C.border,
			color: C.navy,
			background: "#fff"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white",
				style: { background: bg },
				children: letter
			}),
			"Continue with ",
			provider
		]
	});
}
function SigninForm({ onSwitch, notice }) {
	const { signin } = useAuth();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(null);
	async function submit(e) {
		e.preventDefault();
		setErr(null);
		if (!email || !password) {
			setErr("Enter your email and password to continue.");
			return;
		}
		if (!await signin(email, password)) {
			setErr("Invalid email or password. Please try again.");
			return;
		}
		redirectAfterAuthSuccess();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-7",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xl font-bold",
				style: { color: C.navy },
				children: "Welcome back"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs mt-1",
				style: { color: C.subtle },
				children: "Sign in to track your evidence and competencies."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SsoButton, { provider: "Google" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SsoButton, { provider: "Microsoft" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 my-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 h-px",
						style: { background: C.border }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] uppercase tracking-wider",
						style: { color: C.subtle },
						children: "or"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 h-px",
						style: { background: C.border }
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-4",
				children: [
					notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "status",
						"aria-live": "polite",
						className: "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
						style: {
							borderColor: "#ABF5D1",
							background: "#E3FCEF",
							color: "#006644"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, {
							size: 14,
							className: "mt-0.5 shrink-0"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: notice })]
					}),
					err && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "alert",
						"aria-live": "polite",
						className: "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
						style: {
							borderColor: "#F5BCB1",
							background: "#FFEBE6",
							color: "#BF2600"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							size: 14,
							className: "mt-0.5 shrink-0"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: err })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							placeholder: "you@company.com",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 14 })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Password",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "Your password",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { size: 14 })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
						type: "submit",
						className: "w-full justify-center mt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { size: 14 }), "Sign in"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-center mt-4",
				style: { color: C.subtle },
				children: [
					"New to Evitrace?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onSwitch,
						className: "font-semibold",
						style: { color: C.primary },
						children: "Create an account"
					})
				]
			})
		]
	});
}
function SignupForm({ onSwitch }) {
	const { signup } = useAuth();
	const isManagerOnboarding = hasPendingWorkspaceInviteHash() || Boolean(sessionStorage.getItem("pending_invite_code"));
	const [f, setF] = (0, import_react.useState)({
		fullName: "",
		email: "",
		password: "",
		currentLevel: "",
		targetLevel: "",
		team: "",
		manager: "",
		managerEmail: "",
		skipLevel: ""
	});
	const [err, setErr] = (0, import_react.useState)(null);
	const upd = (k, v) => setF((p) => ({
		...p,
		[k]: v
	}));
	async function submit(e) {
		e.preventDefault();
		setErr(null);
		const required = isManagerOnboarding ? [
			"fullName",
			"email",
			"password",
			"currentLevel"
		] : [
			"fullName",
			"email",
			"password",
			"currentLevel",
			"targetLevel",
			"team"
		];
		for (const k of required) if (!String(f[k]).trim()) {
			setErr("Please complete all required fields marked with *.");
			return;
		}
		try {
			const unifiedCurrentLevel = f.currentLevel.trim();
			if (await signup({
				...f,
				currentLevel: unifiedCurrentLevel,
				jobTitle: unifiedCurrentLevel
			})) {
				if (isManagerOnboarding) {
					redirectAfterAuthSuccess();
					return;
				}
				const { data: { session } } = await supabase.auth.getSession();
				if (session?.access_token) {
					redirectAfterAuthSuccess();
					return;
				}
				onSwitch("Account created. Please verify your email, then sign in.");
			}
		} catch {
			setErr("Something went wrong while creating your account. Please try again.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-7 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xl font-bold",
				style: { color: C.navy },
				children: isManagerOnboarding ? "Complete Your Manager Profile" : "Create your account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs mt-1",
				style: { color: C.subtle },
				children: isManagerOnboarding ? "Set your professional title to connect with your engineer's workspace metrics." : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"Fields marked ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { color: "#DE350B" },
						children: "*"
					}),
					" are required. You can complete optional fields later in Settings."
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SsoButton, { provider: "Google" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SsoButton, { provider: "Microsoft" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 my-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 h-px",
						style: { background: C.border }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] uppercase tracking-wider",
						style: { color: C.subtle },
						children: "or sign up with email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 h-px",
						style: { background: C.border }
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-6",
				children: [
					err && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "alert",
						"aria-live": "polite",
						className: "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
						style: {
							borderColor: "#F5BCB1",
							background: "#FFEBE6",
							color: "#BF2600"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							size: 14,
							className: "mt-0.5 shrink-0"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: err })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-bold uppercase tracking-wider mb-3",
						style: { color: C.subtle },
						children: "Account"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Full name",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: f.fullName,
									onChange: (e) => upd("fullName", e.target.value),
									placeholder: "Jordan Mills",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { size: 14 })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Work email",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									value: f.email,
									onChange: (e) => upd("email", e.target.value),
									placeholder: "you@company.com",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 14 })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Password",
									required: true,
									hint: "At least 8 characters.",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "password",
										value: f.password,
										onChange: (e) => upd("password", e.target.value),
										placeholder: "Create a password",
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { size: 14 })
									})
								})
							})
						]
					})] }),
					isManagerOnboarding ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-bold uppercase tracking-wider mb-3",
						style: { color: C.subtle },
						children: "Manager Profile"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Corporate title",
							required: true,
							hint: "For example: \"Engineering Manager\", \"Director of Engineering\", or \"VP of Engineering\".",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: f.currentLevel,
								onChange: (e) => upd("currentLevel", e.target.value),
								placeholder: "Engineering Manager"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Management track level",
							optional: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: f.targetLevel,
								onChange: (e) => upd("targetLevel", e.target.value),
								placeholder: "M2 (optional)"
							})
						})]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-bold uppercase tracking-wider mb-3",
						style: { color: C.subtle },
						children: "Role & Levels"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Current Job Title / Level",
								required: true,
								hint: "Your current role/title in your organization (e.g. Senior Engineer, L3).",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: f.currentLevel,
									onChange: (e) => upd("currentLevel", e.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Select your current level"
									}), LEVEL_OPTIONS.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: level,
										children: level
									}, level))]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Target level",
								required: true,
								hint: "The next level you're aiming for.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: f.targetLevel,
									onChange: (e) => upd("targetLevel", e.target.value),
									placeholder: "Staff Engineer"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Business unit / Team",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: f.team,
										onChange: (e) => upd("team", e.target.value),
										placeholder: "Payments Platform",
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { size: 14 })
									})
								})
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
						type: "submit",
						className: "w-full justify-center",
						children: isManagerOnboarding ? "Complete Setup & Launch Workspace" : "Create account"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-center mt-5",
				style: { color: C.subtle },
				children: [
					"Already have an account?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onSwitch(),
						className: "font-semibold",
						style: { color: C.primary },
						children: "Sign in"
					})
				]
			})
		]
	});
}
function AuthScreens() {
	const [mode, setMode] = (0, import_react.useState)(() => hasPendingWorkspaceInviteHash() ? "signup" : "signin");
	const [signinNotice, setSigninNotice] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center px-4 py-10",
		style: {
			background: C.bg,
			color: C.navy,
			fontFamily: "Inter, system-ui, sans-serif"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `w-full ${mode === "signup" ? "max-w-2xl" : "max-w-md"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-center gap-2 mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { size: 36 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "leading-tight",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-base font-bold tracking-tight",
						style: { color: C.navy },
						children: "Evitrace"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] uppercase tracking-wider",
						style: { color: C.subtle },
						children: "Performance Intelligence"
					})]
				})]
			}), mode === "signin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SigninForm, {
				notice: signinNotice,
				onSwitch: () => {
					setSigninNotice(null);
					setMode("signup");
				}
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignupForm, { onSwitch: (notice) => {
				setSigninNotice(notice ?? null);
				setMode("signin");
			} })]
		})
	});
}
function AppGate({ EvitraceApp }) {
	const { user, loading } = useAuth();
	(0, import_react.useEffect)(() => {
		if (loading || user) return;
		if (window.location.pathname === "/") return;
		window.location.replace("/");
	}, [loading, user]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		if (hasPendingWorkspaceInviteHash()) return;
		const pendingInvite = sessionStorage.getItem(PENDING_INVITE_CODE_KEY);
		if (!pendingInvite) return;
		sessionStorage.removeItem(PENDING_INVITE_CODE_KEY);
		window.location.href = `/invite?code=${encodeURIComponent(pendingInvite)}`;
	}, [user]);
	if (loading) return null;
	return user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvitraceApp, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthScreens, {});
}
function HomeAuthApp({ EvitraceApp }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FrameworkProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppGate, { EvitraceApp }) }) });
}
function useManagerRelationships(userId) {
	const [managedEngineers, setManagedEngineers] = (0, import_react.useState)([]);
	const [isLoadingManagedEngineers, setIsLoadingManagedEngineers] = (0, import_react.useState)(true);
	const [activeView, setActiveView] = (0, import_react.useState)("directory");
	const [managerRelationshipsRefreshNonce, setManagerRelationshipsRefreshNonce] = (0, import_react.useState)(0);
	const [handoverNotes, setHandoverNotes] = (0, import_react.useState)("");
	const [isSigningOffTransfer, setIsSigningOffTransfer] = (0, import_react.useState)(false);
	const [hasManagerOnboardingContext, setHasManagerOnboardingContext] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		setHasManagerOnboardingContext(sessionStorage.getItem(MANAGER_ONBOARDING_CONTEXT_KEY) === "1");
	}, []);
	(0, import_react.useEffect)(() => {
		let active = true;
		async function loadManagedEngineers() {
			if (active) setIsLoadingManagedEngineers(true);
			try {
				if (!userId) {
					if (!active) return;
					setManagedEngineers([]);
					return;
				}
				const { data: relationships, error: relationshipsError } = await supabase.from("reporting_relationships").select("engineer_id, status, relation_type").eq("manager_id", userId).in("status", ["active", "in_handover"]);
				if (relationshipsError) {
					if (active) setManagedEngineers([]);
					return acc;
				}
				const relationshipRows = relationships ?? [];
				const statusByEngineer = relationshipRows.reduce((acc, row) => {
					if (!acc[row.engineer_id] || row.status === "in_handover") acc[row.engineer_id] = row.status;
					return acc;
				}, {});
				const rolesByEngineer = relationshipRows.reduce((acc, row) => {
					if (!acc[row.engineer_id]) acc[row.engineer_id] = {
						hasDirectManager: false,
						hasSkipLevel: false
					};
					if (row.relation_type === "direct_manager") acc[row.engineer_id].hasDirectManager = true;
					if (row.relation_type === "skip_level") acc[row.engineer_id].hasSkipLevel = true;
					return acc;
				}, {});
				const outgoingDirectHandoverByEngineer = relationshipRows.reduce((acc, row) => {
					if (row.relation_type === "direct_manager" && row.status === "in_handover") acc[row.engineer_id] = true;
					return acc;
				}, {});
				const engineerIds = Object.keys(statusByEngineer);
				if (engineerIds.length === 0) {
					if (!active) return;
					setManagedEngineers([]);
					return;
				}
				const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, full_name, email").in("id", engineerIds);
				const profileRows = (profiles ?? []).reduce((acc, row) => {
					acc[row.id] = {
						full_name: row.full_name,
						email: row.email
					};
					return acc;
				}, {});
				const nextManaged = engineerIds.map((engineerId) => {
					const profile = profileRows[engineerId];
					return {
						id: engineerId,
						fullName: profile?.full_name?.trim() || "Connected Engineer",
						email: profile?.email?.trim() || "Profile visibility pending",
						status: statusByEngineer[engineerId] ?? "active",
						currentUserRole: rolesByEngineer[engineerId]?.hasDirectManager ? rolesByEngineer[engineerId]?.hasSkipLevel ? "both" : "manager" : "skip_level",
						isOutgoingDirectManagerInHandover: Boolean(outgoingDirectHandoverByEngineer[engineerId])
					};
				}).sort((a, b) => a.fullName.localeCompare(b.fullName));
				if (profilesError) console.warn("[workspace] unable to load managed engineer profiles; using fallback identity rows", { message: profilesError.message });
				if (!active) return;
				setManagedEngineers(nextManaged);
			} catch (error) {
				console.error("[workspace] failed to load manager relationships:", error);
				if (active) setManagedEngineers([]);
			} finally {
				if (active) setIsLoadingManagedEngineers(false);
			}
		}
		loadManagedEngineers();
		return () => {
			active = false;
		};
	}, [userId, managerRelationshipsRefreshNonce]);
	(0, import_react.useEffect)(() => {
		if (managedEngineers.length === 0) setActiveView("directory");
	}, [managedEngineers.length]);
	(0, import_react.useEffect)(() => {
		if (managedEngineers.length === 0) return;
		setHasManagerOnboardingContext(false);
		sessionStorage.removeItem(MANAGER_ONBOARDING_CONTEXT_KEY);
	}, [managedEngineers.length]);
	return {
		managedEngineers,
		isLoadingManagedEngineers,
		activeView,
		setActiveView,
		managerRelationshipsRefreshNonce,
		setManagerRelationshipsRefreshNonce,
		handoverNotes,
		setHandoverNotes,
		isSigningOffTransfer,
		setIsSigningOffTransfer,
		hasManagerOnboardingContext,
		setHasManagerOnboardingContext
	};
}
function OverlayBackdrop({ children, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: .15 },
		className: "fixed inset-0 z-50 flex items-center justify-center p-6",
		style: {
			background: "rgba(9, 30, 66, 0.54)",
			backdropFilter: "blur(2px)"
		},
		onClick: onClose,
		children
	});
}
function ObjectiveConfirmDialog({ title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", destructive, onConfirm, onCancel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverlayBackdrop, {
		onClose: onCancel,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				scale: .96
			},
			animate: {
				opacity: 1,
				scale: 1
			},
			exit: {
				opacity: 0,
				scale: .96
			},
			transition: { duration: .15 },
			className: "bg-white rounded-lg shadow-2xl w-full max-w-md border",
			style: { borderColor: C.border },
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [destructive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-red-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
							size: 18,
							className: "text-red-600"
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-amber-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							size: 18,
							className: "text-amber-600"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-base font-bold",
							style: { color: C.navy },
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm mt-1.5 leading-relaxed",
							style: { color: C.slate },
							children: description
						})]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 py-3 border-t flex items-center justify-end gap-2",
				style: {
					borderColor: C.border,
					background: C.bg
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					onClick: onCancel,
					children: cancelLabel
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onConfirm,
					className: "px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors",
					style: { background: destructive ? C.red : C.primary },
					children: confirmLabel
				})]
			})]
		})
	});
}
function parseDateLoose(s) {
	if (!s) return null;
	const cleaned = s.replace(/^Complete by\s+/i, "");
	const d = new Date(cleaned);
	return isNaN(d.getTime()) ? null : d;
}
function weeksBetween(from, to) {
	const ms = to.getTime() - from.getTime();
	return Math.ceil(ms / (1e3 * 60 * 60 * 24 * 7));
}
function CountdownBadge({ due }) {
	const d = parseDateLoose(due);
	if (!d) return null;
	const weeks = weeksBetween(/* @__PURE__ */ new Date(), d);
	if (weeks < 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "text-[11px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800",
		children: [
			"Overdue by ",
			Math.abs(weeks),
			" wk"
		]
	});
	if (weeks === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800",
		children: "Due this week"
	});
	if (weeks <= 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800",
		children: "Last week remaining"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700",
		children: [weeks, " weeks remaining"]
	});
}
function ObjectiveTableHeader({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: `px-4 py-3 font-semibold ${className}`,
		children
	});
}
function ObjectiveTableCell({ children, className = "", style }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: `px-4 py-3 align-middle ${className}`,
		style,
		children
	});
}
function ArchivedObjectivesTable({ items, onRestore, onDelete, formatObjectiveCode, formatDisplayDate }) {
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "p-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-12 h-12 rounded-full flex items-center justify-center mb-3",
					style: { background: C.bg },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, {
						size: 20,
						style: { color: C.subtle }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-base font-bold",
					style: { color: C.navy },
					children: "No archived objectives"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm mt-1",
					style: { color: C.subtle },
					children: "Objectives you archive will appear here."
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm min-w-[640px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "text-left text-[11px] font-semibold uppercase tracking-wider border-b",
					style: {
						background: C.bg,
						borderColor: C.border,
						color: C.subtle
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveTableHeader, { children: "Objective" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveTableHeader, { children: "Category" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveTableHeader, { children: "Authored" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveTableHeader, { children: "Archived" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveTableHeader, {
							className: "text-right",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: items.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b last:border-0 hover:bg-[#FAFBFC]",
					style: { borderColor: C.border },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ObjectiveTableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-semibold uppercase tracking-wider",
							style: { color: C.subtle },
							children: formatObjectiveCode(o)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "line-clamp-2 font-medium",
							style: { color: C.navy },
							children: o.title
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveTableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "info",
							children: o.competency
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveTableCell, {
							className: "whitespace-nowrap",
							style: { color: C.slate },
							children: o.dateAuthored ?? "-"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveTableCell, {
							className: "whitespace-nowrap",
							style: { color: C.slate },
							children: o.archivedDate ? formatDisplayDate(o.archivedDate) : "-"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveTableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => onRestore(o),
									title: "Restore to active board",
									className: "p-1.5 rounded hover:bg-[#DEEBFF]",
									style: { color: C.primary },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveRestore, { size: 15 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => onDelete(o),
									title: "Permanently delete",
									className: "p-1.5 rounded hover:bg-[#FFEBE6]",
									style: { color: C.red },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 15 })
								})]
							})
						})
					]
				}, o.id)) })]
			})
		})
	});
}
function ObjectiveCard({ o, readOnly = false, onOpen, isPinned, onTogglePin, onDragStart, onDragEnd, dragging, formatObjectiveCode }) {
	const statusIcon = o.status === "Completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, {
		size: 13,
		style: { color: C.green }
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
		size: 13,
		style: { color: C.amber }
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		whileHover: { y: -2 },
		transition: { duration: .15 },
		className: "group relative w-full text-left",
		draggable: !readOnly && o.status !== "Completed",
		onDragStart: (e) => {
			if (readOnly) return;
			e.dataTransfer?.setData("text/plain", o.id);
			onDragStart?.();
		},
		onDragEnd,
		style: { opacity: dragging ? .4 : 1 },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "relative p-4 hover:border-[#0052CC] transition-colors cursor-pointer",
			onClick: onOpen,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onMouseDown: (event) => event.stopPropagation(),
					onClick: (event) => {
						event.stopPropagation();
						onTogglePin();
					},
					className: `absolute top-3 right-3 p-1 rounded-md border shadow-sm transition-all duration-150 cursor-pointer ${isPinned ? "opacity-100 text-indigo-600 bg-indigo-50 border-indigo-200" : "opacity-0 group-hover:opacity-100 bg-white border-slate-200 text-slate-400 hover:text-indigo-600"}`,
					title: isPinned ? "Unpin objective from workspace" : "Pin objective to workspace",
					"aria-label": isPinned ? `Unpin ${o.title}` : `Pin ${o.title}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { size: 14 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-semibold uppercase tracking-wider",
							style: { color: C.subtle },
							children: formatObjectiveCode(o)
						}),
						o.status !== "Completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, {
							size: 14,
							style: { color: C.subtle }
						}),
						o.status === "Completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
							size: 12,
							style: { color: C.subtle }
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold mt-1 leading-snug",
					style: { color: C.navy },
					children: o.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "info",
						children: o.competency
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 pt-3 border-t flex items-center justify-between text-[11px]",
					style: {
						borderColor: C.border,
						color: C.slate
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 12 }), o.due]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5 font-medium",
						children: [statusIcon, o.status]
					})]
				})
			]
		})
	});
}
function ObjectivesView({ items, readOnly, onOpen, onCreate, pinnedObjectiveIds, onTogglePin, onMove, onRestore, onDelete, formatObjectiveCode, formatDisplayDate }) {
	const cols = [
		{
			id: "Pending Approval",
			label: "To Do / Not Started",
			tone: "warning"
		},
		{
			id: "In Progress",
			label: "In Progress",
			tone: "info"
		},
		{
			id: "Completed",
			label: "Completed",
			tone: "success"
		}
	];
	const [dragId, setDragId] = (0, import_react.useState)(null);
	const [overCol, setOverCol] = (0, import_react.useState)(null);
	const [showArchived, setShowArchived] = (0, import_react.useState)(false);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(null);
	const active = items.filter((i) => !i.isArchived);
	const archived = items.filter((i) => i.isArchived);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
						onClick: onCreate,
						className: "whitespace-nowrap",
						disabled: readOnly,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Create Objective"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sm:hidden",
								children: "Create"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm hidden md:block",
						style: { color: C.subtle },
						children: showArchived ? "Read-only archive of past objectives." : "Drag cards between columns to update status, or open one to edit."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
					onClick: () => setShowArchived((v) => !v),
					children: [showArchived ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { size: 14 }), showArchived ? `Back to Board` : `View Archived (${archived.length})`]
				})]
			}),
			showArchived ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchivedObjectivesTable, {
				items: archived,
				onRestore,
				onDelete: (o) => setConfirmDelete(o),
				formatObjectiveCode,
				formatDisplayDate
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-5",
				children: cols.map((col) => {
					const list = active.filter((i) => i.status === col.id);
					const isOver = overCol === col.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 rounded-lg p-2 -m-2 transition-colors",
						style: { background: isOver ? C.primarySoft : "transparent" },
						onDragOver: (e) => {
							e.preventDefault();
							setOverCol(col.id);
						},
						onDragLeave: () => setOverCol((c) => c === col.id ? null : c),
						onDrop: (e) => {
							e.preventDefault();
							setOverCol(null);
							if (dragId) {
								onMove(dragId, col.id);
								setDragId(null);
							}
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center justify-between px-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: col.tone,
									children: col.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold",
									style: { color: C.subtle },
									children: list.length
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 min-h-[200px]",
							children: [list.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveCard, {
								o,
								readOnly,
								onOpen: () => onOpen(o),
								isPinned: pinnedObjectiveIds.has(o.id),
								onTogglePin: () => onTogglePin(o),
								onDragStart: () => setDragId(o.id),
								onDragEnd: () => {
									setDragId(null);
									setOverCol(null);
								},
								dragging: dragId === o.id,
								formatObjectiveCode
							}, o.id)), list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border border-dashed rounded p-6 text-center text-xs",
								style: {
									borderColor: C.border,
									color: C.subtle
								},
								children: isOver ? "Drop to move here" : "Nothing here yet."
							})]
						})]
					}, col.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: confirmDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveConfirmDialog, {
				title: "Permanently delete this objective?",
				description: "This action cannot be undone. All criteria, evidence links, and history for this objective will be removed.",
				confirmLabel: "Yes, delete permanently",
				destructive: true,
				onCancel: () => setConfirmDelete(null),
				onConfirm: () => {
					onDelete(confirmDelete);
					setConfirmDelete(null);
				}
			}) })
		]
	});
}
function extractFirstLink(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const direct = trimmed.match(/https?:\/\/[^\s|,]+/i)?.[0];
	if (direct) return direct;
	const chunks = trimmed.split(/[|,\n]/).map((part) => part.trim());
	for (const chunk of chunks) {
		const labelStripped = chunk.replace(/^[^:]+:\s*/, "").trim();
		if (!labelStripped) continue;
		if (/^https?:\/\//i.test(labelStripped)) return labelStripped;
		if (/^[\w.-]+\.[A-Za-z]{2,}/.test(labelStripped)) return `https://${labelStripped}`;
	}
	return null;
}
function polishText(text) {
	const cleaned = text.replace(/\s+/g, " ").trim();
	if (!cleaned) return cleaned;
	const normalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
	return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}
function getDisplayName(fullName, email) {
	const trimmedFullName = fullName?.trim();
	if (trimmedFullName) return trimmedFullName;
	return email?.split("@")[0]?.trim() || "User";
}
function inferCompetencyFromText(title, description) {
	const raw = `${title} ${description}`.toLowerCase();
	if (/(design|architecture|scal|resilien|trade[- ]?off)/.test(raw)) return "System Design";
	if (/(incident|rca|debug|root cause|metric|analysis)/.test(raw)) return "Analytical Thinking";
	if (/(stakeholder|present|communicat|rfc|align)/.test(raw)) return "Communication";
	if (/(mentor|coach|lead|align team)/.test(raw)) return "Leadership";
	if (/(accessibility|ux|persona|usability|design system)/.test(raw)) return "Engineering for UX";
	if (/(security|owasp|vulnerability|auth|encryption)/.test(raw)) return "Security";
	return "Delivery";
}
function extractYouTubeVideoId(input) {
	if (!input.trim()) return null;
	try {
		const parsed = new URL(input.trim());
		const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
		if (host === "youtu.be") {
			const id = parsed.pathname.split("/").filter(Boolean)[0];
			return id && /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : null;
		}
		if (host === "youtube.com" || host === "m.youtube.com") {
			if (parsed.pathname === "/watch") {
				const v = parsed.searchParams.get("v");
				return v && /^[A-Za-z0-9_-]{6,}$/.test(v) ? v : null;
			}
			const parts = parsed.pathname.split("/").filter(Boolean);
			if (parts[0] === "embed" || parts[0] === "shorts") {
				const candidate = parts[1];
				return candidate && /^[A-Za-z0-9_-]{6,}$/.test(candidate) ? candidate : null;
			}
		}
	} catch {}
	return null;
}
function firstUrlInText(text) {
	const match = text.match(/https?:\/\/[^\s)]+/i);
	return match ? match[0] : null;
}
function urlsInText(text) {
	const normalized = (text.match(/https?:\/\/[^\s)]+/gi) ?? []).map((url) => url.trim());
	return Array.from(new Set(normalized));
}
function normalizeReferenceLinks(links) {
	return Array.from(new Set(links.map((link) => link.trim()).filter((link) => /^https?:\/\/\S+\.\S+/i.test(link))));
}
function parseKnowledgeItemRow(item) {
	const challenge = (item.title ?? "").trim();
	const lesson = (item.description ?? "").trim();
	const linkedReferences = Array.isArray(item.reference_links) ? item.reference_links.filter((link) => typeof link === "string") : [];
	const referenceMatches = urlsInText(lesson);
	const mergedReferenceLinks = normalizeReferenceLinks([...linkedReferences, ...referenceMatches]);
	if (!challenge && !lesson) return null;
	return {
		id: item.id,
		createdAt: item.created_at ?? (/* @__PURE__ */ new Date()).toISOString(),
		challenge,
		lesson,
		referenceLinks: mergedReferenceLinks
	};
}
function Backdrop$1({ children, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: .15 },
		className: "fixed inset-0 z-50 flex items-center justify-center p-6",
		style: {
			background: "rgba(9, 30, 66, 0.54)",
			backdropFilter: "blur(2px)"
		},
		onClick: onClose,
		children
	});
}
function Textarea$1({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		...props,
		className: `w-full min-h-[150px] resize-y rounded border bg-[#F4F5F7] p-3 text-sm leading-relaxed outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${className ?? ""}`,
		style: {
			borderColor: C.border,
			color: C.navy,
			overflowWrap: "anywhere"
		}
	});
}
function SectionHeader$3({ title, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-bold",
				style: { color: C.navy },
				children: title
			}), sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs mt-0.5",
				style: { color: C.subtle },
				children: sub
			})]
		})
	});
}
function KnowledgeHubView({ items, pinnedKnowledgeIds, focusedItemId, onTogglePin, onEdit, onDelete }) {
	const [highlightedItemId, setHighlightedItemId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!focusedItemId) return;
		const target = document.getElementById(`knowledge-card-${focusedItemId}`);
		if (!target) return;
		target.scrollIntoView({
			behavior: "smooth",
			block: "center"
		});
		setHighlightedItemId(focusedItemId);
		const timer = window.setTimeout(() => {
			setHighlightedItemId((current) => current === focusedItemId ? null : current);
		}, 2e3);
		return () => window.clearTimeout(timer);
	}, [focusedItemId, items]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader$3, {
			title: "Knowledge Hub",
			sub: "Capture and revisit technical insights, architecture notes, and personal engineering learnings."
		}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 rounded-lg border border-dashed px-4 py-6 text-sm",
			style: {
				borderColor: C.border,
				color: C.subtle
			},
			children: [
				"No knowledge entries yet. Use ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: "Log Knowledge"
				}),
				" from Manual Capture or the Extension popup to populate this hub."
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch",
			children: items.map((item) => {
				const fallbackUrl = firstUrlInText(`${item.challenge} ${item.lesson}`);
				const allReferenceLinks = normalizeReferenceLinks([...item.referenceLinks ?? [], ...fallbackUrl ? [fallbackUrl] : []]);
				const youtubeIds = allReferenceLinks.map((link) => extractYouTubeVideoId(link)).filter((id) => Boolean(id));
				const uniqueYoutubeIds = Array.from(new Set(youtubeIds));
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					id: `knowledge-card-${item.id}`,
					className: `min-w-0 rounded-xl border p-4 space-y-3 flex flex-col overflow-hidden transition-colors ${highlightedItemId === item.id ? "ring-2 ring-indigo-300 border-indigo-300 bg-indigo-50/20" : ""}`,
					style: {
						borderColor: highlightedItemId === item.id ? "#A5B4FC" : C.border,
						background: "#FFFFFF"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => onTogglePin(item),
										className: `inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${pinnedKnowledgeIds.has(item.id) ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" : "hover:bg-[#DEEBFF]"}`,
										style: pinnedKnowledgeIds.has(item.id) ? void 0 : {
											color: C.primary,
											borderColor: "#B3D4FF"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { size: 12 }), pinnedKnowledgeIds.has(item.id) ? "Pinned" : "Pin"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border",
										style: {
											background: "#EAE6FF",
											color: "#403294",
											borderColor: "#C5B8FF"
										},
										children: "Knowledge"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => onEdit(item),
										className: "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold hover:bg-[#DEEBFF]",
										style: {
											color: C.primary,
											borderColor: "#B3D4FF"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { size: 12 }), "Edit"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => onDelete(item),
										className: "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold hover:bg-[#FFEBE6]",
										style: {
											color: C.red,
											borderColor: "#FFBDAD"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 12 }), "Delete"]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold break-words whitespace-pre-wrap [overflow-wrap:break-word]",
									style: { color: C.navy },
									children: item.challenge || "Knowledge log"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] mt-1",
									style: { color: C.subtle },
									children: [
										"Logged on",
										" ",
										formatUtcToLocal(item.createdAt, {
											dateStyle: "medium",
											timeStyle: "short"
										})
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 text-sm leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:break-word]",
							style: { color: C.slate },
							children: item.lesson || "No lesson text provided."
						}),
						allReferenceLinks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2 min-w-0",
							children: allReferenceLinks.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: link,
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex min-w-0 items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold break-words whitespace-pre-wrap [overflow-wrap:break-word]",
								style: {
									color: "#006644",
									borderColor: "#79F2C0",
									background: "#E3FCEF"
								},
								children: ["Reference", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 })]
							}, `${item.id}-${link}`))
						}),
						uniqueYoutubeIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: uniqueYoutubeIds.map((youtubeId) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg overflow-hidden border",
								style: {
									borderColor: C.border,
									background: "#F4F5F7"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
									title: `Knowledge video ${item.id}-${youtubeId}`,
									src: `https://www.youtube.com/embed/${youtubeId}`,
									className: "w-full aspect-video",
									allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
									allowFullScreen: true
								})
							}, `${item.id}-${youtubeId}`))
						})
					]
				}, item.id);
			})
		})]
	});
}
function KnowledgeEditorModal({ item, isSaving, onClose, onSave }) {
	const [challenge, setChallenge] = (0, import_react.useState)(item.challenge ?? "");
	const [lesson, setLesson] = (0, import_react.useState)(item.lesson ?? "");
	const [referenceInput, setReferenceInput] = (0, import_react.useState)("");
	const [referenceLinks, setReferenceLinks] = (0, import_react.useState)(normalizeReferenceLinks(item.referenceLinks ?? []));
	const referenceInputValid = !referenceInput || /^https?:\/\/\S+\.\S+/i.test(referenceInput);
	(0, import_react.useEffect)(() => {
		setChallenge(item.challenge ?? "");
		setLesson(item.lesson ?? "");
		setReferenceInput("");
		setReferenceLinks(normalizeReferenceLinks(item.referenceLinks ?? []));
	}, [
		item.id,
		item.challenge,
		item.lesson,
		item.referenceLinks
	]);
	function addReferenceLink() {
		const trimmed = referenceInput.trim();
		if (!trimmed) return;
		if (!/^https?:\/\/\S+\.\S+/i.test(trimmed)) {
			toast.error("Enter a valid URL starting with http:// or https://");
			return;
		}
		setReferenceLinks((previous) => normalizeReferenceLinks([...previous, trimmed]));
		setReferenceInput("");
	}
	function removeReferenceLink(linkToRemove) {
		setReferenceLinks((previous) => previous.filter((link) => link !== linkToRemove));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backdrop$1, {
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				scale: .96
			},
			animate: {
				opacity: 1,
				scale: 1
			},
			exit: {
				opacity: 0,
				scale: .96
			},
			transition: { duration: .18 },
			className: "bg-white rounded-lg shadow-2xl w-full max-w-3xl border",
			style: { borderColor: C.border },
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 border-b flex items-center justify-between",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs font-semibold uppercase tracking-wide",
						style: { color: C.subtle },
						children: "Knowledge Hub"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-lg font-bold mt-0.5",
						style: { color: C.navy },
						children: "Edit knowledge log"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "p-1.5 rounded hover:bg-[#F4F5F7]",
						style: { color: C.slate },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 space-y-4 max-h-[80vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Core Activity / Challenge",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea$1, {
								autoFocus: true,
								value: challenge,
								onChange: (e) => setChallenge(e.target.value),
								placeholder: "What challenge did you run into?",
								rows: 7
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Solution / Lesson Learned",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea$1, {
								value: lesson,
								onChange: (e) => setLesson(e.target.value),
								placeholder: "What did you learn that you'll reuse?",
								rows: 9
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "External Reference Links",
							optional: true,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
											size: 14,
											className: "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none",
											style: { color: C.subtle }
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: referenceInput,
											onChange: (e) => setReferenceInput(e.target.value),
											onKeyDown: (event) => {
												if (event.key === "Enter") {
													event.preventDefault();
													addReferenceLink();
												}
											},
											placeholder: "https://www.youtube.com/watch?v=...",
											className: "pl-8"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
										type: "button",
										className: "border h-9 px-2.5 whitespace-nowrap",
										onClick: addReferenceLink,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 13 }), "Add Reference Link"]
									})]
								}),
								!referenceInputValid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] mt-1",
									style: { color: C.red },
									children: "Enter a valid URL starting with http:// or https://"
								}),
								referenceLinks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-1.5",
									children: referenceLinks.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
										style: {
											borderColor: "#B3D4FF",
											background: "#DEEBFF",
											color: C.primary
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: link,
											target: "_blank",
											rel: "noreferrer",
											className: "inline-flex items-center gap-1 hover:underline",
											children: ["Link", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 11 })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => removeReferenceLink(link),
											className: "rounded-full p-0.5 hover:bg-[#B3D4FF]",
											"aria-label": `Remove reference link ${link}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 10 })
										})]
									}, link))
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-t flex items-center justify-end gap-2",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						type: "button",
						onClick: onClose,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
						type: "button",
						disabled: isSaving || !challenge.trim() || !lesson.trim() || !referenceInputValid,
						onClick: () => onSave({
							challenge,
							lesson,
							referenceLinks
						}),
						children: isSaving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							size: 14,
							className: "animate-spin"
						}), "Saving..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 14 }), "Save Changes"] })
					})]
				})
			]
		})
	});
}
var WORKSPACE_MODE_STORAGE_KEY = "evitrace.workspace.mode";
var WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY = "evitrace.workspace.selectedEngineerId";
var WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY = "evitrace_active_engineer_id";
var WORKSPACE_BOOTSTRAPPED_STORAGE_KEY = "evitrace.workspace.bootstrapped";
function readStoredWorkspaceMode() {
	if (typeof window === "undefined") return "manager";
	return window.sessionStorage.getItem(WORKSPACE_MODE_STORAGE_KEY) === "engineer" ? "engineer" : "manager";
}
function readStoredSelectedEngineerId() {
	if (typeof window === "undefined") return null;
	const stored = window.sessionStorage.getItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY)?.trim() ?? window.sessionStorage.getItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY)?.trim();
	return stored ? stored : null;
}
function hasWorkspaceBootstrapped() {
	if (typeof window === "undefined") return false;
	return window.sessionStorage.getItem(WORKSPACE_BOOTSTRAPPED_STORAGE_KEY) === "1";
}
var WorkspaceContext = (0, import_react.createContext)(void 0);
function WorkspaceProvider({ children }) {
	const [mode, setModeState] = (0, import_react.useState)(() => readStoredWorkspaceMode());
	const [isManagerAccount, setIsManagerAccount] = (0, import_react.useState)(false);
	const [linkedEngineers, setLinkedEngineers] = (0, import_react.useState)([]);
	const [selectedEngineerId, setSelectedEngineerIdState] = (0, import_react.useState)(() => readStoredSelectedEngineerId());
	const [loading, setLoading] = (0, import_react.useState)(() => !hasWorkspaceBootstrapped());
	const refreshWorkspace = (0, import_react.useCallback)(async () => {
		try {
			const { data: { user }, error: userError } = await supabase.auth.getUser();
			if (userError) throw userError;
			if (!user) {
				setIsManagerAccount(false);
				setLinkedEngineers([]);
				setModeState("engineer");
				setSelectedEngineerIdState(null);
				return;
			}
			const { data: profile, error: profileError } = await supabase.from("profiles").select("job_title").eq("id", user.id).single();
			if (profileError) console.warn("[workspace] failed to read profile job title:", profileError.message);
			const isManagerByTitle = profile?.job_title?.toLowerCase().includes("manager");
			const { data: relations, error: relationsError } = await supabase.from("reporting_relationships").select(`
          engineer_id,
          profiles!engineer_id (id, full_name, job_title, avatar_url)
        `).eq("manager_id", user.id).eq("status", "active");
			if (relationsError) throw relationsError;
			const hasLinkedEngineers = Boolean(relations && relations.length > 0);
			const isManager = Boolean(isManagerByTitle || hasLinkedEngineers);
			setIsManagerAccount(isManager);
			if (hasLinkedEngineers) setLinkedEngineers(relations.map((r) => r.profiles).filter(Boolean));
			else setLinkedEngineers([]);
			if (!isManager) {
				setModeState("engineer");
				setSelectedEngineerIdState(null);
			}
		} catch (error) {
			console.error("[workspace] failed to refresh workspace context:", error);
			setIsManagerAccount(false);
			setLinkedEngineers([]);
			setModeState("engineer");
			setSelectedEngineerIdState(null);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		let isMounted = true;
		refreshWorkspace().finally(() => {
			if (!isMounted) return;
			setLoading(false);
			if (typeof window !== "undefined") window.sessionStorage.setItem(WORKSPACE_BOOTSTRAPPED_STORAGE_KEY, "1");
		});
		return () => {
			isMounted = false;
		};
	}, [refreshWorkspace]);
	const setSelectedEngineerId = (nextId) => {
		if (selectedEngineerId === nextId) return;
		if (mode === "manager" && selectedEngineerId && selectedEngineerId !== nextId) {
			const staleEngineerId = selectedEngineerId;
			setTimeout(() => {
				supabase.channel(`workspace-sync-${staleEngineerId}`).send({
					type: "broadcast",
					event: "session_terminated",
					payload: { exited_by: "manager" }
				}).catch((error) => {
					console.error("Non-blocking workspace broadcast failed:", error);
				});
			}, 0);
		}
		if (typeof window !== "undefined") if (nextId) {
			window.sessionStorage.setItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY, nextId);
			window.sessionStorage.setItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY, nextId);
		} else {
			window.sessionStorage.removeItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY);
			window.sessionStorage.removeItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY);
		}
		setSelectedEngineerIdState(nextId);
	};
	const setMode = (nextMode) => {
		if (nextMode === "engineer") {
			setSelectedEngineerIdState(null);
			if (typeof window !== "undefined") {
				window.sessionStorage.removeItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY);
				window.sessionStorage.removeItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY);
			}
		}
		if (typeof window !== "undefined") window.sessionStorage.setItem(WORKSPACE_MODE_STORAGE_KEY, nextMode);
		setModeState(nextMode);
	};
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		window.sessionStorage.setItem(WORKSPACE_MODE_STORAGE_KEY, mode);
	}, [mode]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		if (!selectedEngineerId) {
			window.sessionStorage.removeItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY);
			window.sessionStorage.removeItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY);
			return;
		}
		window.sessionStorage.setItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY, selectedEngineerId);
		window.sessionStorage.setItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY, selectedEngineerId);
	}, [selectedEngineerId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceContext.Provider, {
		value: {
			mode,
			setMode,
			isManagerAccount,
			linkedEngineers,
			selectedEngineerId,
			setSelectedEngineerId,
			loading,
			refreshWorkspace
		},
		children
	});
}
function useWorkspace() {
	const context = (0, import_react.useContext)(WorkspaceContext);
	if (!context) throw new Error("useWorkspace must be wrapped within a WorkspaceProvider");
	return context;
}
function Backdrop({ children, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: .15 },
		className: "fixed inset-0 z-50 flex items-center justify-center p-6",
		style: {
			background: "rgba(9, 30, 66, 0.54)",
			backdropFilter: "blur(2px)"
		},
		onClick: onClose,
		children
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		...props,
		className: `w-full min-h-[150px] resize-y rounded border bg-[#F4F5F7] p-3 text-sm leading-relaxed outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${className ?? ""}`,
		style: {
			borderColor: C.border,
			color: C.navy,
			overflowWrap: "anywhere"
		}
	});
}
function buildFrameworkCategoryMapFromContext$1(categories, getQuestionsForCategory) {
	return categories.reduce((acc, categoryName) => {
		acc[categoryName] = {
			summary: "",
			items: getQuestionsForCategory(categoryName)
		};
		return acc;
	}, {});
}
function CaptureModal({ onClose, onSaveEvidence, onSaveKnowledge, competencyDescriptions, managerMode = false }) {
	const { mode } = useWorkspace();
	const isManagerPersona = managerMode || mode === "manager";
	const { categories: frameworkCategories, getQuestionsForCategory, isLoading } = useFramework();
	const [tab, setTab] = (0, import_react.useState)(isManagerPersona ? "knowledge" : "evidence");
	const categoryMap = (0, import_react.useMemo)(() => buildFrameworkCategoryMapFromContext$1(frameworkCategories, getQuestionsForCategory), [frameworkCategories, getQuestionsForCategory]);
	const categories = (0, import_react.useMemo)(() => frameworkCategories.filter((categoryName) => categoryName.trim().length > 0), [frameworkCategories]);
	const hasFrameworkTaxonomy = categories.length > 0;
	const initialCategory = categories[0] ?? "";
	const initialSubcategory = categoryMap[initialCategory]?.items[0] ?? "";
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [sourceLink, setSourceLink] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)(initialCategory);
	const [subcategory, setSubcategory] = (0, import_react.useState)(initialSubcategory);
	const [challenge, setChallenge] = (0, import_react.useState)("");
	const [lesson, setLesson] = (0, import_react.useState)("");
	const [knowledgeReferenceInput, setKnowledgeReferenceInput] = (0, import_react.useState)("");
	const [knowledgeReferenceLinks, setKnowledgeReferenceLinks] = (0, import_react.useState)([]);
	const linkValid = !sourceLink || /^https?:\/\/\S+\.\S+/i.test(sourceLink);
	const knowledgeInputValid = !knowledgeReferenceInput || /^https?:\/\/\S+\.\S+/i.test(knowledgeReferenceInput);
	function onCategoryChange(v) {
		setCategory(v);
		setSubcategory(categoryMap[v]?.items[0] ?? "");
	}
	function handleAutoMapCompetency() {
		const inferred = inferCompetencyFromText(title, description);
		const mappedCategory = categories.includes(inferred) ? inferred : categories.find((candidate) => candidate.toLowerCase().includes(inferred.toLowerCase())) ?? categories[0] ?? "";
		setCategory(mappedCategory);
		setSubcategory(categoryMap[mappedCategory]?.items[0] ?? "");
		toast.success("Competency auto-mapped.");
	}
	(0, import_react.useEffect)(() => {
		if (isManagerPersona && tab !== "knowledge") setTab("knowledge");
	}, [isManagerPersona, tab]);
	(0, import_react.useEffect)(() => {
		if (isLoading) return;
		if (categories.length === 0) {
			if (category) setCategory("");
			if (subcategory) setSubcategory("");
			return;
		}
		if (!categories.includes(category)) {
			setCategory(initialCategory);
			setSubcategory(initialSubcategory);
			return;
		}
		const selectedItems = categoryMap[category]?.items ?? [];
		if (!selectedItems.includes(subcategory)) setSubcategory(selectedItems[0] ?? "");
	}, [
		categories,
		category,
		subcategory,
		categoryMap,
		initialCategory,
		initialSubcategory,
		isLoading
	]);
	function handlePolishContent() {
		if (!title.trim() && !description.trim()) {
			toast.info("Add title or description first.");
			return;
		}
		if (title.trim()) setTitle((prev) => polishText(prev));
		if (description.trim()) setDescription((prev) => polishText(prev));
		toast.success("Content polished.");
	}
	function resetKnowledgeFields() {
		setChallenge("");
		setLesson("");
		setKnowledgeReferenceInput("");
		setKnowledgeReferenceLinks([]);
	}
	function addKnowledgeReferenceLink() {
		const trimmed = knowledgeReferenceInput.trim();
		if (!trimmed) return;
		if (!/^https?:\/\/\S+\.\S+/i.test(trimmed)) {
			toast.error("Enter a valid URL starting with http:// or https://");
			return;
		}
		setKnowledgeReferenceLinks((previous) => {
			if (previous.some((link) => link.toLowerCase() === trimmed.toLowerCase())) return previous;
			return [...previous, trimmed];
		});
		setKnowledgeReferenceInput("");
	}
	function removeKnowledgeReferenceLink(linkToRemove) {
		setKnowledgeReferenceLinks((previous) => previous.filter((link) => link !== linkToRemove));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backdrop, {
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				scale: .96
			},
			animate: {
				opacity: 1,
				scale: 1
			},
			exit: {
				opacity: 0,
				scale: .96
			},
			transition: { duration: .18 },
			className: "bg-white rounded-lg shadow-2xl w-full max-w-xl border",
			style: { borderColor: C.border },
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 border-b flex items-center justify-between",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold uppercase tracking-wide",
							style: { color: C.subtle },
							children: "Manual Capture"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-lg font-bold mt-0.5",
							style: { color: C.navy },
							children: isManagerPersona ? "Log Reference Knowledge" : "Capture Performance Evidence"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] mt-1",
							style: { color: C.subtle },
							children: isManagerPersona ? "Log strategic insights, core playbooks, or reference concepts directly into your leadership workspace." : "Log metrics, milestones, and project links directly into your target performance stream."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "p-1.5 rounded hover:bg-[#F4F5F7]",
						style: { color: C.slate },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 space-y-4 max-h-[70vh] overflow-y-auto",
					children: [!isManagerPersona && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex rounded-md border p-0.5",
						style: { borderColor: C.border },
						role: "tablist",
						"aria-label": "Capture mode",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "tab",
							"aria-selected": tab === "evidence",
							onClick: () => setTab("evidence"),
							className: `px-3 py-1.5 text-xs font-semibold rounded ${tab === "evidence" ? "text-white" : ""}`,
							style: {
								background: tab === "evidence" ? C.primary : "transparent",
								color: tab === "evidence" ? "#fff" : C.slate
							},
							children: "Capture Evidence"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "tab",
							"aria-selected": tab === "knowledge",
							onClick: () => setTab("knowledge"),
							className: "px-3 py-1.5 text-xs font-semibold rounded",
							style: {
								background: tab === "knowledge" ? C.primary : "transparent",
								color: tab === "knowledge" ? "#fff" : C.slate
							},
							children: "Log Knowledge"
						})]
					}), tab === "evidence" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Evidence Title",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								autoFocus: true,
								value: title,
								onChange: (e) => setTitle(e.target.value),
								placeholder: "e.g. Led RFC review for payments cutover"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Detailed Documentation",
							optional: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: description,
								onChange: (e) => setDescription(e.target.value),
								placeholder: "What challenge did you solve and what was the impact?",
								rows: 4
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border p-2.5 space-y-2",
							style: {
								borderColor: C.border,
								background: "#FAFBFC"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold",
									style: { color: C.slate },
									children: "AI Assistant Actions"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
										type: "button",
										className: "border h-8 px-2.5",
										onClick: handlePolishContent,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 13 }), "Polish Content"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
										type: "button",
										className: "border h-8 px-2.5",
										onClick: handleAutoMapCompetency,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 13 }), "Auto-Map Competency"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px]",
									style: { color: C.subtle },
									children: "AI will clean up your engineering shorthand for corporate clarity and auto-select matching competency options."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "Source Link",
							optional: true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
									size: 14,
									className: "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none",
									style: { color: C.subtle }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: sourceLink,
									onChange: (e) => setSourceLink(e.target.value),
									placeholder: "https://github.com/org/repo/pull/142",
									className: "pl-8"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] mt-1",
								style: { color: linkValid ? C.subtle : C.red },
								children: linkValid ? "Add URL to a Jira ticket, PR, or Confluence page." : "Enter a valid URL starting with http:// or https://"
							})]
						}),
						!isManagerPersona && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "Core Competency Tag",
							required: true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: category,
								onChange: (e) => onCategoryChange(e.target.value),
								children: [hasFrameworkTaxonomy ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "No framework categories available"
								}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] mt-1.5 leading-relaxed",
								style: { color: C.subtle },
								children: categoryMap[category]?.summary || competencyDescriptions[category] || "No summary provided."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Subcategory / Question",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: subcategory,
								onChange: (e) => setSubcategory(e.target.value),
								disabled: !hasFrameworkTaxonomy || !category,
								children: [!hasFrameworkTaxonomy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "No framework categories available"
								}) : null, (categoryMap[category]?.items ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))]
							})
						})] })
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: isManagerPersona ? "Title" : "Core Activity / Challenge",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: challenge,
								onChange: (e) => setChallenge(e.target.value),
								placeholder: isManagerPersona ? "Summary label..." : "What challenge did you run into?",
								rows: 4
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: isManagerPersona ? "Detailed Documentation" : "Solution / Lesson Learned",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: lesson,
								onChange: (e) => setLesson(e.target.value),
								placeholder: isManagerPersona ? "Paste contextual references..." : "What did you learn that you'll reuse?",
								rows: 5
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "External Reference Links",
							optional: true,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
											size: 14,
											className: "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none",
											style: { color: C.subtle }
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: knowledgeReferenceInput,
											onChange: (e) => setKnowledgeReferenceInput(e.target.value),
											onKeyDown: (event) => {
												if (event.key === "Enter") {
													event.preventDefault();
													addKnowledgeReferenceLink();
												}
											},
											placeholder: "https://www.youtube.com/watch?v=...",
											className: "pl-8"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
										type: "button",
										className: "border h-9 px-2.5 whitespace-nowrap",
										onClick: addKnowledgeReferenceLink,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 13 }), "Add Reference Link"]
									})]
								}),
								!knowledgeInputValid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] mt-1",
									style: { color: C.red },
									children: "Enter a valid URL starting with http:// or https://"
								}),
								knowledgeReferenceLinks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-1.5",
									children: knowledgeReferenceLinks.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
										style: {
											borderColor: "#B3D4FF",
											background: "#DEEBFF",
											color: C.primary
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: link,
											target: "_blank",
											rel: "noreferrer",
											className: "inline-flex items-center gap-1 hover:underline",
											children: ["Link", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 11 })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => removeKnowledgeReferenceLink(link),
											className: "rounded-full p-0.5 hover:bg-[#B3D4FF]",
											"aria-label": `Remove reference link ${link}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 10 })
										})]
									}, link))
								}) : null
							]
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-t flex items-center justify-end gap-2",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						onClick: onClose,
						children: "Cancel"
					}), tab === "evidence" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
						disabled: !hasFrameworkTaxonomy || !title.trim() || !category.trim() || !subcategory.trim() || !linkValid,
						onClick: () => onSaveEvidence({
							title,
							description,
							sourceLink,
							category,
							subcategory
						}),
						children: "Save Milestone"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
						disabled: !hasFrameworkTaxonomy || !challenge.trim() || !lesson.trim() || !knowledgeInputValid,
						onClick: () => onSaveKnowledge({
							challenge,
							lesson,
							referenceLinks: knowledgeReferenceLinks,
							reset: resetKnowledgeFields
						}),
						children: isManagerPersona ? "Commit Knowledge" : "Save Knowledge"
					})]
				})
			]
		})
	});
}
var MANAGER_SCOPED_TABS = [
	"evidence",
	"objectives",
	"radar",
	"report"
];
function getManagerTabPath(engineerId, tab) {
	if (!MANAGER_SCOPED_TABS.includes(tab)) return "/";
	return `/team/${engineerId}/${tab}`;
}
function getTabPath(tab, options) {
	const scopedEngineerId = options?.engineerId?.trim();
	if (options?.mode === "manager" && scopedEngineerId && MANAGER_SCOPED_TABS.includes(tab)) return getManagerTabPath(scopedEngineerId, tab);
	switch (tab) {
		case "dashboard": return "/";
		case "radar": return "/radar";
		case "evidence": return "/evidence";
		case "objectives": return "/objectives";
		case "knowledge": return "/knowledge";
		case "feedback": return "/feedback";
		case "report": return "/report";
		case "settings": return "/settings/profile";
		default: return "/";
	}
}
function getSettingsSectionPath(section) {
	switch (section) {
		case "profile": return "/settings/profile";
		case "team": return "/settings/team";
		case "notifications": return "/settings/notifications";
		case "extension": return "/settings/extension";
		case "framework": return "/settings/framework";
		case "dashboard": return "/settings/dashboard";
		default: return "/settings/profile";
	}
}
function resolveLegacyHomePath(input) {
	if (input.action === "capture") return "/evidence";
	if (!input.tab) return null;
	if (input.tab === "settings") return getSettingsSectionPath(input.section || "profile");
	return getTabPath(input.tab);
}
var HOME_PAGE_TITLES = {
	dashboard: "Dashboard",
	radar: "Promotion Readiness",
	evidence: "Evidence Log",
	objectives: "Objectives",
	knowledge: "Knowledge Hub",
	feedback: "360 Feedback",
	report: "Reviews & Reports",
	settings: "Settings"
};
var settingsKey = (userId) => ["user_settings", userId];
var profileActiveFrameworkKey = (userId) => ["profile-active-framework", userId];
var activeFrameworkMatrixKey = (userId) => ["active-framework-matrix", userId];
var activeFrameworkContextKey = (userId) => ["active-framework-context", userId];
var profileKey$1 = (userId) => ["profile", userId];
var SYSTEM_DEFAULT_NAME_SUFFIX_REGEX = /\s*\((?:system default|built-in template)\)\s*$/i;
function normalizeFrameworkName(rawName) {
	return rawName.replace(SYSTEM_DEFAULT_NAME_SUFFIX_REGEX, "").replace(/^company\s+custom\s+/i, "").replace(/\breference guide\b/i, "Framework").replace(/\s{2,}/g, " ").trim() || rawName.trim() || rawName;
}
function getFrameworkDisplayName(framework) {
	const cleanTemplateName = normalizeFrameworkName(framework.name);
	if (framework.is_system_default) return `${cleanTemplateName || framework.name} (Built-in)`;
	return cleanTemplateName;
}
function normalizeWallClockTime(value) {
	if (typeof value !== "string") return null;
	const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
	if (!match) return null;
	const hour = Number(match[1]);
	const minute = Number(match[2]);
	if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
/**
* Fetches notification and integration preferences for a user.
* Key: ['user_settings', userId]
* staleTime: 5 min (near-static data)
*/
function useSettingsQuery(userId) {
	return useQuery({
		queryKey: settingsKey(userId),
		queryFn: async () => {
			const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single();
			if (error) throw error;
			return settingsRowToSettings(data);
		},
		staleTime: 3e5,
		enabled: Boolean(userId)
	});
}
/**
* PATCHes the notifications JSONB column for the user.
* Invalidates ['user_settings', userId] on settled.
*/
function useSaveNotifications(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (notifications) => {
			const normalizedPromptTimes = (notifications.extensionPromptTimes ?? []).map((value) => normalizeWallClockTime(value)).filter((value) => Boolean(value));
			const safeNotifications = {
				...notifications,
				extensionPromptTimes: normalizedPromptTimes.length > 0 ? [...new Set(normalizedPromptTimes)] : ["16:00"]
			};
			const { error } = await supabase.from("user_settings").update({ notifications: safeNotifications }).eq("user_id", userId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: settingsKey(userId) });
		}
	});
}
/**
* PATCHes the integrations JSONB column for the user.
* Invalidates ['user_settings', userId] on settled.
*/
function useSaveIntegrations(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (integrations) => {
			const { error } = await supabase.from("user_settings").update({ integrations }).eq("user_id", userId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: settingsKey(userId) });
		}
	});
}
/**
* Updates profiles.active_framework_id for the signed-in user and refreshes all
* framework-dependent queries used across the app.
*/
function useSetActiveFramework(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (frameworkId) => {
			if (!userId) throw new Error("Sign in to update the active framework.");
			if (!frameworkId) throw new Error("Select a valid framework.");
			const { data, error } = await supabase.from("profiles").update({ active_framework_id: frameworkId }).eq("id", userId).select("active_framework_id").maybeSingle();
			if (error) throw error;
			return data?.active_framework_id ?? frameworkId;
		},
		onSuccess: (frameworkId) => {
			queryClient.setQueryData(profileActiveFrameworkKey(userId), frameworkId);
			queryClient.invalidateQueries({ queryKey: profileActiveFrameworkKey(userId) });
			queryClient.invalidateQueries({ queryKey: activeFrameworkMatrixKey(userId) });
			queryClient.invalidateQueries({ queryKey: activeFrameworkContextKey(userId) });
			queryClient.invalidateQueries({ queryKey: profileKey$1(userId) });
		},
		onError: (error) => {
			toast.error(error.message);
		}
	});
}
var EMPTY_PROFILE_TEAM_DRAFT = {
	fullName: "",
	email: "",
	currentLevel: "",
	targetLevel: "",
	manager: "",
	managerEmail: "",
	team: "",
	skipLevel: ""
};
function profileTeamDraftFromUser(user) {
	if (!user) return EMPTY_PROFILE_TEAM_DRAFT;
	return {
		fullName: user.fullName ?? "",
		email: user.email ?? "",
		currentLevel: user.currentLevel ?? "",
		targetLevel: user.targetLevel ?? "",
		manager: user.manager ?? "",
		managerEmail: user.managerEmail ?? "",
		team: user.team ?? "",
		skipLevel: user.skipLevel ?? ""
	};
}
function hasProfileTeamDraftChanges(draft, user) {
	if (!user) return false;
	return draft.fullName.trim() !== (user.fullName ?? "").trim() || draft.email.trim() !== (user.email ?? "").trim() || draft.currentLevel.trim() !== (user.currentLevel ?? "").trim() || draft.targetLevel.trim() !== (user.targetLevel ?? "").trim() || draft.manager.trim() !== (user.manager ?? "").trim() || draft.managerEmail.trim() !== (user.managerEmail ?? "").trim() || draft.team.trim() !== (user.team ?? "").trim() || draft.skipLevel.trim() !== (user.skipLevel ?? "").trim();
}
var SETTINGS_SECTION_ITEMS = [
	{
		id: "profile",
		label: "Profile",
		icon: User
	},
	{
		id: "notifications",
		label: "Notifications",
		icon: Bell
	},
	{
		id: "extension",
		label: "Extension Preferences",
		icon: Puzzle
	},
	{
		id: "framework",
		label: "Competency Framework",
		icon: Layers
	},
	{
		id: "dashboard",
		label: "Sample Content",
		icon: LayoutDashboard
	}
];
function Toggle({ on, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": on,
		onClick: () => onChange(!on),
		className: "relative inline-flex w-9 h-5 rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
		style: { background: on ? C.primary : "#C1C7D0" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
			style: { transform: on ? "translateX(16px)" : "translateX(0px)" }
		})
	});
}
function SettingRow({ title, desc, right }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[1fr_auto] items-center gap-4 py-3 border-b last:border-b-0",
		style: { borderColor: C.border },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pr-2 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-semibold",
				style: { color: C.navy },
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs mt-0.5",
				style: { color: C.subtle },
				children: desc
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: right
		})]
	});
}
function DashboardSamplesSettings({ sampleContent, onSampleContentChange }) {
	const toggle = (key) => onSampleContentChange({
		...sampleContent,
		[key]: !sampleContent[key]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-base font-bold tracking-tight",
			style: { color: C.navy },
			children: "Sample Content Visibility"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs mt-1",
			style: { color: C.subtle },
			children: "Choose where educational sample content appears. Turn off any area once you have enough real activity."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 space-y-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
					title: "Dashboard Samples",
					desc: "Controls sample cards and placeholder records in dashboard highlights.",
					right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						on: sampleContent.dashboard,
						onChange: () => toggle("dashboard")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
					title: "Objectives Samples",
					desc: "Controls preloaded SMART objective examples in the Objectives board.",
					right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						on: sampleContent.objectives,
						onChange: () => toggle("objectives")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
					title: "Evidence Log Samples",
					desc: "Controls sample captured evidence and sample objective-logged entries in Evidence Log.",
					right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						on: sampleContent.evidence,
						onChange: () => toggle("evidence")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
					title: "Pinned Resources Samples",
					desc: "Controls sample pinned links and knowledge anchors shown in the dashboard pinned bar.",
					right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						on: sampleContent.pinnedResources,
						onChange: () => toggle("pinnedResources")
					})
				})
			]
		})]
	});
}
var profileKey = (userId) => ["profile", userId];
/**
* Uploads an avatar file to the 'avatars' bucket at `{userId}/{fileName}` (upsert: true),
* then updates profiles.avatar_url with the public URL.
* Invalidates ['profile', userId] on success.
*/
function useUploadAvatar(userId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (file) => {
			const fileName = file.name;
			const { error: uploadError } = await supabase.storage.from("avatars").upload(`${userId}/${fileName}`, file, { upsert: true });
			if (uploadError) throw uploadError;
			const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(`${userId}/${fileName}`);
			const publicUrl = urlData.publicUrl;
			const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
			if (updateError) throw updateError;
			return publicUrl;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: profileKey(userId) });
		}
	});
}
function ProfileSettings({ draft, onChange }) {
	const fileRef = (0, import_react.useRef)(null);
	const { userId } = useAuth();
	const uploadAvatarMutation = useUploadAvatar(userId ?? "");
	const [photo, setPhoto] = (0, import_react.useState)(null);
	const { user } = useAuth();
	const displayName = getDisplayName(draft.fullName, draft.email);
	const displayTitle = user?.currentLevel?.trim() || "Engineer";
	const displaySubtitle = user?.team ? `${displayTitle} · ${user.team}` : displayTitle;
	const profileInitials = displayName.split(" ").map((segment) => segment[0]).slice(0, 2).join("").toUpperCase() || "US";
	if (!user) return null;
	(0, import_react.useEffect)(() => {
		if (user?.avatarUrl) setPhoto(user.avatarUrl);
	}, [user?.avatarUrl]);
	function onPickPhoto(file) {
		if (!file) return;
		uploadAvatarMutation.mutate(file, { onSuccess: (url) => {
			setPhoto(url);
			toast.success("Profile picture updated");
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-bold tracking-tight",
				style: { color: C.navy },
				children: "Profile"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs mt-1",
				style: { color: C.subtle },
				children: "Your personal information and role"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-center gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => fileRef.current?.click(),
						className: "relative group w-16 h-16 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2",
						style: { background: "#5243AA" },
						"aria-label": "Change profile photo",
						children: [photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: photo,
							alt: "Profile",
							className: "w-full h-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute inset-0 flex items-center justify-center text-lg font-semibold text-white",
							children: profileInitials
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
							style: { background: "rgba(9,30,66,0.55)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
								size: 18,
								color: "#fff"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "image/*",
						className: "hidden",
						onChange: (event) => onPickPhoto(event.target.files?.[0])
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-base font-semibold",
							style: { color: C.navy },
							children: displayName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm",
							style: { color: C.subtle },
							children: displaySubtitle
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 text-xs flex items-center gap-1.5",
				style: { color: C.subtle },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 12 }), "Identity fields are protected. You'll be asked to confirm your password before saving."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Full name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.fullName,
							onChange: (event) => onChange({ fullName: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: draft.email,
							onChange: (event) => onChange({ email: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Current Job Title / Level",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.currentLevel,
							onChange: (event) => onChange({ currentLevel: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Target level",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.targetLevel,
							onChange: (event) => onChange({ targetLevel: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Business unit / Team",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.team,
							onChange: (event) => onChange({ team: event.target.value })
						})
					})
				]
			})
		]
	});
}
function getErrorMessage$1(error, fallback) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "object" && error !== null && "message" in error) {
		const message = error.message;
		if (typeof message === "string" && message.trim().length > 0) return message;
	}
	return fallback;
}
function shouldTryDisconnectFallback(error) {
	if (typeof error !== "object" || error === null) return false;
	const normalized = `${"code" in error ? String(error.code ?? "") : ""} ${"message" in error ? String(error.message ?? "") : ""}`.toLowerCase();
	return normalized.includes("pgrst202") || normalized.includes("schema cache") || normalized.includes("function");
}
function TeamSettings() {
	const { user, userId } = useAuth();
	const [activeInviteUrl, setActiveInviteUrl] = (0, import_react.useState)(null);
	const [isGenerating, setIsGenerating] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [isDisconnecting, setIsDisconnecting] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [showConfirmModal, setShowConfirmModal] = (0, import_react.useState)(false);
	const [confirmAction, setConfirmAction] = (0, import_react.useState)(null);
	const [activeManager, setActiveManager] = (0, import_react.useState)(null);
	const [pendingInvite, setPendingInvite] = (0, import_react.useState)(null);
	if (!user) return null;
	async function handleGenerateInvite() {
		try {
			setIsGenerating(true);
			const { data: { session } } = await supabase.auth.getSession();
			const token = session?.access_token;
			if (!token) {
				toast.error("Session expired. Please sign in again.");
				return;
			}
			const result = await createManagerInvite({ data: {
				relationType: "manager",
				token
			} });
			const inviteUrl = window.location.origin + "/invite?code=" + result.code;
			setActiveInviteUrl(inviteUrl);
			window.localStorage.setItem(ACTIVE_INVITE_URL_STORAGE_KEY, inviteUrl);
			setPendingInvite({
				id: `local-${Date.now()}`,
				relationType: "manager",
				expiresAt: result.expiresAt,
				inviteUrl
			});
			setActiveManager(null);
			setCopied(false);
			toast.success("Invite link generated");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to generate invite link.";
			toast.error(message);
		} finally {
			setIsGenerating(false);
		}
	}
	async function handleCopyLink() {
		if (!activeInviteUrl) return;
		try {
			let didCopy = false;
			if (typeof navigator !== "undefined" && navigator.clipboard && typeof window !== "undefined" && window.isSecureContext) {
				await navigator.clipboard.writeText(activeInviteUrl);
				didCopy = true;
			} else if (typeof document !== "undefined") {
				const textarea = document.createElement("textarea");
				textarea.value = activeInviteUrl;
				textarea.setAttribute("readonly", "");
				textarea.style.position = "fixed";
				textarea.style.left = "-9999px";
				document.body.appendChild(textarea);
				textarea.select();
				didCopy = document.execCommand("copy");
				document.body.removeChild(textarea);
			}
			if (!didCopy) throw new Error("Clipboard copy failed");
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1800);
		} catch {
			toast.error("Couldn't copy link. Please copy it manually.");
		}
	}
	async function handleDisconnectManager() {
		try {
			setIsDisconnecting(true);
			const { error } = await supabase.rpc("disconnect_manager_connection");
			if (error) {
				if (!userId || !shouldTryDisconnectFallback(error)) throw error;
				const nowIso = (/* @__PURE__ */ new Date()).toISOString();
				const relationUpdate = confirmAction === "disconnect" ? await supabase.from("reporting_relationships").update({
					status: "archived",
					ends_at: nowIso
				}).eq("engineer_id", userId).in("status", ["active", "in_handover"]) : { error: null };
				const inviteUpdate = await supabase.from("manager_invites").update({
					used_at: nowIso,
					used_by: userId
				}).eq("engineer_id", userId).is("used_at", null);
				if (relationUpdate.error) throw relationUpdate.error;
				if (inviteUpdate.error) throw inviteUpdate.error;
			}
			setActiveManager(null);
			setPendingInvite(null);
			setActiveInviteUrl(null);
			window.localStorage.removeItem(ACTIVE_INVITE_URL_STORAGE_KEY);
			setCopied(false);
			toast.success(confirmAction === "cancel" ? "Invite request cancelled." : "Manager disconnected successfully. Access revoked.");
		} catch (error) {
			const message = getErrorMessage$1(error, "Failed to disconnect manager.");
			toast.error(message);
		} finally {
			setIsDisconnecting(false);
			setShowConfirmModal(false);
			setConfirmAction(null);
		}
	}
	(0, import_react.useEffect)(() => {
		let active = true;
		async function syncManagerConnectionState() {
			if (!userId) {
				if (!active) return;
				setActiveInviteUrl(null);
				setActiveManager(null);
				setPendingInvite(null);
				setLoading(false);
				return;
			}
			const { data: relationship, error: relationshipError } = await supabase.from("reporting_relationships").select("id, manager_id, status, relation_type, created_at").eq("engineer_id", userId).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
			let nextActiveManager = null;
			if (!relationshipError && relationship) {
				const { data: managerProfile, error: managerProfileError } = await supabase.from("profiles").select("id, full_name, job_title, email").eq("id", relationship.manager_id).maybeSingle();
				if (!managerProfileError) nextActiveManager = {
					relationshipId: relationship.id,
					managerId: relationship.manager_id,
					fullName: managerProfile?.full_name?.trim() || "Manager",
					currentTitle: managerProfile?.job_title?.trim() || null,
					email: managerProfile?.email?.trim() || null
				};
			}
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			const { data: existingInvite, error: inviteError } = await supabase.from("manager_invites").select("id, relation_type, expires_at, created_at").eq("engineer_id", userId).is("used_at", null).gt("expires_at", nowIso).order("created_at", { ascending: false }).limit(1).maybeSingle();
			if (!active) return;
			setActiveManager(nextActiveManager);
			if (inviteError || !existingInvite) {
				window.localStorage.removeItem(ACTIVE_INVITE_URL_STORAGE_KEY);
				setActiveInviteUrl(null);
				setPendingInvite(null);
				setLoading(false);
				return;
			}
			const normalizedUrl = window.localStorage.getItem("active_manager_invite_url")?.trim() || null;
			setActiveInviteUrl(normalizedUrl);
			setPendingInvite({
				id: existingInvite.id,
				relationType: existingInvite.relation_type,
				expiresAt: existingInvite.expires_at,
				inviteUrl: normalizedUrl
			});
			setLoading(false);
		}
		syncManagerConnectionState();
		const intervalId = window.setInterval(() => {
			syncManagerConnectionState();
		}, 2e4);
		return () => {
			active = false;
			window.clearInterval(intervalId);
		};
	}, [userId]);
	function openDisconnectConfirm(action) {
		setConfirmAction(action);
		setShowConfirmModal(true);
	}
	const hasActiveManager = Boolean(activeManager);
	const hasPendingInvite = !hasActiveManager && Boolean(pendingInvite);
	const displayInviteUrl = activeInviteUrl || pendingInvite?.inviteUrl || "";
	const managerFieldValue = activeManager?.fullName || "Not connected";
	const managerTitleFieldValue = activeManager?.currentTitle || "Not connected";
	const managerEmailFieldValue = activeManager?.email || "Not connected";
	const statusText = hasActiveManager ? "Connected" : hasPendingInvite ? "Awaiting Activation" : null;
	const statusDotClass = hasActiveManager ? {
		ping: "bg-emerald-400",
		dot: "bg-emerald-500"
	} : {
		ping: "bg-amber-400",
		dot: "bg-amber-500"
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 w-full bg-slate-50 animate-pulse rounded-xl" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-bold tracking-tight",
					style: { color: C.navy },
					children: "Manager"
				}), statusText && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relative flex h-2 w-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `animate-ping absolute inline-flex h-full w-full rounded-full ${statusDotClass.ping} opacity-75` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `relative inline-flex rounded-full h-2 w-2 ${statusDotClass.dot}` })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium text-slate-500",
						children: statusText
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-xs",
				style: { color: C.subtle },
				children: "Manager fields are synced from the connected manager account."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold text-slate-400",
							children: "Full Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							title: managerFieldValue,
							className: "truncate max-w-[180px] sm:max-w-[240px] block text-slate-700",
							children: managerFieldValue
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold text-slate-400",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							title: managerEmailFieldValue,
							className: "truncate max-w-[180px] sm:max-w-[240px] block text-slate-700",
							children: managerEmailFieldValue
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold text-slate-400",
							children: "Title / Role"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							title: managerTitleFieldValue,
							className: "truncate max-w-[180px] sm:max-w-[240px] block text-slate-700",
							children: managerTitleFieldValue
						})]
					})
				]
			}),
			hasActiveManager && activeManager ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex flex-wrap items-center justify-end gap-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => openDisconnectConfirm("disconnect"),
					disabled: isDisconnecting,
					className: "inline-flex h-9 items-center justify-center rounded border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
					style: {
						borderColor: "#FFBDAD",
						background: "#FFEBE6",
						color: "#AE2A19"
					},
					children: isDisconnecting ? "Revoking access..." : "Disconnect access"
				}) })
			}) : hasPendingInvite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 rounded-md border p-4",
				style: {
					borderColor: C.border,
					background: C.card
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 max-w-xl w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							readOnly: true,
							value: displayInviteUrl || "Active invite found. Generate a fresh link if this browser lost it.",
							className: "flex-1 min-w-[220px] h-9 px-3 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-600 outline-none"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void handleCopyLink(),
							disabled: !displayInviteUrl,
							className: "h-9 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60",
							children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 14 }), "Copied!"] }) : "Copy Link"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between max-w-xl w-full text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-amber-700 bg-amber-50/60 px-2 py-0.5 rounded-sm font-medium",
							children: "Invite pending"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => openDisconnectConfirm("cancel"),
							className: "text-slate-500 hover:text-rose-600 font-medium transition-colors",
							children: "Cancel Request"
						})]
					})]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					style: { color: C.slate },
					children: "No manager connected yet."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void handleGenerateInvite(),
					disabled: isGenerating,
					className: "inline-flex h-9 items-center justify-center rounded bg-black px-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60",
					children: isGenerating ? "Generating..." : "Generate invite link"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showConfirmModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backdrop$2, {
				onClose: () => {
					setShowConfirmModal(false);
					setConfirmAction(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						scale: .97,
						y: 8
					},
					animate: {
						opacity: 1,
						scale: 1,
						y: 0
					},
					exit: {
						opacity: 0,
						scale: .97,
						y: 8
					},
					transition: { duration: .2 },
					className: "bg-white rounded-lg shadow-2xl w-full max-w-md border",
					style: { borderColor: C.border },
					onClick: (event) => event.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
								style: { background: "#FFEBE6" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									size: 18,
									style: { color: C.red }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-base font-bold",
									style: { color: C.navy },
									children: confirmAction === "cancel" ? "Cancel invite request?" : "Disconnect manager access?"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm mt-1.5 leading-relaxed",
									style: { color: C.slate },
									children: confirmAction === "cancel" ? "This will cancel the outstanding manager invite request. You can generate a new invite link anytime." : "This removes your manager's review, alignment, and comment access to your workspace metrics. Your history remains intact."
								})]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-3 border-t flex items-center justify-end gap-2",
						style: {
							borderColor: C.border,
							background: C.bg
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setShowConfirmModal(false);
								setConfirmAction(null);
							},
							disabled: isDisconnecting,
							className: "px-3 py-1.5 rounded text-sm font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void handleDisconnectManager(),
							disabled: isDisconnecting,
							className: "px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60",
							style: { background: C.red },
							children: isDisconnecting ? "Revoking..." : confirmAction === "cancel" ? "Yes, Cancel Request" : "Yes, Disconnect"
						})]
					})]
				})
			}) })
		]
	});
}
function NotificationsSettings() {
	const { userId } = useAuth();
	const settingsUserId = userId ?? "";
	const queryClient = useQueryClient();
	const { data: settings } = useSettingsQuery(settingsUserId);
	const saveNotificationsMutation = useSaveNotifications(settingsUserId);
	const [a, setA] = (0, import_react.useState)(true);
	const [b, setB] = (0, import_react.useState)(true);
	const [c, setC] = (0, import_react.useState)(false);
	const [d, setD] = (0, import_react.useState)(true);
	const [timeSlots, setTimeSlots] = (0, import_react.useState)(["16:00"]);
	const [snoozeMinutes, setSnoozeMinutes] = (0, import_react.useState)(15);
	const [weekdaysOnly, setWeekdaysOnly] = (0, import_react.useState)(true);
	const [timezone, setTimezone] = (0, import_react.useState)(getCurrentTimeZone());
	function normalizeWallClockTime(value) {
		const trimmed = value.trim();
		const direct = trimmed.match(/^(\d{1,2}):(\d{2})$/);
		if (direct) {
			const hour = Number(direct[1]);
			const minute = Number(direct[2]);
			if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
			return null;
		}
		const embedded = trimmed.match(/(?:T|\s)(\d{2}):(\d{2})/);
		if (!embedded) return null;
		return `${embedded[1]}:${embedded[2]}`;
	}
	const timezoneOptions = [
		{
			label: "London",
			value: "Europe/London"
		},
		{
			label: "New York",
			value: "America/New_York"
		},
		{
			label: "Los Angeles",
			value: "America/Los_Angeles"
		},
		{
			label: "Paris / Berlin",
			value: "Europe/Paris"
		},
		{
			label: "India (IST)",
			value: "Asia/Kolkata"
		},
		{
			label: "Singapore",
			value: "Asia/Singapore"
		},
		{
			label: "Tokyo",
			value: "Asia/Tokyo"
		},
		{
			label: "Sydney",
			value: "Australia/Sydney"
		},
		{
			label: "Universal Time",
			value: "UTC"
		}
	];
	const validTimezoneValues = new Set(timezoneOptions.map((option) => option.value));
	function normalizeTimezoneValue(value) {
		const systemZone = getCurrentTimeZone();
		const fallback = validTimezoneValues.has(systemZone) ? systemZone : "UTC";
		if (!value) return fallback;
		const trimmed = value.trim();
		if (validTimezoneValues.has(trimmed)) return trimmed;
		const migrated = {
			"UTC-08:00 (PST)": "America/Los_Angeles",
			"UTC-05:00 (EST)": "America/New_York",
			"UTC+00:00 (GMT/UTC Standard)": "UTC",
			"UTC+01:00 (BST)": "Europe/London",
			"UTC+05:30 (IST)": "Asia/Kolkata",
			"UTC+08:00 (SGT)": "Asia/Singapore",
			"UTC+09:00 (JST)": "Asia/Tokyo",
			"UTC+10:00 (AEST)": "Australia/Sydney",
			GMT: "UTC"
		}[trimmed];
		if (migrated && validTimezoneValues.has(migrated)) return migrated;
		return fallback;
	}
	const saveProfileTimezoneMutation = useMutation({
		mutationFn: async (nextTimezone) => {
			if (!settingsUserId) return;
			const { error } = await supabase.from("profiles").update({ timezone: nextTimezone }).eq("id", settingsUserId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile", settingsUserId] });
		}
	});
	const { data: profilePromptTimes = [] } = useQuery({
		queryKey: ["profile-prompt-times", settingsUserId],
		enabled: Boolean(settingsUserId),
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("prompt_times").eq("id", settingsUserId).maybeSingle();
			if (error) throw error;
			return (Array.isArray(data?.prompt_times) ? data.prompt_times : []).map((value) => normalizeWallClockTime(String(value))).filter((value) => Boolean(value));
		}
	});
	const saveProfilePromptTimesMutation = useMutation({
		mutationFn: async (nextPromptTimes) => {
			if (!settingsUserId) return;
			const sanitized = nextPromptTimes.map((value) => normalizeWallClockTime(String(value))).filter((value) => Boolean(value));
			const payload = sanitized.length > 0 ? sanitized : ["16:00"];
			const { error } = await supabase.from("profiles").update({ prompt_times: payload }).eq("id", settingsUserId);
			if (error) throw error;
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile-prompt-times", settingsUserId] });
		}
	});
	function sendExtensionConfig(notifications) {
		const chromeApi = globalThis.chrome;
		if (!chromeApi?.runtime?.sendMessage) return;
		chromeApi.runtime.sendMessage({
			type: "UPDATE_PROMPT_CONFIG",
			scheduleTimes: notifications.dailyReminder ? notifications.extensionPromptTimes : [],
			snoozeMinutes: notifications.extensionSnoozeMinutes,
			weekdaysOnly: notifications.extensionWeekdaysOnly,
			timezone: notifications.extensionTimezone
		});
	}
	(0, import_react.useEffect)(() => {
		if (!settings) return;
		setA(settings.notifications.dailyReminder);
		setB(settings.notifications.managerApprovals);
		setC(settings.notifications.weeklyDigest);
		setD(settings.notifications.browserPush);
		const normalizedProfileSlots = profilePromptTimes.map((value) => normalizeWallClockTime(value)).filter((value) => Boolean(value));
		const normalizedSettingsSlots = settings.notifications.extensionPromptTimes.map((value) => normalizeWallClockTime(value)).filter((value) => Boolean(value));
		const normalizedSlots = normalizedProfileSlots.length > 0 ? normalizedProfileSlots : normalizedSettingsSlots;
		setTimeSlots(normalizedSlots.length > 0 ? normalizedSlots : ["16:00"]);
		setSnoozeMinutes(settings.notifications.extensionSnoozeMinutes);
		setWeekdaysOnly(settings.notifications.extensionWeekdaysOnly);
		setTimezone(normalizeTimezoneValue(settings.notifications.extensionTimezone));
	}, [profilePromptTimes, settings]);
	(0, import_react.useEffect)(() => {
		if (!settings) return;
		sendExtensionConfig(settings.notifications);
	}, [settings]);
	function persist(next) {
		if (!settings) return;
		const notifications = {
			...settings.notifications,
			...next
		};
		const normalizedPromptTimes = (notifications.extensionPromptTimes ?? []).map((value) => normalizeWallClockTime(String(value))).filter((value) => Boolean(value));
		notifications.extensionPromptTimes = normalizedPromptTimes.length > 0 ? [...new Set(normalizedPromptTimes)] : ["16:00"];
		saveNotificationsMutation.mutate(notifications);
		saveProfilePromptTimesMutation.mutate(notifications.extensionPromptTimes);
		sendExtensionConfig(notifications);
	}
	function updateTimeSlot(index, nextValue) {
		const next = [...timeSlots];
		next[index] = normalizeWallClockTime(nextValue) ?? nextValue;
		setTimeSlots(next);
		const sanitized = [...new Set(next.map((value) => normalizeWallClockTime(value)).filter((value) => Boolean(value)))].sort();
		if (sanitized.length > 0) persist({ extensionPromptTimes: sanitized });
	}
	function addTimeSlot() {
		const next = [...timeSlots, "17:00"];
		setTimeSlots(next);
		persist({ extensionPromptTimes: [...new Set(next.map((value) => normalizeWallClockTime(value)).filter((value) => Boolean(value)))].sort() });
	}
	function removeTimeSlot(index) {
		if (timeSlots.length <= 1) return;
		const next = timeSlots.filter((_, slotIndex) => slotIndex !== index);
		setTimeSlots(next);
		const sanitized = [...new Set(next.map((value) => normalizeWallClockTime(value)).filter((value) => Boolean(value)))].sort();
		persist({ extensionPromptTimes: sanitized.length > 0 ? sanitized : ["16:00"] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-base font-bold tracking-tight",
			style: { color: C.navy },
			children: "Notifications"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs mt-1",
			style: { color: C.subtle },
			children: "Control how Evitrace reaches you"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
					title: "Daily reflection reminder",
					desc: "Nudge me at 16:00 to log evidence before close of day.",
					right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						on: a,
						onChange: () => {
							const checked = !a;
							setA(checked);
							persist({ dailyReminder: checked });
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
					title: "Manager approvals",
					desc: "Email me when my manager approves or comments.",
					right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						on: b,
						onChange: () => {
							const checked = !b;
							setB(checked);
							persist({ managerApprovals: checked });
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
					title: "Weekly digest",
					desc: "Monday summary of evidence, gaps, and objective progress.",
					right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						on: c,
						onChange: () => {
							const checked = !c;
							setC(checked);
							persist({ weeklyDigest: checked });
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
					title: "Browser push",
					desc: "Show desktop notifications from the Evitrace extension.",
					right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						on: d,
						onChange: () => {
							const checked = !d;
							setD(checked);
							persist({ browserPush: checked });
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between py-3 border-b last:border-b-0",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pr-6 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold",
							style: { color: C.navy },
							children: "Extension prompt times"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs mt-0.5",
							style: { color: C.subtle },
							children: "Add one or more reminder times. These drive extension prompt alarms."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-[220px] space-y-2",
						children: [timeSlots.map((slot, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "time",
								value: slot,
								onChange: (event) => updateTimeSlot(idx, event.target.value),
								className: "h-9 w-full px-2 rounded border text-sm bg-[#F4F5F7] focus:bg-white outline-none",
								style: {
									borderColor: C.border,
									color: C.navy
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => removeTimeSlot(idx),
								disabled: timeSlots.length <= 1,
								className: "h-9 w-9 rounded border inline-flex items-center justify-center disabled:opacity-50",
								style: {
									borderColor: C.border,
									color: C.slate
								},
								title: "Remove time",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 14 })
							})]
						}, `slot-${idx}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: addTimeSlot,
							className: "h-8 px-2.5 rounded border inline-flex items-center gap-1 text-xs font-semibold",
							style: {
								borderColor: C.border,
								color: C.primary
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 12 }), "Add time slot"]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
					title: "Weekdays only",
					desc: "Only trigger reminders Monday through Friday.",
					right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						on: weekdaysOnly,
						onChange: () => {
							const checked = !weekdaysOnly;
							setWeekdaysOnly(checked);
							persist({ extensionWeekdaysOnly: checked });
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between py-3 border-b last:border-b-0",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pr-6 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold",
							style: { color: C.navy },
							children: "Snooze duration"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs mt-0.5",
							style: { color: C.subtle },
							children: "One-time snooze window for each prompt event."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-[120px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: String(snoozeMinutes),
							onChange: (event) => {
								const next = Number(event.target.value);
								setSnoozeMinutes(next);
								persist({ extensionSnoozeMinutes: next });
							},
							className: "h-9 w-full px-2 rounded border text-sm bg-[#F4F5F7] focus:bg-white outline-none",
							style: {
								borderColor: C.border,
								color: C.navy
							},
							children: [
								5,
								10,
								15,
								20,
								30,
								45,
								60
							].map((minutes) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: minutes,
								children: [minutes, " min"]
							}, minutes))
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
					title: "Application Tracking Time Zone",
					desc: "Standardized UTC offset used for reminders and profile-level tracking.",
					right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: timezone,
						onChange: (event) => {
							const next = normalizeTimezoneValue(event.target.value);
							setTimezone(next);
							persist({ extensionTimezone: next });
							saveProfileTimezoneMutation.mutate(next);
						},
						className: "h-9 w-[270px] px-2 rounded border text-sm bg-[#F4F5F7] focus:bg-white outline-none",
						style: {
							borderColor: C.border,
							color: C.navy
						},
						children: timezoneOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: option.value,
							children: option.label
						}, option.value))
					})
				})
			]
		})]
	});
}
function IntegrationRow({ icon, iconBg, iconColor, title, desc, on, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between py-3 border-b last:border-b-0",
		style: { borderColor: C.border },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 pr-6 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-9 h-9 rounded flex items-center justify-center shrink-0",
				style: {
					background: iconBg,
					color: iconColor
				},
				children: icon
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold",
					style: { color: C.navy },
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs mt-0.5",
					style: { color: C.subtle },
					children: desc
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
			on,
			onChange: () => onChange(!on)
		})]
	});
}
function ExtensionSettings() {
	const { userId } = useAuth();
	const settingsUserId = userId ?? "";
	const { data: settings } = useSettingsQuery(settingsUserId);
	const saveIntegrationsMutation = useSaveIntegrations(settingsUserId);
	const [auto, setAuto] = (0, import_react.useState)(true);
	const [jira, setJira] = (0, import_react.useState)(true);
	const [github, setGithub] = (0, import_react.useState)(true);
	const [bitbucket, setBitbucket] = (0, import_react.useState)(false);
	const [slack, setSlack] = (0, import_react.useState)(false);
	const [teams, setTeams] = (0, import_react.useState)(false);
	const [confluence, setConfluence] = (0, import_react.useState)(false);
	const [notion, setNotion] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!settings) return;
		setAuto(settings.integrations.autoCaptureEvents);
		setJira(settings.integrations.jira);
		setGithub(settings.integrations.github);
		setBitbucket(settings.integrations.bitbucket);
		setSlack(settings.integrations.slack);
		setTeams(settings.integrations.teams);
		setConfluence(settings.integrations.confluence);
		setNotion(settings.integrations.notion);
	}, [settings]);
	function persist(next) {
		if (!settings) return;
		const integrations = {
			...settings.integrations,
			...next
		};
		saveIntegrationsMutation.mutate(integrations);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-bold tracking-tight",
					style: { color: C.navy },
					children: "Extension Preferences"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs mt-1",
					style: { color: C.subtle },
					children: "Capture sources and trigger windows"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
						title: "Auto-capture events",
						desc: "Surface a capture prompt when work is completed.",
						right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							on: auto,
							onChange: (value) => {
								setAuto(value);
								persist({ autoCaptureEvents: value });
							}
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-bold tracking-tight",
					style: { color: C.navy },
					children: "Development & Issue Tracking"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs mt-1",
					style: { color: C.subtle },
					children: "Capture merged PRs, code reviews, and ticket transitions."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntegrationRow, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTodo, { size: 16 }),
							iconBg: "#DEEBFF",
							iconColor: "#0052CC",
							title: "Jira",
							desc: "Trigger when a ticket moves to Done.",
							on: jira,
							onChange: (value) => {
								setJira(value);
								persist({ jira: value });
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntegrationRow, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { size: 16 }),
							iconBg: "#F4F5F7",
							iconColor: "#172B4D",
							title: "GitHub",
							desc: "Trigger when a PR is merged with you as author or reviewer.",
							on: github,
							onChange: (value) => {
								setGithub(value);
								persist({ github: value });
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntegrationRow, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitBranch, { size: 16 }),
							iconBg: "#DEEBFF",
							iconColor: "#0052CC",
							title: "Bitbucket",
							desc: "Capture merged pull requests and code reviews.",
							on: bitbucket,
							onChange: (value) => {
								setBitbucket(value);
								persist({ bitbucket: value });
							}
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-bold tracking-tight",
					style: { color: C.navy },
					children: "Communication"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs mt-1",
					style: { color: C.subtle },
					children: "Capture saved conversations, recaps, and channel highlights."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntegrationRow, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slack, { size: 16 }),
						iconBg: "#F4ECFB",
						iconColor: "#5243AA",
						title: "Slack",
						desc: "Capture saved messages and channel threads tagged with #wins.",
						on: slack,
						onChange: (value) => {
							setSlack(value);
							persist({ slack: value });
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntegrationRow, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { size: 16 }),
						iconBg: "#E6F0FF",
						iconColor: "#4B53BC",
						title: "Microsoft Teams",
						desc: "Capture meeting recaps and team channel mentions.",
						on: teams,
						onChange: (value) => {
							setTeams(value);
							persist({ teams: value });
						}
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-bold tracking-tight",
					style: { color: C.navy },
					children: "Documentation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs mt-1",
					style: { color: C.subtle },
					children: "Capture docs, pages, and knowledge base contributions."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntegrationRow, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { size: 16 }),
						iconBg: "#DEEBFF",
						iconColor: "#0052CC",
						title: "Confluence",
						desc: "Capture pages you author, edit, or get tagged in.",
						on: confluence,
						onChange: (value) => {
							setConfluence(value);
							persist({ confluence: value });
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntegrationRow, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notebook, { size: 16 }),
						iconBg: "#F4F5F7",
						iconColor: "#172B4D",
						title: "Notion",
						desc: "Capture databases and docs you contribute to.",
						on: notion,
						onChange: (value) => {
							setNotion(value);
							persist({ notion: value });
						}
					})]
				})]
			})
		]
	});
}
var MATRIX_PILLARS = [
	{
		key: "technical_execution",
		label: "Technical Execution",
		keywords: [
			"code",
			"bug",
			"architecture",
			"design",
			"system",
			"scal",
			"api",
			"test",
			"quality",
			"refactor",
			"performance",
			"incident"
		]
	},
	{
		key: "collaboration",
		label: "Collaboration",
		keywords: [
			"team",
			"mentor",
			"review",
			"feedback",
			"stakeholder",
			"commun",
			"partner",
			"cross",
			"alignment",
			"coach",
			"support",
			"documentation"
		]
	},
	{
		key: "delivery_reliability",
		label: "Delivery Reliability",
		keywords: [
			"deliver",
			"ship",
			"sprint",
			"deadline",
			"release",
			"execution",
			"launch",
			"scope",
			"estimate",
			"ownership",
			"risk",
			"roadmap",
			"milestone"
		]
	}
];
var FALLBACK_PILLARS = {
	technical_execution: ["Builds reliable implementations and improves code quality through testing and review.", "Breaks technical problems into clear, maintainable implementation steps."],
	collaboration: ["Communicates progress and blockers clearly to teammates and partners.", "Works collaboratively through feedback and cross-functional coordination."],
	delivery_reliability: ["Plans and ships scoped work with predictable cadence.", "Owns delivery follow-through and raises risks early."]
};
var SAMPLE_MATRIX_TEMPLATE = {
	junior: {
		technical_execution: [
			"Implements clean, readable code for scoped tasks.",
			"Fixes straightforward bugs and adds baseline tests.",
			"Learns architecture patterns used in the current codebase."
		],
		collaboration: [
			"Asks for support early and follows through on review feedback.",
			"Documents task progress and keeps teammates informed.",
			"Participates constructively in team discussions and retrospectives."
		],
		delivery_reliability: [
			"Completes well-defined tickets within expected timelines.",
			"Follows team release and branching workflows consistently.",
			"Escalates blockers quickly to avoid delivery delays."
		]
	},
	mid: {
		technical_execution: [
			"Owns medium complexity features end-to-end.",
			"Writes robust tests and debugs cross-module issues.",
			"Improves architecture decisions with practical trade-off analysis."
		],
		collaboration: [
			"Partners effectively with product, design, and engineering peers.",
			"Gives high-signal code review feedback and shares context.",
			"Coordinates dependencies and keeps execution aligned across teammates."
		],
		delivery_reliability: [
			"Ships predictably across sprints and maintains quality.",
			"Manages scope with clear milestones and risk visibility.",
			"Supports incident response and follow-up actions effectively."
		]
	},
	senior: {
		technical_execution: [
			"Designs scalable systems and leads architecture evolution.",
			"Raises engineering standards through deep reviews and mentorship.",
			"Converts ambiguous requirements into clear technical plans."
		],
		collaboration: [
			"Mentors engineers and amplifies team capability.",
			"Aligns cross-functional stakeholders on technical direction.",
			"Drives clear technical communication through design docs and RFCs."
		],
		delivery_reliability: [
			"Owns delivery outcomes for critical initiatives.",
			"Balances speed, quality, and operational risk under pressure.",
			"Builds resilient processes that improve long-term execution reliability."
		]
	}
};
function normalizeMatrix(input) {
	if (!input || typeof input !== "object") return null;
	const candidate = input;
	const levels = [
		"junior",
		"mid",
		"senior"
	];
	const pillars = [
		"technical_execution",
		"collaboration",
		"delivery_reliability"
	];
	const normalized = {};
	for (const level of levels) {
		const levelValue = candidate[level];
		if (!levelValue || typeof levelValue !== "object") return null;
		const levelRecord = levelValue;
		normalized[level] = {
			technical_execution: [],
			collaboration: [],
			delivery_reliability: []
		};
		for (const pillar of pillars) {
			const pillarValue = levelRecord[pillar];
			if (!Array.isArray(pillarValue)) return null;
			normalized[level][pillar] = pillarValue.map((entry) => typeof entry === "string" ? entry.trim() : "").filter((entry) => entry.length > 0);
		}
	}
	return normalized;
}
function levelFromCurrentRole(currentLevel) {
	const value = (currentLevel ?? "").trim().toLowerCase();
	if (value.includes("junior") || value.includes("associate")) return "junior";
	if (value.includes("senior") || value.includes("lead") || value.includes("staff") || value.includes("principal")) return "senior";
	return "mid";
}
function splitRawTextIntoBlocks(rawText) {
	return rawText.split(/\r?\n+/).flatMap((line) => line.split(/[•·;|]+/)).map((line) => line.replace(/^\s*([-*•\u2022]|\d+[\.\)])\s*/, "").trim()).filter((line) => line.length > 0);
}
function classifyRawLine(line, bucketSizes) {
	const normalizedLine = line.toLowerCase();
	let winningKey = "technical_execution";
	let winningScore = -1;
	for (const pillar of MATRIX_PILLARS) {
		const score = pillar.keywords.reduce((sum, keyword) => sum + (normalizedLine.includes(keyword) ? 1 : 0), 0);
		if (score > winningScore) {
			winningScore = score;
			winningKey = pillar.key;
		}
	}
	if (winningScore > 0) return winningKey;
	return Object.keys(bucketSizes).sort((a, b) => bucketSizes[a] - bucketSizes[b])[0] ?? "technical_execution";
}
function buildMatrixFromRawText(rawText) {
	const lines = splitRawTextIntoBlocks(rawText);
	const buckets = {
		technical_execution: [],
		collaboration: [],
		delivery_reliability: []
	};
	for (const line of lines) buckets[classifyRawLine(line, {
		technical_execution: buckets.technical_execution.length,
		collaboration: buckets.collaboration.length,
		delivery_reliability: buckets.delivery_reliability.length
	})].push(line);
	const merged = {
		technical_execution: [...buckets.technical_execution, ...FALLBACK_PILLARS.technical_execution].slice(0, 9),
		collaboration: [...buckets.collaboration, ...FALLBACK_PILLARS.collaboration].slice(0, 9),
		delivery_reliability: [...buckets.delivery_reliability, ...FALLBACK_PILLARS.delivery_reliability].slice(0, 9)
	};
	return {
		junior: {
			technical_execution: merged.technical_execution.slice(0, 3),
			collaboration: merged.collaboration.slice(0, 3),
			delivery_reliability: merged.delivery_reliability.slice(0, 3)
		},
		mid: {
			technical_execution: merged.technical_execution.slice(0, 5),
			collaboration: merged.collaboration.slice(0, 5),
			delivery_reliability: merged.delivery_reliability.slice(0, 5)
		},
		senior: {
			technical_execution: merged.technical_execution.slice(0, 7),
			collaboration: merged.collaboration.slice(0, 7),
			delivery_reliability: merged.delivery_reliability.slice(0, 7)
		}
	};
}
var COMPETENCY_DESC = {
	"Analytical Thinking": "Identifies critical connections and patterns in information/data to diagnose root causes.",
	"System Design": "Designs scalable, resilient services and articulates trade-offs across components.",
	"Code Quality": "Writes maintainable, well-tested code and raises the bar through reviews.",
	Communication: "Listens and communicates openly, honestly, and respectfully with different audiences.",
	Leadership: "Influences direction, mentors peers, and drives alignment across teams.",
	"Engineering for UX": "Partners with design to deliver thoughtful, accessible, and performant user experiences.",
	Security: "Anticipates threats and embeds secure-by-default practices into the SDLC.",
	Delivery: "Breaks down complex work and ships reliably with predictable cadence."
};
var EFFECTIVENESS_SCALE = [
	{
		value: 1,
		label: "Limited Effectiveness",
		tone: "danger"
	},
	{
		value: 2,
		label: "Somewhat Effective",
		tone: "warning"
	},
	{
		value: 3,
		label: "Fully Effective",
		tone: "info"
	},
	{
		value: 4,
		label: "Highly Effective",
		tone: "success"
	},
	{
		value: 5,
		label: "Extremely Effective",
		tone: "success"
	}
];
var SUBCATEGORIES = {
	"Analytical Thinking": [
		"Draws logical conclusions based on in-depth analysis of information",
		"Diagnoses root causes vs. symptoms in production incidents",
		"Synthesizes data from multiple sources to frame complex problems"
	],
	"System Design": [
		"Designs scalable services with clear failure modes and SLOs",
		"Articulates trade-offs across consistency, availability, and cost",
		"Reviews and improves architecture proposals across the team"
	],
	"Code Quality": [
		"Describes what code smells are and refactors to remove them",
		"Conversant in the language's syntax, idioms, and standard library",
		"Writes meaningful unit, integration, and system tests"
	],
	Communication: [
		"Listens actively and communicates respectfully with different audiences",
		"Writes clear technical documents (RFCs, runbooks, postmortems)",
		"Adapts the message and depth to the audience"
	],
	Leadership: [
		"Influences direction and drives alignment across teams",
		"Mentors peers and grows engineers around them",
		"Takes ownership of cross-team outcomes"
	],
	"Engineering for UX": [
		"Applies UX heuristics and accessibility standards to shipped features",
		"Partners with design through the full delivery lifecycle",
		"Instruments and learns from real user behavior"
	],
	Security: [
		"Anticipates threats and embeds secure-by-default practices in the SDLC",
		"Identifies and remediates common vulnerability classes (OWASP Top 10)",
		"Reviews code and designs through a security lens"
	],
	Delivery: [
		"Breaks down complex work into shippable, predictable increments",
		"Ships reliably with a sustainable cadence",
		"Coordinates dependencies across squads to unblock outcomes"
	]
};
function buildFallbackCategoryMap() {
	return Object.fromEntries(Object.entries(SUBCATEGORIES).map(([categoryName, items]) => [categoryName, {
		summary: COMPETENCY_DESC[categoryName] ?? "",
		items
	}]));
}
function parseFrameworkCategoryMap(matrix) {
	if (!matrix || typeof matrix !== "object") return null;
	const rawCategories = matrix.categories;
	if (!rawCategories || typeof rawCategories !== "object" || Array.isArray(rawCategories)) return null;
	const parsed = Object.entries(rawCategories).reduce((acc, [categoryName, rawCategory]) => {
		if (!rawCategory || typeof rawCategory !== "object") return acc;
		const candidate = rawCategory;
		const summary = typeof candidate.summary === "string" ? candidate.summary.trim() : "";
		const items = Array.isArray(candidate.items) ? candidate.items.map((item) => typeof item === "string" ? item.trim() : "").filter((item) => item.length > 0) : [];
		if (items.length === 0) return acc;
		acc[categoryName] = {
			summary,
			items
		};
		return acc;
	}, {});
	return Object.keys(parsed).length > 0 ? parsed : null;
}
function resolveFrameworkCategoryMap(matrix) {
	return parseFrameworkCategoryMap(matrix) ?? buildFallbackCategoryMap();
}
function resolveFrameworkCategoryEntries(matrix) {
	return Object.entries(resolveFrameworkCategoryMap(matrix));
}
function buildFrameworkCategoryMapFromContext(categories, getQuestionsForCategory) {
	return categories.reduce((acc, categoryName) => {
		acc[categoryName] = {
			summary: "",
			items: getQuestionsForCategory(categoryName)
		};
		return acc;
	}, {});
}
function normalizeCategoryName(value) {
	return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}
function resolveCategoryFromFramework(value, frameworkCategories) {
	const normalized = normalizeCategoryName(value);
	const direct = frameworkCategories.find((category) => normalizeCategoryName(category) === normalized);
	if (direct) return direct;
	return frameworkCategories.find((category) => normalizeCategoryName(category).includes(normalized) || normalized.includes(normalizeCategoryName(category))) ?? null;
}
function SettingsView({ sampleContent, onSampleContentChange, section, onSectionChange }) {
	const { user, updateUser } = useAuth();
	const { mode } = useWorkspace();
	const navigate = useNavigate();
	const [draft, setDraft] = (0, import_react.useState)(EMPTY_PROFILE_TEAM_DRAFT);
	const [confirmingSave, setConfirmingSave] = (0, import_react.useState)(false);
	const [showConfirmModal, setShowConfirmModal] = (0, import_react.useState)(false);
	const [savePassword, setSavePassword] = (0, import_react.useState)("");
	const [isSavingAll, setIsSavingAll] = (0, import_react.useState)(false);
	const [isDeletingAccount, setIsDeletingAccount] = (0, import_react.useState)(false);
	const isProfileOrTeamSection = section === "profile" || section === "team";
	const isManagerMode = mode === "manager";
	const visibleSettingsSections = (0, import_react.useMemo)(() => isManagerMode ? SETTINGS_SECTION_ITEMS.filter((item) => item.id === "profile") : SETTINGS_SECTION_ITEMS, [isManagerMode]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		setDraft(profileTeamDraftFromUser(user));
	}, [user]);
	(0, import_react.useEffect)(() => {
		if (!isManagerMode || section === "profile") return;
		onSectionChange("profile");
		navigate({ to: getSettingsSectionPath("profile") });
	}, [
		isManagerMode,
		navigate,
		onSectionChange,
		section
	]);
	const hasProfileTeamChanges = (0, import_react.useMemo)(() => hasProfileTeamDraftChanges(draft, user), [draft, user]);
	function updateDraft(next) {
		setDraft((prev) => ({
			...prev,
			...next
		}));
	}
	async function saveAllSettings() {
		if (!user) return;
		if (!hasProfileTeamChanges) {
			toast.success("All settings are already up to date.");
			setConfirmingSave(false);
			setSavePassword("");
			return;
		}
		setIsSavingAll(true);
		const unifiedCurrentLevel = draft.currentLevel.trim();
		const ok = await updateUser({
			fullName: draft.fullName.trim(),
			email: draft.email.trim(),
			currentLevel: unifiedCurrentLevel,
			jobTitle: unifiedCurrentLevel,
			targetLevel: draft.targetLevel.trim(),
			manager: draft.manager.trim(),
			managerEmail: draft.managerEmail.trim(),
			team: draft.team.trim(),
			skipLevel: draft.skipLevel.trim()
		}, savePassword);
		setIsSavingAll(false);
		if (!ok) {
			toast.error("Incorrect password");
			return;
		}
		setConfirmingSave(false);
		setSavePassword("");
		toast.success("All settings saved");
	}
	async function handleDeleteAccount() {
		try {
			setIsDeletingAccount(true);
			const { error } = await supabase.rpc("delete_user_account");
			if (error) throw error;
			toast.success("Account deleted permanently.");
			await supabase.auth.signOut();
			navigate({
				to: "/",
				replace: true
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete account.";
			toast.error(message);
		} finally {
			setIsDeletingAccount(false);
			setShowConfirmModal(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-4 gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "col-span-1 p-2 h-fit",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "space-y-0.5",
					children: visibleSettingsSections.map((it) => {
						const Icon = it.icon;
						const active = section === it.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: getSettingsSectionPath(it.id),
							onClick: () => onSectionChange(it.id),
							className: "w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-sm font-medium transition-colors",
							style: {
								background: active ? C.primarySoft : "transparent",
								color: active ? C.primary : C.slate
							},
							onMouseEnter: (e) => {
								if (!active) e.currentTarget.style.background = "#F4F5F7";
							},
							onMouseLeave: (e) => {
								if (!active) e.currentTarget.style.background = "transparent";
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 16 }), it.label]
						}, it.id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-3 space-y-6",
				children: [isManagerMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagerIdentityCard, {
					fullName: user?.fullName ?? null,
					email: user?.email ?? null,
					currentLevel: user?.currentLevel ?? null
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					(section === "profile" || section === "team") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSettings, {
						draft,
						onChange: updateDraft
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamSettings, {})] }),
					section === "notifications" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsSettings, {}),
					section === "extension" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExtensionSettings, {}),
					section === "framework" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FrameworkSettings, {}),
					section === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardSamplesSettings, {
						sampleContent,
						onSampleContentChange
					})
				] }), !isManagerMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t pt-4",
					style: { borderColor: C.border },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
							onClick: () => {
								if (!isProfileOrTeamSection) {
									toast.success("Settings saved");
									return;
								}
								setConfirmingSave(true);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 14 }), "Save All Settings"]
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t pt-6 mt-8",
					style: { borderColor: C.border },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-md border px-4 py-4",
						style: {
							borderColor: C.border,
							background: C.card
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									size: 16,
									style: { color: C.subtle }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-bold uppercase tracking-wider",
										style: { color: C.subtle },
										children: "Danger Zone"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm leading-relaxed",
										style: { color: C.slate },
										children: "Permanently delete your account and all related workspace data. This action cannot be undone."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShowConfirmModal(true),
										className: "mt-3 h-9 px-3 rounded border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
										style: {
											borderColor: "#FF5630",
											color: "#AE2A19",
											background: "#FFFAF8"
										},
										disabled: isDeletingAccount,
										children: isDeletingAccount ? "Deleting account..." : "Delete account"
									})
								]
							})]
						})
					})
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: confirmingSave && isProfileOrTeamSection && !isManagerMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backdrop$2, {
				onClose: () => setConfirmingSave(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						scale: .97,
						y: 8
					},
					animate: {
						opacity: 1,
						scale: 1,
						y: 0
					},
					exit: {
						opacity: 0,
						scale: .97,
						y: 8
					},
					transition: { duration: .2 },
					className: "bg-white rounded-lg shadow-2xl w-full max-w-md border",
					style: { borderColor: C.border },
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-5 border-b flex items-center justify-between",
							style: { borderColor: C.border },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-8 h-8 rounded flex items-center justify-center",
									style: {
										background: C.primarySoft,
										color: C.primary
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 16 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-bold",
									style: { color: C.navy },
									children: "Confirm your password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs",
									style: { color: C.subtle },
									children: "Required to save profile settings."
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setConfirmingSave(false),
								className: "p-1 rounded hover:bg-[#F4F5F7]",
								style: { color: C.slate },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Current password",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									value: savePassword,
									onChange: (e) => setSavePassword(e.target.value),
									placeholder: "Enter your password",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { size: 14 })
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 border-t flex justify-end gap-2",
							style: { borderColor: C.border },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
								onClick: () => setConfirmingSave(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
								disabled: !savePassword.trim() || isSavingAll,
								onClick: () => {
									saveAllSettings();
								},
								children: isSavingAll ? "Saving..." : "Save All Settings"
							})]
						})
					]
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showConfirmModal && !isManagerMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backdrop$2, {
				onClose: () => setShowConfirmModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						scale: .97,
						y: 8
					},
					animate: {
						opacity: 1,
						scale: 1,
						y: 0
					},
					exit: {
						opacity: 0,
						scale: .97,
						y: 8
					},
					transition: { duration: .2 },
					className: "bg-white rounded-lg shadow-2xl w-full max-w-md border",
					style: { borderColor: C.border },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
								style: { background: "#FFEBE6" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									size: 18,
									style: { color: C.red }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-base font-bold",
									style: { color: C.navy },
									children: "Delete account permanently?"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm mt-1.5 leading-relaxed",
									style: { color: C.slate },
									children: "This removes your login, evidence logs, objectives, and reporting relationships. This action cannot be undone."
								})]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-3 border-t flex items-center justify-end gap-2",
						style: {
							borderColor: C.border,
							background: C.bg
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
							onClick: () => setShowConfirmModal(false),
							disabled: isDeletingAccount,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void handleDeleteAccount(),
							disabled: isDeletingAccount,
							className: "px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60",
							style: { background: C.red },
							children: isDeletingAccount ? "Deleting..." : "Delete account"
						})]
					})]
				})
			}) })
		]
	});
}
function ManagerIdentityCard({ fullName, email, currentLevel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-5 py-4 border-b border-slate-100 bg-slate-50/50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-xs font-bold text-slate-700 uppercase tracking-wider",
					children: "Manager Profile Identity"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-5 grid grid-cols-1 md:grid-cols-3 gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdentityField, {
						label: "Full Name",
						value: fullName ?? "Not Provided"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdentityField, {
						label: "Corporate Email",
						value: email ?? "Not Provided"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IdentityField, {
						label: "Current Corporate Title",
						value: currentLevel ?? "Manager Profile Context"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 py-3 bg-slate-50/30 border-t border-slate-100 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] bg-slate-100 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 font-mono",
					children: "INFO"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] italic text-slate-400 leading-normal",
					children: "Manager profile details are synced from your active account context. Toggle to Developer Space to manage personal notification and extension preferences."
				})]
			})
		]
	});
}
function IdentityField({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-[10px] font-bold text-slate-400 uppercase tracking-wider",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-semibold text-slate-800 block truncate",
			title: value,
			children: value
		})]
	});
}
function FrameworkSettings() {
	const { userId, user } = useAuth();
	const frameworkUserId = userId ?? "";
	const queryClient = useQueryClient();
	const inputRef = (0, import_react.useRef)(null);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const [parsing, setParsing] = (0, import_react.useState)(false);
	const [mismatch, setMismatch] = (0, import_react.useState)(false);
	const [selectedFrameworkId, setSelectedFrameworkId] = (0, import_react.useState)("");
	const [selectedTrackId, setSelectedTrackId] = (0, import_react.useState)("");
	const [rawText, setRawText] = (0, import_react.useState)("");
	const { data: frameworkOptions = [], isLoading: loadingFrameworks } = useQuery({
		queryKey: ["framework-options", frameworkUserId],
		enabled: Boolean(frameworkUserId),
		queryFn: async () => {
			const { data, error } = await supabase.from("competency_frameworks").select("id,name,description,is_system_default,matrix,created_at").or(`is_system_default.eq.true,user_id.eq.${frameworkUserId}`).order("is_system_default", { ascending: false }).order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: profileActiveFrameworkId = null } = useQuery({
		queryKey: ["profile-active-framework", frameworkUserId],
		enabled: Boolean(frameworkUserId),
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("active_framework_id").eq("id", frameworkUserId).maybeSingle();
			if (error) throw error;
			return data?.active_framework_id ?? null;
		}
	});
	const setActiveFrameworkMutation = useSetActiveFramework(frameworkUserId);
	const saveFrameworkMutation = useMutation({
		mutationFn: async ({ name, matrix, description }) => {
			const { data, error } = await supabase.from("competency_frameworks").insert({
				user_id: frameworkUserId,
				name,
				description: description ?? null,
				is_system_default: false,
				matrix
			}).select("id").single();
			if (error) throw error;
			const frameworkId = data.id;
			const { error: profileError } = await supabase.from("profiles").update({ active_framework_id: frameworkId }).eq("id", frameworkUserId);
			if (profileError) throw profileError;
			return frameworkId;
		},
		onSuccess: (frameworkId) => {
			setSelectedFrameworkId(frameworkId);
			setMismatch(false);
			queryClient.setQueryData(["profile-active-framework", frameworkUserId], frameworkId);
			queryClient.invalidateQueries({ queryKey: ["framework-options", frameworkUserId] });
			queryClient.invalidateQueries({ queryKey: ["profile-active-framework", frameworkUserId] });
			queryClient.invalidateQueries({ queryKey: ["active-framework-matrix", frameworkUserId] });
			queryClient.invalidateQueries({ queryKey: ["active-framework-context", frameworkUserId] });
			queryClient.invalidateQueries({ queryKey: ["profile", frameworkUserId] });
			toast.success("Custom framework imported and linked.");
		},
		onError: (error) => {
			toast.error(error.message);
		}
	});
	(0, import_react.useEffect)(() => {
		if (profileActiveFrameworkId && selectedFrameworkId !== profileActiveFrameworkId) {
			setSelectedFrameworkId(profileActiveFrameworkId);
			return;
		}
		if (!selectedFrameworkId && frameworkOptions.length > 0) setSelectedFrameworkId(frameworkOptions[0].id);
	}, [
		frameworkOptions,
		profileActiveFrameworkId,
		selectedFrameworkId
	]);
	const activeFramework = (0, import_react.useMemo)(() => {
		if (frameworkOptions.length === 0) return null;
		return frameworkOptions.find((f) => f.id === selectedFrameworkId) ?? frameworkOptions[0];
	}, [frameworkOptions, selectedFrameworkId]);
	const activeMatrix = (0, import_react.useMemo)(() => activeFramework ? normalizeMatrix(activeFramework.matrix) : null, [activeFramework]);
	const hasCategoryPreview = Boolean(parseFrameworkCategoryMap(activeFramework?.matrix ?? null));
	const activeCategoryEntries = (0, import_react.useMemo)(() => resolveFrameworkCategoryEntries(activeFramework?.matrix ?? null), [activeFramework]);
	const frameworkTracks = (0, import_react.useMemo)(() => {
		if (hasCategoryPreview) return activeCategoryEntries.map(([categoryName, details], index) => {
			const expectations = [details.summary, ...details.items.map((item) => `• ${item}`)].filter((entry) => Boolean(entry && entry.trim().length > 0)).join("\n");
			return {
				id: `${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
				label: categoryName,
				levels: [{
					rank: 1,
					title: "Core Expectations",
					expectationsDescription: expectations || "No expectations defined yet."
				}]
			};
		});
		if (!activeMatrix) return [];
		const levelMeta = [
			{
				key: "junior",
				rank: 1,
				title: "Junior"
			},
			{
				key: "mid",
				rank: 2,
				title: "Mid"
			},
			{
				key: "senior",
				rank: 3,
				title: "Senior"
			}
		];
		return MATRIX_PILLARS.map((pillar) => ({
			id: pillar.key,
			label: pillar.label,
			levels: levelMeta.map((level) => {
				const expectations = (activeMatrix[level.key][pillar.key] ?? []).map((item) => `• ${item}`).join("\n");
				return {
					rank: level.rank,
					title: level.title,
					expectationsDescription: expectations || "No expectations defined yet."
				};
			})
		}));
	}, [
		activeCategoryEntries,
		activeMatrix,
		hasCategoryPreview
	]);
	const activeTrack = (0, import_react.useMemo)(() => frameworkTracks.find((track) => track.id === selectedTrackId) ?? frameworkTracks[0] ?? null, [frameworkTracks, selectedTrackId]);
	const activeLevel = levelFromCurrentRole(user?.currentLevel);
	(0, import_react.useEffect)(() => {
		if (frameworkTracks.length === 0) {
			setSelectedTrackId("");
			return;
		}
		if (!frameworkTracks.some((track) => track.id === selectedTrackId)) setSelectedTrackId(frameworkTracks[0].id);
	}, [frameworkTracks, selectedTrackId]);
	function linkSelectedFramework(nextFrameworkId) {
		if (!frameworkUserId) {
			toast.error("Sign in to change framework preferences.");
			return;
		}
		setSelectedFrameworkId(nextFrameworkId);
		setActiveFrameworkMutation.mutate(nextFrameworkId, { onSuccess: () => {
			toast.success("Active framework updated.");
		} });
	}
	function downloadTemplate() {
		const blob = new Blob([JSON.stringify(SAMPLE_MATRIX_TEMPLATE, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = "career-matrix-framework-template.json";
		anchor.click();
		URL.revokeObjectURL(url);
	}
	async function importFrameworkJson(file) {
		if (!frameworkUserId) {
			toast.error("Sign in before importing frameworks.");
			return;
		}
		if (!file.name.toLowerCase().endsWith(".json")) {
			toast.error("Only JSON files are supported for direct import.");
			return;
		}
		setMismatch(false);
		setParsing(true);
		try {
			const text = await file.text();
			const matrix = normalizeMatrix(JSON.parse(text));
			if (!matrix) {
				setMismatch(true);
				toast.error("Invalid framework JSON. Required keys: junior, mid, senior with technical_execution, collaboration, delivery_reliability arrays.");
				return;
			}
			const frameworkName = file.name.replace(/\.json$/i, "").trim() || "Imported Framework";
			saveFrameworkMutation.mutate({
				name: frameworkName,
				matrix,
				description: "Imported from JSON template upload."
			});
		} catch {
			setMismatch(true);
			toast.error("Unable to parse JSON file. Please verify the file format.");
		} finally {
			setParsing(false);
		}
	}
	function processRawTextIntoFramework() {
		if (!frameworkUserId) {
			toast.error("Sign in before importing frameworks.");
			return;
		}
		if (!rawText.trim()) {
			toast.error("Paste source text before processing.");
			return;
		}
		const matrix = buildMatrixFromRawText(rawText);
		saveFrameworkMutation.mutate({
			name: `Quick-Start Framework ${toLocalDateString()}`,
			matrix,
			description: "Generated from quick-start raw text import."
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader$2, {
				title: "Competency Matrix Configuration",
				sub: "Select defaults, preview pillar expectations, and import your own competency matrix."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 bg-slate-50 border border-slate-200/60 rounded-xl p-5 mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold text-slate-800 leading-5 break-words",
								children: activeFramework ? getFrameworkDisplayName(activeFramework) : "No Active Framework"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-none px-1.5 py-0.5",
								children: "Active"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-slate-500 max-w-2xl leading-relaxed",
							children: activeFramework?.description?.trim() || `Aligned to your current role level: ${activeLevel}.`
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full rounded-lg border border-slate-200 bg-white p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold mb-1.5",
							style: { color: C.subtle },
							children: "Framework Selector"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { size: 14 }),
							value: selectedFrameworkId,
							disabled: loadingFrameworks || frameworkOptions.length === 0,
							onChange: (e) => linkSelectedFramework(e.target.value),
							children: frameworkOptions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "No frameworks available"
							}) : frameworkOptions.map((framework) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: framework.id,
								title: getFrameworkDisplayName(framework),
								children: truncateFrameworkLabel(getFrameworkDisplayName(framework))
							}, framework.id))
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-4 gap-6 items-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: frameworkTracks.length > 0 ? frameworkTracks.map((track) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSelectedTrackId(track.id),
							className: activeTrack?.id === track.id ? "w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-all cursor-pointer bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600 font-bold hover:bg-indigo-50 hover:text-indigo-700 rounded-r-lg rounded-l-none" : "w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-all cursor-pointer",
							children: track.label
						}, track.id);
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-slate-500",
						children: "Select a core competency track on the left to review scope and role growth criteria."
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "md:col-span-3",
					children: activeTrack && activeTrack.levels.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4 flex-1",
						children: activeTrack.levels.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all space-y-3",
							children: [level.title === "Core Expectations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-xs font-bold text-slate-800",
								children: level.title
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 border border-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded-md",
									children: ["Level ", level.rank]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-xs font-bold text-slate-800",
									children: level.title
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "max-w-2xl space-y-1.5",
								children: level.expectationsDescription.split("\n").filter((line) => line.trim().length > 0).map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-line text-xs leading-relaxed text-slate-600",
									children: line
								}, `${level.title}-${index}`))
							})]
						}, `${activeTrack.id}-${level.rank}-${level.title}`))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bg-white border border-slate-200/80 rounded-xl p-4 text-xs text-slate-500",
						children: "Select a core competency track on the left to review scope and role growth criteria."
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
					onClick: downloadTemplate,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 14 }), "Download Sample Framework Template"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onClick: () => !parsing && inputRef.current?.click(),
				onDragOver: (event) => {
					event.preventDefault();
					setDragOver(true);
				},
				onDragLeave: () => setDragOver(false),
				onDrop: (event) => {
					event.preventDefault();
					setDragOver(false);
					const dropped = event.dataTransfer.files?.[0];
					if (dropped) importFrameworkJson(dropped);
				},
				className: `mt-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors px-6 py-7 flex flex-col items-center justify-center text-center ${dragOver ? "bg-[#DEEBFF]" : "hover:bg-slate-50"}`,
				style: { borderColor: dragOver ? C.primary : "#C1C7D0" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "file",
					accept: ".json,application/json",
					className: "hidden",
					onChange: (event) => {
						const selected = event.target.files?.[0];
						if (selected) importFrameworkJson(selected);
						event.target.value = "";
					}
				}), parsing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					size: 26,
					className: "animate-spin",
					style: { color: C.primary }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 text-sm font-semibold",
					style: { color: C.navy },
					children: "Validating and importing framework..."
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, {
						size: 30,
						style: { color: C.primary }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 text-sm font-semibold",
						style: { color: C.navy },
						children: "Drop JSON framework file or click to browse"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs mt-1",
						style: { color: C.subtle },
						children: "Required keys: junior, mid, senior + technical_execution/collaboration/delivery_reliability arrays"
					})
				] })]
			}),
			mismatch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 p-4 rounded border flex gap-3",
				style: {
					borderColor: "#FFC400",
					background: "#FFFBE6"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 18,
					style: { color: "#FF8B00" },
					className: "shrink-0 mt-0.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs leading-relaxed",
					style: { color: C.slate },
					children: "Uploaded JSON did not match the required matrix structure. Download the sample template, copy your content into the same shape, and retry import."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-6 rounded border",
				style: { borderColor: C.border },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "cursor-pointer px-4 py-3 text-sm font-semibold",
					style: { color: C.navy },
					children: "Quick-Start: Import Raw Text"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 pb-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-relaxed",
							style: { color: C.slate },
							children: "Paste raw text from a handbook/wiki. We split bullet lines, classify by keywords, map into the three matrix pillars, and save as a custom framework."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: rawText,
							onChange: (e) => setRawText(e.target.value),
							placeholder: "Paste competency descriptions, bullet points, or handbook excerpts...",
							className: "mt-3 w-full min-h-[180px] resize-y rounded border p-3 text-sm leading-relaxed outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
							style: {
								borderColor: C.border,
								color: C.navy
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
								onClick: processRawTextIntoFramework,
								disabled: saveFrameworkMutation.isPending || !rawText.trim(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 14 }), "Process & Adapt Framework"]
							})
						})
					]
				})]
			})
		]
	});
}
function SectionHeader$2({ title, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "text-base font-bold tracking-tight",
		style: { color: C.navy },
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs mt-1",
		style: { color: C.subtle },
		children: sub
	})] });
}
function truncateFrameworkLabel(label, maxLength = 56) {
	const normalized = label.trim();
	if (normalized.length <= maxLength) return normalized;
	return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
var KNOWLEDGE_PIN_URL_PREFIX = "evitrace://knowledge/";
function buildKnowledgePinUrl(knowledgeId) {
	return `${KNOWLEDGE_PIN_URL_PREFIX}${knowledgeId}`;
}
function parsePinnedKnowledgeId(url) {
	if (!url) return null;
	const normalized = url.trim();
	if (!normalized.startsWith(KNOWLEDGE_PIN_URL_PREFIX)) return null;
	const knowledgeId = normalized.slice(21).trim();
	return knowledgeId.length > 0 ? knowledgeId : null;
}
function isHttpUrl(url) {
	if (!url) return false;
	return /^https?:\/\//i.test(url.trim());
}
function buildSamplePinnedResources(workspaceId) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return [
		{
			id: `sample-pin-objective-${workspaceId}`,
			workspace_id: workspaceId,
			title: "Q3 Reliability OKR: 99.95% API Availability",
			url: "https://example.com/okr-reliability",
			resource_type: "objective",
			evidence_id: null,
			objective_id: null,
			pinned_by: workspaceId,
			created_at: now,
			isSample: true
		},
		{
			id: `sample-pin-playbook-${workspaceId}`,
			workspace_id: workspaceId,
			title: "P1 Incident Response Playbook",
			url: "https://example.com/emergency-docs",
			resource_type: "generic",
			evidence_id: null,
			objective_id: null,
			pinned_by: workspaceId,
			created_at: now,
			isSample: true
		},
		{
			id: `sample-pin-evidence-${workspaceId}`,
			workspace_id: workspaceId,
			title: "Milestone Evidence: Auth Migration Complete",
			url: "https://example.com/evidence-milestone",
			resource_type: "evidence",
			evidence_id: null,
			objective_id: null,
			pinned_by: workspaceId,
			created_at: now,
			isSample: true
		}
	];
}
function buildHomeGlobalSearchResults(args) {
	const query = args.query.trim().toLowerCase();
	if (!query) return {
		objectives: [],
		evidence: [],
		knowledge: []
	};
	const matches = (title, description) => `${title} ${description}`.toLowerCase().includes(query);
	return {
		objectives: args.visibleObjectives.filter((item) => matches(item.title, item.statement ?? item.notes ?? item.specific ?? item.measurable ?? "")).slice(0, 6).map((item) => ({
			id: item.id,
			title: item.title,
			description: item.statement ?? item.notes ?? "Objective match",
			section: "objectives"
		})),
		evidence: args.visibleEvidence.filter((item) => matches(item.title, item.description)).slice(0, 6).map((item) => ({
			id: item.id,
			title: item.title,
			description: item.description,
			section: "evidence"
		})),
		knowledge: args.knowledgeItems.filter((item) => matches(item.challenge, item.lesson)).slice(0, 6).map((item) => ({
			id: item.id,
			title: item.challenge,
			description: item.lesson,
			section: "knowledge"
		}))
	};
}
function buildVisiblePinnedResources(args) {
	if (!args.activeWorkspaceId) return args.pinnedResources;
	if (!args.includeSamplePinnedResources) return args.pinnedResources;
	return [...buildSamplePinnedResources(args.activeWorkspaceId), ...args.pinnedResources];
}
function buildPinnedResourceLookups(pinnedResources) {
	const pinnedObjectiveIdToPinId = /* @__PURE__ */ new Map();
	const pinnedEvidenceIdToPinId = /* @__PURE__ */ new Map();
	const pinnedKnowledgeIdToPinId = /* @__PURE__ */ new Map();
	pinnedResources.forEach((pin) => {
		if (pin.resource_type === "objective" && pin.objective_id) pinnedObjectiveIdToPinId.set(pin.objective_id, pin.id);
		if (pin.resource_type === "evidence" && pin.evidence_id) pinnedEvidenceIdToPinId.set(pin.evidence_id, pin.id);
		if (pin.resource_type === "generic") {
			const knowledgeId = parsePinnedKnowledgeId(pin.url);
			if (knowledgeId) pinnedKnowledgeIdToPinId.set(knowledgeId, pin.id);
		}
	});
	return {
		pinnedObjectiveIdToPinId,
		pinnedEvidenceIdToPinId,
		pinnedKnowledgeIdToPinId,
		pinnedObjectiveIds: new Set(Array.from(pinnedObjectiveIdToPinId.keys())),
		pinnedEvidenceIds: new Set(Array.from(pinnedEvidenceIdToPinId.keys())),
		pinnedKnowledgeIds: new Set(Array.from(pinnedKnowledgeIdToPinId.keys()))
	};
}
var pinResource = createServerFn({ method: "POST" }).validator(objectType({
	token: stringType().min(1),
	workspaceId: stringType().uuid(),
	title: stringType().trim().min(1),
	url: stringType().url().optional(),
	resourceType: enumType([
		"evidence",
		"objective",
		"generic"
	]),
	evidenceId: stringType().uuid().optional(),
	objectiveId: stringType().uuid().optional(),
	notifyUserId: stringType().uuid()
})).handler(createSsrRpc("5e36f4344700e168a06cf2c350df6b5bcaa4fd289326c477c118fd954c57b4c3"));
var unpinResource = createServerFn({ method: "POST" }).validator(objectType({
	token: stringType().min(1),
	pinId: stringType().uuid()
})).handler(createSsrRpc("6e5409543fe62dfd74de78d794986f43d00419f3fbc29bd137e794ae919de5c1"));
function useHomePinnedResourcesActions({ activeWorkspaceId, notificationTargetUserId, userId, pinnedResources, setPinnedResources, newPinnedTitle, setNewPinnedTitle, newPinnedUrl, setNewPinnedUrl, isSubmittingPinnedResource, setIsSubmittingPinnedResource, setIsPinnedQuickAddOpen, pinnedObjectiveIdToPinId, pinnedEvidenceIdToPinId, pinnedKnowledgeIdToPinId, onFlash }) {
	const loadPinnedResources = (0, import_react.useCallback)(async () => {
		if (!activeWorkspaceId) {
			setPinnedResources([]);
			return;
		}
		const { data, error } = await supabase.from("pinned_resources").select("id, title, url, resource_type, evidence_id, objective_id, workspace_id, pinned_by, created_at").eq("workspace_id", activeWorkspaceId).order("created_at", { ascending: false });
		if (error) {
			console.error("[pinned-resources] failed to load:", error);
			setPinnedResources([]);
			return;
		}
		setPinnedResources(data ?? [] ?? []);
	}, [activeWorkspaceId, setPinnedResources]);
	const handleUnpin = (0, import_react.useCallback)(async (pinId) => {
		const existing = pinnedResources.find((pin) => pin.id === pinId);
		if (!existing || existing.isSample) return true;
		setPinnedResources((prev) => prev.filter((pin) => pin.id !== pinId));
		try {
			const { data: sessionData } = await supabase.auth.getSession();
			const token = sessionData.session?.access_token;
			if (!token) throw new Error("Session expired. Please sign in again.");
			await unpinResource({ data: {
				token,
				pinId
			} });
			return true;
		} catch (error) {
			setPinnedResources((prev) => prev.some((pin) => pin.id === existing.id) ? prev : [existing, ...prev]);
			const message = error instanceof Error ? error.message : "Failed to unpin resource.";
			toast.error(message);
			return false;
		}
	}, [pinnedResources, setPinnedResources]);
	const handlePinResource = (0, import_react.useCallback)(async (args) => {
		if (!activeWorkspaceId || !notificationTargetUserId) throw new Error("Unable to pin resource: no active workspace context found.");
		const normalizedTitle = args.title.trim();
		if (!normalizedTitle) throw new Error("Please provide a title before pinning.");
		const normalizedUrl = args.url?.trim();
		if (normalizedUrl) try {
			new URL(normalizedUrl);
		} catch {
			throw new Error("Please enter a valid URL.");
		}
		const { data: sessionData } = await supabase.auth.getSession();
		const token = sessionData.session?.access_token;
		if (!token) throw new Error("Session expired. Please sign in again.");
		const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const optimisticPin = {
			id: optimisticId,
			title: normalizedTitle,
			url: normalizedUrl || null,
			resource_type: args.resourceType,
			evidence_id: args.evidenceId ?? null,
			objective_id: args.objectiveId ?? null,
			workspace_id: activeWorkspaceId,
			pinned_by: userId ?? "",
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		setPinnedResources((prev) => [optimisticPin, ...prev]);
		try {
			await pinResource({ data: {
				token,
				workspaceId: activeWorkspaceId,
				title: normalizedTitle,
				url: normalizedUrl || void 0,
				resourceType: args.resourceType,
				evidenceId: args.evidenceId,
				objectiveId: args.objectiveId,
				notifyUserId: notificationTargetUserId
			} });
			await loadPinnedResources();
		} catch (error) {
			setPinnedResources((prev) => prev.filter((pin) => pin.id !== optimisticId));
			throw error;
		}
	}, [
		activeWorkspaceId,
		loadPinnedResources,
		notificationTargetUserId,
		setPinnedResources,
		userId
	]);
	const handlePinGenericResource = (0, import_react.useCallback)(async () => {
		if (isSubmittingPinnedResource) return;
		setIsSubmittingPinnedResource(true);
		try {
			await handlePinResource({
				title: newPinnedTitle,
				url: newPinnedUrl,
				resourceType: "generic"
			});
			setNewPinnedTitle("");
			setNewPinnedUrl("");
			setIsPinnedQuickAddOpen(false);
			onFlash("Resource pinned");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to pin resource.";
			toast.error(message);
		} finally {
			setIsSubmittingPinnedResource(false);
		}
	}, [
		handlePinResource,
		isSubmittingPinnedResource,
		newPinnedTitle,
		newPinnedUrl,
		onFlash,
		setIsPinnedQuickAddOpen,
		setIsSubmittingPinnedResource,
		setNewPinnedTitle,
		setNewPinnedUrl
	]);
	const handlePinObjectiveResource = (0, import_react.useCallback)(async (objective) => {
		try {
			await handlePinResource({
				title: objective.title,
				url: objective.links?.[0]?.url?.trim() || void 0,
				resourceType: "objective",
				objectiveId: objective.id
			});
			onFlash("Objective pinned to workspace");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to pin objective.";
			toast.error(message);
		}
	}, [handlePinResource, onFlash]);
	const handlePinEvidenceResource = (0, import_react.useCallback)(async (item) => {
		try {
			await handlePinResource({
				title: item.title,
				url: item.link?.trim() || void 0,
				resourceType: "evidence",
				evidenceId: item.id
			});
			onFlash("Evidence pinned to workspace");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to pin evidence.";
			toast.error(message);
		}
	}, [handlePinResource, onFlash]);
	const handleToggleObjectivePin = (0, import_react.useCallback)(async (objective) => {
		const existingPinId = pinnedObjectiveIdToPinId.get(objective.id);
		if (existingPinId) {
			if (await handleUnpin(existingPinId)) onFlash("Objective unpinned from workspace");
			return;
		}
		await handlePinObjectiveResource(objective);
	}, [
		handlePinObjectiveResource,
		handleUnpin,
		onFlash,
		pinnedObjectiveIdToPinId
	]);
	const handleToggleEvidencePin = (0, import_react.useCallback)(async (item) => {
		const existingPinId = pinnedEvidenceIdToPinId.get(item.id);
		if (existingPinId) {
			if (await handleUnpin(existingPinId)) onFlash("Evidence unpinned from workspace");
			return;
		}
		await handlePinEvidenceResource(item);
	}, [
		handlePinEvidenceResource,
		handleUnpin,
		onFlash,
		pinnedEvidenceIdToPinId
	]);
	const handlePinKnowledgeResource = (0, import_react.useCallback)(async (item) => {
		const title = item.challenge.trim();
		if (!title) {
			toast.error("Unable to pin this knowledge card because it has no title.");
			return;
		}
		try {
			await handlePinResource({
				title,
				url: buildKnowledgePinUrl(item.id),
				resourceType: "generic"
			});
			onFlash("Knowledge card pinned to workspace");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to pin knowledge card.";
			toast.error(message);
		}
	}, [handlePinResource, onFlash]);
	return {
		loadPinnedResources,
		handleUnpin,
		handlePinGenericResource,
		handleToggleObjectivePin,
		handleToggleEvidencePin,
		handleToggleKnowledgePin: (0, import_react.useCallback)(async (item) => {
			const existingPinId = pinnedKnowledgeIdToPinId.get(item.id);
			if (existingPinId) {
				if (await handleUnpin(existingPinId)) onFlash("Knowledge card unpinned from workspace");
				return;
			}
			await handlePinKnowledgeResource(item);
		}, [
			handlePinKnowledgeResource,
			handleUnpin,
			onFlash,
			pinnedKnowledgeIdToPinId
		])
	};
}
function useHomeInboxActions({ userId, inbox, setDismissedSampleInboxIds, insertEvidenceMutation, approveInboxMutation, dismissInboxMutation, onFlash }) {
	return {
		approveInbox: (0, import_react.useCallback)((item, payload) => {
			const title = payload.title.trim() || item.title;
			const description = payload.description.trim();
			const category = payload.category;
			const competency = payload.subcategory;
			if (item.isSample) {
				setDismissedSampleInboxIds((ids) => ids.includes(item.id) ? ids : [...ids, item.id]);
				insertEvidenceMutation.mutate({
					id: "",
					date: toLocalDateString(),
					source: item.source,
					category,
					competency,
					title,
					description,
					link: "",
					status: "Pending Review",
					matchState: "Unset",
					managerNotes: "",
					isArchived: false,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				}, { onSuccess: () => onFlash("Sample event mapped and added to evidence log") });
				return;
			}
			const liveItem = inbox.find((candidate) => candidate.id === item.id);
			if (!liveItem) return;
			const newEvidenceRow = {
				user_id: userId,
				date: toLocalDateString(),
				source: liveItem.source,
				category,
				competency,
				title,
				description,
				link: "",
				status: "Pending Review",
				match_state: "Unset",
				manager_notes: "",
				is_archived: false
			};
			approveInboxMutation.mutate({
				inboxItem: liveItem,
				newEvidenceRow
			}, { onSuccess: () => onFlash("Evidence mapped and added to log") });
		}, [
			approveInboxMutation,
			inbox,
			insertEvidenceMutation,
			onFlash,
			setDismissedSampleInboxIds,
			userId
		]),
		dismissInbox: (0, import_react.useCallback)((item) => {
			if (item.isSample) {
				setDismissedSampleInboxIds((ids) => ids.includes(item.id) ? ids : [...ids, item.id]);
				onFlash("Sample event closed");
				return;
			}
			dismissInboxMutation.mutate(item.id, { onSuccess: () => onFlash("Event dismissed") });
		}, [
			dismissInboxMutation,
			onFlash,
			setDismissedSampleInboxIds
		])
	};
}
function useHomeNavigationActions({ navigate, settingsSection, setMobileSidebarOpen, setGlobalSearchQuery, getTabPathForCurrentScope }) {
	const handleTabChange = (0, import_react.useCallback)((nextTab) => {
		setMobileSidebarOpen(false);
		navigate({ to: nextTab === "settings" ? getSettingsSectionPath(settingsSection) : getTabPathForCurrentScope(nextTab) });
	}, [
		getTabPathForCurrentScope,
		navigate,
		setMobileSidebarOpen,
		settingsSection
	]);
	return {
		handleTabChange,
		handleSettingsSectionChange: (0, import_react.useCallback)((nextSection) => {
			setMobileSidebarOpen(false);
			navigate({ to: getSettingsSectionPath(nextSection) });
		}, [navigate, setMobileSidebarOpen]),
		handleGlobalSearchSelect: (0, import_react.useCallback)((result) => {
			setGlobalSearchQuery("");
			handleTabChange(result.section);
		}, [handleTabChange, setGlobalSearchQuery])
	};
}
var DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
	day: "numeric",
	month: "short",
	year: "numeric"
});
function formatDisplayDate(input) {
	const date = input instanceof Date ? input : new Date(input);
	if (Number.isNaN(date.getTime())) return String(input);
	return DISPLAY_DATE_FORMATTER.format(date);
}
function formatEvidenceDateParts(input) {
	const date = input instanceof Date ? input : new Date(input);
	if (Number.isNaN(date.getTime())) return {
		dayMonth: String(input),
		year: ""
	};
	const day = date.getDate();
	const month = date.toLocaleString("en-GB", { month: "short" });
	const year = String(date.getFullYear());
	return {
		dayMonth: `${day} ${month}`,
		year
	};
}
function formatObjectiveCode(objective) {
	if (/^[A-Z]{2,5}-\d{2,6}$/.test(objective.id)) return objective.id;
	const prefix = (objective.competency || objective.title || "OBJ").split(/\s+/).filter(Boolean).map((part) => part[0]?.toUpperCase() ?? "").join("").replace(/[^A-Z]/g, "").slice(0, 3).padEnd(3, "X");
	const base = objective.id.replace(/-/g, "");
	let checksum = 0;
	for (let i = 0; i < base.length; i += 1) checksum = (checksum + base.charCodeAt(i) * (i + 1)) % 1e4;
	return `${prefix}-${String(checksum).padStart(4, "0")}`;
}
var ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX = "evitrace_active_assessment_draft";
var LEGACY_ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX = "evitrace.assessmentWizardDraft";
function getAssessmentWizardDraftStorageKey(userId) {
	return `${ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX}.${userId}`;
}
function getLegacyAssessmentWizardDraftStorageKey(userId) {
	return `${LEGACY_ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX}.${userId}`;
}
function clampEffectivenessWeight(value) {
	if (!Number.isFinite(value)) return 1;
	return Math.max(1, Math.min(5, Math.round(value)));
}
function averageQuestionWeight(questions, key) {
	if (!questions || questions.length === 0) return 1;
	return +(questions.reduce((sum, question) => sum + clampEffectivenessWeight(question[key]), 0) / questions.length).toFixed(2);
}
function findQuestionFromAssessment(assessment, categoryName, questionText) {
	const normalizedCategoryName = normalizeCategoryName(categoryName);
	const normalizedQuestionText = questionText.trim().toLowerCase();
	const category = assessment?.categories.find((item) => normalizeCategoryName(item.categoryName) === normalizedCategoryName);
	if (!category) return void 0;
	return category.questions.find((item) => item.questionText.trim().toLowerCase() === normalizedQuestionText);
}
function getHistoricalQuestionScores(assessment, categoryName, questionText, previousCompletedAssessment) {
	const latestQuestion = findQuestionFromAssessment(assessment, categoryName, questionText);
	const previousCompletedQuestion = findQuestionFromAssessment(previousCompletedAssessment, categoryName, questionText);
	if (!latestQuestion) {
		const fallbackScore = previousCompletedQuestion ? clampEffectivenessWeight(previousCompletedQuestion.currentScore) : 1;
		return {
			previous: fallbackScore,
			current: fallbackScore,
			target: 4,
			note: ""
		};
	}
	return {
		previous: previousCompletedQuestion ? clampEffectivenessWeight(previousCompletedQuestion.currentScore) : clampEffectivenessWeight(latestQuestion.previousScore),
		current: clampEffectivenessWeight(latestQuestion.currentScore),
		target: clampEffectivenessWeight(latestQuestion.targetScore),
		note: latestQuestion.justification ?? ""
	};
}
function calculateScoreDelta(previousScore, currentScore) {
	return +(currentScore - previousScore).toFixed(2);
}
function triggerAssessmentPdfDownload(assessment) {
	if (typeof window === "undefined") return;
	const printable = window.open("", "_blank", "noopener,noreferrer,width=1024,height=900");
	if (!printable) return;
	const rows = assessment.categories.map((category) => {
		const questions = category.questions.map((question) => {
			const delta = calculateScoreDelta(question.previousScore, question.currentScore);
			return `<tr>
            <td>${question.questionText}</td>
            <td>${clampEffectivenessWeight(question.previousScore)}</td>
            <td>${clampEffectivenessWeight(question.currentScore)}</td>
            <td>${delta > 0 ? "+" : ""}${delta}</td>
          </tr>`;
		}).join("");
		return `<section>
        <h3>${category.categoryName} (Avg ${averageQuestionWeight(category.questions, "currentScore").toFixed(2)})</h3>
        <table>
          <thead><tr><th>Question</th><th>Previous</th><th>Current</th><th>Delta</th></tr></thead>
          <tbody>${questions}</tbody>
        </table>
      </section>`;
	}).join("");
	printable.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${assessment.reviewPeriod} Assessment Report</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; color: #172B4D; margin: 28px; }
      h1 { margin: 0; font-size: 24px; }
      h2 { margin: 6px 0 0; font-size: 14px; color: #42526E; font-weight: 500; }
      h3 { margin: 20px 0 10px; font-size: 16px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
      th, td { border: 1px solid #DFE1E6; padding: 8px; font-size: 12px; vertical-align: top; text-align: left; }
      th { background: #F4F5F7; color: #42526E; text-transform: uppercase; font-size: 11px; letter-spacing: .03em; }
      .meta { margin-top: 14px; font-size: 12px; color: #42526E; }
    </style>
  </head>
  <body>
    <h1>${assessment.reviewPeriod}</h1>
    <h2>Assessment ${assessment.id}</h2>
    <div class="meta">
      Engineer: ${assessment.engineerName} &nbsp;|&nbsp; Manager: ${assessment.managerName}
      &nbsp;|&nbsp; Finalized: ${formatDisplayDate(assessment.dateCompleted)}
      &nbsp;|&nbsp; Overall Readiness: ${assessment.overallReadinessScore}%
    </div>
    ${rows}
  </body>
</html>`);
	printable.document.close();
	printable.focus();
	printable.print();
}
/** Derives radar chart data from the most recent Assessment.
*  Maps each category's `categoryCurrentAvg` (1-5 scale) to 0-4 radar scale.
*  Falls back to the static initialRadar shape when no assessment is available. */
function deriveRadarData(assessment, activeFrameworkCategories, frameworkMatrix) {
	const orderedCategories = activeFrameworkCategories.length > 0 ? activeFrameworkCategories : resolveFrameworkCategoryEntries(frameworkMatrix).map(([category]) => category);
	if (orderedCategories.length === 0) return (assessment?.categories ?? []).map((category) => ({
		competency: category.categoryName,
		current: +Math.min(4, category.categoryCurrentAvg / 5 * 4).toFixed(2),
		target: 4
	}));
	return orderedCategories.map((categoryName) => {
		const found = assessment?.categories.find((c) => c.categoryName === categoryName || normalizeCategoryName(c.categoryName) === normalizeCategoryName(categoryName));
		return {
			competency: categoryName,
			current: found ? +Math.min(4, found.categoryCurrentAvg / 5 * 4).toFixed(2) : 0,
			target: 4
		};
	});
}
function avg(nums) {
	if (nums.length === 0) return 0;
	return +(nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2);
}
/** Recomputes every categoryCurrentAvg from its questions and the overall readiness score. */
function withDerivedAverages(a) {
	const categories = a.categories.map((c) => ({
		...c,
		categoryCurrentAvg: avg(c.questions.map((q) => q.currentScore))
	}));
	const allScores = categories.flatMap((c) => c.questions.map((q) => q.currentScore));
	const overall = allScores.length === 0 ? 0 : Math.round(avg(allScores) / 5 * 100);
	return {
		...a,
		categories,
		overallReadinessScore: overall
	};
}
/** Build a strict Assessment from a wizard-captured ReviewSession. */
function sessionToAssessment(s) {
	const categories = Object.entries(s.scores).map(([catName, subs], ci) => {
		const questions = Object.entries(subs).map(([sub, q], qi) => ({
			questionId: `q_${ci + 1}_${qi + 1}`,
			questionText: sub,
			previousScore: q.prev,
			currentScore: q.next,
			targetScore: 4,
			justification: q.notes,
			attachedEvidenceIds: q.evidenceIds
		}));
		return {
			categoryId: `cat_${String(ci + 1).padStart(2, "0")}`,
			categoryName: catName,
			summary: COMPETENCY_DESC[catName] ?? "",
			categoryCurrentAvg: 0,
			categoryTarget: 4,
			questions
		};
	});
	return withDerivedAverages({
		id: s.id,
		dateCompleted: (/* @__PURE__ */ new Date()).toISOString(),
		reviewPeriod: s.period,
		status: "Finalized",
		engineerName: s.engineer,
		managerName: s.manager,
		overallReadinessScore: 0,
		categories,
		oneOnOneTopics: []
	});
}
/** Convert a stored Assessment back to the in-memory ReviewSession shape. */
function assessmentToSession(a) {
	const scores = {};
	a.categories.forEach((c) => {
		scores[c.categoryName] = {};
		c.questions.forEach((q) => {
			scores[c.categoryName][q.questionText] = {
				prev: q.previousScore,
				next: q.currentScore,
				notes: q.justification,
				evidenceIds: q.attachedEvidenceIds
			};
		});
	});
	return {
		id: a.id,
		date: formatDisplayDate(a.dateCompleted),
		period: a.reviewPeriod,
		engineer: a.engineerName,
		manager: a.managerName,
		scores
	};
}
/** Build a historical Assessment from a compact `[prev, current]` matrix. */
function buildHistorical(meta) {
	const categories = Object.entries(meta.scores).map(([cat, rows], ci) => {
		const subs = SUBCATEGORIES[cat] ?? [];
		const questions = rows.map((r, qi) => ({
			questionId: `q_${ci + 1}_${qi + 1}`,
			questionText: subs[qi] ?? `Question ${qi + 1}`,
			previousScore: r[0],
			currentScore: r[1],
			targetScore: 4,
			justification: r[2] ?? "",
			attachedEvidenceIds: []
		}));
		return {
			categoryId: `cat_${String(ci + 1).padStart(2, "0")}`,
			categoryName: cat,
			summary: COMPETENCY_DESC[cat] ?? "",
			categoryCurrentAvg: 0,
			categoryTarget: 4,
			questions
		};
	});
	return withDerivedAverages({
		id: meta.id,
		dateCompleted: meta.dateCompleted,
		reviewPeriod: meta.reviewPeriod,
		status: "Finalized",
		engineerName: meta.engineerName,
		managerName: meta.managerName,
		overallReadinessScore: 0,
		categories,
		oneOnOneTopics: meta.topics
	});
}
var initialAssessments = [
	buildHistorical({
		id: "REV-2026-Q2",
		dateCompleted: "2026-06-28T15:00:00Z",
		reviewPeriod: "Q2 2026",
		engineerName: "Courage Ugwuanyi",
		managerName: "Alex M.",
		scores: {
			"Analytical Thinking": [
				[
					2,
					3,
					"Improved root-cause analysis on incident IR-4421."
				],
				[2, 3],
				[2, 3]
			],
			"System Design": [
				[
					2,
					3,
					"Led RFC for sharded inventory service."
				],
				[2, 3],
				[1, 2]
			],
			"Code Quality": [
				[3, 3],
				[
					3,
					4,
					"Drove team-wide refactor of payment module."
				],
				[3, 3]
			],
			Communication: [
				[3, 3],
				[3, 3],
				[3, 3]
			],
			Leadership: [
				[2, 2],
				[
					2,
					3,
					"Mentored two L2 engineers."
				],
				[2, 2]
			],
			"Engineering for UX": [
				[
					2,
					3,
					"Shipped accessibility pass on checkout."
				],
				[2, 3],
				[2, 2]
			],
			Security: [
				[2, 3],
				[
					2,
					3,
					"Completed OWASP Top 10 internal cert."
				],
				[2, 2]
			],
			Delivery: [
				[3, 3],
				[
					3,
					4,
					"Three consecutive on-time releases."
				],
				[3, 3]
			]
		},
		topics: ["Discuss certification budget for AWS", "Timeline for Senior promotion panel"]
	}),
	buildHistorical({
		id: "REV-2026-Q1",
		dateCompleted: "2026-03-30T15:00:00Z",
		reviewPeriod: "Q1 2026",
		engineerName: "Courage Ugwuanyi",
		managerName: "Alex M.",
		scores: {
			"Analytical Thinking": [
				[2, 2],
				[1, 2],
				[2, 2]
			],
			"System Design": [
				[1, 2],
				[2, 2],
				[1, 1]
			],
			"Code Quality": [
				[3, 3],
				[3, 3],
				[2, 3]
			],
			Communication: [
				[3, 3],
				[2, 3],
				[3, 3]
			],
			Leadership: [
				[2, 2],
				[2, 2],
				[1, 2]
			],
			"Engineering for UX": [
				[2, 2],
				[2, 2],
				[2, 2]
			],
			Security: [
				[2, 2],
				[2, 2],
				[1, 2]
			],
			Delivery: [
				[3, 3],
				[3, 3],
				[2, 3]
			]
		},
		topics: ["Identify a stretch project for System Design"]
	}),
	buildHistorical({
		id: "REV-2025-Q4",
		dateCompleted: "2025-12-08T14:30:00Z",
		reviewPeriod: "Q4 2025",
		engineerName: "Courage Ugwuanyi",
		managerName: "Alex M.",
		scores: {
			"Analytical Thinking": [
				[
					1,
					2,
					"Demonstrated excellent root-cause analysis during the multi-node latency incident."
				],
				[
					1,
					1,
					"Starting to identify patterns in logs, but needs more autonomy."
				],
				[1, 2]
			],
			"System Design": [
				[1, 1],
				[1, 2],
				[1, 1]
			],
			"Code Quality": [
				[2, 3],
				[2, 3],
				[2, 2]
			],
			Communication: [
				[2, 3],
				[2, 2],
				[2, 3]
			],
			Leadership: [
				[1, 2],
				[1, 2],
				[1, 1]
			],
			"Engineering for UX": [
				[2, 2],
				[2, 2],
				[1, 2]
			],
			Security: [
				[1, 2],
				[1, 2],
				[1, 1]
			],
			Delivery: [
				[2, 3],
				[2, 3],
				[2, 2]
			]
		},
		topics: ["Set focus areas for Q1 - System Design, Security"]
	})
].map((assessment) => ({
	...assessment,
	isSample: true
}));
function useHomeAssessmentActions({ userId, sampleAssessments, setSampleAssessments, review, setReview, setWizardDraft, setPendingAssessmentDeleteId, deleteAssessmentMutation, onFlash }) {
	return {
		requestAssessmentDelete: (0, import_react.useCallback)((assessmentId) => {
			setPendingAssessmentDeleteId(assessmentId);
		}, [setPendingAssessmentDeleteId]),
		executeAssessmentDelete: (0, import_react.useCallback)((assessmentId) => {
			if (sampleAssessments.find((assessment) => assessment.id === assessmentId)?.isSample) {
				setSampleAssessments((prev) => prev.filter((assessment) => assessment.id !== assessmentId));
				if (review?.id === assessmentId) setReview(null);
				onFlash("Sample assessment removed from history");
				return;
			}
			deleteAssessmentMutation.mutate({ assessmentId }, { onSuccess: () => {
				if (review?.id === assessmentId) setReview(null);
				onFlash("Assessment deleted from history");
			} });
		}, [
			deleteAssessmentMutation,
			onFlash,
			review?.id,
			sampleAssessments,
			setReview,
			setSampleAssessments
		]),
		clearAssessmentWizardDraft: (0, import_react.useCallback)(() => {
			setWizardDraft(null);
			if (typeof window === "undefined" || !userId) return;
			window.localStorage.removeItem(getAssessmentWizardDraftStorageKey(userId));
			window.localStorage.removeItem(getLegacyAssessmentWizardDraftStorageKey(userId));
		}, [setWizardDraft, userId])
	};
}
function useHomeAssessmentDraft(userId) {
	const [wizardDraft, setWizardDraft] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || !userId) return;
		const key = getAssessmentWizardDraftStorageKey(userId);
		const legacyKey = getLegacyAssessmentWizardDraftStorageKey(userId);
		const raw = window.localStorage.getItem(key) ?? window.localStorage.getItem(legacyKey);
		if (!raw) return;
		try {
			const parsed = JSON.parse(raw);
			if (parsed && parsed.scores && typeof parsed.activeIdx === "number" && parsed.savedAt) {
				setWizardDraft(parsed);
				window.localStorage.setItem(key, JSON.stringify(parsed));
				window.localStorage.removeItem(legacyKey);
			}
		} catch {}
	}, [userId]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || !userId) return;
		const key = getAssessmentWizardDraftStorageKey(userId);
		if (!wizardDraft) {
			window.localStorage.removeItem(key);
			return;
		}
		window.localStorage.setItem(key, JSON.stringify(wizardDraft));
	}, [userId, wizardDraft]);
	return {
		wizardDraft,
		setWizardDraft
	};
}
var STORAGE_KEY = "evitrace.sampleContentVisibility";
var DEFAULT_SAMPLE_CONTENT_VISIBILITY = {
	dashboard: true,
	objectives: true,
	evidence: true,
	pinnedResources: true
};
function mergeSampleContentVisibility(parsed) {
	return {
		dashboard: parsed.dashboard ?? DEFAULT_SAMPLE_CONTENT_VISIBILITY.dashboard,
		objectives: parsed.objectives ?? DEFAULT_SAMPLE_CONTENT_VISIBILITY.objectives,
		evidence: parsed.evidence ?? DEFAULT_SAMPLE_CONTENT_VISIBILITY.evidence,
		pinnedResources: parsed.pinnedResources ?? DEFAULT_SAMPLE_CONTENT_VISIBILITY.pinnedResources
	};
}
function readPersistedSampleContentVisibility() {
	if (typeof window === "undefined") return DEFAULT_SAMPLE_CONTENT_VISIBILITY;
	const stored = window.localStorage.getItem(STORAGE_KEY);
	if (!stored) return DEFAULT_SAMPLE_CONTENT_VISIBILITY;
	try {
		return mergeSampleContentVisibility(JSON.parse(stored));
	} catch {
		return DEFAULT_SAMPLE_CONTENT_VISIBILITY;
	}
}
function useHomeSampleContentVisibility() {
	const [sampleContent, setSampleContentState] = (0, import_react.useState)(readPersistedSampleContentVisibility);
	const setSampleContent = (next) => {
		setSampleContentState((prev) => {
			const resolved = typeof next === "function" ? next(prev) : next;
			if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
			return resolved;
		});
	};
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleContent));
	}, [sampleContent]);
	return {
		sampleContent,
		setSampleContent
	};
}
function useHomeCaptureOnLoad({ openCaptureOnLoad, setShowCapture }) {
	(0, import_react.useEffect)(() => {
		if (!openCaptureOnLoad) return;
		setShowCapture(true);
	}, [openCaptureOnLoad, setShowCapture]);
}
function useHomePinnedQuickAddDismiss({ isPinnedQuickAddOpen, setIsPinnedQuickAddOpen, pinnedQuickAddPopoverRef, pinnedQuickAddTriggerRef }) {
	(0, import_react.useEffect)(() => {
		if (!isPinnedQuickAddOpen) return;
		function handlePointerDown(event) {
			const target = event.target;
			if (pinnedQuickAddPopoverRef.current?.contains(target)) return;
			if (pinnedQuickAddTriggerRef.current?.contains(target)) return;
			setIsPinnedQuickAddOpen(false);
		}
		function handleEscape(event) {
			if (event.key === "Escape") setIsPinnedQuickAddOpen(false);
		}
		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [
		isPinnedQuickAddOpen,
		pinnedQuickAddPopoverRef,
		pinnedQuickAddTriggerRef,
		setIsPinnedQuickAddOpen
	]);
}
function deriveHomeWorkspaceScope(args) {
	const isManagerWorkspace = args.activeView === "profile" && Boolean(args.selectedEngineerId);
	return {
		isManagerWorkspace,
		isManagerDirectoryView: args.managedEngineersCount > 0 && args.activeView === "directory" && args.tab === "dashboard",
		activeWorkspaceId: isManagerWorkspace && args.selectedEngineerId ? args.selectedEngineerId : args.userId,
		notificationTargetUserId: isManagerWorkspace && args.selectedEngineerId ? args.selectedEngineerId : args.userId
	};
}
function pickWorkspaceData(args) {
	return args.isManagerWorkspace ? args.managerWorkspaceData : args.personalWorkspaceData;
}
function getSelectedEngineerRole(args) {
	if (!args.selectedEngineerId || !args.isManagerWorkspace) return null;
	return args.managedEngineers.find((engineer) => engineer.id === args.selectedEngineerId)?.currentUserRole ?? null;
}
function shouldShowTeamTransitionCard(args) {
	if (!args.selectedEngineerId || !args.isManagerWorkspace) return false;
	const selected = args.managedEngineers.find((engineer) => engineer.id === args.selectedEngineerId);
	return Boolean(selected?.status === "in_handover" && selected.isOutgoingDirectManagerInHandover);
}
var RECENT_ENGINEERS_STORAGE_KEY = "evitrace.manager.recentEngineerIds";
function Sidebar({ tab, setTab, collapsed, onToggleCollapse, mobileOpen, onCloseMobile, managedEngineers = [], selectedEngineerId = null, onSelectEngineer, onOpenTeamOverview, managerDirectoryActive = false }) {
	const { user, signout } = useAuth();
	const { mode, setMode, isManagerAccount, loading } = useWorkspace();
	const hasFullName = Boolean(user?.fullName?.trim());
	const displayName = getDisplayName(user?.fullName, user?.email);
	const displayEmail = user?.email ?? "";
	const initials = displayName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "US";
	const displayRole = user ? `${user.currentLevel || "Engineer"}${user.team ? ` · ${user.team}` : ""}` : "Senior Engineer L3";
	function handleSignout() {
		signout();
		onCloseMobile();
		toast.success("Signed out");
	}
	const mainNav = [
		{
			id: "dashboard",
			label: "Dashboard",
			icon: LayoutDashboard,
			visibleIn: "all"
		},
		{
			id: "evidence",
			label: "Evidence Log",
			icon: TableProperties,
			visibleIn: "all"
		},
		{
			id: "objectives",
			label: "Objectives",
			icon: Target,
			visibleIn: "all"
		},
		{
			id: "knowledge",
			label: "Knowledge Hub",
			icon: BookOpen,
			visibleIn: "engineer"
		},
		{
			id: "feedback",
			label: "360 Feedback",
			icon: MessageCircleHeart,
			visibleIn: "engineer"
		},
		{
			id: "radar",
			label: "Promotion Readiness",
			icon: TrendingUp,
			visibleIn: "all"
		},
		{
			id: "report",
			label: "Reviews & Reports",
			icon: FileText,
			visibleIn: "all"
		}
	];
	const settingsItem = {
		id: "settings",
		label: "Settings",
		sub: "App & Profile",
		icon: Settings
	};
	const [engineerQuery, setEngineerQuery] = (0, import_react.useState)("");
	const [recentEngineerIds, setRecentEngineerIds] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return [];
		try {
			const raw = window.sessionStorage.getItem(RECENT_ENGINEERS_STORAGE_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			if (!Array.isArray(parsed)) return [];
			return parsed.filter((value) => typeof value === "string");
		} catch {
			return [];
		}
	});
	const normalizedEngineerQuery = engineerQuery.trim().toLowerCase();
	const filteredEngineers = (0, import_react.useMemo)(() => {
		if (!normalizedEngineerQuery) return managedEngineers;
		return managedEngineers.filter((engineer) => {
			const fullName = engineer.fullName.toLowerCase();
			const email = engineer.email.toLowerCase();
			return fullName.includes(normalizedEngineerQuery) || email.includes(normalizedEngineerQuery);
		});
	}, [managedEngineers, normalizedEngineerQuery]);
	function rememberRecentEngineer(engineerId) {
		setRecentEngineerIds((prev) => {
			const next = [engineerId, ...prev.filter((id) => id !== engineerId)].slice(0, 5);
			if (typeof window !== "undefined") window.sessionStorage.setItem(RECENT_ENGINEERS_STORAGE_KEY, JSON.stringify(next));
			return next;
		});
	}
	const NavButton = ({ n }) => {
		const active = tab === n.id;
		const Icon = n.icon;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setTab(n.id),
			title: collapsed ? n.label : void 0,
			className: `w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-2.5 px-2.5"} h-10 rounded-lg text-left transition-colors border`,
			style: {
				background: active ? "#EEF2FF" : "transparent",
				color: active ? C.navy : C.slate,
				borderColor: active ? "#C7D2FE" : "transparent"
			},
			onMouseEnter: (e) => !active && (e.currentTarget.style.background = "#F8FAFC"),
			onMouseLeave: (e) => !active && (e.currentTarget.style.background = "transparent"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-semibold truncate",
				children: n.label
			})]
		}, n.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: `hidden lg:flex fixed inset-y-0 left-0 z-40 ${collapsed ? "w-16" : "w-64"} h-screen border-r flex-col print-hide print:hidden transition-[width] duration-200`,
		style: {
			background: C.card,
			borderColor: C.border
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `h-16 ${collapsed ? "px-1.5" : "px-5"} flex items-center gap-2 border-b`,
				style: { borderColor: C.border },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex items-center min-w-0 ${collapsed ? "justify-center flex-1" : "gap-2"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { size: 32 }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[15px] font-bold tracking-tight",
							style: { color: C.navy },
							children: "Evitrace"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-wider",
							style: { color: C.subtle },
							children: "Workspace"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex-1 p-3 space-y-3 overflow-y-auto",
				children: [
					loading && !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-full rounded-md bg-slate-100 animate-pulse" }),
					mode === "manager" && managedEngineers.length > 0 && !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between px-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block",
									children: [
										"Team (",
										managedEngineers.length,
										")"
									]
								}), selectedEngineerId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: onOpenTeamOverview,
									className: "text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer",
									children: "View Dashboard"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative mx-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: engineerQuery,
									onChange: (event) => setEngineerQuery(event.target.value),
									placeholder: "Search engineers...",
									className: "w-full text-xs bg-white border border-slate-200 pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-indigo-300 transition-all text-slate-800"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mx-1 rounded-lg border border-slate-200 bg-white p-2",
								children: [filteredEngineers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-slate-400 italic p-1 text-center",
									children: "No matching profiles found."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: selectedEngineerId ?? "__team_overview__",
									onChange: (event) => {
										const nextValue = event.target.value;
										if (nextValue === "__team_overview__") {
											onOpenTeamOverview?.();
											onCloseMobile();
											return;
										}
										rememberRecentEngineer(nextValue);
										onSelectEngineer?.(nextValue);
										onCloseMobile();
									},
									className: "w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-300 focus:bg-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "__team_overview__",
										children: "Team Overview"
									}), filteredEngineers.map((engineer) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: engineer.id,
										children: engineer.fullName
									}, engineer.id))]
								}), selectedEngineerId && !managerDirectoryActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-[10px] text-slate-500 px-0.5",
									children: "Viewing selected engineer workspace."
								})]
							})
						]
					}),
					!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-2 pb-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400",
							children: "Navigation"
						})
					}),
					mainNav.filter((n) => n.visibleIn === "all" || n.visibleIn === mode).filter((n) => {
						if (mode !== "manager") return true;
						if (selectedEngineerId) return n.id === "evidence" || n.id === "objectives" || n.id === "radar";
						return n.id === "dashboard";
					}).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, { n }, n.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: onToggleCollapse,
					title: collapsed ? "Expand sidebar" : "Collapse sidebar",
					className: `w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-2.5 px-3"} py-2 rounded border hover:bg-[#F4F5F7] transition-colors`,
					style: {
						color: C.slate,
						borderColor: C.border
					},
					children: [collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeftClose, { size: 16 }), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold",
						children: "Collapse sidebar"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3 border-t space-y-2",
				style: { borderColor: C.border },
				children: [
					mode !== "manager" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, { n: settingsItem }),
					isManagerAccount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setMode(mode === "manager" ? "engineer" : "manager"),
						title: collapsed ? "Switch workspace profile" : void 0,
						className: `w-full flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-3"} h-10 rounded-lg border transition-all ${mode === "manager" ? "border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`,
						children: collapsed ? mode === "manager" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Terminal, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 text-xs font-semibold",
							children: [mode === "manager" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Terminal, { size: 14 }), "Switch Workspace"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${mode === "manager" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-700"}`,
							children: mode.toUpperCase()
						})] })
					}),
					!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-2.5 py-2 rounded-lg border bg-white",
						style: { borderColor: C.border },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0",
								style: { background: "#5243AA" },
								children: initials
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "leading-tight flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-semibold truncate",
									style: { color: C.navy },
									children: displayName
								}), hasFullName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] truncate",
									style: { color: C.subtle },
									children: displayEmail
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 pt-2 border-t flex items-center justify-between",
							style: { borderColor: C.border },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] uppercase tracking-wider font-semibold text-slate-400",
								children: displayRole
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: handleSignout,
								title: "Sign out",
								className: "inline-flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-semibold hover:bg-[#F4F5F7]",
								style: { color: C.slate },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { size: 14 }), "Log out"]
							})]
						})]
					}),
					collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: handleSignout,
						title: "Sign out",
						className: "w-full flex items-center justify-center py-2 rounded text-xs hover:bg-[#F4F5F7]",
						style: { color: C.slate },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { size: 16 })
					})
				]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: .15 },
		className: "fixed inset-0 z-50 lg:hidden print-hide",
		style: { background: "rgba(9, 30, 66, 0.45)" },
		onClick: onCloseMobile,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.aside, {
			initial: { x: "-100%" },
			animate: { x: 0 },
			exit: { x: "-100%" },
			transition: {
				duration: .22,
				ease: [
					.22,
					1,
					.36,
					1
				]
			},
			onClick: (e) => e.stopPropagation(),
			className: "absolute top-0 left-0 h-full w-72 max-w-[85vw] flex flex-col border-r",
			style: {
				background: C.card,
				borderColor: C.border
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-16 px-5 flex items-center justify-between border-b",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { size: 32 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[15px] font-bold tracking-tight",
							style: { color: C.navy },
							children: "Evitrace"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onCloseMobile,
						className: "p-1.5 rounded hover:bg-[#F4F5F7]",
						style: { color: C.slate },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex-1 p-3 space-y-1 overflow-y-auto",
					children: [mode === "manager" && managedEngineers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 rounded-lg border p-2.5",
						style: {
							borderColor: C.border,
							background: "#FAFBFC"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] font-bold uppercase tracking-wider",
									style: { color: C.subtle },
									children: [
										"Team (",
										managedEngineers.length,
										")"
									]
								}), selectedEngineerId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: onOpenTeamOverview,
									className: "text-[10px] font-bold text-indigo-600 hover:underline",
									children: "View Dashboard"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									size: 12,
									className: "pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: engineerQuery,
									onChange: (event) => setEngineerQuery(event.target.value),
									placeholder: "Search engineers...",
									className: "h-8 w-full rounded border border-slate-200 bg-white pl-7 pr-2 text-xs text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
								})]
							}),
							filteredEngineers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded border border-dashed border-slate-200 px-2 py-2 text-[11px] text-slate-500",
								children: "No matching profiles found."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: selectedEngineerId ?? "__team_overview__",
								onChange: (event) => {
									const nextValue = event.target.value;
									if (nextValue === "__team_overview__") {
										onOpenTeamOverview?.();
										onCloseMobile();
										return;
									}
									rememberRecentEngineer(nextValue);
									onSelectEngineer?.(nextValue);
									onCloseMobile();
								},
								className: "h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "__team_overview__",
									children: "Team Overview"
								}), filteredEngineers.map((engineer) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: engineer.id,
									children: engineer.fullName
								}, engineer.id))]
							}) })
						]
					}), mainNav.filter((n) => n.visibleIn === "all" || n.visibleIn === mode).filter((n) => {
						if (mode !== "manager") return true;
						if (selectedEngineerId) return n.id === "evidence" || n.id === "objectives" || n.id === "radar";
						return n.id === "dashboard";
					}).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, { n }, n.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 border-t space-y-2",
					style: { borderColor: C.border },
					children: [
						isManagerAccount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setMode(mode === "manager" ? "engineer" : "manager"),
							className: `w-full flex items-center justify-between p-2.5 border rounded-xl text-left transition-all cursor-pointer ${mode === "manager" ? "border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700" : "border-slate-200/60 bg-slate-50 hover:bg-slate-100 text-slate-700"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 text-xs font-semibold",
								children: [mode === "manager" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Terminal, { size: 14 }), "Switch Workspace"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${mode === "manager" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-700"}`,
								children: mode.toUpperCase()
							})]
						}),
						mode !== "manager" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, { n: settingsItem }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleSignout,
							className: "w-full flex items-center gap-3 px-3 py-2.5 rounded text-left text-sm font-semibold hover:bg-[#F4F5F7]",
							style: { color: C.slate },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { size: 16 }), "Sign out"]
						})
					]
				})
			]
		})
	}) })] });
}
function TopHeader({ title, onCapture, captureLabel = "Capture Evidence", onMenuClick, globalSearchQuery, onGlobalSearchQueryChange, globalSearchResults, onGlobalSearchSelect }) {
	const { userId } = useAuth();
	const queryClient = useQueryClient();
	const { data: notifications = [] } = useQuery({
		queryKey: ["header-notifications", userId],
		enabled: Boolean(userId),
		queryFn: async () => {
			const { data, error } = await supabase.from("notifications").select("id, type, title, description, is_read, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5);
			if (error) throw error;
			return data ?? [];
		}
	});
	const markAllReadMutation = useMutation({
		mutationFn: async () => {
			if (!userId) throw new Error("No active session found.");
			const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.setQueryData(["header-notifications", userId], (rows = []) => rows.map((row) => ({
				...row,
				is_read: true
			})));
			queryClient.invalidateQueries({ queryKey: ["header-notifications", userId] });
		},
		onError: (error) => {
			toast.error(error.message || "Unable to update notifications right now.");
		}
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const unread = notifications.filter((n) => !n.is_read).length;
	const hasSearchQuery = globalSearchQuery.length > 0;
	const hasGlobalResults = globalSearchResults.objectives.length > 0 || globalSearchResults.evidence.length > 0 || globalSearchResults.knowledge.length > 0;
	const groupedSearchResults = [
		{
			key: "objectives",
			label: "Objectives",
			items: globalSearchResults.objectives
		},
		{
			key: "evidence",
			label: "Evidence",
			items: globalSearchResults.evidence
		},
		{
			key: "knowledge",
			label: "Knowledge",
			items: globalSearchResults.knowledge
		}
	];
	function formatNotificationTime(createdAt) {
		const ts = new Date(createdAt).getTime();
		if (Number.isNaN(ts)) return "";
		const elapsedMs = Date.now() - ts;
		const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / (1e3 * 60)));
		if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
		const elapsedHours = Math.floor(elapsedMinutes / 60);
		if (elapsedHours < 24) return `${elapsedHours}h ago`;
		const elapsedDays = Math.floor(elapsedHours / 24);
		if (elapsedDays === 1) return "Yesterday";
		return `${elapsedDays}d ago`;
	}
	function getNotificationVisual(type) {
		if (type === "feedback") return {
			Icon: MessageSquare,
			iconClassName: "bg-blue-50 text-blue-600"
		};
		if (type === "auto_capture") return {
			Icon: Sparkles,
			iconClassName: "bg-blue-50 text-indigo-600"
		};
		if (type === "objective") return {
			Icon: UserCheck,
			iconClassName: "bg-blue-50 text-emerald-600"
		};
		return {
			Icon: FileText,
			iconClassName: "bg-blue-50 text-slate-600"
		};
	}
	function toggle() {
		setOpen((o) => !o);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "h-16 sticky top-0 z-30 border-b print-hide print:hidden",
		style: {
			background: C.card,
			borderColor: C.border
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onMenuClick,
					className: "lg:hidden p-2 rounded hover:bg-[#F4F5F7] shrink-0",
					style: { color: C.slate },
					"aria-label": "Open menu",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { size: 20 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-base md:text-xl font-bold tracking-tight truncate",
					style: { color: C.navy },
					children: title
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 md:gap-3 shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden md:block w-72 relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: globalSearchQuery,
							onChange: (e) => onGlobalSearchQueryChange(e.target.value),
							placeholder: "Search evidence, objectives, knowledge…",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 14 })
						}), hasSearchQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute left-0 right-0 top-full mt-2 z-40 rounded-lg border bg-white shadow-xl max-h-[420px] overflow-y-auto",
							style: { borderColor: C.border },
							children: [groupedSearchResults.map((group) => group.items.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-3 py-2 border-b last:border-b-0",
								style: { borderColor: C.border },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold uppercase tracking-wide mb-2",
									style: { color: C.subtle },
									children: group.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-1",
									children: group.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => onGlobalSearchSelect(item),
										className: "w-full rounded-md border px-2.5 py-2 text-left hover:bg-[#F8FAFF] transition-colors",
										style: { borderColor: C.border },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-semibold truncate",
											style: { color: C.navy },
											children: item.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs mt-0.5 line-clamp-2 break-words",
											style: { color: C.slate },
											children: item.description
										})]
									}, item.id))
								})]
							}, group.key) : null), !hasGlobalResults && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-4 py-6 text-center text-xs",
								style: { color: C.subtle },
								children: "No matches found in objectives, evidence, or knowledge."
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: toggle,
							"aria-label": "Notifications",
							className: "w-9 h-9 rounded flex items-center justify-center hover:bg-[#F4F5F7] relative",
							style: { color: C.slate },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { size: 18 }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center bg-red-500",
								children: unread
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "fixed inset-0 z-30",
							onClick: () => setOpen(false)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: -4
							},
							animate: {
								opacity: 1,
								y: 0
							},
							exit: {
								opacity: 0,
								y: -4
							},
							transition: { duration: .12 },
							className: "absolute right-0 top-11 z-40 w-[340px] max-w-[90vw] bg-white rounded-lg shadow-2xl border",
							style: { borderColor: C.border },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-4 py-3 border-b flex items-center justify-between",
								style: { borderColor: C.border },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-bold",
									style: { color: C.navy },
									children: "Notifications"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										markAllReadMutation.mutateAsync();
									},
									disabled: markAllReadMutation.isPending || unread === 0,
									className: "text-[11px] font-semibold hover:underline",
									style: { color: C.primary },
									children: "Mark all read"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-h-[400px] overflow-y-auto",
								children: [notifications.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "px-4 py-8 text-center text-xs",
									style: { color: C.subtle },
									children: "Your workspace alerts are completely up to date."
								}), notifications.map((n) => {
									const { Icon, iconClassName } = getNotificationVisual(n.type);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "px-4 py-3 border-b flex gap-3 hover:bg-[#FAFBFC]",
										style: { borderColor: C.border },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `w-8 h-8 rounded flex items-center justify-center shrink-0 ${iconClassName}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 16 })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 min-w-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs font-semibold truncate",
													style: { color: C.navy },
													children: n.title
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11px] mt-0.5 leading-snug",
													style: { color: C.slate },
													children: n.description
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[10px] mt-1",
													style: { color: C.subtle },
													children: formatNotificationTime(n.created_at)
												})
											]
										})]
									}, n.id);
								})]
							})]
						})] }) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
						onClick: onCapture,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: captureLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sm:hidden",
								children: captureLabel.toLowerCase().includes("knowledge") ? "Log" : "Capture"
							})
						]
					})
				]
			})]
		})
	});
}
function buildAutoExecutiveSummary(metrics) {
	const readinessLine = metrics.latestReadinessScore === null ? "No finalized readiness score is available yet." : `Latest readiness score is ${metrics.latestReadinessScore}/100.`;
	return [
		`This engineer has logged ${metrics.evidenceCount} verified evidence records and currently carries ${metrics.activeObjectivesCount} active objectives.`,
		`Completed objective count is ${metrics.completedObjectivesCount}, indicating sustained progression through planned growth tracks.`,
		readinessLine
	].join(" ");
}
function buildAutoCompetencySummary(metrics) {
	return [
		`Signal depth includes ${metrics.feedbackEntriesCount} submitted 360 feedback entries combined with objective and evidence trends.`,
		"Recent activity indicates consistent delivery cadence, measurable growth tracking, and readiness trajectory alignment against promotion expectations.",
		"Recommend validating role-level scope examples in the final manager review before submission."
	].join(" ");
}
function buildMarkdownPreview(args) {
	return [
		`# Promotion Compilation Dossier`,
		``,
		`## Target Role`,
		args.targetRoleTitle || "Not specified",
		``,
		`## Executive Summary`,
		args.executiveSummary || "No summary drafted yet.",
		``,
		`## Competency Gains`,
		args.competencySummary || "No competency gains summary drafted yet.",
		``,
		`## Supporting Metrics`,
		`- Evidence records: ${args.metrics.evidenceCount}`,
		`- Active objectives: ${args.metrics.activeObjectivesCount}`,
		`- Completed objectives: ${args.metrics.completedObjectivesCount}`,
		`- Latest readiness score: ${args.metrics.latestReadinessScore === null ? "N/A" : `${args.metrics.latestReadinessScore}/100`}`,
		`- Submitted 360 feedback entries: ${args.metrics.feedbackEntriesCount}`,
		``
	].join("\n");
}
function BusinessCaseTab({ engineerId }) {
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [generating, setGenerating] = (0, import_react.useState)(false);
	const [businessCaseId, setBusinessCaseId] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("draft");
	const [targetRoleTitle, setTargetRoleTitle] = (0, import_react.useState)("");
	const [executiveSummary, setExecutiveSummary] = (0, import_react.useState)("");
	const [competencySummary, setCompetencySummary] = (0, import_react.useState)("");
	const [metrics, setMetrics] = (0, import_react.useState)({
		evidenceCount: 0,
		activeObjectivesCount: 0,
		completedObjectivesCount: 0,
		latestReadinessScore: null,
		feedbackEntriesCount: 0
	});
	(0, import_react.useEffect)(() => {
		let isActive = true;
		async function loadDossierState() {
			if (!engineerId) return;
			setLoading(true);
			try {
				const [caseResponse, evidenceResponse, objectivesResponse, readinessResponse, feedbackResponse] = await Promise.all([
					supabase.from("business_cases").select("id, target_role_title, executive_summary, competency_gains_summary, status").eq("engineer_id", engineerId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
					supabase.from("evidence").select("id").eq("user_id", engineerId),
					supabase.from("objectives").select("id, status").eq("user_id", engineerId),
					supabase.from("assessments").select("overall_readiness_score").eq("user_id", engineerId).order("date_completed", { ascending: false }).limit(1).maybeSingle(),
					supabase.from("three_sixty_feedback").select("id").eq("engineer_id", engineerId).eq("status", "submitted")
				]);
				if (!isActive) return;
				if (caseResponse.error) throw caseResponse.error;
				if (evidenceResponse.error) throw evidenceResponse.error;
				if (objectivesResponse.error) throw objectivesResponse.error;
				if (readinessResponse.error) throw readinessResponse.error;
				if (feedbackResponse.error) throw feedbackResponse.error;
				const caseRow = caseResponse.data ?? null;
				const objectives = objectivesResponse.data ?? [];
				setMetrics({
					evidenceCount: (evidenceResponse.data ?? []).length,
					activeObjectivesCount: objectives.filter((item) => item.status === "In Progress").length,
					completedObjectivesCount: objectives.filter((item) => item.status === "Completed").length,
					latestReadinessScore: typeof readinessResponse.data?.overall_readiness_score === "number" ? readinessResponse.data.overall_readiness_score : null,
					feedbackEntriesCount: (feedbackResponse.data ?? []).length
				});
				setBusinessCaseId(caseRow?.id ?? null);
				setStatus(caseRow?.status ?? "draft");
				setTargetRoleTitle(caseRow?.target_role_title ?? "");
				setExecutiveSummary(caseRow?.executive_summary ?? "");
				setCompetencySummary(caseRow?.competency_gains_summary ?? "");
			} catch (error) {
				const message = error instanceof Error ? error.message : "Unable to load business case compilation data.";
				toast.error(message);
			} finally {
				if (isActive) setLoading(false);
			}
		}
		loadDossierState();
		return () => {
			isActive = false;
		};
	}, [engineerId]);
	const markdownPreview = (0, import_react.useMemo)(() => buildMarkdownPreview({
		targetRoleTitle,
		executiveSummary,
		competencySummary,
		metrics
	}), [
		competencySummary,
		executiveSummary,
		metrics,
		targetRoleTitle
	]);
	async function handleGenerateAutoDraft() {
		setGenerating(true);
		try {
			setExecutiveSummary(buildAutoExecutiveSummary(metrics));
			setCompetencySummary(buildAutoCompetencySummary(metrics));
			if (!targetRoleTitle.trim()) setTargetRoleTitle("Senior Software Engineer");
			toast.success("Compilation dossier generated from current engineer signals.");
		} finally {
			setGenerating(false);
		}
	}
	async function handleSaveCase() {
		if (!engineerId || !targetRoleTitle.trim()) {
			toast.error("Target role title is required before saving.");
			return;
		}
		setSaving(true);
		try {
			const { data: { user }, error: userError } = await supabase.auth.getUser();
			if (userError) throw userError;
			if (!user?.id) throw new Error("No active manager session found.");
			if (businessCaseId) {
				const { error } = await supabase.from("business_cases").update({
					target_role_title: targetRoleTitle.trim(),
					executive_summary: executiveSummary.trim() || null,
					competency_gains_summary: competencySummary.trim() || null,
					status,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", businessCaseId);
				if (error) throw error;
			} else {
				const { data, error } = await supabase.from("business_cases").insert({
					engineer_id: engineerId,
					manager_id: user.id,
					target_role_title: targetRoleTitle.trim(),
					executive_summary: executiveSummary.trim() || null,
					competency_gains_summary: competencySummary.trim() || null,
					status
				}).select("id").single();
				if (error) throw error;
				setBusinessCaseId(data.id);
			}
			toast.success("Compilation dossier saved.");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to save compilation dossier.";
			toast.error(message);
		} finally {
			setSaving(false);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-40 rounded-xl border border-slate-200 bg-slate-50 animate-pulse" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 14 }), "Compilation Dossier"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-1 text-sm font-semibold text-slate-900",
						children: "Automated Business Case Generator"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void handleGenerateAutoDraft(),
							disabled: generating,
							className: "inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, { size: 13 }), generating ? "Generating..." : "Regenerate Draft"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void handleSaveCase(),
							disabled: saving,
							className: "inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 13 }), saving ? "Saving..." : "Save Dossier"]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: targetRoleTitle,
							onChange: (event) => setTargetRoleTitle(event.target.value),
							placeholder: "Target role title",
							className: "h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: status,
							onChange: (event) => setStatus(event.target.value === "approved" ? "approved" : event.target.value === "submitted" ? "submitted" : "draft"),
							className: "h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "draft",
									children: "draft"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "submitted",
									children: "submitted"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "approved",
									children: "approved"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: executiveSummary,
							onChange: (event) => setExecutiveSummary(event.target.value),
							placeholder: "Executive summary",
							className: "min-h-[130px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 md:col-span-2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: competencySummary,
							onChange: (event) => setCompetencySummary(event.target.value),
							placeholder: "Competency gains summary",
							className: "min-h-[130px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 md:col-span-2"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-semibold uppercase tracking-wider text-slate-500",
					children: "Live Metrics"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Evidence",
							value: String(metrics.evidenceCount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Active Objectives",
							value: String(metrics.activeObjectivesCount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Completed Objectives",
							value: String(metrics.completedObjectivesCount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Readiness",
							value: metrics.latestReadinessScore === null ? "N/A" : `${metrics.latestReadinessScore}/100`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "360 Entries",
							value: String(metrics.feedbackEntriesCount)
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-semibold uppercase tracking-wider text-slate-500",
					children: "Generated Markdown Preview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700",
					children: markdownPreview
				})]
			})
		]
	});
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] uppercase tracking-wide text-slate-500",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-sm font-semibold text-slate-900",
			children: value
		})]
	});
}
function OneOnOneWorkspace({ engineerId }) {
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [topics, setTopics] = (0, import_react.useState)([]);
	const [resources, setResources] = (0, import_react.useState)([]);
	const [newTopic, setNewTopic] = (0, import_react.useState)("");
	const [newResourceTitle, setNewResourceTitle] = (0, import_react.useState)("");
	const [newResourceContext, setNewResourceContext] = (0, import_react.useState)("");
	async function loadWorkspaceData() {
		if (!engineerId) return;
		setLoading(true);
		try {
			const [topicsResponse, resourcesResponse] = await Promise.all([supabase.from("one_on_one_topics").select("id, topic_text, created_at").eq("engineer_id", engineerId).eq("status", "open").order("created_at", { ascending: false }), supabase.from("team_shared_resources").select("id, title, url_context, created_at").order("created_at", { ascending: false }).limit(12)]);
			if (topicsResponse.error) throw topicsResponse.error;
			if (resourcesResponse.error) throw resourcesResponse.error;
			setTopics(topicsResponse.data ?? []);
			setResources(resourcesResponse.data ?? []);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to sync 1-on-1 and resources workspace.";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}
	(0, import_react.useEffect)(() => {
		loadWorkspaceData();
	}, [engineerId]);
	async function handleAddTopic(event) {
		event.preventDefault();
		if (!newTopic.trim() || !engineerId) return;
		try {
			const { data: { user }, error: userError } = await supabase.auth.getUser();
			if (userError) throw userError;
			if (!user?.id) throw new Error("No active manager session found.");
			const { error } = await supabase.from("one_on_one_topics").insert({
				engineer_id: engineerId,
				manager_id: user.id,
				topic_text: newTopic.trim()
			});
			if (error) throw error;
			setNewTopic("");
			toast.success("Added topic to the shared 1-on-1 agenda.");
			await loadWorkspaceData();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to add 1-on-1 topic.";
			toast.error(message);
		}
	}
	async function handleAddResource(event) {
		event.preventDefault();
		if (!newResourceTitle.trim() || !newResourceContext.trim()) return;
		try {
			const { data: { user }, error: userError } = await supabase.auth.getUser();
			if (userError) throw userError;
			if (!user?.id) throw new Error("No active manager session found.");
			const { error } = await supabase.from("team_shared_resources").insert({
				author_id: user.id,
				title: newResourceTitle.trim(),
				url_context: newResourceContext.trim()
			});
			if (error) throw error;
			setNewResourceTitle("");
			setNewResourceContext("");
			toast.success("Suggested learning resource published to the shared hub.");
			await loadWorkspaceData();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to publish resource.";
			toast.error(message);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-40 rounded-xl border border-slate-200 bg-slate-50 animate-pulse" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquarePlus, { size: 14 }), "1-on-1 Sync Agenda"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-slate-500",
					children: "Log discussion items so both manager and engineer can align priorities ahead of the next sync."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleAddTopic,
					className: "mt-4 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: newTopic,
						onChange: (event) => setNewTopic(event.target.value),
						placeholder: "Add a discussion topic...",
						className: "h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "submit",
						className: "inline-flex h-10 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white hover:bg-slate-800",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 13 }), "Add"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-2 max-h-64 overflow-y-auto pr-1",
					children: topics.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500",
						children: "No open agenda topics yet."
					}) : topics.map((topic) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-slate-800",
							children: topic.topic_text
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-[11px] text-slate-500",
							children: new Date(topic.created_at).toLocaleString()
						})]
					}, topic.id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { size: 14 }), "Suggested Learning Resources"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-slate-500",
					children: "Curate team-shared references, playbooks, and learning links tied to active competency gaps."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleAddResource,
					className: "mt-4 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: newResourceTitle,
							onChange: (event) => setNewResourceTitle(event.target.value),
							placeholder: "Resource title",
							className: "h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: newResourceContext,
							onChange: (event) => setNewResourceContext(event.target.value),
							placeholder: "URL or context note",
							className: "min-h-[92px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							className: "inline-flex h-10 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white hover:bg-slate-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 13 }), "Publish Resource"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-2 max-h-64 overflow-y-auto pr-1",
					children: resources.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500",
						children: "No shared resources available yet."
					}) : resources.map((resource) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold text-slate-900",
								children: resource.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 break-words text-xs text-slate-600",
								children: resource.url_context
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-[11px] text-slate-500",
								children: new Date(resource.created_at).toLocaleString()
							})
						]
					}, resource.id))
				})
			]
		})]
	});
}
function ManagerDashboardView({ linkedEngineers, teamOverview, isLoading, isError, onInspectEngineer }) {
	const pendingReviewLogs = (0, import_react.useMemo)(() => teamOverview.reduce((sum, engineer) => sum + Math.max(engineer.pendingReviewsCount, 0), 0), [teamOverview]);
	const objectiveApprovals = (0, import_react.useMemo)(() => teamOverview.filter((engineer) => engineer.pendingReviewsCount > 0).length, [teamOverview]);
	const calibrationReadyCount = (0, import_react.useMemo)(() => teamOverview.filter((engineer) => engineer.promotionReadinessIndex >= 70).length, [teamOverview]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6 max-w-6xl mx-auto w-full space-y-6 font-sans animate-fadeIn",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-200 pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-extrabold text-slate-900 tracking-tight",
					children: "Lead Operations Dashboard"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-slate-500 mt-0.5",
					children: "Continuous overview of team performance, artifact approvals, and promotion horizons."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[10px] font-bold text-slate-400 uppercase tracking-wider",
								children: "Pending Review Logs"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-base font-extrabold text-slate-800 block mt-0.5",
								children: [pendingReviewLogs, " Submissions Waiting"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[10px] font-bold text-slate-400 uppercase tracking-wider",
								children: "Objective Approvals"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-base font-extrabold text-slate-800 block mt-0.5",
								children: [objectiveApprovals, " Authorizations Queue"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[10px] font-bold text-slate-400 uppercase tracking-wider",
								children: "Calibration Windows"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-base font-extrabold text-slate-800 block mt-0.5",
								children: calibrationReadyCount > 0 ? `${calibrationReadyCount} Ready` : "Q2 Review Sync Open"
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-bold text-slate-700 uppercase tracking-wide",
						children: "Direct Reports Progress Matrix"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[10px] bg-slate-100 border text-slate-500 px-2 py-0.5 rounded font-mono font-bold",
						children: ["Total Managed: ", linkedEngineers.length]
					})]
				}), linkedEngineers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-8 text-center space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold text-slate-600",
						children: "No active engineer connections established."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-slate-400 max-w-xs mx-auto leading-normal",
						children: "Share an onboarding invitation link from your developer settings workspace to link a direct report profile onto this performance grid."
					})]
				}) : isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-8 text-center text-sm text-slate-500",
					children: "Loading team overview..."
				}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-8 text-center text-sm text-slate-500",
					children: "Team connection is active, but detailed profile metrics are still syncing."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left border-collapse text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "bg-slate-50/30 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider select-none",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 font-bold",
									children: "Engineer Profile"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 font-bold",
									children: "Current Grade Baseline"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 font-bold",
									children: "Evidence Logging Track"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 font-bold",
									children: "Promotion Status Marker"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 px-5 font-bold text-right",
									children: "Operational Link"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
							className: "divide-y divide-slate-100",
							children: [teamOverview.map((eng) => {
								const totalObjectives = Math.max(eng.totalObjectivesCount, 0);
								const completedObjectives = Math.max(eng.completedObjectivesCount, 0);
								const completionPct = totalObjectives > 0 ? Math.min(100, Math.round(completedObjectives / totalObjectives * 100)) : 0;
								const statusLabel = eng.promotionReadinessIndex >= 70 ? "Calibration Ready" : eng.pendingReviewsCount > 0 ? "Needs Review" : "Tracking";
								const statusToneClass = eng.promotionReadinessIndex >= 70 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : eng.pendingReviewsCount > 0 ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-slate-100 border-slate-200 text-slate-700";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-slate-50/60 transition-colors group",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-5 font-bold text-slate-800",
											children: eng.fullName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-5 text-slate-500 font-medium",
											children: eng.currentTitle || "Software Engineer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2 max-w-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0 border border-slate-200/40",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "bg-indigo-600 h-full rounded-full",
														style: { width: `${completionPct}%` }
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[10px] font-mono text-slate-400 font-bold",
													children: [completionPct, "% density"]
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusToneClass}`,
												children: statusLabel
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-5 text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => onInspectEngineer(eng.engineerId),
												className: "inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer group-hover:translate-x-0.5 transition-transform",
												children: ["Inspect Profiles ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })]
											})
										})
									]
								}, eng.engineerId);
							}), teamOverview.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 5,
								className: "py-8 px-5 text-center text-sm text-slate-500",
								children: "No linked profiles are available yet."
							}) })]
						})]
					})
				})]
			})
		]
	});
}
function CreateObjectiveModal({ frameworkMatrix, onClose, onSubmit }) {
	const categoryMap = (0, import_react.useMemo)(() => resolveFrameworkCategoryMap(frameworkMatrix), [frameworkMatrix]);
	const objCategories = (0, import_react.useMemo)(() => {
		const matrixCategories = frameworkMatrix?.categories ?? {};
		const dynamicKeys = Object.keys(matrixCategories || {});
		if (dynamicKeys.length > 0) return dynamicKeys;
		return Object.keys(categoryMap);
	}, [categoryMap, frameworkMatrix]);
	const [competency, setCompetency] = (0, import_react.useState)(objCategories[0] ?? "");
	const [subcategory, setSubcategory] = (0, import_react.useState)(categoryMap[objCategories[0] ?? ""]?.items[0] ?? "");
	const [title, setTitle] = (0, import_react.useState)("");
	const [statement, setStatement] = (0, import_react.useState)("");
	const [startDate, setStartDate] = (0, import_react.useState)(toLocalDateString());
	const [s, setS] = (0, import_react.useState)("");
	const [m, setM] = (0, import_react.useState)("");
	const [a, setA] = (0, import_react.useState)("");
	const [r, setR] = (0, import_react.useState)("");
	const [timeboundDate, setTimeboundDate] = (0, import_react.useState)("");
	const [learn, setLearn] = (0, import_react.useState)([{
		criteria: "",
		evidence: "",
		attachments: []
	}]);
	const [demonstrate, setDemonstrate] = (0, import_react.useState)([{
		criteria: "",
		evidence: "",
		attachments: []
	}]);
	const [share, setShare] = (0, import_react.useState)([{
		criteria: "",
		evidence: "",
		attachments: []
	}]);
	function onCatChange(v) {
		setCompetency(v);
		setSubcategory(categoryMap[v]?.items[0] ?? "");
	}
	(0, import_react.useEffect)(() => {
		if (!objCategories.includes(competency)) {
			const fallbackCategory = objCategories[0] ?? "";
			setCompetency(fallbackCategory);
			setSubcategory(categoryMap[fallbackCategory]?.items[0] ?? "");
			return;
		}
		const options = categoryMap[competency]?.items ?? [];
		if (!options.includes(subcategory)) setSubcategory(options[0] ?? "");
	}, [
		categoryMap,
		competency,
		objCategories,
		subcategory
	]);
	(0, import_react.useEffect)(() => {
		if (!startDate || !timeboundDate) return;
		if (timeboundDate < startDate) setTimeboundDate(startDate);
	}, [startDate, timeboundDate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backdrop$2, {
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				scale: .97,
				y: 8
			},
			animate: {
				opacity: 1,
				scale: 1,
				y: 0
			},
			exit: {
				opacity: 0,
				scale: .97,
				y: 8
			},
			transition: { duration: .2 },
			className: "bg-white rounded-lg shadow-2xl w-full max-w-4xl border max-h-[90vh] overflow-hidden flex flex-col",
			style: { borderColor: C.border },
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 border-b flex items-center justify-between",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs font-semibold uppercase tracking-wide",
						style: { color: C.subtle },
						children: "New Objective"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-lg font-bold mt-0.5",
						style: { color: C.navy },
						children: "Create SMART Objective"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "p-1.5 rounded hover:bg-[#F4F5F7]",
						style: { color: C.slate },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-5 flex-1 overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-3 p-6 overflow-y-auto space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px]",
										style: { color: C.subtle },
										children: [
											"Fields marked ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { color: "#DE350B" },
												children: "*"
											}),
											" are required."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Objective Title",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: title,
											onChange: (e) => setTitle(e.target.value),
											placeholder: "Short, action-oriented title"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Objective Statement",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea$2, {
											rows: 3,
											value: statement,
											onChange: (e) => setStatement(e.target.value),
											placeholder: "Describe what you intend to achieve and why it matters."
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Start Date (Authored Date)",
											required: true,
											hint: "Defaults to today and represents when the objective starts.",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												value: startDate,
												onChange: (e) => setStartDate(e.target.value),
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 14 })
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Target Category",
											required: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
												value: competency,
												onChange: (e) => onCatChange(e.target.value),
												children: objCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
										label: "Target Subcategory / Question",
										required: true,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
											value: subcategory,
											onChange: (e) => setSubcategory(e.target.value),
											children: (categoryMap[competency]?.items ?? []).map((sc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: sc }, sc))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] mt-1.5 leading-relaxed",
											style: { color: C.subtle },
											children: categoryMap[competency]?.summary || COMPETENCY_DESC[competency] || ""
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { style: { borderColor: C.border } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-bold uppercase tracking-wider",
										style: { color: C.subtle },
										children: "SMART Breakdown"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmartField, {
										letter: "S",
										name: "Specific",
										hint: "Clearly state who, what action, and context. Avoid vague verbs like 'understand'.",
										value: s,
										onChange: setS
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmartField, {
										letter: "M",
										name: "Measurable",
										hint: "Define how you will evaluate success (e.g., a completed project or assessment).",
										value: m,
										onChange: setM
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmartField, {
										letter: "A",
										name: "Achievable",
										hint: "Ensure it is realistic based on your current skills, resources, and time.",
										value: a,
										onChange: setA
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmartField, {
										letter: "R",
										name: "Relevant",
										hint: "How does this align with your promotion goals?",
										value: r,
										onChange: setR
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 mb-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white",
												style: { background: C.primary },
												children: "T"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-sm font-semibold",
												style: { color: C.navy },
												children: ["Time-bound", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-0.5",
													style: { color: "#DE350B" },
													children: "*"
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: timeboundDate,
											onChange: (e) => setTimeboundDate(e.target.value),
											min: startDate || void 0,
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 14 })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] mt-1",
											style: { color: C.subtle },
											children: "Completion date. Dates earlier than Start Date are disabled."
										})
									] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { style: { borderColor: C.border } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CriteriaSection, {
								title: "Learn",
								icon: BookOpen,
								tone: "info",
								evidenceLabel: "Materials Used",
								evidencePlaceholder: "Link to docs, videos, courses",
								rows: learn,
								onChange: setLearn,
								criteriaPlaceholder: "What will you learn?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { style: { borderColor: C.border } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CriteriaSection, {
								title: "Demonstrate",
								icon: Wrench,
								tone: "warning",
								evidenceLabel: "Evidence",
								evidencePlaceholder: "Link to PR, code snippet, doc",
								rows: demonstrate,
								onChange: setDemonstrate,
								criteriaPlaceholder: "How will you apply what you learned?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { style: { borderColor: C.border } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CriteriaSection, {
								title: "Share",
								icon: Share2,
								tone: "success",
								evidenceLabel: "Presentation Artifacts",
								evidencePlaceholder: "Link to slides, YouTube, doc",
								rows: share,
								onChange: setShare,
								criteriaPlaceholder: "How will you teach others?"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "col-span-2 border-l p-6 overflow-y-auto",
						style: {
							borderColor: C.border,
							background: C.bg
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									size: 16,
									style: { color: C.primary }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-bold",
									style: { color: C.navy },
									children: "Writing Effective Objectives"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded border mb-4",
								style: {
									background: C.primarySoft,
									borderColor: "transparent"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-bold uppercase tracking-wider mb-1",
									style: { color: C.primary },
									children: "Pro Tip - Bloom's Taxonomy"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs leading-relaxed",
									style: { color: C.navy },
									children: "Rely on observable action verbs (identify, analyze, demonstrate). Instead of \"understand the new software\", use \"execute core data-entry tasks\"."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-bold uppercase tracking-wider mb-2",
								style: { color: C.subtle },
								children: "Examples"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded border mb-2 text-xs",
								style: {
									borderColor: C.border,
									background: "#fff"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold mb-1",
									style: { color: C.red },
									children: "Weak"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: { color: C.slate },
									children: "\"Get better at system design.\""
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded border text-xs",
								style: {
									borderColor: C.border,
									background: "#fff"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold mb-1",
									style: { color: "#006644" },
									children: "SMART"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: { color: C.slate },
									children: "\"By Q1 end, author and present 2 RFCs for the search platform re-architecture, reviewed by a Staff engineer, and reduce p95 query latency by 30% in staging.\""
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-t flex items-center justify-end gap-2",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						onClick: onClose,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
						disabled: !title.trim() || !statement.trim() || !startDate || !timeboundDate,
						onClick: () => onSubmit({
							title: title.trim(),
							competency: competency.trim(),
							targetSubcategory: subcategory.trim(),
							due: timeboundDate,
							statement: statement.trim(),
							dateAuthored: startDate,
							specific: s,
							measurable: m,
							achievable: a,
							relevant: r,
							timebound: timeboundDate,
							successCriteria: {
								learn: learn.filter((x) => x.criteria.trim()),
								demonstrate: demonstrate.filter((x) => x.criteria.trim()),
								share: share.filter((x) => x.criteria.trim())
							}
						}),
						children: "Submit for Manager Approval"
					})]
				})
			]
		})
	});
}
function SmartField({ letter, name, hint, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 mb-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white",
					style: { background: C.primary },
					children: letter
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold",
					style: { color: C.navy },
					children: name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] uppercase tracking-wide",
					style: { color: C.subtle },
					children: "Optional"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea$2, {
			rows: 5,
			value,
			onChange: (e) => onChange(e.target.value)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] mt-1",
			style: { color: C.subtle },
			children: hint
		})
	] });
}
function CriteriaSection({ title, icon: Icon, tone, evidenceLabel, evidencePlaceholder, rows, onChange, criteriaPlaceholder }) {
	const update = (i, patch) => onChange(rows.map((r, idx) => idx === i ? {
		...r,
		...patch
	} : r));
	const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
	const add = () => onChange([...rows, {
		criteria: "",
		evidence: "",
		attachments: []
	}]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between mb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					size: 14,
					style: { color: C.primary }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-bold",
					style: { color: C.navy },
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone,
					children: rows.length
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
			onClick: add,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 12 }), "Add row"]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-3 rounded border space-y-2",
			style: {
				borderColor: C.border,
				background: "#FAFBFC"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: row.criteria,
						onChange: (e) => update(i, { criteria: e.target.value }),
						placeholder: criteriaPlaceholder
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: row.evidence,
						onChange: (e) => update(i, { evidence: e.target.value }),
						placeholder: `${evidenceLabel}: ${evidencePlaceholder}`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, { size: 12 })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => remove(i),
					className: "p-1.5 rounded hover:bg-[#FFEBE6]",
					style: { color: C.red },
					title: "Remove row",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 14 })
				})]
			})
		}, i)), rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs px-3 py-4 rounded border border-dashed text-center",
			style: {
				borderColor: C.border,
				color: C.subtle
			},
			children: "No criteria added yet."
		})]
	})] });
}
function ObjectiveSlideover({ objective, frameworkMatrix, onClose, onPin, onSave, onChangeStatus, onArchive }) {
	const categoryMap = (0, import_react.useMemo)(() => resolveFrameworkCategoryMap(frameworkMatrix), [frameworkMatrix]);
	const objCategories = (0, import_react.useMemo)(() => {
		const matrixCategories = frameworkMatrix?.categories ?? {};
		const dynamicKeys = Object.keys(matrixCategories || {});
		if (dynamicKeys.length > 0) return dynamicKeys;
		return Object.keys(categoryMap);
	}, [categoryMap, frameworkMatrix]);
	const initialCompetency = resolveCategoryFromFramework(objective.competency, objCategories) ?? objCategories[0] ?? "";
	const [smartOpen, setSmartOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)(objective.title);
	const [competency, setCompetency] = (0, import_react.useState)(initialCompetency);
	const [targetSubcategory, setTargetSubcategory] = (0, import_react.useState)(() => {
		const subcategoryOptions = categoryMap[initialCompetency]?.items ?? [];
		if (objective.targetSubcategory && subcategoryOptions.includes(objective.targetSubcategory)) return objective.targetSubcategory;
		return subcategoryOptions[0] ?? "";
	});
	const [links, setLinks] = (0, import_react.useState)(objective.links ?? []);
	const [newLink, setNewLink] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)(objective.notes ?? "");
	const [statement, setStatement] = (0, import_react.useState)(objective.statement ?? "");
	const [criteria, setCriteria] = (0, import_react.useState)(objective.successCriteria ?? {
		learn: [],
		demonstrate: [],
		share: []
	});
	const isTodo = objective.status === "Pending Approval";
	const locked = objective.status === "Completed";
	const readOnly = !isTodo;
	const [editMode, setEditMode] = (0, import_react.useState)(false);
	const isEditable = isTodo && editMode;
	const [confirmArchive, setConfirmArchive] = (0, import_react.useState)(false);
	function onObjectiveCategoryChange(nextCategory) {
		setCompetency(nextCategory);
		setTargetSubcategory(categoryMap[nextCategory]?.items[0] ?? "");
	}
	(0, import_react.useEffect)(() => {
		if (!objCategories.includes(competency)) {
			const fallbackCategory = resolveCategoryFromFramework(objective.competency, objCategories) ?? objCategories[0] ?? "";
			setCompetency(fallbackCategory);
			const fallbackOptions = categoryMap[fallbackCategory]?.items ?? [];
			setTargetSubcategory(objective.targetSubcategory && fallbackOptions.includes(objective.targetSubcategory) ? objective.targetSubcategory : fallbackOptions[0] ?? "");
			return;
		}
		const options = categoryMap[competency]?.items ?? [];
		if (!options.includes(targetSubcategory)) setTargetSubcategory(objective.targetSubcategory && options.includes(objective.targetSubcategory) ? objective.targetSubcategory : options[0] ?? "");
	}, [
		categoryMap,
		competency,
		objCategories,
		objective.competency,
		objective.targetSubcategory,
		targetSubcategory
	]);
	function buildUpdated() {
		return {
			...objective,
			title,
			competency,
			targetSubcategory,
			notes,
			links,
			statement,
			successCriteria: criteria
		};
	}
	const nextStatus = objective.status === "Pending Approval" ? "In Progress" : objective.status === "In Progress" ? "Completed" : null;
	const nextLabel = objective.status === "Pending Approval" ? "Approve & Move to In Progress" : objective.status === "In Progress" ? "Mark as Completed" : "";
	const statusBadgeClass = objective.status === "Completed" ? "text-emerald-700 bg-emerald-50" : objective.status === "In Progress" ? "text-sky-700 bg-sky-50" : "text-amber-700 bg-amber-50";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: .15 },
		className: "fixed inset-0 z-50",
		style: { background: "rgba(9, 30, 66, 0.45)" },
		onClick: onClose,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: { x: "100%" },
			animate: { x: 0 },
			exit: { x: "100%" },
			transition: {
				duration: .22,
				ease: [
					.22,
					1,
					.36,
					1
				]
			},
			className: "absolute top-0 right-0 h-full w-full md:w-[48%] bg-white shadow-2xl flex flex-col overflow-x-hidden",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 pt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 text-xs",
							style: { color: C.subtle },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Objectives" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 12 }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold truncate max-w-[220px] md:max-w-[320px]",
									style: { color: C.slate },
									title: objective.title,
									children: objective.title
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => onPin(objective),
									title: "Pin objective to workspace",
									className: "p-1.5 rounded hover:bg-[#F4F5F7]",
									style: { color: C.slate },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { size: 16 })
								}),
								isTodo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setEditMode((v) => !v),
									title: editMode ? "Done editing" : "Edit",
									className: "p-1.5 rounded hover:bg-[#F4F5F7]",
									style: { color: editMode ? C.primary : C.slate },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { size: 16 })
								}),
								!locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										setConfirmArchive(true);
									},
									title: "Archive",
									className: "p-1.5 rounded hover:bg-[#FFEBE6]",
									style: { color: C.red },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { size: 16 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: onClose,
									className: "p-1.5 rounded hover:bg-[#F4F5F7]",
									style: { color: C.slate },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-slate-100 pb-4 mb-6",
						children: [
							isEditable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: title,
								onChange: (e) => setTitle(e.target.value),
								className: "mt-3 mb-4 h-11 text-xl font-bold tracking-tight text-slate-900 leading-snug",
								placeholder: "Objective title"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xl font-bold tracking-tight text-slate-900 mb-4 leading-snug mt-3",
								children: title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2 items-center mb-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${statusBadgeClass}`,
										children: [locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 10 }), objective.status]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50",
										children: competency
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100",
										children: targetSubcategory || "No subcategory selected"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-violet-700 bg-violet-50",
										children: ["Due ", objective.due || "Not set"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownBadge, { due: objective.due })
								]
							}),
							readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-slate-500",
								children: locked ? "Locked - read only" : "Read only after moving out of To Do"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded border",
							style: { borderColor: C.border },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setSmartOpen((x) => !x),
								className: "w-full px-4 py-3 flex items-center justify-between text-sm font-semibold",
								style: { color: C.navy },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SMART Details" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
									animate: { rotate: smartOpen ? 180 : 0 },
									transition: { duration: .18 },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { size: 16 })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
								initial: false,
								children: smartOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
									initial: {
										height: 0,
										opacity: 0
									},
									animate: {
										height: "auto",
										opacity: 1
									},
									exit: {
										height: 0,
										opacity: 0
									},
									transition: { duration: .18 },
									className: "overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "px-4 pb-4 space-y-3 text-sm",
										style: { color: C.slate },
										children: [
											[
												"S",
												"Specific",
												objective.specific
											],
											[
												"M",
												"Measurable",
												objective.measurable
											],
											[
												"A",
												"Achievable",
												objective.achievable
											],
											[
												"R",
												"Relevant",
												objective.relevant
											],
											[
												"T",
												"Time-bound",
												objective.timebound
											]
										].map(([k, n, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] font-bold uppercase tracking-wider",
											style: { color: C.primary },
											children: [
												k,
												" - ",
												n
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-0.5",
											children: v || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { color: C.subtle },
												children: "Not provided"
											})
										})] }, k))
									})
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "space-y-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5",
									children: "Competency Mapping"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-10 flex items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700",
									children: competency || "Not provided"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5",
									children: "Target Category"
								}), isEditable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: competency,
									onChange: (e) => onObjectiveCategoryChange(e.target.value),
									className: "h-10 w-full px-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all",
									children: objCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-10 flex items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700",
									children: competency
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5",
									children: "Target Subcategory / Question"
								}), isEditable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: targetSubcategory,
									onChange: (e) => setTargetSubcategory(e.target.value),
									className: "h-10 w-full px-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all",
									children: (categoryMap[competency]?.items ?? []).map((sc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: sc }, sc))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "min-h-10 flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-snug text-slate-700",
									children: targetSubcategory || "Not provided"
								})] })
							]
						}),
						(objective.statement || isEditable) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "p-4 rounded border",
							style: {
								borderColor: C.border,
								background: "#FAFBFC"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-bold uppercase tracking-wider mb-1.5",
									style: { color: C.subtle },
									children: "Objective Statement"
								}),
								isEditable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea$2, {
									rows: 3,
									value: statement,
									onChange: (e) => setStatement(e.target.value),
									placeholder: "Describe what you intend to achieve and why it matters."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm leading-relaxed break-words",
									style: { color: C.navy },
									children: statement || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: C.subtle },
										children: "No statement."
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between mt-2 gap-3 flex-wrap",
									children: [objective.dateAuthored && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px]",
										style: { color: C.subtle },
										children: [
											"Authored ",
											objective.dateAuthored,
											" - Time-bound ",
											objective.due
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownBadge, { due: objective.due })]
								})
							]
						}),
						(criteria || isEditable) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, {
								size: 14,
								style: { color: C.slate }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold",
								style: { color: C.navy },
								children: "Success Criteria"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: [
								{
									key: "learn",
									label: "Learn",
									icon: BookOpen,
									tone: "info",
									evidenceLabel: "Materials Used",
									evidencePlaceholder: "Link to docs, videos, courses",
									criteriaPlaceholder: "What will you learn?"
								},
								{
									key: "demonstrate",
									label: "Demonstrate",
									icon: Wrench,
									tone: "warning",
									evidenceLabel: "Evidence",
									evidencePlaceholder: "Link to PR, code snippet, doc",
									criteriaPlaceholder: "How will you apply what you learned?"
								},
								{
									key: "share",
									label: "Share",
									icon: Share2,
									tone: "success",
									evidenceLabel: "Presentation Artifacts",
									evidencePlaceholder: "Link to slides, YouTube, doc",
									criteriaPlaceholder: "How will you teach others?"
								}
							].map(({ key, label, icon: Icon, tone, evidenceLabel, evidencePlaceholder, criteriaPlaceholder }) => {
								const rows = criteria[key] ?? [];
								if (isEditable) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded border p-3",
									style: { borderColor: C.border },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CriteriaSection, {
										title: label,
										icon: Icon,
										tone,
										evidenceLabel,
										evidencePlaceholder,
										rows,
										onChange: (next) => setCriteria((c) => ({
											...c,
											[key]: next
										})),
										criteriaPlaceholder
									})
								}, key);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded border overflow-hidden",
									style: { borderColor: C.border },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "px-4 py-2.5 flex items-center justify-between border-b",
										style: {
											borderColor: C.border,
											background: "#FAFBFC"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
												size: 14,
												style: { color: C.primary }
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-semibold",
												style: { color: C.navy },
												children: label
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											tone,
											children: [rows.length, " criteria"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "divide-y",
										style: { borderColor: C.border },
										children: [rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "px-4 py-3 grid grid-cols-[1fr_auto] gap-3 items-start min-w-0",
											style: { borderColor: C.border },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-sm leading-snug break-words",
													style: { color: C.navy },
													children: r.criteria
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[11px] mt-1 flex items-center gap-1 break-all",
													style: { color: C.subtle },
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { size: 11 }),
														"Evidence: ",
														r.evidence
													]
												})]
											}), r.evidence && /^https?:\/\//i.test(r.evidence) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => window.open(r.evidence, "_blank", "noopener"),
												className: "text-[11px] font-semibold px-2 py-1 rounded border inline-flex items-center gap-1 hover:bg-[#DEEBFF]",
												style: {
													borderColor: C.border,
													color: C.primary
												},
												title: "Open evidence link",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 11 }), "Open"]
											}) : r.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: "success",
												children: "Done"
											}) : null]
										}, i)), rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "px-4 py-3 text-xs",
											style: { color: C.subtle },
											children: "No criteria added."
										})]
									})]
								}, key);
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
								size: 14,
								style: { color: C.slate }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold",
								style: { color: C.navy },
								children: "Learning Resources"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								links.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between px-3 py-2 rounded border gap-2",
									style: { borderColor: C.border },
									children: [isEditable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: l.label,
										onChange: (e) => setLinks((arr) => arr.map((x, idx) => idx === i ? {
											...x,
											label: e.target.value
										} : x)),
										placeholder: "Label"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm truncate min-w-0 max-w-[360px]",
										style: { color: C.navy },
										title: l.label,
										children: l.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 ml-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => window.open(l.url, "_blank", "noopener"),
											className: "text-[11px] font-semibold px-2 py-1 rounded border inline-flex items-center gap-1 hover:bg-[#DEEBFF]",
											style: {
												borderColor: C.border,
												color: C.primary
											},
											title: "Open link",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 11 }), "Open"]
										}), isEditable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setLinks((arr) => arr.filter((_, idx) => idx !== i)),
											className: "p-1.5 rounded hover:bg-[#FFEBE6]",
											style: { color: C.red },
											title: "Remove",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 13 })
										})]
									})]
								}, i)),
								links.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs",
									style: { color: C.subtle },
									children: "No resources added yet."
								}),
								isEditable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 pt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: newLink,
										onChange: (e) => setNewLink(e.target.value),
										placeholder: "Add URL..."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
										onClick: () => {
											if (!newLink) return;
											setLinks((l) => [...l, {
												label: newLink.replace(/^https?:\/\//, ""),
												url: newLink
											}]);
											setNewLink("");
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), "Add"]
									})]
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, {
								size: 14,
								style: { color: C.slate }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold",
								style: { color: C.navy },
								children: "Evidence & Artifacts"
							})]
						}), isEditable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-2 border-dashed rounded p-6 text-center cursor-pointer hover:border-[#0052CC] transition-colors",
							style: { borderColor: C.border },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, {
									size: 28,
									className: "mx-auto",
									style: { color: C.primary }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold mt-2",
									style: { color: C.navy },
									children: "Drop files here or click to upload"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs mt-1",
									style: { color: C.subtle },
									children: "PDF, images, or code snippets"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs",
							style: { color: C.subtle },
							children: locked ? "Locked - artifacts are read-only." : "Enter edit mode to upload artifacts."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignStart, {
								size: 14,
								style: { color: C.slate }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold",
								style: { color: C.navy },
								children: "Learning Log & Notes"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea$2, {
							rows: 5,
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							placeholder: "What are your key takeaways so far? Summarize your findings here.",
							disabled: !isEditable,
							readOnly: !isEditable
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-4 border-t flex items-center justify-between",
					style: {
						borderColor: C.border,
						background: C.bg
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
							onClick: onClose,
							children: "Close"
						}), locked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
							onClick: () => onChangeStatus(objective, "In Progress"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 14 }), "Revert to In Progress"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [isEditable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
							onClick: () => {
								onSave(buildUpdated());
								setEditMode(false);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 14 }), "Save changes"]
						}), nextStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
							onClick: () => onChangeStatus(buildUpdated(), nextStatus),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { size: 16 }), nextLabel]
						})]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: confirmArchive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			title: "Archive this objective?",
			description: "Archived objectives are removed from the Kanban board but can be restored from the Archive view. They will not be permanently deleted.",
			confirmLabel: "Archive",
			destructive: true,
			onCancel: () => setConfirmArchive(false),
			onConfirm: () => {
				setConfirmArchive(false);
				onArchive(objective);
			}
		}) })]
	});
}
function EvidenceView({ rows, readOnly, managerReviewEnabled = false, onOpenRow, pinnedEvidenceIds, onTogglePin, onArchive, onPermanentDelete, onRestore }) {
	const { categories: frameworkCategories } = useFramework();
	const [q, setQ] = (0, import_react.useState)("");
	const [comp, setComp] = (0, import_react.useState)("All");
	const [status, setStatus] = (0, import_react.useState)("All");
	const [source, setSource] = (0, import_react.useState)("All");
	const [showArchived, setShowArchived] = (0, import_react.useState)(false);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(null);
	const [confirmBulkDeleteIds, setConfirmBulkDeleteIds] = (0, import_react.useState)(null);
	const [expandedRows, setExpandedRows] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [selectedRows, setSelectedRows] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const safeRows = (0, import_react.useMemo)(() => Array.isArray(rows) ? rows : [], [rows]);
	const visible = safeRows.filter((r) => showArchived ? r.isArchived : !r.isArchived);
	const filtered = visible.filter((r) => (q === "" || r.title.toLowerCase().includes(q.toLowerCase())) && (comp === "All" || r.competency === comp) && (status === "All" || r.status === status) && (source === "All" || r.source === source));
	const filteredIds = filtered.map((row) => row.id);
	const competencyOptions = (0, import_react.useMemo)(() => {
		if (frameworkCategories.length > 0) return frameworkCategories;
		return [...new Set(safeRows.map((row) => row.competency).filter((value) => value.trim().length > 0))].sort((a, b) => a.localeCompare(b));
	}, [frameworkCategories, safeRows]);
	const selectedVisibleIds = filteredIds.filter((id) => selectedRows.has(id));
	const hasVisibleRows = filteredIds.length > 0;
	const allVisibleExpanded = hasVisibleRows && filteredIds.every((id) => expandedRows.has(id));
	const allVisibleSelected = hasVisibleRows && filteredIds.every((id) => selectedRows.has(id));
	const bulkActionLabel = showArchived ? "Delete Selected" : "Archive Selected";
	const totalColumns = showArchived ? 13 : 11;
	function toggleRowExpanded(rowId) {
		setExpandedRows((previous) => {
			const next = new Set(previous);
			if (next.has(rowId)) next.delete(rowId);
			else next.add(rowId);
			return next;
		});
	}
	function expandAllVisibleRows() {
		setExpandedRows((previous) => {
			const next = new Set(previous);
			filteredIds.forEach((id) => next.add(id));
			return next;
		});
	}
	function collapseAllVisibleRows() {
		setExpandedRows((previous) => {
			const next = new Set(previous);
			filteredIds.forEach((id) => next.delete(id));
			return next;
		});
	}
	function toggleExpandVisibleRows() {
		if (allVisibleExpanded) {
			collapseAllVisibleRows();
			return;
		}
		expandAllVisibleRows();
	}
	function toggleRowSelected(rowId) {
		setSelectedRows((previous) => {
			const next = new Set(previous);
			if (next.has(rowId)) next.delete(rowId);
			else next.add(rowId);
			return next;
		});
	}
	function toggleSelectAllVisibleRows() {
		setSelectedRows((previous) => {
			const next = new Set(previous);
			if (allVisibleSelected) filteredIds.forEach((id) => next.delete(id));
			else filteredIds.forEach((id) => next.add(id));
			return next;
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-end mb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "inline-flex rounded border overflow-hidden",
				style: { borderColor: C.border },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setShowArchived(false),
					className: "px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5",
					style: {
						background: !showArchived ? C.primarySoft : "#fff",
						color: !showArchived ? C.primary : C.slate
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableProperties, { size: 12 }), " Active Log"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setShowArchived(true),
					className: "px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 border-l",
					style: {
						background: showArchived ? C.primarySoft : "#fff",
						color: showArchived ? C.primary : C.slate,
						borderColor: C.border
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { size: 12 }),
						" View Archived (",
						safeRows.filter((r) => r.isArchived).length,
						")"
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 border-b space-y-3",
				style: { borderColor: C.border },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 flex-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-72",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Filter by title or keyword…",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 14 })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 14 }),
								defaultValue: "all",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "all",
										children: "All dates"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Last 7 days" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Last 30 days" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "This quarter" })
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-48",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { size: 14 }),
								value: comp,
								onChange: (e) => setComp(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "All" }), competencyOptions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-44",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { size: 14 }),
								value: status,
								onChange: (e) => setStatus(e.target.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "All" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Pending Review" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Reviewed" })
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { size: 14 }),
								value: source,
								onChange: (e) => setSource(e.target.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "All" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Bitbucket" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Jira" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "GitHub" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "GitLab" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Slack" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Teams" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Confluence" })
								]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 flex-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs",
							style: { color: C.subtle },
							children: [
								filtered.length,
								" of ",
								visible.length,
								" items"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
							onClick: toggleExpandVisibleRows,
							disabled: !hasVisibleRows,
							children: [allVisibleExpanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { size: 14 }), allVisibleExpanded ? "Collapse All" : "Expand All"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
							onClick: () => setConfirmBulkDeleteIds([...selectedVisibleIds]),
							disabled: readOnly || selectedVisibleIds.length === 0,
							className: "hover:bg-[#FFEBE6]",
							style: { color: C.red },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { size: 14 }),
								bulkActionLabel,
								" (",
								selectedVisibleIds.length,
								")"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
							onClick: () => {
								const header = [
									"ID",
									"Date",
									"Source",
									"Category",
									"Competency",
									"Title",
									"Description",
									"Link",
									"Status",
									"Match",
									"Manager Notes",
									"Archived"
								];
								const escape = (v) => {
									const s = v == null ? "" : String(v);
									return /[",\n]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
								};
								const csv = [header.join(","), ...filtered.map((r) => [
									r.id,
									r.date,
									r.source,
									r.category,
									r.competency,
									r.title,
									r.description,
									r.link,
									r.status,
									r.matchState,
									r.managerNotes,
									r.isArchived ? "Yes" : "No"
								].map(escape).join(","))].join("\n");
								const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
								const url = URL.createObjectURL(blob);
								const a = document.createElement("a");
								a.href = url;
								a.download = `evidence-log-${toLocalDateString()}.csv`;
								document.body.appendChild(a);
								a.click();
								document.body.removeChild(a);
								URL.revokeObjectURL(url);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 14 }), "Export Data"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto pb-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: `w-full text-sm table-fixed ${showArchived ? "min-w-[1760px]" : "min-w-[1520px]"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("colgroup", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-10" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-10" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-32" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-36" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-40" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-48" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-[22%]" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-[30%]" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-44" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-36" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-36" }),
							showArchived && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-[100px]" }),
							showArchived && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-[120px]" })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							style: {
								background: "#F4F5F7",
								color: C.subtle
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-left text-[11px] uppercase tracking-wider",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, {
										className: "w-10",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: allVisibleSelected,
											onChange: toggleSelectAllVisibleRows,
											className: "h-3.5 w-3.5 rounded border-gray-300",
											"aria-label": allVisibleSelected ? "Deselect all visible rows" : "Select all visible rows"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, { className: "w-10" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, {
										className: "w-32",
										children: "Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, {
										className: "w-36",
										children: "Source"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, {
										className: "w-40",
										children: "Category"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, {
										className: "w-48",
										children: "Competency"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, {
										className: "w-full",
										children: "Title"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, {
										className: "w-full",
										children: "Description"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, {
										className: "w-44",
										children: "Link"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, {
										className: "w-36",
										children: "Match"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, {
										className: "w-36",
										children: "Status"
									}),
									showArchived && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, { children: "Archived" }),
									showArchived && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th$1, { children: "Actions" })
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [filtered.map((r) => {
							const isExpanded = expandedRows.has(r.id);
							const isSelected = selectedRows.has(r.id);
							const isPinned = pinnedEvidenceIds.has(r.id);
							const rawLink = (r.link ?? "").trim();
							const parsedLink = extractFirstLink(rawLink);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								onClick: () => !showArchived && (!readOnly || managerReviewEnabled) && onOpenRow(r),
								className: `group relative border-t hover:bg-[#FAFBFC] transition-colors ${showArchived || readOnly && !managerReviewEnabled ? "" : "cursor-pointer"}`,
								style: { borderColor: C.border },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "w-10",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: isSelected,
											onClick: (event) => event.stopPropagation(),
											onChange: () => toggleRowSelected(r.id),
											className: "h-3.5 w-3.5 rounded border-gray-300",
											"aria-label": `Select row ${r.title}`
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "w-10",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: (event) => {
												event.stopPropagation();
												toggleRowExpanded(r.id);
											},
											className: "inline-flex h-6 w-6 items-center justify-center rounded hover:bg-[#F4F5F7]",
											style: { color: C.slate },
											"aria-label": isExpanded ? "Collapse row details" : "Expand row details",
											children: isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 14 })
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "w-32 whitespace-nowrap",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceDateCell, { date: r.date })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "w-36",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-flex max-w-full truncate align-middle",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceChip, { source: r.source })
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "w-40",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-flex max-w-full truncate align-middle",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: "neutral",
												children: r.category
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "w-48",
										style: { color: C.slate },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate",
											children: r.competency
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td$1, {
										className: "max-w-md font-semibold relative",
										style: { color: C.navy },
										children: [!showArchived && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: (event) => {
												event.stopPropagation();
												onTogglePin(r);
											},
											className: `absolute top-3 right-3 p-1 rounded-md border shadow-sm transition-all duration-150 cursor-pointer ${isPinned ? "opacity-100 text-indigo-600 bg-indigo-50 border-indigo-200" : "opacity-0 group-hover:opacity-100 bg-white border-slate-200 text-slate-400 hover:text-indigo-600"}`,
											title: isPinned ? "Unpin evidence from workspace" : "Pin evidence to workspace",
											"aria-label": isPinned ? `Unpin ${r.title}` : `Pin ${r.title}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { size: 14 })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `block truncate ${showArchived ? "" : "pr-9"}`,
											children: r.title
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "max-w-md",
										style: { color: C.slate },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate",
											children: r.description
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "w-44",
										style: { color: C.slate },
										children: rawLink ? parsedLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											onClick: (event) => event.stopPropagation(),
											className: "inline-flex max-w-full items-center gap-1 truncate hover:underline",
											style: { color: C.primary },
											href: parsedLink,
											target: "_blank",
											rel: "noreferrer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate",
												children: "Open"
											})]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate",
											children: rawLink
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: { color: C.subtle },
											children: "-"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "w-36",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchBadge, { match: r.matchState })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "w-36",
										children: r.status === "Reviewed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: "success",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { size: 11 }),
											children: "Reviewed"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: "warning",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 11 }),
											children: "Pending Review"
										})
									}),
									showArchived && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "w-28 whitespace-nowrap",
										style: { color: C.slate },
										children: r.archivedDate ? formatDisplayDate(r.archivedDate) : "-"
									}),
									showArchived && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td$1, {
										className: "w-36",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											onClick: (event) => event.stopPropagation(),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => onRestore(r.id),
												className: "px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 hover:bg-[#F4F5F7]",
												style: { color: C.primary },
												title: "Restore",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveRestore, { size: 12 }), " Restore"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setConfirmDelete(r),
												className: "px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 hover:bg-[#FFEBE6]",
												style: { color: C.red },
												title: "Permanently Delete",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 12 }), " Delete"]
											})]
										})
									})
								]
							}), isExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
								className: "border-t",
								style: { borderColor: C.border },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: totalColumns,
									className: "px-4 py-4 bg-gray-50 dark:bg-gray-900/40",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "w-full max-w-6xl space-y-3 pr-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] font-bold uppercase tracking-wider text-[#6B778C]",
												children: "Title"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm whitespace-pre-wrap wrap-break-word",
												style: { color: C.navy },
												children: r.title || "-"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] font-bold uppercase tracking-wider text-[#6B778C]",
												children: "Link"
											}), rawLink ? parsedLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: parsedLink,
												target: "_blank",
												rel: "noreferrer",
												className: "mt-1 inline-flex items-center gap-1 text-sm break-all hover:underline",
												style: { color: C.primary },
												children: [rawLink, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 })]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm whitespace-pre-wrap wrap-break-word",
												style: { color: C.slate },
												children: rawLink
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm",
												style: { color: C.subtle },
												children: "-"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] font-bold uppercase tracking-wider text-[#6B778C]",
												children: "Description"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm whitespace-pre-wrap wrap-break-word",
												style: { color: C.slate },
												children: r.description || "-"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] font-bold uppercase tracking-wider text-[#6B778C]",
												children: "Manager Notes"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm whitespace-pre-wrap wrap-break-word",
												style: { color: C.slate },
												children: r.managerNotes || "-"
											})] })
										]
									})
								})
							})] }, r.id);
						}), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: totalColumns,
							className: "text-center py-12 text-sm",
							style: { color: C.subtle },
							children: showArchived ? "No archived evidence." : "No evidence matches your filters."
						}) })] })
					]
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatePresence, { children: [confirmDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			destructive: true,
			title: "Permanently delete evidence?",
			description: `"${confirmDelete.title}" will be permanently removed. This action cannot be undone.`,
			confirmLabel: "Delete permanently",
			onCancel: () => setConfirmDelete(null),
			onConfirm: () => {
				onPermanentDelete(confirmDelete.id);
				setConfirmDelete(null);
			}
		}), confirmBulkDeleteIds && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			destructive: true,
			title: `${showArchived ? "Delete" : "Archive"} ${confirmBulkDeleteIds.length} rows?`,
			description: showArchived ? "Selected archived rows will be permanently deleted. This action cannot be undone." : "Selected rows will be moved to archive.",
			confirmLabel: showArchived ? "Delete selected" : "Archive selected",
			cancelLabel: "Cancel",
			onCancel: () => setConfirmBulkDeleteIds(null),
			onConfirm: () => {
				if (showArchived) confirmBulkDeleteIds.forEach((id) => onPermanentDelete(id));
				else confirmBulkDeleteIds.forEach((id) => onArchive(id));
				setExpandedRows((previous) => {
					const next = new Set(previous);
					confirmBulkDeleteIds.forEach((id) => next.delete(id));
					return next;
				});
				setSelectedRows((previous) => {
					const next = new Set(previous);
					confirmBulkDeleteIds.forEach((id) => next.delete(id));
					return next;
				});
				setConfirmBulkDeleteIds(null);
			}
		})] })
	] });
}
function MatchBadge({ match }) {
	if (match === "Yes") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "success",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 11 }),
		children: "Match: Yes"
	});
	if (match === "No") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "danger",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 11 }),
		children: "Match: No"
	});
	if (match === "Somewhat") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "warning",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 11 }),
		children: "Somewhat"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "neutral",
		children: "Not Set"
	});
}
function EvidenceDateCell({ date }) {
	const parts = formatEvidenceDateParts(date);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-baseline gap-1 whitespace-nowrap",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[12px] font-semibold",
			style: { color: C.navy },
			children: parts.dayMonth
		}), parts.year && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px]",
			style: { color: C.subtle },
			children: parts.year
		})]
	});
}
function Th$1({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: `px-4 py-3 font-semibold ${className}`,
		children
	});
}
function Td$1({ children, className = "", style }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: `px-4 py-3 align-middle ${className}`,
		style,
		children
	});
}
function EvidenceSlideover({ item, frameworkMatrix, managerReviewOnly = false, onClose, onPin, onSave, onArchive }) {
	const [draft, setDraft] = (0, import_react.useState)(item);
	const categoryEntries = (0, import_react.useMemo)(() => resolveFrameworkCategoryEntries(frameworkMatrix), [frameworkMatrix]);
	const categoryMap = (0, import_react.useMemo)(() => Object.fromEntries(categoryEntries), [categoryEntries]);
	const categories = categoryEntries.map(([categoryName]) => categoryName);
	const [confirmArchive, setConfirmArchive] = (0, import_react.useState)(false);
	const objectiveLinked = item.source === "Objective" || Boolean(item.linkageKey);
	const dirty = !objectiveLinked && JSON.stringify(draft) !== JSON.stringify(item);
	const update = (k, v) => setDraft((d) => objectiveLinked ? d : {
		...d,
		[k]: v
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: .15 },
		className: "fixed inset-0 z-50",
		style: { background: "rgba(9, 30, 66, 0.45)" },
		onClick: onClose,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: { x: "100%" },
			animate: { x: 0 },
			exit: { x: "100%" },
			transition: {
				duration: .22,
				ease: [
					.22,
					1,
					.36,
					1
				]
			},
			className: "absolute top-0 right-0 h-full w-full md:w-[44%] bg-white shadow-2xl flex flex-col overflow-x-hidden",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-5 border-b",
					style: { borderColor: C.border },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 text-xs",
								style: { color: C.subtle },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Evidence Log" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 12 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold truncate max-w-[220px] md:max-w-[320px]",
										style: { color: C.slate },
										title: item.title,
										children: item.title
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => onPin(item),
										className: "p-1.5 rounded hover:bg-[#F4F5F7]",
										style: { color: C.slate },
										title: "Pin evidence to workspace",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { size: 16 })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setConfirmArchive(true),
										className: "p-1.5 rounded hover:bg-[#FFEBE6]",
										style: { color: C.slate },
										title: "Archive evidence",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { size: 16 })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: onClose,
										className: "p-1.5 rounded hover:bg-[#F4F5F7] ml-1",
										style: { color: C.slate },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
									})
								]
							})]
						}),
						objectiveLinked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xl font-bold mt-2 leading-snug",
							style: { color: C.navy },
							children: draft.title
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: draft.title,
							onChange: (e) => update("title", e.target.value),
							className: "text-xl font-bold mt-2 leading-snug w-full bg-transparent outline-none border border-transparent hover:border-[#DFE1E6] focus:border-[#0052CC] focus:bg-white rounded px-1 -mx-1 py-0.5",
							style: { color: C.navy }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 mt-3 text-xs",
							style: { color: C.subtle },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 12 }), formatDisplayDate(item.date)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceChip, { source: draft.source }),
								draft.status === "Reviewed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "success",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { size: 11 }),
									children: "Reviewed"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "warning",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 11 }),
									children: "Pending Review"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchBadge, { match: draft.matchState })
							]
						}),
						objectiveLinked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] mt-2",
							style: { color: C.subtle },
							children: "Logged from Objectives. Edit this objective in the Objectives board."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-bold uppercase tracking-wider mb-3",
							style: { color: C.subtle },
							children: "Competency Mapping"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-bold uppercase tracking-wider mb-1",
								style: { color: C.subtle },
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dropdown, {
								value: categories.includes(draft.category) ? draft.category : "",
								options: categories,
								placeholder: "Select a competency category…",
								onChange: (nextCat) => {
									update("category", nextCat);
									update("competency", categoryMap[nextCat]?.items[0] ?? "");
								},
								disabled: objectiveLinked || managerReviewOnly
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-bold uppercase tracking-wider mb-1",
								style: { color: C.subtle },
								children: "Subcategory / Question"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dropdown, {
								value: (categoryMap[draft.category]?.items ?? []).includes(draft.competency) ? draft.competency : "",
								options: categoryMap[draft.category]?.items ?? [],
								placeholder: categories.includes(draft.category) ? "Select a subcategory / question…" : "Pick a category first",
								onChange: (val) => update("competency", val),
								disabled: objectiveLinked || managerReviewOnly || !categories.includes(draft.category)
							})] })]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignStart, {
								size: 14,
								style: { color: C.slate }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold",
								style: { color: C.navy },
								children: "Description & Reflection"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: draft.description,
							onChange: (e) => update("description", e.target.value),
							className: "w-full min-h-[160px] resize-y rounded border p-3 text-sm leading-relaxed outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
							style: {
								borderColor: C.border,
								color: C.slate,
								overflowWrap: "anywhere"
							},
							readOnly: objectiveLinked || managerReviewOnly
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
								size: 14,
								style: { color: C.slate }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-bold",
								style: { color: C.navy },
								children: "Links & Artifacts"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-3 mb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-bold uppercase tracking-wider mb-1",
								style: { color: C.subtle },
								children: "Source"
							}), objectiveLinked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.source,
								readOnly: true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: draft.source,
								onChange: (e) => update("source", e.target.value),
								disabled: managerReviewOnly,
								children: [
									"Bitbucket",
									"GitHub",
									"GitLab",
									"Jira",
									"Slack",
									"Teams",
									"Confluence",
									"Figma",
									"Trello",
									"Excel",
									"PowerPoint",
									"Word"
								].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-bold uppercase tracking-wider mb-1",
								style: { color: C.subtle },
								children: "Link"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: draft.link,
									onChange: (e) => update("link", e.target.value),
									placeholder: "example.com/path or full URL",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, { size: 14 }),
									readOnly: objectiveLinked || managerReviewOnly
								}), draft.link && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
									onClick: () => {
										const u = /^https?:\/\//i.test(draft.link) ? draft.link : `https://${draft.link}`;
										window.open(u, "_blank", "noopener");
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 }), " Open"]
								})]
							})] })]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "bg-slate-50 rounded-lg p-4 border border-slate-200",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 mb-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, {
										size: 14,
										style: { color: C.slate }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-bold",
										style: { color: C.navy },
										children: "Manager Review"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-wider mb-1",
										style: { color: C.subtle },
										children: "Review Status"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: draft.status,
										onChange: (e) => update("status", e.target.value),
										disabled: objectiveLinked,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Pending Review" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Reviewed" })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-wider mb-1",
										style: { color: C.subtle },
										children: "Competency Match"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-4 gap-2",
										children: [
											"Yes",
											"Somewhat",
											"No",
											"Unset"
										].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => update("matchState", m),
											disabled: objectiveLinked,
											className: "px-2 py-1.5 rounded border text-xs font-semibold transition-colors",
											style: {
												borderColor: draft.matchState === m ? C.primary : C.border,
												background: draft.matchState === m ? C.primarySoft : "#fff",
												color: draft.matchState === m ? C.primary : C.slate
											},
											children: m === "Unset" ? "Not Set" : m
										}, m))
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-bold uppercase tracking-wider mb-1",
										style: { color: C.subtle },
										children: "Manager Assessment"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										value: draft.managerNotes,
										onChange: (e) => update("managerNotes", e.target.value),
										placeholder: "Manager corroborates context, asks for more detail, suggests rewording, or links related artifacts.",
										className: "w-full min-h-[150px] resize-y rounded border bg-white p-3 text-sm leading-relaxed outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
										style: {
											borderColor: C.border,
											color: C.slate,
											overflowWrap: "anywhere"
										},
										readOnly: objectiveLinked
									})]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-4 border-t flex items-center justify-end gap-2",
					style: {
						borderColor: C.border,
						background: C.bg
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						onClick: onClose,
						children: "Close"
					}), !objectiveLinked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
						onClick: () => {
							onSave(draft);
						},
						disabled: !dirty,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 14 }), "Save Changes"]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: confirmArchive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			title: "Archive this evidence?",
			description: "Archiving removes the item from the active log. You can restore or permanently delete it from the View Archived tab.",
			confirmLabel: "Archive",
			onCancel: () => setConfirmArchive(false),
			onConfirm: () => {
				setConfirmArchive(false);
				onArchive(item.id);
			}
		}) })]
	});
}
function InboxReviewSlideover({ item, frameworkMatrix, onClose, onConfirm, onDismiss }) {
	const safeItem = item ?? {
		id: "",
		source: "Unknown source",
		icon: null,
		title: "",
		suggestion: [],
		when: "",
		isSample: false
	};
	const hasItemData = Boolean(safeItem.id);
	const categoryEntries = (0, import_react.useMemo)(() => resolveFrameworkCategoryEntries(frameworkMatrix), [frameworkMatrix]);
	const categoryMap = (0, import_react.useMemo)(() => Object.fromEntries(categoryEntries), [categoryEntries]);
	const inboxCats = categoryEntries.map(([categoryName]) => categoryName);
	const suggestionText = Array.isArray(safeItem.suggestion) ? safeItem.suggestion.join(" ").toLowerCase() : typeof safeItem.suggestion === "string" ? safeItem.suggestion.toLowerCase() : "";
	const initialCat = inboxCats.find((c) => suggestionText.includes(c.toLowerCase())) ?? inboxCats[0] ?? "";
	const [title, setTitle] = (0, import_react.useState)(safeItem.title || "Untitled action");
	const [description, setDescription] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)(initialCat);
	const [subcategory, setSubcategory] = (0, import_react.useState)(categoryMap[initialCat]?.items[0] ?? "");
	const sourceLabel = safeItem.source || "Unknown source";
	const whenLabel = safeItem.when || "recently";
	const itemTitle = safeItem.title || "Untitled action";
	function onCatChange(v) {
		setCategory(v);
		setSubcategory(categoryMap[v]?.items[0] ?? "");
	}
	(0, import_react.useEffect)(() => {
		if (!inboxCats.includes(category)) {
			setCategory(initialCat);
			setSubcategory(categoryMap[initialCat]?.items[0] ?? "");
			return;
		}
		const options = categoryMap[category]?.items ?? [];
		if (!options.includes(subcategory)) setSubcategory(options[0] ?? "");
	}, [
		inboxCats,
		category,
		subcategory,
		initialCat,
		categoryMap
	]);
	(0, import_react.useEffect)(() => {
		setTitle(safeItem.title || "Untitled action");
	}, [safeItem.id, safeItem.title]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: .15 },
		className: "fixed inset-0 z-50",
		style: { background: "rgba(9, 30, 66, 0.45)" },
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: { x: "100%" },
			animate: { x: 0 },
			exit: { x: "100%" },
			transition: {
				duration: .22,
				ease: [
					.22,
					1,
					.36,
					1
				]
			},
			className: "absolute top-0 right-0 h-full w-full md:w-[44%] bg-white shadow-2xl flex flex-col",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-5 border-b",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs",
							style: { color: C.subtle },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								size: 12,
								style: { color: C.primary }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold uppercase tracking-wider",
								style: { color: C.slate },
								children: "Review Auto-Captured Event"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onClose,
							className: "p-1.5 rounded hover:bg-[#F4F5F7]",
							style: { color: C.slate },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[13px] mt-2",
						style: { color: C.subtle },
						children: [
							"The AI captured this event ",
							whenLabel,
							". Confirm details before saving to your evidence log."
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto px-6 py-5 space-y-5",
					children: [
						!hasItemData && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded border px-3 py-2 text-sm",
							style: {
								borderColor: C.border,
								color: C.subtle
							},
							children: "Loading action details..."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-bold uppercase tracking-wider mb-1.5 block",
							style: { color: C.subtle },
							children: "Evidence Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: title,
							onChange: (e) => setTitle(e.target.value),
							className: "w-full px-3 h-10 rounded border text-sm bg-[#FAFBFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition",
							style: {
								borderColor: C.border,
								color: C.navy
							}
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-bold uppercase tracking-wider mb-1.5 block",
							style: { color: C.subtle },
							children: "Source Link"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 px-3 py-2 rounded border",
							style: {
								borderColor: C.border,
								background: "#FAFBFC"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-7 h-7 rounded flex items-center justify-center shrink-0",
									style: {
										background: "#FFFFFF",
										color: C.slate,
										border: `1px solid ${C.border}`
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceIcon, {
										source: sourceLabel,
										size: 14
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-semibold",
										style: { color: C.navy },
										children: sourceLabel
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] truncate",
										style: { color: C.subtle },
										children: itemTitle
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded hover:bg-white",
								style: { color: C.primary },
								children: ["Open", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 })]
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-bold uppercase tracking-wider mb-1.5 block",
							style: { color: C.subtle },
							children: "Description & Context"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: description,
							onChange: (e) => setDescription(e.target.value),
							rows: 6,
							placeholder: "The AI captured this event, but please add context. What did you learn? What was the technical challenge?",
							className: "w-full min-h-[150px] resize-y rounded border bg-[#FAFBFC] p-3 text-sm leading-relaxed outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
							style: {
								borderColor: C.border,
								color: C.navy
							}
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
									size: 13,
									style: { color: C.primary }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs font-bold uppercase tracking-wider",
									style: { color: C.subtle },
									children: "AI Competency Mapping"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2 mb-3 p-2.5 rounded bg-blue-50 text-blue-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
									size: 14,
									className: "mt-0.5 shrink-0"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[12px] leading-snug",
									children: [
										"AI Suggestion:",
										" ",
										safeItem.suggestion?.length ? safeItem.suggestion.join(", ") : "No suggestions provided",
										"."
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-bold uppercase tracking-wider mb-1",
									style: { color: C.subtle },
									children: "Category"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									value: category,
									onChange: (e) => onCatChange(e.target.value),
									children: inboxCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-bold uppercase tracking-wider mb-1",
									style: { color: C.subtle },
									children: "Subcategory / Question"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									value: subcategory,
									onChange: (e) => setSubcategory(e.target.value),
									children: (categoryMap[category]?.items ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
								})] })]
							})
						] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-4 border-t flex items-center justify-between",
					style: {
						borderColor: C.border,
						background: "#FAFBFC"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onDismiss,
						disabled: !hasItemData,
						className: "px-3 h-9 rounded text-sm font-medium hover:bg-[#FFEBE6] transition-colors",
						style: { color: C.red },
						children: safeItem.isSample ? "Close Sample" : "Dismiss Event"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
						disabled: !hasItemData,
						onClick: () => onConfirm({
							title,
							description,
							category,
							subcategory
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { size: 14 }), "Confirm & Save"]
					})]
				})
			]
		})
	});
}
function ReviewWizard({ evidence, onClose, onFinalize, onOpenEvidence, latestAssessment, initialDraft, engineerName, managerName, onSaveDraft }) {
	const { categories: frameworkCategories, getQuestionsForCategory } = useFramework();
	const categoryMap = (0, import_react.useMemo)(() => {
		if (frameworkCategories.length > 0) return buildFrameworkCategoryMapFromContext(frameworkCategories, getQuestionsForCategory);
		if (latestAssessment) return latestAssessment.categories.reduce((acc, category) => {
			acc[category.categoryName] = {
				summary: category.summary ?? "",
				items: category.questions.map((question) => question.questionText)
			};
			return acc;
		}, {});
		return {};
	}, [
		frameworkCategories,
		getQuestionsForCategory,
		latestAssessment
	]);
	const categoryEntries = (0, import_react.useMemo)(() => Object.entries(categoryMap), [categoryMap]);
	const categories = (0, import_react.useMemo)(() => categoryEntries.map(([categoryName]) => categoryName), [categoryEntries]);
	const [activeIdx, setActiveIdx] = (0, import_react.useState)(initialDraft?.activeIdx ?? 0);
	const getRolloverScores = (categoryName, questionText) => {
		const historical = getHistoricalQuestionScores(latestAssessment, categoryName, questionText);
		const previous = historical.current;
		return {
			prev: previous,
			next: previous,
			notes: historical.note
		};
	};
	const [scores, setScores] = (0, import_react.useState)(() => {
		if (initialDraft?.scores) return initialDraft.scores;
		const init = {};
		categories.forEach((cat) => {
			init[cat] = {};
			(categoryMap[cat]?.items ?? []).forEach((sub) => {
				const rollover = getRolloverScores(cat, sub);
				init[cat][sub] = {
					prev: rollover.prev,
					next: rollover.next,
					notes: rollover.notes,
					evidenceIds: []
				};
			});
		});
		return init;
	});
	const [attachOpenFor, setAttachOpenFor] = (0, import_react.useState)(null);
	const [showUnsavedExitDialog, setShowUnsavedExitDialog] = (0, import_react.useState)(false);
	const initialScoresSnapshotRef = (0, import_react.useRef)(null);
	const activeCat = categories[activeIdx];
	const isLast = activeIdx === categories.length - 1;
	const isDirty = initialScoresSnapshotRef.current != null && JSON.stringify(scores) !== initialScoresSnapshotRef.current;
	(0, import_react.useEffect)(() => {
		if (initialScoresSnapshotRef.current == null) initialScoresSnapshotRef.current = JSON.stringify(scores);
	}, [scores]);
	(0, import_react.useEffect)(() => {
		if (categories.length === 0) return;
		setActiveIdx((prev) => prev >= categories.length ? categories.length - 1 : prev);
		setScores((previous) => {
			const next = {};
			categories.forEach((category) => {
				next[category] = {};
				(categoryMap[category]?.items ?? []).forEach((item) => {
					const existing = previous[category]?.[item];
					if (existing) {
						next[category][item] = existing;
						return;
					}
					const rollover = getRolloverScores(category, item);
					next[category][item] = {
						prev: rollover.prev,
						next: rollover.next,
						notes: rollover.notes,
						evidenceIds: []
					};
				});
			});
			return next;
		});
	}, [
		categories,
		categoryMap,
		latestAssessment
	]);
	function updateQ(cat, sub, patch) {
		setScores((s) => ({
			...s,
			[cat]: {
				...s[cat],
				[sub]: {
					...s[cat][sub],
					...patch
				}
			}
		}));
	}
	function toggleEvidence(cat, sub, id) {
		setScores((s) => {
			const existing = s[cat][sub].evidenceIds;
			const next = existing.includes(id) ? existing.filter((x) => x !== id) : [...existing, id];
			return {
				...s,
				[cat]: {
					...s[cat],
					[sub]: {
						...s[cat][sub],
						evidenceIds: next
					}
				}
			};
		});
	}
	function categoryProgress(cat) {
		const subs = scores[cat] ?? {};
		const total = Object.keys(subs).length;
		if (total === 0) return 0;
		const touched = Object.values(subs).filter((q) => q.next !== q.prev || q.notes.trim().length > 0).length;
		return Math.round(touched / total * 100);
	}
	function finalize() {
		const today = /* @__PURE__ */ new Date();
		onFinalize({
			id: generateSafeId(),
			date: formatDisplayDate(today),
			period: `${today.toLocaleString("en-US", { month: "long" })} ${today.getFullYear()}`,
			engineer: engineerName,
			manager: managerName,
			scores
		});
	}
	function saveDraft() {
		onSaveDraft({
			activeIdx,
			scores,
			savedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
		onClose();
	}
	function requestClose() {
		if (isDirty) {
			setShowUnsavedExitDialog(true);
			return;
		}
		onClose();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		className: "fixed inset-0 z-50 flex",
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		style: { background: "rgba(9, 30, 66, 0.54)" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			className: "w-full h-full flex flex-col",
			initial: {
				scale: .98,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			exit: {
				scale: .98,
				opacity: 0
			},
			transition: { duration: .18 },
			style: { background: C.bg },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-14 px-6 flex items-center justify-between border-b bg-white",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-8 h-8 rounded flex items-center justify-center",
							style: {
								background: C.primarySoft,
								color: C.primary
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { size: 16 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-bold tracking-tight",
							style: { color: C.navy },
							children: "Performance Review Session"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px]",
							style: { color: C.subtle },
							children: "Score each subcategory on the 1–5 effectiveness scale and add justification notes."
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: requestClose,
						className: "w-8 h-8 rounded flex items-center justify-center hover:bg-[#F4F5F7]",
						style: { color: C.subtle },
						"aria-label": "Close wizard",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-h-0 flex max-w-6xl w-full mx-auto p-6 gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "w-64 shrink-0 bg-white border rounded shadow-sm flex flex-col",
						style: { borderColor: C.border },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-4 py-3 border-b text-[11px] uppercase tracking-wider font-bold",
							style: {
								borderColor: C.border,
								color: C.subtle
							},
							children: "Categories"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 overflow-y-auto p-2 space-y-1",
							children: categories.map((cat, i) => {
								const active = i === activeIdx;
								const pct = categoryProgress(cat);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setActiveIdx(i),
									className: "w-full text-left px-3 py-2.5 rounded transition-colors",
									style: {
										background: active ? C.primarySoft : "transparent",
										color: active ? C.primary : C.slate
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] font-bold uppercase tracking-wider opacity-70",
												children: ["Step ", i + 1]
											}), pct === 100 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, {
												size: 13,
												style: { color: C.green }
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-semibold mt-0.5 leading-snug",
											children: cat
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1.5 h-1 rounded-full overflow-hidden",
											style: { background: "#EBECF0" },
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-full rounded-full",
												style: {
													width: `${pct}%`,
													background: active ? C.primary : C.green
												}
											})
										})
									]
								}, cat);
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 flex flex-col min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 overflow-y-auto pr-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] font-bold uppercase tracking-wider",
										style: { color: C.subtle },
										children: [
											"Category ",
											activeIdx + 1,
											" of ",
											categories.length
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-2xl font-bold tracking-tight mt-1",
										style: { color: C.navy },
										children: activeCat
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm mt-1 leading-relaxed",
										style: { color: C.slate },
										children: categoryMap[activeCat]?.summary || "No summary provided."
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-4",
								children: (categoryMap[activeCat]?.items ?? []).map((sub) => {
									const q = scores[activeCat]?.[sub];
									if (!q) return null;
									const attachOpen = attachOpenFor === `${activeCat}::${sub}`;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
										className: "p-5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-xs font-bold uppercase tracking-wider",
														style: { color: C.subtle },
														children: "Question"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[15px] font-semibold mt-1",
														style: { color: C.navy },
														children: sub
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													tone: "neutral",
													children: ["Previous Score: ", q.prev]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-4 grid grid-cols-2 gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "New score (1-5)",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
														value: String(q.next),
														onChange: (e) => updateQ(activeCat, sub, { next: Number(e.target.value) }),
														children: EFFECTIVENESS_SCALE.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
															value: s.value,
															children: [
																s.value,
																" - ",
																s.label
															]
														}, s.value))
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Change vs previous",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-9 px-3 flex items-center text-sm rounded border",
														style: {
															background: "#F4F5F7",
															borderColor: C.border,
															color: q.next > q.prev ? C.green : q.next < q.prev ? C.red : C.subtle,
															fontWeight: 600
														},
														children: q.next === q.prev ? "No change" : `${q.prev} → ${q.next} (${q.next > q.prev ? "+" : ""}${q.next - q.prev})`
													})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Manager & Engineer notes / justification",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea$2, {
														rows: 3,
														placeholder: "Document examples, behaviors, and rationale for this score...",
														value: q.notes,
														onChange: (e) => updateQ(activeCat, sub, { notes: e.target.value })
													})
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-3 flex items-center justify-between gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													onClick: () => setAttachOpenFor(attachOpen ? null : `${activeCat}::${sub}`),
													className: "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded border hover:border-[#0052CC] transition-colors",
													style: {
														borderColor: C.border,
														color: C.primary
													},
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { size: 13 }),
														"Attach Evidence",
														q.evidenceIds.length > 0 ? ` (${q.evidenceIds.length})` : ""
													]
												}), q.evidenceIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex items-center gap-1.5 flex-wrap justify-end",
													children: q.evidenceIds.map((id) => {
														const ev = evidence.find((e) => e.id === id);
														if (!ev) return null;
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
															type: "button",
															onClick: () => onOpenEvidence(ev),
															title: `${ev.id} - ${ev.title}`,
															className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 10 }), ev.id]
														}, id);
													})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: attachOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
												initial: {
													opacity: 0,
													height: 0
												},
												animate: {
													opacity: 1,
													height: "auto"
												},
												exit: {
													opacity: 0,
													height: 0
												},
												className: "mt-3 border-t pt-3 space-y-1.5 max-h-56 overflow-y-auto",
												style: { borderColor: C.border },
												children: (() => {
													const subLower = sub.toLowerCase();
													const filtered = evidence.filter((ev) => ev.category === activeCat || ev.competency === activeCat || subLower.includes(ev.competency.toLowerCase()) || ev.competency.toLowerCase().includes(subLower));
													if (filtered.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "px-2 py-3 text-[12px] text-center",
														style: { color: C.subtle },
														children: "No evidence mapped to this question yet."
													});
													return filtered.map((ev) => {
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
															className: "flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[#F4F5F7]",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																type: "checkbox",
																checked: q.evidenceIds.includes(ev.id),
																onChange: () => toggleEvidence(activeCat, sub, ev.id),
																className: "mt-1"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex-1 min-w-0",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																	className: "text-[13px] font-semibold truncate",
																	style: { color: C.navy },
																	children: ev.title
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "text-[11px]",
																	style: { color: C.subtle },
																	children: [
																		ev.id,
																		" · ",
																		ev.source,
																		" · ",
																		formatDisplayDate(ev.date)
																	]
																})]
															})]
														}, ev.id);
													});
												})()
											}) })
										]
									}, sub);
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 -mx-6 px-6 py-3 border-t bg-white flex items-center justify-between",
							style: { borderColor: C.border },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
									onClick: requestClose,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 14 }), "Cancel"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
									onClick: saveDraft,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 14 }), "Save Draft"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
										onClick: () => setActiveIdx((i) => Math.max(0, i - 1)),
										disabled: activeIdx === 0,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
											size: 14,
											style: { transform: "rotate(180deg)" }
										}), "Previous"]
									}),
									!isLast && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
										onClick: () => setActiveIdx((i) => Math.min(categories.length - 1, i + 1)),
										children: ["Next Category", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 14 })]
									}),
									isLast && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
										onClick: finalize,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { size: 14 }), "Complete & Finalize Assessment"]
									})
								]
							})]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showUnsavedExitDialog && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backdrop$2, {
					onClose: () => setShowUnsavedExitDialog(false),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							scale: .96
						},
						animate: {
							opacity: 1,
							scale: 1
						},
						exit: {
							opacity: 0,
							scale: .96
						},
						transition: { duration: .15 },
						className: "bg-white rounded-lg shadow-2xl w-full max-w-md border",
						style: { borderColor: C.border },
						onClick: (event) => event.stopPropagation(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-amber-100",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
										size: 18,
										className: "text-amber-600"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-base font-bold",
										style: { color: C.navy },
										children: "Unsaved changes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm mt-1.5 leading-relaxed",
										style: { color: C.slate },
										children: "You have unsaved changes. Closing this without saving your draft will result in lost data. Are you sure you want to exit?"
									})]
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-3 border-t flex items-center justify-end gap-2",
							style: {
								borderColor: C.border,
								background: C.bg
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
									onClick: () => setShowUnsavedExitDialog(false),
									children: "Cancel"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
									onClick: () => {
										setShowUnsavedExitDialog(false);
										saveDraft();
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 14 }), "Save Draft"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										setShowUnsavedExitDialog(false);
										onClose();
									},
									className: "px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors",
									style: { background: C.red },
									children: "Exit Anyway"
								})
							]
						})]
					})
				}) })
			]
		})
	});
}
var DASHBOARD_SAMPLE_MIN_ITEMS = 3;
var formatDateOnly = (date) => {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "";
	return toLocalDateString(d);
};
/**
* Returns the first day of the quarter that contains `date`, as a YYYY-MM-DD string.
* Q1: Jan–Mar (months 0–2)
* Q2: Apr–Jun (months 3–5)
* Q3: Jul–Sep (months 6–8)
* Q4: Oct–Dec (months 9–11)
*/
function startOfQuarter(date) {
	const month = date.getMonth();
	const quarterStartMonth = Math.floor(month / 3) * 3;
	return `${date.getFullYear()}-${String(quarterStartMonth + 1).padStart(2, "0")}-01`;
}
/**
* Returns the last day of the quarter that contains `date`, as a YYYY-MM-DD string.
*/
function endOfQuarter(date) {
	const month = date.getMonth();
	const quarterEndMonth = Math.floor(month / 3) * 3 + 2;
	const y = date.getFullYear();
	const lastDay = new Date(y, quarterEndMonth + 1, 0);
	return `${y}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
}
/**
* Counts consecutive calendar weeks (current week backwards) with at least one
* non-archived evidence entry.
*/
function computeWeeklyStreak(evidence) {
	const activeDays = /* @__PURE__ */ new Set();
	for (const e of evidence) if (!e.isArchived) {
		const normalizedDate = formatDateOnly(e.date);
		if (normalizedDate) activeDays.add(normalizedDate);
	}
	let streak = 0;
	const cursor = /* @__PURE__ */ new Date();
	while (true) {
		const weekStart = new Date(cursor);
		const day = weekStart.getDay();
		const diffToMonday = day === 0 ? 6 : day - 1;
		weekStart.setDate(weekStart.getDate() - diffToMonday);
		const weekDates = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date(weekStart);
			d.setDate(weekStart.getDate() + i);
			const normalizedDate = formatDateOnly(d);
			if (normalizedDate) weekDates.push(normalizedDate);
		}
		if (!weekDates.some((dateStr) => activeDays.has(dateStr))) break;
		streak++;
		cursor.setDate(cursor.getDate() - 7);
	}
	return streak;
}
/**
* Aggregates dashboard statistics from cached evidence and objectives queries.
* Makes no additional DB calls — reads from the TanStack Query cache.
*
* @param userId - The authenticated user's ID.
* @returns DashboardStats memoised on evidence and objectives data changes.
*/
function useDashboardStats(userId, options = {}) {
	const evidenceQuery = useEvidenceQuery(userId);
	const objectivesQuery = useObjectivesQuery(userId);
	const showSamples = options.showSamples ?? true;
	const toSortableDate = (item) => item.createdAt ?? item.date ?? "";
	return (0, import_react.useMemo)(() => {
		const liveEvidence = evidenceQuery.data ?? [];
		const liveObjectives = objectivesQuery.data ?? [];
		const evidence = showSamples ? liveEvidence : liveEvidence.filter((item) => !item.isSample);
		const objectives = showSamples ? liveObjectives : liveObjectives.filter((item) => !item.isSample);
		const now = /* @__PURE__ */ new Date();
		const qStart = startOfQuarter(now);
		const qEnd = endOfQuarter(now);
		const evidenceThisQuarter = evidence.filter((e) => !e.isArchived && typeof e.date === "string" && e.date >= qStart && e.date <= qEnd).length;
		const streak = computeWeeklyStreak(evidence);
		const pendingEvidenceCount = evidence.filter((e) => !e.isArchived && e.status === "Pending Review").length;
		const pendingObjectivesCount = objectives.filter((o) => !o.isArchived && o.status === "Pending Approval").length;
		const pendingPeerFeedbackCount = 0;
		return {
			evidenceThisQuarter,
			streak,
			pendingReviewCount: pendingEvidenceCount + pendingObjectivesCount + pendingPeerFeedbackCount,
			pendingEvidenceCount,
			pendingObjectivesCount,
			pendingPeerFeedbackCount,
			recentEvidence: evidence.filter((e) => !e.isArchived).sort((a, b) => toSortableDate(b).localeCompare(toSortableDate(a))).slice(0, DASHBOARD_SAMPLE_MIN_ITEMS),
			focusAreas: objectives.filter((o) => !o.isArchived && o.status === "In Progress").slice(0, DASHBOARD_SAMPLE_MIN_ITEMS)
		};
	}, [
		evidenceQuery.data,
		objectivesQuery.data,
		showSamples
	]);
}
function DashboardView({ workspaceUserId, inbox, showSampleData, dismissedSampleInboxIds, onOpenInbox, onOpenObjective, onOpenEvidence }) {
	const stats = useDashboardStats(workspaceUserId, { showSamples: showSampleData });
	const dashboardInbox = (0, import_react.useMemo)(() => {
		const live = inbox.map((item) => ({
			...item,
			isSample: false
		}));
		if (!showSampleData) return live;
		const samples = [
			{
				id: "SAMPLE-INBOX-RFC-01",
				source: "Confluence",
				icon: null,
				title: "Draft RFC needs competency mapping: checkout resiliency failover strategy",
				suggestion: ["System Design", "Communication"],
				when: "Sample",
				isSample: true
			},
			{
				id: "SAMPLE-INBOX-QUERY-02",
				source: "GitHub",
				icon: null,
				title: "Merged optimization PR: removed N+1 query bottleneck on order timeline endpoint",
				suggestion: ["Code Quality", "Analytical Thinking"],
				when: "Sample",
				isSample: true
			},
			{
				id: "SAMPLE-INBOX-INCIDENT-03",
				source: "PagerDuty",
				icon: null,
				title: "Incident note captured: led SEV-2 cache stampede response and postmortem actions",
				suggestion: ["Delivery", "Leadership"],
				when: "Sample",
				isSample: true
			}
		];
		if (live.length >= 3) return live;
		const used = new Set(live.map((item) => item.id));
		const dismissed = new Set(dismissedSampleInboxIds);
		const filler = samples.filter((item) => !used.has(item.id) && !dismissed.has(item.id)).slice(0, 3 - live.length);
		return [...live, ...filler];
	}, [
		inbox,
		showSampleData,
		dismissedSampleInboxIds
	]);
	const active = stats.focusAreas;
	const recentEvidence = stats.recentEvidence;
	function relativeDate(dateStr) {
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr;
		const diffDays = Math.floor((Date.now() - d.getTime()) / (1e3 * 60 * 60 * 24));
		if (diffDays <= 0) return "Today";
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
		return formatDisplayDate(dateStr);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 md:grid-cols-3 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { size: 18 }),
					label: "Evidence This Quarter",
					value: String(stats.evidenceThisQuarter),
					helperText: "Total evidence items captured within the current performance evaluation cycle.",
					tone: "info"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 18 }),
					label: "Current Streak",
					value: stats.streak === 1 ? "1 week" : `${stats.streak} weeks`,
					helperText: "Consecutive weeks with at least one active piece of evidence or knowledge log recorded.",
					tone: "success"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingReviewCard, {
					total: stats.pendingReviewCount,
					evidenceCount: stats.pendingEvidenceCount,
					objectiveCount: stats.pendingObjectivesCount,
					peerReviewCount: stats.pendingPeerFeedbackCount
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-3 gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-2 space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader$1, {
						title: "Action Inbox",
						sub: "Auto-captured events that need your mapping",
						right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							tone: "warning",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 12 }),
							children: [dashboardInbox.length, " pending"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 divide-y",
						style: { borderColor: C.border },
						children: dashboardInbox.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-10 text-center text-sm flex flex-col items-center gap-2",
							style: { color: C.subtle },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, {
								size: 28,
								style: { color: C.green }
							}), "Inbox zero. Nice work."]
						}) : dashboardInbox.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InboxRow, {
							item: it,
							isSample: Boolean(it.isSample),
							onOpen: () => onOpenInbox(it)
						}, it.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader$1, {
						title: "Recent Evidence",
						sub: "Latest logged and verified contributions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute left-[11px] top-1 bottom-1 w-px",
							style: { background: C.border },
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-3",
							children: recentEvidence.map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "relative",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => onOpenEvidence(ev),
									className: "w-full text-left flex items-start gap-3 pl-0 pr-2 py-2 rounded hover:bg-slate-50 transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10",
										style: {
											background: "#fff",
											border: `1px solid ${C.border}`
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
											size: 14,
											style: { color: C.green }
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-semibold truncate",
												style: { color: C.navy },
												children: ev.title
											}),
											ev.isSample && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] mt-1",
												style: { color: C.subtle },
												children: "Sample evidence - replace this with your own records as you log activity."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1 flex items-center gap-2 text-[11px]",
												style: { color: C.subtle },
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: relativeDate(ev.date) }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"aria-hidden": true,
														children: "·"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														tone: "info",
														children: ev.category
													})
												]
											})
										]
									})]
								})
							}, ev.id))
						})]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader$1, {
					title: "Current Focus Areas",
					sub: "Active objectives in flight"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-2",
					children: [active.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm",
						style: { color: C.subtle },
						children: "No active objectives yet."
					}), active.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => onOpenObjective(o),
						className: "w-full text-left flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-slate-50 hover:border-[#0052CC] transition-colors",
						style: { borderColor: C.border },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTodo, {
							size: 16,
							style: { color: C.primary },
							className: "mt-0.5"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold truncate",
									style: { color: C.navy },
									children: o.title
								}),
								o.isSample && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] mt-1",
									style: { color: C.subtle },
									children: "Sample objective - hide samples in Settings once your own goals are active."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] mt-1 flex items-center gap-2",
									style: { color: C.subtle },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 11 }),
										"Due ",
										o.due
									]
								})
							]
						})]
					}, o.id))]
				})]
			})]
		})]
	});
}
function StatCard({ icon, label, value, helperText, tone }) {
	const t = {
		info: {
			bg: C.primarySoft,
			fg: C.primary
		},
		success: {
			bg: C.greenSoft,
			fg: "#006644"
		},
		warning: {
			bg: C.amberSoft,
			fg: "#974F00"
		}
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-semibold uppercase tracking-wide",
					style: { color: C.subtle },
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-8 h-8 rounded flex items-center justify-center",
					style: {
						background: t.bg,
						color: t.fg
					},
					children: icon
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 text-3xl font-bold tracking-tight",
				style: { color: C.navy },
				children: value
			}),
			helperText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs mt-1 leading-snug",
				style: { color: C.subtle },
				children: helperText
			})
		]
	});
}
function PendingReviewCard({ total, evidenceCount, objectiveCount, peerReviewCount }) {
	const visibleItems = [
		{
			label: "Evidence Logs",
			count: evidenceCount,
			tone: "warning",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 12 })
		},
		{
			label: "SMART Objectives",
			count: objectiveCount,
			tone: "info",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { size: 12 })
		},
		{
			label: "Peer Feedback",
			count: peerReviewCount,
			tone: "neutral",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircleHeart, { size: 12 })
		}
	].filter((it) => it.count > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-semibold uppercase tracking-wide",
					style: { color: C.subtle },
					children: "Items Pending Manager Review"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-8 h-8 rounded flex items-center justify-center",
					style: {
						background: C.amberSoft,
						color: "#974F00"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 18 })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex items-baseline gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-3xl font-bold tracking-tight",
					style: { color: C.navy },
					children: total
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs mt-1 leading-snug",
				style: { color: C.subtle },
				children: "Tracked action items currently submitted and awaiting manager sign-off."
			}),
			visibleItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 text-xs",
				style: { color: C.subtle },
				children: "All caught up! No items currently awaiting manager review."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1.5",
				children: visibleItems.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: it.tone,
					icon: it.icon,
					children: [
						it.count,
						" ",
						it.label
					]
				}, it.label))
			})
		]
	});
}
function SectionHeader$1({ title, sub, right }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-bold",
				style: { color: C.navy },
				children: title
			}), sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs mt-0.5",
				style: { color: C.subtle },
				children: sub
			})]
		}), right && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: right
		})]
	});
}
function InboxRow({ item, onOpen, isSample }) {
	const safeItem = item ?? {};
	const canOpen = Boolean(onOpen && typeof safeItem.id === "string" && safeItem.id.trim().length > 0);
	const sourceLabel = safeItem.source || "Unknown source";
	const timeLabel = safeItem.when || "Unknown time";
	const titleLabel = safeItem.title || "Untitled action";
	const suggestions = Array.isArray(safeItem.suggestion) ? safeItem.suggestion.filter(Boolean) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: canOpen ? onOpen : void 0,
		disabled: !canOpen,
		className: "w-full text-left py-4 flex items-start gap-3 hover:bg-[#FAFBFC] disabled:hover:bg-transparent transition-colors rounded px-2 -mx-2 disabled:cursor-default",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-9 h-9 rounded flex items-center justify-center shrink-0",
				style: {
					background: "#F4F5F7",
					color: C.slate
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceIcon, {
					source: sourceLabel,
					size: 16
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-[11px]",
						style: { color: C.subtle },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold uppercase tracking-wider",
								children: sourceLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: timeLabel })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-semibold mt-0.5 truncate",
						style: { color: C.navy },
						children: titleLabel
					}),
					isSample && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] mt-1",
						style: { color: C.subtle },
						children: "Sample item - this will disappear once real inbox events are available."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 mt-2 flex-wrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								size: 12,
								style: { color: C.primary }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] mr-1",
								style: { color: C.subtle },
								children: "AI suggested:"
							}),
							suggestions.length > 0 ? suggestions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] px-2 py-0.5 rounded-full border",
								style: {
									borderColor: C.border,
									color: C.slate,
									background: "#F4F5F7"
								},
								children: c
							}, c)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px]",
								style: { color: C.subtle },
								children: "No suggestions"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 self-center flex items-center gap-1 text-xs font-medium",
				style: { color: isSample ? C.subtle : C.primary },
				children: [isSample ? "Sample" : "Review", !isSample && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 14 })]
			})
		]
	});
}
var CustomRadarTick = (props) => {
	const { x, y, payload, cx, cy } = props;
	const value = payload?.value ?? "";
	const fullLabel = String(value);
	const maxLabelLength = 18;
	const displayLabel = fullLabel.length > maxLabelLength ? `${fullLabel.slice(0, maxLabelLength - 1)}…` : fullLabel;
	let textAnchor = "middle";
	if (x > cx + 10) textAnchor = "start";
	if (x < cx - 10) textAnchor = "end";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		transform: `translate(${x}, ${y})`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: fullLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			textAnchor,
			fill: "#4b5563",
			fontSize: 11,
			className: "font-medium cursor-help",
			style: { pointerEvents: "all" },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tspan", {
				x: 0,
				dy: 0,
				children: displayLabel
			})
		})]
	});
};
function SectionHeader({ title, sub, right }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-bold",
				style: { color: C.navy },
				children: title
			}), sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs mt-0.5",
				style: { color: C.subtle },
				children: sub
			})]
		}), right && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: right
		})]
	});
}
function Th({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: `px-4 py-3 font-semibold ${className}`,
		children
	});
}
function Td({ children, className = "", style }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: `px-4 py-3 align-middle ${className}`,
		style,
		children
	});
}
function HierarchicalMatrix({ data, latest, previousCompleted, evidence, objectives, categoryMap, selectedEngineerId, onCreateObjective }) {
	const [open, setOpen] = (0, import_react.useState)({});
	const isManagerWorkspace = Boolean(selectedEngineerId);
	const [showUnmappedHistory, setShowUnmappedHistory] = (0, import_react.useState)(false);
	const categoryEntries = (0, import_react.useMemo)(() => Object.entries(categoryMap), [categoryMap]);
	const categoryNames = (0, import_react.useMemo)(() => categoryEntries.map(([category]) => category), [categoryEntries]);
	const changeLozenge = (delta) => delta > 0 ? "bg-green-100 text-green-800" : delta < 0 ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-800";
	const gapLozenge = (gap) => gap <= 0 ? "bg-green-100 text-green-800" : gap >= 1 ? "bg-red-100 text-red-800" : gap >= .5 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800";
	const calculateProgressTowardsTarget = (previous, current, target) => {
		const remainingGap = target - previous;
		if (Math.abs(remainingGap) < .001) return current === target ? 100 : 0;
		return +((current - previous) / remainingGap * 100).toFixed(1);
	};
	const unmappedHistory = (0, import_react.useMemo)(() => {
		return {
			assessmentCategories: (latest?.categories ?? []).filter((category) => !categoryNames.some((activeCategory) => normalizeCategoryName(activeCategory) === normalizeCategoryName(category.categoryName))),
			evidence: evidence.filter((record) => {
				return !(resolveCategoryFromFramework(record.category ?? "", categoryNames) ?? resolveCategoryFromFramework(record.competency ?? "", categoryNames));
			}),
			objectives: objectives.filter((objective) => {
				return !resolveCategoryFromFramework(objective.competency ?? "", categoryNames);
			})
		};
	}, [
		categoryNames,
		evidence,
		latest?.categories,
		objectives
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				style: {
					background: "#F4F5F7",
					color: C.subtle
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "text-left text-[11px] uppercase tracking-wider",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Competency / Question" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Previous" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Current" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Delta" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Target" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Progress toward Target (%)" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Gap" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Evidence Logged" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Action" })
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [categoryEntries.map(([categoryName, details]) => {
				const row = data.find((entry) => entry.competency === categoryName || normalizeCategoryName(entry.competency) === normalizeCategoryName(categoryName)) ?? data.find((entry) => resolveCategoryFromFramework(entry.competency, [categoryName]));
				const subs = details.items ?? [];
				latest?.categories.find((c) => c.categoryName === categoryName || normalizeCategoryName(c.categoryName) === normalizeCategoryName(categoryName));
				const isOpen = !!open[categoryName];
				const subScores = subs.map((sub) => getHistoricalQuestionScores(latest, categoryName, sub, previousCompleted));
				const prevAvg = subScores.length === 0 ? 1 : +(subScores.reduce((sum, score) => sum + score.previous, 0) / subScores.length).toFixed(2);
				const curAvg = subScores.length === 0 ? 1 : +(subScores.reduce((sum, score) => sum + score.current, 0) / subScores.length).toFixed(2);
				const targetAvg = subScores.length === 0 ? row?.target ?? 4 : +(subScores.reduce((sum, score) => sum + score.target, 0) / subScores.length).toFixed(2);
				const gapAvg = +(targetAvg - curAvg).toFixed(2);
				const delta = calculateScoreDelta(prevAvg, curAvg);
				const progressToTarget = calculateProgressTowardsTarget(prevAvg, curAvg, targetAvg);
				const evidenceCount = evidence.filter((record) => {
					return (resolveCategoryFromFramework(record.category ?? "", categoryNames) ?? resolveCategoryFromFramework(record.competency ?? "", categoryNames)) === categoryName;
				}).length;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t hover:bg-[#FAFBFC] transition-colors cursor-pointer",
					style: { borderColor: C.border },
					onClick: () => setOpen((s) => ({
						...s,
						[categoryName]: !s[categoryName]
					})),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-semibold",
							style: { color: C.navy },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
										animate: { rotate: isOpen ? 0 : -90 },
										transition: { duration: .15 },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
											size: 14,
											style: { color: C.subtle }
										})
									}),
									categoryName,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-2 inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-500 rounded-md",
										children: [subs.length, " questions"]
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							style: { color: C.slate },
							children: prevAvg.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							style: {
								color: C.navy,
								fontWeight: 600
							},
							children: curAvg.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(delta)}`,
							children: delta > 0 ? `+${delta}` : `${delta}`
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							style: { color: C.slate },
							children: targetAvg.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(progressToTarget)}`,
							children: progressToTarget > 0 ? `+${progressToTarget}%` : `${progressToTarget}%`
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `px-2 py-0.5 rounded text-xs font-semibold ${gapLozenge(gapAvg)}`,
							children: gapAvg > 0 ? `+${gapAvg}` : `${gapAvg}`
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							style: {
								color: C.navy,
								fontWeight: 600
							},
							children: evidenceCount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: (e) => {
								e.stopPropagation();
								if (isManagerWorkspace) return;
								onCreateObjective();
							},
							disabled: isManagerWorkspace,
							className: "text-xs font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded border hover:border-[#0052CC] transition-colors",
							style: {
								borderColor: C.border,
								color: C.primary
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 12 }), "Create Objective"]
						}) })
					]
				}), isOpen && subs.map((sub) => {
					const historical = getHistoricalQuestionScores(latest, categoryName, sub, previousCompleted);
					const prev = historical.previous;
					const cur = historical.current;
					const tgt = historical.target;
					historical.note;
					const scale = EFFECTIVENESS_SCALE[Math.max(0, Math.min(4, cur - 1))];
					const subGap = +(tgt - cur).toFixed(2);
					const subDelta = calculateScoreDelta(prev, cur);
					const subProgress = calculateProgressTowardsTarget(prev, cur, tgt);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t bg-[#FAFBFC] hover:bg-[#F4F5F7] transition-colors",
						style: { borderColor: C.border },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, {
								className: "pl-12",
								style: { color: C.slate },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[13px] leading-snug",
									style: { color: C.navy },
									children: sub
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] mt-0.5",
									style: { color: C.subtle },
									children: [
										"Score: ",
										cur,
										" - ",
										scale.label
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
								style: { color: C.slate },
								children: prev
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
								style: {
									color: C.navy,
									fontWeight: 600
								},
								children: cur
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(subDelta)}`,
								children: subDelta > 0 ? `+${subDelta}` : `${subDelta}`
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
								style: { color: C.slate },
								children: tgt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(subProgress)}`,
								children: subProgress > 0 ? `+${subProgress}%` : `${subProgress}%`
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `px-2 py-0.5 rounded text-xs font-semibold ${gapLozenge(subGap)}`,
								children: subGap > 0 ? `+${subGap}` : `${subGap}`
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
								style: { color: C.subtle },
								children: "-"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									if (isManagerWorkspace) return;
									onCreateObjective();
								},
								disabled: isManagerWorkspace,
								className: "text-[11px] font-semibold inline-flex items-center gap-1 px-2 py-1 rounded border hover:border-[#0052CC] transition-colors",
								style: {
									borderColor: C.border,
									color: C.primary
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 11 }), "Create Objective"]
							}) })
						]
					}, categoryName + sub);
				})] }, categoryName);
			}), (unmappedHistory.assessmentCategories.length > 0 || unmappedHistory.evidence.length > 0 || unmappedHistory.objectives.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t",
				style: {
					borderColor: C.border,
					background: "#FFF8E6"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					className: "font-semibold",
					style: { color: C.navy },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setShowUnmappedHistory((prev) => !prev),
						className: "inline-flex items-center gap-2 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
							size: 14,
							style: { transform: showUnmappedHistory ? "rotate(0deg)" : "rotate(-90deg)" }
						}), "Unmapped History"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3 align-middle",
					colSpan: 8,
					style: { color: C.subtle },
					children: "Legacy records from categories not present in the current framework."
				})]
			}), showUnmappedHistory && unmappedHistory.assessmentCategories.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t bg-[#FFFDF5]",
				style: { borderColor: C.border },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: "pl-12",
						style: { color: C.navy },
						children: category.categoryName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						style: { color: C.slate },
						children: "-"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						style: { color: C.slate },
						children: category.categoryCurrentAvg.toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						style: { color: C.slate },
						children: "-"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						style: { color: C.slate },
						children: category.categoryTarget.toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						style: { color: C.slate },
						children: "-"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						style: { color: C.slate },
						children: (category.categoryTarget - category.categoryCurrentAvg).toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						style: { color: C.slate },
						children: unmappedHistory.evidence.filter((record) => normalizeCategoryName(record.category ?? record.competency ?? "").includes(normalizeCategoryName(category.categoryName))).length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						style: { color: C.subtle },
						children: "-"
					})
				]
			}, `unmapped-${category.categoryName}`))] })] })]
		})
	});
}
function RadarView({ data, assessments, evidence, objectives, wizardDraft, selectedEngineerId, onCreateObjective, onStartReview, onResumeDraft, onDiscardDraft, onOpenHistory }) {
	const completedAssessments = (0, import_react.useMemo)(() => assessments.filter((assessment) => assessment.status === "Finalized").sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime()), [assessments]);
	const current = (0, import_react.useMemo)(() => +(data.reduce((s, d) => s + d.current, 0) / data.length).toFixed(2), [data]);
	const readiness = Math.round(current / 4 * 100);
	const top = [...data].sort((a, b) => b.current - a.current)[0];
	const gap = [...data].sort((a, b) => b.target - b.current - (a.target - a.current))[0];
	const [chartMode, setChartMode] = (0, import_react.useState)("radar");
	const latest = completedAssessments[0] ?? assessments[0];
	const previousCompleted = completedAssessments[1];
	const { categories, getQuestionsForCategory } = useFramework();
	const frameworkCategoryMap = (0, import_react.useMemo)(() => {
		if (categories.length > 0) return buildFrameworkCategoryMapFromContext(categories, getQuestionsForCategory);
		return data.reduce((acc, row) => {
			const matchingAssessmentCategory = latest?.categories.find((category) => category.categoryName === row.competency || normalizeCategoryName(category.categoryName) === normalizeCategoryName(row.competency));
			acc[row.competency] = {
				summary: matchingAssessmentCategory?.summary ?? "",
				items: (matchingAssessmentCategory?.questions ?? []).map((question) => question.questionText)
			};
			return acc;
		}, {});
	}, [
		categories,
		data,
		getQuestionsForCategory,
		latest?.categories
	]);
	const categoryEntries = (0, import_react.useMemo)(() => Object.entries(frameworkCategoryMap), [frameworkCategoryMap]);
	const frameworkCategoryNames = (0, import_react.useMemo)(() => categoryEntries.map(([categoryName]) => categoryName), [categoryEntries]);
	const chartData = (0, import_react.useMemo)(() => {
		const evidenceCounts = evidence.reduce((acc, record) => {
			const matchedCategory = resolveCategoryFromFramework(record.category ?? "", frameworkCategoryNames) ?? resolveCategoryFromFramework(record.competency ?? "", frameworkCategoryNames);
			if (!matchedCategory) return acc;
			acc[matchedCategory] = (acc[matchedCategory] ?? 0) + 1;
			return acc;
		}, {});
		return data.map((r) => {
			const latestCat = latest?.categories.find((c) => c.categoryName === r.competency || normalizeCategoryName(c.categoryName) === normalizeCategoryName(r.competency));
			const previousCat = previousCompleted?.categories.find((c) => c.categoryName === r.competency || normalizeCategoryName(c.categoryName) === normalizeCategoryName(r.competency));
			const comparisonPreviousAvg = previousCat && previousCat.questions.length > 0 ? previousCat.questions.reduce((sum, question) => sum + question.currentScore, 0) / previousCat.questions.length : latestCat && latestCat.questions.length > 0 ? latestCat.questions.reduce((sum, question) => sum + question.previousScore, 0) / latestCat.questions.length : 1;
			const previous = +Math.min(4, comparisonPreviousAvg / 5 * 4).toFixed(2);
			return {
				competency: r.competency,
				previous,
				current: r.current,
				target: r.target,
				evidenceCount: evidenceCounts[r.competency] ?? 0
			};
		});
	}, [
		data,
		evidence,
		frameworkCategoryNames,
		latest,
		previousCompleted
	]);
	const dynamicBarChartHeight = Math.max(320, chartData.length * 36 + 48);
	const formatRelativeSync = (dateValue) => {
		if (!dateValue) return "No synced assessment yet";
		const parsedDate = new Date(dateValue);
		if (Number.isNaN(parsedDate.getTime())) return "Sync date unavailable";
		const elapsedMs = Date.now() - parsedDate.getTime();
		if (elapsedMs < 0) return "Just synced";
		const elapsedDays = Math.floor(elapsedMs / (1e3 * 60 * 60 * 24));
		if (elapsedDays === 0) return "today";
		if (elapsedDays === 1) return "1 day ago";
		return `${elapsedDays} days ago`;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: wizardDraft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: {
					opacity: 0,
					y: -8
				},
				animate: {
					opacity: 1,
					y: 0
				},
				exit: {
					opacity: 0,
					y: -8
				},
				transition: { duration: .18 },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-5",
					style: { background: "#F4F5F7" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
								size: 16,
								className: "mt-0.5 shrink-0",
								style: { color: C.primary }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold",
								style: { color: C.navy },
								children: "In-Progress Assessment"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm mt-1",
								style: { color: C.slate },
								children: [
									"You have an ongoing self-assessment draft that was last modified on",
									" ",
									formatDisplayDate(wizardDraft.savedAt),
									"."
								]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
								onClick: onResumeDraft,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { size: 14 }), "Resume Assessment"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
								onClick: onDiscardDraft,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 14 }), "Discard Draft"]
							})]
						})]
					})
				})
			}, "ongoing-assessment-draft-banner") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm",
				style: { color: C.subtle },
				children: "Assessment of current scores vs Level 4 target across the competency framework."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs font-semibold uppercase tracking-wide",
						style: { color: C.subtle },
						children: "Assessment Wizard"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm mt-1",
						style: { color: C.navy },
						children: wizardDraft ? `Ongoing assessment detected. Draft saved ${formatDisplayDate(wizardDraft.savedAt)}.` : "Start a new assessment or open history from here."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
							onClick: onOpenHistory,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { size: 14 }), "Assessment History"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
							onClick: onStartReview,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { size: 14 }), wizardDraft ? "Resume Ongoing Assessment" : "Start Assessment Wizard"]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-semibold uppercase tracking-wide",
								style: { color: C.subtle },
								children: "Overall Readiness"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-3xl font-bold mt-2 tracking-tight",
								style: { color: C.navy },
								children: [readiness, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 h-1.5 rounded-full overflow-hidden",
								style: { background: "#EBECF0" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full",
									style: {
										width: `${readiness}%`,
										background: C.green
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs mt-2",
								style: { color: C.subtle },
								children: "Toward Level 4 threshold"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-semibold uppercase tracking-wide",
									style: { color: C.subtle },
									children: "Top Strength"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, {
									size: 18,
									style: { color: C.green }
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-lg font-bold mt-2 tracking-tight",
								style: { color: C.navy },
								children: top.competency
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs mt-1",
								style: { color: C.subtle },
								children: [top.current.toFixed(2), " / 4"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-semibold uppercase tracking-wide",
									style: { color: C.subtle },
									children: "Primary Gap"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									size: 18,
									style: { color: C.red }
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-lg font-bold mt-2 tracking-tight",
								style: { color: C.navy },
								children: gap.competency
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs mt-1",
								style: { color: C.subtle },
								children: ["Gap of ", (gap.target - gap.current).toFixed(2)]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-semibold uppercase tracking-wide",
									style: { color: C.subtle },
									children: "Manager Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, {
									size: 18,
									style: { color: C.primary }
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-lg font-bold mt-2 tracking-tight",
								style: { color: C.navy },
								children: "On Track"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs mt-1",
								style: { color: C.subtle },
								children: ["Last sync: ", formatRelativeSync(latest?.dateCompleted)]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6 items-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 h-fit col-span-1 order-1 lg:order-2 lg:col-span-1 lg:sticky lg:top-24",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
							title: "Visual Gap Analysis",
							sub: chartMode === "radar" ? "Holistic shape: current score vs Level 4 target" : "Side-by-side comparison: previous, current, and target per category",
							right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center rounded border overflow-hidden",
								style: { borderColor: C.border },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setChartMode("radar"),
									"aria-pressed": chartMode === "radar",
									className: "inline-flex items-center gap-1.5 px-2.5 h-8 text-xs font-semibold transition-colors",
									style: {
										background: chartMode === "radar" ? C.primarySoft : "#fff",
										color: chartMode === "radar" ? C.primary : C.slate
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, { size: 13 }), "Radar"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setChartMode("bar"),
									"aria-pressed": chartMode === "bar",
									className: "inline-flex items-center gap-1.5 px-2.5 h-8 text-xs font-semibold transition-colors border-l",
									style: {
										borderColor: C.border,
										background: chartMode === "bar" ? C.primarySoft : "#fff",
										color: chartMode === "bar" ? C.primary : C.slate
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartBar, { size: 13 }), "Bar"]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4 text-xs mt-3",
							style: { color: C.slate },
							children: [
								chartMode === "bar" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-2.5 h-2.5 rounded-sm",
										style: { background: C.slate }
									}), "Previous"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-2.5 h-2.5 rounded-sm",
										style: { background: "#0052CC" }
									}), "Current"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-2.5 h-2.5 rounded-sm",
										style: { background: "#00B8D9" }
									}), "Target L4"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							style: chartMode === "bar" ? { height: dynamicBarChartHeight } : void 0,
							children: chartMode === "radar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full bg-white p-1 rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: 360,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadarChart, {
										data,
										cx: "50%",
										cy: "50%",
										outerRadius: "78%",
										margin: {
											top: 16,
											right: 24,
											bottom: 16,
											left: 24
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarGrid, { stroke: C.border }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarAngleAxis, {
												dataKey: "competency",
												tick: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomRadarTick, {})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarRadiusAxis, {
												angle: 90,
												domain: [0, 4],
												tick: {
													fill: C.subtle,
													fontSize: 10
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar$1, {
												name: "Target L4",
												dataKey: "target",
												stroke: "#00B8D9",
												fill: "#00B8D9",
												fillOpacity: .08,
												strokeWidth: 2
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar$1, {
												name: "Current",
												dataKey: "current",
												stroke: "#0052CC",
												fill: "#0052CC",
												fillOpacity: .2,
												strokeWidth: 2
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
												contentStyle: {
													background: "#fff",
													border: `1px solid ${C.border}`,
													borderRadius: 6,
													fontSize: 12
												},
												formatter: (v) => `${Number(v).toFixed(2)} / 4`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { display: "none" } })
										]
									})
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
									data: chartData,
									layout: "vertical",
									margin: {
										top: 20,
										right: 15,
										left: 10,
										bottom: 20
									},
									barCategoryGap: "22%",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											horizontal: false,
											stroke: C.border
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											type: "number",
											domain: [0, 4],
											tick: {
												fill: C.subtle,
												fontSize: 10
											},
											stroke: C.border
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											type: "category",
											dataKey: "competency",
											width: 165,
											dx: -5,
											tick: {
												fill: C.navy,
												fontSize: 11,
												fontWeight: 600,
												textAnchor: "end"
											},
											stroke: C.border
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
											contentStyle: {
												background: "#fff",
												border: `1px solid ${C.border}`,
												borderRadius: 6,
												fontSize: 12
											},
											formatter: (v) => `${Number(v).toFixed(2)} / 4`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { display: "none" } }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "previous",
											name: "Previous",
											fill: C.slate,
											radius: [
												0,
												2,
												2,
												0
											],
											barSize: 6
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "current",
											name: "Current",
											fill: "#0052CC",
											radius: [
												0,
												2,
												2,
												0
											],
											barSize: 6
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "target",
											name: "Target L4",
											fill: "#00B8D9",
											radius: [
												0,
												2,
												2,
												0
											],
											barSize: 6
										})
									]
								})
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-0 overflow-hidden col-span-1 lg:col-span-2 order-2 lg:order-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-5 border-b",
						style: { borderColor: C.border },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
							title: "Hierarchical Gap Analysis",
							sub: "Expand a category to see specific competency questions and their 1-5 effectiveness rating"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HierarchicalMatrix, {
						data,
						latest,
						previousCompleted,
						evidence,
						objectives,
						categoryMap: frameworkCategoryMap,
						selectedEngineerId,
						onCreateObjective
					})]
				})]
			})
		]
	});
}
function assertFeedbackRelation(relation) {
	if (relation === "peer_engineer" || relation === "ux_partner" || relation === "product_manager" || relation === "pmm_partner" || relation === "quality_engineer") return;
	throw new Error("Invalid relationship type.");
}
async function requireAuthUserId() {
	const { data: { user }, error } = await supabase.auth.getUser();
	if (error) throw error;
	if (!user?.id) throw new Error("Not authenticated.");
	return user.id;
}
async function requestPeerFeedback(engineerId, reviewerId, relation) {
	const authUserId = await requireAuthUserId();
	assertFeedbackRelation(relation);
	const ownerEngineerId = engineerId.trim() || authUserId;
	const normalizedReviewerId = reviewerId.trim();
	if (ownerEngineerId !== authUserId) throw new Error("You can only create feedback requests for your own profile.");
	if (!normalizedReviewerId) throw new Error("Select a teammate first.");
	if (normalizedReviewerId === ownerEngineerId) throw new Error("You cannot request feedback from yourself.");
	const { data: existingPending, error: existingPendingError } = await supabase.from("three_sixty_feedback").select("id").eq("engineer_id", ownerEngineerId).eq("reviewer_id", normalizedReviewerId).eq("status", "pending").limit(1);
	if (existingPendingError) throw existingPendingError;
	if ((existingPending ?? []).length > 0) throw new Error("A pending request already exists for this teammate.");
	const { error } = await supabase.from("three_sixty_feedback").insert({
		engineer_id: ownerEngineerId,
		reviewer_id: normalizedReviewerId,
		relationship_type: relation,
		status: "pending"
	});
	if (error) {
		if (error.code === "23505") throw new Error("A pending request already exists for this teammate.");
		throw error;
	}
	return {
		engineer_id: ownerEngineerId,
		reviewer_id: normalizedReviewerId,
		relationship_type: relation,
		status: "pending"
	};
}
async function getIncomingFeedbackRequests() {
	const reviewerId = await requireAuthUserId();
	const { data: rows, error } = await supabase.from("three_sixty_feedback").select(`
      id,
      engineer_id,
      reviewer_id,
      relationship_type,
      status,
      continue_feedback,
      stop_feedback,
      start_feedback,
      execution_vector,
      created_at,
      submitted_at
      `).eq("reviewer_id", reviewerId).eq("status", "pending").order("created_at", { ascending: false });
	if (error) throw error;
	const feedbackRows = rows ?? [];
	if (feedbackRows.length === 0) return feedbackRows;
	const engineerIds = Array.from(new Set(feedbackRows.map((row) => row.engineer_id)));
	const { data: profileRows, error: profileError } = await supabase.from("profiles").select("id, full_name, job_title, avatar_url").in("id", engineerIds);
	if (profileError) throw profileError;
	const profileById = new Map((profileRows ?? []).map((profile) => [profile.id, {
		full_name: profile.full_name ?? "Teammate",
		job_title: profile.job_title ?? "",
		avatar_url: profile.avatar_url ?? null
	}]));
	return feedbackRows.map((row) => ({
		...row,
		profiles: profileById.get(row.engineer_id)
	}));
}
async function submitPeerFeedback(requestId, payload) {
	const reviewerId = await requireAuthUserId();
	const vector = payload.vector;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const { error } = await supabase.from("three_sixty_feedback").update({
		continue_feedback: payload.continueText,
		stop_feedback: payload.stopText,
		start_feedback: payload.startText,
		execution_vector: vector,
		status: "submitted",
		submitted_at: now
	}).eq("id", requestId).eq("reviewer_id", reviewerId);
	if (error) throw error;
	return {
		id: requestId,
		status: "submitted",
		submitted_at: now
	};
}
async function getEngineerFeedbackDossier(engineerId) {
	const { data, error } = await supabase.from("three_sixty_feedback").select("*").eq("engineer_id", engineerId).eq("status", "submitted").order("submitted_at", { ascending: false });
	if (error) throw error;
	return data ?? [];
}
async function getOutgoingFeedbackRequests(engineerId) {
	if (engineerId !== await requireAuthUserId()) throw new Error("You can only load your own outgoing requests.");
	const { data: rows, error } = await supabase.from("three_sixty_feedback").select(`
      id,
      engineer_id,
      reviewer_id,
      relationship_type,
      status,
      continue_feedback,
      stop_feedback,
      start_feedback,
      execution_vector,
      created_at,
      submitted_at
      `).eq("engineer_id", engineerId).order("created_at", { ascending: false });
	if (error) throw error;
	const feedbackRows = rows ?? [];
	if (feedbackRows.length === 0) return feedbackRows;
	const reviewerIds = Array.from(new Set(feedbackRows.map((row) => row.reviewer_id)));
	const { data: profileRows, error: profileError } = await supabase.from("profiles").select("id, full_name, job_title, avatar_url").in("id", reviewerIds);
	if (profileError) throw profileError;
	const profileById = new Map((profileRows ?? []).map((profile) => [profile.id, {
		full_name: profile.full_name ?? "Teammate",
		job_title: profile.job_title ?? "",
		avatar_url: profile.avatar_url ?? null
	}]));
	return feedbackRows.map((row) => ({
		...row,
		profiles: profileById.get(row.reviewer_id)
	}));
}
var RELATION_OPTIONS = [
	{
		value: "peer_engineer",
		label: "Peer Engineer"
	},
	{
		value: "ux_partner",
		label: "UX Partner"
	},
	{
		value: "product_manager",
		label: "Product Manager"
	},
	{
		value: "pmm_partner",
		label: "PMM"
	},
	{
		value: "quality_engineer",
		label: "Quality Engineer"
	}
];
var EXECUTION_VECTOR_OPTIONS = [
	{
		value: "working_below",
		label: "Working below current level baseline"
	},
	{
		value: "meeting_expectations",
		label: "Fully meeting level expectations"
	},
	{
		value: "executing_above",
		label: "Actively executing at the next level up"
	}
];
function EmptySlate({ message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500",
		children: message
	});
}
function requestLabel(member) {
	if (!member) return "";
	return member.jobTitle ? `${member.fullName} (${member.jobTitle})` : member.fullName;
}
function initialsFor(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "TM";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
function shuffleStrings(values) {
	const shuffled = [...values];
	for (let i = shuffled.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
function getErrorMessage(error, fallback) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "object" && error !== null && "message" in error) {
		const message = error.message;
		if (typeof message === "string" && message.trim().length > 0) return message;
	}
	return fallback;
}
function formatDateLabel(isoDate) {
	return new Date(isoDate).toLocaleDateString(void 0, {
		year: "numeric",
		month: "short",
		day: "numeric"
	});
}
function addMonths(base, months) {
	const next = new Date(base);
	next.setMonth(next.getMonth() + months);
	return next;
}
function FeedbackView() {
	const { userId } = useAuth();
	const activeUserId = userId ?? "";
	const [activeView, setActiveView] = (0, import_react.useState)("my_insights");
	const [selectedReviewerId, setSelectedReviewerId] = (0, import_react.useState)("");
	const [selectedRelationType, setSelectedRelationType] = (0, import_react.useState)("peer_engineer");
	const [expandedIncomingId, setExpandedIncomingId] = (0, import_react.useState)(null);
	const [incomingRequests, setIncomingRequests] = (0, import_react.useState)([]);
	const [outgoingRequests, setOutgoingRequests] = (0, import_react.useState)([]);
	const [dossierRows, setDossierRows] = (0, import_react.useState)([]);
	const [requestCadenceMonths, setRequestCadenceMonths] = (0, import_react.useState)(3);
	const [isBootstrapping, setIsBootstrapping] = (0, import_react.useState)(true);
	const [isSubmittingRequest, setIsSubmittingRequest] = (0, import_react.useState)(false);
	const [isSubmittingEvaluation, setIsSubmittingEvaluation] = (0, import_react.useState)(false);
	const [formState, setFormState] = (0, import_react.useState)({});
	const { data: teammates = [] } = useQuery({
		queryKey: ["three-sixty-team-members", activeUserId],
		enabled: Boolean(activeUserId),
		queryFn: async () => {
			if (!activeUserId) return [];
			const { data, error } = await supabase.from("profiles").select("id, full_name, job_title, avatar_url").neq("id", activeUserId).order("full_name", { ascending: true }).limit(50);
			if (error) throw error;
			return (data ?? []).filter((row) => Boolean(row.id) && Boolean(row.full_name)).map((row) => ({
				id: row.id,
				fullName: row.full_name ?? "Unknown teammate",
				jobTitle: row.job_title ?? "",
				avatarUrl: row.avatar_url ?? null
			}));
		}
	});
	const loadFeedbackData = (0, import_react.useCallback)(async () => {
		if (!activeUserId) {
			setIncomingRequests([]);
			setOutgoingRequests([]);
			setDossierRows([]);
			setIsBootstrapping(false);
			return;
		}
		setIsBootstrapping(true);
		try {
			const [incoming, dossier, outgoing] = await Promise.all([
				getIncomingFeedbackRequests(),
				getEngineerFeedbackDossier(activeUserId),
				getOutgoingFeedbackRequests(activeUserId)
			]);
			setIncomingRequests(incoming);
			setDossierRows(dossier);
			setOutgoingRequests(outgoing);
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to load feedback data."));
		} finally {
			setIsBootstrapping(false);
		}
	}, [activeUserId]);
	(0, import_react.useEffect)(() => {
		loadFeedbackData();
	}, [loadFeedbackData]);
	const submittedCount = dossierRows.length;
	const thresholdMet = submittedCount >= 3;
	const pendingCount = incomingRequests.length;
	const uniqueRequestedReviewerCount = (0, import_react.useMemo)(() => new Set(outgoingRequests.map((row) => row.reviewer_id)).size, [outgoingRequests]);
	const reviewersNeededForAnonymousCohort = Math.max(0, 3 - uniqueRequestedReviewerCount);
	const hasMinimumAnonymousPool = uniqueRequestedReviewerCount >= 3;
	const isSmallAvailableTeam = teammates.length > 0 && teammates.length < 3;
	const latestByReviewer = (0, import_react.useMemo)(() => {
		const byReviewer = /* @__PURE__ */ new Map();
		for (const row of outgoingRequests) {
			const existing = byReviewer.get(row.reviewer_id);
			if (!existing) {
				byReviewer.set(row.reviewer_id, row);
				continue;
			}
			if (new Date(row.created_at).getTime() > new Date(existing.created_at).getTime()) byReviewer.set(row.reviewer_id, row);
		}
		return byReviewer;
	}, [outgoingRequests]);
	const selectedReviewerLatestRequest = selectedReviewerId ? latestByReviewer.get(selectedReviewerId) : void 0;
	const nextEligibleDate = selectedReviewerLatestRequest ? addMonths(new Date(selectedReviewerLatestRequest.created_at), requestCadenceMonths) : null;
	const canRequestSelectedReviewer = !nextEligibleDate || Date.now() >= nextEligibleDate.getTime();
	const shuffledContinue = (0, import_react.useMemo)(() => shuffleStrings(dossierRows.map((row) => row.continue_feedback?.trim() ?? "").filter((value) => value.length > 0)), [dossierRows]);
	const shuffledStop = (0, import_react.useMemo)(() => shuffleStrings(dossierRows.map((row) => row.stop_feedback?.trim() ?? "").filter((value) => value.length > 0)), [dossierRows]);
	const shuffledStart = (0, import_react.useMemo)(() => shuffleStrings(dossierRows.map((row) => row.start_feedback?.trim() ?? "").filter((value) => value.length > 0)), [dossierRows]);
	async function handleRequestPeerFeedback() {
		if (!activeUserId) {
			toast.error("Please sign in to request feedback.");
			return;
		}
		if (!selectedReviewerId) {
			toast.error("Select a teammate first.");
			return;
		}
		if (!canRequestSelectedReviewer && nextEligibleDate) {
			toast.error(`Request already sent recently. You can send the next request on ${formatDateLabel(nextEligibleDate.toISOString())}.`);
			return;
		}
		setIsSubmittingRequest(true);
		try {
			await requestPeerFeedback(activeUserId, selectedReviewerId, selectedRelationType);
			try {
				await sendNotification({ data: {
					userId: selectedReviewerId,
					type: "feedback",
					title: "New 360 feedback request",
					description: "A teammate requested your Start/Stop/Continue feedback. Open Teammate Requests to respond."
				} });
			} catch {}
			setSelectedReviewerId("");
			setSelectedRelationType("peer_engineer");
			toast.success("Review request sent");
			await loadFeedbackData();
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to send request."));
		} finally {
			setIsSubmittingRequest(false);
		}
	}
	async function handleSubmitEvaluation(request) {
		const currentForm = formState[request.id];
		if (!currentForm) {
			toast.error("Complete all required fields first.");
			return;
		}
		if (currentForm.continueText.trim().length === 0 || currentForm.stopText.trim().length === 0 || currentForm.startText.trim().length === 0) {
			toast.error("All three text sections are required.");
			return;
		}
		setIsSubmittingEvaluation(true);
		try {
			await submitPeerFeedback(request.id, {
				continueText: currentForm.continueText.trim(),
				stopText: currentForm.stopText.trim(),
				startText: currentForm.startText.trim(),
				vector: currentForm.vector
			});
			toast.success("Evaluation submitted");
			setIncomingRequests((previous) => previous.filter((item) => item.id !== request.id));
			setExpandedIncomingId(null);
			setFormState((previous) => {
				const next = { ...previous };
				delete next[request.id];
				return next;
			});
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to submit evaluation."));
		} finally {
			setIsSubmittingEvaluation(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-7xl mx-auto w-full mt-4 space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold text-slate-900",
				children: "360 Feedback"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-slate-500",
				children: "Confidential Start/Stop/Continue loops with threshold-gated anonymity."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "inline-flex items-center rounded-full border border-slate-200 bg-white p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setActiveView("my_insights"),
					className: `rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${activeView === "my_insights" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`,
					children: "My Insights"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setActiveView("requests"),
					className: `rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${activeView === "requests" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`,
					children: ["Teammate Requests", pendingCount > 0 ? ` (${pendingCount})` : ""]
				})]
			})]
		}), activeView === "my_insights" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-5 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold text-slate-900",
						children: "Nominate Peer Pool"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-slate-500",
						children: "Add cross-functional reviewers for this quarter feedback cycle."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 rounded-xl border border-slate-200 bg-white p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-slate-600",
									children: "Teammate"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: selectedReviewerId,
									onChange: (event) => setSelectedReviewerId(event.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Select teammate"
									}), teammates.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: member.id,
										children: requestLabel(member)
									}, member.id))]
								})]
							}),
							isSmallAvailableTeam ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-amber-900",
										children: "🔒 More Reviewers Needed for Anonymity"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1",
										children: [
											"To keep feedback strictly anonymous, you need a minimum of",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "3 different reviewers" }),
											"."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Next Step:" }), " Expand your list by adding cross-functional teammates, such as a PM, UX Designer, QA, or adjacent engineering partners."]
									})
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-slate-600",
									children: "Relationship type"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: RELATION_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setSelectedRelationType(option.value),
										className: `rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${selectedRelationType === option.value ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"}`,
										children: option.label
									}, option.value))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
								type: "button",
								onClick: handleRequestPeerFeedback,
								disabled: isSubmittingRequest || !selectedReviewerId || !canRequestSelectedReviewer,
								className: "w-full justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60",
								style: { background: "#4F46E5" },
								children: [isSubmittingRequest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									size: 14,
									className: "animate-spin"
								}) : null, "Request Review"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-slate-700",
									children: "Request cadence guardrail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-slate-500",
									children: "Restrict how often this teammate can receive a new request from you."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: String(requestCadenceMonths),
									onChange: (event) => setRequestCadenceMonths(Number(event.target.value)),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "1",
											children: "Every 1 month"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "2",
											children: "Every 2 months"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "3",
											children: "Every 3 months"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "6",
											children: "Every 6 months"
										})
									]
								})
							]
						}), selectedReviewerLatestRequest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800",
							children: [
								"Last request sent on ",
								formatDateLabel(selectedReviewerLatestRequest.created_at),
								".",
								nextEligibleDate ? ` Next eligible request date: ${formatDateLabel(nextEligibleDate.toISOString())}.` : ""
							]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600",
							children: [submittedCount, " of 3 reviews submitted"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `w-full rounded-lg px-3 py-2.5 text-xs leading-relaxed ${hasMinimumAnonymousPool ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-slate-200 bg-white text-slate-700"}`,
							children: hasMinimumAnonymousPool ? `Anonymous cohort ready: ${uniqueRequestedReviewerCount} distinct reviewers nominated.` : `Anonymous cohort incomplete: add ${reviewersNeededForAnonymousCohort} more distinct reviewer${reviewersNeededForAnonymousCohort === 1 ? "" : "s"} to reach the 3-person minimum.`
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-slate-600",
							children: "Request activity"
						}), outgoingRequests.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-500",
							children: "No requests sent yet."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-40 space-y-2 overflow-y-auto pr-1",
							children: outgoingRequests.slice(0, 8).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-slate-800",
									children: row.profiles?.full_name ?? "Teammate"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									"Sent ",
									formatDateLabel(row.created_at),
									" -",
									" ",
									row.status === "pending" ? "Awaiting response" : "Submitted"
								] })]
							}, row.id))
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold text-slate-900",
					children: "My Insights"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-slate-500",
					children: "Feedback is batch-released only when anonymity safeguards are satisfied."
				})] }), isBootstrapping ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500",
					children: "Loading feedback pool..."
				}) : !thresholdMet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white border border-slate-200 rounded-xl p-6 text-center max-w-md mx-auto my-8 space-y-4 font-sans",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center mx-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-amber-600 font-bold text-xs",
								children: "🔒"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-bold text-slate-800 uppercase tracking-wide",
								children: "Calibration Threshold Active"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] font-mono text-slate-500 font-bold",
								children: [
									"Evaluation Status: ",
									submittedCount,
									" of 3 reviews completed"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-500 leading-relaxed",
							children: "To safeguard anonymity and ensure balanced cross-functional perspectives, performance feedback text blocks remain protected until at least three distinct teammates submit their reviews."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-slate-500",
								children: "What to Continue"
							}), shuffledContinue.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-slate-700",
								children: item
							}, `continue-${idx}`))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-slate-500",
								children: "What to Stop"
							}), shuffledStop.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-slate-700",
								children: item
							}, `stop-${idx}`))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-slate-500",
								children: "What to Start"
							}), shuffledStart.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-slate-700",
								children: item
							}, `start-${idx}`))]
						})
					]
				})]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-5 space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold text-slate-900",
				children: "Teammate Requests"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-slate-500",
				children: "Complete incoming review requests to support your peers."
			})] }), isBootstrapping ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500",
				children: "Loading requests..."
			}) : incomingRequests.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySlate, { message: "Your request queue is clear. Teammates' feedback invitations will appear here." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: incomingRequests.map((request) => {
					const expanded = expandedIncomingId === request.id;
					const currentForm = formState[request.id] ?? {
						continueText: "",
						stopText: "",
						startText: "",
						vector: "meeting_expectations"
					};
					const canSubmit = currentForm.continueText.trim().length > 0 && currentForm.stopText.trim().length > 0 && currentForm.startText.trim().length > 0;
					const requesterName = request.profiles?.full_name || "Teammate";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-slate-200 bg-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700",
									children: initialsFor(requesterName)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm font-semibold text-slate-900",
									children: [requesterName, " requested your performance feedback for their quarter review."]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setExpandedIncomingId((previous) => previous === request.id ? null : request.id),
								className: "inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-indigo-500",
								children: ["Complete Review (Takes 4m)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
									size: 14,
									className: `ml-2 transition-transform ${expanded ? "rotate-180" : ""}`
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
							initial: false,
							children: expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								initial: {
									height: 0,
									opacity: 0
								},
								animate: {
									height: "auto",
									opacity: 1
								},
								exit: {
									height: 0,
									opacity: 0
								},
								className: "overflow-hidden border-t border-slate-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 px-4 py-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold text-slate-600",
												children: "What does this person do exceptionally well that they should CONTINUE doing?"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: currentForm.continueText,
												onChange: (event) => setFormState((previous) => ({
													...previous,
													[request.id]: {
														...currentForm,
														continueText: event.target.value
													}
												})),
												rows: 4,
												className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold text-slate-600",
												children: "What should this person STOP doing or adjust to reduce team friction?"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: currentForm.stopText,
												onChange: (event) => setFormState((previous) => ({
													...previous,
													[request.id]: {
														...currentForm,
														stopText: event.target.value
													}
												})),
												rows: 4,
												className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold text-slate-600",
												children: "What is one concrete skill or focus area they should START learning next?"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												value: currentForm.startText,
												onChange: (event) => setFormState((previous) => ({
													...previous,
													[request.id]: {
														...currentForm,
														startText: event.target.value
													}
												})),
												rows: 4,
												className: "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold text-slate-600",
												children: "Workspace Execution Vector"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
												value: currentForm.vector,
												onChange: (event) => setFormState((previous) => ({
													...previous,
													[request.id]: {
														...currentForm,
														vector: event.target.value
													}
												})),
												children: EXECUTION_VECTOR_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: option.value,
													children: option.label
												}, option.value))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex justify-end pt-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
												type: "button",
												onClick: () => void handleSubmitEvaluation(request),
												disabled: !canSubmit || isSubmittingEvaluation,
												className: "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60",
												style: { background: C.green },
												children: [isSubmittingEvaluation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
													size: 14,
													className: "animate-spin"
												}) : null, "Submit Evaluation"]
											})
										})
									]
								})
							})
						})]
					}, request.id);
				})
			})]
		})]
	});
}
function TableHeadCell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: "px-4 py-3 font-semibold",
		children
	});
}
function TableCell({ children, className = "", style }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: `px-4 py-3 align-middle ${className}`.trim(),
		style,
		children
	});
}
function AssessmentsArchiveTable({ assessments, onOpen, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-0 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-5 border-b",
			style: { borderColor: C.border },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-bold tracking-tight",
				style: { color: C.navy },
				children: "Assessment Archive"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs mt-1",
				style: { color: C.subtle },
				children: "All historical performance assessments. Click a row to open the full report."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					style: {
						background: "#F4F5F7",
						color: C.subtle
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-left text-[11px] uppercase tracking-wider",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeadCell, { children: "Review Period" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeadCell, { children: "Date Completed" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeadCell, { children: "Manager" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeadCell, { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeadCell, { children: "Overall Readiness" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeadCell, { children: "Actions" })
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [assessments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { color: C.subtle },
						children: "No assessments yet."
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: " " }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: " " }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: " " }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: " " }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: " " })
				] }), assessments.map((assessment) => {
					const date = formatDisplayDate(assessment.dateCompleted);
					const statusTone = assessment.status === "Finalized" ? "success" : assessment.status === "Draft" ? "warning" : "info";
					const pct = assessment.overallReadinessScore;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						onClick: () => onOpen(assessment),
						className: "border-t hover:bg-[#FAFBFC] transition-colors cursor-pointer",
						style: { borderColor: C.border },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "font-semibold",
								style: { color: C.navy },
								children: [assessment.reviewPeriod, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-normal",
									style: { color: C.subtle },
									children: assessment.id
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								style: { color: C.slate },
								children: date
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								style: { color: C.slate },
								children: assessment.managerName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: statusTone,
								children: assessment.status
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 min-w-[180px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex-1 h-1.5 rounded-full overflow-hidden",
									style: { background: "#EBECF0" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full",
										style: {
											width: `${pct}%`,
											background: pct >= 75 ? C.green : C.primary
										}
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-bold tabular-nums",
									style: { color: C.navy },
									children: [pct, "%"]
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end gap-1",
								children: [
									assessment.status === "Finalized" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: (event) => {
											event.stopPropagation();
											triggerAssessmentPdfDownload(assessment);
										},
										className: "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border hover:border-[#0052CC] transition-colors",
										style: {
											borderColor: C.border,
											color: C.primary
										},
										"aria-label": `Download ${assessment.reviewPeriod} PDF`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 12 }), "Download PDF"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: (event) => {
											event.stopPropagation();
											onDelete(assessment.id);
										},
										className: "inline-flex items-center justify-center w-7 h-7 rounded hover:bg-[#FFEBE6]",
										style: { color: C.red },
										"aria-label": `Delete assessment ${assessment.reviewPeriod}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 14 })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-flex items-center justify-center w-7 h-7 rounded hover:bg-[#F4F5F7]",
										style: { color: C.subtle },
										"aria-label": "Open report",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 16 })
									})
								]
							}) })
						]
					}, assessment.id);
				})] })]
			})
		})]
	});
}
function AssessmentHistoryModal({ assessments, currentId, onDelete, onClose, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		className: "fixed inset-0 z-50 flex items-center justify-center p-6",
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		style: { background: "rgba(9, 30, 66, 0.54)" },
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				y: 12,
				opacity: 0
			},
			animate: {
				y: 0,
				opacity: 1
			},
			exit: {
				y: 12,
				opacity: 0
			},
			className: "w-full max-w-lg bg-white rounded-md shadow-xl border",
			style: { borderColor: C.border },
			onClick: (event) => event.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 h-14 flex items-center justify-between border-b",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-bold tracking-tight",
							style: { color: C.navy },
							children: "Assessment History"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "w-8 h-8 rounded flex items-center justify-center hover:bg-[#F4F5F7]",
						style: { color: C.subtle },
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 space-y-2 max-h-[60vh] overflow-y-auto",
					children: [assessments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-center py-8",
						style: { color: C.subtle },
						children: "No assessments yet. Finalize a performance review to start the log."
					}), assessments.map((assessment) => {
						const isCurrent = assessment.id === currentId;
						const date = formatDisplayDate(assessment.dateCompleted);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onClick: () => onOpen(assessment),
							onKeyDown: (event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									onOpen(assessment);
								}
							},
							role: "button",
							tabIndex: 0,
							className: "w-full text-left p-3 rounded border hover:border-[#0052CC] hover:bg-[#F4F5F7] transition-colors",
							style: {
								borderColor: isCurrent ? C.primary : C.border,
								background: isCurrent ? C.primarySoft : "#FAFBFC"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-bold",
									style: { color: C.navy },
									children: assessment.reviewPeriod
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [
										isCurrent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: "info",
											children: "Current"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: assessment.status === "Finalized" ? "success" : "warning",
											children: assessment.status
										}),
										assessment.status === "Finalized" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: (event) => {
												event.stopPropagation();
												triggerAssessmentPdfDownload(assessment);
											},
											className: "inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border hover:border-[#0052CC]",
											style: {
												borderColor: C.border,
												color: C.primary
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 11 }), "PDF"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: (event) => {
												event.stopPropagation();
												onDelete(assessment.id);
											},
											className: "inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[#FFEBE6]",
											style: { color: C.red },
											"aria-label": `Delete assessment ${assessment.reviewPeriod}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 12 })
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mt-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs",
									style: { color: C.subtle },
									children: [
										date,
										" · ",
										assessment.id,
										" · Mgr ",
										assessment.managerName
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs font-bold",
									style: { color: C.primary },
									children: [assessment.overallReadinessScore, "% readiness"]
								})]
							})]
						}, assessment.id);
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 h-14 flex items-center justify-end border-t",
					style: { borderColor: C.border },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						onClick: onClose,
						children: "Close"
					})
				})
			]
		})
	});
}
function buildReportDeltas(review) {
	if (!review) return [];
	return Object.entries(review.scores).map(([cat, subs]) => {
		const entries = Object.values(subs);
		if (entries.length === 0) return null;
		return {
			name: cat,
			from: +(entries.reduce((sum, question) => sum + question.prev, 0) / entries.length).toFixed(2),
			to: +(entries.reduce((sum, question) => sum + question.next, 0) / entries.length).toFixed(2)
		};
	}).filter((delta) => Boolean(delta) && delta.to !== delta.from);
}
function buildReportJustification(review) {
	if (!review) return [];
	const out = [];
	Object.entries(review.scores).forEach(([cat, subs]) => {
		Object.entries(subs).forEach(([sub, question]) => {
			if (question.next !== question.prev && question.notes.trim().length > 0) out.push({
				cat,
				sub,
				q: question
			});
		});
	});
	return out;
}
function buildHighlightedEvidence(review, evidence) {
	if (!review) return [];
	const ids = /* @__PURE__ */ new Set();
	Object.values(review.scores).forEach((subs) => Object.values(subs).forEach((question) => question.evidenceIds.forEach((id) => ids.add(id))));
	return evidence.filter((item) => ids.has(item.id)).slice(0, 3);
}
function computeOverallReadiness(review) {
	if (!review) return null;
	const allQuestions = Object.values(review.scores).flatMap((scoreMap) => Object.values(scoreMap));
	if (allQuestions.length === 0) return null;
	const avg = allQuestions.reduce((sum, question) => sum + question.next, 0) / allQuestions.length;
	return Math.round(avg / 4 * 100);
}
function buildCategoryPerformance(args) {
	const { review, categoriesForSummary, approvedEvidence } = args;
	if (!review) return [];
	return categoriesForSummary.map((categoryName) => {
		const rows = Object.values(review.scores[categoryName] ?? {});
		return {
			name: categoryName,
			avgScore: rows.length > 0 ? +(rows.reduce((sum, row) => sum + row.next, 0) / rows.length).toFixed(2) : 0,
			evidenceCount: approvedEvidence.filter((record) => {
				return (resolveCategoryFromFramework(record.category ?? "", categoriesForSummary) ?? resolveCategoryFromFramework(record.competency ?? "", categoriesForSummary)) === categoryName;
			}).length
		};
	}).sort((a, b) => {
		if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
		if (b.evidenceCount !== a.evidenceCount) return b.evidenceCount - a.evidenceCount;
		return a.name.localeCompare(b.name);
	});
}
function formatCategoryNames(names, fallback) {
	if (names.length === 0) return fallback;
	if (names.length === 1) return names[0];
	if (names.length === 2) return `${names[0]} and ${names[1]}`;
	return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}
function ReportView({ evidence, objectives, radarData: _radarData, onFlash, review, assessments, historyAssessments, selectedEngineerId: _selectedEngineerId, onOpenAssessment, onSaveTopics, onDeleteHistoryAssessment, onClearReview, onStartReview, onOpenHistory }) {
	const { categories, getQuestionsForCategory } = useFramework();
	const frameworkCategoryMap = (0, import_react.useMemo)(() => buildFrameworkCategoryMapFromContext(categories, getQuestionsForCategory), [categories, getQuestionsForCategory]);
	const categoryEntries = (0, import_react.useMemo)(() => Object.entries(frameworkCategoryMap), [frameworkCategoryMap]);
	const frameworkCategoryNames = (0, import_react.useMemo)(() => categoryEntries.map(([categoryName]) => categoryName), [categoryEntries]);
	const approved = evidence.filter((e) => e.status === "Reviewed" && !e.isArchived);
	const completed = objectives.filter((o) => o.status === "Completed");
	const upcoming = objectives.filter((o) => o.status !== "Completed");
	const deltas = (0, import_react.useMemo)(() => buildReportDeltas(review), [review]);
	const justification = (0, import_react.useMemo)(() => buildReportJustification(review), [review]);
	const highlightedEvidence = (0, import_react.useMemo)(() => buildHighlightedEvidence(review, evidence), [review, evidence]);
	const overallReadiness = (0, import_react.useMemo)(() => computeOverallReadiness(review), [review]);
	const reportManagerName = review?.manager?.trim() ?? "";
	const categoriesForSummary = frameworkCategoryNames.length ? frameworkCategoryNames : Object.keys(review?.scores ?? {});
	const categoryPerformance = (0, import_react.useMemo)(() => buildCategoryPerformance({
		review,
		categoriesForSummary,
		approvedEvidence: approved
	}), [
		approved,
		categoriesForSummary,
		review
	]);
	const topStrengthCategories = (0, import_react.useMemo)(() => categoryPerformance.slice(0, 2).map((row) => row.name), [categoryPerformance]);
	const lowestOpportunityCategories = (0, import_react.useMemo)(() => [...categoryPerformance].reverse().slice(0, 1).map((row) => row.name), [categoryPerformance]);
	const [topics, setTopics] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [topicsDirty, setTopicsDirty] = (0, import_react.useState)(false);
	const isPersistedAssessment = (0, import_react.useMemo)(() => review ? assessments.some((item) => item.id === review.id) : false, [assessments, review]);
	(0, import_react.useEffect)(() => {
		if (!review) return;
		setTopics(assessments.find((a) => a.id === review.id)?.oneOnOneTopics ?? []);
		setTopicsDirty(false);
	}, [review, assessments]);
	const [resources, setResources] = (0, import_react.useState)([]);
	const [resourceModalOpen, setResourceModalOpen] = (0, import_react.useState)(false);
	function addTopic() {
		const t = draft.trim();
		if (!t) return;
		setTopics((x) => [...x, t]);
		setTopicsDirty(true);
		setDraft("");
	}
	function removeTopic(i) {
		setTopics((x) => x.filter((_, idx) => idx !== i));
		setTopicsDirty(true);
	}
	function copyLink() {
		if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(window.location.href + "?report=q3-2026").catch(() => {});
		onFlash("Share link copied to clipboard");
	}
	if (!review) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between print-hide",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm",
					style: { color: C.subtle },
					children: "Archive of all performance assessments. Click any row to load its full report."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
						onClick: onOpenHistory,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { size: 14 }), "Open in modal"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
						onClick: onStartReview,
						className: "!px-6 !h-10 whitespace-nowrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { size: 14 }), "Start Performance Review"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssessmentsArchiveTable, {
				assessments: historyAssessments,
				onOpen: onOpenAssessment,
				onDelete: onDeleteHistoryAssessment
			}),
			historyAssessments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-10 text-center max-w-2xl mx-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4",
						style: {
							background: C.primarySoft,
							color: C.primary
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { size: 26 })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-bold tracking-tight",
						style: { color: C.navy },
						children: "No finalized performance review yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed",
						style: { color: C.slate },
						children: "Click \"Start Performance Review\" above to launch the wizard. Once finalized, this page auto-generates a shareable summary with the competency delta, justification notes, highlighted evidence, and a 1-on-1 talking points checklist."
					})
				]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-6 print-hide gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
				onClick: onClearReview,
				className: "-ml-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 14 }), "Back to Assessments Archive"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
				onClick: onStartReview,
				className: "!px-6 !h-10 whitespace-nowrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { size: 14 }), "Start Performance Review"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "max-w-4xl mx-auto bg-white border rounded shadow-md p-10 print-document print:w-full print:m-0 print:p-0 print:text-slate-900 print:border-slate-200",
			style: { borderColor: C.border },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "print:break-inside-avoid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4 mb-2 flex-wrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-8 h-8 rounded flex items-center justify-center shrink-0",
									style: { background: C.primary },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
										size: 18,
										color: "#fff"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-3xl font-bold tracking-tight",
									style: { color: C.navy },
									children: review.period
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 print-hide",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
									onClick: copyLink,
									className: "border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, { size: 14 }), "Copy Share Link"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
									onClick: () => window.print(),
									className: "border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 14 }), "Export to PDF"]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold mb-1",
							style: { color: C.subtle },
							children: "Evitrace Performance Report"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 space-y-1 text-sm",
							style: { color: C.slate },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									"Engineer: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: C.navy,
											fontWeight: 600
										},
										children: review.engineer
									}),
									"  |  ",
									"Role: L3 Engineer",
									"  |  ",
									"Target: L4 Senior Engineer"
								] }),
								reportManagerName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Manager: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										color: C.navy,
										fontWeight: 600
									},
									children: reportManagerName
								})] }) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, {
											size: 14,
											style: { color: C.subtle }
										}),
										"Period: ",
										review.period,
										" · Finalized ",
										review.date
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 border-t",
							style: { borderColor: C.border }
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8 print:break-inside-avoid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { size: 18 }),
						title: "Executive Summary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-[15px] leading-relaxed",
						style: { color: C.slate },
						children: [
							"Based on your logged milestones, your core operational strengths are demonstrated within",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: C.navy,
									fontWeight: 600
								},
								children: formatCategoryNames(topStrengthCategories, formatCategoryNames(categoriesForSummary.slice(0, 2), "your active framework"))
							}),
							", while your primary expansion opportunities sit within",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: C.navy,
									fontWeight: 600
								},
								children: formatCategoryNames(lowestOpportunityCategories, formatCategoryNames(categoriesForSummary.slice(-1), "the current framework baseline"))
							}),
							". Current readiness remains",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									color: C.primary,
									fontWeight: 700
								},
								children: [overallReadiness ?? 0, "%"]
							}),
							" with",
							" ",
							approved.length,
							" verified evidence item",
							approved.length === 1 ? "" : "s",
							"."
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-10 print:break-inside-avoid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { size: 18 }),
						title: "Competency Delta"
					}), deltas.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 text-sm p-4 rounded border border-dashed",
						style: {
							color: C.subtle,
							borderColor: C.border
						},
						children: "No score changes were recorded in this review."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 print:break-inside-avoid",
						children: deltas.map((d) => {
							const pct = d.from === 0 ? 0 : Math.round((d.to - d.from) / d.from * 100);
							const width = Math.min(100, d.to / 4 * 100);
							const positive = d.to >= d.from;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "print:break-inside-avoid",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between mb-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-semibold",
										style: { color: C.navy },
										children: d.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs font-medium",
										style: { color: C.slate },
										children: [
											d.from.toFixed(2),
											" → ",
											d.to.toFixed(2),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													color: positive ? C.green : C.red,
													fontWeight: 700
												},
												children: [
													positive ? "+" : "",
													pct,
													"%"
												]
											})
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-2 rounded-full overflow-hidden",
									style: { background: "#EBECF0" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full",
										style: {
											width: `${width}%`,
											background: positive ? C.green : C.red
										}
									})
								})]
							}, d.name);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-10 print:break-inside-avoid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { size: 18 }),
						title: "Framework Category Summary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid grid-cols-1 gap-4",
						children: categoriesForSummary.map((categoryName) => {
							const categoryScores = Object.values(review.scores[categoryName] ?? {});
							const avgCurrent = categoryScores.length > 0 ? +(categoryScores.reduce((sum, score) => sum + score.next, 0) / categoryScores.length).toFixed(2) : 1;
							const mappedEvidence = approved.filter((record) => {
								return (resolveCategoryFromFramework(record.category ?? "", categoriesForSummary) ?? resolveCategoryFromFramework(record.competency ?? "", categoriesForSummary)) === categoryName;
							});
							const expectationCount = frameworkCategoryMap[categoryName]?.items.length ?? 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded border p-4",
								style: { borderColor: C.border },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-semibold",
										style: { color: C.navy },
										children: categoryName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs mt-1",
										style: { color: C.subtle },
										children: frameworkCategoryMap[categoryName]?.summary || "No summary provided."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs mt-2",
										style: { color: C.slate },
										children: [
											"Avg Score: ",
											avgCurrent.toFixed(2),
											" / 5 · Evidence Logged: ",
											mappedEvidence.length,
											" · Rubric Items: ",
											expectationCount
										]
									})
								]
							}, categoryName);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-10 print:break-before-page print:break-inside-avoid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignStart, { size: 18 }),
						title: "Justification Notes Log"
					}), justification.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 text-sm p-4 rounded border border-dashed",
						style: {
							color: C.subtle,
							borderColor: C.border
						},
						children: "No justification notes were attached to changed scores."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: justification.map(({ cat, sub, q }, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "p-4 rounded border print:break-inside-avoid",
							style: {
								borderColor: C.border,
								background: "#FFFFFF"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 flex-wrap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: "info",
										children: cat
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold",
										style: { color: C.navy },
										children: sub
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs",
										style: { color: C.subtle },
										children: [
											q.prev,
											" → ",
											q.next
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed",
								style: { color: C.slate },
								children: q.notes
							})]
						}, i))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-10 print:break-inside-avoid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { size: 18 }),
						title: "Highlighted Evidence"
					}), highlightedEvidence.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 text-sm p-4 rounded border border-dashed",
						style: {
							color: C.subtle,
							borderColor: C.border
						},
						children: "No evidence was attached during the review."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-3",
						children: highlightedEvidence.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-l-4 pl-4 py-3 pr-4 rounded-sm print:break-inside-avoid",
							style: {
								borderColor: C.primary,
								background: "#FAFBFC"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[15px] font-bold",
										style: { color: C.navy },
										children: e.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: "info",
										children: e.competency
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-sm leading-relaxed",
									style: { color: C.slate },
									children: e.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-center gap-1.5 text-xs font-medium",
									style: { color: "#006644" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { size: 13 }),
										"Verified on ",
										formatDisplayDate(e.date)
									]
								})
							]
						}, e.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-10 print:break-inside-avoid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { size: 18 }),
								title: "Suggested Learning Resources"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
								onClick: () => setResourceModalOpen(true),
								className: "border print-hide",
								style: { borderColor: C.border },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), "Add Learning Resource"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm",
							style: { color: C.subtle },
							children: "Resources curated by the manager to address competencies rated below target."
						}),
						resources.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 text-sm p-4 rounded border border-dashed",
							style: {
								color: C.subtle,
								borderColor: C.border
							},
							children: "No learning resources added yet. Click \"Add Learning Resource\" to curate materials for the engineer."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-3",
							children: resources.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "p-4 rounded border flex items-start justify-between gap-4 print:break-inside-avoid",
								style: {
									borderColor: C.border,
									background: "#FFFFFF"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap h-fit",
											style: {
												background: C.primarySoft,
												color: C.primary
											},
											children: r.competency
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 text-[15px] font-bold text-slate-900",
											children: r.title
										}),
										r.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 text-sm text-slate-500 leading-relaxed",
											children: r.notes
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1 shrink-0 print-hide",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => window.open(r.url, "_blank"),
										className: "inline-flex items-center gap-1.5 px-3 h-9 text-sm font-semibold rounded border transition-colors hover:bg-[#F4F5F7]",
										style: {
											borderColor: C.primary,
											color: C.primary
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 14 }), "Open Resource"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setResources((rs) => rs.filter((x) => x.id !== r.id)),
										"aria-label": "Remove resource",
										className: "w-9 h-9 inline-flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-[#F4F5F7] transition-colors",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 16 })
									})]
								})]
							}, r.id))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-10 print:break-inside-avoid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTodo, { size: 18 }),
						title: "Active Objectives"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-1 md:grid-cols-2 gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveColumn, {
							label: "Completed This Period",
							tone: "success",
							items: completed,
							emptyText: "No objectives completed this period."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveColumn, {
							label: "Focus for Next Period",
							tone: "info",
							items: upcoming,
							emptyText: "No active objectives planned."
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-10 print:break-inside-avoid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { size: 18 }),
						title: "1-on-1 Discussion Topics"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 p-5 rounded border print:break-inside-avoid",
						style: {
							background: C.bg,
							borderColor: C.border
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "space-y-2.5",
								children: topics.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "group flex items-start gap-3 text-sm print:break-inside-avoid",
									style: { color: C.slate },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center",
											style: {
												background: C.primarySoft,
												color: C.primary
											},
											children: i + 1
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "leading-relaxed flex-1",
											children: t
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => removeTopic(i),
											className: "opacity-0 group-hover:opacity-100 transition-opacity",
											style: { color: C.subtle },
											"aria-label": "Remove topic",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 14 })
										})
									]
								}, i))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: draft,
										onChange: (e) => setDraft(e.target.value),
										onKeyDown: (e) => {
											if (e.key === "Enter") addTopic();
										},
										placeholder: "Add a discussion topic...",
										className: "flex-1 h-9 px-3 text-sm rounded border bg-white focus:outline-none",
										style: {
											borderColor: C.border,
											color: C.navy
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
										onClick: addTopic,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), "Add Topic"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
										disabled: !topicsDirty || !isPersistedAssessment,
										onClick: () => {
											if (!review || !isPersistedAssessment) return;
											onSaveTopics(review.id, topics);
											setTopicsDirty(false);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 14 }), "Save Topics"]
									})
								]
							}),
							!isPersistedAssessment && review && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 text-xs",
								style: { color: C.subtle },
								children: "Sample assessments are read-only. Finalize a live assessment to persist 1-on-1 topics."
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
					className: "mt-10 pt-6 border-t text-xs flex items-center justify-between",
					style: {
						borderColor: C.border,
						color: C.subtle
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Generated by Evitrace · Confidential" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Report ID · ", review.id] })]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: resourceModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LearningResourceModal, {
			competencies: categoriesForSummary,
			onCancel: () => setResourceModalOpen(false),
			onSave: (r) => {
				setResources((rs) => [...rs, {
					...r,
					id: `lr-${Date.now()}`
				}]);
				setResourceModalOpen(false);
				onFlash("Learning resource added");
			}
		}) })
	] });
}
function LearningResourceModal({ competencies, onCancel, onSave }) {
	const { categories: frameworkCategories } = useFramework();
	const options = competencies.length > 0 ? competencies : frameworkCategories.length > 0 ? frameworkCategories : [];
	const [competency, setCompetency] = (0, import_react.useState)(options[0] ?? "");
	const [title, setTitle] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const canSave = title.trim() && url.trim() && competency;
	(0, import_react.useEffect)(() => {
		if (!options.includes(competency)) setCompetency(options[0] ?? "");
	}, [competency, options]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-6",
		style: {
			background: "rgba(9, 30, 66, 0.54)",
			backdropFilter: "blur(2px)"
		},
		onClick: onCancel,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white rounded-lg shadow-2xl w-full max-w-lg border",
			style: { borderColor: C.border },
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 border-b",
					style: { borderColor: C.border },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-base font-bold",
						style: { color: C.navy },
						children: "Add Learning Resource"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm mt-1",
						style: { color: C.slate },
						children: "Curate a resource to help close the gap on a target competency."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-semibold uppercase tracking-wide",
							style: { color: C.subtle },
							children: "Target Competency"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: competency,
							onChange: (e) => setCompetency(e.target.value),
							className: "mt-1.5 w-full h-10 px-3 text-sm rounded border bg-white focus:outline-none",
							style: {
								borderColor: C.border,
								color: C.navy
							},
							children: options.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c,
								children: c
							}, c))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-semibold uppercase tracking-wide",
							style: { color: C.subtle },
							children: "Resource Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: title,
							onChange: (e) => setTitle(e.target.value),
							placeholder: "e.g. Designing Data-Intensive Applications",
							className: "mt-1.5 w-full h-10 px-3 text-sm rounded border bg-white focus:outline-none",
							style: {
								borderColor: C.border,
								color: C.navy
							}
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-semibold uppercase tracking-wide",
							style: { color: C.subtle },
							children: "Resource URL"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: url,
							onChange: (e) => setUrl(e.target.value),
							placeholder: "https://...",
							className: "mt-1.5 w-full h-10 px-3 text-sm rounded border bg-white focus:outline-none",
							style: {
								borderColor: C.border,
								color: C.navy
							}
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-semibold uppercase tracking-wide",
							style: { color: C.subtle },
							children: "Manager Notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							placeholder: "Why this resource, and what to focus on...",
							className: "mt-1.5 w-full min-h-[150px] resize-y rounded border bg-white p-3 text-sm leading-relaxed outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
							style: {
								borderColor: C.border,
								color: C.navy
							}
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-3 border-t flex items-center justify-end gap-2",
					style: {
						borderColor: C.border,
						background: C.bg
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						onClick: onCancel,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => canSave && onSave({
							competency,
							title: title.trim(),
							url: url.trim(),
							notes: notes.trim()
						}),
						disabled: !canSave,
						className: "px-4 h-9 rounded text-sm font-semibold text-white transition-colors disabled:opacity-50",
						style: { background: C.primary },
						children: "Save Resource"
					})]
				})
			]
		})
	});
}
function SectionHeading({ icon, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			style: { color: C.primary },
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-bold tracking-tight",
			style: { color: C.navy },
			children: title
		})]
	});
}
function ObjectiveColumn({ label, tone, items, emptyText }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-[11px] font-bold uppercase tracking-wider mb-2",
		style: { color: C.subtle },
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm p-3 rounded border border-dashed",
			style: {
				color: C.subtle,
				borderColor: C.border
			},
			children: emptyText
		}), items.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-3 rounded border print:break-inside-avoid",
			style: {
				borderColor: C.border,
				background: "#FFFFFF"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold leading-snug",
					style: { color: C.navy },
					children: o.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap h-fit shrink-0",
					style: {
						background: tone === "success" ? C.greenSoft : C.primarySoft,
						color: tone === "success" ? "#006644" : C.primary
					},
					children: o.status
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1.5 flex items-center gap-3 text-xs",
				style: { color: C.subtle },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { size: 12 }), o.competency]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 12 }),
						"Due ",
						o.due
					]
				})]
			})]
		}, o.id))]
	})] });
}
var MANAGER_ENGINEER_LAST_TAB_STORAGE_KEY = "evitrace.manager.engineerLastTab";
var MANAGER_ENGINEER_ALLOWED_TABS = [
	"evidence",
	"objectives",
	"radar",
	"report"
];
function readManagerEngineerLastTabMap() {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.sessionStorage.getItem(MANAGER_ENGINEER_LAST_TAB_STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		const normalized = {};
		Object.entries(parsed).forEach(([engineerId, maybeTab]) => {
			if (typeof engineerId === "string" && MANAGER_ENGINEER_ALLOWED_TABS.includes(maybeTab)) normalized[engineerId] = maybeTab;
		});
		return normalized;
	} catch {
		return {};
	}
}
function writeManagerEngineerLastTabMap(map) {
	if (typeof window === "undefined") return;
	window.sessionStorage.setItem(MANAGER_ENGINEER_LAST_TAB_STORAGE_KEY, JSON.stringify(map));
}
function HomeRouteApp({ activeTab, activeSettingsSection = "profile", openCaptureOnLoad = false, routedEngineerId = null }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeAuthApp, { EvitraceApp: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvitraceApp, {
		activeTab,
		activeSettingsSection,
		openCaptureOnLoad,
		routedEngineerId
	}) }) });
}
function EvitraceApp({ activeTab, activeSettingsSection, openCaptureOnLoad, routedEngineerId }) {
	const { user, userId: authUserId, signout } = useAuth();
	const { mode, isManagerAccount, selectedEngineerId: workspaceSelectedEngineerId, setSelectedEngineerId: setWorkspaceSelectedEngineerId, refreshWorkspace, loading: workspaceContextLoading } = useWorkspace();
	const { categories: frameworkCategories, currentFramework } = useFramework();
	const navigate = useNavigate();
	const userId = authUserId ?? "";
	const { managedEngineers, isLoadingManagedEngineers, activeView, setActiveView, managerRelationshipsRefreshNonce, setManagerRelationshipsRefreshNonce, handoverNotes, setHandoverNotes, isSigningOffTransfer, setIsSigningOffTransfer } = useManagerRelationships(userId);
	const isManagerMode = mode === "manager";
	const managerWorkspaceEnabled = mode === "manager" && isManagerAccount;
	const managedEngineersInScope = isManagerMode ? managedEngineers : [];
	const selectedEngineerId = isManagerMode ? workspaceSelectedEngineerId : null;
	const scopedRouteEngineerId = routedEngineerId?.trim() || null;
	const isManagerScopedToEngineer = managerWorkspaceEnabled && Boolean(selectedEngineerId);
	const reportSubjectEngineerId = managerWorkspaceEnabled && selectedEngineerId ? selectedEngineerId : userId;
	const assessmentWorkspaceUserId = reportSubjectEngineerId;
	(0, import_react.useEffect)(() => {
		if (!isManagerMode) setWorkspaceSelectedEngineerId(null);
	}, [isManagerMode, setWorkspaceSelectedEngineerId]);
	(0, import_react.useEffect)(() => {
		if (workspaceContextLoading) return;
		if (!isManagerMode) return;
		if (workspaceSelectedEngineerId === scopedRouteEngineerId) return;
		setWorkspaceSelectedEngineerId(scopedRouteEngineerId);
	}, [
		isManagerMode,
		scopedRouteEngineerId,
		setWorkspaceSelectedEngineerId,
		workspaceContextLoading,
		workspaceSelectedEngineerId
	]);
	(0, import_react.useEffect)(() => {
		if (!isManagerMode) return;
		if (scopedRouteEngineerId) {
			if (activeView !== "profile") setActiveView("profile");
			return;
		}
		if (activeView === "profile") setActiveView("directory");
	}, [
		activeView,
		isManagerMode,
		scopedRouteEngineerId,
		setActiveView
	]);
	const tab = activeTab;
	const settingsSection = activeSettingsSection;
	const getTabPathForCurrentScope = (0, import_react.useCallback)((nextTab) => getTabPath(nextTab, {
		mode: isManagerMode ? "manager" : "engineer",
		engineerId: selectedEngineerId
	}), [isManagerMode, selectedEngineerId]);
	const [sidebarCollapsed, setSidebarCollapsed] = (0, import_react.useState)(false);
	const [mobileSidebarOpen, setMobileSidebarOpen] = (0, import_react.useState)(false);
	const [managerProfileSubTab, setManagerProfileSubTab] = (0, import_react.useState)("tracking_workspace");
	const managerEngineerLastTabRef = (0, import_react.useRef)(readManagerEngineerLastTabMap());
	const [globalSearchQuery, setGlobalSearchQuery] = (0, import_react.useState)("");
	const hasProcessedPendingInviteRef = (0, import_react.useRef)(false);
	const { sampleContent, setSampleContent } = useHomeSampleContentVisibility();
	(0, import_react.useEffect)(() => {
		if (!managerWorkspaceEnabled) {
			setActiveView("profile");
			setManagerProfileSubTab("tracking_workspace");
			return;
		}
		if (selectedEngineerId && !managedEngineersInScope.some((engineer) => engineer.id === selectedEngineerId)) {
			setWorkspaceSelectedEngineerId(null);
			setActiveView("directory");
			return;
		}
		if (isLoadingManagedEngineers) return;
		if (managedEngineersInScope.length === 0) {
			setWorkspaceSelectedEngineerId(null);
			setManagerProfileSubTab("tracking_workspace");
		}
	}, [
		isLoadingManagedEngineers,
		selectedEngineerId,
		managedEngineersInScope.length,
		managedEngineersInScope,
		managerWorkspaceEnabled,
		setActiveView,
		setWorkspaceSelectedEngineerId
	]);
	(0, import_react.useEffect)(() => {
		if (!selectedEngineerId || activeView !== "profile") setManagerProfileSubTab("tracking_workspace");
	}, [activeView, selectedEngineerId]);
	(0, import_react.useEffect)(() => {
		if (!isManagerMode || !selectedEngineerId || activeView !== "profile") return;
		if (!MANAGER_ENGINEER_ALLOWED_TABS.includes(tab)) return;
		managerEngineerLastTabRef.current = {
			...managerEngineerLastTabRef.current,
			[selectedEngineerId]: tab
		};
		writeManagerEngineerLastTabMap(managerEngineerLastTabRef.current);
	}, [
		activeView,
		isManagerMode,
		selectedEngineerId,
		tab
	]);
	(0, import_react.useEffect)(() => {
		if (workspaceContextLoading || isLoadingManagedEngineers) return;
		if (mode === "engineer" && scopedRouteEngineerId) {
			navigate({
				to: getTabPath("dashboard"),
				replace: true
			});
			return;
		}
		if (mode === "manager") {
			if ((tab === "evidence" || tab === "objectives" || tab === "radar" || tab === "report" || tab === "knowledge") && !scopedRouteEngineerId) navigate({
				to: getTabPath("dashboard"),
				replace: true
			});
		}
	}, [
		isLoadingManagedEngineers,
		mode,
		navigate,
		scopedRouteEngineerId,
		tab,
		workspaceContextLoading
	]);
	(0, import_react.useEffect)(() => {
		if (!userId || hasProcessedPendingInviteRef.current || typeof window === "undefined") return;
		const storedHash = window.localStorage.getItem(PENDING_WORKSPACE_INVITE_HASH_KEY)?.trim();
		if (!storedHash) return;
		hasProcessedPendingInviteRef.current = true;
		async function acceptPendingWorkspaceInvite() {
			try {
				const { data, error } = await supabase.rpc("accept_manager_invite", {
					target_hash: storedHash,
					current_manager_id: userId
				});
				const response = Array.isArray(data) ? data[0] : data;
				if (error || response?.success === false) {
					toast.error(response?.message ?? error?.message ?? "Workspace connection linking transaction failed.");
					return;
				}
				toast.success(response?.message ?? "Teammate profile successfully added to your organization hierarchy.");
				await refreshWorkspace();
				setManagerRelationshipsRefreshNonce((prev) => prev + 1);
			} catch {
				toast.error("Network synchronization timeout during invite activation.");
			} finally {
				window.localStorage.removeItem(PENDING_WORKSPACE_INVITE_HASH_KEY);
			}
		}
		acceptPendingWorkspaceInvite();
	}, [
		refreshWorkspace,
		userId,
		setManagerRelationshipsRefreshNonce
	]);
	const { data: evidence = [] } = useEvidenceQuery(userId, { includeSamples: sampleContent.evidence });
	const { data: archivedEvidence = [] } = useEvidenceQuery(userId, { archived: true });
	const saveEvidenceMutation = useSaveEvidence(userId);
	const saveSelectedEngineerEvidenceMutation = useSaveEvidence(selectedEngineerId ?? "");
	const archiveEvidenceMutation = useArchiveEvidence(userId);
	const restoreEvidenceMutation = useRestoreEvidence(userId);
	const deleteEvidenceMutation = useDeleteEvidence(userId);
	const insertEvidenceMutation = useInsertEvidence(userId);
	const { data: inbox = [] } = useInboxQuery(userId);
	const approveInboxMutation = useApproveInbox(userId);
	const dismissInboxMutation = useDismissInbox(userId);
	const { data: objectives = [] } = useObjectivesQuery(userId, { includeSamples: sampleContent.objectives });
	const { data: archivedObjectives = [] } = useObjectivesQuery(userId, { archived: true });
	const createObjectiveMutation = useCreateObjective(userId);
	const moveObjectiveMutation = useMoveObjective(userId);
	const saveObjectiveMutation = useSaveObjective(userId);
	const moveSelectedEngineerObjectiveMutation = useMoveObjective(selectedEngineerId ?? "");
	const saveSelectedEngineerObjectiveMutation = useSaveObjective(selectedEngineerId ?? "");
	const archiveObjectiveMutation = useArchiveObjective(userId);
	const restoreObjectiveMutation = useRestoreObjective(userId);
	const deleteObjectiveMutation = useDeleteObjective(userId);
	const { data: assessments = [] } = useAssessmentsQuery(userId);
	const { data: selectedEngineerEvidence = [] } = useEvidenceQuery(selectedEngineerId ?? "", { includeSamples: false });
	const { data: selectedEngineerObjectives = [] } = useObjectivesQuery(selectedEngineerId ?? "", { includeSamples: false });
	const { data: selectedEngineerArchivedEvidence = [] } = useEvidenceQuery(selectedEngineerId ?? "", {
		includeSamples: false,
		archived: true
	});
	const { data: selectedEngineerArchivedObjectives = [] } = useObjectivesQuery(selectedEngineerId ?? "", {
		includeSamples: false,
		archived: true
	});
	const { data: selectedEngineerInbox = [] } = useInboxQuery(selectedEngineerId ?? "");
	const { data: selectedEngineerAssessments = [] } = useAssessmentsQuery(selectedEngineerId ?? "");
	const { data: managerTeamOverview = [], isLoading: isManagerTeamOverviewLoading, isError: isManagerTeamOverviewError } = useQuery({
		queryKey: [
			"manager-team-overview",
			userId,
			managerRelationshipsRefreshNonce
		],
		enabled: Boolean(userId) && managedEngineersInScope.length > 0,
		queryFn: async () => {
			const { data: sessionData } = await supabase.auth.getSession();
			const token = sessionData.session?.access_token;
			if (!token) throw new Error("Session expired. Please sign in again.");
			return await getManagerTeamOverview({ data: { token } });
		}
	});
	const { data: assessmentManagerName = "" } = useQuery({
		queryKey: [
			"assessment-manager-name",
			reportSubjectEngineerId,
			selectedEngineerId,
			managerWorkspaceEnabled
		],
		enabled: Boolean(reportSubjectEngineerId),
		queryFn: async () => {
			if (!reportSubjectEngineerId) return "";
			const { data, error } = await supabase.from("reporting_relationships").select("manager_id, profiles!manager_id(full_name)").eq("engineer_id", reportSubjectEngineerId).eq("relation_type", "direct_manager").in("status", ["active", "in_handover"]).limit(1).maybeSingle();
			if (error) return "";
			if (!(typeof data?.manager_id === "string" ? data.manager_id.trim() : "")) return "";
			const managerName = (Array.isArray(data?.profiles) ? data.profiles[0] : data?.profiles)?.full_name?.trim();
			if (typeof managerName === "string" && managerName.length > 0) return managerName;
			return "";
		}
	});
	const finalizeAssessmentMutation = useFinalizeAssessment(assessmentWorkspaceUserId);
	const deleteAssessmentMutation = useDeleteAssessment(assessmentWorkspaceUserId);
	const updateTopicsMutation = useUpdateOneOnOneTopics(assessmentWorkspaceUserId);
	const queryClient = useQueryClient();
	const { data: knowledgeRows = [] } = useQuery({
		queryKey: ["knowledge_items", userId],
		queryFn: async () => {
			if (!userId) return [];
			const { data, error } = await supabase.from("knowledge_items").select("*").eq("user_id", userId).order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		},
		enabled: Boolean(userId)
	});
	const { data: activeFrameworkMatrix = null } = useQuery({
		queryKey: ["active-framework-matrix", userId],
		enabled: Boolean(userId),
		queryFn: async () => {
			if (!userId) return null;
			const { data: profile, error: profileError } = await supabase.from("profiles").select("active_framework_id").eq("id", userId).maybeSingle();
			if (profileError) throw profileError;
			const activeFrameworkId = profile?.active_framework_id ?? null;
			if (activeFrameworkId) {
				const { data: activeFramework, error: activeFrameworkError } = await supabase.from("competency_frameworks").select("matrix").eq("id", activeFrameworkId).maybeSingle();
				if (activeFrameworkError) throw activeFrameworkError;
				if (activeFramework?.matrix) return activeFramework.matrix;
			}
			const { data: fallbackFramework, error: fallbackError } = await supabase.from("competency_frameworks").select("matrix").or(`is_system_default.eq.true,user_id.eq.${userId}`).order("is_system_default", { ascending: false }).order("created_at", { ascending: false }).limit(1).maybeSingle();
			if (fallbackError) throw fallbackError;
			return fallbackFramework?.matrix ?? null;
		}
	});
	const knowledgeQueryKey = ["knowledge_items", userId];
	const addKnowledgeMutation = useMutation({
		mutationFn: async (payload) => {
			const { error } = await supabase.from("knowledge_items").insert(payload);
			if (error) throw error;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: knowledgeQueryKey });
		}
	});
	const updateKnowledgeMutation = useMutation({
		mutationFn: async (payload) => {
			const { error } = await supabase.from("knowledge_items").update({
				title: payload.title,
				description: payload.description,
				reference_links: payload.reference_links
			}).eq("id", payload.id).eq("user_id", userId);
			if (error) throw error;
		},
		onMutate: async (payload) => {
			await queryClient.cancelQueries({ queryKey: knowledgeQueryKey });
			const previousRows = queryClient.getQueryData(knowledgeQueryKey) ?? [];
			queryClient.setQueryData(knowledgeQueryKey, (rows = []) => rows.map((row) => row.id === payload.id ? {
				...row,
				title: payload.title,
				description: payload.description,
				reference_links: payload.reference_links
			} : row));
			return { previousRows };
		},
		onError: (error, _payload, context) => {
			if (context?.previousRows) queryClient.setQueryData(knowledgeQueryKey, context.previousRows);
			toast.error(error.message || "Failed to update knowledge entry.");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: knowledgeQueryKey });
		}
	});
	const deleteKnowledgeMutation = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("knowledge_items").delete().eq("id", id).eq("user_id", userId);
			if (error) throw error;
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: knowledgeQueryKey });
			const previousRows = queryClient.getQueryData(knowledgeQueryKey) ?? [];
			queryClient.setQueryData(knowledgeQueryKey, (rows = []) => rows.filter((row) => row.id !== id));
			return { previousRows };
		},
		onError: (error, _id, context) => {
			if (context?.previousRows) queryClient.setQueryData(knowledgeQueryKey, context.previousRows);
			toast.error(error.message || "Failed to delete knowledge entry.");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: knowledgeQueryKey });
		}
	});
	const [sampleAssessments, setSampleAssessments] = (0, import_react.useState)(() => initialAssessments.slice(0, 3));
	const { wizardDraft, setWizardDraft } = useHomeAssessmentDraft(assessmentWorkspaceUserId);
	const historyAssessments = (0, import_react.useMemo)(() => {
		const merged = /* @__PURE__ */ new Map();
		assessments.forEach((assessment) => {
			merged.set(assessment.id, assessment);
		});
		sampleAssessments.forEach((assessment) => {
			if (!merged.has(assessment.id)) merged.set(assessment.id, assessment);
		});
		return Array.from(merged.values()).sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime());
	}, [assessments, sampleAssessments]);
	const radarData = (0, import_react.useMemo)(() => deriveRadarData(selectedEngineerId ? selectedEngineerAssessments[0] : assessments[0], frameworkCategories, currentFramework?.matrix ?? activeFrameworkMatrix), [
		selectedEngineerAssessments,
		selectedEngineerId,
		assessments,
		currentFramework?.matrix,
		frameworkCategories,
		activeFrameworkMatrix
	]);
	const [showCapture, setShowCapture] = (0, import_react.useState)(false);
	const [showCreateObjective, setShowCreateObjective] = (0, import_react.useState)(false);
	const [openObjective, setOpenObjective] = (0, import_react.useState)(null);
	const [openEvidence, setOpenEvidence] = (0, import_react.useState)(null);
	const [editingKnowledge, setEditingKnowledge] = (0, import_react.useState)(null);
	const [pendingKnowledgeDelete, setPendingKnowledgeDelete] = (0, import_react.useState)(null);
	const [openInbox, setOpenInbox] = (0, import_react.useState)(null);
	const [showWizard, setShowWizard] = (0, import_react.useState)(false);
	const [showHistory, setShowHistory] = (0, import_react.useState)(false);
	const [review, setReview] = (0, import_react.useState)(null);
	const [pendingAssessmentDeleteId, setPendingAssessmentDeleteId] = (0, import_react.useState)(null);
	const [showDiscardDraftConfirm, setShowDiscardDraftConfirm] = (0, import_react.useState)(false);
	const [dismissedSampleInboxIds, setDismissedSampleInboxIds] = (0, import_react.useState)([]);
	const [pinnedResources, setPinnedResources] = (0, import_react.useState)([]);
	const [newPinnedTitle, setNewPinnedTitle] = (0, import_react.useState)("");
	const [newPinnedUrl, setNewPinnedUrl] = (0, import_react.useState)("");
	const [isSubmittingPinnedResource, setIsSubmittingPinnedResource] = (0, import_react.useState)(false);
	const [isPinnedQuickAddOpen, setIsPinnedQuickAddOpen] = (0, import_react.useState)(false);
	const pinnedQuickAddPopoverRef = (0, import_react.useRef)(null);
	const pinnedQuickAddTriggerRef = (0, import_react.useRef)(null);
	const [focusedKnowledgeId, setFocusedKnowledgeId] = (0, import_react.useState)(null);
	useHomeCaptureOnLoad({
		openCaptureOnLoad,
		setShowCapture
	});
	const visibleEvidence = (0, import_react.useMemo)(() => sampleContent.evidence ? evidence : evidence.filter((item) => !item.isSample), [evidence, sampleContent.evidence]);
	const visibleArchivedEvidence = (0, import_react.useMemo)(() => sampleContent.evidence ? archivedEvidence : archivedEvidence.filter((item) => !item.isSample), [archivedEvidence, sampleContent.evidence]);
	const visibleObjectives = (0, import_react.useMemo)(() => sampleContent.objectives ? objectives : objectives.filter((item) => !item.isSample), [objectives, sampleContent.objectives]);
	const visibleArchivedObjectives = (0, import_react.useMemo)(() => sampleContent.objectives ? archivedObjectives : archivedObjectives.filter((item) => !item.isSample), [archivedObjectives, sampleContent.objectives]);
	const knowledgeItems = (0, import_react.useMemo)(() => knowledgeRows.map(parseKnowledgeItemRow).filter((item) => Boolean(item)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [knowledgeRows]);
	const globalSearchResults = (0, import_react.useMemo)(() => buildHomeGlobalSearchResults({
		query: globalSearchQuery,
		visibleObjectives,
		visibleEvidence,
		knowledgeItems
	}), [
		globalSearchQuery,
		knowledgeItems,
		visibleEvidence,
		visibleObjectives
	]);
	const { isManagerWorkspace, isManagerDirectoryView, activeWorkspaceId, notificationTargetUserId } = (0, import_react.useMemo)(() => deriveHomeWorkspaceScope({
		activeView,
		selectedEngineerId,
		managedEngineersCount: managedEngineersInScope.length,
		tab,
		userId
	}), [
		activeView,
		managedEngineersInScope.length,
		selectedEngineerId,
		tab,
		userId
	]);
	const contextEvidence = pickWorkspaceData({
		isManagerWorkspace,
		managerWorkspaceData: selectedEngineerEvidence,
		personalWorkspaceData: visibleEvidence
	});
	const contextArchivedEvidence = pickWorkspaceData({
		isManagerWorkspace,
		managerWorkspaceData: selectedEngineerArchivedEvidence,
		personalWorkspaceData: visibleArchivedEvidence
	});
	const contextObjectives = pickWorkspaceData({
		isManagerWorkspace,
		managerWorkspaceData: selectedEngineerObjectives,
		personalWorkspaceData: visibleObjectives
	});
	const contextArchivedObjectives = pickWorkspaceData({
		isManagerWorkspace,
		managerWorkspaceData: selectedEngineerArchivedObjectives,
		personalWorkspaceData: visibleArchivedObjectives
	});
	const contextInbox = pickWorkspaceData({
		isManagerWorkspace,
		managerWorkspaceData: selectedEngineerInbox,
		personalWorkspaceData: inbox
	});
	const contextAssessments = pickWorkspaceData({
		isManagerWorkspace,
		managerWorkspaceData: selectedEngineerAssessments,
		personalWorkspaceData: assessments
	});
	const contextHistoryAssessments = pickWorkspaceData({
		isManagerWorkspace,
		managerWorkspaceData: selectedEngineerAssessments,
		personalWorkspaceData: historyAssessments
	});
	const selectedEngineerRole = (0, import_react.useMemo)(() => getSelectedEngineerRole({
		selectedEngineerId,
		isManagerWorkspace,
		managedEngineers: managedEngineersInScope
	}), [
		isManagerWorkspace,
		managedEngineersInScope,
		selectedEngineerId
	]);
	const showTeamTransitionCard = (0, import_react.useMemo)(() => shouldShowTeamTransitionCard({
		selectedEngineerId,
		isManagerWorkspace,
		managedEngineers: managedEngineersInScope
	}), [
		isManagerWorkspace,
		managedEngineersInScope,
		selectedEngineerId
	]);
	const selectedManagedEngineer = (0, import_react.useMemo)(() => managedEngineersInScope.find((engineer) => engineer.id === selectedEngineerId) ?? null, [managedEngineersInScope, selectedEngineerId]);
	const reportSubjectEngineerName = (0, import_react.useMemo)(() => {
		if (managerWorkspaceEnabled && selectedManagedEngineer?.fullName?.trim()) return selectedManagedEngineer.fullName.trim();
		return user?.fullName?.trim() || user?.email || "Engineer";
	}, [
		managerWorkspaceEnabled,
		selectedManagedEngineer?.fullName,
		user?.email,
		user?.fullName
	]);
	const notifyManagerAssessmentReady = (0, import_react.useCallback)(async (engineerId, engineerName) => {
		const { data: relationships, error: relationshipError } = await supabase.from("reporting_relationships").select("manager_id").eq("engineer_id", engineerId).eq("relation_type", "direct_manager").in("status", ["active", "in_handover"]).limit(1);
		if (relationshipError) {
			console.error("[assessment-notification] unable to load manager relationship:", relationshipError);
			return;
		}
		const managerId = relationships?.[0]?.manager_id;
		if (!managerId) return;
		const { success } = await sendNotification({ data: {
			userId: managerId,
			type: "assessment",
			title: "Q3 assessment ready for review",
			description: `${engineerName} has finalized their readiness report and submitted it to your workspace.`
		} });
		if (!success) console.error("[assessment-notification] failed to send manager notification");
	}, []);
	useHomePinnedQuickAddDismiss({
		isPinnedQuickAddOpen,
		setIsPinnedQuickAddOpen,
		pinnedQuickAddPopoverRef,
		pinnedQuickAddTriggerRef
	});
	const visiblePinnedResources = (0, import_react.useMemo)(() => buildVisiblePinnedResources({
		activeWorkspaceId,
		pinnedResources,
		includeSamplePinnedResources: sampleContent.pinnedResources
	}), [
		activeWorkspaceId,
		pinnedResources,
		sampleContent.pinnedResources
	]);
	const { pinnedObjectiveIdToPinId, pinnedEvidenceIdToPinId, pinnedKnowledgeIdToPinId, pinnedObjectiveIds, pinnedEvidenceIds, pinnedKnowledgeIds } = (0, import_react.useMemo)(() => buildPinnedResourceLookups(pinnedResources), [pinnedResources]);
	function flash(msg) {
		toast.success(msg);
	}
	const { loadPinnedResources, handleUnpin, handlePinGenericResource, handleToggleObjectivePin, handleToggleEvidencePin, handleToggleKnowledgePin } = useHomePinnedResourcesActions({
		activeWorkspaceId,
		notificationTargetUserId,
		userId,
		pinnedResources,
		setPinnedResources,
		newPinnedTitle,
		setNewPinnedTitle,
		newPinnedUrl,
		setNewPinnedUrl,
		isSubmittingPinnedResource,
		setIsSubmittingPinnedResource,
		setIsPinnedQuickAddOpen,
		pinnedObjectiveIdToPinId,
		pinnedEvidenceIdToPinId,
		pinnedKnowledgeIdToPinId,
		onFlash: flash
	});
	const { approveInbox, dismissInbox } = useHomeInboxActions({
		userId,
		inbox,
		setDismissedSampleInboxIds,
		insertEvidenceMutation,
		approveInboxMutation,
		dismissInboxMutation,
		onFlash: flash
	});
	(0, import_react.useEffect)(() => {
		loadPinnedResources();
	}, [loadPinnedResources]);
	const handlePinnedResourceSelect = (0, import_react.useCallback)((pin) => {
		const knowledgeId = parsePinnedKnowledgeId(pin.url);
		if (knowledgeId) {
			setFocusedKnowledgeId(null);
			window.requestAnimationFrame(() => {
				setFocusedKnowledgeId(knowledgeId);
			});
			if (tab !== "knowledge") navigate({ to: getTabPathForCurrentScope("knowledge") });
			return;
		}
		if (pin.resource_type === "evidence" && pin.evidence_id) {
			const evidenceTarget = [...contextEvidence, ...contextArchivedEvidence].find((item) => item.id === pin.evidence_id);
			if (evidenceTarget) {
				setOpenEvidence(evidenceTarget);
				if (tab !== "evidence") navigate({ to: getTabPathForCurrentScope("evidence") });
				return;
			}
		}
		if (pin.resource_type === "objective" && pin.objective_id) {
			const objectiveTarget = [...contextObjectives, ...contextArchivedObjectives].find((item) => item.id === pin.objective_id);
			if (objectiveTarget) {
				setOpenObjective(objectiveTarget);
				if (tab !== "objectives") navigate({ to: getTabPathForCurrentScope("objectives") });
				return;
			}
		}
		if (isHttpUrl(pin.url)) {
			window.open(pin.url, "_blank", "noopener,noreferrer");
			return;
		}
		if (pin.resource_type === "evidence") {
			navigate({ to: getTabPathForCurrentScope("evidence") });
			return;
		}
		if (pin.resource_type === "objective") {
			navigate({ to: getTabPathForCurrentScope("objectives") });
			return;
		}
		navigate({ to: getTabPathForCurrentScope("knowledge") });
	}, [
		contextArchivedEvidence,
		contextArchivedObjectives,
		contextEvidence,
		contextObjectives,
		navigate,
		tab
	]);
	const showWorkspaceConnectionFallback = managerWorkspaceEnabled && !isLoadingManagedEngineers && managedEngineersInScope.length === 0 || isManagerDirectoryView && !isManagerTeamOverviewLoading && !isManagerTeamOverviewError && managerTeamOverview.length === 0;
	const showManagerProfileSubNavigation = managerWorkspaceEnabled && activeView === "profile" && Boolean(selectedEngineerId);
	const getManagerEngineerLandingTab = (0, import_react.useCallback)((engineerId) => managerEngineerLastTabRef.current[engineerId] ?? "evidence", []);
	async function handleSignOutForWorkspaceReset() {
		await signout();
		sessionStorage.removeItem(MANAGER_ONBOARDING_CONTEXT_KEY);
		window.location.assign("/");
	}
	const { handleTabChange, handleSettingsSectionChange, handleGlobalSearchSelect } = useHomeNavigationActions({
		navigate,
		settingsSection,
		setMobileSidebarOpen,
		setGlobalSearchQuery,
		getTabPathForCurrentScope
	});
	const { requestAssessmentDelete, executeAssessmentDelete, clearAssessmentWizardDraft } = useHomeAssessmentActions({
		userId: assessmentWorkspaceUserId,
		sampleAssessments,
		setSampleAssessments,
		review,
		setReview,
		setWizardDraft,
		setPendingAssessmentDeleteId,
		deleteAssessmentMutation,
		onFlash: flash
	});
	function archiveObjectiveById(id) {
		archiveObjectiveMutation.mutate(id, { onSuccess: () => flash("Objective archived") });
	}
	if (workspaceContextLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center bg-slate-50",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-36 rounded-md bg-slate-200 animate-pulse" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		style: {
			background: C.bg,
			color: C.navy,
			fontFamily: "Inter, system-ui, sans-serif"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
				tab,
				setTab: handleTabChange,
				collapsed: sidebarCollapsed,
				onToggleCollapse: () => setSidebarCollapsed((v) => !v),
				mobileOpen: mobileSidebarOpen,
				onCloseMobile: () => setMobileSidebarOpen(false),
				managedEngineers: managedEngineersInScope,
				selectedEngineerId,
				managerDirectoryActive: managerWorkspaceEnabled && !selectedEngineerId,
				onOpenTeamOverview: () => {
					setWorkspaceSelectedEngineerId(null);
					setActiveView("directory");
					navigate({ to: getTabPath("dashboard") });
				},
				onSelectEngineer: (engineerId) => {
					const landingTab = getManagerEngineerLandingTab(engineerId);
					if (selectedEngineerId === engineerId && activeView === "profile") {
						navigate({ to: getTabPath(landingTab, {
							mode: "manager",
							engineerId
						}) });
						return;
					}
					setWorkspaceSelectedEngineerId(engineerId);
					if (activeView !== "profile") setActiveView("profile");
					navigate({ to: getTabPath(landingTab, {
						mode: "manager",
						engineerId
					}) });
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"} flex flex-col min-h-screen min-w-0 transition-[margin] duration-200 print:ml-0`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopHeader, {
					title: HOME_PAGE_TITLES[tab],
					onCapture: () => {
						if (managerWorkspaceEnabled) {
							setShowCapture(true);
							return;
						}
						setShowCapture(true);
					},
					captureLabel: managerWorkspaceEnabled ? "Log Knowledge" : "Capture Evidence",
					onMenuClick: () => setMobileSidebarOpen(true),
					globalSearchQuery,
					onGlobalSearchQueryChange: setGlobalSearchQuery,
					globalSearchResults,
					onGlobalSearchSelect: handleGlobalSearchSelect
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 print-main",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-7xl mx-auto w-full px-4 py-4 sm:px-6 lg:px-8 md:py-6",
						children: [
							!showWorkspaceConnectionFallback && !isManagerScopedToEngineer && tab === "dashboard" && !isManagerDirectoryView && !(mode === "manager" && !selectedEngineerId) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "max-w-7xl mx-auto w-full mb-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "h-12 px-4 bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 rounded-xl flex items-center justify-between gap-4 shadow-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, {
												size: 12,
												className: "rotate-45 text-slate-400"
											}), "Pinned"]
										}),
										visiblePinnedResources.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1 text-xs italic text-slate-400 font-medium",
											children: "No resources pinned to this workspace yet."
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex-1 min-w-0 overflow-hidden",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
												children: visiblePinnedResources.map((pin) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													role: "button",
													tabIndex: 0,
													onClick: () => handlePinnedResourceSelect(pin),
													onKeyDown: (event) => {
														if (event.key === "Enter" || event.key === " ") {
															event.preventDefault();
															handlePinnedResourceSelect(pin);
														}
													},
													className: "shrink-0 inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 shadow-sm transition-all duration-150 ease-in-out",
													children: [
														pin.resource_type === "evidence" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
															size: 13,
															className: "text-blue-500"
														}) : pin.resource_type === "objective" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, {
															size: 13,
															className: "text-emerald-500"
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
															size: 13,
															className: "text-slate-400"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "max-w-[160px] truncate text-slate-800",
															title: pin.title,
															children: pin.title
														}),
														!pin.isSample && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															onClick: (event) => {
																event.stopPropagation();
																handleUnpin(pin.id);
															},
															className: "p-0.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 12 })
														})
													]
												}, pin.id))
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative shrink-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												ref: pinnedQuickAddTriggerRef,
												type: "button",
												onClick: () => setIsPinnedQuickAddOpen((prev) => !prev),
												className: "h-7 w-7 rounded-md border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors shrink-0 cursor-pointer",
												"aria-label": "Add workspace pin",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 })
											}), isPinnedQuickAddOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												ref: pinnedQuickAddPopoverRef,
												className: "absolute right-0 top-9 w-64 bg-white border border-slate-200 rounded-xl p-3 shadow-xl z-50 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														value: newPinnedTitle,
														onChange: (event) => setNewPinnedTitle(event.target.value),
														onKeyDown: (event) => {
															if (event.key !== "Enter") return;
															event.preventDefault();
															handlePinGenericResource();
														},
														placeholder: "Label",
														className: "w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														value: newPinnedUrl,
														onChange: (event) => setNewPinnedUrl(event.target.value),
														onKeyDown: (event) => {
															if (event.key !== "Enter") return;
															event.preventDefault();
															handlePinGenericResource();
														},
														placeholder: "URL",
														className: "w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-end gap-1.5 pt-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															onClick: () => setIsPinnedQuickAddOpen(false),
															className: "h-7 px-2.5 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100",
															children: "Cancel"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															onClick: () => void handlePinGenericResource(),
															disabled: isSubmittingPinnedResource,
															className: "h-7 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed",
															children: isSubmittingPinnedResource ? "Anchoring..." : "Anchor to Workspace"
														})]
													})
												]
											})]
										})
									]
								})
							}),
							!showWorkspaceConnectionFallback && showTeamTransitionCard && selectedEngineerId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-amber-50/50 border border-amber-100 rounded-xl p-5 mb-6 space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold uppercase tracking-wider text-amber-700 block",
										children: "Team Transition In Progress"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-sm font-medium text-slate-900",
										children: "Brief the incoming manager before access transfers"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-white border border-slate-100 rounded-lg p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs font-medium text-slate-400 mb-2",
											children: "AI-Compiled Technical Dossier (Past 6 Months)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-slate-600",
											children: "Compiling achievements from Bitbucket and Jira logs to construct the cross-team advocacy bridge..."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-medium text-slate-500 mb-2",
										children: "Manager Insights & Leadership Style Notes (Optional)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										value: handoverNotes,
										onChange: (event) => setHandoverNotes(event.target.value),
										placeholder: "Add any personal notes on mentorship strengths, autonomy preferences, or career goals for the incoming manager...",
										className: "w-full min-h-[80px] p-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex justify-end",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: isSigningOffTransfer,
											onClick: () => {
												if (!selectedEngineerId) return;
												setIsSigningOffTransfer(true);
												supabase.auth.getSession().then(({ data: { session } }) => {
													const token = session?.access_token;
													if (!token) throw new Error("Session expired. Please sign in again.");
													return signOffTransfer({ data: {
														engineerId: selectedEngineerId,
														workEthicsNotes: handoverNotes.trim(),
														token
													} });
												}).then(() => {
													toast.success("Transfer signed off and dossier shared.");
													setHandoverNotes("");
													setManagerRelationshipsRefreshNonce((prev) => prev + 1);
													setWorkspaceSelectedEngineerId(null);
													setActiveView("directory");
												}).catch((error) => {
													const message = error instanceof Error ? error.message : "Failed to sign off transfer.";
													toast.error(message);
												}).finally(() => {
													setIsSigningOffTransfer(false);
												});
											},
											className: "inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed",
											children: isSigningOffTransfer ? "Signing off..." : "Sign Off & Transfer Advocacy"
										})
									})
								]
							}),
							showWorkspaceConnectionFallback ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xl font-semibold text-slate-900",
										children: "Awaiting Workspace Connection"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-slate-600",
										children: "You don't have any active engineer tracking lines assigned to your profile yet. Please request a secure single-use invitation link from your engineer to sync metrics."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											handleSignOutForWorkspaceReset();
										},
										className: "mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800",
										children: "Sign Out / Switch Accounts"
									})
								]
							}) : mode === "manager" && !selectedEngineerId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagerDashboardView, {
								linkedEngineers: managedEngineersInScope,
								teamOverview: managerTeamOverview,
								isLoading: isManagerTeamOverviewLoading,
								isError: isManagerTeamOverviewError,
								onInspectEngineer: (engineerId) => {
									const landingTab = getManagerEngineerLandingTab(engineerId);
									if (selectedEngineerId === engineerId && activeView === "profile") {
										navigate({ to: getTabPath(landingTab, {
											mode: "manager",
											engineerId
										}) });
										return;
									}
									setWorkspaceSelectedEngineerId(engineerId);
									if (activeView !== "profile") setActiveView("profile");
									navigate({ to: getTabPath(landingTab, {
										mode: "manager",
										engineerId
									}) });
								}
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [showManagerProfileSubNavigation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] font-semibold uppercase tracking-wide text-slate-500",
											children: "Reviewing Engineer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold text-slate-900",
											children: selectedManagedEngineer?.fullName ?? "Selected engineer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-slate-600",
											children: selectedManagedEngineer?.status === "in_handover" ? "Transitioning handover" : "Active reporting line"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										{
											id: "tracking_workspace",
											label: "Tracking Workspace"
										},
										{
											id: "compilation_dossier",
											label: "Compilation Dossier"
										},
										{
											id: "one_on_one_sync",
											label: "1-on-1 Sync Agenda"
										}
									].map((subTab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setManagerProfileSubTab(subTab.id),
										className: `rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${managerProfileSubTab === subTab.id ? "border-slate-300 bg-slate-100 text-slate-900" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`,
										children: subTab.label
									}, subTab.id))
								})]
							}), showManagerProfileSubNavigation && managerProfileSubTab === "compilation_dossier" && selectedEngineerId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BusinessCaseTab, { engineerId: selectedEngineerId }) : showManagerProfileSubNavigation && managerProfileSubTab === "one_on_one_sync" && selectedEngineerId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OneOnOneWorkspace, { engineerId: selectedEngineerId }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
								mode: "wait",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									initial: {
										opacity: 0,
										y: 6
									},
									animate: {
										opacity: 1,
										y: 0
									},
									exit: {
										opacity: 0,
										y: -4
									},
									transition: { duration: .18 },
									children: [
										!isManagerScopedToEngineer && tab === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardView, {
											workspaceUserId: selectedEngineerId ?? userId,
											inbox: contextInbox,
											showSampleData: sampleContent.dashboard,
											dismissedSampleInboxIds,
											onOpenInbox: isManagerWorkspace ? () => {} : setOpenInbox,
											onOpenObjective: setOpenObjective,
											onOpenEvidence: setOpenEvidence
										}),
										tab === "radar" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadarView, {
											data: radarData,
											assessments: contextAssessments,
											evidence: contextEvidence,
											objectives: contextObjectives,
											wizardDraft,
											selectedEngineerId,
											onCreateObjective: () => setShowCreateObjective(true),
											onStartReview: () => setShowWizard(true),
											onResumeDraft: () => setShowWizard(true),
											onDiscardDraft: () => setShowDiscardDraftConfirm(true),
											onOpenHistory: () => setShowHistory(true)
										}),
										tab === "evidence" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceView, {
											rows: isManagerWorkspace ? contextEvidence : [...contextEvidence, ...contextArchivedEvidence],
											readOnly: !isManagerWorkspace ? false : true,
											managerReviewEnabled: isManagerWorkspace,
											onOpenRow: setOpenEvidence,
											pinnedEvidenceIds,
											onTogglePin: (item) => {
												handleToggleEvidencePin(item);
											},
											onArchive: (id) => {
												if (isManagerWorkspace) {
													flash("Managers can review evidence but cannot archive engineer logs.");
													return;
												}
												archiveEvidenceMutation.mutate(id, { onSuccess: () => flash("Evidence archived") });
											},
											onPermanentDelete: (id) => {
												if (isManagerWorkspace) {
													flash("Managers can review evidence but cannot permanently delete engineer logs.");
													return;
												}
												const pinnedId = pinnedEvidenceIdToPinId.get(id);
												deleteEvidenceMutation.mutate(id, { onSuccess: () => {
													if (pinnedId) handleUnpin(pinnedId);
													flash("Evidence permanently deleted");
												} });
											},
											onRestore: (id) => {
												if (isManagerWorkspace) {
													flash("Managers can review evidence but cannot restore archived engineer logs.");
													return;
												}
												restoreEvidenceMutation.mutate(id, { onSuccess: () => flash("Evidence restored to log") });
											}
										}),
										tab === "objectives" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectivesView, {
											items: isManagerWorkspace ? contextObjectives : [...contextObjectives, ...contextArchivedObjectives],
											readOnly: isManagerWorkspace,
											onOpen: setOpenObjective,
											onCreate: () => {
												if (isManagerWorkspace) {
													flash("Managers review and approve objectives from the manager panel.");
													return;
												}
												setShowCreateObjective(true);
											},
											pinnedObjectiveIds,
											onTogglePin: (objective) => {
												handleToggleObjectivePin(objective);
											},
											formatObjectiveCode,
											formatDisplayDate,
											onRestore: (o) => {
												if (isManagerWorkspace) {
													flash("Managers can only approve objectives into In Progress.");
													return;
												}
												restoreObjectiveMutation.mutate(o.id, { onSuccess: () => flash("Objective restored to Kanban board") });
											},
											onDelete: (o) => {
												if (isManagerWorkspace) {
													flash("Managers can only approve objectives into In Progress.");
													return;
												}
												const pinnedId = pinnedObjectiveIdToPinId.get(o.id);
												deleteObjectiveMutation.mutate(o, { onSuccess: () => {
													if (pinnedId) handleUnpin(pinnedId);
													flash("Objective permanently deleted");
												} });
											},
											onMove: (id, status) => {
												const target = [...contextObjectives, ...contextArchivedObjectives].find((o) => o.id === id);
												if (!target || target.status === status || target.status === "Completed") return;
												if (isManagerWorkspace && !(target.status === "Pending Approval" && status === "In Progress")) return;
												(isManagerWorkspace ? moveSelectedEngineerObjectiveMutation : moveObjectiveMutation).mutate({
													id,
													status,
													objective: target
												}, { onSuccess: () => {
													if (status === "Completed") flash("Objective completed and added to evidence");
													else if (target.status === "Completed" && status === "In Progress") flash("Objective reverted and removed from evidence log");
													else flash(`Moved to ${status}`);
												} });
											}
										}),
										!isManagerScopedToEngineer && tab === "knowledge" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnowledgeHubView, {
											items: knowledgeItems,
											pinnedKnowledgeIds,
											focusedItemId: focusedKnowledgeId,
											onTogglePin: (item) => {
												handleToggleKnowledgePin(item);
											},
											onEdit: setEditingKnowledge,
											onDelete: (item) => setPendingKnowledgeDelete(item)
										}),
										tab === "report" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportView, {
											evidence: contextEvidence,
											objectives: contextObjectives,
											radarData,
											onFlash: flash,
											review,
											assessments: contextAssessments,
											historyAssessments: contextHistoryAssessments,
											selectedEngineerId,
											onOpenAssessment: (a) => setReview(assessmentToSession(a)),
											onSaveTopics: (assessmentId, topics) => {
												updateTopicsMutation.mutate({
													assessmentId,
													topics
												}, { onSuccess: () => flash("1-on-1 topics saved") });
											},
											onDeleteHistoryAssessment: (assessmentId) => {
												requestAssessmentDelete(assessmentId);
											},
											onClearReview: () => setReview(null),
											onStartReview: () => setShowWizard(true),
											onOpenHistory: () => setShowHistory(true)
										}),
										!isManagerScopedToEngineer && tab === "feedback" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedbackView, {}),
										!isManagerScopedToEngineer && tab === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsView, {
											sampleContent,
											onSampleContentChange: setSampleContent,
											section: settingsSection,
											onSectionChange: handleSettingsSectionChange
										}),
										selectedEngineerId && selectedEngineerRole && (tab === "dashboard" || tab === "radar" || tab === "report") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagerActionsPanel, {
											engineerId: selectedEngineerId,
											currentUserRole: selectedEngineerRole
										})
									]
								}, tab)
							})] })
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showCapture && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaptureModal, {
				onClose: () => setShowCapture(false),
				managerMode: managerWorkspaceEnabled,
				competencyDescriptions: COMPETENCY_DESC,
				onSaveEvidence: ({ title, description, sourceLink, category, subcategory }) => {
					insertEvidenceMutation.mutate({
						id: "",
						date: toLocalDateString(),
						source: "Manual",
						category,
						competency: subcategory,
						title: title.trim(),
						description: description.trim(),
						link: sourceLink.trim(),
						status: "Pending Review",
						matchState: "Unset",
						managerNotes: "",
						isArchived: false,
						createdAt: (/* @__PURE__ */ new Date()).toISOString()
					}, { onSuccess: () => {
						setShowCapture(false);
						flash("Evidence captured");
					} });
				},
				onSaveKnowledge: ({ challenge, lesson, referenceLinks, reset }) => {
					if (!userId) {
						toast.error("Please sign in before saving knowledge.");
						return;
					}
					addKnowledgeMutation.mutate({
						user_id: userId,
						title: challenge.trim(),
						description: lesson.trim(),
						reference_links: referenceLinks
					}, { onSuccess: () => {
						reset();
						toast.success("Knowledge entry saved.");
					} });
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: editingKnowledge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnowledgeEditorModal, {
				item: editingKnowledge,
				isSaving: updateKnowledgeMutation.isPending,
				onClose: () => setEditingKnowledge(null),
				onSave: ({ challenge, lesson, referenceLinks }) => {
					updateKnowledgeMutation.mutate({
						id: editingKnowledge.id,
						title: challenge.trim(),
						description: lesson.trim(),
						reference_links: referenceLinks
					}, { onSuccess: () => {
						setEditingKnowledge(null);
						flash("Knowledge log updated");
					} });
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: pendingKnowledgeDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				title: "Delete knowledge log?",
				description: "This action cannot be undone. This knowledge entry will be permanently deleted.",
				confirmLabel: "Delete log",
				cancelLabel: "Cancel",
				destructive: true,
				onCancel: () => setPendingKnowledgeDelete(null),
				onConfirm: () => {
					const target = pendingKnowledgeDelete;
					if (!target) return;
					const pinnedId = pinnedKnowledgeIdToPinId.get(target.id);
					deleteKnowledgeMutation.mutate(target.id, {
						onSuccess: () => {
							if (pinnedId) handleUnpin(pinnedId);
							if (editingKnowledge?.id === target.id) setEditingKnowledge(null);
							setPendingKnowledgeDelete(null);
							flash("Knowledge log deleted");
						},
						onError: () => {
							setPendingKnowledgeDelete(null);
						}
					});
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showCreateObjective && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateObjectiveModal, {
				frameworkMatrix: activeFrameworkMatrix,
				onClose: () => setShowCreateObjective(false),
				onSubmit: (o) => {
					createObjectiveMutation.mutate({
						...o,
						id: "",
						status: "Pending Approval"
					}, { onSuccess: () => {
						setShowCreateObjective(false);
						flash("Objective submitted for approval");
					} });
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: openObjective && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ObjectiveSlideover, {
				objective: openObjective,
				frameworkMatrix: activeFrameworkMatrix,
				onClose: () => setOpenObjective(null),
				onPin: (objective) => {
					handleToggleObjectivePin(objective);
				},
				onSave: (o) => {
					(isManagerWorkspace ? saveSelectedEngineerObjectiveMutation : saveObjectiveMutation).mutate(o, { onSuccess: () => {
						setOpenObjective(o);
						flash("Objective updated");
					} });
				},
				onChangeStatus: (o, next) => {
					if (isManagerWorkspace && !(o.status === "Pending Approval" && next === "In Progress")) return;
					const updated = {
						...o,
						status: next
					};
					(isManagerWorkspace ? moveSelectedEngineerObjectiveMutation : moveObjectiveMutation).mutate({
						id: o.id,
						status: next,
						objective: o
					}, { onSuccess: () => {
						setOpenObjective(updated);
						if (next === "Completed") flash("Objective completed and added to evidence");
						else if (o.status === "Completed" && next === "In Progress") flash("Objective reverted and removed from evidence log");
						else if (next === "In Progress") flash("Objective approved and moved to In Progress");
					} });
				},
				onArchive: (o) => {
					if (isManagerWorkspace) {
						flash("Managers can only approve objectives into In Progress.");
						return;
					}
					archiveObjectiveById(o.id);
					setOpenObjective(null);
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: openEvidence && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceSlideover, {
				item: openEvidence,
				frameworkMatrix: activeFrameworkMatrix,
				managerReviewOnly: isManagerWorkspace,
				onClose: () => setOpenEvidence(null),
				onPin: (item) => {
					handleToggleEvidencePin(item);
				},
				onSave: (updated) => {
					(isManagerWorkspace ? saveSelectedEngineerEvidenceMutation : saveEvidenceMutation).mutate(updated, { onSuccess: () => {
						setOpenEvidence(updated);
						flash("Evidence updated");
					} });
				},
				onArchive: (id) => {
					if (isManagerWorkspace) {
						flash("Managers can review evidence but cannot archive engineer logs.");
						return;
					}
					archiveEvidenceMutation.mutate(id, { onSuccess: () => {
						setOpenEvidence(null);
						flash("Evidence archived");
					} });
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: openInbox && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InboxReviewSlideover, {
				item: openInbox,
				frameworkMatrix: activeFrameworkMatrix,
				onClose: () => setOpenInbox(null),
				onConfirm: (comps) => {
					approveInbox(openInbox, comps);
					setOpenInbox(null);
				},
				onDismiss: () => {
					dismissInbox(openInbox);
					setOpenInbox(null);
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showWizard && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewWizard, {
				evidence: contextEvidence,
				onOpenEvidence: setOpenEvidence,
				onClose: () => setShowWizard(false),
				latestAssessment: contextAssessments[0],
				initialDraft: wizardDraft,
				engineerName: reportSubjectEngineerName,
				managerName: assessmentManagerName,
				onSaveDraft: (draft) => {
					setWizardDraft(draft);
					flash("Assessment draft saved");
				},
				onFinalize: (session) => {
					const assessmentOwnerUserId = assessmentWorkspaceUserId;
					if (!assessmentOwnerUserId) {
						toast.error("Unable to finalize assessment: no authenticated user session found.");
						return;
					}
					const newAssessment = sessionToAssessment(session);
					finalizeAssessmentMutation.mutate({
						assessment: newAssessment,
						userId: assessmentOwnerUserId
					}, { onSuccess: () => {
						if (!isManagerWorkspace) notifyManagerAssessmentReady(assessmentOwnerUserId, newAssessment.engineerName?.trim() || reportSubjectEngineerName);
						setReview(session);
						clearAssessmentWizardDraft();
						setShowWizard(false);
						navigate({ to: getTabPathForCurrentScope("report") });
						flash("Assessment finalized · Report generated");
					} });
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showHistory && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssessmentHistoryModal, {
				assessments: contextHistoryAssessments,
				currentId: review?.id ?? null,
				onDelete: (assessmentId) => {
					requestAssessmentDelete(assessmentId);
				},
				onClose: () => setShowHistory(false),
				onOpen: (a) => {
					setReview(assessmentToSession(a));
					setShowHistory(false);
					navigate({ to: getTabPathForCurrentScope("report") });
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showDiscardDraftConfirm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				destructive: true,
				title: "Discard ongoing assessment draft?",
				description: "This permanently removes your saved assessment progress and notes. You cannot undo this action.",
				confirmLabel: "Discard draft",
				onCancel: () => setShowDiscardDraftConfirm(false),
				onConfirm: () => {
					clearAssessmentWizardDraft();
					setShowDiscardDraftConfirm(false);
					flash("Assessment draft discarded");
				}
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: pendingAssessmentDeleteId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				destructive: true,
				title: "Delete assessment report?",
				description: "Are you sure you want to delete this assessment report? This action cannot be undone.",
				confirmLabel: "Delete report",
				onCancel: () => setPendingAssessmentDeleteId(null),
				onConfirm: () => {
					executeAssessmentDelete(pendingAssessmentDeleteId);
					setPendingAssessmentDeleteId(null);
				}
			}) })
		]
	});
}
//#endregion
export { resolveLegacyHomePath as n, HomeRouteApp as t };
