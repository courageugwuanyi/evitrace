import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { redeemManagerInvite } from "@/lib/api/manager-invites.functions";
import { supabase } from "@/lib/supabase";

type InviteStatus = "loading" | "success" | "error" | "auth_required";
const PENDING_INVITE_CODE_KEY = "pending_invite_code";
const MANAGER_ONBOARDING_CONTEXT_KEY = "manager_onboarding_context";

const MISSING_CODE_MESSAGE =
  "Missing invitation code. Please ask your engineer for a valid transition link.";
type InviteErrorState = {
  code: "DOMAIN_MISMATCH" | "ACTIVE_MANAGER_CONFLICT" | "INVALID_OR_EXPIRED" | "UNKNOWN";
  expected?: string;
  received?: string;
  activeManager?: string;
  message?: string;
};

export const Route = createFileRoute("/invite")({
  component: InviteRedeemPage,
});

function InviteRedeemPage() {
  const [status, setStatus] = useState<InviteStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<InviteErrorState | null>(null);
  const redirectTimerRef = useRef<number | null>(null);
  const hasFired = useRef(false);

  async function handleSignOutAndRedirect() {
    try {
      await supabase.auth.signOut();
    } finally {
      sessionStorage.removeItem(PENDING_INVITE_CODE_KEY);
      sessionStorage.removeItem(MANAGER_ONBOARDING_CONTEXT_KEY);
      window.location.assign("/");
    }
  }

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    let active = true;

    async function redeemInvite() {
      const query = new URLSearchParams(window.location.search);
      const rawCode = query.get("code")?.trim();
      const pendingCode = sessionStorage.getItem(PENDING_INVITE_CODE_KEY)?.trim();

      if (!rawCode && !pendingCode) {
        if (!active) return;
        setStatus("error");
        setErrorMessage(MISSING_CODE_MESSAGE);
        return;
      }

      try {
        setStatus("loading");
        setErrorMessage(null);
        setInviteError(null);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          if (rawCode) {
            sessionStorage.setItem(PENDING_INVITE_CODE_KEY, rawCode);
          }
          if (!active) return;
          setStatus("auth_required");
          return;
        }
        const inviteCodeToRedeem = pendingCode || rawCode;
        if (!inviteCodeToRedeem) {
          throw new Error(MISSING_CODE_MESSAGE);
        }
        sessionStorage.setItem(MANAGER_ONBOARDING_CONTEXT_KEY, "1");
        const response = await redeemManagerInvite({
          data: { rawCode: inviteCodeToRedeem, token },
        });
        if (!response.success) {
          setStatus("error");
          if (response.error_code === "DOMAIN_MISMATCH") {
            setInviteError({
              code: "DOMAIN_MISMATCH",
              expected: response.expected_domain ?? undefined,
              received: response.received_domain ?? undefined,
            });
            setErrorMessage(
              "This workspace is restricted to enterprise accounts. Please sign out and retry with your company email.",
            );
            return;
          }
          if (response.error_code === "ACTIVE_MANAGER_CONFLICT") {
            setInviteError({
              code: "ACTIVE_MANAGER_CONFLICT",
              activeManager: response.active_manager ?? undefined,
            });
            setErrorMessage(
              "This engineer already has an active direct manager assigned. Ask the engineer to revoke old manager access before using a new direct-manager invite.",
            );
            return;
          }
          if (response.error_code === "INVALID_OR_EXPIRED") {
            setInviteError({
              code: "INVALID_OR_EXPIRED",
              message: response.message ?? undefined,
            });
            setErrorMessage(response.message ?? "This invitation link is invalid or has expired.");
            return;
          }
          setInviteError({
            code: "UNKNOWN",
            message: response.message ?? undefined,
          });
          setErrorMessage(response.message ?? "Invitation could not be completed.");
          return;
        }
        sessionStorage.removeItem(PENDING_INVITE_CODE_KEY);
        sessionStorage.removeItem(MANAGER_ONBOARDING_CONTEXT_KEY);

        if (!active) return;
        setStatus("success");
        redirectTimerRef.current = window.setTimeout(() => {
          window.location.assign("/");
        }, 1500);
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Failed to redeem invitation.";
        setStatus("error");
        setInviteError({ code: "UNKNOWN", message });
        setErrorMessage(message);
      }
    }

    void redeemInvite();

    return () => {
      active = false;
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {status === "loading" && (
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
          </div>
          <p className="text-sm text-slate-700">
            Verifying invitation and checking workplace domain alignment...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider">
            Invite issue
          </span>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            {inviteError?.code === "DOMAIN_MISMATCH"
              ? "Corporate Domain Mismatch"
              : inviteError?.code === "ACTIVE_MANAGER_CONFLICT"
                ? "Active Manager Conflict Detected"
                : "Invitation could not be completed"}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {inviteError?.code === "DOMAIN_MISMATCH"
              ? `This workspace is restricted to enterprise accounts. The engineer belongs to @${inviteError.expected ?? "company-domain"}, but you signed up using @${inviteError.received ?? "personal-domain"}.`
              : inviteError?.code === "ACTIVE_MANAGER_CONFLICT"
                ? `This engineer workspace is currently connected to an active direct manager (${inviteError.activeManager ?? "another manager"}). To protect historical metrics, please have the engineer revoke access or initiate a transfer sequence before claiming this link.`
                : errorMessage}
          </p>
          <button
            type="button"
            onClick={() => {
              void handleSignOutAndRedirect();
            }}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            {inviteError?.code === "DOMAIN_MISMATCH"
              ? "Sign Out & Use Company Email"
              : "Disconnect & Clear Session"}
          </button>
        </div>
      )}

      {status === "auth_required" && (
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider">
            Workspace Invitation
          </span>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            You've been invited to a team workspace
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Please create an account or sign in using your company email to accept this invitation
            and review your engineer&apos;s dashboard.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Sign In / Sign Up
          </button>
        </div>
      )}

      {status === "success" && (
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Workspace Connected!</h1>
          <p className="mt-2 text-sm text-slate-600">Redirecting you to your team dashboard...</p>
        </div>
      )}
    </div>
  );
}
