import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

type WorkspacePersona = "engineer" | "manager";
type SyncPayload = Record<string, unknown>;

export function useLiveAssessmentSync(engineerId: string | null, activePersona: WorkspacePersona) {
  const [sharedState, setSharedState] = useState<SyncPayload>({});
  const [isSyncActive, setIsSyncActive] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!engineerId) {
      setIsSyncActive(false);
      channelRef.current = null;
      return;
    }

    const channelName = `workspace-sync-${engineerId}`;
    const syncChannel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = syncChannel;

    syncChannel
      .on("broadcast", { event: "ui_delta_change" }, ({ payload }) => {
        setIsSyncActive(true);
        setSharedState((prev) => ({ ...prev, ...(payload as SyncPayload) }));
      })
      .on("broadcast", { event: "session_terminated" }, () => {
        setIsSyncActive(false);
        if (activePersona === "engineer") {
          toast.info(
            "Calibration workspace session finalized by manager. Returning to independent mode.",
          );
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsSyncActive(true);
        }
      });

    return () => {
      channelRef.current = null;
      void supabase.removeChannel(syncChannel);
    };
  }, [engineerId, activePersona]);

  const broadcastDelta = (field: string, value: unknown) => {
    if (activePersona !== "manager" || !engineerId || !channelRef.current) return;

    const delta: SyncPayload = { [field]: value };
    setSharedState((prev) => ({ ...prev, ...delta }));

    void channelRef.current.send({
      type: "broadcast",
      event: "ui_delta_change",
      payload: delta,
    });
  };

  return { sharedState, broadcastDelta, isSyncActive };
}
