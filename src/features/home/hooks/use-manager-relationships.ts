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
  const [selectedEngineerId, setSelectedEngineerId] = useState<string | null>(null);
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
      if (!userId) {
        if (!active) return;
        setManagedEngineers([]);
        setSelectedEngineerId(null);
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
          setSelectedEngineerId(null);
        }
        return;
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
        setSelectedEngineerId(null);
        return;
      }

      const { data: profiles, error: profilesError } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, email")
        .in("id", engineerIds);

      if (profilesError) {
        if (active) {
          setManagedEngineers([]);
          setSelectedEngineerId(null);
        }
        return;
      }

      const nextManaged = ((profiles ?? []) as Array<{
        id: string;
        full_name: string | null;
        email: string | null;
      }>)
        .map((profile) => ({
          id: profile.id,
          fullName: profile.full_name?.trim() || "Unknown Engineer",
          email: profile.email?.trim() || "No email",
          status: statusByEngineer[profile.id] ?? "active",
          currentUserRole: rolesByEngineer[profile.id]?.hasDirectManager
            ? rolesByEngineer[profile.id]?.hasSkipLevel
              ? "both"
              : "manager"
            : "skip_level",
          isOutgoingDirectManagerInHandover: Boolean(outgoingDirectHandoverByEngineer[profile.id]),
        }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName));

      if (!active) return;
      setManagedEngineers(nextManaged);
      setSelectedEngineerId((prev) => {
        if (prev && nextManaged.some((engineer) => engineer.id === prev)) {
          return prev;
        }
        return null;
      });
    }

    void loadManagedEngineers();

    return () => {
      active = false;
    };
  }, [userId, managerRelationshipsRefreshNonce]);

  useEffect(() => {
    if (managedEngineers.length === 0) {
      setActiveView("directory");
      setSelectedEngineerId(null);
    }
  }, [managedEngineers.length]);

  useEffect(() => {
    if (managedEngineers.length === 0) return;
    setHasManagerOnboardingContext(false);
    sessionStorage.removeItem(MANAGER_ONBOARDING_CONTEXT_KEY);
  }, [managedEngineers.length]);

  return {
    managedEngineers,
    selectedEngineerId,
    setSelectedEngineerId,
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
