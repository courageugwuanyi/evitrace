const STORAGE_KEYS = {
  schedule: "evitrace_prompt_schedule",
  snoozeMinutes: "evitrace_snooze_minutes",
  weekdaysOnly: "evitrace_weekdays_only",
  timezone: "evitrace_timezone",
  promptActive: "evitrace_prompt_active",
  snoozeCount: "evitrace_snooze_count",
  currentPromptLabel: "evitrace_current_prompt_label",
};

const ALARM_PREFIX = "evitrace-prompt-";
const ALARM_WARNING_PREFIX = "evitrace-prompt-warning-";
const ALARM_TRIGGER_PREFIX = "evitrace-prompt-trigger-";
const PROFILE_SYNC_ALARM = "evitrace-profile-sync";
const PROFILE_SYNC_PERIOD_MINUTES = 5;
const SNOOZE_ALARM = "evitrace-snooze";
const NOTIFICATION_PREFIX = "evitrace-reminder-";
const PROMPT_NOTIFICATION_ID = `${NOTIFICATION_PREFIX}prompt`;
const WEB_APP_ORIGIN = "http://192.168.1.130:8080";
const EXT_SUPABASE_SESSION_KEY = "evitrace_supabase_session";
const EXT_SUPABASE_SESSION_SYNCED_AT_KEY = "evitrace_supabase_session_synced_at";

function defaultConfig() {
  return {
    [STORAGE_KEYS.schedule]: ["16:00"],
    [STORAGE_KEYS.snoozeMinutes]: 15,
    [STORAGE_KEYS.weekdaysOnly]: true,
    [STORAGE_KEYS.timezone]: "UTC+00:00 (GMT/UTC Standard)",
    [STORAGE_KEYS.promptActive]: false,
    [STORAGE_KEYS.snoozeCount]: 0,
    [STORAGE_KEYS.currentPromptLabel]: "",
  };
}

function parseHourMinute(timeText) {
  const [hourText, minuteText] = String(timeText).split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function normalizePromptTimes(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => String(value).trim()).filter((value) => parseHourMinute(value)))].sort();
}

function parseTimezoneOffsetMinutes(timezoneLabel) {
  const label = String(timezoneLabel ?? "").trim();
  if (!label) return 0;
  const utcMatch = label.match(/UTC([+-])(\d{2}):(\d{2})/i);
  if (utcMatch) {
    const sign = utcMatch[1] === "-" ? -1 : 1;
    const hour = Number(utcMatch[2]);
    const minute = Number(utcMatch[3]);
    if (Number.isFinite(hour) && Number.isFinite(minute)) {
      return sign * (hour * 60 + minute);
    }
  }
  if (/^GMT$/i.test(label) || /^UTC$/i.test(label)) return 0;
  return 0;
}

function getTimezoneDiscrepancyMinutes(timezoneLabel) {
  const profileOffsetMinutes = parseTimezoneOffsetMinutes(timezoneLabel);
  const systemOffsetMinutes = -new Date().getTimezoneOffset();
  return profileOffsetMinutes - systemOffsetMinutes;
}

