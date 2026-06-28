import { getCurrentTimeZone } from "@/lib/datetime";
import { supabase } from "@/lib/supabase";

const STORAGE_KEYS = {
  schedule: "evitrace_prompt_schedule",
  snoozeMinutes: "evitrace_snooze_minutes",
  weekdaysOnly: "evitrace_weekdays_only",
  timezone: "evitrace_timezone",
  promptActive: "evitrace_prompt_active",
  currentPromptLabel: "evitrace_current_prompt_label",
  supabaseSession: "evitrace_supabase_session",
} as const;

const ALARM_WARNING_PREFIX = "evitrace-prompt-warning-";
const ALARM_TRIGGER_PREFIX = "evitrace-prompt-trigger-";
const SNOOZE_ALARM = "evitrace-snooze";
const PROFILE_SYNC_ALARM = "evitrace-profile-sync";
const PROFILE_SYNC_MINUTES = 5;
const PROMPT_NOTIFICATION_ID = "evitrace-reminder-prompt";
const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";
const AUTH_SYNC_MESSAGE_TYPE = "AUTH_SYNC_BRIDGE_SESSION";
const AUTH_STATE_CHANGE_MESSAGE_TYPE = "AUTH_STATE_CHANGE";
const SYNC_SUPABASE_SESSION_MESSAGE_TYPE = "SYNC_SUPABASE_SESSION";
const WEB_APP_MATCH_PATTERNS = [
  "https://evitrace.vercel.app/*",
];
const DEFAULT_CAPTURE_DEEPLINK_URL = "https://evitrace.vercel.app/?action=capture";

type ChromeApi = {
  storage: {
    local: {
      get: (keys: string[], callback: (stored: Record<string, unknown>) => void) => void;
      set: (values: Record<string, unknown>, callback?: () => void) => void;
    };
    onChanged: {
      addListener: (listener: (changes: Record<string, unknown>, areaName: string) => void) => void;
    };
  };
  alarms: {
    create: (name: string, options: { when: number; periodInMinutes?: number }) => void;
    clearAll: (callback: () => void) => void;
    clear: (name: string, callback: () => void) => void;
    getAll: (callback: (alarms: Array<{ name: string }>) => void) => void;
    onAlarm: {
      addListener: (listener: (alarm: { name: string }) => void) => void;
    };
  };
  notifications: {
    create: (
      notificationId: string,
      options: Record<string, unknown>,
      callback: () => void,
    ) => void;
    clear: (notificationId: string, callback: () => void) => void;
    onButtonClicked: {
      addListener: (listener: (notificationId: string, buttonIndex: number) => void) => void;
    };
    onClicked: {
      addListener: (listener: (notificationId: string) => void) => void;
    };
  };
  runtime: {
    sendMessage: (
      message: Record<string, unknown>,
      callback?: (response: { ok?: boolean; reason?: string } | undefined) => void,
    ) => void;
    lastError?: { message?: string };
    getURL?: (path: string) => string;
    getContexts?: (filter: {
      contextTypes?: string[];
      documentUrls?: string[];
    }) => Promise<Array<Record<string, unknown>>>;
    onInstalled: {
      addListener: (listener: () => void) => void;
    };
    onStartup: {
      addListener: (listener: () => void) => void;
    };
    onMessage: {
      addListener: (
        listener: (
          message: Record<string, unknown>,
          sender: unknown,
          sendResponse: (response?: unknown) => void,
        ) => boolean,
      ) => void;
    };
  };
  tabs: {
    create: (options: { url: string; active: boolean }) => void;
    query: (
      queryInfo: { url?: string | string[]; active?: boolean; lastFocusedWindow?: boolean },
      callback: (tabs: Array<{ id?: number; url?: string; windowId?: number }>) => void,
    ) => void;
    update: (
      tabId: number,
      updateProperties: { active?: boolean; url?: string },
      callback?: (tab?: { id?: number }) => void,
    ) => void;
    sendMessage: (
      tabId: number,
      message: Record<string, unknown>,
      callback: (response?: Record<string, unknown>) => void,
    ) => void;
  };
  windows?: {
    create: (options: {
      url: string;
      type: "popup";
      width: number;
      height: number;
      focused: boolean;
    }) => void;
    update?: (
      windowId: number,
      updateInfo: {
        focused?: boolean;
      },
      callback?: () => void,
    ) => void;
  };
  offscreen?: {
    Reason: {
      AUDIO_PLAYBACK: string;
    };
    hasDocument?: () => Promise<boolean>;
    createDocument: (options: {
      url: string;
      reasons: string[];
      justification: string;
    }) => Promise<void>;
  };
};

