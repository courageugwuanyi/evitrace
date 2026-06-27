import { Bell, Layers, LayoutDashboard, Puzzle, User } from "lucide-react";
import type { SettingsSection } from "@/features/home/shared/navigation";

export type ProfileTeamDraft = {
  fullName: string;
  email: string;
  currentLevel: string;
  targetLevel: string;
  manager: string;
  managerEmail: string;
  team: string;
  skipLevel: string;
};

type SettingsUserSnapshot = {
  fullName?: string | null;
  email?: string | null;
  currentLevel?: string | null;
  targetLevel?: string | null;
  manager?: string | null;
  managerEmail?: string | null;
  team?: string | null;
  skipLevel?: string | null;
};

export const EMPTY_PROFILE_TEAM_DRAFT: ProfileTeamDraft = {
  fullName: "",
  email: "",
  currentLevel: "",
  targetLevel: "",
  manager: "",
  managerEmail: "",
  team: "",
  skipLevel: "",
};

export function profileTeamDraftFromUser(user: SettingsUserSnapshot | null | undefined): ProfileTeamDraft {
  if (!user) return EMPTY_PROFILE_TEAM_DRAFT;
  return {
    fullName: user.fullName ?? "",
    email: user.email ?? "",
    currentLevel: user.currentLevel ?? "",
    targetLevel: user.targetLevel ?? "",
    manager: user.manager ?? "",
    managerEmail: user.managerEmail ?? "",
    team: user.team ?? "",
    skipLevel: user.skipLevel ?? "",
  };
}

export function hasProfileTeamDraftChanges(
  draft: ProfileTeamDraft,
  user: SettingsUserSnapshot | null | undefined,
): boolean {
  if (!user) return false;
  return (
    draft.fullName.trim() !== (user.fullName ?? "").trim() ||
    draft.email.trim() !== (user.email ?? "").trim() ||
    draft.currentLevel.trim() !== (user.currentLevel ?? "").trim() ||
    draft.targetLevel.trim() !== (user.targetLevel ?? "").trim() ||
    draft.manager.trim() !== (user.manager ?? "").trim() ||
    draft.managerEmail.trim() !== (user.managerEmail ?? "").trim() ||
    draft.team.trim() !== (user.team ?? "").trim() ||
    draft.skipLevel.trim() !== (user.skipLevel ?? "").trim()
  );
}

export const SETTINGS_SECTION_ITEMS: Array<{
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}> = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "extension", label: "Extension Preferences", icon: Puzzle },
  { id: "framework", label: "Competency Framework", icon: Layers },
  { id: "dashboard", label: "Sample Content", icon: LayoutDashboard },
];