function nextAlarmTimeMs(timeText, timezoneLabel) {
  const parsed = parseHourMinute(timeText);
  if (!parsed) return null;
  const discrepancyMinutes = getTimezoneDiscrepancyMinutes(timezoneLabel);
  const targetMinutesInSystemClock = parsed.hour * 60 + parsed.minute - discrepancyMinutes;

  const now = new Date();
  const next = new Date(now);
  next.setHours(0, 0, 0, 0);
  next.setMinutes(targetMinutesInSystemClock, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

function shouldSuppressWeekend(weekdaysOnly) {
  if (!weekdaysOnly) return false;
  const today = new Date().getDay();
  return today === 0 || today === 6;
}

function clearPromptAlarms(callback) {
  chrome.alarms.getAll((alarms) => {
    const clearTargets = alarms
      .map((alarm) => alarm.name)
      .filter(
        (name) =>
          name.startsWith(ALARM_PREFIX) ||
          name.startsWith(ALARM_WARNING_PREFIX) ||
          name.startsWith(ALARM_TRIGGER_PREFIX) ||
          name === SNOOZE_ALARM,
      );
    if (clearTargets.length === 0) {
      callback();
      return;
    }
    let remaining = clearTargets.length;
    clearTargets.forEach((name) => {
      chrome.alarms.clear(name, () => {
        remaining -= 1;
        if (remaining === 0) callback();
      });
    });
  });
}

function schedulePromptAlarms(times, timezoneLabel) {
  const scheduleTimes = normalizePromptTimes(times);
  clearPromptAlarms(() => {
    scheduleTimes.forEach((timeText, index) => {
      const triggerWhen = nextAlarmTimeMs(timeText, timezoneLabel);
      if (!triggerWhen) return;
      const warningWhen = triggerWhen - 5 * 60 * 1000;
      chrome.alarms.create(`${ALARM_WARNING_PREFIX}${index}`, {
        when: warningWhen,
        periodInMinutes: 24 * 60,
      });
      chrome.alarms.create(`${ALARM_TRIGGER_PREFIX}${index}`, {
        when: triggerWhen,
        periodInMinutes: 24 * 60,
      });
    });
  });
}

function showWarningReminder() {
  chrome.notifications.create(`${NOTIFICATION_PREFIX}warning-${Date.now()}`, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Evitrace Reminder",
    message: "Evitrace Reminder: Your evidence capture window opens in 5 minutes.",
    priority: 2,
  });
}

function showCaptureReminder(promptLabel) {
  chrome.notifications.create(PROMPT_NOTIFICATION_ID, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Evitrace Reminder",
    message: `Your evidence capture window is open now${promptLabel ? ` (${promptLabel})` : ""}.`,
    priority: 2,
    requireInteraction: true,
    buttons: [{ title: "Log Evidence Now" }, { title: "Snooze" }],
  });
}

function openEvitraceWorkspace() {
  chrome.tabs.create({ url: `${WEB_APP_ORIGIN}/?tab=evidence`, active: true });
}

function clearPromptActiveState() {
  chrome.storage.local.set({
    [STORAGE_KEYS.promptActive]: false,
    [STORAGE_KEYS.snoozeCount]: 0,
    [STORAGE_KEYS.currentPromptLabel]: "",
  });
}

function scheduleSnoozeReminder(sendResponse) {
  chrome.storage.local.get(
    [STORAGE_KEYS.promptActive, STORAGE_KEYS.snoozeMinutes, STORAGE_KEYS.currentPromptLabel],
    (stored) => {
      const promptActive = Boolean(stored[STORAGE_KEYS.promptActive]);
      if (!promptActive) {
        if (sendResponse) sendResponse({ ok: false, reason: "Snooze unavailable" });
        return;
      }
      const snoozeMinutes = Math.max(1, Number(stored[STORAGE_KEYS.snoozeMinutes] ?? 15) || 15);
      chrome.alarms.clear(SNOOZE_ALARM, () => {
        chrome.alarms.create(SNOOZE_ALARM, { when: Date.now() + snoozeMinutes * 60 * 1000 });
        chrome.storage.local.set(
          {
            [STORAGE_KEYS.promptActive]: false,
            [STORAGE_KEYS.snoozeCount]: 1,
            [STORAGE_KEYS.currentPromptLabel]:
              String(stored[STORAGE_KEYS.currentPromptLabel] ?? "").trim() || "Snoozed reminder",
          },
          () => {
            chrome.notifications.clear(PROMPT_NOTIFICATION_ID, () => {
              if (sendResponse) sendResponse({ ok: true, snoozeMinutes });
            });
          },
        );
      });
    },
  );
}

function parseSupabaseAuthToken(rawValue) {
  if (!rawValue) return null;
  let parsed;
  try {
    parsed = JSON.parse(rawValue);
  } catch (_error) {
    return null;
  }

  const directAccessToken = parsed?.access_token;
  const directRefreshToken = parsed?.refresh_token;
  if (typeof directAccessToken === "string" && typeof directRefreshToken === "string") {
    return { accessToken: directAccessToken, refreshToken: directRefreshToken };
  }

  const nested = parsed?.currentSession ?? parsed?.session;
  const nestedAccessToken = nested?.access_token;
  const nestedRefreshToken = nested?.refresh_token;
  if (typeof nestedAccessToken === "string" && typeof nestedRefreshToken === "string") {
    return { accessToken: nestedAccessToken, refreshToken: nestedRefreshToken };
  }

  return null;
}

