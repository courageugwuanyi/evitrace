const HTML_ERROR_PAGE_TITLE = "this page didn't load";

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function extractMessage(error: unknown): string {
  if (typeof error === "string") return error.trim();
  if (error instanceof Error) return error.message.trim();
  if (typeof error !== "object" || error === null) return "";

  const candidate = error as {
    message?: unknown;
    error?: unknown;
    cause?: unknown;
    data?: unknown;
    response?: { message?: unknown; error?: unknown; data?: unknown };
  };

  return (
    readString(candidate.message)
    || readString(candidate.error)
    || readString(candidate.cause)
    || readString(candidate.data)
    || readString(candidate.response?.message)
    || readString(candidate.response?.error)
    || readString(candidate.response?.data)
  );
}

function isHtmlPayload(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  if (!normalized) return false;

  return (
    normalized.includes("<!doctype html")
    || normalized.includes("<html")
    || normalized.includes("<body")
    || normalized.includes("<title")
    || normalized.includes(HTML_ERROR_PAGE_TITLE)
  );
}

export function getSafeErrorMessage(error: unknown, fallback: string): string {
  const message = extractMessage(error);
  if (!message || isHtmlPayload(message)) return fallback;
  return message;
}
