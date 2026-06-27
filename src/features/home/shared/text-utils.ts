export function extractFirstLink(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const direct = trimmed.match(/https?:\/\/[^\s|,]+/i)?.[0];
  if (direct) return direct;

  const chunks = trimmed.split(/[|,\n]/).map((part) => part.trim());
  for (const chunk of chunks) {
    const labelStripped = chunk.replace(/^[^:]+:\s*/, "").trim();
    if (!labelStripped) continue;
    if (/^https?:\/\//i.test(labelStripped)) return labelStripped;
    if (/^[\w.-]+\.[A-Za-z]{2,}/.test(labelStripped)) return `https://${labelStripped}`;
  }
  return null;
}

export function polishText(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return cleaned;
  const normalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

export function getDisplayName(fullName?: string, email?: string): string {
  const trimmedFullName = fullName?.trim();
  if (trimmedFullName) return trimmedFullName;
  const localPart = email?.split("@")[0]?.trim();
  return localPart || "User";
}

export function inferCompetencyFromText(title: string, description: string): string {
  const raw = `${title} ${description}`.toLowerCase();
  if (/(design|architecture|scal|resilien|trade[- ]?off)/.test(raw)) {
    return "System Design";
  }
  if (/(incident|rca|debug|root cause|metric|analysis)/.test(raw)) {
    return "Analytical Thinking";
  }
  if (/(stakeholder|present|communicat|rfc|align)/.test(raw)) {
    return "Communication";
  }
  if (/(mentor|coach|lead|align team)/.test(raw)) {
    return "Leadership";
  }
  if (/(accessibility|ux|persona|usability|design system)/.test(raw)) {
    return "Engineering for UX";
  }
  if (/(security|owasp|vulnerability|auth|encryption)/.test(raw)) {
    return "Security";
  }
  return "Delivery";
}

export function extractYouTubeVideoId(input: string): string | null {
  if (!input.trim()) return null;
  try {
    const parsed = new URL(input.trim());
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id && /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const v = parsed.searchParams.get("v");
        return v && /^[A-Za-z0-9_-]{6,}$/.test(v) ? v : null;
      }
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts") {
        const candidate = parts[1];
        return candidate && /^[A-Za-z0-9_-]{6,}$/.test(candidate) ? candidate : null;
      }
    }
  } catch {
    // ignore malformed URL values
  }
  return null;
}

export function firstUrlInText(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s)]+/i);
  return match ? match[0] : null;
}

export function urlsInText(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)]+/gi) ?? [];
  const normalized = matches.map((url) => url.trim());
  return Array.from(new Set(normalized));
}

export function normalizeReferenceLinks(links: string[]): string[] {
  return Array.from(
    new Set(
      links
        .map((link) => link.trim())
        .filter((link) => /^https?:\/\/\S+\.\S+/i.test(link)),
    ),
  );
}
