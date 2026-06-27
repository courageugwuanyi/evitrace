export const COMPETENCY_DESC: Record<string, string> = {
  "Analytical Thinking":
    "Identifies critical connections and patterns in information/data to diagnose root causes.",
  "System Design":
    "Designs scalable, resilient services and articulates trade-offs across components.",
  "Code Quality": "Writes maintainable, well-tested code and raises the bar through reviews.",
  Communication:
    "Listens and communicates openly, honestly, and respectfully with different audiences.",
  Leadership: "Influences direction, mentors peers, and drives alignment across teams.",
  "Engineering for UX":
    "Partners with design to deliver thoughtful, accessible, and performant user experiences.",
  Security: "Anticipates threats and embeds secure-by-default practices into the SDLC.",
  Delivery: "Breaks down complex work and ships reliably with predictable cadence.",
};

export type EffectivenessScaleOption = {
  value: number;
  label: string;
  tone: "danger" | "warning" | "info" | "success";
};

export const EFFECTIVENESS_SCALE: EffectivenessScaleOption[] = [
  { value: 1, label: "Limited Effectiveness", tone: "danger" },
  { value: 2, label: "Somewhat Effective", tone: "warning" },
  { value: 3, label: "Fully Effective", tone: "info" },
  { value: 4, label: "Highly Effective", tone: "success" },
  { value: 5, label: "Extremely Effective", tone: "success" },
];

// 3-tier framework: Category -> Subcategory/Question -> 1-5 Effectiveness
export const SUBCATEGORIES: Record<string, string[]> = {
  "Analytical Thinking": [
    "Draws logical conclusions based on in-depth analysis of information",
    "Diagnoses root causes vs. symptoms in production incidents",
    "Synthesizes data from multiple sources to frame complex problems",
  ],
  "System Design": [
    "Designs scalable services with clear failure modes and SLOs",
    "Articulates trade-offs across consistency, availability, and cost",
    "Reviews and improves architecture proposals across the team",
  ],
  "Code Quality": [
    "Describes what code smells are and refactors to remove them",
    "Conversant in the language's syntax, idioms, and standard library",
    "Writes meaningful unit, integration, and system tests",
  ],
  Communication: [
    "Listens actively and communicates respectfully with different audiences",
    "Writes clear technical documents (RFCs, runbooks, postmortems)",
    "Adapts the message and depth to the audience",
  ],
  Leadership: [
    "Influences direction and drives alignment across teams",
    "Mentors peers and grows engineers around them",
    "Takes ownership of cross-team outcomes",
  ],
  "Engineering for UX": [
    "Applies UX heuristics and accessibility standards to shipped features",
    "Partners with design through the full delivery lifecycle",
    "Instruments and learns from real user behavior",
  ],
  Security: [
    "Anticipates threats and embeds secure-by-default practices in the SDLC",
    "Identifies and remediates common vulnerability classes (OWASP Top 10)",
    "Reviews code and designs through a security lens",
  ],
  Delivery: [
    "Breaks down complex work into shippable, predictable increments",
    "Ships reliably with a sustainable cadence",
    "Coordinates dependencies across squads to unblock outcomes",
  ],
};

export const DEFAULT_EFFECTIVENESS_WEIGHT = 1;
export type FrameworkCategoryDefinition = {
  summary: string;
  items: string[];
};
export type FrameworkCategoryMap = Record<string, FrameworkCategoryDefinition>;

function effectivenessToneForValue(value: number): EffectivenessScaleOption["tone"] {
  if (value <= 1) return "danger";
  if (value === 2) return "warning";
  if (value === 3) return "info";
  return "success";
}

function buildFallbackCategoryMap(): FrameworkCategoryMap {
  return Object.fromEntries(
    Object.entries(SUBCATEGORIES).map(([categoryName, items]) => [
      categoryName,
      {
        summary: COMPETENCY_DESC[categoryName] ?? "",
        items,
      },
    ]),
  );
}

