import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/team/$engineerId")({
  beforeLoad: ({ params, location }) => {
    if (location.pathname === `/team/${params.engineerId}`) {
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
  return <Outlet />;
}