const chromeApi = (globalThis as typeof globalThis & { chrome?: ChromeApi }).chrome;

type PromptConfig = {
  timezone: string;
  promptTimes: string[];
  weekdaysOnly: boolean;
  snoozeDurationMinutes: number;
};

type AuthSyncMessage = {
  type: typeof AUTH_SYNC_MESSAGE_TYPE;
  access_token: string;
  refresh_token: string;
  storage_key?: string;
  source_url?: string;
};

type AuthStateChangeMessage = {
  type: typeof AUTH_STATE_CHANGE_MESSAGE_TYPE;
  session?: Record<string, unknown> | null;
  source_url?: string;
};

type ResolvedSession = {
  accessToken: string;
  refreshToken: string;
};

function defaultConfig(): PromptConfig {
  return {
    timezone: getCurrentTimeZone(),
    promptTimes: ["16:00"],
    weekdaysOnly: true,
    snoozeDurationMinutes: 15,
  };
}

function normalizeTimeZoneLabel(value: string | undefined): string {
  if (!value) return getCurrentTimeZone();
  const trimmed = value.trim();
  if (!trimmed) return getCurrentTimeZone();
  const legacyMap: Record<string, string> = {
    "UTC-08:00 (PST)": "America/Los_Angeles",
    "UTC-05:00 (EST)": "America/New_York",
    "UTC+00:00 (GMT/UTC Standard)": "UTC",
    "UTC+01:00 (BST)": "Europe/London",
    "UTC+05:30 (IST)": "Asia/Kolkata",
    "UTC+08:00 (SGT)": "Asia/Singapore",
    "UTC+09:00 (JST)": "Asia/Tokyo",
    "UTC+10:00 (AEST)": "Australia/Sydney",
    GMT: "UTC",
  };
  return legacyMap[trimmed] ?? trimmed;
}

function parseHourMinute(value: string): { hour: number; minute: number } | null {
  const [hourText, minuteText] = String(value).split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function isAuthSyncMessage(message: Record<string, unknown>): message is AuthSyncMessage {
  return (
    message?.type === AUTH_SYNC_MESSAGE_TYPE &&
    typeof message.access_token === "string" &&
    message.access_token.trim().length > 0 &&
    typeof message.refresh_token === "string" &&
    message.refresh_token.trim().length > 0
  );
}

function isAuthStateChangeMessage(message: Record<string, unknown>): message is AuthStateChangeMessage {
  return message?.type === AUTH_STATE_CHANGE_MESSAGE_TYPE;
}

function errorMessage(value: unknown): string {
  if (!value || typeof value !== "object") return "Unknown auth sync error";
  const candidate = value as { message?: unknown };
  return typeof candidate.message === "string" && candidate.message.trim().length > 0
    ? candidate.message
    : "Unknown auth sync error";
}

function parseSessionTokens(value: unknown): ResolvedSession | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Record<string, unknown>;
  const accessToken =
    typeof payload.access_token === "string"
      ? payload.access_token
      : typeof payload.accessToken === "string"
        ? payload.accessToken
        : null;
  const refreshToken =
    typeof payload.refresh_token === "string"
      ? payload.refresh_token
      : typeof payload.refreshToken === "string"
        ? payload.refreshToken
        : null;
  if (!accessToken || !refreshToken) return null;
  if (!accessToken.trim() || !refreshToken.trim()) return null;
  return {
    accessToken,
    refreshToken,
  };
}

