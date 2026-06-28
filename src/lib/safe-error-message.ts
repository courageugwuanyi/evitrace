const HTML_ERROR_PAGE_TITLE = "<title>this page didn't load</title>";

function extractMessage(error: unknown): string {
  if (typeof error === "string") return error.trim();
  if (error instanceof Error) return error.message.trim();
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message.trim();
  }
  return "";
}

function isHtmlPayload(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized.startsWith("<!doctype html") ||
    normalized.startsWith("<html") ||
    normalized.includes(HTML_ERROR_PAGE_TITLE)
  );
}

export function getSafeErrorMessage(error: unknown, fallback: string): string {
  const message = extractMessage(error);
  if (!message || isHtmlPayload(message)) return fallback;
  return message;
}
