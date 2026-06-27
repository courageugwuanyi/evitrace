import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { NavigateFn } from "@tanstack/react-router";
import type { GlobalSearchResultItem } from "@/features/home/shell/home-route-contracts";
import type { SettingsSection, Tab } from "@/features/home/shared/navigation";
import { getSettingsSectionPath, getTabPath } from "@/features/home/shell/route-state";

type UseHomeNavigationActionsParams = {
  navigate: NavigateFn;
  settingsSection: SettingsSection;
  setMobileSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setGlobalSearchQuery: Dispatch<SetStateAction<string>>;
};

export function useHomeNavigationActions({
  navigate,
  settingsSection,
  setMobileSidebarOpen,
  setGlobalSearchQuery,
}: UseHomeNavigationActionsParams) {
  const handleTabChange = useCallback(
    (nextTab: Tab) => {
      setMobileSidebarOpen(false);
      const destination = nextTab === "settings" ? getSettingsSectionPath(settingsSection) : getTabPath(nextTab);
      void navigate({ to: destination });
    },
    [navigate, setMobileSidebarOpen, settingsSection],
  );

  const handleSettingsSectionChange = useCallback(
    (nextSection: SettingsSection) => {
      setMobileSidebarOpen(false);
      void navigate({ to: getSettingsSectionPath(nextSection) });
    },
    [navigate, setMobileSidebarOpen],
  );

  const handleGlobalSearchSelect = useCallback(
    (result: GlobalSearchResultItem) => {
      setGlobalSearchQuery("");
      handleTabChange(result.section);
    },
    [handleTabChange, setGlobalSearchQuery],
  );

  return {
    handleTabChange,
    handleSettingsSectionChange,
    handleGlobalSearchSelect,
  };
}
