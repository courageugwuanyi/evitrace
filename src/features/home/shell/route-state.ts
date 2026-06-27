import type { SettingsSection, Tab } from "@/features/home/shared/navigation";

export function getTabPath(tab: Tab): string {
  switch (tab) {
    case "dashboard":
      return "/";
    case "radar":
      return "/radar";
    case "evidence":
      return "/evidence";
    case "objectives":
      return "/objectives";
    case "knowledge":
      return "/knowledge";
    case "feedback":
      return "/feedback";
    case "report":
      return "/report";
    case "settings":
      return "/settings/profile";
    default:
      return "/";
  }
}

export function getSettingsSectionPath(section: SettingsSection): string {
  switch (section) {
    case "profile":
      return "/settings/profile";
    case "team":
      return "/settings/team";
    case "notifications":
      return "/settings/notifications";
    case "extension":
      return "/settings/extension";
    case "framework":
      return "/settings/framework";
    case "dashboard":
      return "/settings/dashboard";
    default:
      return "/settings/profile";
  }
}

export function resolveLegacyHomePath(input: {
  tab?: string;
  section?: string;
  action?: string;
}): string | null {
  if (input.action === "capture") {
    return "/evidence";
  }

  if (!input.tab) return null;
  if (input.tab === "settings") {
    return getSettingsSectionPath((input.section as SettingsSection) || "profile");
  }

  return getTabPath(input.tab as Tab);
}
