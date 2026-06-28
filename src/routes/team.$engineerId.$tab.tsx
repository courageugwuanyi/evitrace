import { createFileRoute, redirect } from "@tanstack/react-router";
import { HomeRouteApp } from "@/features/home/shell/home-route-app";
import { homeRouteHead } from "@/features/home/shell/route-config";
import { isTab, type Tab } from "@/features/home/shared/navigation";

const ALLOWED_MANAGER_TABS: Tab[] = ["evidence", "objectives", "radar", "report"];

export const Route = createFileRoute("/team/$engineerId/$tab")({
  head: homeRouteHead,
  beforeLoad: ({ params }) => {
    const maybeTab = params.tab;
    if (!isTab(maybeTab) || !ALLOWED_MANAGER_TABS.includes(maybeTab)) {
      throw redirect({
        to: "/team/$engineerId/$tab",
        params: {
          engineerId: params.engineerId,
          tab: "evidence",
        },
        replace: true,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { engineerId, tab } = Route.useParams();
  const activeTab: Tab =
    isTab(tab) && ALLOWED_MANAGER_TABS.includes(tab) ? tab : "evidence";

  return <HomeRouteApp activeTab={activeTab} routedEngineerId={engineerId} />;
}