async function persistMirroredSession(
  tokens: ResolvedSession,
  metadata?: { storageKey?: string; sourceUrl?: string },
): Promise<void> {
  await setLocal({
    [STORAGE_KEYS.supabaseSession]: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      storageKey: metadata?.storageKey,
      sourceUrl: metadata?.sourceUrl,
      syncedAt: Date.now(),
    },
  });
}

async function applyIncomingSession(
  tokens: ResolvedSession,
  metadata?: { storageKey?: string; sourceUrl?: string },
): Promise<{ emailOrId: string }> {
  const { data, error } = await supabase.auth.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });
  if (error || !data.session) {
    throw new Error(error?.message ?? "Failed to set Supabase session");
  }
  await persistMirroredSession(tokens, metadata);
  return {
    emailOrId: data.session.user.email ?? data.session.user.id,
  };
}

async function clearMirroredAuthSession(): Promise<void> {
  await supabase.auth.signOut();
  await setLocal({
    [STORAGE_KEYS.supabaseSession]: null,
  });
}

function queryTabs(urlPatterns: string[]): Promise<Array<{ id?: number; url?: string; windowId?: number }>> {
  return new Promise((resolve) => {
    if (!chromeApi?.tabs?.query) {
      resolve([]);
      return;
    }
    chromeApi.tabs.query({ url: urlPatterns }, (tabs) => resolve(tabs ?? []));
  });
}

function sendMessageToTab(
  tabId: number,
  message: Record<string, unknown>,
): Promise<{ response?: Record<string, unknown>; runtimeError?: string }> {
  return new Promise((resolve) => {
    if (!chromeApi?.tabs?.sendMessage) {
      resolve({ runtimeError: "tabs.sendMessage is unavailable" });
      return;
    }
    chromeApi.tabs.sendMessage(tabId, message, (response) => {
      resolve({ response, runtimeError: chromeApi.runtime.lastError?.message });
    });
  });
}

function resolveCaptureDeepLink(tabUrl?: string): string {
  if (!tabUrl) return DEFAULT_CAPTURE_DEEPLINK_URL;
  try {
    const parsed = new URL(tabUrl);
    return `${parsed.origin}/?action=capture`;
  } catch {
    return DEFAULT_CAPTURE_DEEPLINK_URL;
  }
}

function updateTab(tabId: number, updateProperties: { active?: boolean; url?: string }): Promise<void> {
  return new Promise((resolve) => {
    if (!chromeApi?.tabs?.update) {
      resolve();
      return;
    }
    chromeApi.tabs.update(tabId, updateProperties, () => resolve());
  });
}

function focusWindow(windowId: number): Promise<void> {
  return new Promise((resolve) => {
    if (!chromeApi?.windows?.update) {
      resolve();
      return;
    }
    chromeApi.windows.update(windowId, { focused: true }, () => resolve());
  });
}

async function handleNotificationDeepLink(): Promise<void> {
  const appUrl = "https://evitrace.vercel.app/?action=capture";
  const tabs = await queryTabs(WEB_APP_MATCH_PATTERNS);
  const existingTab = tabs.find((tab) => typeof tab.id === "number");
  if (existingTab?.id) {
    await updateTab(existingTab.id, {
      active: true,
      url: resolveCaptureDeepLink(existingTab.url) || appUrl,
    });
    if (typeof existingTab.windowId === "number") {
      await focusWindow(existingTab.windowId);
    }
    return;
  }
  if (!chromeApi?.tabs?.create) return;
  chromeApi.tabs.create({
    url: appUrl,
    active: true,
  });
}

async function syncSupabaseSessionFromWebAppTab(): Promise<
  { ok: true; status: "SYNCED"; sourceUrl?: string; storageKey?: string } | { ok: false; status: "NO_SESSION" | "NO_TAB" | "SYNC_FAILED"; reason?: string }
