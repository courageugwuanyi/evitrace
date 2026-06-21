import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExtensionPopup } from "./components/ExtensionPopup";
import { AuthProvider } from "./lib/auth";
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

function getChromeApi() {
  return (globalThis as typeof globalThis & { chrome?: ChromeApi }).chrome;
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

  if (response?.ok) return;

  const localSession = await new Promise<unknown>((resolve) => {
    chromeApi.storage.local.get([EXT_SUPABASE_SESSION_KEY], (stored: Record<string, unknown>) => {
      resolve(stored?.[EXT_SUPABASE_SESSION_KEY] ?? null);
    });
  });

  if (!localSession) {
    await supabase.auth.signOut();
    await new Promise<void>((resolve) => {
      chromeApi.storage.local.remove(
        [EXT_SUPABASE_SESSION_KEY, EXT_SUPABASE_SESSION_SYNCED_AT_KEY],
        () => {
          resolve();
        },
      );
    });
    await new Promise<void>((resolve) => {
      chromeApi.runtime.sendMessage({ type: "CLEAR_PROMPT_ACTIVE" }, () => {
        resolve();
      });
    });
  }
}

async function bootstrapPopup() {
  await syncSessionOnPopupBootstrap();

  ReactDOM.createRoot(document.getElementById("popup-root")!).render(
    <React.StrictMode>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ExtensionPopup
            standalone
            onDismiss={() => {
              window.close();
            }}
            onSave={() => {}}
          />
        </QueryClientProvider>
      </AuthProvider>
    </React.StrictMode>,
  );
}

void bootstrapPopup();
