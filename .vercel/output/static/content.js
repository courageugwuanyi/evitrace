const AUTH_SYNC_MESSAGE_TYPE = "AUTH_SYNC_BRIDGE_SESSION";
const AUTH_STATE_CHANGE_MESSAGE_TYPE = "AUTH_STATE_CHANGE";
const AUTH_STATE_CHANGE_EVENT = "EVITRACE_AUTH_STATE_CHANGE";
const SUPABASE_AUTH_KEY_PATTERN = /^sb-.*-auth-token$/i;
const CONTEXT_INVALIDATED_PATTERN = /extension context invalidated/i;

function isContextInvalidatedMessage(message) {
  return CONTEXT_INVALIDATED_PATTERN.test(String(message ?? ""));
}

function logContextInvalidatedNotice() {
  console.log(
    "[Evitrace] Content script context updated. A simple page refresh will align the fresh runtime.",
  );
}

function getRuntimeSafe() {
  try {
    const runtime = globalThis.chrome?.runtime;
    if (!runtime?.id) return null;
    return runtime;
  } catch (_error) {
    return null;
  }
}

function getRuntimeLastErrorSafe() {
  try {
    return globalThis.chrome?.runtime?.lastError ?? null;
  } catch (_error) {
    return { message: "Extension context invalidated." };
  }
}

function safeSendMessage(message) {
  const runtime = getRuntimeSafe();
  if (!runtime?.sendMessage) return;

  try {
    runtime.sendMessage(message, () => {
      const runtimeError = getRuntimeLastErrorSafe();
      if (!runtimeError) return;
      if (isContextInvalidatedMessage(runtimeError.message)) {
        logContextInvalidatedNotice();
      } else {
        console.error("[Evitrace] Safe send message callback exception:", runtimeError);
      }
    });
  } catch (error) {
    if (isContextInvalidatedMessage(error?.message)) {
      logContextInvalidatedNotice();
    } else {
      console.error("[Evitrace] Safe send message exception:", error);
    }
  }
}

function parseSupabaseTokenPayload(rawValue) {
  if (typeof rawValue !== "string" || rawValue.trim().length === 0) return null;

  let parsed;
  try {
    parsed = JSON.parse(rawValue);
  } catch (_error) {
    return null;
  }

  const directAccessToken = parsed?.access_token;
  const directRefreshToken = parsed?.refresh_token;
  if (typeof directAccessToken === "string" && typeof directRefreshToken === "string") {
    return { access_token: directAccessToken, refresh_token: directRefreshToken };
  }

  const nestedSession = parsed?.currentSession ?? parsed?.session;
  const nestedAccessToken = nestedSession?.access_token;
  const nestedRefreshToken = nestedSession?.refresh_token;
  if (typeof nestedAccessToken === "string" && typeof nestedRefreshToken === "string") {
    return { access_token: nestedAccessToken, refresh_token: nestedRefreshToken };
  }

  return null;
}

function findSupabaseAuthToken() {
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !SUPABASE_AUTH_KEY_PATTERN.test(key)) continue;
      const value = localStorage.getItem(key);
      const tokens = parseSupabaseTokenPayload(value);
      if (!tokens) continue;
      return { ...tokens, storage_key: key };
    }
  } catch (_error) {
    return null;
  }
  return null;
}

function syncSessionToExtension() {
  const tokenData = findSupabaseAuthToken();
  if (!tokenData) {
    safeSendMessage({
      type: AUTH_STATE_CHANGE_MESSAGE_TYPE,
      session: null,
      source_url: location.href,
    });
    return;
  }

  safeSendMessage({
    type: AUTH_SYNC_MESSAGE_TYPE,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    storage_key: tokenData.storage_key,
    source_url: location.href,
  });

  safeSendMessage({
    type: AUTH_STATE_CHANGE_MESSAGE_TYPE,
    session: {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    },
    source_url: location.href,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    syncSessionToExtension();
  });
} else {
  syncSessionToExtension();
}

window.addEventListener("storage", (event) => {
  if (!event.key || !SUPABASE_AUTH_KEY_PATTERN.test(event.key)) return;
  syncSessionToExtension();
});

window.addEventListener(AUTH_STATE_CHANGE_EVENT, (event) => {
  const detail = event?.detail && typeof event.detail === "object" ? event.detail : null;
  const bridgeSession =
    detail?.session && typeof detail.session === "object"
      ? {
          access_token: detail.session.access_token,
          refresh_token: detail.session.refresh_token,
        }
      : null;

  const hasValidSession =
    bridgeSession &&
    typeof bridgeSession.access_token === "string" &&
    bridgeSession.access_token.trim().length > 0 &&
    typeof bridgeSession.refresh_token === "string" &&
    bridgeSession.refresh_token.trim().length > 0;

  safeSendMessage({
    type: AUTH_STATE_CHANGE_MESSAGE_TYPE,
    session: hasValidSession ? bridgeSession : null,
    source_url: location.href,
    source_event: detail?.event,
  });
});

const runtime = getRuntimeSafe();
if (runtime?.onMessage?.addListener) {
  try {
    runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type !== "GET_AUTH_STATE") return false;
      const tokenData = findSupabaseAuthToken();
      if (!tokenData) {
        sendResponse({ ok: true, session: null, source_url: location.href });
        return false;
      }
      sendResponse({
        ok: true,
        session: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
        },
        storage_key: tokenData.storage_key,
        source_url: location.href,
      });
      return false;
    });
  } catch (error) {
    if (isContextInvalidatedMessage(error?.message)) {
      logContextInvalidatedNotice();
    } else {
      console.error("[Evitrace] Safe send message exception:", error);
    }
  }
}

window.addEventListener(
  "error",
  (event) => {
    const message = event?.error?.message ?? event?.message;
    if (!isContextInvalidatedMessage(message)) return;
    logContextInvalidatedNotice();
    event.preventDefault();
  },
  true,
);

window.addEventListener("unhandledrejection", (event) => {
  const reason = event?.reason;
  const message =
    typeof reason === "string"
      ? reason
      : reason && typeof reason === "object"
        ? reason.message
        : "";
  if (!isContextInvalidatedMessage(message)) return;
  logContextInvalidatedNotice();
  event.preventDefault();
});