function decodeJwtPayload(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  try {
    const rawPayload = token.split(".")[1];
    const normalized = rawPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch (_error) {
    return null;
  }
}

function getSupabaseProjectRef(session) {
  const keyMatch = String(session?.storageKey ?? "").match(/^sb-([a-z0-9]+)-auth-token$/i);
  if (keyMatch?.[1]) return keyMatch[1];

  const payload = decodeJwtPayload(session?.accessToken);
  const issuer = String(payload?.iss ?? "");
  const issuerMatch = issuer.match(/https:\/\/([a-z0-9]+)\.supabase\.co\/auth\/v1/i);
  if (issuerMatch?.[1]) return issuerMatch[1];

  return null;
}

function normalizeSupabasePromptPreferences(profileRow, userSettingsRow) {
  const notifications = userSettingsRow?.notifications ?? {};

  const timezone =
    typeof profileRow?.timezone === "string" && profileRow.timezone.trim().length > 0
      ? profileRow.timezone
      : typeof notifications.extensionTimezone === "string" && notifications.extensionTimezone.trim().length > 0
        ? notifications.extensionTimezone
        : defaultConfig()[STORAGE_KEYS.timezone];

  const promptTimes = normalizePromptTimes(
    Array.isArray(profileRow?.prompt_times)
      ? profileRow.prompt_times
      : Array.isArray(notifications.extensionPromptTimes)
        ? notifications.extensionPromptTimes
        : defaultConfig()[STORAGE_KEYS.schedule],
  );

  const weekdaysOnlyRaw =
    typeof profileRow?.weekdays_only === "boolean"
      ? profileRow.weekdays_only
      : typeof notifications.extensionWeekdaysOnly === "boolean"
        ? notifications.extensionWeekdaysOnly
        : defaultConfig()[STORAGE_KEYS.weekdaysOnly];

  const snoozeMinutesRaw =
    Number.isFinite(Number(profileRow?.snooze_duration_minutes))
      ? Number(profileRow.snooze_duration_minutes)
      : Number.isFinite(Number(notifications.extensionSnoozeMinutes))
        ? Number(notifications.extensionSnoozeMinutes)
        : defaultConfig()[STORAGE_KEYS.snoozeMinutes];

  return {
    [STORAGE_KEYS.schedule]: promptTimes,
    [STORAGE_KEYS.timezone]: timezone,
    [STORAGE_KEYS.weekdaysOnly]: Boolean(weekdaysOnlyRaw),
    [STORAGE_KEYS.snoozeMinutes]: Math.max(1, Math.round(snoozeMinutesRaw || 15)),
  };
}

function syncSupabaseProfilePreferences(sendResponse) {
  chrome.storage.local.get([EXT_SUPABASE_SESSION_KEY], async (stored) => {
    const session = stored?.[EXT_SUPABASE_SESSION_KEY];
    const accessToken = session?.accessToken;
    if (typeof accessToken !== "string" || accessToken.trim().length === 0) {
      if (sendResponse) sendResponse({ ok: false, reason: "Missing mirrored session" });
      return;
    }

    const payload = decodeJwtPayload(accessToken);
    const userId = String(payload?.sub ?? "");
    const projectRef = getSupabaseProjectRef(session);
    if (!userId || !projectRef) {
      if (sendResponse) sendResponse({ ok: false, reason: "Unable to resolve Supabase context" });
      return;
    }

    const baseUrl = `https://${projectRef}.supabase.co/rest/v1`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    let profileRow = null;
    let userSettingsRow = null;

    try {
      const profileResponse = await fetch(
        `${baseUrl}/profiles?id=eq.${encodeURIComponent(userId)}&select=timezone,prompt_times,weekdays_only,snooze_duration_minutes&limit=1`,
        { headers },
      );
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (Array.isArray(profileData) && profileData.length > 0) {
          profileRow = profileData[0];
        }
      }
    } catch (_error) {
      // Fall through to user_settings fallback.
    }

    try {
      const settingsResponse = await fetch(
        `${baseUrl}/user_settings?user_id=eq.${encodeURIComponent(userId)}&select=notifications&limit=1`,
        { headers },
      );
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (Array.isArray(settingsData) && settingsData.length > 0) {
          userSettingsRow = settingsData[0];
        }
      }
    } catch (_error) {
      // Ignore fallback errors.
    }

    if (!profileRow && !userSettingsRow) {
      if (sendResponse) sendResponse({ ok: false, reason: "No profile preferences found" });
      return;
    }

    const normalized = normalizeSupabasePromptPreferences(profileRow, userSettingsRow);
    chrome.storage.local.set(normalized, () => {
      schedulePromptAlarms(normalized[STORAGE_KEYS.schedule], normalized[STORAGE_KEYS.timezone]);
      if (sendResponse) {
        sendResponse({
          ok: true,
          syncedAt: Date.now(),
          scheduleCount: normalized[STORAGE_KEYS.schedule].length,
        });
      }
    });
  });
}

