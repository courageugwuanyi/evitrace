import { createFileRoute } from "@tanstack/react-router";
import { HomeRouteApp } from "@/features/home/shell/home-route-app";
import { homeRouteHead } from "@/features/home/shell/route-config";

export const Route = createFileRoute("/settings/team")({
  head: homeRouteHead,
  component: RouteComponent,
});

function RouteComponent() {
  return <HomeRouteApp activeTab="settings" activeSettingsSection="team" />;
}
