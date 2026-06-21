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
const WEB_APP_ORIGIN = "http://192.168.1.130:8080";
const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";

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
    sendMessage: (message: Record<string, unknown>) => void;
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
  };
  offscreen?: {
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

function defaultConfig(): PromptConfig {
  return {
    timezone: "UTC+00:00 (GMT/UTC Standard)",
    promptTimes: ["16:00"],
    weekdaysOnly: true,
    snoozeDurationMinutes: 15,
  };
}

function parseHourMinute(value: string): { hour: number; minute: number } | null {
  const [hourText, minuteText] = String(value).split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function normalizePromptTimes(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((v) => String(v).trim()).filter((v) => parseHourMinute(v)))].sort();
}

function getCurrentDateInTargetZone(timezoneLabel: string): Date {
  const zone = timezoneLabel?.trim() || "UTC";
  try {
    const targetString = new Date().toLocaleString("en-US", { timeZone: zone });
    return new Date(targetString);
  } catch {
    const fallbackString = new Date().toLocaleString("en-US", { timeZone: "UTC" });
    return new Date(fallbackString);
  }
}

function computeNextSystemTimestamp(timeText: string, timezoneLabel: string): number | null {
  const parsed = parseHourMinute(timeText);
  if (!parsed) return null;

  const now = new Date();
  const targetNow = getCurrentDateInTargetZone(timezoneLabel);
  const targetCandidate = new Date(targetNow);
  targetCandidate.setHours(parsed.hour, parsed.minute, 0, 0);
  if (targetCandidate.getTime() <= targetNow.getTime()) {
    targetCandidate.setDate(targetCandidate.getDate() + 1);
  }

  // Convert target-zone future clock distance back to local system time.
  const millisecondsUntilTargetWindow = targetCandidate.getTime() - targetNow.getTime();
  return now.getTime() + millisecondsUntilTargetWindow;
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
        ? profileRow.timezone
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
        ? (stored[STORAGE_KEYS.timezone] as string)
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
    const hasDocument =
      typeof chromeApi.offscreen.hasDocument === "function"
        ? await chromeApi.offscreen.hasDocument()
        : false;
    if (hasDocument) return;
  } catch {
    // Continue and attempt creation.
  }

  try {
    await chromeApi.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play Evitrace reminder ping",
    });
  } catch {
    // Safe no-op if already exists or unavailable.
  }
}

async function playReminderPing(): Promise<void> {
  await ensureOffscreenAudioDocument();
  chromeApi.runtime.sendMessage({
    target: "evitrace-audio",
    audioUrl: "assets/sounds/ping.mp3",
    volume: 0.5,
  });
}

function openWorkspaceTab(): void {
  chromeApi.tabs.create({ url: `${WEB_APP_ORIGIN}/?tab=evidence`, active: true });
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
                ? message.timezone
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

if (chromeApi?.alarms?.onAlarm) {
  chromeApi.alarms.onAlarm.addListener((alarm: { name: string }) => {
    if (alarm.name === PROFILE_SYNC_ALARM) {
      void syncConfigFromSupabase();
      return;
    }
    if (alarm.name.startsWith(ALARM_WARNING_PREFIX)) {
      void handleWarningAlarm();
      return;
    }
    if (alarm.name.startsWith(ALARM_TRIGGER_PREFIX) || alarm.name === SNOOZE_ALARM) {
      void handleTriggerAlarm(alarm.name);
    }
  });
}

if (chromeApi?.notifications?.onButtonClicked) {
  chromeApi.notifications.onButtonClicked.addListener(
    (notificationId: string, buttonIndex: number) => {
      if (notificationId !== PROMPT_NOTIFICATION_ID) return;
      if (buttonIndex === 0) {
        void clearNotification(PROMPT_NOTIFICATION_ID);
        void clearPromptState();
        openWorkspaceTab();
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
}

if (chromeApi?.notifications?.onClicked) {
  chromeApi.notifications.onClicked.addListener((notificationId: string) => {
    if (notificationId !== PROMPT_NOTIFICATION_ID) return;
    void clearNotification(PROMPT_NOTIFICATION_ID);
    void clearPromptState();
    openWorkspaceTab();
  });
}

// Initialize in case the worker wakes outside startup/install events.
void initializeReminderEngine();
