import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExtensionPopup } from "./components/ExtensionPopup";
import { AuthProvider } from "./lib/auth";
import { FrameworkProvider } from "./context/FrameworkContext";
import { supabase } from "./lib/supabase";
import "./styles.css";

const queryClient = new QueryClient();
const EXT_SUPABASE_SESSION_KEY = "evitrace_supabase_session";
const EXT_SUPABASE_SESSION_SYNCED_AT_KEY = "evitrace_supabase_session_synced_at";

type ChromeApi = {
  storage?: {
    local?: {
      get: (keys: string[], callback: (stored: Record<string, unknown>) => void) => void;
      remove: (keys: string[], callback?: () => void) => void;
    };
  };
  runtime?: {
    sendMessage: (
      message: Record<string, unknown>,
      callback?: (response: { ok?: boolean; status?: string } | undefined) => void,
    ) => void;
  };
};

type MirroredSession = {
  accessToken: string;
  refreshToken: string;
};

function getChromeApi() {
  return (globalThis as typeof globalThis & { chrome?: ChromeApi }).chrome;
}

function parseMirroredSession(value: unknown): MirroredSession | null {
  if (!value || typeof value !== "object") return null;
  const session = value as Record<string, unknown>;
  const accessToken =
    typeof session.accessToken === "string"
      ? session.accessToken
      : typeof session.access_token === "string"
        ? session.access_token
        : null;
  const refreshToken =
    typeof session.refreshToken === "string"
      ? session.refreshToken
      : typeof session.refresh_token === "string"
        ? session.refresh_token
        : null;
  if (!accessToken || !refreshToken) return null;
  if (!accessToken.trim() || !refreshToken.trim()) return null;
  return { accessToken, refreshToken };
}

async function reconcileSupabaseClientSession(chromeApi: ChromeApi) {
  if (!chromeApi?.storage?.local) return;
  const mirrored = await new Promise<unknown>((resolve) => {
    chromeApi.storage.local?.get([EXT_SUPABASE_SESSION_KEY], (stored: Record<string, unknown>) => {
      resolve(stored?.[EXT_SUPABASE_SESSION_KEY] ?? null);
    });
  });
  const parsed = parseMirroredSession(mirrored);
  if (!parsed) {
    await supabase.auth.signOut();
    return;
  }
  await supabase.auth.setSession({
    access_token: parsed.accessToken,
    refresh_token: parsed.refreshToken,
  });
}

async function syncSessionOnPopupBootstrap() {
  const chromeApi = getChromeApi();
  if (!chromeApi?.storage?.local || !chromeApi?.runtime?.sendMessage) return;

  const response = await new Promise<{ ok?: boolean; status?: string } | undefined>((resolve) => {
    chromeApi.runtime.sendMessage(
      { type: "SYNC_SUPABASE_SESSION", source: "popup_init" },
      (result: { ok?: boolean; status?: string } | undefined) => {
        resolve(result);
      },
    );
  });

  if (response?.status === "NO_SESSION") {
    await new Promise<void>((resolve) => {
      chromeApi.storage.local.remove(
        [EXT_SUPABASE_SESSION_KEY, EXT_SUPABASE_SESSION_SYNCED_AT_KEY],
        () => {
          resolve();
        },
      );
    });
    await supabase.auth.signOut();
    await new Promise<void>((resolve) => {
      chromeApi.runtime.sendMessage({ type: "CLEAR_PROMPT_ACTIVE" }, () => {
        resolve();
      });
    });
    return;
  }
  await reconcileSupabaseClientSession(chromeApi);
}

async function bootstrapPopup() {
  await syncSessionOnPopupBootstrap();

  ReactDOM.createRoot(document.getElementById("popup-root")!).render(
    <React.StrictMode>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <FrameworkProvider>
            <ExtensionPopup
              standalone
              onDismiss={() => {
                window.close();
              }}
              onSave={() => {}}
            />
          </FrameworkProvider>
        </QueryClientProvider>
      </AuthProvider>
    </React.StrictMode>,
  );
}

void bootstrapPopup();
