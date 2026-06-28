const HTML_ERROR_PAGE_TITLE = "this page didn't load";
const MAX_DEPTH = 4;

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function decodeKnownHtmlEntities(value: string): string {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

function decodeLikelyEscapedHtml(value: string): string {
  let decoded = value;
  decoded = decoded
    .replace(/\\u003c/gi, "<")
    .replace(/\\u003e/gi, ">")
    .replace(/\\u002f/gi, "/");

  if (/%(?:3c|3e|2f)/i.test(decoded)) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      // Ignore malformed URI sequences and keep the original string.
    }
  }

  return decoded;
}

function isLikelyHtmlPayload(message: string): boolean {
  const normalized = decodeLikelyEscapedHtml(
    decodeKnownHtmlEntities(message.trim().toLowerCase()),
  );
  if (!normalized) return false;

  return (
    normalized.includes("<!doctype")
    || normalized.includes("<html")
    || normalized.includes("<head")
    || normalized.includes("<body")
    || normalized.includes("<title")
    || normalized.includes(HTML_ERROR_PAGE_TITLE)
    || normalized.includes("unexpected token '<'")
    || (normalized.includes("<") && normalized.includes("</"))
  );
}

function extractMessage(error: unknown, depth = 0, seen = new Set<unknown>()): string {
  if (depth > MAX_DEPTH) return "";

  const direct = readString(error);
  if (direct) return direct;

  if (error instanceof Error) {
    const message = readString(error.message);
    if (message) return message;
  }

  if (typeof error !== "object" || error === null || seen.has(error)) return "";
  seen.add(error);

  if (Array.isArray(error)) {
    for (const item of error) {
      const message = extractMessage(item, depth + 1, seen);
      if (message) return message;
    }
    return "";
  }

  const candidate = error as Record<string, unknown>;
  const keysToCheck = ["message", "error", "cause", "data", "response", "statusText"];

  for (const key of keysToCheck) {
    const value = candidate[key];
    const message = extractMessage(value, depth + 1, seen);
    if (message) return message;
  }

  return "";
}

export function getSafeErrorMessage(error: unknown, fallback: string): string {
  const message = extractMessage(error);
  if (!message || isLikelyHtmlPayload(message)) return fallback;
  return message;
}