function syncSupabaseSessionFromWebApp(sendResponse) {
  chrome.tabs.query({ url: [`${WEB_APP_ORIGIN}/*`] }, (tabs) => {
    if (chrome.runtime.lastError) {
      sendResponse({ ok: false, reason: chrome.runtime.lastError.message });
      return;
    }

    const targetTab =
      tabs.find((tab) => tab.active && typeof tab.id === "number") ??
      tabs.find((tab) => typeof tab.id === "number");
    if (!targetTab?.id) {
      sendResponse({ ok: false, reason: "No web app tab found" });
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: targetTab.id },
        func: () => {
          const entries = [];
          let hasSupabaseAuthKey = false;
          for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (!key || !key.startsWith("sb-") || !key.includes("auth-token")) continue;
            hasSupabaseAuthKey = true;
            const value = localStorage.getItem(key);
            if (typeof value !== "string" || value.trim().length === 0) continue;
            entries.push({ key, value });
          }
          return { entries, hasSupabaseAuthKey };
        },
      },
      (results) => {
        if (chrome.runtime.lastError) {
          sendResponse({ ok: false, reason: chrome.runtime.lastError.message });
          return;
        }

        const scriptResult = results?.[0]?.result ?? {};
        const entries = Array.isArray(scriptResult.entries) ? scriptResult.entries : [];
        const hasSupabaseAuthKey = Boolean(scriptResult.hasSupabaseAuthKey);

        if (!hasSupabaseAuthKey || entries.length === 0) {
          sendResponse({
            ok: false,
            status: "NO_SESSION",
            reason: "No active Supabase session found in web app localStorage",
          });
          return;
        }

        const matchedEntry = entries
          .map((entry) => {
            const parsed = parseSupabaseAuthToken(entry.value);
            if (!parsed) return null;
            return {
              ...parsed,
              storageKey: entry.key,
              sourceUrl: targetTab.url ?? WEB_APP_ORIGIN,
              syncedAt: Date.now(),
            };
          })
          .find(Boolean);

        if (!matchedEntry) {
          sendResponse({
            ok: false,
            status: "SYNC_FAILED",
            reason: "Supabase auth token format invalid",
          });
          return;
        }

        chrome.storage.local.set(
          {
            [EXT_SUPABASE_SESSION_KEY]: matchedEntry,
            [EXT_SUPABASE_SESSION_SYNCED_AT_KEY]: matchedEntry.syncedAt,
          },
          () => {
            if (chrome.runtime.lastError) {
              sendResponse({ ok: false, reason: chrome.runtime.lastError.message });
              return;
            }
            sendResponse({
              ok: true,
              syncedAt: matchedEntry.syncedAt,
              storageKey: matchedEntry.storageKey,
            });
          },
        );
      },
    );
  });
}

function syncSupabaseSessionThenProfile(reason) {
  syncSupabaseProfilePreferences(() => {
    void reason;
  });
  syncSupabaseSessionFromWebApp((sessionResponse) => {
    if (!sessionResponse?.ok && sessionResponse?.status !== "NO_SESSION") {
      return;
    }
    syncSupabaseProfilePreferences(() => {
      void reason;
    });
  });
}

