import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MANAGER_ONBOARDING_CONTEXT_KEY } from "@/features/home/shared/constants";

export type ManagedEngineer = {
  id: string;
  fullName: string;
  email: string;
  status: "active" | "in_handover";
  currentUserRole: "manager" | "skip_level" | "both";
  isOutgoingDirectManagerInHandover: boolean;
};

export function useManagerRelationships(userId: string) {
  const [managedEngineers, setManagedEngineers] = useState<ManagedEngineer[]>([]);
  const [isLoadingManagedEngineers, setIsLoadingManagedEngineers] = useState(true);
  const [activeView, setActiveView] = useState<"directory" | "profile">("directory");
  const [managerRelationshipsRefreshNonce, setManagerRelationshipsRefreshNonce] = useState(0);
  const [handoverNotes, setHandoverNotes] = useState("");
  const [isSigningOffTransfer, setIsSigningOffTransfer] = useState(false);
  const [hasManagerOnboardingContext, setHasManagerOnboardingContext] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHasManagerOnboardingContext(sessionStorage.getItem(MANAGER_ONBOARDING_CONTEXT_KEY) === "1");
  }, []);

  useEffect(() => {
    let active = true;

    async function loadManagedEngineers() {
      if (active) setIsLoadingManagedEngineers(true);
      try {
        if (!userId) {
          if (!active) return;
          setManagedEngineers([]);
          return;
        }

        const { data: relationships, error: relationshipsError } = await (supabase as any)
          .from("reporting_relationships")
          .select("engineer_id, status, relation_type")
          .eq("manager_id", userId)
          .in("status", ["active", "in_handover"]);

        if (relationshipsError) {
          if (active) {
            setManagedEngineers([]);
          }
          return acc;
        }

        const relationshipRows = (relationships ?? []) as Array<{
          engineer_id: string;
          status: "active" | "in_handover";
          relation_type: "direct_manager" | "skip_level";
        }>;
        const statusByEngineer = relationshipRows.reduce<Record<string, "active" | "in_handover">>(
          (acc, row) => {
            const existing = acc[row.engineer_id];
            if (!existing || row.status === "in_handover") {
              acc[row.engineer_id] = row.status;
            }
            return acc;
          },
          {},
        );
        const rolesByEngineer = relationshipRows.reduce<
          Record<string, { hasDirectManager: boolean; hasSkipLevel: boolean }>
        >((acc, row) => {
          if (!acc[row.engineer_id]) {
            acc[row.engineer_id] = { hasDirectManager: false, hasSkipLevel: false };
          }
          if (row.relation_type === "direct_manager") acc[row.engineer_id].hasDirectManager = true;
          if (row.relation_type === "skip_level") acc[row.engineer_id].hasSkipLevel = true;
          return acc;
        }, {});
        const outgoingDirectHandoverByEngineer = relationshipRows.reduce<Record<string, boolean>>(
          (acc, row) => {
            if (row.relation_type === "direct_manager" && row.status === "in_handover") {
              acc[row.engineer_id] = true;
            }
            return acc;
          },
          {},
        );

        const engineerIds = Object.keys(statusByEngineer);
        if (engineerIds.length === 0) {
          if (!active) return;
          setManagedEngineers([]);
          return;
        }

        const { data: profiles, error: profilesError } = await (supabase as any)
          .from("profiles")
          .select("id, full_name, email")
          .in("id", engineerIds);

        const profileRows = ((profiles ?? []) as Array<{
          id: string;
          full_name: string | null;
          email: string | null;
        }>).reduce<Record<string, { full_name: string | null; email: string | null }>>((acc, row) => {
          acc[row.id] = { full_name: row.full_name, email: row.email };
          return acc;
        }, {});

        const nextManaged = engineerIds
          .map((engineerId) => {
            const profile = profileRows[engineerId];
            return {
              id: engineerId,
              // If profile fetch fails due RLS, keep engineer linkage visible with safe placeholders.
              fullName: profile?.full_name?.trim() || "Connected Engineer",
              email: profile?.email?.trim() || "Profile visibility pending",
              status: statusByEngineer[engineerId] ?? "active",
              currentUserRole: rolesByEngineer[engineerId]?.hasDirectManager
                ? rolesByEngineer[engineerId]?.hasSkipLevel
                  ? "both"
                  : "manager"
                : "skip_level",
              isOutgoingDirectManagerInHandover: Boolean(outgoingDirectHandoverByEngineer[engineerId]),
            } satisfies ManagedEngineer;
          })
          .sort((a, b) => a.fullName.localeCompare(b.fullName));

        if (profilesError) {
          console.warn(
            "[workspace] unable to load managed engineer profiles; using fallback identity rows",
            {
              message: profilesError.message,
            },
          );
        }

        if (!active) return;
        setManagedEngineers(nextManaged);
      } catch (error) {
        console.error("[workspace] failed to load manager relationships:", error);
        if (active) {
          setManagedEngineers([]);
        }
      } finally {
        if (active) {
          setIsLoadingManagedEngineers(false);
        }
      }
    }

    void loadManagedEngineers();

    return () => {
      active = false;
    };
  }, [userId, managerRelationshipsRefreshNonce]);

  useEffect(() => {
    if (managedEngineers.length === 0) {
      setActiveView("directory");
    }
  }, [managedEngineers.length]);

  useEffect(() => {
    if (managedEngineers.length === 0) return;
    setHasManagerOnboardingContext(false);
    sessionStorage.removeItem(MANAGER_ONBOARDING_CONTEXT_KEY);
  }, [managedEngineers.length]);

  return {
    managedEngineers,
    isLoadingManagedEngineers,
    activeView,
    setActiveView,
    managerRelationshipsRefreshNonce,
    setManagerRelationshipsRefreshNonce,
    handoverNotes,
    setHandoverNotes,
    isSigningOffTransfer,
    setIsSigningOffTransfer,
    hasManagerOnboardingContext,
    setHasManagerOnboardingContext,
  };
}
