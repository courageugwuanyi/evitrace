export type MatrixLevelKey = "junior" | "mid" | "senior";
export type MatrixPillarKey = "technical_execution" | "collaboration" | "delivery_reliability";

export type MatrixSchema = Record<MatrixLevelKey, Record<MatrixPillarKey, string[]>>;

export const MATRIX_PILLARS: Array<{ key: MatrixPillarKey; label: string; keywords: string[] }> = [
  {
    key: "technical_execution",
    label: "Technical Execution",
    keywords: [
      "code",
      "bug",
      "architecture",
      "design",
      "system",
      "scal",
      "api",
      "test",
      "quality",
      "refactor",
      "performance",
      "incident",
    ],
  },
  {
    key: "collaboration",
    label: "Collaboration",
    keywords: [
      "team",
      "mentor",
      "review",
      "feedback",
      "stakeholder",
      "commun",
      "partner",
      "cross",
      "alignment",
      "coach",
      "support",
      "documentation",
    ],
  },
  {
    key: "delivery_reliability",
    label: "Delivery Reliability",
    keywords: [
      "deliver",
      "ship",
      "sprint",
      "deadline",
      "release",
      "execution",
      "launch",
      "scope",
      "estimate",
      "ownership",
      "risk",
      "roadmap",
      "milestone",
    ],
  },
];

export const FALLBACK_PILLARS: Record<MatrixPillarKey, string[]> = {
  technical_execution: [
    "Builds reliable implementations and improves code quality through testing and review.",
    "Breaks technical problems into clear, maintainable implementation steps.",
  ],
  collaboration: [
    "Communicates progress and blockers clearly to teammates and partners.",
    "Works collaboratively through feedback and cross-functional coordination.",
  ],
  delivery_reliability: [
    "Plans and ships scoped work with predictable cadence.",
    "Owns delivery follow-through and raises risks early.",
  ],
};

export const SAMPLE_MATRIX_TEMPLATE: MatrixSchema = {
  junior: {
    technical_execution: [
      "Implements clean, readable code for scoped tasks.",
      "Fixes straightforward bugs and adds baseline tests.",
      "Learns architecture patterns used in the current codebase.",
    ],
    collaboration: [
      "Asks for support early and follows through on review feedback.",
      "Documents task progress and keeps teammates informed.",
      "Participates constructively in team discussions and retrospectives.",
    ],
    delivery_reliability: [
      "Completes well-defined tickets within expected timelines.",
      "Follows team release and branching workflows consistently.",
      "Escalates blockers quickly to avoid delivery delays.",
    ],
  },
  mid: {
    technical_execution: [
      "Owns medium complexity features end-to-end.",
      "Writes robust tests and debugs cross-module issues.",
      "Improves architecture decisions with practical trade-off analysis.",
    ],
    collaboration: [
      "Partners effectively with product, design, and engineering peers.",
      "Gives high-signal code review feedback and shares context.",
      "Coordinates dependencies and keeps execution aligned across teammates.",
    ],
    delivery_reliability: [
      "Ships predictably across sprints and maintains quality.",
      "Manages scope with clear milestones and risk visibility.",
      "Supports incident response and follow-up actions effectively.",
    ],
  },
  senior: {
    technical_execution: [
      "Designs scalable systems and leads architecture evolution.",
      "Raises engineering standards through deep reviews and mentorship.",
      "Converts ambiguous requirements into clear technical plans.",
    ],
    collaboration: [
      "Mentors engineers and amplifies team capability.",
      "Aligns cross-functional stakeholders on technical direction.",
      "Drives clear technical communication through design docs and RFCs.",
    ],
    delivery_reliability: [
      "Owns delivery outcomes for critical initiatives.",
      "Balances speed, quality, and operational risk under pressure.",
      "Builds resilient processes that improve long-term execution reliability.",
    ],
  },
};

