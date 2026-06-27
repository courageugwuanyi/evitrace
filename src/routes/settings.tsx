import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { homeRouteHead } from "@/features/home/shell/route-config";

export const Route = createFileRoute("/settings")({
  head: homeRouteHead,
  beforeLoad: ({ location }) => {
    if (location.pathname === "/settings") {
      throw redirect({ to: "/settings/profile" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
