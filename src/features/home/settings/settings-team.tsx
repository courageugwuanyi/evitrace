import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { createManagerInvite } from "@/lib/api/manager-invites.functions";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { ACTIVE_INVITE_URL_STORAGE_KEY } from "@/features/home/shared/constants";
import { C, Card } from "@/features/home/shared/ui-kit";
import { Backdrop } from "@/features/home/shared/overlays";

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

export function TeamSettings() {
  const { user, userId } = useAuth();
  const [activeInviteUrl, setActiveInviteUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
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
        setLoading(false);
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
      setLoading(false);
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
  const managerFieldValue = activeManager?.fullName || "Not connected";
  const managerTitleFieldValue = activeManager?.currentTitle || "Not connected";
  const managerEmailFieldValue = activeManager?.email || "Not connected";
  const statusText = hasActiveManager
    ? "Connected"
    : hasPendingInvite
      ? "Awaiting Activation"
      : null;
  const statusDotClass = hasActiveManager
    ? { ping: "bg-emerald-400", dot: "bg-emerald-500" }
    : { ping: "bg-amber-400", dot: "bg-amber-500" };

  if (loading) return <div className="h-32 w-full bg-slate-50 animate-pulse rounded-xl" />;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
          Manager
        </h3>
        {statusText && (
          <div className="inline-flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusDotClass.ping} opacity-75`}
              />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusDotClass.dot}`} />
            </span>
            <span className="text-xs font-medium text-slate-500">{statusText}</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs" style={{ color: C.subtle }}>
        Manager fields are synced from the connected manager account.
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-400">Full Name</div>
          <span
            title={managerFieldValue}
            className="truncate max-w-[180px] sm:max-w-[240px] block text-slate-700"
          >
            {managerFieldValue}
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-400">Email</div>
          <span
            title={managerEmailFieldValue}
            className="truncate max-w-[180px] sm:max-w-[240px] block text-slate-700"
          >
            {managerEmailFieldValue}
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-400">Title / Role</div>
          <span
            title={managerTitleFieldValue}
            className="truncate max-w-[180px] sm:max-w-[240px] block text-slate-700"
          >
            {managerTitleFieldValue}
          </span>
        </div>
      </div>

      {hasActiveManager && activeManager ? (
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
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
        <div
          className="mt-5 rounded-md border p-4"
          style={{ borderColor: C.border, background: C.card }}
        >
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
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
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
      <AnimatePresence>
        {showConfirmModal && (
          <Backdrop
            onClose={() => {
              setShowConfirmModal(false);
              setConfirmAction(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-md border"
              style={{ borderColor: C.border }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#FFEBE6" }}
                  >
                    <AlertTriangle size={18} style={{ color: C.red }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold" style={{ color: C.navy }}>
                      {confirmAction === "cancel" ? "Cancel invite request?" : "Disconnect manager access?"}
                    </div>
                    <div className="text-sm mt-1.5 leading-relaxed" style={{ color: C.slate }}>
                      {confirmAction === "cancel"
                        ? "This will cancel the outstanding manager invite request. You can generate a new invite link anytime."
                        : "This removes your manager's review, alignment, and comment access to your workspace metrics. Your history remains intact."}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="px-5 py-3 border-t flex items-center justify-end gap-2"
                style={{ borderColor: C.border, background: C.bg }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                  }}
                  disabled={isDisconnecting}
                  className="px-3 py-1.5 rounded text-sm font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDisconnectManager()}
                  disabled={isDisconnecting}
                  className="px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: C.red }}
                >
                  {isDisconnecting
                    ? "Revoking..."
                    : confirmAction === "cancel"
                      ? "Yes, Cancel Request"
                      : "Yes, Disconnect"}
                </button>
              </div>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>
    </Card>
  );
}