export function normalizeMatrix(input: unknown): MatrixSchema | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as Record<string, unknown>;
  const levels: MatrixLevelKey[] = ["junior", "mid", "senior"];
  const pillars: MatrixPillarKey[] = ["technical_execution", "collaboration", "delivery_reliability"];
  const normalized = {} as MatrixSchema;

  for (const level of levels) {
    const levelValue = candidate[level];
    if (!levelValue || typeof levelValue !== "object") return null;
    const levelRecord = levelValue as Record<string, unknown>;
    normalized[level] = {
      technical_execution: [],
      collaboration: [],
      delivery_reliability: [],
    };

    for (const pillar of pillars) {
      const pillarValue = levelRecord[pillar];
      if (!Array.isArray(pillarValue)) return null;
      normalized[level][pillar] = pillarValue
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter((entry) => entry.length > 0);
    }
  }

  return normalized;
}

export function levelFromCurrentRole(currentLevel: string | undefined): MatrixLevelKey {
  const value = (currentLevel ?? "").trim().toLowerCase();
  if (value.includes("junior") || value.includes("associate")) return "junior";
  if (
    value.includes("senior") ||
    value.includes("lead") ||
    value.includes("staff") ||
    value.includes("principal")
  ) {
    return "senior";
  }
  return "mid";
}

function splitRawTextIntoBlocks(rawText: string): string[] {
  return rawText
    .split(/\r?\n+/)
    .flatMap((line) => line.split(/[•·;|]+/))
    .map((line) => line.replace(/^\s*([-*•\u2022]|\d+[\.\)])\s*/, "").trim())
    .filter((line) => line.length > 0);
}

function classifyRawLine(line: string, bucketSizes: Record<MatrixPillarKey, number>): MatrixPillarKey {
  const normalizedLine = line.toLowerCase();
  let winningKey: MatrixPillarKey = "technical_execution";
  let winningScore = -1;
  for (const pillar of MATRIX_PILLARS) {
    const score = pillar.keywords.reduce(
      (sum, keyword) => sum + (normalizedLine.includes(keyword) ? 1 : 0),
      0,
    );
    if (score > winningScore) {
      winningScore = score;
      winningKey = pillar.key;
    }
  }
  if (winningScore > 0) return winningKey;
  const sorted = (Object.keys(bucketSizes) as MatrixPillarKey[]).sort((a, b) => bucketSizes[a] - bucketSizes[b]);
  return sorted[0] ?? "technical_execution";
}

export function buildMatrixFromRawText(rawText: string): MatrixSchema {
  const lines = splitRawTextIntoBlocks(rawText);
  const buckets: Record<MatrixPillarKey, string[]> = {
    technical_execution: [],
    collaboration: [],
    delivery_reliability: [],
  };

  for (const line of lines) {
    const target = classifyRawLine(line, {
      technical_execution: buckets.technical_execution.length,
      collaboration: buckets.collaboration.length,
      delivery_reliability: buckets.delivery_reliability.length,
    });
    buckets[target].push(line);
  }

  const merged: Record<MatrixPillarKey, string[]> = {
    technical_execution: [...buckets.technical_execution, ...FALLBACK_PILLARS.technical_execution].slice(0, 9),
    collaboration: [...buckets.collaboration, ...FALLBACK_PILLARS.collaboration].slice(0, 9),
    delivery_reliability: [...buckets.delivery_reliability, ...FALLBACK_PILLARS.delivery_reliability].slice(0, 9),
  };

  return {
    junior: {
      technical_execution: merged.technical_execution.slice(0, 3),
      collaboration: merged.collaboration.slice(0, 3),
      delivery_reliability: merged.delivery_reliability.slice(0, 3),
    },
    mid: {
      technical_execution: merged.technical_execution.slice(0, 5),
      collaboration: merged.collaboration.slice(0, 5),
      delivery_reliability: merged.delivery_reliability.slice(0, 5),
    },
    senior: {
      technical_execution: merged.technical_execution.slice(0, 7),
      collaboration: merged.collaboration.slice(0, 7),
      delivery_reliability: merged.delivery_reliability.slice(0, 7),
    },
  };
}
