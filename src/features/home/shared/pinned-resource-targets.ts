const KNOWLEDGE_PIN_URL_PREFIX = "evitrace://knowledge/";

export function buildKnowledgePinUrl(knowledgeId: string): string {
  return `${KNOWLEDGE_PIN_URL_PREFIX}${knowledgeId}`;
}

export function parsePinnedKnowledgeId(url?: string | null): string | null {
  if (!url) return null;
  const normalized = url.trim();
  if (!normalized.startsWith(KNOWLEDGE_PIN_URL_PREFIX)) return null;
  const knowledgeId = normalized.slice(KNOWLEDGE_PIN_URL_PREFIX.length).trim();
  return knowledgeId.length > 0 ? knowledgeId : null;
}

export function isHttpUrl(url?: string | null): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(url.trim());
}
