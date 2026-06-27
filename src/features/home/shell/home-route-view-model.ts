import type { Tab } from "@/features/home/shared/navigation";

export const HOME_PAGE_TITLES: Record<Tab, string> = {
  dashboard: "Dashboard",
  radar: "Promotion Readiness",
  evidence: "Evidence Log",
  objectives: "Objectives",
  knowledge: "Knowledge Hub",
  feedback: "360 Feedback",
  report: "Reviews & Reports",
  settings: "Settings",
};

export function getWorkspaceMemberInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function formatWorkspaceActivityStatus(lastActivityAt: string | null): string {
  if (!lastActivityAt) return "No recent evidence activity";

  const ts = new Date(lastActivityAt).getTime();
  if (Number.isNaN(ts)) return "Activity timestamp unavailable";

  const elapsedMs = Date.now() - ts;
  const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / (1000 * 60)));
  if (elapsedMinutes < 60) return `Active ${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `Active ${elapsedHours}h ago`;
  if (elapsedHours < 48) return "Logged evidence yesterday";

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `Logged evidence ${elapsedDays}d ago`;
}