function initializeReminderEngine(reason) {
  chrome.storage.local.get(Object.values(STORAGE_KEYS), (stored) => {
    const merged = { ...defaultConfig(), ...stored };
    chrome.storage.local.set(merged, () => {
      chrome.alarms.clearAll(() => {
        schedulePromptAlarms(merged[STORAGE_KEYS.schedule], merged[STORAGE_KEYS.timezone]);
        chrome.alarms.create(PROFILE_SYNC_ALARM, {
          when: Date.now() + 30 * 1000,
          periodInMinutes: PROFILE_SYNC_PERIOD_MINUTES,
        });
        syncSupabaseSessionThenProfile(reason);
      });
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  initializeReminderEngine("installed");
});

chrome.runtime.onStartup.addListener(() => {
  initializeReminderEngine("startup");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "UPDATE_PROMPT_CONFIG") {
    const scheduleTimes = normalizePromptTimes(message.scheduleTimes);
    const payload = {
      [STORAGE_KEYS.schedule]: scheduleTimes,
      [STORAGE_KEYS.snoozeMinutes]:
        Number.isFinite(Number(message.snoozeMinutes)) && Number(message.snoozeMinutes) > 0
          ? Number(message.snoozeMinutes)
          : 15,
      [STORAGE_KEYS.weekdaysOnly]: message.weekdaysOnly !== false,
      [STORAGE_KEYS.timezone]:
        typeof message.timezone === "string" && message.timezone.trim().length > 0
          ? message.timezone
          : defaultConfig()[STORAGE_KEYS.timezone],
    };
    chrome.storage.local.set(payload, () => {
      schedulePromptAlarms(scheduleTimes, payload[STORAGE_KEYS.timezone]);
      sendResponse({ ok: true });
    });
    return true;
  }

  if (message?.type === "SNOOZE_PROMPT") {
    scheduleSnoozeReminder(sendResponse);
    return true;
  }

  if (message?.type === "CLEAR_PROMPT_ACTIVE") {
    clearPromptActiveState();
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === "SYNC_SUPABASE_SESSION") {
    syncSupabaseSessionFromWebApp(sendResponse);
    return true;
  }

  if (message?.type === "SYNC_PROFILE_PROMPT_CONFIG") {
    syncSupabaseProfilePreferences(sendResponse);
    return true;
  }

  return false;
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes[EXT_SUPABASE_SESSION_KEY]) {
    syncSupabaseProfilePreferences();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === PROFILE_SYNC_ALARM) {
    syncSupabaseProfilePreferences();
    return;
  }

  chrome.storage.local.get(
    [STORAGE_KEYS.weekdaysOnly, STORAGE_KEYS.schedule, STORAGE_KEYS.currentPromptLabel],
    (stored) => {
      const weekdaysOnly = Boolean(stored[STORAGE_KEYS.weekdaysOnly]);

      const isReminderAlarm =
        alarm.name.startsWith(ALARM_TRIGGER_PREFIX) ||
        alarm.name.startsWith(ALARM_WARNING_PREFIX) ||
        alarm.name.startsWith(ALARM_PREFIX) ||
        alarm.name === SNOOZE_ALARM;

      if (isReminderAlarm && shouldSuppressWeekend(weekdaysOnly)) {
        return;
      }

      if (alarm.name.startsWith(ALARM_WARNING_PREFIX)) {
        showWarningReminder();
        return;
      }

      if (
        alarm.name.startsWith(ALARM_TRIGGER_PREFIX) ||
        alarm.name.startsWith(ALARM_PREFIX) ||
        alarm.name === SNOOZE_ALARM
      ) {
        const schedule = Array.isArray(stored[STORAGE_KEYS.schedule])
          ? stored[STORAGE_KEYS.schedule]
          : defaultConfig()[STORAGE_KEYS.schedule];
        const slotIndex = Number(
          alarm.name
            .replace(ALARM_TRIGGER_PREFIX, "")
            .replace(ALARM_PREFIX, "")
            .replace(ALARM_WARNING_PREFIX, ""),
        ) || 0;
        const promptLabel =
          alarm.name === SNOOZE_ALARM
            ? String(stored[STORAGE_KEYS.currentPromptLabel] ?? "Snoozed reminder")
            : `Prompt ${slotIndex + 1} • ${schedule[slotIndex] ?? schedule[0] ?? "16:00"}`;

        chrome.storage.local.set({
          [STORAGE_KEYS.promptActive]: true,
          [STORAGE_KEYS.snoozeCount]: 0,
          [STORAGE_KEYS.currentPromptLabel]: promptLabel,
        });
        showCaptureReminder(promptLabel);
      }
    },
  );
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId !== PROMPT_NOTIFICATION_ID) return;
  if (buttonIndex === 0) {
    chrome.notifications.clear(PROMPT_NOTIFICATION_ID, () => {
      clearPromptActiveState();
      openEvitraceWorkspace();
    });
    return;
  }
  if (buttonIndex === 1) {
    scheduleSnoozeReminder();
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId !== PROMPT_NOTIFICATION_ID) return;
  chrome.notifications.clear(PROMPT_NOTIFICATION_ID, () => {
    clearPromptActiveState();
    openEvitraceWorkspace();
  });
});
