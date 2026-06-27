import type { InboxItem } from "@/lib/api/mappers";
import type { SettingsSection, Tab } from "@/features/home/shared/navigation";

export type GlobalSearchSection = "objectives" | "evidence" | "knowledge";

export type GlobalSearchResultItem = {
  id: string;
  title: string;
  description: string;
  section: GlobalSearchSection;
};

export type InboxViewItem = InboxItem & { isSample?: boolean };

export type InboxConfirmPayload = {
  title: string;
  description: string;
  category: string;
  subcategory: string;
};

export type HomeRouteAppProps = {
  activeTab: Tab;
  activeSettingsSection?: SettingsSection;
  openCaptureOnLoad?: boolean;
};
