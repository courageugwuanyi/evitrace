import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type WorkspaceMode = "engineer" | "manager";
const WORKSPACE_MODE_STORAGE_KEY = "evitrace.workspace.mode";
const WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY = "evitrace.workspace.selectedEngineerId";
const WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY = "evitrace_active_engineer_id";
const WORKSPACE_BOOTSTRAPPED_STORAGE_KEY = "evitrace.workspace.bootstrapped";

function readStoredWorkspaceMode(): WorkspaceMode {
  if (typeof window === "undefined") return "manager";
  const stored = window.sessionStorage.getItem(WORKSPACE_MODE_STORAGE_KEY);
  return stored === "engineer" ? "engineer" : "manager";
}

function readStoredSelectedEngineerId(): string | null {
  if (typeof window === "undefined") return null;
  const stored =
    window.sessionStorage.getItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY)?.trim() ??
    window.sessionStorage.getItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY)?.trim();
  return stored ? stored : null;
}

function hasWorkspaceBootstrapped(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(WORKSPACE_BOOTSTRAPPED_STORAGE_KEY) === "1";
}

interface WorkspaceContextType {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  isManagerAccount: boolean;
  linkedEngineers: any[];
  selectedEngineerId: string | null;
  setSelectedEngineerId: (id: string | null) => void;
  loading: boolean;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<WorkspaceMode>(() => readStoredWorkspaceMode());
  const [isManagerAccount, setIsManagerAccount] = useState(false);
  const [linkedEngineers, setLinkedEngineers] = useState<any[]>([]);
  const [selectedEngineerId, setSelectedEngineerIdState] = useState<string | null>(() =>
    readStoredSelectedEngineerId(),
  );
  const [loading, setLoading] = useState(() => !hasWorkspaceBootstrapped());

  const refreshWorkspace = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setIsManagerAccount(false);
        setLinkedEngineers([]);
        setModeState("engineer");
        setSelectedEngineerIdState(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("job_title")
        .eq("id", user.id)
        .single();
      if (profileError) {
        console.warn("[workspace] failed to read profile job title:", profileError.message);
      }

      const isManagerByTitle = profile?.job_title?.toLowerCase().includes("manager");

      const { data: relations, error: relationsError } = await supabase
        .from("reporting_relationships")
        .select(
          `
          engineer_id,
          profiles!engineer_id (id, full_name, job_title, avatar_url)
        `,
        )
        .eq("manager_id", user.id)
        .eq("status", "active");
      if (relationsError) throw relationsError;

      const hasLinkedEngineers = Boolean(relations && relations.length > 0);
      const isManager = Boolean(isManagerByTitle || hasLinkedEngineers);

      setIsManagerAccount(isManager);

      if (hasLinkedEngineers) {
        const engineers = relations.map((r: any) => r.profiles).filter(Boolean);
        setLinkedEngineers(engineers);
      } else {
        setLinkedEngineers([]);
      }

      if (!isManager) {
        setModeState("engineer");
        setSelectedEngineerIdState(null);
      }
    } catch (error) {
      console.error("[workspace] failed to refresh workspace context:", error);
      setIsManagerAccount(false);
      setLinkedEngineers([]);
      setModeState("engineer");
      setSelectedEngineerIdState(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    void refreshWorkspace().finally(() => {
      if (!isMounted) return;
      setLoading(false);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(WORKSPACE_BOOTSTRAPPED_STORAGE_KEY, "1");
      }
    });
    return () => {
      isMounted = false;
    };
  }, [refreshWorkspace]);

  const setSelectedEngineerId = (nextId: string | null) => {
    if (selectedEngineerId === nextId) return;

    if (mode === "manager" && selectedEngineerId && selectedEngineerId !== nextId) {
      const staleEngineerId = selectedEngineerId;
      setTimeout(() => {
        void supabase
          .channel(`workspace-sync-${staleEngineerId}`)
          .send({
            type: "broadcast",
            event: "session_terminated",
            payload: { exited_by: "manager" },
          })
          .catch((error) => {
            console.error("Non-blocking workspace broadcast failed:", error);
          });
      }, 0);
    }
    if (typeof window !== "undefined") {
      if (nextId) {
        window.sessionStorage.setItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY, nextId);
        window.sessionStorage.setItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY, nextId);
      } else {
        window.sessionStorage.removeItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY);
        window.sessionStorage.removeItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY);
      }
    }
    setSelectedEngineerIdState(nextId);
  };

  const setMode = (nextMode: WorkspaceMode) => {
    if (nextMode === "engineer") {
      setSelectedEngineerIdState(null);
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY);
        window.sessionStorage.removeItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY);
      }
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(WORKSPACE_MODE_STORAGE_KEY, nextMode);
    }
    setModeState(nextMode);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(WORKSPACE_MODE_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectedEngineerId) {
      window.sessionStorage.removeItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY);
      window.sessionStorage.removeItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(WORKSPACE_ACTIVE_ENGINEER_STORAGE_KEY, selectedEngineerId);
    window.sessionStorage.setItem(WORKSPACE_SELECTED_ENGINEER_STORAGE_KEY, selectedEngineerId);
  }, [selectedEngineerId]);

  return (
    <WorkspaceContext.Provider
      value={{
        mode,
        setMode,
        isManagerAccount,
        linkedEngineers,
        selectedEngineerId,
        setSelectedEngineerId,
        loading,
        refreshWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be wrapped within a WorkspaceProvider");
  return context;
}
