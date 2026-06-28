import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  MANAGER_ONBOARDING_CONTEXT_KEY,
  PENDING_WORKSPACE_INVITE_HASH_KEY,
} from "@/features/home/shared/constants";
import { resolveManagerInviteHash } from "@/lib/api/manager-invites.functions";
import { getSafeErrorMessage } from "@/lib/safe-error-message";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/invite")({
  component: InviteRedeemPage,
});

function isSha256Hash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value.trim());
}

async function resolveInviteHash(rawToken: string): Promise<string> {
  const resolved = await resolveManagerInviteHash({ data: { rawToken } });
  if (!isSha256Hash(resolved)) {
    throw new Error("Invalid workspace connection reference hash.");
  }
  return resolved.toLowerCase();
}

function parseRpcResponse(data: unknown): Record<string, unknown> | null {
  const candidate = Array.isArray(data) ? data[0] : data;
  if (typeof candidate === "string") {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
  return candidate && typeof candidate === "object" ? (candidate as Record<string, unknown>) : null;
}

function InviteRedeemPage() {
  const navigate = useNavigate();
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    let active = true;
    async function processIncomingInviteLink() {
      const query = new URLSearchParams(window.location.search);
      const incomingToken = query.get("hash")?.trim() || query.get("code")?.trim();
      if (!incomingToken) {
        toast.error("Invalid workspace connection reference link.");
        void navigate({ to: "/" });
        return;
      }

      try {
        const resolvedHash = await resolveInviteHash(incomingToken);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.id) {
          const { data, error } = await supabase.rpc("accept_manager_invite", {
            target_hash: resolvedHash,
            current_manager_id: session.user.id,
          });
          const response = parseRpcResponse(data);
          const isSuccess = response?.success === true;
          if (error || !isSuccess) {
            const errorMessage = getSafeErrorMessage(
              response?.message ?? error,
              "Workspace connection linking failed. Please try again.",
            );
            toast.error(errorMessage);
          } else {
            toast.success(
              String(
                response?.message ??
                  "Teammate profile successfully added to your organization hierarchy.",
              ),
            );
          }
          void navigate({ to: "/" });
          return;
        }

        window.localStorage.setItem(PENDING_WORKSPACE_INVITE_HASH_KEY, resolvedHash);
        window.sessionStorage.setItem(MANAGER_ONBOARDING_CONTEXT_KEY, "1");
        toast.message("Workspace invitation detected", {
          description: "Please sign up or log in to complete your team connection setup.",
        });
        void navigate({ to: "/" });
      } catch (error) {
        const message = getSafeErrorMessage(
          error,
          "Network synchronization timeout during link analysis.",
        );
        toast.error(message);
        void navigate({ to: "/" });
      } finally {
        if (active) {
          setResolving(false);
        }
      }
    }

    void processIncomingInviteLink();

    return () => {
      active = false;
    };
  }, [navigate]);

  if (resolving) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="space-y-4 text-center max-w-xs animate-pulse">
          <div className="h-6 w-32 bg-slate-200 rounded-md mx-auto" />
          <div className="h-3 w-48 bg-slate-100 rounded-md mx-auto" />
        </div>
      </div>
    );
  }

  return null;
}
