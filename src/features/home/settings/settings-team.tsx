import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { createManagerInvite } from "@/lib/api/manager-invites.functions";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { ACTIVE_INVITE_URL_STORAGE_KEY } from "@/features/home/shared/constants";
import { C, Card, Field, Input } from "@/features/home/shared/ui-kit";

type ProfileTeamDraft = {
  fullName: string;
  email: string;
  currentLevel: string;
  targetLevel: string;
  manager: string;
  managerEmail: string;
  team: string;
  skipLevel: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) return message;
  }
  return fallback;
}

function shouldTryDisconnectFallback(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const code = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const message = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  const normalized = `${code} ${message}`.toLowerCase();
  return normalized.includes("pgrst202") || normalized.includes("schema cache") || normalized.includes("function");
}

export function TeamSettings({
  draft,
  onChange,
}: {
  draft: ProfileTeamDraft;
  onChange: (next: Partial<ProfileTeamDraft>) => void;
}) {
  const { user, userId } = useAuth();
  const [activeInviteUrl, setActiveInviteUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"disconnect" | "cancel" | null>(null);
  const [activeManager, setActiveManager] = useState<{
    relationshipId: string;
    managerId: string;
    fullName: string;
    currentTitle: string | null;
    email: string | null;
  } | null>(null);
  const [pendingInvite, setPendingInvite] = useState<{
    id: string;
    relationType: "manager" | "skip_level";
    expiresAt: string;
    inviteUrl: string | null;
  } | null>(null);
  if (!user) return null;

  async function handleGenerateInvite() {
    try {
      setIsGenerating(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        toast.error("Session expired. Please sign in again.");
        return;
      }
      const result = await createManagerInvite({ data: { relationType: "manager", token } });
      const inviteUrl = window.location.origin + "/invite?code=" + result.code;
      setActiveInviteUrl(inviteUrl);
      window.localStorage.setItem(ACTIVE_INVITE_URL_STORAGE_KEY, inviteUrl);
      setPendingInvite({
        id: `local-${Date.now()}`,
        relationType: "manager",
        expiresAt: result.expiresAt,
        inviteUrl,
      });
      setActiveManager(null);
      setCopied(false);
      toast.success("Invite link generated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate invite link.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyLink() {
    if (!activeInviteUrl) return;
    try {
      let didCopy = false;
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof window !== "undefined" &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(activeInviteUrl);
        didCopy = true;
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = activeInviteUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        didCopy = document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      if (!didCopy) {
        throw new Error("Clipboard copy failed");
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy link. Please copy it manually.");
    }
  }

  async function handleDisconnectManager() {
    try {
      setIsDisconnecting(true);
      const { error } = await supabase.rpc("disconnect_manager_connection");
      if (error) {
        if (!userId || !shouldTryDisconnectFallback(error)) throw error;

        const nowIso = new Date().toISOString();
        const relationUpdate = confirmAction === "disconnect"
          ? await supabase
              .from("reporting_relationships")
              .update({
                status: "archived",
                ends_at: nowIso,
              })
              .eq("engineer_id", userId)
              .in("status", ["active", "in_handover"])
          : { error: null };

        const inviteUpdate = await supabase
          .from("manager_invites")
          .update({
            used_at: nowIso,
            used_by: userId,
          })
          .eq("engineer_id", userId)
          .is("used_at", null);

        if (relationUpdate.error) throw relationUpdate.error;
        if (inviteUpdate.error) throw inviteUpdate.error;
      }

      setActiveManager(null);
      setPendingInvite(null);
      setActiveInviteUrl(null);
      window.localStorage.removeItem(ACTIVE_INVITE_URL_STORAGE_KEY);
      setCopied(false);
      toast.success(confirmAction === "cancel" ? "Invite request cancelled." : "Manager disconnected successfully. Access revoked.");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to disconnect manager.");
      toast.error(message);
    } finally {
      setIsDisconnecting(false);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  }

  useEffect(() => {
    let active = true;

    async function syncManagerConnectionState() {
      if (!userId) {
        if (!active) return;
        setActiveInviteUrl(null);
        setActiveManager(null);
        setPendingInvite(null);
        return;
      }

      const { data: relationship, error: relationshipError } = await supabase
        .from("reporting_relationships")
        .select("id, manager_id, status, relation_type, created_at")
        .eq("engineer_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<{
          id: string;
          manager_id: string;
          status: "active";
          relation_type: "direct_manager" | "skip_level";
          created_at: string;
        }>();

      let nextActiveManager: {
        relationshipId: string;
        managerId: string;
        fullName: string;
        currentTitle: string | null;
        email: string | null;
      } | null = null;

      if (!relationshipError && relationship) {
        const { data: managerProfile, error: managerProfileError } = await supabase
          .from("profiles")
          .select("id, full_name, job_title, email")
          .eq("id", relationship.manager_id)
          .maybeSingle<{ id: string; full_name: string | null; job_title: string | null; email: string | null }>();

        if (!managerProfileError) {
          nextActiveManager = {
            relationshipId: relationship.id,
            managerId: relationship.manager_id,
            fullName: managerProfile?.full_name?.trim() || "Manager",
            currentTitle: managerProfile?.job_title?.trim() || null,
            email: managerProfile?.email?.trim() || null,
          };
        }
      }

      const nowIso = new Date().toISOString();
      const { data: existingInvite, error: inviteError } = await supabase
        .from("manager_invites")
        .select("id, relation_type, expires_at, created_at")
        .eq("engineer_id", userId)
        .is("used_at", null)
        .gt("expires_at", nowIso)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<{ id: string; relation_type: "manager" | "skip_level"; expires_at: string; created_at: string }>();

      if (!active) return;
      setActiveManager(nextActiveManager);

      if (inviteError || !existingInvite) {
        window.localStorage.removeItem(ACTIVE_INVITE_URL_STORAGE_KEY);
        setActiveInviteUrl(null);
        setPendingInvite(null);
        return;
      }

      const cachedInviteUrl = window.localStorage.getItem(ACTIVE_INVITE_URL_STORAGE_KEY);
      const normalizedUrl = cachedInviteUrl?.trim() || null;
      setActiveInviteUrl(normalizedUrl);
      setPendingInvite({
        id: existingInvite.id,
        relationType: existingInvite.relation_type,
        expiresAt: existingInvite.expires_at,
        inviteUrl: normalizedUrl,
      });
    }

    void syncManagerConnectionState();
    const intervalId = window.setInterval(() => {
      void syncManagerConnectionState();
    }, 20000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [userId]);

  function openDisconnectConfirm(action: "disconnect" | "cancel") {
    setConfirmAction(action);
    setShowConfirmModal(true);
  }

  const hasActiveManager = Boolean(activeManager);
  const hasPendingInvite = !hasActiveManager && Boolean(pendingInvite);
  const displayInviteUrl = activeInviteUrl || pendingInvite?.inviteUrl || "";
  const managerFieldValue = activeManager?.fullName || "No manager connected";
  const managerTitleFieldValue = activeManager?.currentTitle || "No manager connected";
  const managerEmailFieldValue = activeManager?.email || "No manager connected";

  return (
    <Card className="p-6">
      <div>
        <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
          Team & Manager
        </h3>
        <p className="text-xs mt-1" style={{ color: C.subtle }}>
          Manager details and access connection
        </p>
      </div>
      <div className="mt-3 text-xs flex items-center gap-1.5" style={{ color: C.subtle }}>
        <ShieldCheck size={12} />
        Manager fields are synced from the connected manager account.
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="Manager full name">
          <Input
            value={managerFieldValue}
            readOnly
            disabled
            className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed select-none"
          />
        </Field>
        <Field label="Manager email">
          <Input
            type="email"
            value={managerEmailFieldValue}
            readOnly
            disabled
            className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed select-none"
          />
        </Field>
        <Field label="Manager title / role">
          <Input
            value={managerTitleFieldValue}
            readOnly
            disabled
            className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed select-none"
          />
        </Field>
      </div>
      <div className="mt-5 rounded-md border p-4" style={{ borderColor: C.border, background: C.card }}>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: C.subtle }}>
          Connection
        </div>

        {hasActiveManager && activeManager ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide" style={{ borderColor: "#57D9A3", background: "#E3FCEF", color: "#006644" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#36B37E" }} />
              Connected
            </div>
            <div>
              <button
                type="button"
                onClick={() => openDisconnectConfirm("disconnect")}
                disabled={isDisconnecting}
                className="inline-flex h-9 items-center justify-center rounded border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: "#FFBDAD", background: "#FFEBE6", color: "#AE2A19" }}
              >
                {isDisconnecting ? "Revoking access..." : "Disconnect access"}
              </button>
            </div>
          </div>
        ) : hasPendingInvite ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 max-w-xl w-full">
              <input
                type="text"
                readOnly
                value={displayInviteUrl || "Active invite found. Generate a fresh link if this browser lost it."}
                className="flex-1 min-w-[220px] h-9 px-3 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-600 outline-none"
              />
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                disabled={!displayInviteUrl}
                className="h-9 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={14} />
                    Copied!
                  </>
                ) : (
                  "Copy Link"
                )}
              </button>
            </div>
            <div className="flex items-center justify-between max-w-xl w-full text-xs">
              <span className="text-amber-700 bg-amber-50/60 px-2 py-0.5 rounded-sm font-medium">
                Invite pending
              </span>
              <button
                type="button"
                onClick={() => openDisconnectConfirm("cancel")}
                className="text-slate-500 hover:text-rose-600 font-medium transition-colors"
              >
                Cancel Request
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm" style={{ color: C.slate }}>
              No manager connected yet.
            </p>
            <button
              type="button"
              onClick={() => void handleGenerateInvite()}
              disabled={isGenerating}
              className="inline-flex h-9 items-center justify-center rounded bg-black px-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generating..." : "Generate invite link"}
            </button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xl max-w-sm w-full space-y-4"
            >
              <div className="space-y-2">
                <h4 className="text-base font-semibold text-slate-900">Revoke Manager Connection?</h4>
                <p className="text-sm text-slate-600">
                  Are you sure you want to disconnect? Your manager will instantly lose review, alignment,
                  and comment access to your workspace metrics. Your history will remain perfectly
                  continuous.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                  }}
                  className="h-10 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium transition-colors hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDisconnectManager()}
                  disabled={isDisconnecting}
                  className="h-10 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDisconnecting
                    ? "Revoking..."
                    : confirmAction === "cancel"
                      ? "Yes, Cancel Request"
                      : "Yes, Disconnect"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