export function parseFrameworkCategoryMap(matrix: unknown): FrameworkCategoryMap | null {
  if (!matrix || typeof matrix !== "object") return null;
  const rawCategories = (matrix as Record<string, unknown>).categories;
  if (!rawCategories || typeof rawCategories !== "object" || Array.isArray(rawCategories)) return null;

  const parsed = Object.entries(rawCategories as Record<string, unknown>).reduce<FrameworkCategoryMap>(
    (acc, [categoryName, rawCategory]) => {
      if (!rawCategory || typeof rawCategory !== "object") return acc;
      const candidate = rawCategory as Record<string, unknown>;
      const summary = typeof candidate.summary === "string" ? candidate.summary.trim() : "";
      const items = Array.isArray(candidate.items)
        ? candidate.items
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter((item) => item.length > 0)
        : [];
      if (items.length === 0) return acc;
      acc[categoryName] = { summary, items };
      return acc;
    },
    {},
  );

  return Object.keys(parsed).length > 0 ? parsed : null;
}

export function resolveFrameworkCategoryMap(matrix: unknown): FrameworkCategoryMap {
  return parseFrameworkCategoryMap(matrix) ?? buildFallbackCategoryMap();
}

export function resolveFrameworkCategoryEntries(
  matrix: unknown,
): Array<[string, FrameworkCategoryDefinition]> {
  return Object.entries(resolveFrameworkCategoryMap(matrix));
}

export function buildFrameworkCategoryMapFromContext(
  categories: string[],
  getQuestionsForCategory: (categoryName: string) => string[],
): FrameworkCategoryMap {
  return categories.reduce<FrameworkCategoryMap>((acc, categoryName) => {
    acc[categoryName] = {
      summary: "",
      items: getQuestionsForCategory(categoryName),
    };
    return acc;
  }, {});
}

export function normalizeCategoryName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function resolveCategoryFromFramework(value: string, frameworkCategories: string[]): string | null {
  const normalized = normalizeCategoryName(value);
  const direct = frameworkCategories.find((category) => normalizeCategoryName(category) === normalized);
  if (direct) return direct;
  return (
    frameworkCategories.find(
      (category) =>
        normalizeCategoryName(category).includes(normalized) ||
        normalized.includes(normalizeCategoryName(category)),
    ) ?? null
  );
}

export function resolveFrameworkEffectivenessScale(matrix: unknown): EffectivenessScaleOption[] {
  if (matrix && typeof matrix === "object") {
    const rawScale = (matrix as Record<string, unknown>).effectiveness_scale;
    if (rawScale && typeof rawScale === "object") {
      if (Array.isArray(rawScale)) {
        const arrayScale = rawScale
          .map((entry) => {
            if (!entry || typeof entry !== "object") return null;
            const candidate = entry as Record<string, unknown>;
            const value = Number(candidate.value);
            const label = typeof candidate.label === "string" ? candidate.label.trim() : "";
            if (!Number.isFinite(value) || value < 1 || label.length === 0) return null;
            return {
              value: Math.round(value),
              label,
              tone: effectivenessToneForValue(Math.round(value)),
            } satisfies EffectivenessScaleOption;
          })
          .filter((entry): entry is EffectivenessScaleOption => Boolean(entry))
          .sort((a, b) => a.value - b.value);
        if (arrayScale.length > 0) return arrayScale;
      } else {
        const objectScale = Object.entries(rawScale as Record<string, unknown>)
          .map(([rawValue, rawLabel]) => {
            const value = Number(rawValue);
            const label = typeof rawLabel === "string" ? rawLabel.trim() : "";
            if (!Number.isFinite(value) || value < 1 || label.length === 0) return null;
            return {
              value: Math.round(value),
              label,
              tone: effectivenessToneForValue(Math.round(value)),
            } satisfies EffectivenessScaleOption;
          })
          .filter((entry): entry is EffectivenessScaleOption => Boolean(entry))
          .sort((a, b) => a.value - b.value);
        if (objectScale.length > 0) return objectScale;
      }
    }
  }
  return EFFECTIVENESS_SCALE;
}

export function buildFeedbackScoreMap(
  categoryEntries: Array<[string, FrameworkCategoryDefinition]>,
  defaultScore: number,
): Record<string, Record<string, number>> {
  return categoryEntries.reduce<Record<string, Record<string, number>>>((acc, [category, details]) => {
    acc[category] = details.items.reduce<Record<string, number>>((itemAcc, item) => {
      itemAcc[item] = defaultScore;
      return itemAcc;
    }, {});
    return acc;
  }, {});
}
