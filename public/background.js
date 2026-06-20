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
const SNOOZE_ALARM = "evitrace-snooze";

function defaultConfig() {
  return {
    [STORAGE_KEYS.schedule]: ["16:00"],
    [STORAGE_KEYS.snoozeMinutes]: 15,
    [STORAGE_KEYS.weekdaysOnly]: true,
    [STORAGE_KEYS.timezone]: "GMT",
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

function nextAlarmTimeMs(timeText) {
  const parsed = parseHourMinute(timeText);
  if (!parsed) return null;
  const now = new Date();
  const next = new Date(now);
  next.setHours(parsed.hour, parsed.minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

function clearPromptAlarms(callback) {
  chrome.alarms.getAll((alarms) => {
    const clearTargets = alarms
      .map((alarm) => alarm.name)
      .filter((name) => name.startsWith(ALARM_PREFIX) || name === SNOOZE_ALARM);
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

function schedulePromptAlarms(times) {
  clearPromptAlarms(() => {
    times.forEach((timeText, index) => {
      const when = nextAlarmTimeMs(timeText);
      if (!when) return;
      chrome.alarms.create(`${ALARM_PREFIX}${index}`, {
        when,
        periodInMinutes: 24 * 60,
      });
    });
  });
}

function showCaptureReminder(promptLabel) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/evitrace-icon.svg",
    title: "Evitrace Reminder",
    message: `Time to log what you learned${promptLabel ? ` (${promptLabel})` : ""}.`,
    priority: 2,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(Object.values(STORAGE_KEYS), (stored) => {
    chrome.storage.local.set({ ...defaultConfig(), ...stored }, () => {
      const schedule = stored[STORAGE_KEYS.schedule] ?? defaultConfig()[STORAGE_KEYS.schedule];
      schedulePromptAlarms(Array.isArray(schedule) ? schedule : ["16:00"]);
    });
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "UPDATE_PROMPT_CONFIG") {
    const nextSchedule = Array.isArray(message.scheduleTimes)
      ? message.scheduleTimes.filter((timeText) => parseHourMinute(timeText))
      : [];
    const scheduleTimes = nextSchedule;
    const payload = {
      [STORAGE_KEYS.schedule]: scheduleTimes,
      [STORAGE_KEYS.snoozeMinutes]:
        Number.isFinite(message.snoozeMinutes) && message.snoozeMinutes > 0
          ? message.snoozeMinutes
          : 15,
      [STORAGE_KEYS.weekdaysOnly]: message.weekdaysOnly !== false,
      [STORAGE_KEYS.timezone]: typeof message.timezone === "string" ? message.timezone : "GMT",
    };
    chrome.storage.local.set(payload, () => {
      schedulePromptAlarms(scheduleTimes);
      sendResponse({ ok: true });
    });
    return true;
  }

  if (message?.type === "SNOOZE_PROMPT") {
    chrome.storage.local.get(
      [
        STORAGE_KEYS.promptActive,
        STORAGE_KEYS.snoozeCount,
        STORAGE_KEYS.snoozeMinutes,
        STORAGE_KEYS.currentPromptLabel,
      ],
      (stored) => {
        const promptActive = Boolean(stored[STORAGE_KEYS.promptActive]);
        const snoozeCount = Number(stored[STORAGE_KEYS.snoozeCount] ?? 0);
        if (!promptActive || snoozeCount >= 1) {
          sendResponse({ ok: false, reason: "Snooze unavailable" });
          return;
        }

        const snoozeMinutes = Number(stored[STORAGE_KEYS.snoozeMinutes] ?? 15);
        chrome.alarms.create(SNOOZE_ALARM, { when: Date.now() + snoozeMinutes * 60 * 1000 });
        chrome.storage.local.set(
          {
            [STORAGE_KEYS.snoozeCount]: 1,
            [STORAGE_KEYS.currentPromptLabel]:
              stored[STORAGE_KEYS.currentPromptLabel] ?? "Snoozed reminder",
          },
          () => sendResponse({ ok: true }),
        );
      },
    );
    return true;
  }

  if (message?.type === "CLEAR_PROMPT_ACTIVE") {
    chrome.storage.local.set(
      {
        [STORAGE_KEYS.promptActive]: false,
        [STORAGE_KEYS.snoozeCount]: 0,
        [STORAGE_KEYS.currentPromptLabel]: "",
      },
      () => sendResponse({ ok: true }),
    );
    return true;
  }

  return false;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.local.get(
    [STORAGE_KEYS.weekdaysOnly, STORAGE_KEYS.schedule, STORAGE_KEYS.currentPromptLabel],
    (stored) => {
      const weekdaysOnly = Boolean(stored[STORAGE_KEYS.weekdaysOnly]);
      const today = new Date().getDay();
      const isWeekend = today === 0 || today === 6;

      if (alarm.name.startsWith(ALARM_PREFIX) && weekdaysOnly && isWeekend) {
        return;
      }

      if (alarm.name.startsWith(ALARM_PREFIX) || alarm.name === SNOOZE_ALARM) {
        const schedule = Array.isArray(stored[STORAGE_KEYS.schedule])
          ? stored[STORAGE_KEYS.schedule]
          : ["16:00"];
        const slotIndex = Number(alarm.name.replace(ALARM_PREFIX, "")) || 0;
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
