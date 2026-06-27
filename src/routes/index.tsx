import { createFileRoute } from "@tanstack/react-router";
import { homeRouteHead, validateHomeSearch } from "@/features/home/shell/route-config";
import { HomeIndexRedirect } from "@/features/home/shell/home-index-redirect";
import { HomeRouteApp } from "@/features/home/shell/home-route-app";

export const Route = createFileRoute("/")({
  validateSearch: validateHomeSearch,
  head: homeRouteHead,
  component: HomeIndexRoute,
});

function HomeIndexRoute() {
  const { tab, section, action } = Route.useSearch();
  return (
    <HomeIndexRedirect search={{ tab, section, action }}>
      {(openCaptureOnLoad) => (
        <HomeRouteApp activeTab="dashboard" openCaptureOnLoad={openCaptureOnLoad} />
      )}
    </HomeIndexRedirect>
  );
}
