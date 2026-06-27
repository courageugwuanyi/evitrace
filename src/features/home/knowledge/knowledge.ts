import { normalizeReferenceLinks, urlsInText } from "@/features/home/shared/text-utils";

export type KnowledgeHubItem = {
  id: string;
  createdAt: string;
  challenge: string;
  lesson: string;
  referenceLinks: string[];
};

export type KnowledgeItemRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  reference_links: unknown;
  created_at?: string;
};

export function parseKnowledgeItemRow(item: KnowledgeItemRow): KnowledgeHubItem | null {
  const challenge = (item.title ?? "").trim();
  const lesson = (item.description ?? "").trim();
  const linkedReferences = Array.isArray(item.reference_links)
    ? item.reference_links.filter((link): link is string => typeof link === "string")
    : [];
  const referenceMatches = urlsInText(lesson);
  const mergedReferenceLinks = normalizeReferenceLinks([...linkedReferences, ...referenceMatches]);
  if (!challenge && !lesson) return null;
  return {
    id: item.id,
    createdAt: item.created_at ?? new Date().toISOString(),
    challenge,
    lesson,
    referenceLinks: mergedReferenceLinks,
  };
}
