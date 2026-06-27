export type Tab =
  | "dashboard"
  | "radar"
  | "evidence"
  | "objectives"
  | "knowledge"
  | "feedback"
  | "report"
  | "settings";

const NAV_TABS: Tab[] = [
  "dashboard",
  "radar",
  "evidence",
  "objectives",
  "knowledge",
  "feedback",
  "report",
  "settings",
];

export function isTab(value: string | undefined): value is Tab {
  return Boolean(value && NAV_TABS.includes(value as Tab));
}

export type SettingsSection =
  | "profile"
  | "team"
  | "notifications"
  | "extension"
  | "framework"
  | "dashboard";

const SETTINGS_SECTIONS: SettingsSection[] = [
  "profile",
  "team",
  "notifications",
  "extension",
  "framework",
  "dashboard",
];

export function isSettingsSection(value: string | undefined): value is SettingsSection {
  return Boolean(value && SETTINGS_SECTIONS.includes(value as SettingsSection));
}
