import {
  COMPETENCY_DESC,
  SUBCATEGORIES,
  DEFAULT_EFFECTIVENESS_WEIGHT,
  normalizeCategoryName,
  resolveFrameworkCategoryEntries,
} from "@/features/home/shared/framework-taxonomy";
import { formatDisplayDate } from "@/features/home/shared/formatters";

export type ReviewQuestion = {
  prev: number;
  next: number;
  notes: string;
  evidenceIds: string[];
};

export type ReviewSession = {
  id: string;
  date: string;
  period: string;
  engineer: string;
  manager: string;
  scores: Record<string, Record<string, ReviewQuestion>>;
};

export type AssessmentWizardDraft = {
  activeIdx: number;
  scores: Record<string, Record<string, ReviewQuestion>>;
  savedAt: string;
};

const ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX = "evitrace_active_assessment_draft";
const LEGACY_ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX = "evitrace.assessmentWizardDraft";

export function getAssessmentWizardDraftStorageKey(userId: string): string {
  return `${ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX}.${userId}`;
}

export function getLegacyAssessmentWizardDraftStorageKey(userId: string): string {
  return `${LEGACY_ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX}.${userId}`;
}

export type AssessmentQuestion = {
  questionId: string;
  questionText: string;
  previousScore: number;
  currentScore: number;
  targetScore: number;
  justification: string;
  attachedEvidenceIds: string[];
};

export type AssessmentCategory = {
  categoryId: string;
  categoryName: string;
  summary: string;
  categoryCurrentAvg: number;
  categoryTarget: number;
  questions: AssessmentQuestion[];
};

export type Assessment = {
  id: string;
  dateCompleted: string;
  reviewPeriod: string;
  status: "Finalized" | "Draft" | "In Review";
  engineerName: string;
  managerName: string;
  overallReadinessScore: number;
  categories: AssessmentCategory[];
  oneOnOneTopics: string[];
  isSample?: boolean;
};

