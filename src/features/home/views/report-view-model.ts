import type { EvidenceRecord } from "@/features/home/shared/models";
import type { ReviewQuestion, ReviewSession } from "@/features/home/assessment/assessment-domain";
import { resolveCategoryFromFramework } from "@/features/home/shared/framework-taxonomy";

export type ReportDelta = { name: string; from: number; to: number };
export type ReportJustification = { cat: string; sub: string; q: ReviewQuestion };
export type CategoryPerformanceRow = { name: string; avgScore: number; evidenceCount: number };

export function buildReportDeltas(review: ReviewSession | null): ReportDelta[] {
  if (!review) return [];
  return Object.entries(review.scores)
    .map(([cat, subs]) => {
      const entries = Object.values(subs);
      if (entries.length === 0) return null;
      const from = +(entries.reduce((sum, question) => sum + question.prev, 0) / entries.length).toFixed(2);
      const to = +(entries.reduce((sum, question) => sum + question.next, 0) / entries.length).toFixed(2);
      return { name: cat, from, to };
    })
    .filter((delta): delta is ReportDelta => Boolean(delta) && delta.to !== delta.from);
}

export function buildReportJustification(review: ReviewSession | null): ReportJustification[] {
  if (!review) return [];
  const out: ReportJustification[] = [];
  Object.entries(review.scores).forEach(([cat, subs]) => {
    Object.entries(subs).forEach(([sub, question]) => {
      if (question.next !== question.prev && question.notes.trim().length > 0) {
        out.push({ cat, sub, q: question });
      }
    });
  });
  return out;
}

export function buildHighlightedEvidence(
  review: ReviewSession | null,
  evidence: EvidenceRecord[],
): EvidenceRecord[] {
  if (!review) return [];
  const ids = new Set<string>();
  Object.values(review.scores).forEach((subs) =>
    Object.values(subs).forEach((question) => question.evidenceIds.forEach((id) => ids.add(id))),
  );
  return evidence.filter((item) => ids.has(item.id)).slice(0, 3);
}

export function computeOverallReadiness(review: ReviewSession | null): number | null {
  if (!review) return null;
  const allQuestions = Object.values(review.scores).flatMap((scoreMap) => Object.values(scoreMap));
  if (allQuestions.length === 0) return null;
  const avg = allQuestions.reduce((sum, question) => sum + question.next, 0) / allQuestions.length;
  return Math.round((avg / 4) * 100);
}

export function buildCategoryPerformance(args: {
  review: ReviewSession | null;
  categoriesForSummary: string[];
  approvedEvidence: EvidenceRecord[];
}): CategoryPerformanceRow[] {
  const { review, categoriesForSummary, approvedEvidence } = args;
  if (!review) return [];
  return categoriesForSummary
    .map((categoryName) => {
      const rows = Object.values(review.scores[categoryName] ?? {});
      const avgScore =
        rows.length > 0 ? +(rows.reduce((sum, row) => sum + row.next, 0) / rows.length).toFixed(2) : 0;
      const evidenceCount = approvedEvidence.filter((record) => {
        const matchedCategory =
          resolveCategoryFromFramework(record.category ?? "", categoriesForSummary) ??
          resolveCategoryFromFramework(record.competency ?? "", categoriesForSummary);
        return matchedCategory === categoryName;
      }).length;
      return { name: categoryName, avgScore, evidenceCount };
    })
    .sort((a, b) => {
      if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
      if (b.evidenceCount !== a.evidenceCount) return b.evidenceCount - a.evidenceCount;
      return a.name.localeCompare(b.name);
    });
}

export function formatCategoryNames(names: string[], fallback: string): string {
  if (names.length === 0) return fallback;
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}
