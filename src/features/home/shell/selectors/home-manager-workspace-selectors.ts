import type { Tab } from "@/features/home/shared/navigation";

type ManagedEngineerLike = {
  id: string;
  currentUserRole?: string | null;
  status?: string | null;
  isOutgoingDirectManagerInHandover?: boolean | null;
};

export function deriveHomeWorkspaceScope(args: {
  activeView: string;
  selectedEngineerId: string | null;
  managedEngineersCount: number;
  tab: Tab;
  userId: string;
}) {
  const isManagerWorkspace = args.activeView === "profile" && Boolean(args.selectedEngineerId);
  const isManagerDirectoryView =
    args.managedEngineersCount > 0 && args.activeView === "directory" && args.tab === "dashboard";
  const activeWorkspaceId =
    isManagerWorkspace && args.selectedEngineerId ? args.selectedEngineerId : args.userId;
  const notificationTargetUserId =
    isManagerWorkspace && args.selectedEngineerId ? args.selectedEngineerId : args.userId;

  return {
    isManagerWorkspace,
    isManagerDirectoryView,
    activeWorkspaceId,
    notificationTargetUserId,
  };
}

export function pickWorkspaceData<T>(args: {
  isManagerWorkspace: boolean;
  managerWorkspaceData: T;
  personalWorkspaceData: T;
}): T {
  return args.isManagerWorkspace ? args.managerWorkspaceData : args.personalWorkspaceData;
}

export function getSelectedEngineerRole(args: {
  selectedEngineerId: string | null;
  isManagerWorkspace: boolean;
  managedEngineers: ManagedEngineerLike[];
}): string | null {
  if (!args.selectedEngineerId || !args.isManagerWorkspace) return null;
  const selected = args.managedEngineers.find((engineer) => engineer.id === args.selectedEngineerId);
  return selected?.currentUserRole ?? null;
}

export function shouldShowTeamTransitionCard(args: {
  selectedEngineerId: string | null;
  isManagerWorkspace: boolean;
  managedEngineers: ManagedEngineerLike[];
}): boolean {
  if (!args.selectedEngineerId || !args.isManagerWorkspace) return false;
  const selected = args.managedEngineers.find((engineer) => engineer.id === args.selectedEngineerId);
  return Boolean(selected?.status === "in_handover" && selected.isOutgoingDirectManagerInHandover);
}