function clampEffectivenessWeight(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_EFFECTIVENESS_WEIGHT;
  return Math.max(1, Math.min(5, Math.round(value)));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function averageQuestionWeight(
  questions: AssessmentQuestion[] | undefined,
  key: "previousScore" | "currentScore",
): number {
  if (!questions || questions.length === 0) return DEFAULT_EFFECTIVENESS_WEIGHT;
  const total = questions.reduce((sum, question) => sum + clampEffectivenessWeight(question[key]), 0);
  return +(total / questions.length).toFixed(2);
}

function findQuestionFromAssessment(
  assessment: Assessment | undefined,
  categoryName: string,
  questionText: string,
): AssessmentQuestion | undefined {
  const normalizedCategoryName = normalizeCategoryName(categoryName);
  const normalizedQuestionText = questionText.trim().toLowerCase();
  const category = assessment?.categories.find(
    (item) => normalizeCategoryName(item.categoryName) === normalizedCategoryName,
  );
  if (!category) return undefined;
  return category.questions.find(
    (item) => item.questionText.trim().toLowerCase() === normalizedQuestionText,
  );
}

export function getHistoricalQuestionScores(
  assessment: Assessment | undefined,
  categoryName: string,
  questionText: string,
  previousCompletedAssessment?: Assessment,
): { previous: number; current: number; target: number; note: string } {
  const latestQuestion = findQuestionFromAssessment(assessment, categoryName, questionText);
  const previousCompletedQuestion = findQuestionFromAssessment(
    previousCompletedAssessment,
    categoryName,
    questionText,
  );
  if (!latestQuestion) {
    const fallbackScore = previousCompletedQuestion
      ? clampEffectivenessWeight(previousCompletedQuestion.currentScore)
      : DEFAULT_EFFECTIVENESS_WEIGHT;
    return {
      previous: fallbackScore,
      current: fallbackScore,
      target: 4,
      note: "",
    };
  }
  const previousScore = previousCompletedQuestion
    ? clampEffectivenessWeight(previousCompletedQuestion.currentScore)
    : clampEffectivenessWeight(latestQuestion.previousScore);
  return {
    previous: previousScore,
    current: clampEffectivenessWeight(latestQuestion.currentScore),
    target: clampEffectivenessWeight(latestQuestion.targetScore),
    note: latestQuestion.justification ?? "",
  };
}

export function calculateScoreDelta(previousScore: number, currentScore: number): number {
  return +(currentScore - previousScore).toFixed(2);
}

export function triggerAssessmentPdfDownload(assessment: Assessment): void {
  if (typeof window === "undefined") return;
  const printable = window.open("", "_blank", "noopener,noreferrer,width=1024,height=900");
  if (!printable) return;

  const rows = assessment.categories
    .map((category) => {
      const safeCategoryName = escapeHtml(category.categoryName);
      const questions = category.questions
        .map((question) => {
          const delta = calculateScoreDelta(question.previousScore, question.currentScore);
          const safeQuestionText = escapeHtml(question.questionText);
          return `<tr>
            <td>${safeQuestionText}</td>
            <td>${clampEffectivenessWeight(question.previousScore)}</td>
            <td>${clampEffectivenessWeight(question.currentScore)}</td>
            <td>${delta > 0 ? "+" : ""}${delta}</td>
          </tr>`;
        })
        .join("");
      return `<section>
        <h3>${safeCategoryName} (Avg ${averageQuestionWeight(category.questions, "currentScore").toFixed(2)})</h3>
        <table>
          <thead><tr><th>Question</th><th>Previous</th><th>Current</th><th>Delta</th></tr></thead>
          <tbody>${questions}</tbody>
        </table>
      </section>`;
    })
    .join("");

  const safeReviewPeriod = escapeHtml(assessment.reviewPeriod);
  const safeAssessmentId = escapeHtml(assessment.id);
  const safeEngineerName = escapeHtml(assessment.engineerName);
  const safeManagerName = escapeHtml(assessment.managerName);
  const safeDateCompleted = escapeHtml(formatDisplayDate(assessment.dateCompleted));

  printable.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${safeReviewPeriod} Assessment Report</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; color: #172B4D; margin: 28px; }
      h1 { margin: 0; font-size: 24px; }
      h2 { margin: 6px 0 0; font-size: 14px; color: #42526E; font-weight: 500; }
      h3 { margin: 20px 0 10px; font-size: 16px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
      th, td { border: 1px solid #DFE1E6; padding: 8px; font-size: 12px; vertical-align: top; text-align: left; }
      th { background: #F4F5F7; color: #42526E; text-transform: uppercase; font-size: 11px; letter-spacing: .03em; }
      .meta { margin-top: 14px; font-size: 12px; color: #42526E; }
    </style>
  </head>
  <body>
    <h1>${safeReviewPeriod}</h1>
    <h2>Assessment ${safeAssessmentId}</h2>
    <div class="meta">
      Engineer: ${safeEngineerName} &nbsp;|&nbsp; Manager: ${safeManagerName}
      &nbsp;|&nbsp; Finalized: ${safeDateCompleted}
      &nbsp;|&nbsp; Overall Readiness: ${assessment.overallReadinessScore}%
    </div>
    ${rows}
  </body>
</html>`);
  printable.document.close();
  printable.focus();
  printable.print();
}

/** Derives radar chart data from the most recent Assessment.
 *  Maps each category's `categoryCurrentAvg` (1-5 scale) to 0-4 radar scale.
 *  Falls back to the static initialRadar shape when no assessment is available. */
export function deriveRadarData(
  assessment: Assessment | undefined,
  activeFrameworkCategories: string[],
  frameworkMatrix: unknown,
): { competency: string; current: number; target: number }[] {
  const orderedCategories =
    activeFrameworkCategories.length > 0
      ? activeFrameworkCategories
      : resolveFrameworkCategoryEntries(frameworkMatrix).map(([category]) => category);
  if (orderedCategories.length === 0) {
    return (assessment?.categories ?? []).map((category) => ({
      competency: category.categoryName,
      current: +Math.min(4, (category.categoryCurrentAvg / 5) * 4).toFixed(2),
      target: 4,
    }));
  }
  return orderedCategories.map((categoryName) => {
    const found = assessment?.categories.find(
      (c) =>
        c.categoryName === categoryName ||
        normalizeCategoryName(c.categoryName) === normalizeCategoryName(categoryName),
    );
    const current = found ? +Math.min(4, (found.categoryCurrentAvg / 5) * 4).toFixed(2) : 0;
    return { competency: categoryName, current, target: 4 };
  });
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return +(nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2);
}

/** Recomputes every categoryCurrentAvg from its questions and the overall readiness score. */
function withDerivedAverages(a: Assessment): Assessment {
  const categories = a.categories.map((c) => ({
    ...c,
    categoryCurrentAvg: avg(c.questions.map((q) => q.currentScore)),
  }));
  const allScores = categories.flatMap((c) => c.questions.map((q) => q.currentScore));
  const overall = allScores.length === 0 ? 0 : Math.round((avg(allScores) / 5) * 100);
  return { ...a, categories, overallReadinessScore: overall };
}

/** Build a strict Assessment from a wizard-captured ReviewSession. */
export function sessionToAssessment(s: ReviewSession): Assessment {
  const categories: AssessmentCategory[] = Object.entries(s.scores).map(([catName, subs], ci) => {
    const questions: AssessmentQuestion[] = Object.entries(subs).map(([sub, q], qi) => ({
      questionId: `q_${ci + 1}_${qi + 1}`,
      questionText: sub,
      previousScore: q.prev,
      currentScore: q.next,
      targetScore: 4,
      justification: q.notes,
      attachedEvidenceIds: q.evidenceIds,
    }));
    return {
      categoryId: `cat_${String(ci + 1).padStart(2, "0")}`,
      categoryName: catName,
      summary: COMPETENCY_DESC[catName] ?? "",
      categoryCurrentAvg: 0,
      categoryTarget: 4,
      questions,
    };
  });
  return withDerivedAverages({
    id: s.id,
    dateCompleted: new Date().toISOString(),
    reviewPeriod: s.period,
    status: "Finalized",
    engineerName: s.engineer,
    managerName: s.manager,
    overallReadinessScore: 0,
    categories,
    oneOnOneTopics: [],
  });
}

/** Convert a stored Assessment back to the in-memory ReviewSession shape. */
export function assessmentToSession(a: Assessment): ReviewSession {
  const scores: Record<string, Record<string, ReviewQuestion>> = {};
  a.categories.forEach((c) => {
    scores[c.categoryName] = {};
    c.questions.forEach((q) => {
      scores[c.categoryName][q.questionText] = {
        prev: q.previousScore,
        next: q.currentScore,
        notes: q.justification,
        evidenceIds: q.attachedEvidenceIds,
      };
    });
  });
  return {
    id: a.id,
    date: formatDisplayDate(a.dateCompleted),
    period: a.reviewPeriod,
    engineer: a.engineerName,
    manager: a.managerName,
    scores,
  };
}

/** Build a historical Assessment from a compact `[prev, current]` matrix. */
function buildHistorical(meta: {
  id: string;
  dateCompleted: string;
  reviewPeriod: string;
  engineerName: string;
  managerName: string;
  scores: Record<string, [number, number, string?][]>;
  topics: string[];
}): Assessment {
  const categories: AssessmentCategory[] = Object.entries(meta.scores).map(([cat, rows], ci) => {
    const subs = SUBCATEGORIES[cat] ?? [];
    const questions: AssessmentQuestion[] = rows.map((r, qi) => ({
      questionId: `q_${ci + 1}_${qi + 1}`,
      questionText: subs[qi] ?? `Question ${qi + 1}`,
      previousScore: r[0],
      currentScore: r[1],
      targetScore: 4,
      justification: r[2] ?? "",
      attachedEvidenceIds: [],
    }));
    return {
      categoryId: `cat_${String(ci + 1).padStart(2, "0")}`,
      categoryName: cat,
      summary: COMPETENCY_DESC[cat] ?? "",
      categoryCurrentAvg: 0,
      categoryTarget: 4,
      questions,
    };
  });
  return withDerivedAverages({
    id: meta.id,
    dateCompleted: meta.dateCompleted,
    reviewPeriod: meta.reviewPeriod,
    status: "Finalized",
    engineerName: meta.engineerName,
    managerName: meta.managerName,
    overallReadinessScore: 0,
    categories,
    oneOnOneTopics: meta.topics,
  });
}

export const initialAssessments: Assessment[] = [
  buildHistorical({
    id: "REV-2026-Q2",
    dateCompleted: "2026-06-28T15:00:00Z",
    reviewPeriod: "Q2 2026",
    engineerName: "Courage Ugwuanyi",
    managerName: "Alex M.",
    scores: {
      "Analytical Thinking": [
        [2, 3, "Improved root-cause analysis on incident IR-4421."],
        [2, 3],
        [2, 3],
      ],
      "System Design": [
        [2, 3, "Led RFC for sharded inventory service."],
        [2, 3],
        [1, 2],
      ],
      "Code Quality": [
        [3, 3],
        [3, 4, "Drove team-wide refactor of payment module."],
        [3, 3],
      ],
      Communication: [
        [3, 3],
        [3, 3],
        [3, 3],
      ],
      Leadership: [
        [2, 2],
        [2, 3, "Mentored two L2 engineers."],
        [2, 2],
      ],
      "Engineering for UX": [
        [2, 3, "Shipped accessibility pass on checkout."],
        [2, 3],
        [2, 2],
      ],
      Security: [
        [2, 3],
        [2, 3, "Completed OWASP Top 10 internal cert."],
        [2, 2],
      ],
      Delivery: [
        [3, 3],
        [3, 4, "Three consecutive on-time releases."],
        [3, 3],
      ],
    },
    topics: ["Discuss certification budget for AWS", "Timeline for Senior promotion panel"],
  }),
  buildHistorical({
    id: "REV-2026-Q1",
    dateCompleted: "2026-03-30T15:00:00Z",
    reviewPeriod: "Q1 2026",
    engineerName: "Courage Ugwuanyi",
    managerName: "Alex M.",
    scores: {
      "Analytical Thinking": [
        [2, 2],
        [1, 2],
        [2, 2],
      ],
      "System Design": [
        [1, 2],
        [2, 2],
        [1, 1],
      ],
      "Code Quality": [
        [3, 3],
        [3, 3],
        [2, 3],
      ],
      Communication: [
        [3, 3],
        [2, 3],
        [3, 3],
      ],
      Leadership: [
        [2, 2],
        [2, 2],
        [1, 2],
      ],
      "Engineering for UX": [
        [2, 2],
        [2, 2],
        [2, 2],
      ],
      Security: [
        [2, 2],
        [2, 2],
        [1, 2],
      ],
      Delivery: [
        [3, 3],
        [3, 3],
        [2, 3],
      ],
    },
    topics: ["Identify a stretch project for System Design"],
  }),
  buildHistorical({
    id: "REV-2025-Q4",
    dateCompleted: "2025-12-08T14:30:00Z",
    reviewPeriod: "Q4 2025",
    engineerName: "Courage Ugwuanyi",
    managerName: "Alex M.",
    scores: {
      "Analytical Thinking": [
        [
          1,
          2,
          "Demonstrated excellent root-cause analysis during the multi-node latency incident.",
        ],
        [1, 1, "Starting to identify patterns in logs, but needs more autonomy."],
        [1, 2],
      ],
      "System Design": [
        [1, 1],
        [1, 2],
        [1, 1],
      ],
      "Code Quality": [
        [2, 3],
        [2, 3],
        [2, 2],
      ],
      Communication: [
        [2, 3],
        [2, 2],
        [2, 3],
      ],
      Leadership: [
        [1, 2],
        [1, 2],
        [1, 1],
      ],
      "Engineering for UX": [
        [2, 2],
        [2, 2],
        [1, 2],
      ],
      Security: [
        [1, 2],
        [1, 2],
        [1, 1],
      ],
      Delivery: [
        [2, 3],
        [2, 3],
        [2, 2],
      ],
    },
    topics: ["Set focus areas for Q1 - System Design, Security"],
  }),
].map((assessment) => ({ ...assessment, isSample: true }));
