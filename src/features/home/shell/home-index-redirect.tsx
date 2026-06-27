import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { resolveLegacyHomePath } from "@/features/home/shell/route-state";

type LegacyHomeSearch = {
  tab?: string;
  section?: string;
  action?: string;
};

export function HomeIndexRedirect({
  search,
  children,
}: {
  search: LegacyHomeSearch;
  children: (openCaptureOnLoad: boolean) => React.ReactNode;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const nextPath = resolveLegacyHomePath(search);
    if (!nextPath) return;
    void navigate({ to: nextPath, replace: true });
  }, [navigate, search]);

  return <>{children(search.action === "capture")}</>;
}