> {
  const tabs = await queryTabs(WEB_APP_MATCH_PATTERNS);
  const targetTab = tabs.find((tab) => typeof tab.id === "number") ?? null;
  if (!targetTab?.id) {
    return { ok: false, status: "NO_TAB", reason: "No web app tab found" };
  }

  const { response, runtimeError } = await sendMessageToTab(targetTab.id, { type: "GET_AUTH_STATE" });
  if (runtimeError) {
    return { ok: false, status: "SYNC_FAILED", reason: runtimeError };
  }

  const sessionTokens = parseSessionTokens(response?.session);
  if (!sessionTokens) {
    await clearMirroredAuthSession();
    return { ok: false, status: "NO_SESSION", reason: "No active session in web app localStorage" };
  }

  const sourceUrl = typeof response?.source_url === "string" ? response.source_url : targetTab.url;
  const storageKey = typeof response?.storage_key === "string" ? response.storage_key : undefined;

  await applyIncomingSession(sessionTokens, { sourceUrl, storageKey });
  return { ok: true, status: "SYNCED", sourceUrl, storageKey };
}

function isDateLikeValue(value: string): boolean {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function normalizePromptTimes(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return [
    ...new Set(
      values
        .map((v) => String(v).trim())
        .filter((v) => parseHourMinute(v) || isDateLikeValue(v)),
    ),
  ].sort();
}

function resolveTimeZone(timezoneLabel: string): string {
  const zone = normalizeTimeZoneLabel(timezoneLabel) || "UTC";
  try {
    // Throws for invalid time zone identifiers.
    new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(new Date());
    return zone;
  } catch {
    return getCurrentTimeZone();
  }
}

function resolveScheduledLocalTime(value: string): { hour: number; minute: number } | null {
  const dbDate = new Date(value);
  if (!Number.isNaN(dbDate.getTime())) {
    return {
      hour: dbDate.getHours(),
      minute: dbDate.getMinutes(),
    };
  }
  return parseHourMinute(value);
}

function computeNextSystemTimestamp(timeText: string, _timezoneLabel: string): number | null {
  const local = resolveScheduledLocalTime(timeText);
  if (!local) return null;

  const target = new Date();
  target.setHours(local.hour, local.minute, 0, 0);

  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime();
}

function suppressWeekend(weekdaysOnly: boolean): boolean {
  if (!weekdaysOnly) return false;
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

function getLocal(keys: string[]): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    chromeApi.storage.local.get(keys, (stored: Record<string, unknown>) => resolve(stored ?? {}));
  });
}

function setLocal(values: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    chromeApi.storage.local.set(values, () => resolve());
  });
}

function clearAllAlarms(): Promise<void> {
  return new Promise((resolve) => {
    chromeApi.alarms.clearAll(() => resolve());
  });
}

function clearAlarm(name: string): Promise<void> {
  return new Promise((resolve) => {
    chromeApi.alarms.clear(name, () => resolve());
  });
}

async function clearPromptEngineAlarms(): Promise<void> {
  const alarms: Array<{ name: string }> = await new Promise((resolve) => {
    chromeApi.alarms.getAll((items: Array<{ name: string }>) => resolve(items ?? []));
  });
  const targets = alarms
    .map((alarm) => alarm.name)
    .filter(
      (name) =>
        name.startsWith(ALARM_WARNING_PREFIX) ||
        name.startsWith(ALARM_TRIGGER_PREFIX) ||
        name === SNOOZE_ALARM,
    );
  await Promise.all(targets.map((name) => clearAlarm(name)));
}

function notificationPayloadPrompt(promptLabel: string) {
  return {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Evitrace Reminder",
    message: `Your evidence capture window is open now${promptLabel ? ` (${promptLabel})` : ""}.`,
    priority: 2,
    requireInteraction: true,
    buttons: [{ title: "Log Evidence Now" }, { title: "Snooze" }],
  };
}

function notificationPayloadWarning() {
  return {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Evitrace Reminder",
    message: "Evitrace Reminder: Your evidence capture window opens in 5 minutes.",
    priority: 2,
  };
}

function createNotification(id: string, payload: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    chromeApi.notifications.create(id, payload, () => resolve());
  });
}

function clearNotification(id: string): Promise<void> {
  return new Promise((resolve) => {
    chromeApi.notifications.clear(id, () => resolve());
  });
}

function createAlarm(name: string, options: { when: number; periodInMinutes?: number }): void {
  chromeApi.alarms.create(name, options);
}

