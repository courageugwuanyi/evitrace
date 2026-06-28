import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import type { NotificationPrefs } from "@/lib/api/mappers";
import { useSaveNotifications, useSettingsQuery } from "@/lib/api/settings";
import { useAuth } from "@/lib/auth";
import { getCurrentTimeZone } from "@/lib/datetime";
import { getSafeErrorMessage } from "@/lib/safe-error-message";
import { supabase } from "@/lib/supabase";
import { SettingRow, Toggle } from "@/features/home/settings/settings-ui";
import { C, Card } from "@/features/home/shared/ui-kit";

export function NotificationsSettings() {
  const { userId } = useAuth();
  const settingsUserId = userId ?? "";
  const queryClient = useQueryClient();
  const { data: settings } = useSettingsQuery(settingsUserId);
  const saveNotificationsMutation = useSaveNotifications(settingsUserId);
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  const [c, setC] = useState(false);
  const [d, setD] = useState(true);
  const [timeSlots, setTimeSlots] = useState<string[]>(["16:00"]);
  const [snoozeMinutes, setSnoozeMinutes] = useState(15);
  const [weekdaysOnly, setWeekdaysOnly] = useState(true);
  const [timezone, setTimezone] = useState(getCurrentTimeZone());

  function normalizeWallClockTime(value: string): string | null {
    const trimmed = value.trim();
    const direct = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (direct) {
      const hour = Number(direct[1]);
      const minute = Number(direct[2]);
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      }
      return null;
    }
    const embedded = trimmed.match(/(?:T|\s)(\d{2}):(\d{2})/);
    if (!embedded) return null;
    return `${embedded[1]}:${embedded[2]}`;
  }

  const timezoneOptions = [
    { label: "London", value: "Europe/London" },
    { label: "New York", value: "America/New_York" },
    { label: "Los Angeles", value: "America/Los_Angeles" },
    { label: "Paris / Berlin", value: "Europe/Paris" },
    { label: "India (IST)", value: "Asia/Kolkata" },
    { label: "Singapore", value: "Asia/Singapore" },
    { label: "Tokyo", value: "Asia/Tokyo" },
    { label: "Sydney", value: "Australia/Sydney" },
    { label: "Universal Time", value: "UTC" },
  ];
  const validTimezoneValues = new Set(timezoneOptions.map((option) => option.value));

  function normalizeTimezoneValue(value: string | undefined) {
    const systemZone = getCurrentTimeZone();
    const fallback = validTimezoneValues.has(systemZone) ? systemZone : "UTC";
    if (!value) return fallback;
    const trimmed = value.trim();
    if (validTimezoneValues.has(trimmed)) return trimmed;

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
    const migrated = legacyMap[trimmed];
    if (migrated && validTimezoneValues.has(migrated)) return migrated;
    return fallback;
  }

  const saveProfileTimezoneMutation = useMutation({
    mutationFn: async (nextTimezone: string) => {
      if (!settingsUserId) return;
      const { error } = await (supabase.from("profiles") as any)
        .update({ timezone: nextTimezone })
        .eq("id", settingsUserId);
      if (error) throw error;
    },
    onError: (error: Error) => {
      toast.error(getSafeErrorMessage(error, "Unable to save timezone right now."));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", settingsUserId] });
    },
  });

  const { data: profilePromptTimes = [] } = useQuery({
    queryKey: ["profile-prompt-times", settingsUserId],
    enabled: Boolean(settingsUserId),
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await (supabase.from("profiles") as any)
        .select("prompt_times")
        .eq("id", settingsUserId)
        .maybeSingle();
      if (error) throw error;
      const raw = Array.isArray(data?.prompt_times) ? (data.prompt_times as unknown[]) : [];
      return raw
        .map((value) => normalizeWallClockTime(String(value)))
        .filter((value): value is string => Boolean(value));
    },
  });

  const saveProfilePromptTimesMutation = useMutation({
    mutationFn: async (nextPromptTimes: string[]) => {
      if (!settingsUserId) return;
      const sanitized = nextPromptTimes
        .map((value) => normalizeWallClockTime(String(value)))
        .filter((value): value is string => Boolean(value));
      const payload = sanitized.length > 0 ? sanitized : ["16:00"];
      const { error } = await (supabase.from("profiles") as any)
        .update({ prompt_times: payload })
        .eq("id", settingsUserId);
      if (error) throw error;
    },
    onError: (error: Error) => {
      toast.error(getSafeErrorMessage(error, "Unable to save prompt times right now."));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile-prompt-times", settingsUserId] });
    },
  });

  function sendExtensionConfig(notifications: NotificationPrefs) {
    const chromeApi = (globalThis as typeof globalThis & { chrome?: any }).chrome;
    if (!chromeApi?.runtime?.sendMessage) return;
    chromeApi.runtime.sendMessage({
      type: "UPDATE_PROMPT_CONFIG",
      scheduleTimes: notifications.dailyReminder ? notifications.extensionPromptTimes : [],
      snoozeMinutes: notifications.extensionSnoozeMinutes,
      weekdaysOnly: notifications.extensionWeekdaysOnly,
      timezone: notifications.extensionTimezone,
    });
  }

  useEffect(() => {
    if (!settings) return;
    setA(settings.notifications.dailyReminder);
    setB(settings.notifications.managerApprovals);
    setC(settings.notifications.weeklyDigest);
    setD(settings.notifications.browserPush);
    const normalizedProfileSlots = profilePromptTimes
      .map((value) => normalizeWallClockTime(value))
      .filter((value): value is string => Boolean(value));
    const normalizedSettingsSlots = settings.notifications.extensionPromptTimes
      .map((value) => normalizeWallClockTime(value))
      .filter((value): value is string => Boolean(value));
    const normalizedSlots =
      normalizedProfileSlots.length > 0 ? normalizedProfileSlots : normalizedSettingsSlots;
    setTimeSlots(normalizedSlots.length > 0 ? normalizedSlots : ["16:00"]);
    setSnoozeMinutes(settings.notifications.extensionSnoozeMinutes);
    setWeekdaysOnly(settings.notifications.extensionWeekdaysOnly);
    setTimezone(normalizeTimezoneValue(settings.notifications.extensionTimezone));
  }, [profilePromptTimes, settings]);

  useEffect(() => {
    if (!settings) return;
    sendExtensionConfig(settings.notifications);
  }, [settings]);

  function persist(next: Partial<NotificationPrefs>) {
    if (!settings) return;
    const notifications = { ...settings.notifications, ...next };
    const normalizedPromptTimes = (notifications.extensionPromptTimes ?? [])
      .map((value) => normalizeWallClockTime(String(value)))
      .filter((value): value is string => Boolean(value));
    notifications.extensionPromptTimes =
      normalizedPromptTimes.length > 0 ? [...new Set(normalizedPromptTimes)] : ["16:00"];
    saveNotificationsMutation.mutate(notifications);
    saveProfilePromptTimesMutation.mutate(notifications.extensionPromptTimes);
    sendExtensionConfig(notifications);
  }

  function updateTimeSlot(index: number, nextValue: string) {
    const next = [...timeSlots];
    next[index] = normalizeWallClockTime(nextValue) ?? nextValue;
    setTimeSlots(next);
    const sanitized = [
      ...new Set(next.map((value) => normalizeWallClockTime(value)).filter((value): value is string => Boolean(value))),
    ].sort();
    if (sanitized.length > 0) {
      persist({ extensionPromptTimes: sanitized });
    }
  }

  function addTimeSlot() {
    const next = [...timeSlots, "17:00"];
    setTimeSlots(next);
    persist({
      extensionPromptTimes: [
        ...new Set(
          next.map((value) => normalizeWallClockTime(value)).filter((value): value is string => Boolean(value)),
        ),
      ].sort(),
    });
  }

  function removeTimeSlot(index: number) {
    if (timeSlots.length <= 1) return;
    const next = timeSlots.filter((_, slotIndex) => slotIndex !== index);
    setTimeSlots(next);
    const sanitized = [
      ...new Set(next.map((value) => normalizeWallClockTime(value)).filter((value): value is string => Boolean(value))),
    ].sort();
    persist({ extensionPromptTimes: sanitized.length > 0 ? sanitized : ["16:00"] });
  }

  return (
    <Card className="p-6">
      <div>
        <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
          Notifications
        </h3>
        <p className="text-xs mt-1" style={{ color: C.subtle }}>
          Control how Evitrace reaches you
        </p>
      </div>
      <div className="mt-3">
        <SettingRow
          title="Daily reflection reminder"
          desc="Nudge me at 16:00 to log evidence before close of day."
          right={
            <Toggle
              on={a}
              onChange={() => {
                const checked = !a;
                setA(checked);
                persist({ dailyReminder: checked });
              }}
            />
          }
        />
        <SettingRow
          title="Manager approvals"
          desc="Email me when my manager approves or comments."
          right={
            <Toggle
              on={b}
              onChange={() => {
                const checked = !b;
                setB(checked);
                persist({ managerApprovals: checked });
              }}
            />
          }
        />
        <SettingRow
          title="Weekly digest"
          desc="Monday summary of evidence, gaps, and objective progress."
          right={
            <Toggle
              on={c}
              onChange={() => {
                const checked = !c;
                setC(checked);
                persist({ weeklyDigest: checked });
              }}
            />
          }
        />
        <SettingRow
          title="Browser push"
          desc="Show desktop notifications from the Evitrace extension."
          right={
            <Toggle
              on={d}
              onChange={() => {
                const checked = !d;
                setD(checked);
                persist({ browserPush: checked });
              }}
            />
          }
        />
        <div
          className="flex items-start justify-between py-3 border-b last:border-b-0"
          style={{ borderColor: C.border }}
        >
          <div className="pr-6 min-w-0">
            <div className="text-sm font-semibold" style={{ color: C.navy }}>
              Extension prompt times
            </div>
            <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
              Add one or more reminder times. These drive extension prompt alarms.
            </div>
          </div>
          <div className="w-[220px] space-y-2">
            {timeSlots.map((slot, idx) => (
              <div key={`slot-${idx}`} className="flex items-center gap-2">
                <input
                  type="time"
                  value={slot}
                  onChange={(event) => updateTimeSlot(idx, event.target.value)}
                  className="h-9 w-full px-2 rounded border text-sm bg-[#F4F5F7] focus:bg-white outline-none"
                  style={{ borderColor: C.border, color: C.navy }}
                />
                <button
                  type="button"
                  onClick={() => removeTimeSlot(idx)}
                  disabled={timeSlots.length <= 1}
                  className="h-9 w-9 rounded border inline-flex items-center justify-center disabled:opacity-50"
                  style={{ borderColor: C.border, color: C.slate }}
                  title="Remove time"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTimeSlot}
              className="h-8 px-2.5 rounded border inline-flex items-center gap-1 text-xs font-semibold"
              style={{ borderColor: C.border, color: C.primary }}
            >
              <Plus size={12} />
              Add time slot
            </button>
          </div>
        </div>
        <SettingRow
          title="Weekdays only"
          desc="Only trigger reminders Monday through Friday."
          right={
            <Toggle
              on={weekdaysOnly}
              onChange={() => {
                const checked = !weekdaysOnly;
                setWeekdaysOnly(checked);
                persist({ extensionWeekdaysOnly: checked });
              }}
            />
          }
        />
        <div
          className="flex items-center justify-between py-3 border-b last:border-b-0"
          style={{ borderColor: C.border }}
        >
          <div className="pr-6 min-w-0">
            <div className="text-sm font-semibold" style={{ color: C.navy }}>
              Snooze duration
            </div>
            <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
              One-time snooze window for each prompt event.
            </div>
          </div>
          <div className="w-[120px]">
            <select
              value={String(snoozeMinutes)}
              onChange={(event) => {
                const next = Number(event.target.value);
                setSnoozeMinutes(next);
                persist({ extensionSnoozeMinutes: next });
              }}
              className="h-9 w-full px-2 rounded border text-sm bg-[#F4F5F7] focus:bg-white outline-none"
              style={{ borderColor: C.border, color: C.navy }}
            >
              {[5, 10, 15, 20, 30, 45, 60].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
          </div>
        </div>
        <SettingRow
          title="Application Tracking Time Zone"
          desc="Standardized UTC offset used for reminders and profile-level tracking."
          right={
            <select
              value={timezone}
              onChange={(event) => {
                const next = normalizeTimezoneValue(event.target.value);
                setTimezone(next);
                persist({ extensionTimezone: next });
                saveProfileTimezoneMutation.mutate(next);
              }}
              className="h-9 w-[270px] px-2 rounded border text-sm bg-[#F4F5F7] focus:bg-white outline-none"
              style={{ borderColor: C.border, color: C.navy }}
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          }
        />
      </div>
    </Card>
  );
}