function decodeJwtPayload(token: unknown): Record<string, unknown> | null {
  if (typeof token !== "string" || !token.includes(".")) return null;
  try {
    const rawPayload = token.split(".")[1];
    const normalized = rawPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function getProjectRefFromSession(session: Record<string, unknown> | undefined): string | null {
  const storageKey = String(session?.storageKey ?? "");
  const keyMatch = storageKey.match(/^sb-([a-z0-9]+)-auth-token$/i);
  if (keyMatch?.[1]) return keyMatch[1];

  const payload = decodeJwtPayload(session?.accessToken);
  const issuer = String(payload?.iss ?? "");
  const issuerMatch = issuer.match(/https:\/\/([a-z0-9]+)\.supabase\.co\/auth\/v1/i);
  if (issuerMatch?.[1]) return issuerMatch[1];
  return null;
}

function normalizeConfigFromSupabase(
  profileRow: Record<string, unknown> | null | undefined,
): PromptConfig {
  const defaults = defaultConfig();
  return {
    timezone:
      typeof profileRow?.timezone === "string" && profileRow.timezone.trim().length > 0
        ? resolveTimeZone(profileRow.timezone)
        : defaults.timezone,
    promptTimes: (() => {
      const times = normalizePromptTimes(profileRow?.prompt_times);
      return times.length > 0 ? times : defaults.promptTimes;
    })(),
    weekdaysOnly:
      typeof profileRow?.weekdays_only === "boolean"
        ? profileRow.weekdays_only
        : defaults.weekdaysOnly,
    snoozeDurationMinutes: (() => {
      const raw = Number(profileRow?.snooze_duration_minutes);
      if (!Number.isFinite(raw) || raw <= 0) return defaults.snoozeDurationMinutes;
      return Math.round(raw);
    })(),
  };
}

async function fetchProfilePromptConfig(): Promise<PromptConfig | null> {
  const stored = await getLocal([STORAGE_KEYS.supabaseSession]);
  const session = stored?.[STORAGE_KEYS.supabaseSession] as Record<string, unknown> | undefined;
  const accessToken = session?.accessToken;
  if (typeof accessToken !== "string" || accessToken.trim().length === 0) return null;

  const payload = decodeJwtPayload(accessToken);
  const userId = String(payload?.sub ?? "");
  const projectRef = getProjectRefFromSession(session);
  if (!userId || !projectRef) return null;

  const baseUrl = `https://${projectRef}.supabase.co/rest/v1`;
  const response = await fetch(
    `${baseUrl}/profiles?id=eq.${encodeURIComponent(userId)}&select=timezone,prompt_times,weekdays_only,snooze_duration_minutes&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) return null;
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return normalizeConfigFromSupabase(rows[0]);
}

async function schedulePromptAlarmsFromConfig(config: PromptConfig): Promise<void> {
  await clearPromptEngineAlarms();
  config.promptTimes.forEach((timeText, index) => {
    const triggerWhen = computeNextSystemTimestamp(timeText, config.timezone);
    if (!triggerWhen) return;
    const warningWhen = triggerWhen - 5 * 60 * 1000;
    createAlarm(`${ALARM_WARNING_PREFIX}${index}`, { when: warningWhen, periodInMinutes: 24 * 60 });
    createAlarm(`${ALARM_TRIGGER_PREFIX}${index}`, { when: triggerWhen, periodInMinutes: 24 * 60 });
  });
}

async function applyConfig(config: PromptConfig): Promise<void> {
  await setLocal({
    [STORAGE_KEYS.timezone]: config.timezone,
    [STORAGE_KEYS.schedule]: config.promptTimes,
    [STORAGE_KEYS.weekdaysOnly]: config.weekdaysOnly,
    [STORAGE_KEYS.snoozeMinutes]: config.snoozeDurationMinutes,
  });
  await schedulePromptAlarmsFromConfig(config);
}

async function syncConfigFromSupabase(): Promise<void> {
  const profileConfig = await fetchProfilePromptConfig();
  if (!profileConfig) return;
  await applyConfig(profileConfig);
}

async function readStoredConfig(): Promise<PromptConfig> {
  const defaults = defaultConfig();
  const stored = await getLocal([
    STORAGE_KEYS.timezone,
    STORAGE_KEYS.schedule,
    STORAGE_KEYS.weekdaysOnly,
    STORAGE_KEYS.snoozeMinutes,
  ]);

  const promptTimes = normalizePromptTimes(stored?.[STORAGE_KEYS.schedule]);
  return {
    timezone:
      typeof stored?.[STORAGE_KEYS.timezone] === "string" &&
      String(stored[STORAGE_KEYS.timezone]).trim()
        ? resolveTimeZone(String(stored[STORAGE_KEYS.timezone]))
        : defaults.timezone,
    promptTimes: promptTimes.length > 0 ? promptTimes : defaults.promptTimes,
    weekdaysOnly:
      typeof stored?.[STORAGE_KEYS.weekdaysOnly] === "boolean"
        ? Boolean(stored[STORAGE_KEYS.weekdaysOnly])
        : defaults.weekdaysOnly,
    snoozeDurationMinutes: (() => {
      const raw = Number(stored?.[STORAGE_KEYS.snoozeMinutes]);
      if (!Number.isFinite(raw) || raw <= 0) return defaults.snoozeDurationMinutes;
      return Math.round(raw);
    })(),
  };
}

async function ensureOffscreenAudioDocument(): Promise<void> {
  if (!chromeApi?.offscreen) return;
  try {
    let hasDocument = false;
    if (typeof chromeApi.runtime.getContexts === "function" && typeof chromeApi.runtime.getURL === "function") {
      const contexts = await chromeApi.runtime.getContexts({
        contextTypes: ["OFFSCREEN_DOCUMENT"],
        documentUrls: [chromeApi.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)],
      });
      hasDocument = contexts.length > 0;
    } else if (typeof chromeApi.offscreen.hasDocument === "function") {
      hasDocument = await chromeApi.offscreen.hasDocument();
    }
    if (hasDocument) return;
  } catch {
    // Continue and attempt creation.
  }

  try {
    await chromeApi.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chromeApi.offscreen.Reason.AUDIO_PLAYBACK],
      justification: "Play scheduled prompt chime",
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    // Log to surface silent failures in offscreen audio setup.
    console.error("Failed to create offscreen audio document:", error);
  }
}

async function playReminderPing(): Promise<void> {
  try {
    await ensureOffscreenAudioDocument();
    chromeApi.runtime.sendMessage(
      {
        target: "evitrace-audio",
        audioUrl: "assets/sounds/ping.mp3",
        volume: 0.5,
      },
      (response) => {
        const runtimeError = (globalThis as typeof globalThis & { chrome?: any }).chrome?.runtime
          ?.lastError;
        if (runtimeError) {
          console.error("Failed to dispatch audio message:", runtimeError.message);
          return;
        }
        if (!response?.ok) {
          console.error("Offscreen audio playback failed:", response?.reason ?? "unknown reason");
        }
      },
    );
  } catch (error) {
    console.error("Audio failed to initialize:", error);
  }
}

function launchEvitraceEntryModal(): void {
  if (!chromeApi?.windows?.create || typeof chromeApi.runtime.getURL !== "function") return;
  chromeApi.windows.create({
    url: chromeApi.runtime.getURL("popup.html"),
    type: "popup",
    width: 450,
    height: 650,
    focused: true,
  });
}

async function markPromptActive(label: string): Promise<void> {
  await setLocal({
    [STORAGE_KEYS.promptActive]: true,
    [STORAGE_KEYS.currentPromptLabel]: label,
  });
}

async function clearPromptState(): Promise<void> {
  await setLocal({
    [STORAGE_KEYS.promptActive]: false,
    [STORAGE_KEYS.currentPromptLabel]: "",
  });
}

async function scheduleSnooze(): Promise<void> {
  const stored = await getLocal([STORAGE_KEYS.snoozeMinutes, STORAGE_KEYS.currentPromptLabel]);
  const minutesRaw = Number(stored?.[STORAGE_KEYS.snoozeMinutes]);
  const snoozeMinutes = Number.isFinite(minutesRaw) && minutesRaw > 0 ? Math.round(minutesRaw) : 15;
  await clearAlarm(SNOOZE_ALARM);
  createAlarm(SNOOZE_ALARM, { when: Date.now() + snoozeMinutes * 60 * 1000 });
  await setLocal({
    [STORAGE_KEYS.promptActive]: false,
    [STORAGE_KEYS.currentPromptLabel]:
      typeof stored?.[STORAGE_KEYS.currentPromptLabel] === "string"
        ? String(stored[STORAGE_KEYS.currentPromptLabel])
        : "Snoozed reminder",
  });
}

async function handleWarningAlarm(): Promise<void> {
  const config = await readStoredConfig();
  if (suppressWeekend(config.weekdaysOnly)) return;
  await createNotification(`evitrace-reminder-warning-${Date.now()}`, notificationPayloadWarning());
}

async function handleTriggerAlarm(alarmName: string): Promise<void> {
  const config = await readStoredConfig();
  if (suppressWeekend(config.weekdaysOnly)) return;

  const index =
    alarmName === SNOOZE_ALARM
      ? -1
      : Number(alarmName.replace(ALARM_TRIGGER_PREFIX, "").replace(ALARM_WARNING_PREFIX, "")) || 0;
  const promptLabel =
    alarmName === SNOOZE_ALARM
      ? "Snoozed reminder"
      : `Prompt ${index + 1} • ${config.promptTimes[index] ?? config.promptTimes[0] ?? "16:00"}`;

  await playReminderPing();
  await markPromptActive(promptLabel);
  launchEvitraceEntryModal();
  await createNotification(PROMPT_NOTIFICATION_ID, notificationPayloadPrompt(promptLabel));
}

async function initializeReminderEngine(): Promise<void> {
  await clearAllAlarms();
  const config = await readStoredConfig();
  await applyConfig(config);
  createAlarm(PROFILE_SYNC_ALARM, {
    when: Date.now() + 20 * 1000,
    periodInMinutes: PROFILE_SYNC_MINUTES,
  });
  await syncConfigFromSupabase();
}

if (chromeApi?.runtime?.onInstalled) {
  chromeApi.runtime.onInstalled.addListener(() => {
    void initializeReminderEngine();
  });
}

if (chromeApi?.runtime?.onStartup) {
  chromeApi.runtime.onStartup.addListener(() => {
    void initializeReminderEngine();
  });
}

if (chromeApi?.runtime?.onMessage) {
  chromeApi.runtime.onMessage.addListener(
    (
      message: Record<string, unknown>,
      _sender: unknown,
      sendResponse: (response?: unknown) => void,
    ) => {
      if (isAuthSyncMessage(message)) {
        void (async () => {
          try {
            const session = await applyIncomingSession(
              {
                accessToken: message.access_token,
                refreshToken: message.refresh_token,
              },
              {
                storageKey: typeof message.storage_key === "string" ? message.storage_key : undefined,
                sourceUrl: typeof message.source_url === "string" ? message.source_url : undefined,
              },
            );

            console.log("Authentication synchronized perfectly for user:", session.emailOrId);
            sendResponse({ ok: true, status: "SYNCED" });
          } catch (error: unknown) {
            console.error("Failed to synchronize authentication session:", error);
            sendResponse({ ok: false, status: "SYNC_FAILED", reason: errorMessage(error) });
          }
        })();
        return true;
      }

      if (isAuthStateChangeMessage(message)) {
        void (async () => {
          try {
            const tokens = parseSessionTokens(message.session);
            if (!tokens) {
              await clearMirroredAuthSession();
              sendResponse({ ok: true, status: "NO_SESSION" });
              return;
            }

            const session = await applyIncomingSession(tokens, {
              sourceUrl: typeof message.source_url === "string" ? message.source_url : undefined,
            });
            console.log("Authentication synchronized perfectly for user:", session.emailOrId);
            sendResponse({ ok: true, status: "SYNCED" });
          } catch (error: unknown) {
            console.error("Failed to apply AUTH_STATE_CHANGE:", error);
            sendResponse({ ok: false, status: "SYNC_FAILED", reason: errorMessage(error) });
          }
        })();
        return true;
      }

      if (message?.type === SYNC_SUPABASE_SESSION_MESSAGE_TYPE) {
        void (async () => {
          try {
            const result = await syncSupabaseSessionFromWebAppTab();
            sendResponse(result);
          } catch (error: unknown) {
            console.error("Failed to verify session from popup bootstrap:", error);
            sendResponse({ ok: false, status: "SYNC_FAILED", reason: errorMessage(error) });
          }
        })();
        return true;
      }

      if (message?.type === "CLEAR_PROMPT_ACTIVE") {
        void (async () => {
          await clearPromptState();
          sendResponse({ ok: true });
        })();
        return true;
      }

      if (message?.type === "SYNC_PROFILE_PROMPT_CONFIG") {
        void (async () => {
          await syncConfigFromSupabase();
          sendResponse({ ok: true });
        })();
        return true;
      }

      if (message?.type === "UPDATE_PROMPT_CONFIG") {
        void (async () => {
          const nextConfig: PromptConfig = {
              timezone:
                typeof message.timezone === "string" && message.timezone.trim().length > 0
                  ? resolveTimeZone(message.timezone)
                  : defaultConfig().timezone,
            promptTimes: (() => {
              const parsed = normalizePromptTimes(message.scheduleTimes);
              return parsed.length > 0 ? parsed : defaultConfig().promptTimes;
            })(),
            weekdaysOnly: message.weekdaysOnly !== false,
            snoozeDurationMinutes: (() => {
              const raw = Number(message.snoozeMinutes);
              if (!Number.isFinite(raw) || raw <= 0) return defaultConfig().snoozeDurationMinutes;
              return Math.round(raw);
            })(),
          };
          await applyConfig(nextConfig);
          sendResponse({ ok: true });
        })();
        return true;
      }

      if (message?.type === "SNOOZE_PROMPT") {
        void (async () => {
          await scheduleSnooze();
          await clearNotification(PROMPT_NOTIFICATION_ID);
          sendResponse({ ok: true });
        })();
        return true;
      }

      return false;
    },
  );
}

if (chromeApi?.storage?.onChanged) {
  chromeApi.storage.onChanged.addListener((changes: Record<string, unknown>, areaName: string) => {
    if (areaName !== "local") return;
    if (!changes?.[STORAGE_KEYS.supabaseSession]) return;
    void syncConfigFromSupabase();
  });
}

chromeApi.alarms.onAlarm.addListener((alarm: { name: string }) => {
  void (async () => {
    if (alarm.name === PROFILE_SYNC_ALARM) {
      await syncConfigFromSupabase();
      return;
    }
    if (alarm.name.startsWith(ALARM_WARNING_PREFIX)) {
      await handleWarningAlarm();
      return;
    }
    if (alarm.name.startsWith(ALARM_TRIGGER_PREFIX) || alarm.name === SNOOZE_ALARM) {
      await handleTriggerAlarm(alarm.name);
    }
  })();
});

chromeApi.notifications.onButtonClicked.addListener(
  (notificationId: string, buttonIndex: number) => {
    if (notificationId !== PROMPT_NOTIFICATION_ID) return;
    if (buttonIndex === 0) {
      void clearNotification(PROMPT_NOTIFICATION_ID);
      void clearPromptState();
      void handleNotificationDeepLink();
      return;
    }
    if (buttonIndex === 1) {
      void (async () => {
        await clearNotification(PROMPT_NOTIFICATION_ID);
        await scheduleSnooze();
      })();
    }
  },
);

chromeApi.notifications.onClicked.addListener((notificationId: string) => {
  if (notificationId !== PROMPT_NOTIFICATION_ID) return;
  void clearNotification(PROMPT_NOTIFICATION_ID);
  void clearPromptState();
  void handleNotificationDeepLink();
});

// Initialize in case the worker wakes outside startup/install events.
void initializeReminderEngine();
