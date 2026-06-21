import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth";
import type { AuthUser, InboxItem, NotificationPrefs, IntegrationPrefs } from "@/lib/api/mappers";
import {
  useEvidenceQuery,
  useSaveEvidence,
  useArchiveEvidence,
  useRestoreEvidence,
  useDeleteEvidence,
  useInsertEvidence,
} from "@/lib/api/evidence";
import { useInboxQuery, useApproveInbox, useDismissInbox } from "@/lib/api/inbox";
import {
  useObjectivesQuery,
  useCreateObjective,
  useMoveObjective,
  useSaveObjective,
  useArchiveObjective,
  useRestoreObjective,
  useDeleteObjective,
} from "@/lib/api/objectives";
import {
  useAssessmentsQuery,
  useDeleteAssessment,
  useFinalizeAssessment,
  useUpdateOneOnOneTopics,
} from "@/lib/api/assessments";
import { useDashboardStats } from "@/lib/api/dashboard";
import { useFeedbackQuery, useAddFeedback } from "@/lib/api/feedback";
import { useUploadAvatar } from "@/lib/api/profile";
import { useSettingsQuery, useSaveNotifications, useSaveIntegrations } from "@/lib/api/settings";
import { useFrameworkQuery, useUploadFramework } from "@/lib/api/frameworks";
import { supabase } from "@/lib/supabase";
import { generateSafeId } from "@/lib/utils/generateSafeId";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Radar as RadarIcon,
  LayoutDashboard,
  TableProperties,
  Target,
  Search,
  Plus,
  X,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  ListTodo,
  Filter,
  Info,
  ChevronDown,
  Link as LinkIcon,
  Paperclip,
  UploadCloud,
  AlignLeft,
  ExternalLink,
  Github,
  MessageSquare,
  FileText,
  Bell,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Settings as SettingsIcon,
  Award,
  AlertTriangle,
  UserCheck,
  Download,
  Edit2,
  Trash2,
  User,
  Users,
  Puzzle,
  Layers,
  BookOpen,
  Wrench,
  Share2,
  History,
  Save,
  FileCheck2,
  ClipboardList,
  BarChartHorizontal,
  ArrowLeft,
  Pencil,
  GripVertical,
  Lock,
  Archive,
  ArchiveRestore,
  RotateCcw,
  Eye,
  PanelLeftClose,
  PanelLeft,
  Menu,
  CloudUpload,
  Loader2,
} from "lucide-react";
import {
  Slack,
  Gitlab,
  Trello,
  Figma,
  FileSpreadsheet,
  Presentation,
  GitBranch,
} from "lucide-react";
import { MessageCircleHeart, Notebook, Camera, KeyRound, Send } from "lucide-react";
import { Mail, Building2, LogIn, LogOut, ShieldCheck, ChevronLeft } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
    section: typeof search.section === "string" ? search.section : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Evitrace - Engineering Competency & Promotion Tracking" },
      {
        name: "description",
        content:
          "Capture evidence of your work, map it to competencies, and close the gap to your next promotion.",
      },
      { property: "og:title", content: "Evitrace - Promotion Radar for Engineers" },
      {
        property: "og:description",
        content: "Track competency, evidence, and SMART objectives in one trusted workspace.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: App,
});

/* ---------- Design tokens ---------- */
const C = {
  bg: "#FAFBFC",
  card: "#FFFFFF",
  border: "#DFE1E6",
  borderStrong: "#C1C7D0",
  primary: "#0052CC",
  primaryHover: "#0065FF",
  primarySoft: "#DEEBFF",
  navy: "#172B4D",
  slate: "#42526E",
  subtle: "#6B778C",
  green: "#36B37E",
  greenSoft: "#E3FCEF",
  amber: "#FFAB00",
  amberSoft: "#FFFAE6",
  red: "#DE350B",
};

const BRAND_ICON_SRC = "/icons/icon128.png?v=20260621";

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src={BRAND_ICON_SRC}
      alt="Evitrace"
      width={size}
      height={size}
      className="rounded object-cover shrink-0"
    />
  );
}

const COMPETENCIES = [
  "Analytical Thinking",
  "System Design",
  "Code Quality",
  "Communication",
  "Leadership",
  "Engineering for UX",
  "Security",
  "Delivery",
];

const COMPETENCY_DESC: Record<string, string> = {
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

const EFFECTIVENESS_SCALE: {
  value: number;
  label: string;
  tone: "danger" | "warning" | "info" | "success";
}[] = [
  { value: 1, label: "Limited Effectiveness", tone: "danger" },
  { value: 2, label: "Somewhat Effective", tone: "warning" },
  { value: 3, label: "Fully Effective", tone: "info" },
  { value: 4, label: "Highly Effective", tone: "success" },
  { value: 5, label: "Extremely Effective", tone: "success" },
];

// 3-tier framework: Category -> Subcategory/Question -> 1-5 Effectiveness
const SUBCATEGORIES: Record<string, string[]> = {
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

const DEFAULT_EFFECTIVENESS_WEIGHT = 1;

/* ---------- Shared category helpers ---------- */
const ALL_CATEGORIES = Object.keys(SUBCATEGORIES);

/**
 * Official Associate Software Engineer competency framework (per Atlassian-style
 * assessment template). Used in the Evidence Details slide-over to map a logged
 * artifact to a Category (competency area) and Subcategory/Question.
 */
const PDF_FRAMEWORK: Record<string, string[]> = {
  "Analytical Thinking": [
    "Identifies critical connections and patterns in information/data.",
    "Draws logical conclusions based on in-depth analysis of information.",
    "Recognizes causes and consequences of actions and events that are not readily apparent.",
    "Anticipates obstacles considering next steps.",
  ],
  Communication: [
    "Recalls others' main points, taking them into account in own communication.",
    "Checks own understanding of others' communication (e.g. paraphrases, asks questions).",
    "Elicits comments or feedback on what has been said.",
    "Maintains continuous, open and consistent communication with others.",
  ],
  Teamwork: [
    "Deals honestly and fairly with others, showing consideration and respect for individual differences.",
    "Does own fair share of the work.",
    "Seeks assistance from other team members, as needed.",
    "Assists other team members.",
    "Shares all relevant information with others.",
  ],
  "Languages and Frameworks": [
    "Conversant in language's syntax.",
    "Applies coding concepts (loops, conditional statements, etc.) to new languages.",
    "Understands and avoids common mistakes with core libraries.",
    "Describe what code smells are.",
    "Critiques own code to identify areas for improvement.",
    "Describe the differences between families of languages (e.g. compiled vs interpreted, native vs managed, garbage collected vs non-managed, etc.).",
    "Understand the need for responsible disclosure of security vulnerabilities.",
  ],
  "Engineering Quality": [
    "Performs common testing strategies to verify basic application functionality.",
    "Follows common testing strategies and writing simple tests to ensure software meets expected quality.",
    "Understands basic testing types and methodologies and their key differences.",
    "Writes simple tests to test own product code and the application's functionality.",
  ],
  "Software Tooling": [
    "Maintains documentation of tool usage in our products whenever necessary to keep it up-to-date.",
    "Troubleshoot simple issues that happen to the development tools (e.g. update dependent libraries' versions, increase storage volume size with terraform, etc.).",
    "Uses common tools (e.g. IDE, version control, build and deployment pipeline, AWS, dependency management, automated testing, etc.) to contribute to the software development process.",
    "Explains how different tools work together in the Systems Development Life Cycle (SDLC).",
  ],
  "Build and Deployment": [
    "Explains the different phases in a build system run and resolve problems in them.",
    "Interprets build results to fix local machine build problems.",
    "Explain what a build is and the how to deploy it to different environments.",
  ],
  "Engineering for User Experience": [
    "Awareness of UX personas for the application or service in question and their purpose.",
    "Awareness of the goals of good UX in a product/service (e.g. consistency in UI and API, ease of use, efficiency).",
    "Describes where our software impacts on user experience (UI and API).",
    "Improves their UX knowledge with relevant learning (e.g. Product User Experience space on 'i').",
    "Uses a Design System (e.g. Atlassian Design Guide, Invision DSM, etc.) as directed.",
  ],
  "Data Management": [
    "Awareness of several simple, data representations/formats in use for their product/project (e.g. CSV, XML, JSON, YAML). Basic understanding / use of RDBMS.",
    "Describes a basic data-lifecycle for a product they work on.",
    "Understands the technology stack of a typical data-management system.",
  ],
  Environments: [
    "Sanitises user input using provided libraries and techniques under direction.",
    "Awareness that their code is not the only code present in a particular system.",
    "Support the resolution of environment specific issues.",
    "Appreciates how environment problems may manifest.",
    "Uses appropriate datastores with guidance.",
  ],
  "Organisation and Patterns": [
    "Clarifies the difference between stateful and stateless functions/systems.",
    "Follow and replicate design patterns in a given codebase with support.",
    "Explains the basic principles of OOP and Functional Programming and the differences between them.",
    "Knowledge of recursion and data structures details.",
    "Runs time and space requirements of different algorithms/functions to avoid major performance pitfalls.",
    "Implements simple algorithms as set out by others.",
    "Identifies where problem statements are not clear to determine errors and raise issues appropriately.",
    "Improves the readability of larger, more complex blocks of code.",
  ],
};
const PDF_CATEGORIES = Object.keys(PDF_FRAMEWORK);

function radarLabelToCategory(label: string): string {
  if (label === "Analytical") return "Analytical Thinking";
  if (label === "UX Eng") return "Engineering for UX";
  return label;
}
function categoryToRadarLabel(cat: string): string {
  if (cat === "Analytical Thinking") return "Analytical";
  if (cat === "Engineering for UX") return "UX Eng";
  return cat;
}

const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDisplayDate(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return String(input);
  return DISPLAY_DATE_FORMATTER.format(date);
}

function clampEffectivenessWeight(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_EFFECTIVENESS_WEIGHT;
  return Math.max(1, Math.min(5, Math.round(value)));
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
  const category = assessment?.categories.find((item) => item.categoryName === categoryName);
  return category?.questions.find((item) => item.questionText === questionText);
}

function getHistoricalQuestionScores(
  assessment: Assessment | undefined,
  categoryName: string,
  questionText: string,
): { previous: number; current: number; target: number; note: string } {
  const question = findQuestionFromAssessment(assessment, categoryName, questionText);
  if (!question) {
    return {
      previous: DEFAULT_EFFECTIVENESS_WEIGHT,
      current: DEFAULT_EFFECTIVENESS_WEIGHT,
      target: 4,
      note: "",
    };
  }
  return {
    previous: clampEffectivenessWeight(question.previousScore),
    current: clampEffectivenessWeight(question.currentScore),
    target: clampEffectivenessWeight(question.targetScore),
    note: question.justification ?? "",
  };
}

function calculateScoreDelta(previousScore: number, currentScore: number): number {
  return +(currentScore - previousScore).toFixed(2);
}

function triggerAssessmentPdfDownload(assessment: Assessment): void {
  if (typeof window === "undefined") return;
  const printable = window.open("", "_blank", "noopener,noreferrer,width=1024,height=900");
  if (!printable) return;

  const rows = assessment.categories
    .map((category) => {
      const questions = category.questions
        .map((question) => {
          const delta = calculateScoreDelta(question.previousScore, question.currentScore);
          return `<tr>
            <td>${question.questionText}</td>
            <td>${clampEffectivenessWeight(question.previousScore)}</td>
            <td>${clampEffectivenessWeight(question.currentScore)}</td>
            <td>${delta > 0 ? "+" : ""}${delta}</td>
          </tr>`;
        })
        .join("");
      return `<section>
        <h3>${category.categoryName} (Avg ${averageQuestionWeight(category.questions, "currentScore").toFixed(2)})</h3>
        <table>
          <thead><tr><th>Question</th><th>Previous</th><th>Current</th><th>Delta</th></tr></thead>
          <tbody>${questions}</tbody>
        </table>
      </section>`;
    })
    .join("");

  printable.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${assessment.reviewPeriod} Assessment Report</title>
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
    <h1>${assessment.reviewPeriod}</h1>
    <h2>Assessment ${assessment.id}</h2>
    <div class="meta">
      Engineer: ${assessment.engineerName} &nbsp;|&nbsp; Manager: ${assessment.managerName}
      &nbsp;|&nbsp; Finalized: ${formatDisplayDate(assessment.dateCompleted)}
      &nbsp;|&nbsp; Overall Readiness: ${assessment.overallReadinessScore}%
    </div>
    ${rows}
  </body>
</html>`);
  printable.document.close();
  printable.focus();
  printable.print();
}

function formatEvidenceDateParts(input: string | Date): { dayMonth: string; year: string } {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return { dayMonth: String(input), year: "" };
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = String(date.getFullYear());
  return { dayMonth: `${day} ${month}`, year };
}

function formatObjectiveCode(objective: Pick<Objective, "id" | "competency" | "title">): string {
  if (/^[A-Z]{2,5}-\d{2,6}$/.test(objective.id)) return objective.id;
  const seed = objective.competency || objective.title || "OBJ";
  const prefix = seed
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .replace(/[^A-Z]/g, "")
    .slice(0, 3)
    .padEnd(3, "X");

  const base = objective.id.replace(/-/g, "");
  let checksum = 0;
  for (let i = 0; i < base.length; i += 1) {
    checksum = (checksum + base.charCodeAt(i) * (i + 1)) % 10000;
  }
  return `${prefix}-${String(checksum).padStart(4, "0")}`;
}

function extractFirstLink(raw: string): string | null {
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

function polishText(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return cleaned;
  const normalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function getDisplayName(fullName?: string, email?: string): string {
  const trimmedFullName = fullName?.trim();
  if (trimmedFullName) return trimmedFullName;
  const localPart = email?.split("@")[0]?.trim();
  return localPart || "User";
}

function inferCompetencyFromText(title: string, description: string) {
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

/** Derives radar chart data from the most recent Assessment.
 *  Maps each category's `categoryCurrentAvg` (1–5 scale) to 0–4 radar scale.
 *  Falls back to the static initialRadar shape when no assessment is available. */
function deriveRadarData(
  assessment: Assessment | undefined,
): { competency: string; current: number; target: number }[] {
  const RADAR_COMPETENCIES = [
    "Analytical",
    "System Design",
    "Code Quality",
    "Communication",
    "Leadership",
    "UX Eng",
    "Security",
    "Delivery",
  ];
  return RADAR_COMPETENCIES.map((label) => {
    const cat = radarLabelToCategory(label);
    const found = assessment?.categories.find((c) => c.categoryName === cat);
    const current = found ? +Math.min(4, (found.categoryCurrentAvg / 5) * 4).toFixed(2) : 0;
    return { competency: label, current, target: 4 };
  });
}

/* ---------- Review session types ---------- */
type ReviewQuestion = {
  prev: number;
  next: number;
  notes: string;
  evidenceIds: string[];
};
type ReviewSession = {
  id: string;
  date: string;
  period: string;
  engineer: string;
  manager: string;
  scores: Record<string, Record<string, ReviewQuestion>>;
};

type AssessmentWizardDraft = {
  activeIdx: number;
  scores: Record<string, Record<string, ReviewQuestion>>;
  savedAt: string;
};

const ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX = "evitrace_active_assessment_draft";
const LEGACY_ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX = "evitrace.assessmentWizardDraft";

function getAssessmentWizardDraftStorageKey(userId: string): string {
  return `${ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX}.${userId}`;
}

function getLegacyAssessmentWizardDraftStorageKey(userId: string): string {
  return `${LEGACY_ASSESSMENT_WIZARD_DRAFT_KEY_PREFIX}.${userId}`;
}

/* ---------- Historical Assessments (strict schema) ----------
 * Category.categoryCurrentAvg MUST equal the arithmetic mean of its questions'
 * currentScore values. Use `withDerivedAverages()` to enforce that invariant.
 */
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
  dateCompleted: string; // ISO
  reviewPeriod: string;
  status: "Finalized" | "Draft" | "In Review";
  engineerName: string;
  managerName: string;
  overallReadinessScore: number; // 0-100
  categories: AssessmentCategory[];
  oneOnOneTopics: string[];
  isSample?: boolean;
};

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return +(nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2);
}

/** Recomputes every categoryCurrentAvg from its questions and the overall
 *  readiness score (0-100, mapped from the 1-5 effectiveness scale). */
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
function sessionToAssessment(s: ReviewSession): Assessment {
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
      categoryCurrentAvg: 0, // derived below
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
    overallReadinessScore: 0, // derived below
    categories,
    oneOnOneTopics: [],
  });
}

/** Convert a stored Assessment back to the in-memory ReviewSession shape
 *  that ReportView already consumes. */
function assessmentToSession(a: Assessment): ReviewSession {
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
  scores: Record<string, [number, number, string?][]>; // cat -> [prev, current, note?]
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

const initialAssessments: Assessment[] = [
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

/* ---------- Primitives ---------- */
function Card({ children, className = "", ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`bg-white border rounded-md shadow-sm ${className}`}
      style={{ borderColor: C.border }}
    >
      {children}
    </div>
  );
}

function PrimaryBtn({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 px-3 h-9 text-sm font-medium text-white rounded transition-colors ${className}`}
      style={{ background: C.primary }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
    >
      {children}
    </button>
  );
}

function GhostBtn({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 px-3 h-9 text-sm font-medium rounded transition-colors hover:bg-[#F4F5F7] ${className}`}
      style={{ color: C.slate }}
    >
      {children}
    </button>
  );
}

function Pill({
  active,
  onClick,
  children,
  icon,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 h-7 text-xs font-medium rounded-full border transition-all"
      style={{
        background: active ? C.primarySoft : "#F4F5F7",
        color: active ? C.primary : C.slate,
        borderColor: active ? C.primary : "transparent",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function Badge({
  tone = "neutral",
  children,
  icon,
}: {
  tone?: "neutral" | "success" | "warning" | "info" | "danger";
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const map = {
    neutral: { bg: "#F4F5F7", fg: C.slate },
    success: { bg: C.greenSoft, fg: "#006644" },
    warning: { bg: C.amberSoft, fg: "#974F00" },
    info: { bg: C.primarySoft, fg: C.primary },
    danger: { bg: "#FFEBE6", fg: "#BF2600" },
  } as const;
  const s = map[tone];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 h-6 text-[11px] font-semibold uppercase tracking-wide rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
      style={{ background: s.bg, color: s.fg }}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}

/* ============================================================ */
/*           SOURCE ICON MAPPING                                */
/* ============================================================ */

const BitbucketIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M2.65 3a.65.65 0 0 0-.65.76l2.72 16.5a.88.88 0 0 0 .87.74h13.04a.65.65 0 0 0 .65-.55l2.72-16.69a.65.65 0 0 0-.65-.76zm11.46 11.85h-4.21l-1.14-5.95h6.36z" />
  </svg>
);

const JiraIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      d="M11.53 2a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V2.7a.7.7 0 0 0-.7-.7zM6.18 7.34a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V8.04a.7.7 0 0 0-.7-.7zM.84 12.66a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V13.36a.7.7 0 0 0-.7-.7z"
      transform="scale(0.85)"
    />
  </svg>
);

const ConfluenceIcon = BookOpen;

function SourceIcon({ source, size = 14 }: { source: string; size?: number }) {
  const s = source.toLowerCase();
  const cls = "shrink-0";
  if (s.includes("bitbucket"))
    return (
      <span className={cls} style={{ color: "#2684FF" }}>
        <BitbucketIcon size={size} />
      </span>
    );
  if (s.includes("jira"))
    return (
      <span className={cls} style={{ color: "#2684FF" }}>
        <JiraIcon size={size} />
      </span>
    );
  if (s.includes("github"))
    return <Github size={size} className={cls} style={{ color: "#24292F" }} />;
  if (s.includes("gitlab"))
    return <Gitlab size={size} className={cls} style={{ color: "#FC6D26" }} />;
  if (s.includes("slack"))
    return <Slack size={size} className={cls} style={{ color: "#4A154B" }} />;
  if (s.includes("teams") || s.includes("microsoft"))
    return <MessageSquare size={size} className={cls} style={{ color: "#5059C9" }} />;
  if (s.includes("excel") || s.includes("sheet"))
    return <FileSpreadsheet size={size} className={cls} style={{ color: "#21A366" }} />;
  if (s.includes("powerpoint") || s.includes("slides"))
    return <Presentation size={size} className={cls} style={{ color: "#D24726" }} />;
  if (s.includes("confluence"))
    return <ConfluenceIcon size={size} className={cls} style={{ color: "#2684FF" }} />;
  if (s.includes("trello"))
    return <Trello size={size} className={cls} style={{ color: "#0079BF" }} />;
  if (s.includes("figma"))
    return <Figma size={size} className={cls} style={{ color: "#A259FF" }} />;
  if (s.includes("git"))
    return <GitBranch size={size} className={cls} style={{ color: C.slate }} />;
  if (s.includes("word") || s.includes("doc"))
    return <FileText size={size} className={cls} style={{ color: "#2B579A" }} />;
  return <FileText size={size} className={cls} style={{ color: C.slate }} />;
}

function SourceChip({ source }: { source: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 h-6 text-[11px] font-semibold rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
      style={{ background: "#F4F5F7", color: C.slate }}
    >
      <SourceIcon source={source} size={12} />
      <span className="truncate">{source}</span>
    </span>
  );
}

function Input({
  icon,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  return (
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-2.5 pointer-events-none" style={{ color: C.subtle }}>
          {icon}
        </span>
      )}
      <input
        {...rest}
        className={`h-9 ${icon ? "pl-8" : "pl-3"} pr-3 w-full text-sm rounded border bg-[#F4F5F7] focus:bg-white outline-none transition-all focus:ring-2 ${className}`}
        style={{
          borderColor: C.border,
          color: C.navy,
        }}
        onFocus={(e) => {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.borderColor = C.primary;
          e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = "#F4F5F7";
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function Select({
  icon,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: React.ReactNode }) {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <span className="absolute left-2.5 pointer-events-none" style={{ color: C.subtle }}>
          {icon}
        </span>
      )}
      <select
        {...rest}
        className={`h-9 w-full ${icon ? "pl-8" : "pl-3"} pr-8 text-sm rounded border bg-[#F4F5F7] hover:bg-white outline-none appearance-none cursor-pointer transition-all`}
        style={{ borderColor: C.border, color: C.navy }}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 pointer-events-none"
        style={{ color: C.subtle }}
      />
    </div>
  );
}

function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative w-full max-w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full max-w-full min-w-0 h-auto py-2 pl-3 pr-8 text-sm rounded border bg-[#F4F5F7] hover:bg-white outline-none focus:ring-2 text-left whitespace-normal break-words leading-snug transition-all disabled:opacity-50"
        style={{ borderColor: C.border, color: C.navy }}
      >
        {value || placeholder}
      </button>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: C.subtle }}
      />
      {open && (
        <div
          className="absolute z-20 mt-1 w-full max-w-full rounded border bg-white shadow-lg overflow-y-auto max-h-60"
          style={{ borderColor: C.border }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm whitespace-normal break-words leading-snug hover:bg-[#F4F5F7]"
              style={{ color: C.navy }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Mock data ---------- */
const initialRadar = [
  { competency: "Analytical", current: 3.2, target: 4 },
  { competency: "System Design", current: 2.8, target: 4 },
  { competency: "Code Quality", current: 3.6, target: 4 },
  { competency: "Communication", current: 3.0, target: 4 },
  { competency: "Leadership", current: 2.4, target: 4 },
  { competency: "UX Eng", current: 2.6, target: 4 },
  { competency: "Security", current: 2.9, target: 4 },
  { competency: "Delivery", current: 3.4, target: 4 },
];

type EvidenceStatus = "Pending Review" | "Reviewed";
type EvidenceMatch = "Yes" | "No" | "Somewhat" | "Unset";

type EvidenceRecord = {
  id: string;
  date: string;
  source: string;
  category: string;
  competency: string;
  title: string;
  description: string;
  link: string;
  status: EvidenceStatus;
  matchState: EvidenceMatch;
  managerNotes: string;
  linkageKey?: string;
  isSample?: boolean;
  isArchived: boolean;
  archivedDate?: string;
};

const initialEvidence: EvidenceRecord[] = [
  {
    id: "EV-201",
    date: "Dec 02, 2026",
    source: "Bitbucket",
    category: "Technical",
    competency: "System Design",
    title: "Migrated billing service to event-driven model",
    description: "Designed Kafka topology and rollout plan; zero downtime cutover.",
    link: "bitbucket.org/acme/billing/pull-requests/482",
    status: "Reviewed",
    matchState: "Yes",
    managerNotes:
      "Strong example of cross-team coordination. Tag this for the L4 architecture criterion in your packet.",
    isArchived: false,
  },
  {
    id: "EV-200",
    date: "Nov 28, 2026",
    source: "Jira",
    category: "Delivery",
    competency: "Delivery",
    title: "Shipped Q4 metering MVP",
    description: "Coordinated across 3 squads; delivered 4 days ahead of plan.",
    link: "acme.atlassian.net/AT-1422",
    status: "Reviewed",
    matchState: "Yes",
    managerNotes:
      "Add a short note on the dependency-tracking spreadsheet you maintained week over week.",
    isArchived: false,
  },
  {
    id: "EV-199",
    date: "Nov 24, 2026",
    source: "Confluence",
    category: "Leadership",
    competency: "Communication",
    title: "Ran cross-team RFC review",
    description: "Facilitated 12-person review; consolidated 3 proposals into 1.",
    link: "acme.atlassian.net/wiki/spaces/ENG/RFC-Payments",
    status: "Pending Review",
    matchState: "Unset",
    managerNotes: "",
    isArchived: false,
  },
  {
    id: "EV-198",
    date: "Nov 19, 2026",
    source: "Slack",
    category: "Technical",
    competency: "Security",
    title: "Patched JWT validation edge case",
    description: "Identified and remediated token replay vector flagged in audit.",
    link: "slack.com/archives/sec/p17324",
    status: "Reviewed",
    matchState: "Somewhat",
    managerNotes:
      "Re-word the description to highlight the threat model and your remediation approach more explicitly.",
    isArchived: false,
  },
  {
    id: "EV-197",
    date: "Nov 11, 2026",
    source: "Bitbucket",
    category: "Technical",
    competency: "Code Quality",
    title: "Reduced p95 latency by 38%",
    description: "Profiled hot path, replaced N+1 query with batched loader.",
    link: "bitbucket.org/acme/api/pull-requests/612",
    status: "Reviewed",
    matchState: "Yes",
    managerNotes: "",
    isArchived: false,
  },
];

const initialInbox = [
  {
    id: "IN-1",
    source: "GitHub",
    icon: Github,
    title: "PR merged: feat/observability-traces",
    suggestion: ["System Design", "Code Quality"],
    when: "2h ago",
  },
  {
    id: "IN-2",
    source: "Jira",
    icon: FileText,
    title: "Story closed: AT-1488 SSO error recovery",
    suggestion: ["Delivery", "Communication"],
    when: "5h ago",
  },
  {
    id: "IN-3",
    source: "Slack",
    icon: MessageSquare,
    title: "Recognition from @priya in #eng-wins",
    suggestion: ["Leadership"],
    when: "Yesterday",
  },
];

type SuccessCriterion = {
  criteria: string;
  evidence: string;
  attachments?: { label: string; url: string }[];
  done?: boolean;
};

type Objective = {
  id: string;
  title: string;
  competency: string;
  targetSubcategory?: string;
  isSample?: boolean;
  due: string;
  status: "Pending Approval" | "In Progress" | "Completed";
  statement?: string;
  dateAuthored?: string;
  isArchived?: boolean;
  archivedDate?: string;
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  timebound?: string;
  links?: { label: string; url: string }[];
  notes?: string;
  successCriteria?: {
    learn: SuccessCriterion[];
    demonstrate: SuccessCriterion[];
    share: SuccessCriterion[];
  };
};

const initialObjectives: Objective[] = [
  {
    id: "UX-01",
    title: "Better solve customer painpoints through UX fundamentals",
    competency: "Engineering for User Experience",
    due: "Dec 15, 2026",
    dateAuthored: "Sep 24, 2026",
    status: "In Progress",
    statement:
      "Enable myself to better solve the main painpoints of our customers efficiently by understanding UX Personas, the goals of good UX, how UX impacts customers, Design Systems, and UX knowledge.",
    specific:
      "Study UX Personas, goals of good UX, Design Systems, and ship 2 production features that apply these principles end-to-end.",
    measurable:
      "Document learnings for each of the 5 topics and produce 5 demonstration artifacts linked from this objective.",
    achievable: "Block 3 hours weekly; pair with a Senior on the Design System working group.",
    relevant: "Closes the UX Engineering gap required for L4 promotion.",
    timebound: "Complete by Dec 15, 2026",
    links: [
      { label: "GOALS of Good UX (research doc)", url: "https://lawsofux.com/" },
      { label: "Design System overview", url: "https://example.com/design-system" },
    ],
    notes: "Currently working through the Laws of UX video series; design system research next.",
    successCriteria: {
      learn: [
        {
          criteria: "Use online / written resources to learn about UX Personas",
          evidence: "Documented list of topics covered",
        },
        {
          criteria: "Learn the goals of good UX",
          evidence: "Notes on Laws of UX + 4Cs of UX summary",
        },
        {
          criteria: "Learn how UX impacts customers",
          evidence: "Documented list of topics covered",
        },
        {
          criteria: "Learn about Design Systems",
          evidence: "Internal design system documentation reviewed",
        },
      ],
      demonstrate: [
        {
          criteria: "Use design system components to maintain UI consistency across a full feature",
          evidence: "Link to merged PR",
        },
        {
          criteria: "Demonstrate understanding of UX Personas in a feature spec",
          evidence: "Link to PRD with persona mapping",
        },
        {
          criteria: "Implement a robust error handling / feedback system",
          evidence: "Link to error-state implementation",
        },
        {
          criteria: "Design intuitive API endpoints around what users are trying to accomplish",
          evidence: "Link to API design doc",
        },
      ],
      share: [
        {
          criteria: "5–10 slide deck of key points from the Learn section",
          evidence: "Link to slides",
        },
        {
          criteria: "Short (2–5 min) videos for each Learn criterion",
          evidence: "Link to videos",
        },
        {
          criteria: "Documentation for each Demonstrate criterion",
          evidence: "Link to docs",
        },
      ],
    },
  },
  {
    id: "TEST-02",
    title: "Increase confidence through rigorous testing strategies",
    competency: "Code Quality",
    due: "Jan 31, 2027",
    dateAuthored: "Jun 19, 2026",
    status: "In Progress",
    statement:
      "Increase my satisfaction in solutions I provide for customer needs by understanding and applying test strategies and methodologies for improved solutions.",
    specific:
      "Learn and apply unit, integration, system, functional, and performance testing across two production services.",
    measurable:
      "Raise unit-test coverage from 62% to 85% on the auth service; add integration + system test suites with CI gating.",
    achievable: "Pair with QA lead twice monthly; allocate Friday afternoons to test work.",
    relevant: "Quality is a core L4 capability and an active gap on my Radar.",
    timebound: "Complete by Jan 31, 2027",
    links: [
      {
        label: "Testing strategies overview",
        url: "https://martinfowler.com/articles/practical-test-pyramid.html",
      },
    ],
    successCriteria: {
      learn: [
        {
          criteria: "Learn about testing strategies",
          evidence: "Documented list of topics covered",
        },
        {
          criteria: "Learn about testing methodologies",
          evidence: "Documented list of topics covered",
        },
      ],
      demonstrate: [
        {
          criteria: "Consistently writes meaningful, broad-scope unit tests",
          evidence: "Link to PRs",
        },
        {
          criteria: "Consistently writes meaningful integration tests",
          evidence: "Link to PRs",
        },
        {
          criteria: "Consistently writes meaningful system + functional tests",
          evidence: "Link to PRs",
        },
        {
          criteria: "Demonstrate understanding of white box and black box testing",
          evidence: "Worked example or doc",
        },
        {
          criteria: "Write automation for unit, integration, system, functional tests",
          evidence: "Link to CI pipeline",
        },
        {
          criteria: "Find security flaws using penetration testing techniques",
          evidence: "Link to write-up",
        },
        {
          criteria: "Perform or automate performance testing",
          evidence: "Link to performance suite",
        },
      ],
      share: [
        {
          criteria: "Slide deck of key points from the Learn section",
          evidence: "Link to slides",
        },
        {
          criteria: "Short videos for each Learn criterion",
          evidence: "Link to videos",
        },
        {
          criteria: "Documentation for each Demonstrate criterion",
          evidence: "Link to docs",
        },
      ],
    },
  },
  {
    id: "ARCH-04",
    title: "Lead a system design review for the search platform",
    competency: "System Design",
    due: "Jan 10, 2027",
    status: "Pending Approval",
  },
  {
    id: "LEAD-02",
    title: "Mentor two junior engineers through onboarding",
    competency: "Leadership",
    due: "Feb 28, 2027",
    status: "In Progress",
  },
  {
    id: "SEC-03",
    title: "Complete OWASP Top 10 certification",
    competency: "Security",
    due: "Oct 30, 2026",
    status: "Completed",
  },
];

/* ============================================================ */
/*                        APP ROOT                              */
/* ============================================================ */

type Tab =
  | "dashboard"
  | "radar"
  | "evidence"
  | "objectives"
  | "knowledge"
  | "feedback"
  | "report"
  | "settings";
const NAV_TABS: Tab[] = [
  "dashboard",
  "radar",
  "evidence",
  "objectives",
  "knowledge",
  "feedback",
  "report",
  "settings",
];
function isTab(value: string | undefined): value is Tab {
  return Boolean(value && NAV_TABS.includes(value as Tab));
}
type SampleContentVisibility = {
  dashboard: boolean;
  objectives: boolean;
  evidence: boolean;
};
type GlobalSearchSection = "objectives" | "evidence" | "knowledge";
type GlobalSearchResultItem = {
  id: string;
  title: string;
  description: string;
  section: GlobalSearchSection;
};

type InboxViewItem = InboxItem & { isSample?: boolean };
type InboxConfirmPayload = {
  title: string;
  description: string;
  category: string;
  subcategory: string;
};

type KnowledgeHubItem = {
  id: string;
  createdAt: string;
  challenge: string;
  lesson: string;
  referenceLinks: string[];
};

type KnowledgeItemRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  reference_links: unknown;
  created_at?: string;
};

function extractYouTubeVideoId(input: string): string | null {
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

function firstUrlInText(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s)]+/i);
  return match ? match[0] : null;
}

function urlsInText(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)]+/gi) ?? [];
  const normalized = matches.map((url) => url.trim());
  return Array.from(new Set(normalized));
}

function normalizeReferenceLinks(links: string[]): string[] {
  return Array.from(
    new Set(
      links
        .map((link) => link.trim())
        .filter((link) => /^https?:\/\/\S+\.\S+/i.test(link)),
    ),
  );
}

function parseKnowledgeItemRow(item: KnowledgeItemRow): KnowledgeHubItem | null {
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

/* ============================================================ */
/*        AUTH: context, gate, signup / signin screens          */
/* ============================================================ */

const LEVEL_OPTIONS = ["L1", "L2", "L3", "L4", "L5", "L6", "L7"];

function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}

function AppGate() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <EvitraceApp /> : <AuthScreens />;
}

function AuthScreens() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signinNotice, setSigninNotice] = useState<string | null>(null);
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: C.bg, color: C.navy, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className={`w-full ${mode === "signup" ? "max-w-2xl" : "max-w-md"}`}>
        <div className="flex items-center justify-center gap-2 mb-6">
          <BrandMark size={36} />
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
              Evitrace
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.subtle }}>
              Performance Intelligence
            </div>
          </div>
        </div>
        {mode === "signin" ? (
          <SigninForm
            notice={signinNotice}
            onSwitch={() => {
              setSigninNotice(null);
              setMode("signup");
            }}
          />
        ) : (
          <SignupForm
            onSwitch={(notice) => {
              setSigninNotice(notice ?? null);
              setMode("signin");
            }}
          />
        )}
      </div>
    </div>
  );
}

function SsoButton({ provider }: { provider: "Google" | "Microsoft" }) {
  const { signInWithGoogle, signInWithMicrosoft } = useAuth();
  const letter = provider === "Google" ? "G" : "M";
  const bg = provider === "Google" ? "#EA4335" : "#0078D4";
  return (
    <button
      type="button"
      onClick={() => (provider === "Google" ? signInWithGoogle() : signInWithMicrosoft())}
      className="w-full h-10 px-3 rounded border flex items-center justify-center gap-2 text-sm font-semibold hover:bg-[#F4F5F7] transition-colors"
      style={{ borderColor: C.border, color: C.navy, background: "#fff" }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
        style={{ background: bg }}
      >
        {letter}
      </span>
      Continue with {provider}
    </button>
  );
}

function SigninForm({ onSwitch, notice }: { onSwitch: () => void; notice?: string | null }) {
  const { signin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email || !password) {
      setErr("Enter your email and password to continue.");
      return;
    }
    const ok = await signin(email, password);
    if (!ok) {
      setErr("Invalid email or password. Please try again.");
    }
  }
  return (
    <Card className="p-7">
      <div className="text-xl font-bold" style={{ color: C.navy }}>
        Welcome back
      </div>
      <div className="text-xs mt-1" style={{ color: C.subtle }}>
        Sign in to track your evidence and competencies.
      </div>
      <div className="mt-5 space-y-2">
        <SsoButton provider="Google" />
        <SsoButton provider="Microsoft" />
      </div>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: C.border }} />
        <span className="text-[11px] uppercase tracking-wider" style={{ color: C.subtle }}>
          or
        </span>
        <div className="flex-1 h-px" style={{ background: C.border }} />
      </div>
      <form onSubmit={submit} className="space-y-4">
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-2 rounded-md border px-3 py-2 text-xs"
            style={{ borderColor: "#ABF5D1", background: "#E3FCEF", color: "#006644" }}
          >
            <CheckCircle size={14} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
        {err && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2 rounded-md border px-3 py-2 text-xs"
            style={{ borderColor: "#F5BCB1", background: "#FFEBE6", color: "#BF2600" }}
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}
        <Field label="Email" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            icon={<Mail size={14} />}
          />
        </Field>
        <Field label="Password" required>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            icon={<KeyRound size={14} />}
          />
        </Field>
        <PrimaryBtn type="submit" className="w-full justify-center mt-2">
          <LogIn size={14} />
          Sign in
        </PrimaryBtn>
      </form>
      <div className="text-xs text-center mt-4" style={{ color: C.subtle }}>
        New to Evitrace?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold"
          style={{ color: C.primary }}
        >
          Create an account
        </button>
      </div>
    </Card>
  );
}

function SignupForm({ onSwitch }: { onSwitch: (notice?: string) => void }) {
  const { signup } = useAuth();
  const [f, setF] = useState<AuthUser & { password: string }>({
    fullName: "",
    email: "",
    password: "",
    currentLevel: "",
    targetLevel: "",
    team: "",
    manager: "",
    managerEmail: "",
    skipLevel: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const upd = <K extends keyof AuthUser>(k: K, v: AuthUser[K]) => setF((p) => ({ ...p, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const required: (keyof (AuthUser & { password: string }))[] = [
      "fullName",
      "email",
      "password",
      "currentLevel",
      "targetLevel",
      "team",
      "manager",
      "managerEmail",
    ];
    for (const k of required) {
      if (!String(f[k]).trim()) {
        setErr("Please complete all required fields marked with *.");
        return;
      }
    }
    try {
      const unifiedCurrentLevel = f.currentLevel.trim();
      const ok = await signup({
        ...f,
        currentLevel: unifiedCurrentLevel,
        jobTitle: unifiedCurrentLevel,
      });
      if (ok) {
        onSwitch("Account created. Please verify your email, then sign in.");
      }
    } catch {
      setErr("Something went wrong while creating your account. Please try again.");
    }
  }
  return (
    <Card className="p-7 sm:p-8">
      <div className="text-xl font-bold" style={{ color: C.navy }}>
        Create your account
      </div>
      <div className="text-xs mt-1" style={{ color: C.subtle }}>
        Fields marked <span style={{ color: "#DE350B" }}>*</span> are required. You can complete
        optional fields later in Settings.
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <SsoButton provider="Google" />
        <SsoButton provider="Microsoft" />
      </div>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: C.border }} />
        <span className="text-[11px] uppercase tracking-wider" style={{ color: C.subtle }}>
          or sign up with email
        </span>
        <div className="flex-1 h-px" style={{ background: C.border }} />
      </div>
      <form onSubmit={submit} className="space-y-6">
        {err && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2 rounded-md border px-3 py-2 text-xs"
            style={{ borderColor: "#F5BCB1", background: "#FFEBE6", color: "#BF2600" }}
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}
        <section>
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-3"
            style={{ color: C.subtle }}
          >
            Account
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" required>
              <Input
                value={f.fullName}
                onChange={(e) => upd("fullName", e.target.value)}
                placeholder="Jordan Mills"
                icon={<User size={14} />}
              />
            </Field>
            <Field label="Work email" required>
              <Input
                type="email"
                value={f.email}
                onChange={(e) => upd("email", e.target.value)}
                placeholder="you@company.com"
                icon={<Mail size={14} />}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Password" required hint="At least 8 characters.">
                <Input
                  type="password"
                  value={f.password}
                  onChange={(e) => upd("password", e.target.value)}
                  placeholder="Create a password"
                  icon={<KeyRound size={14} />}
                />
              </Field>
            </div>
          </div>
        </section>

        <section>
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-3"
            style={{ color: C.subtle }}
          >
            Role & Levels
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Current Job Title / Level"
              required
              hint="Your current role/title in your organization (e.g. Senior Engineer, L3)."
            >
              <Select
                value={f.currentLevel}
                onChange={(e) => upd("currentLevel", e.target.value)}
              >
                <option value="">Select your current level</option>
                {LEVEL_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Target level" required hint="The next level you're aiming for.">
              <Input
                value={f.targetLevel}
                onChange={(e) => upd("targetLevel", e.target.value)}
                placeholder="Staff Engineer"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Business unit / Team" required>
                <Input
                  value={f.team}
                  onChange={(e) => upd("team", e.target.value)}
                  placeholder="Payments Platform"
                  icon={<Building2 size={14} />}
                />
              </Field>
            </div>
          </div>
        </section>

        <section>
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-3"
            style={{ color: C.subtle }}
          >
            Reporting
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Reporting manager" required>
              <Input
                value={f.manager}
                onChange={(e) => upd("manager", e.target.value)}
                placeholder="Alex Morgan"
                icon={<User size={14} />}
              />
            </Field>
            <Field label="Manager email" required>
              <Input
                type="email"
                value={f.managerEmail}
                onChange={(e) => upd("managerEmail", e.target.value)}
                placeholder="alex.morgan@acme.com"
                icon={<Mail size={14} />}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Manager's Manager (Skip-Level)"
                optional
                hint="The engineering leader or executive your direct manager reports to."
              >
                <Input
                  value={f.skipLevel}
                  onChange={(e) => upd("skipLevel", e.target.value)}
                  placeholder="Priya Shah"
                  icon={<ShieldCheck size={14} />}
                />
              </Field>
            </div>
          </div>
        </section>

        <PrimaryBtn type="submit" className="w-full justify-center">
          Create account
        </PrimaryBtn>
      </form>
      <div className="text-xs text-center mt-5" style={{ color: C.subtle }}>
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitch()}
          className="font-semibold"
          style={{ color: C.primary }}
        >
          Sign in
        </button>
      </div>
    </Card>
  );
}

function SecureEditDialog({
  label,
  current,
  options,
  onClose,
  onSave,
}: {
  label: string;
  current: string;
  options?: string[];
  onClose: () => void;
  onSave: (next: string, password: string) => Promise<boolean>;
}) {
  const [next, setNext] = useState(current);
  const [pwd, setPwd] = useState("");
  const canSave = pwd.trim().length > 0 && next.trim().length > 0;
  return (
    <Backdrop onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: C.border }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: C.primarySoft, color: C.primary }}
            >
              <Lock size={16} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Edit {label}
              </div>
              <div className="text-xs" style={{ color: C.subtle }}>
                Confirm your password to save changes.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#F4F5F7]"
            style={{ color: C.slate }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label={`New ${label}`}>
            {options ? (
              <Select value={next} onChange={(e) => setNext(e.target.value)}>
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            ) : (
              <Input value={next} onChange={(e) => setNext(e.target.value)} />
            )}
          </Field>
          <Field label="Current Password">
            <Input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Enter your password"
              icon={<KeyRound size={14} />}
            />
          </Field>
        </div>
        <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: C.border }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn
            disabled={!canSave}
            onClick={async () => {
              if (!canSave) return;
              const ok = await onSave(next.trim(), pwd);
              if (!ok) toast.error("Incorrect password");
              else {
                toast.success(`${label} updated`);
                onClose();
              }
            }}
          >
            Save Changes
          </PrimaryBtn>
        </div>
      </motion.div>
    </Backdrop>
  );
}

function SecureField({
  label,
  value,
  options,
  onSave,
}: {
  label: string;
  value: string;
  options?: string[];
  onSave: (next: string, password: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <Input value={value} readOnly />
        <GhostBtn onClick={() => setEditing(true)}>
          <Pencil size={12} />
          Edit
        </GhostBtn>
      </div>
      <AnimatePresence>
        {editing && (
          <SecureEditDialog
            label={label}
            current={value}
            options={options}
            onClose={() => setEditing(false)}
            onSave={onSave}
          />
        )}
      </AnimatePresence>
    </Field>
  );
}

function EvitraceApp() {
  const { user, userId: authUserId } = useAuth();
  const { tab: searchTab, section: searchSection } = Route.useSearch();
  const navigate = Route.useNavigate();
  const userId = authUserId ?? "";

  const [tab, setTab] = useState<Tab>(() => (isTab(searchTab) ? searchTab : "dashboard"));
  const [settingsSection, setSettingsSection] = useState<SettingsSection>(() =>
    isSettingsSection(searchSection) ? searchSection : "profile",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [sampleContent, setSampleContent] = useState<SampleContentVisibility>({
    dashboard: true,
    objectives: true,
    evidence: true,
  });

  const { data: evidence = [] } = useEvidenceQuery(userId, { includeSamples: sampleContent.evidence });
  const { data: archivedEvidence = [] } = useEvidenceQuery(userId, { archived: true });
  const saveEvidenceMutation = useSaveEvidence(userId);
  const archiveEvidenceMutation = useArchiveEvidence(userId);
  const restoreEvidenceMutation = useRestoreEvidence(userId);
  const deleteEvidenceMutation = useDeleteEvidence(userId);
  const insertEvidenceMutation = useInsertEvidence(userId);
  const { data: inbox = [] } = useInboxQuery(userId);
  const approveInboxMutation = useApproveInbox(userId);
  const dismissInboxMutation = useDismissInbox(userId);
  const { data: objectives = [] } = useObjectivesQuery(userId, {
    includeSamples: sampleContent.objectives,
  });
  const { data: archivedObjectives = [] } = useObjectivesQuery(userId, { archived: true });
  const createObjectiveMutation = useCreateObjective(userId);
  const moveObjectiveMutation = useMoveObjective(userId);
  const saveObjectiveMutation = useSaveObjective(userId);
  const archiveObjectiveMutation = useArchiveObjective(userId);
  const restoreObjectiveMutation = useRestoreObjective(userId);
  const deleteObjectiveMutation = useDeleteObjective(userId);
  const { data: assessments = [] } = useAssessmentsQuery(userId);
  const finalizeAssessmentMutation = useFinalizeAssessment(userId);
  const deleteAssessmentMutation = useDeleteAssessment(userId);
  const updateTopicsMutation = useUpdateOneOnOneTopics(userId);
  const queryClient = useQueryClient();
  const { data: knowledgeRows = [] } = useQuery({
    queryKey: ["knowledge_items", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("knowledge_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as KnowledgeItemRow[];
    },
    enabled: Boolean(userId),
  });
  const addKnowledgeMutation = useMutation({
    mutationFn: async (payload: {
      user_id: string;
      title: string;
      description: string;
      reference_links: string[];
    }) => {
      const { error } = await (supabase as any).from("knowledge_items").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["knowledge_items", userId] });
    },
  });
  const [sampleAssessments, setSampleAssessments] = useState<Assessment[]>(() =>
    initialAssessments.slice(0, 3),
  );
  const [wizardDraft, setWizardDraft] = useState<AssessmentWizardDraft | null>(null);

  const historyAssessments = useMemo(() => {
    const merged = new Map<string, Assessment>();
    assessments.forEach((assessment) => {
      merged.set(assessment.id, assessment);
    });
    sampleAssessments.forEach((assessment) => {
      if (!merged.has(assessment.id)) merged.set(assessment.id, assessment);
    });
    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime(),
    );
  }, [assessments, sampleAssessments]);

  const radarData = useMemo(() => deriveRadarData(assessments[0]), [assessments]);

  const [showCapture, setShowCapture] = useState(false);
  const [showCreateObjective, setShowCreateObjective] = useState(false);
  const [openObjective, setOpenObjective] = useState<Objective | null>(null);
  const [openEvidence, setOpenEvidence] = useState<EvidenceRecord | null>(null);
  const [openInbox, setOpenInbox] = useState<InboxViewItem | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [review, setReview] = useState<ReviewSession | null>(null);
  const [pendingAssessmentDeleteId, setPendingAssessmentDeleteId] = useState<string | null>(null);
  const [showDiscardDraftConfirm, setShowDiscardDraftConfirm] = useState(false);
  const [dismissedSampleInboxIds, setDismissedSampleInboxIds] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("evitrace.sampleContentVisibility");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<SampleContentVisibility>;
      setSampleContent((prev) => ({
        dashboard: parsed.dashboard ?? prev.dashboard,
        objectives: parsed.objectives ?? prev.objectives,
        evidence: parsed.evidence ?? prev.evidence,
      }));
    } catch {
      // ignore malformed persisted values
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("evitrace.sampleContentVisibility", JSON.stringify(sampleContent));
  }, [sampleContent]);

  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    const key = getAssessmentWizardDraftStorageKey(userId);
    const legacyKey = getLegacyAssessmentWizardDraftStorageKey(userId);
    const raw =
      window.localStorage.getItem(key) ??
      window.localStorage.getItem(legacyKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AssessmentWizardDraft;
      if (parsed && parsed.scores && typeof parsed.activeIdx === "number" && parsed.savedAt) {
        setWizardDraft(parsed);
        window.localStorage.setItem(key, JSON.stringify(parsed));
        window.localStorage.removeItem(legacyKey);
      }
    } catch {
      // ignore malformed persisted values
    }
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    const key = getAssessmentWizardDraftStorageKey(userId);
    if (!wizardDraft) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(wizardDraft));
  }, [userId, wizardDraft]);

  function requestAssessmentDelete(assessmentId: string) {
    setPendingAssessmentDeleteId(assessmentId);
  }

  function executeAssessmentDelete(assessmentId: string) {
    const target = sampleAssessments.find((assessment) => assessment.id === assessmentId);
    if (target?.isSample) {
      setSampleAssessments((prev) => prev.filter((assessment) => assessment.id !== assessmentId));
      if (review?.id === assessmentId) setReview(null);
      flash("Sample assessment removed from history");
      return;
    }
    deleteAssessmentMutation.mutate(
      { assessmentId },
      {
        onSuccess: () => {
          if (review?.id === assessmentId) setReview(null);
          flash("Assessment deleted from history");
        },
      },
    );
  }

  const visibleEvidence = useMemo(
    () => (sampleContent.evidence ? evidence : evidence.filter((item) => !item.isSample)),
    [evidence, sampleContent.evidence],
  );
  const visibleArchivedEvidence = useMemo(
    () =>
      sampleContent.evidence
        ? archivedEvidence
        : archivedEvidence.filter((item) => !item.isSample),
    [archivedEvidence, sampleContent.evidence],
  );
  const visibleObjectives = useMemo(
    () => (sampleContent.objectives ? objectives : objectives.filter((item) => !item.isSample)),
    [objectives, sampleContent.objectives],
  );
  const visibleArchivedObjectives = useMemo(
    () =>
      sampleContent.objectives
        ? archivedObjectives
        : archivedObjectives.filter((item) => !item.isSample),
    [archivedObjectives, sampleContent.objectives],
  );
  const knowledgeItems = useMemo(
    () =>
      knowledgeRows
        .map(parseKnowledgeItemRow)
        .filter((item): item is KnowledgeHubItem => Boolean(item))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [knowledgeRows],
  );
  const globalSearchResults = useMemo(() => {
    const query = globalSearchQuery.trim().toLowerCase();
    if (!query) {
      return {
        objectives: [] as GlobalSearchResultItem[],
        evidence: [] as GlobalSearchResultItem[],
        knowledge: [] as GlobalSearchResultItem[],
      };
    }
    const matches = (title: string, description: string) =>
      `${title} ${description}`.toLowerCase().includes(query);
    const objectives = visibleObjectives
      .filter((item) =>
        matches(
          item.title,
          item.statement ?? item.notes ?? item.specific ?? item.measurable ?? "",
        ),
      )
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: item.statement ?? item.notes ?? "Objective match",
        section: "objectives" as const,
      }));
    const evidence = visibleEvidence
      .filter((item) => matches(item.title, item.description))
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        section: "evidence" as const,
      }));
    const knowledge = knowledgeItems
      .filter((item) => matches(item.challenge, item.lesson))
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        title: item.challenge,
        description: item.lesson,
        section: "knowledge" as const,
      }));
    return { objectives, evidence, knowledge };
  }, [globalSearchQuery, knowledgeItems, visibleEvidence, visibleObjectives]);

  const pageTitle: Record<Tab, string> = {
    dashboard: "Dashboard",
    radar: "Promotion Readiness",
    evidence: "Evidence Log",
    objectives: "Objectives",
    knowledge: "Knowledge Hub",
    feedback: "360 Feedback",
    report: "Reviews & Reports",
    settings: "Settings",
  };

  function flash(msg: string) {
    toast.success(msg);
  }

  function clearAssessmentWizardDraft() {
    setWizardDraft(null);
    if (typeof window === "undefined" || !userId) return;
    window.localStorage.removeItem(getAssessmentWizardDraftStorageKey(userId));
    window.localStorage.removeItem(getLegacyAssessmentWizardDraftStorageKey(userId));
  }

  useEffect(() => {
    if (!isTab(searchTab)) return;
    setTab((prev) => (prev === searchTab ? prev : searchTab));
  }, [searchTab]);

  useEffect(() => {
    if (!isSettingsSection(searchSection)) return;
    setSettingsSection((prev) => (prev === searchSection ? prev : searchSection));
  }, [searchSection]);

  function navigateWithState(nextTab: Tab, nextSection?: SettingsSection) {
    void navigate({
      search: (prev) => {
        const sectionFromSearch = prev.section;
        const resolvedSection = nextSection
          ?? (isSettingsSection(sectionFromSearch) ? sectionFromSearch : settingsSection);
        if (nextTab === "settings") {
          return {
            ...prev,
            tab: nextTab,
            section: resolvedSection,
          };
        }
        const { section: _section, ...rest } = prev;
        return {
          ...rest,
          tab: nextTab,
        };
      },
      replace: true,
    });
  }

  function handleTabChange(nextTab: Tab) {
    setTab(nextTab);
    setMobileSidebarOpen(false);
    navigateWithState(nextTab);
  }

  function handleSettingsSectionChange(nextSection: SettingsSection) {
    setSettingsSection(nextSection);
    if (tab !== "settings") {
      setTab("settings");
      navigateWithState("settings", nextSection);
      return;
    }
    navigateWithState("settings", nextSection);
  }
  function handleGlobalSearchSelect(result: GlobalSearchResultItem) {
    setGlobalSearchQuery("");
    handleTabChange(result.section);
  }

  function approveInbox(item: InboxViewItem, payload: InboxConfirmPayload) {
    const title = payload.title.trim() || item.title;
    const description = payload.description.trim();
    const category = payload.category;
    const competency = payload.subcategory;

    if (item.isSample) {
      setDismissedSampleInboxIds((ids) => (ids.includes(item.id) ? ids : [...ids, item.id]));
      insertEvidenceMutation.mutate(
        {
          id: "",
          date: new Date().toISOString().slice(0, 10),
          source: item.source,
          category,
          competency,
          title,
          description,
          link: "",
          status: "Pending Review",
          matchState: "Unset",
          managerNotes: "",
          isArchived: false,
          createdAt: new Date().toISOString(),
        },
        { onSuccess: () => flash("Sample event mapped and added to evidence log") },
      );
      return;
    }

    const liveItem = inbox.find((i) => i.id === item.id);
    if (!liveItem) return;
    const newEvidenceRow = {
      user_id: userId,
      date: new Date().toISOString().slice(0, 10),
      source: liveItem.source,
      category,
      competency,
      title,
      description,
      link: "",
      status: "Pending Review" as const,
      match_state: "Unset" as const,
      manager_notes: "",
      is_archived: false,
    };
    approveInboxMutation.mutate(
      { inboxItem: liveItem, newEvidenceRow },
      { onSuccess: () => flash("Evidence mapped and added to log") },
    );
  }

  function archiveObjectiveById(id: string) {
    archiveObjectiveMutation.mutate(id, {
      onSuccess: () => flash("Objective archived"),
    });
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, color: C.navy, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Sidebar
        tab={tab}
        setTab={handleTabChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div
        className={`${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"} flex flex-col min-h-screen min-w-0 transition-[margin] duration-200 print:ml-0`}
      >
        <TopHeader
          title={pageTitle[tab]}
          onCapture={() => setShowCapture(true)}
          onMenuClick={() => setMobileSidebarOpen(true)}
          globalSearchQuery={globalSearchQuery}
          onGlobalSearchQueryChange={setGlobalSearchQuery}
          globalSearchResults={globalSearchResults}
          onGlobalSearchSelect={handleGlobalSearchSelect}
        />

        <main className="flex-1 px-4 py-4 md:px-8 md:py-6 print-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {tab === "dashboard" && (
                <DashboardView
                  inbox={inbox}
                  showSampleData={sampleContent.dashboard}
                  dismissedSampleInboxIds={dismissedSampleInboxIds}
                  onOpenInbox={setOpenInbox}
                  onOpenObjective={setOpenObjective}
                  onOpenEvidence={setOpenEvidence}
                />
              )}
              {tab === "radar" && (
                <RadarView
                  data={radarData}
                  assessments={assessments}
                  wizardDraft={wizardDraft}
                  onCreateObjective={() => setShowCreateObjective(true)}
                  onStartReview={() => setShowWizard(true)}
                  onResumeDraft={() => setShowWizard(true)}
                  onDiscardDraft={() => setShowDiscardDraftConfirm(true)}
                  onOpenHistory={() => setShowHistory(true)}
                />
              )}
              {tab === "evidence" && (
                <EvidenceView
                  rows={[...visibleEvidence, ...visibleArchivedEvidence]}
                  onOpenRow={setOpenEvidence}
                  onPermanentDelete={(id) => {
                    deleteEvidenceMutation.mutate(id, {
                      onSuccess: () => flash("Evidence permanently deleted"),
                    });
                  }}
                  onRestore={(id) => {
                    restoreEvidenceMutation.mutate(id, {
                      onSuccess: () => flash("Evidence restored to log"),
                    });
                  }}
                />
              )}
              {tab === "objectives" && (
                <ObjectivesView
                  items={[...visibleObjectives, ...visibleArchivedObjectives]}
                  onOpen={setOpenObjective}
                  onCreate={() => setShowCreateObjective(true)}
                  onRestore={(o) => {
                    restoreObjectiveMutation.mutate(o.id, {
                      onSuccess: () => flash("Objective restored to Kanban board"),
                    });
                  }}
                  onDelete={(o) => {
                    deleteObjectiveMutation.mutate(o, {
                      onSuccess: () => flash("Objective permanently deleted"),
                    });
                  }}
                  onMove={(id, status) => {
                    const target = [...visibleObjectives, ...visibleArchivedObjectives].find(
                      (o) => o.id === id,
                    );
                    if (!target || target.status === status || target.status === "Completed")
                      return;
                    moveObjectiveMutation.mutate(
                      { id, status, objective: target },
                      {
                        onSuccess: () => {
                          if (status === "Completed")
                            flash("Objective completed and added to evidence");
                          else if (target.status === "Completed" && status === "In Progress")
                            flash("Objective reverted and removed from evidence log");
                          else flash(`Moved to ${status}`);
                        },
                      },
                    );
                  }}
                />
              )}
              {tab === "knowledge" && <KnowledgeHubView items={knowledgeItems} />}
              {tab === "report" && (
                <ReportView
                  evidence={visibleEvidence}
                  objectives={visibleObjectives}
                  radarData={radarData}
                  onFlash={flash}
                  review={review}
                  assessments={assessments}
                  historyAssessments={historyAssessments}
                  onOpenAssessment={(a) => setReview(assessmentToSession(a))}
                  onSaveTopics={(assessmentId, topics) => {
                    updateTopicsMutation.mutate(
                      { assessmentId, topics },
                      { onSuccess: () => flash("1-on-1 topics saved") },
                    );
                  }}
                  onDeleteHistoryAssessment={(assessmentId) => {
                    requestAssessmentDelete(assessmentId);
                  }}
                  onClearReview={() => setReview(null)}
                  onStartReview={() => setShowWizard(true)}
                  onOpenHistory={() => setShowHistory(true)}
                />
              )}
              {tab === "feedback" && <FeedbackView />}
              {tab === "settings" && (
                <SettingsView
                  sampleContent={sampleContent}
                  onSampleContentChange={setSampleContent}
                  section={settingsSection}
                  onSectionChange={handleSettingsSectionChange}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Capture modal */}
      <AnimatePresence>
        {showCapture && (
          <CaptureModal
            onClose={() => setShowCapture(false)}
            onSaveEvidence={({ title, description, sourceLink, category, subcategory }) => {
              insertEvidenceMutation.mutate(
                {
                  id: "",
                  date: new Date().toISOString().slice(0, 10),
                  source: "Manual",
                  category,
                  competency: category,
                  title: title.trim(),
                  description: `${description.trim()}\n\nSubcategory: ${subcategory}`,
                  link: sourceLink.trim(),
                  status: "Pending Review",
                  matchState: "Unset",
                  managerNotes: "",
                  isArchived: false,
                  createdAt: new Date().toISOString(),
                },
                {
                  onSuccess: () => {
                    setShowCapture(false);
                    flash("Evidence captured");
                  },
                },
              );
            }}
            onSaveKnowledge={({ challenge, lesson, referenceLinks, reset }) => {
              if (!userId) {
                toast.error("Please sign in before saving knowledge.");
                return;
              }
              addKnowledgeMutation.mutate(
                {
                  user_id: userId,
                  title: challenge.trim(),
                  description: lesson.trim(),
                  reference_links: referenceLinks,
                },
                {
                  onSuccess: () => {
                    reset();
                    toast.success("Knowledge entry saved.");
                  },
                },
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Create SMART objective modal */}
      <AnimatePresence>
        {showCreateObjective && (
          <CreateObjectiveModal
            onClose={() => setShowCreateObjective(false)}
            onSubmit={(o) => {
              createObjectiveMutation.mutate(
                { ...o, id: "", status: "Pending Approval" },
                {
                  onSuccess: () => {
                    setShowCreateObjective(false);
                    flash("Objective submitted for approval");
                  },
                },
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Objective details slide-over */}
      <AnimatePresence>
        {openObjective && (
          <ObjectiveSlideover
            objective={openObjective}
            onClose={() => setOpenObjective(null)}
            onSave={(o) => {
              saveObjectiveMutation.mutate(o, {
                onSuccess: () => {
                  setOpenObjective(o);
                  flash("Objective updated");
                },
              });
            }}
            onChangeStatus={(o, next) => {
              const updated = { ...o, status: next as Objective["status"] };
              moveObjectiveMutation.mutate(
                { id: o.id, status: next, objective: o },
                {
                  onSuccess: () => {
                    setOpenObjective(updated);
                    if (next === "Completed") flash("Objective completed and added to evidence");
                    else if (o.status === "Completed" && next === "In Progress")
                      flash("Objective reverted and removed from evidence log");
                    else if (next === "In Progress")
                      flash("Objective approved and moved to In Progress");
                  },
                },
              );
            }}
            onArchive={(o) => {
              archiveObjectiveById(o.id);
              setOpenObjective(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Evidence details slide-over */}
      <AnimatePresence>
        {openEvidence && (
          <EvidenceSlideover
            item={openEvidence}
            onClose={() => setOpenEvidence(null)}
            onSave={(updated) => {
              saveEvidenceMutation.mutate(updated, {
                onSuccess: () => {
                  setOpenEvidence(updated);
                  flash("Evidence updated");
                },
              });
            }}
            onArchive={(id) => {
              archiveEvidenceMutation.mutate(id, {
                onSuccess: () => {
                  setOpenEvidence(null);
                  flash("Evidence archived");
                },
              });
            }}
          />
        )}
      </AnimatePresence>

      {/* Auto-captured inbox slide-over */}
      <AnimatePresence>
        {openInbox && (
          <InboxReviewSlideover
            item={openInbox}
            onClose={() => setOpenInbox(null)}
            onConfirm={(comps) => {
              approveInbox(openInbox, comps);
              setOpenInbox(null);
            }}
            onDismiss={() => {
              if (openInbox.isSample) {
                setDismissedSampleInboxIds((ids) =>
                  ids.includes(openInbox.id) ? ids : [...ids, openInbox.id],
                );
                flash("Sample event closed");
              } else {
                dismissInboxMutation.mutate(openInbox.id, {
                  onSuccess: () => flash("Event dismissed"),
                });
              }
              setOpenInbox(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Performance Review wizard */}
      <AnimatePresence>
        {showWizard && (
          <ReviewWizard
            evidence={visibleEvidence}
            onOpenEvidence={setOpenEvidence}
            onClose={() => setShowWizard(false)}
            latestAssessment={assessments[0]}
            initialDraft={wizardDraft}
            engineerName={user?.fullName?.trim() || user?.email || "Engineer"}
            managerName={user?.manager?.trim() || "Manager"}
            onSaveDraft={(draft) => {
              setWizardDraft(draft);
              flash("Assessment draft saved");
            }}
            onFinalize={(session: ReviewSession) => {
              const finalizedByUserId = authUserId ?? userId;
              if (!finalizedByUserId) {
                toast.error("Unable to finalize assessment: no authenticated user session found.");
                return;
              }
              const newAssessment = sessionToAssessment(session);
              finalizeAssessmentMutation.mutate(
                { assessment: newAssessment, userId: finalizedByUserId },
                {
                  onSuccess: () => {
                    setReview(session);
                    clearAssessmentWizardDraft();
                    setShowWizard(false);
                    setTab("report");
                    flash("Assessment finalized · Report generated");
                  },
                },
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Assessment history modal */}
      <AnimatePresence>
        {showHistory && (
          <AssessmentHistoryModal
            assessments={historyAssessments}
            currentId={review?.id ?? null}
            onDelete={(assessmentId) => {
              requestAssessmentDelete(assessmentId);
            }}
            onClose={() => setShowHistory(false)}
            onOpen={(a) => {
              setReview(assessmentToSession(a));
              setShowHistory(false);
              setTab("report");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDiscardDraftConfirm && (
          <ConfirmDialog
            destructive
            title="Discard ongoing assessment draft?"
            description="This permanently removes your saved assessment progress and notes. You cannot undo this action."
            confirmLabel="Discard draft"
            onCancel={() => setShowDiscardDraftConfirm(false)}
            onConfirm={() => {
              clearAssessmentWizardDraft();
              setShowDiscardDraftConfirm(false);
              flash("Assessment draft discarded");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingAssessmentDeleteId && (
          <ConfirmDialog
            destructive
            title="Delete assessment report?"
            description="Are you sure you want to delete this assessment report? This action cannot be undone."
            confirmLabel="Delete report"
            onCancel={() => setPendingAssessmentDeleteId(null)}
            onConfirm={() => {
              executeAssessmentDelete(pendingAssessmentDeleteId);
              setPendingAssessmentDeleteId(null);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

/* ============================================================ */
/*                        SHELL                                 */
/* ============================================================ */

function Sidebar({
  tab,
  setTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { user, signout } = useAuth();
  const hasFullName = Boolean(user?.fullName?.trim());
  const displayName = getDisplayName(user?.fullName, user?.email);
  const displayEmail = user?.email ?? "";
  const initials =
    displayName
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";
  const displayRole = user
    ? `${user.currentLevel || "Engineer"}${user.team ? ` · ${user.team}` : ""}`
    : "Senior Engineer L3";
  function handleSignout() {
    void signout();
    onCloseMobile();
    toast.success("Signed out");
  }
  const mainNav: {
    id: Tab;
    label: string;
    sub: string;
    icon: React.ComponentType<{ size?: number }>;
  }[] = [
    { id: "dashboard", label: "Dashboard", sub: "Daily Actions", icon: LayoutDashboard },
    { id: "evidence", label: "Evidence Log", sub: "Data Table", icon: TableProperties },
    { id: "objectives", label: "Objectives", sub: "Skill Gap Planning", icon: Target },
    { id: "knowledge", label: "Knowledge Hub", sub: "Learned Insights", icon: BookOpen },
    {
      id: "feedback",
      label: "360 Feedback",
      sub: "Peer & Manager Reviews",
      icon: MessageCircleHeart,
    },
    { id: "radar", label: "Promotion Readiness", sub: "Assessment & Gaps", icon: TrendingUp },
    { id: "report", label: "Reviews & Reports", sub: "Archive & 1-on-1 Prep", icon: FileText },
  ];
  const settingsItem = {
    id: "settings" as Tab,
    label: "Settings",
    sub: "App & Profile",
    icon: SettingsIcon,
  };

  const NavButton = ({ n }: { n: (typeof mainNav)[number] }) => {
    const active = tab === n.id;
    const isSettings = n.id === "settings";
    const activeBackground = isSettings ? "#F4F5F7" : C.primarySoft;
    const activeColor = isSettings ? C.navy : C.primary;
    const Icon = n.icon;
    return (
      <button
        key={n.id}
        onClick={() => setTab(n.id)}
        title={collapsed ? n.label : undefined}
        className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} py-2.5 rounded text-left transition-colors`}
        style={{
          background: active ? activeBackground : "transparent",
          color: active ? activeColor : C.slate,
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = "#F4F5F7";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = "transparent";
        }}
      >
        <Icon size={18} />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{n.label}</div>
            <div className="text-[11px]" style={{ color: active ? activeColor : C.subtle }}>
              {n.sub}
            </div>
          </div>
        )}
      </button>
    );
  };

  const DesktopAside = (
    <aside
      className={`hidden lg:flex fixed inset-y-0 left-0 z-40 ${collapsed ? "w-16" : "w-64"} h-screen border-r flex-col print-hide print:hidden transition-[width] duration-200`}
      style={{ background: C.card, borderColor: C.border }}
    >
      <div
        className={`h-16 ${collapsed ? "px-1.5" : "px-5"} flex items-center gap-2 border-b`}
        style={{ borderColor: C.border }}
      >
        <div className={`flex items-center min-w-0 ${collapsed ? "justify-center flex-1" : "gap-2"}`}>
          <BrandMark size={32} />
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight" style={{ color: C.navy }}>
                Evitrace
              </div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: C.subtle }}>
                Performance Intelligence
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {mainNav.map((n) => (
          <NavButton key={n.id} n={n} />
        ))}
      </nav>

      <div className="px-3 pb-2">
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-2.5 px-3"} py-2 rounded border hover:bg-[#F4F5F7] transition-colors`}
          style={{ color: C.slate, borderColor: C.border }}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && (
            <span className="text-xs font-semibold">Collapse sidebar</span>
          )}
        </button>
      </div>

      <div className="p-3 border-t space-y-2" style={{ borderColor: C.border }}>
        <NavButton n={settingsItem} />
        {!collapsed && (
          <div className="px-1 pt-1 rounded-md border" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                style={{ background: "#5243AA" }}
              >
                {initials}
              </div>
              <div className="leading-tight flex-1 min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: C.navy }}>
                  {displayName}
                </div>
                <div className="text-[11px] truncate" style={{ color: C.subtle }}>
                  {displayRole}
                </div>
                {hasFullName && (
                  <div className="text-[11px] truncate" style={{ color: C.subtle }}>
                    {displayEmail}
                  </div>
                )}
              </div>
            </div>
            <div
              className="mt-2 pt-2 border-t flex items-center justify-end"
              style={{ borderColor: C.border }}
            >
              <button
                onClick={handleSignout}
                title="Sign out"
                className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-semibold hover:bg-[#F4F5F7]"
                style={{ color: C.slate }}
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          </div>
        )}
        {collapsed && (
          <button
            onClick={handleSignout}
            title="Sign out"
            className="w-full flex items-center justify-center py-2 rounded text-xs hover:bg-[#F4F5F7]"
            style={{ color: C.slate }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {DesktopAside}
      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 lg:hidden print-hide"
            style={{ background: "rgba(9, 30, 66, 0.45)" }}
            onClick={onCloseMobile}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-0 left-0 h-full w-72 max-w-[85vw] flex flex-col border-r"
              style={{ background: C.card, borderColor: C.border }}
            >
              <div
                className="h-16 px-5 flex items-center justify-between border-b"
                style={{ borderColor: C.border }}
              >
                <div className="flex items-center gap-2">
                  <BrandMark size={32} />
                  <div className="text-[15px] font-bold tracking-tight" style={{ color: C.navy }}>
                    Evitrace
                  </div>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded hover:bg-[#F4F5F7]"
                  style={{ color: C.slate }}
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {mainNav.map((n) => (
                  <NavButton key={n.id} n={n} />
                ))}
              </nav>
              <div className="p-3 border-t space-y-2" style={{ borderColor: C.border }}>
                <NavButton n={settingsItem} />
                <button
                  onClick={handleSignout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-left text-sm font-semibold hover:bg-[#F4F5F7]"
                  style={{ color: C.slate }}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TopHeader({
  title,
  onCapture,
  onMenuClick,
  globalSearchQuery,
  onGlobalSearchQueryChange,
  globalSearchResults,
  onGlobalSearchSelect,
}: {
  title: string;
  onCapture: () => void;
  onMenuClick: () => void;
  globalSearchQuery: string;
  onGlobalSearchQueryChange: (next: string) => void;
  globalSearchResults: {
    objectives: GlobalSearchResultItem[];
    evidence: GlobalSearchResultItem[];
    knowledge: GlobalSearchResultItem[];
  };
  onGlobalSearchSelect: (item: GlobalSearchResultItem) => void;
}) {
  const [notifs, setNotifs] = useState<
    {
      id: string;
      icon: React.ComponentType<{ size?: number }>;
      title: string;
      body: string;
      when: string;
      read: boolean;
    }[]
  >([
    {
      id: "N-1",
      icon: MessageSquare,
      title: "Manager added feedback to EV-198",
      body: "Alex Morgan suggested rewording your JWT remediation evidence.",
      when: "12m ago",
      read: false,
    },
    {
      id: "N-2",
      icon: Sparkles,
      title: "Auto-captured event ready for review",
      body: "A new Bitbucket PR was detected and waiting in your inbox.",
      when: "1h ago",
      read: false,
    },
    {
      id: "N-3",
      icon: UserCheck,
      title: "Objective approved",
      body: "UX-01 was moved to In Progress after manager approval.",
      when: "Yesterday",
      read: false,
    },
    {
      id: "N-4",
      icon: FileCheck2,
      title: "Q3 assessment archived",
      body: "Your Q3 readiness report was saved to Reviews & Reports.",
      when: "3d ago",
      read: true,
    },
  ]);
  const [open, setOpen] = useState(false);
  const unread = notifs.filter((n) => !n.read).length;
  const hasSearchQuery = globalSearchQuery.length > 0;
  const hasGlobalResults =
    globalSearchResults.objectives.length > 0 ||
    globalSearchResults.evidence.length > 0 ||
    globalSearchResults.knowledge.length > 0;
  const groupedSearchResults: Array<{
    key: GlobalSearchSection;
    label: string;
    items: GlobalSearchResultItem[];
  }> = [
    { key: "objectives", label: "Objectives", items: globalSearchResults.objectives },
    { key: "evidence", label: "Evidence", items: globalSearchResults.evidence },
    { key: "knowledge", label: "Knowledge", items: globalSearchResults.knowledge },
  ];
  function toggle() {
    setOpen((o) => {
      if (!o && unread > 0) setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
      return !o;
    });
  }
  return (
    <header
      className="h-16 sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-8 border-b print-hide print:hidden"
      style={{ background: C.card, borderColor: C.border }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded hover:bg-[#F4F5F7] shrink-0"
          style={{ color: C.slate }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1
          className="text-base md:text-xl font-bold tracking-tight truncate"
          style={{ color: C.navy }}
        >
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="hidden md:block w-72 relative">
          <Input
            value={globalSearchQuery}
            onChange={(e) => onGlobalSearchQueryChange(e.target.value)}
            placeholder="Search evidence, objectives, knowledge…"
            icon={<Search size={14} />}
          />
          {hasSearchQuery && (
            <div
              className="absolute left-0 right-0 top-full mt-2 z-40 rounded-lg border bg-white shadow-xl max-h-[420px] overflow-y-auto"
              style={{ borderColor: C.border }}
            >
              {groupedSearchResults.map((group) =>
                group.items.length > 0 ? (
                  <div key={group.key} className="px-3 py-2 border-b last:border-b-0" style={{ borderColor: C.border }}>
                    <div className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: C.subtle }}>
                      {group.label}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onGlobalSearchSelect(item)}
                          className="w-full rounded-md border px-2.5 py-2 text-left hover:bg-[#F8FAFF] transition-colors"
                          style={{ borderColor: C.border }}
                        >
                          <div className="text-sm font-semibold truncate" style={{ color: C.navy }}>
                            {item.title}
                          </div>
                          <div className="text-xs mt-0.5 line-clamp-2 break-words" style={{ color: C.slate }}>
                            {item.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
              {!hasGlobalResults && (
                <div className="px-4 py-6 text-center text-xs" style={{ color: C.subtle }}>
                  No matches found in objectives, evidence, or knowledge.
                </div>
              )}
            </div>
          )}
        </div>
        <div className="relative shrink-0">
          <button
            onClick={toggle}
            aria-label="Notifications"
            className="w-9 h-9 rounded flex items-center justify-center hover:bg-[#F4F5F7] relative"
            style={{ color: C.slate }}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center bg-red-500">
                {unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {open && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-11 z-40 w-[340px] max-w-[90vw] bg-white rounded-lg shadow-2xl border"
                  style={{ borderColor: C.border }}
                >
                  <div
                    className="px-4 py-3 border-b flex items-center justify-between"
                    style={{ borderColor: C.border }}
                  >
                    <div className="text-sm font-bold" style={{ color: C.navy }}>
                      Notifications
                    </div>
                    <button
                      onClick={() => setNotifs((ns) => ns.map((n) => ({ ...n, read: true })))}
                      className="text-[11px] font-semibold hover:underline"
                      style={{ color: C.primary }}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifs.length === 0 && (
                      <div className="px-4 py-8 text-center text-xs" style={{ color: C.subtle }}>
                        No notifications.
                      </div>
                    )}
                    {notifs.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div
                          key={n.id}
                          className="px-4 py-3 border-b flex gap-3 hover:bg-[#FAFBFC]"
                          style={{ borderColor: C.border }}
                        >
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                            style={{ background: C.primarySoft, color: C.primary }}
                          >
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-xs font-semibold truncate"
                              style={{ color: C.navy }}
                            >
                              {n.title}
                            </div>
                            <div
                              className="text-[11px] mt-0.5 leading-snug"
                              style={{ color: C.slate }}
                            >
                              {n.body}
                            </div>
                            <div className="text-[10px] mt-1" style={{ color: C.subtle }}>
                              {n.when}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <PrimaryBtn onClick={onCapture}>
          <Plus size={16} />
          <span className="hidden sm:inline">Capture Evidence</span>
          <span className="sm:hidden">Capture</span>
        </PrimaryBtn>
      </div>
    </header>
  );
}

/* ============================================================ */
/*                  TAB 1: DASHBOARD                            */
/* ============================================================ */

function DashboardView({
  inbox,
  showSampleData,
  dismissedSampleInboxIds,
  onOpenInbox,
  onOpenObjective,
  onOpenEvidence,
}: {
  inbox: InboxItem[];
  showSampleData: boolean;
  dismissedSampleInboxIds: string[];
  onOpenInbox: (item: InboxViewItem) => void;
  onOpenObjective: (o: Objective) => void;
  onOpenEvidence: (e: EvidenceRecord) => void;
}) {
  const { userId } = useAuth();
  const stats = useDashboardStats(userId!, { showSamples: showSampleData });
  const dashboardInbox = useMemo(() => {
    const live: InboxViewItem[] = inbox.map((item) => ({ ...item, isSample: false }));
    if (!showSampleData) return live;
    const samples = [
      {
        id: "SAMPLE-INBOX-RFC-01",
        source: "Confluence",
        icon: null,
        title: "Draft RFC needs competency mapping: checkout resiliency failover strategy",
        suggestion: ["System Design", "Communication"],
        when: "Sample",
        isSample: true,
      },
      {
        id: "SAMPLE-INBOX-QUERY-02",
        source: "GitHub",
        icon: null,
        title: "Merged optimization PR: removed N+1 query bottleneck on order timeline endpoint",
        suggestion: ["Code Quality", "Analytical Thinking"],
        when: "Sample",
        isSample: true,
      },
      {
        id: "SAMPLE-INBOX-INCIDENT-03",
        source: "PagerDuty",
        icon: null,
        title: "Incident note captured: led SEV-2 cache stampede response and postmortem actions",
        suggestion: ["Delivery", "Leadership"],
        when: "Sample",
        isSample: true,
      },
    ] satisfies InboxViewItem[];
    if (live.length >= 3) return live;
    const used = new Set(live.map((item) => item.id));
    const dismissed = new Set(dismissedSampleInboxIds);
    const filler = samples
      .filter((item) => !used.has(item.id) && !dismissed.has(item.id))
      .slice(0, 3 - live.length);
    return [...live, ...filler];
  }, [inbox, showSampleData, dismissedSampleInboxIds]);
  const active = stats.focusAreas;
  const recentEvidence = stats.recentEvidence;
  function relativeDate(dateStr: string) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return formatDisplayDate(dateStr);
  }
  return (
    <div className="space-y-6">
      {/* Widget A */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Evidence This Quarter"
          value={String(stats.evidenceThisQuarter)}
          helperText="Total evidence items captured within the current performance evaluation cycle."
          tone="info"
        />
        <StatCard
          icon={<Calendar size={18} />}
          label="Current Streak"
          value={stats.streak === 1 ? "1 week" : `${stats.streak} weeks`}
          helperText="Consecutive weeks with at least one active piece of evidence or knowledge log recorded."
          tone="success"
        />
        <PendingReviewCard
          total={stats.pendingReviewCount}
          evidenceCount={stats.pendingEvidenceCount}
          objectiveCount={stats.pendingObjectivesCount}
          peerReviewCount={stats.pendingPeerFeedbackCount}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Widget B - Inbox + Recent Evidence stacked */}
        <div className="col-span-2 space-y-6">
          <Card className="p-5">
            <SectionHeader
              title="Action Inbox"
              sub="Auto-captured events that need your mapping"
              right={
                <Badge tone="warning" icon={<AlertCircle size={12} />}>
                  {dashboardInbox.length} pending
                </Badge>
              }
            />
            <div className="mt-4 divide-y" style={{ borderColor: C.border }}>
              {dashboardInbox.length === 0 ? (
                <div
                  className="py-10 text-center text-sm flex flex-col items-center gap-2"
                  style={{ color: C.subtle }}
                >
                  <CheckCircle size={28} style={{ color: C.green }} />
                  Inbox zero. Nice work.
                </div>
              ) : (
                dashboardInbox.map((it) => (
                  <InboxRow
                    key={it.id}
                    item={it}
                    isSample={Boolean(it.isSample)}
                    onOpen={() => onOpenInbox(it)}
                  />
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Recent Evidence" sub="Latest logged and verified contributions" />
            <div className="mt-4 relative">
              <div
                className="absolute left-[11px] top-1 bottom-1 w-px"
                style={{ background: C.border }}
                aria-hidden
              />
              <ul className="space-y-3">
                {recentEvidence.map((ev) => (
                  <li key={ev.id} className="relative">
                    <button
                      onClick={() => onOpenEvidence(ev)}
                      className="w-full text-left flex items-start gap-3 pl-0 pr-2 py-2 rounded hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
                        style={{ background: "#fff", border: `1px solid ${C.border}` }}
                      >
                        <CheckCircle2 size={14} style={{ color: C.green }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: C.navy }}>
                          {ev.title}
                        </div>
                        {ev.isSample && (
                          <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
                            Sample evidence - replace this with your own records as you log activity.
                          </div>
                        )}
                        <div
                          className="mt-1 flex items-center gap-2 text-[11px]"
                          style={{ color: C.subtle }}
                        >
                          <span>{relativeDate(ev.date)}</span>
                          <span aria-hidden>·</span>
                          <Badge tone="info">{ev.category}</Badge>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* Widget C */}
        <Card className="p-5">
          <SectionHeader title="Current Focus Areas" sub="Active objectives in flight" />
          <div className="mt-4 space-y-2">
            {active.length === 0 && (
              <div className="text-sm" style={{ color: C.subtle }}>
                No active objectives yet.
              </div>
            )}
            {active.map((o) => (
              <button
                key={o.id}
                onClick={() => onOpenObjective(o)}
                className="w-full text-left flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-slate-50 hover:border-[#0052CC] transition-colors"
                style={{ borderColor: C.border }}
              >
                <ListTodo size={16} style={{ color: C.primary }} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: C.navy }}>
                    {o.title}
                  </div>
                  {o.isSample && (
                    <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
                      Sample objective - hide samples in Settings once your own goals are active.
                    </div>
                  )}
                  <div
                    className="text-[11px] mt-1 flex items-center gap-2"
                    style={{ color: C.subtle }}
                  >
                    <Calendar size={11} />
                    Due {o.due}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  helperText,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helperText?: string;
  tone: "info" | "success" | "warning";
}) {
  const toneMap = {
    info: { bg: C.primarySoft, fg: C.primary },
    success: { bg: C.greenSoft, fg: "#006644" },
    warning: { bg: C.amberSoft, fg: "#974F00" },
  } as const;
  const t = toneMap[tone];
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.subtle }}>
          {label}
        </div>
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ background: t.bg, color: t.fg }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight" style={{ color: C.navy }}>
        {value}
      </div>
      {helperText && (
        <div className="text-xs mt-1 leading-snug" style={{ color: C.subtle }}>
          {helperText}
        </div>
      )}
    </Card>
  );
}

function PendingReviewCard({
  total,
  evidenceCount,
  objectiveCount,
  peerReviewCount,
}: {
  total: number;
  evidenceCount: number;
  objectiveCount: number;
  peerReviewCount: number;
}) {
  const items = [
    { label: "Evidence Logs", count: evidenceCount, tone: "warning" as const, icon: <FileText size={12} /> },
    { label: "SMART Objectives", count: objectiveCount, tone: "info" as const, icon: <Target size={12} /> },
    {
      label: "Peer Feedback",
      count: peerReviewCount,
      tone: "neutral" as const,
      icon: <MessageCircleHeart size={12} />,
    },
  ];
  const visibleItems = items.filter((it) => it.count > 0);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.subtle }}>
          Items Pending Manager Review
        </div>
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ background: C.amberSoft, color: "#974F00" }}
        >
          <Clock size={18} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-3xl font-bold tracking-tight" style={{ color: C.navy }}>
          {total}
        </div>
      </div>
      <div className="text-xs mt-1 leading-snug" style={{ color: C.subtle }}>
        Tracked action items currently submitted and awaiting manager sign-off.
      </div>
      {visibleItems.length === 0 ? (
        <div className="mt-3 text-xs" style={{ color: C.subtle }}>
          All caught up! No items currently awaiting manager review.
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleItems.map((it) => (
          <Badge key={it.label} tone={it.tone} icon={it.icon}>
            {it.count} {it.label}
          </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}

function SectionHeader({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
      <div className="min-w-0">
        <div className="text-sm font-bold" style={{ color: C.navy }}>
          {title}
        </div>
        {sub && (
          <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
            {sub}
          </div>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

function InboxRow({
  item,
  onOpen,
  isSample,
}: {
  item: InboxItem;
  onOpen?: () => void;
  isSample?: boolean;
}) {
  return (
    <button
      onClick={onOpen}
      disabled={!onOpen}
      className="w-full text-left py-4 flex items-start gap-3 hover:bg-[#FAFBFC] disabled:hover:bg-transparent transition-colors rounded px-2 -mx-2 disabled:cursor-default"
    >
      <div
        className="w-9 h-9 rounded flex items-center justify-center shrink-0"
        style={{ background: "#F4F5F7", color: C.slate }}
      >
        <SourceIcon source={item.source} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[11px]" style={{ color: C.subtle }}>
          <span className="font-semibold uppercase tracking-wider">{item.source}</span>
          <span>•</span>
          <span>{item.when}</span>
        </div>
        <div className="text-sm font-semibold mt-0.5 truncate" style={{ color: C.navy }}>
          {item.title}
        </div>
        {isSample && (
          <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
            Sample item - this will disappear once real inbox events are available.
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <Sparkles size={12} style={{ color: C.primary }} />
          <span className="text-[11px] mr-1" style={{ color: C.subtle }}>
            AI suggested:
          </span>
          {item.suggestion.map((c) => (
            <span
              key={c}
              className="text-[11px] px-2 py-0.5 rounded-full border"
              style={{ borderColor: C.border, color: C.slate, background: "#F4F5F7" }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <div
        className="shrink-0 self-center flex items-center gap-1 text-xs font-medium"
        style={{ color: isSample ? C.subtle : C.primary }}
      >
        {isSample ? "Sample" : "Review"}
        {!isSample && <ChevronRight size={14} />}
      </div>
    </button>
  );
}

/* ============================================================ */
/*                  TAB 2: RADAR                                */
/* ============================================================ */

function RadarView({
  data,
  assessments,
  wizardDraft,
  onCreateObjective,
  onStartReview,
  onResumeDraft,
  onDiscardDraft,
  onOpenHistory,
}: {
  data: ReturnType<typeof deriveRadarData>;
  assessments: Assessment[];
  wizardDraft: AssessmentWizardDraft | null;
  onCreateObjective: () => void;
  onStartReview: () => void;
  onResumeDraft: () => void;
  onDiscardDraft: () => void;
  onOpenHistory: () => void;
}) {
  const current = useMemo(
    () => +(data.reduce((s, d) => s + d.current, 0) / data.length).toFixed(2),
    [data],
  );
  const readiness = Math.round((current / 4) * 100);
  const top = [...data].sort((a, b) => b.current - a.current)[0];
  const gap = [...data].sort((a, b) => b.target - b.current - (a.target - a.current))[0];

  const [chartMode, setChartMode] = useState<"radar" | "bar">("radar");

  // Latest + previous finalized assessments - used for "previous" series + per-question rows
  const latest = assessments[0];
  const prior = assessments[1];

  // Build a unified per-category dataset that combines the radar/data ordering
  // with previous-cycle averages drawn from prior assessment.
  const chartData = useMemo(() => {
    return data.map((r) => {
      const cat = radarLabelToCategory(r.competency);
      const priorCat = prior?.categories.find((c) => c.categoryName === cat);
      // assessments use 1-5 scale; radar uses 0-4. Map by (x/5)*4.
      const previous = priorCat
        ? +Math.min(4, (priorCat.categoryCurrentAvg / 5) * 4).toFixed(2)
        : +((DEFAULT_EFFECTIVENESS_WEIGHT / 5) * 4).toFixed(2);
      return {
        competency: r.competency,
        previous,
        current: r.current,
        target: r.target,
      };
    });
  }, [data, prior]);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {wizardDraft && (
          <motion.div
            key="ongoing-assessment-draft-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <Card className="p-5" style={{ background: "#F4F5F7" }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-2.5">
                  <Info size={16} className="mt-0.5 shrink-0" style={{ color: C.primary }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: C.navy }}>
                      In-Progress Assessment
                    </div>
                    <div className="text-sm mt-1" style={{ color: C.slate }}>
                      You have an ongoing self-assessment draft that was last modified on{" "}
                      {formatDisplayDate(wizardDraft.savedAt)}.
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PrimaryBtn onClick={onResumeDraft}>
                    <ClipboardList size={14} />
                    Resume Assessment
                  </PrimaryBtn>
                  <GhostBtn onClick={onDiscardDraft}>
                    <Trash2 size={14} />
                    Discard Draft
                  </GhostBtn>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtitle */}
      <div className="text-sm" style={{ color: C.subtle }}>
        Assessment of current scores vs Level 4 target across the competency framework.
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.subtle }}>
              Assessment Wizard
            </div>
            <div className="text-sm mt-1" style={{ color: C.navy }}>
              {wizardDraft
                ? `Ongoing assessment detected. Draft saved ${formatDisplayDate(wizardDraft.savedAt)}.`
                : "Start a new assessment or open history from here."}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GhostBtn onClick={onOpenHistory}>
              <History size={14} />
              Assessment History
            </GhostBtn>
            <PrimaryBtn onClick={onStartReview}>
              <ClipboardList size={14} />
              {wizardDraft ? "Resume Ongoing Assessment" : "Start Assessment Wizard"}
            </PrimaryBtn>
          </div>
        </div>
      </Card>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: C.subtle }}
          >
            Overall Readiness
          </div>
          <div className="text-3xl font-bold mt-2 tracking-tight" style={{ color: C.navy }}>
            {readiness}%
          </div>
          <div
            className="mt-3 h-1.5 rounded-full overflow-hidden"
            style={{ background: "#EBECF0" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${readiness}%`, background: C.green }}
            />
          </div>
          <div className="text-xs mt-2" style={{ color: C.subtle }}>
            Toward Level 4 threshold
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Top Strength
            </div>
            <Award size={18} style={{ color: C.green }} />
          </div>
          <div className="text-lg font-bold mt-2 tracking-tight" style={{ color: C.navy }}>
            {top.competency}
          </div>
          <div className="text-xs mt-1" style={{ color: C.subtle }}>
            {top.current.toFixed(2)} / 4
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Primary Gap
            </div>
            <AlertTriangle size={18} style={{ color: C.red }} />
          </div>
          <div className="text-lg font-bold mt-2 tracking-tight" style={{ color: C.navy }}>
            {gap.competency}
          </div>
          <div className="text-xs mt-1" style={{ color: C.subtle }}>
            Gap of {(gap.target - gap.current).toFixed(2)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Manager Status
            </div>
            <UserCheck size={18} style={{ color: C.primary }} />
          </div>
          <div className="text-lg font-bold mt-2 tracking-tight" style={{ color: C.navy }}>
            On Track
          </div>
          <div className="text-xs mt-1" style={{ color: C.subtle }}>
            Last sync: 4 days ago
          </div>
        </Card>
      </div>

      {/* Asymmetric grid: table grows on the left, chart sticks on the right (desktop). Chart first on mobile. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Chart card */}
        <Card className="p-6 h-fit col-span-1 order-1 lg:order-2 lg:col-span-1 lg:sticky lg:top-24">
          <SectionHeader
            title="Visual Gap Analysis"
            sub={
              chartMode === "radar"
                ? "Holistic shape: current score vs Level 4 target"
                : "Side-by-side comparison: previous, current, and target per category"
            }
            right={
              <div
                className="inline-flex items-center rounded border overflow-hidden"
                style={{ borderColor: C.border }}
              >
                <button
                  type="button"
                  onClick={() => setChartMode("radar")}
                  aria-pressed={chartMode === "radar"}
                  className="inline-flex items-center gap-1.5 px-2.5 h-8 text-xs font-semibold transition-colors"
                  style={{
                    background: chartMode === "radar" ? C.primarySoft : "#fff",
                    color: chartMode === "radar" ? C.primary : C.slate,
                  }}
                >
                  <RadarIcon size={13} />
                  Radar
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode("bar")}
                  aria-pressed={chartMode === "bar"}
                  className="inline-flex items-center gap-1.5 px-2.5 h-8 text-xs font-semibold transition-colors border-l"
                  style={{
                    borderColor: C.border,
                    background: chartMode === "bar" ? C.primarySoft : "#fff",
                    color: chartMode === "bar" ? C.primary : C.slate,
                  }}
                >
                  <BarChartHorizontal size={13} />
                  Bar
                </button>
              </div>
            }
          />
          <div className="flex items-center gap-4 text-xs mt-3" style={{ color: C.slate }}>
            {chartMode === "bar" && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.slate }} />
                Previous
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#0052CC" }} />
              Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#00B8D9" }} />
              Target L4
            </span>
          </div>
          <div className="h-[420px] mt-4">
            {chartMode === "radar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius="78%">
                  <PolarGrid stroke={C.border} />
                  <PolarAngleAxis
                    dataKey="competency"
                    tick={{ fill: C.navy, fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 4]}
                    tick={{ fill: C.subtle, fontSize: 10 }}
                  />
                  <Radar
                    name="Target L4"
                    dataKey="target"
                    stroke="#00B8D9"
                    fill="#00B8D9"
                    fillOpacity={0.08}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#0052CC"
                    fill="#0052CC"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <RTooltip
                    contentStyle={{
                      background: "#fff",
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                    formatter={(v) => `${Number(v).toFixed(2)} / 4`}
                  />
                  <Legend wrapperStyle={{ display: "none" }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 8, right: 24, bottom: 8, left: 16 }}
                  barCategoryGap="22%"
                >
                  <CartesianGrid horizontal={false} stroke={C.border} />
                  <XAxis
                    type="number"
                    domain={[0, 4]}
                    tick={{ fill: C.subtle, fontSize: 10 }}
                    stroke={C.border}
                  />
                  <YAxis
                    type="category"
                    dataKey="competency"
                    width={110}
                    tick={{ fill: C.navy, fontSize: 11, fontWeight: 600 }}
                    stroke={C.border}
                  />
                  <RTooltip
                    contentStyle={{
                      background: "#fff",
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                    formatter={(v) => `${Number(v).toFixed(2)} / 4`}
                  />
                  <Legend wrapperStyle={{ display: "none" }} />
                  <Bar dataKey="previous" name="Previous" fill={C.slate} radius={[0, 2, 2, 0]} />
                  <Bar dataKey="current" name="Current" fill="#0052CC" radius={[0, 2, 2, 0]} />
                  <Bar dataKey="target" name="Target L4" fill="#00B8D9" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Hierarchical Gap Analysis - left/bottom */}
        <Card className="p-0 overflow-hidden col-span-1 lg:col-span-2 order-2 lg:order-1">
          <div className="p-5 border-b" style={{ borderColor: C.border }}>
            <SectionHeader
              title="Hierarchical Gap Analysis"
              sub="Expand a category to see specific competency questions and their 1-5 effectiveness rating"
            />
          </div>
          <HierarchicalMatrix data={data} latest={latest} onCreateObjective={onCreateObjective} />
        </Card>
      </div>
    </div>
  );
}

function HierarchicalMatrix({
  data,
  latest,
  onCreateObjective,
}: {
  data: ReturnType<typeof deriveRadarData>;
  latest: Assessment | undefined;
  onCreateObjective: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const mapToCanonical = (label: string): string => radarLabelToCategory(label);

  /** Atlassian lozenge utility for numeric score deltas. */
  const changeLozenge = (delta: number) =>
    delta > 0
      ? "bg-green-100 text-green-800"
      : delta < 0
        ? "bg-red-100 text-red-800"
        : "bg-slate-100 text-slate-800";

  /** Lozenge for raw gap value (current minus target). */
  const gapLozenge = (gap: number) =>
    gap >= 0
      ? "bg-green-100 text-green-800"
      : gap <= -1
        ? "bg-red-100 text-red-800"
        : gap <= -0.5
          ? "bg-amber-100 text-amber-800"
          : "bg-slate-100 text-slate-800";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead style={{ background: "#F4F5F7", color: C.subtle }}>
          <tr className="text-left text-[11px] uppercase tracking-wider">
            <Th>Competency / Question</Th>
            <Th>Previous</Th>
            <Th>Current</Th>
            <Th>Delta</Th>
            <Th>Target</Th>
            <Th>Gap</Th>
            <Th>Notes</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const canonical = mapToCanonical(row.competency);
            const subs = SUBCATEGORIES[canonical] ?? [];
            const latestCat = latest?.categories.find((c) => c.categoryName === canonical);
            const isOpen = !!open[row.competency];
            const subScores = subs.map((sub) => getHistoricalQuestionScores(latest, canonical, sub));
            const prevAvg =
              subScores.length === 0
                ? DEFAULT_EFFECTIVENESS_WEIGHT
                : +(
                    subScores.reduce((sum, score) => sum + score.previous, 0) / subScores.length
                  ).toFixed(2);
            const curAvg =
              subScores.length === 0
                ? DEFAULT_EFFECTIVENESS_WEIGHT
                : +(subScores.reduce((sum, score) => sum + score.current, 0) / subScores.length).toFixed(
                    2,
                  );
            const targetAvg =
              subScores.length === 0
                ? 4
                : +(subScores.reduce((sum, score) => sum + score.target, 0) / subScores.length).toFixed(2);
            const gapAvg = +(curAvg - targetAvg).toFixed(2);
            const delta = calculateScoreDelta(prevAvg, curAvg);
            return (
              <React.Fragment key={row.competency}>
                <tr
                  className="border-t hover:bg-[#FAFBFC] transition-colors cursor-pointer"
                  style={{ borderColor: C.border }}
                  onClick={() => setOpen((s) => ({ ...s, [row.competency]: !s[row.competency] }))}
                >
                  <Td className="font-semibold" style={{ color: C.navy }}>
                    <span className="inline-flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: isOpen ? 0 : -90 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronDown size={14} style={{ color: C.subtle }} />
                      </motion.span>
                      {canonical}
                      <span
                        className="text-[10px] font-normal px-1.5 py-0.5 rounded"
                        style={{ background: "#F4F5F7", color: C.subtle }}
                      >
                        {subs.length} questions
                      </span>
                    </span>
                  </Td>
                  <Td style={{ color: C.slate }}>{prevAvg.toFixed(2)}</Td>
                  <Td style={{ color: C.navy, fontWeight: 600 }}>{curAvg.toFixed(2)}</Td>
                  <Td>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(delta)}`}
                    >
                      {delta > 0 ? `+${delta}` : `${delta}`}
                    </span>
                  </Td>
                  <Td style={{ color: C.slate }}>{targetAvg.toFixed(2)}</Td>
                  <Td>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${gapLozenge(gapAvg)}`}
                    >
                      {gapAvg > 0 ? `+${gapAvg}` : gapAvg}
                    </span>
                  </Td>
                  <Td style={{ color: C.subtle }}>
                    <span className="text-[11px]">
                      {latestCat ? "Rollup" : "Defaulted to 1 (pending assessment)"}
                    </span>
                  </Td>
                  <Td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateObjective();
                      }}
                      className="text-xs font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded border hover:border-[#0052CC] transition-colors"
                      style={{ borderColor: C.border, color: C.primary }}
                    >
                      <Plus size={12} />
                      Create Objective
                    </button>
                  </Td>
                </tr>
                {isOpen &&
                  subs.map((sub) => {
                    const historical = getHistoricalQuestionScores(latest, canonical, sub);
                    const prev = historical.previous;
                    const cur = historical.current;
                    const tgt = historical.target;
                    const note = historical.note;
                    const scale = EFFECTIVENESS_SCALE[Math.max(0, Math.min(4, cur - 1))];
                    const subGap = +(cur - tgt).toFixed(2);
                    const subDelta = calculateScoreDelta(prev, cur);
                    return (
                      <tr
                        key={canonical + sub}
                        className="border-t bg-[#FAFBFC] hover:bg-[#F4F5F7] transition-colors"
                        style={{ borderColor: C.border }}
                      >
                        <Td className="pl-12" style={{ color: C.slate }}>
                          <div className="text-[13px] leading-snug" style={{ color: C.navy }}>
                            {sub}
                          </div>
                          <div className="text-[11px] mt-0.5" style={{ color: C.subtle }}>
                            Score: {cur} - {scale.label}
                          </div>
                        </Td>
                        <Td style={{ color: C.slate }}>{prev}</Td>
                        <Td style={{ color: C.navy, fontWeight: 600 }}>{cur}</Td>
                        <Td>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(subDelta)}`}
                          >
                            {subDelta > 0 ? `+${subDelta}` : `${subDelta}`}
                          </span>
                        </Td>
                        <Td style={{ color: C.slate }}>{tgt}</Td>
                        <Td>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${gapLozenge(subGap)}`}
                          >
                            {subGap > 0 ? `+${subGap}` : subGap}
                          </span>
                        </Td>
                        <Td>
                          {note ? (
                            <span
                              title={note}
                              className="inline-flex items-center gap-1 text-[11px] cursor-help"
                              style={{ color: C.primary }}
                            >
                              <MessageSquare size={12} />
                              Note
                            </span>
                          ) : (
                            <span className="text-[11px]" style={{ color: C.subtle }}>
                              -
                            </span>
                          )}
                        </Td>
                        <Td>
                          <button
                            onClick={onCreateObjective}
                            className="text-[11px] font-semibold inline-flex items-center gap-1 px-2 py-1 rounded border hover:border-[#0052CC] transition-colors"
                            style={{ borderColor: C.border, color: C.primary }}
                          >
                            <Plus size={11} />
                            Create Objective
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  tone?: "success";
}) {
  return (
    <Card
      className="p-5"
      style={highlight ? { borderColor: C.primary, borderWidth: 1 } : undefined}
    >
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.subtle }}>
        {label}
      </div>
      <div
        className="text-3xl font-bold mt-2 tracking-tight"
        style={{ color: tone === "success" ? "#006644" : C.navy }}
      >
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: C.subtle }}>
        {sub}
      </div>
    </Card>
  );
}

/* ============================================================ */
/*                  TAB 3: EVIDENCE LOG                         */
/* ============================================================ */

type EvidenceItem = EvidenceRecord;

function EvidenceView({
  rows,
  onOpenRow,
  onPermanentDelete,
  onRestore,
}: {
  rows: EvidenceRecord[];
  onOpenRow: (r: EvidenceItem) => void;
  onPermanentDelete: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [comp, setComp] = useState("All");
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<EvidenceItem | null>(null);

  const visible = rows.filter((r) => (showArchived ? r.isArchived : !r.isArchived));
  const filtered = visible.filter(
    (r) =>
      (q === "" || r.title.toLowerCase().includes(q.toLowerCase())) &&
      (comp === "All" || r.competency === comp) &&
      (status === "All" || r.status === status) &&
      (source === "All" || r.source === source),
  );

  return (
    <>
      <div className="flex items-center justify-end mb-3">
        <div
          className="inline-flex rounded border overflow-hidden"
          style={{ borderColor: C.border }}
        >
          <button
            onClick={() => setShowArchived(false)}
            className="px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5"
            style={{
              background: !showArchived ? C.primarySoft : "#fff",
              color: !showArchived ? C.primary : C.slate,
            }}
          >
            <TableProperties size={12} /> Active Log
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className="px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 border-l"
            style={{
              background: showArchived ? C.primarySoft : "#fff",
              color: showArchived ? C.primary : C.slate,
              borderColor: C.border,
            }}
          >
            <Archive size={12} /> View Archived ({rows.filter((r) => r.isArchived).length})
          </button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div
          className="p-4 border-b flex items-center gap-2 flex-wrap"
          style={{ borderColor: C.border }}
        >
          <div className="w-72">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by title or keyword…"
              icon={<Search size={14} />}
            />
          </div>
          <div className="w-40">
            <Select icon={<Calendar size={14} />} defaultValue="all">
              <option value="all">All dates</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This quarter</option>
            </Select>
          </div>
          <div className="w-48">
            <Select
              icon={<Filter size={14} />}
              value={comp}
              onChange={(e) => setComp(e.target.value)}
            >
              <option>All</option>
              {COMPETENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div className="w-44">
            <Select
              icon={<Filter size={14} />}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>All</option>
              <option>Pending Review</option>
              <option>Reviewed</option>
            </Select>
          </div>
          <div className="w-40">
            <Select
              icon={<Filter size={14} />}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option>All</option>
              <option>Bitbucket</option>
              <option>Jira</option>
              <option>GitHub</option>
              <option>GitLab</option>
              <option>Slack</option>
              <option>Teams</option>
              <option>Confluence</option>
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-xs" style={{ color: C.subtle }}>
              {filtered.length} of {visible.length} items
            </div>
            <GhostBtn
              onClick={() => {
                const header = [
                  "ID",
                  "Date",
                  "Source",
                  "Category",
                  "Competency",
                  "Title",
                  "Description",
                  "Link",
                  "Status",
                  "Match",
                  "Manager Notes",
                  "Archived",
                ];
                const escape = (v: unknown) => {
                  const s = v == null ? "" : String(v);
                  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                };
                const csv = [
                  header.join(","),
                  ...filtered.map((r) =>
                    [
                      r.id,
                      r.date,
                      r.source,
                      r.category,
                      r.competency,
                      r.title,
                      r.description,
                      r.link,
                      r.status,
                      r.matchState,
                      r.managerNotes,
                      r.isArchived ? "Yes" : "No",
                    ]
                      .map(escape)
                      .join(","),
                  ),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `evidence-log-${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={14} />
              Export Data
            </GhostBtn>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <table
            className={`w-full text-sm table-auto ${showArchived ? "min-w-[1600px]" : "min-w-[1380px]"}`}
          >
            <colgroup>
              <col className="w-[120px]" />
              <col className="w-[110px]" />
              <col className="w-[130px]" />
              <col className="w-[220px]" />
              <col className="w-[220px]" />
              <col className="w-[220px]" />
              <col className="w-[90px]" />
              <col className="w-[130px]" />
              <col className="w-[150px]" />
              {showArchived && <col className="w-[100px]" />}
              {showArchived && <col className="w-[120px]" />}
            </colgroup>
            <thead style={{ background: "#F4F5F7", color: C.subtle }}>
              <tr className="text-left text-[11px] uppercase tracking-wider">
                <Th>Date</Th>
                <Th>Source</Th>
                <Th>Category</Th>
                <Th>Competency</Th>
                <Th>Title</Th>
                <Th>Description</Th>
                <Th>Link</Th>
                <Th>Match</Th>
                <Th>Status</Th>
                {showArchived && <Th>Archived</Th>}
                {showArchived && <Th>Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => !showArchived && onOpenRow(r)}
                  className={`border-t hover:bg-[#FAFBFC] transition-colors ${showArchived ? "" : "cursor-pointer"}`}
                  style={{ borderColor: C.border }}
                >
                  <Td>
                    <EvidenceDateCell date={r.date} />
                  </Td>
                  <Td>
                    <SourceChip source={r.source} />
                  </Td>
                  <Td>
                    <Badge tone="neutral">{r.category}</Badge>
                  </Td>
                  <Td>
                    <span className="inline-block max-w-[220px] truncate text-sm" style={{ color: C.slate }}>
                      {r.competency}
                    </span>
                  </Td>
                  <Td className="font-semibold" style={{ color: C.navy }}>
                    <span className="inline-block max-w-[220px] truncate">{r.title}</span>
                  </Td>
                  <Td style={{ color: C.slate }}>
                    <span className="inline-block max-w-[220px] truncate">{r.description}</span>
                  </Td>
                  <Td>
                    {r.link ? (
                      extractFirstLink(r.link) ? (
                        <a
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 hover:underline"
                          style={{ color: C.primary }}
                          href={extractFirstLink(r.link) ?? ""}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={12} />
                          Open
                        </a>
                      ) : (
                        <span className="inline-block max-w-[220px] truncate" style={{ color: C.slate }}>
                          {r.link}
                        </span>
                      )
                    ) : (
                      <span style={{ color: C.subtle }}>-</span>
                    )}
                  </Td>
                  <Td>
                    <MatchBadge match={r.matchState} />
                  </Td>
                  <Td>
                    {r.status === "Reviewed" ? (
                      <Badge tone="success" icon={<CheckCircle size={11} />}>
                        Reviewed
                      </Badge>
                    ) : (
                      <Badge tone="warning" icon={<Clock size={11} />}>
                        Pending Review
                      </Badge>
                    )}
                  </Td>
                  {showArchived && (
                    <Td style={{ color: C.slate }}>
                      {r.archivedDate ? formatDisplayDate(r.archivedDate) : "-"}
                    </Td>
                  )}
                  {showArchived && (
                    <Td>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onRestore(r.id)}
                          className="px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 hover:bg-[#F4F5F7]"
                          style={{ color: C.primary }}
                          title="Restore"
                        >
                          <ArchiveRestore size={12} /> Restore
                        </button>
                        <button
                          onClick={() => setConfirmDelete(r)}
                          className="px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 hover:bg-[#FFEBE6]"
                          style={{ color: C.red }}
                          title="Permanently Delete"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </Td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={showArchived ? 11 : 9}
                    className="text-center py-12 text-sm"
                    style={{ color: C.subtle }}
                  >
                    {showArchived ? "No archived evidence." : "No evidence matches your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            destructive
            title="Permanently delete evidence?"
            description={`"${confirmDelete.title}" will be permanently removed. This action cannot be undone.`}
            confirmLabel="Delete permanently"
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => {
              onPermanentDelete(confirmDelete.id);
              setConfirmDelete(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function MatchBadge({ match }: { match: EvidenceMatch }) {
  if (match === "Yes")
    return (
      <Badge tone="success" icon={<CheckCircle2 size={11} />}>
        Match: Yes
      </Badge>
    );
  if (match === "No")
    return (
      <Badge tone="danger" icon={<X size={11} />}>
        Match: No
      </Badge>
    );
  if (match === "Somewhat")
    return (
      <Badge tone="warning" icon={<AlertCircle size={11} />}>
        Somewhat
      </Badge>
    );
  return <Badge tone="neutral">Not Set</Badge>;
}

function EvidenceDateCell({ date }: { date: string }) {
  const parts = formatEvidenceDateParts(date);
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span className="text-[12px] font-semibold" style={{ color: C.navy }}>
        {parts.dayMonth}
      </span>
      {parts.year && (
        <span className="text-[11px]" style={{ color: C.subtle }}>
          {parts.year}
        </span>
      )}
    </span>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>;
}
function Td({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <td className={`px-4 py-3 align-middle ${className}`} style={style}>
      {children}
    </td>
  );
}

/* ============================================================ */
/*                  TAB 4: OBJECTIVES                           */
/* ============================================================ */

function ObjectivesView({
  items,
  onOpen,
  onCreate,
  onMove,
  onRestore,
  onDelete,
}: {
  items: Objective[];
  onOpen: (o: Objective) => void;
  onCreate: () => void;
  onMove: (id: string, status: Objective["status"]) => void;
  onRestore: (o: Objective) => void;
  onDelete: (o: Objective) => void;
}) {
  const cols: { id: Objective["status"]; label: string; tone: "warning" | "info" | "success" }[] = [
    { id: "Pending Approval", label: "To Do / Not Started", tone: "warning" },
    { id: "In Progress", label: "In Progress", tone: "info" },
    { id: "Completed", label: "Completed", tone: "success" },
  ];
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Objective["status"] | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Objective | null>(null);

  const active = items.filter((i) => !i.isArchived);
  const archived = items.filter((i) => i.isArchived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PrimaryBtn onClick={onCreate} className="whitespace-nowrap">
            <Plus size={16} />
            <span className="hidden sm:inline">Create Objective</span>
            <span className="sm:hidden">Create</span>
          </PrimaryBtn>
          <div className="text-sm hidden md:block" style={{ color: C.subtle }}>
            {showArchived
              ? "Read-only archive of past objectives."
              : "Drag cards between columns to update status, or open one to edit."}
          </div>
        </div>
        <GhostBtn onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? <Eye size={14} /> : <Archive size={14} />}
          {showArchived ? `Back to Board` : `View Archived (${archived.length})`}
        </GhostBtn>
      </div>

      {showArchived ? (
        <ArchivedObjectivesTable
          items={archived}
          onRestore={onRestore}
          onDelete={(o) => setConfirmDelete(o)}
        />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {cols.map((col) => {
            const list = active.filter((i) => i.status === col.id);
            const isOver = overCol === col.id;
            return (
              <div
                key={col.id}
                className="space-y-3 rounded-lg p-2 -m-2 transition-colors"
                style={{ background: isOver ? C.primarySoft : "transparent" }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(col.id);
                }}
                onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
                onDrop={(e) => {
                  e.preventDefault();
                  setOverCol(null);
                  if (dragId) {
                    onMove(dragId, col.id);
                    setDragId(null);
                  }
                }}
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Badge tone={col.tone}>{col.label}</Badge>
                    <span className="text-xs font-semibold" style={{ color: C.subtle }}>
                      {list.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {list.map((o) => (
                    <ObjectiveCard
                      key={o.id}
                      o={o}
                      onOpen={() => onOpen(o)}
                      onDragStart={() => setDragId(o.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      dragging={dragId === o.id}
                    />
                  ))}
                  {list.length === 0 && (
                    <div
                      className="border border-dashed rounded p-6 text-center text-xs"
                      style={{ borderColor: C.border, color: C.subtle }}
                    >
                      {isOver ? "Drop to move here" : "Nothing here yet."}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            title="Permanently delete this objective?"
            description="This action cannot be undone. All criteria, evidence links, and history for this objective will be removed."
            confirmLabel="Yes, delete permanently"
            destructive
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => {
              onDelete(confirmDelete);
              setConfirmDelete(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ObjectiveCard({
  o,
  onOpen,
  onDragStart,
  onDragEnd,
  dragging,
}: {
  o: Objective;
  onOpen: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  dragging?: boolean;
}) {
  const statusIcon =
    o.status === "Completed" ? (
      <CheckCircle size={13} style={{ color: C.green }} />
    ) : (
      <Clock size={13} style={{ color: C.amber }} />
    );
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="w-full text-left"
      draggable={o.status !== "Completed"}
      onDragStart={(e) => {
        (e as unknown as React.DragEvent).dataTransfer?.setData("text/plain", o.id);
        onDragStart?.();
      }}
      onDragEnd={onDragEnd}
      style={{ opacity: dragging ? 0.4 : 1 }}
    >
      <Card
        className="p-4 hover:border-[#0052CC] transition-colors cursor-pointer"
        onClick={onOpen}
      >
        <div className="flex items-center justify-between">
          <div
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: C.subtle }}
          >
            {formatObjectiveCode(o)}
          </div>
          {o.status !== "Completed" && <GripVertical size={14} style={{ color: C.subtle }} />}
          {o.status === "Completed" && <Lock size={12} style={{ color: C.subtle }} />}
        </div>
        <div className="text-sm font-semibold mt-1 leading-snug" style={{ color: C.navy }}>
          {o.title}
        </div>
        <div className="mt-3">
          <Badge tone="info">{o.competency}</Badge>
        </div>
        <div
          className="mt-3 pt-3 border-t flex items-center justify-between text-[11px]"
          style={{ borderColor: C.border, color: C.slate }}
        >
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {o.due}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            {statusIcon}
            {o.status}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

/* ============================================================ */
/*           HELPERS: DATES & COUNTDOWN BADGE                   */
/* ============================================================ */

function parseDateLoose(s?: string): Date | null {
  if (!s) return null;
  const cleaned = s.replace(/^Complete by\s+/i, "");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

function weeksBetween(from: Date, to: Date) {
  const ms = to.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24 * 7));
}

function CountdownBadge({ due }: { due?: string }) {
  const d = parseDateLoose(due);
  if (!d) return null;
  const weeks = weeksBetween(new Date(), d);
  if (weeks < 0)
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">
        Overdue by {Math.abs(weeks)} wk
      </span>
    );
  if (weeks === 0)
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
        Due this week
      </span>
    );
  if (weeks <= 1)
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
        Last week remaining
      </span>
    );
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
      {weeks} weeks remaining
    </span>
  );
}

/* ============================================================ */
/*           OVERLAY: CONFIRM DIALOG                            */
/* ============================================================ */

function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Backdrop onClose={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            {destructive ? (
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-red-100">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-amber-100">
                <AlertCircle size={18} className="text-amber-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="text-base font-bold" style={{ color: C.navy }}>
                {title}
              </div>
              <div className="text-sm mt-1.5 leading-relaxed" style={{ color: C.slate }}>
                {description}
              </div>
            </div>
          </div>
        </div>
        <div
          className="px-5 py-3 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <GhostBtn onClick={onCancel}>{cancelLabel}</GhostBtn>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors"
            style={{ background: destructive ? C.red : C.primary }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </Backdrop>
  );
}

/* ============================================================ */
/*           ARCHIVED OBJECTIVES TABLE                          */
/* ============================================================ */

function ArchivedObjectivesTable({
  items,
  onRestore,
  onDelete,
}: {
  items: Objective[];
  onRestore: (o: Objective) => void;
  onDelete: (o: Objective) => void;
}) {
  if (items.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: C.bg }}
          >
            <Archive size={20} style={{ color: C.subtle }} />
          </div>
          <div className="text-base font-bold" style={{ color: C.navy }}>
            No archived objectives
          </div>
          <div className="text-sm mt-1" style={{ color: C.subtle }}>
            Objectives you archive will appear here.
          </div>
        </div>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr
              className="text-left text-[11px] font-semibold uppercase tracking-wider border-b"
              style={{ background: C.bg, borderColor: C.border, color: C.subtle }}
            >
              <Th>Objective</Th>
              <Th>Category</Th>
              <Th>Authored</Th>
              <Th>Archived</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr
                key={o.id}
                className="border-b last:border-0 hover:bg-[#FAFBFC]"
                style={{ borderColor: C.border }}
              >
                <Td>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: C.subtle }}
                  >
                    {formatObjectiveCode(o)}
                  </div>
                  <div className="line-clamp-2 font-medium" style={{ color: C.navy }}>
                    {o.title}
                  </div>
                </Td>
                <Td>
                  <Badge tone="info">{o.competency}</Badge>
                </Td>
                <Td className="whitespace-nowrap" style={{ color: C.slate }}>
                  {o.dateAuthored ?? "-"}
                </Td>
                <Td className="whitespace-nowrap" style={{ color: C.slate }}>
                  {o.archivedDate ? formatDisplayDate(o.archivedDate) : "-"}
                </Td>
                <Td className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => onRestore(o)}
                      title="Restore to active board"
                      className="p-1.5 rounded hover:bg-[#DEEBFF]"
                      style={{ color: C.primary }}
                    >
                      <ArchiveRestore size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(o)}
                      title="Permanently delete"
                      className="p-1.5 rounded hover:bg-[#FFEBE6]"
                      style={{ color: C.red }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function KnowledgeHubView({ items }: { items: KnowledgeHubItem[] }) {
  return (
    <Card className="p-5">
      <SectionHeader
        title="Knowledge Hub"
        sub="Capture and revisit technical insights, architecture notes, and personal engineering learnings."
      />
      {items.length === 0 ? (
        <div
          className="mt-4 rounded-lg border border-dashed px-4 py-6 text-sm"
          style={{ borderColor: C.border, color: C.subtle }}
        >
          No knowledge entries yet. Use <span className="font-semibold">Log Knowledge</span> from
          Manual Capture or the Extension popup to populate this hub.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
          {items.map((item) => {
            const fallbackUrl = firstUrlInText(`${item.challenge} ${item.lesson}`);
            const allReferenceLinks = normalizeReferenceLinks([
              ...(item.referenceLinks ?? []),
              ...(fallbackUrl ? [fallbackUrl] : []),
            ]);
            const youtubeIds = allReferenceLinks
              .map((link) => extractYouTubeVideoId(link))
              .filter((id): id is string => Boolean(id));
            const uniqueYoutubeIds = Array.from(new Set(youtubeIds));
            return (
              <div
                key={item.id}
                className="min-w-0 rounded-xl border p-4 space-y-3 flex flex-col overflow-hidden"
                style={{ borderColor: C.border, background: "#FFFFFF" }}
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm font-semibold break-words whitespace-pre-wrap [overflow-wrap:break-word]"
                      style={{ color: C.navy }}
                    >
                      {item.challenge || "Knowledge log"}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
                      Logged on {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border"
                    style={{ background: "#EAE6FF", color: "#403294", borderColor: "#C5B8FF" }}
                  >
                    Knowledge
                  </span>
                </div>
                <div
                  className="min-w-0 text-sm leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:break-word]"
                  style={{ color: C.slate }}
                >
                  {item.lesson || "No lesson text provided."}
                </div>
                {allReferenceLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 min-w-0">
                    {allReferenceLinks.map((link) => (
                      <a
                        key={`${item.id}-${link}`}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-w-0 items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold break-words whitespace-pre-wrap [overflow-wrap:break-word]"
                        style={{ color: "#006644", borderColor: "#79F2C0", background: "#E3FCEF" }}
                      >
                        Reference
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                )}
                {uniqueYoutubeIds.length > 0 && (
                  <div className="space-y-2">
                    {uniqueYoutubeIds.map((youtubeId) => (
                      <div
                        key={`${item.id}-${youtubeId}`}
                        className="rounded-lg overflow-hidden border"
                        style={{ borderColor: C.border, background: "#F4F5F7" }}
                      >
                        <iframe
                          title={`Knowledge video ${item.id}-${youtubeId}`}
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

/* ============================================================ */
/*               OVERLAY: CAPTURE MODAL                         */
/* ============================================================ */

function CaptureModal({
  onClose,
  onSaveEvidence,
  onSaveKnowledge,
}: {
  onClose: () => void;
  onSaveEvidence: (payload: {
    title: string;
    description: string;
    sourceLink: string;
    category: string;
    subcategory: string;
  }) => void;
  onSaveKnowledge: (payload: {
    challenge: string;
    lesson: string;
    referenceLinks: string[];
    reset: () => void;
  }) => void;
}) {
  const [tab, setTab] = useState<"evidence" | "knowledge">("evidence");
  const categories = Object.keys(SUBCATEGORIES);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [category, setCategory] = useState(categories[2]); // Code Quality
  const [subcategory, setSubcategory] = useState(SUBCATEGORIES[categories[2]][0]);
  const [challenge, setChallenge] = useState("");
  const [lesson, setLesson] = useState("");
  const [knowledgeReferenceInput, setKnowledgeReferenceInput] = useState("");
  const [knowledgeReferenceLinks, setKnowledgeReferenceLinks] = useState<string[]>([]);
  const linkValid = !sourceLink || /^https?:\/\/\S+\.\S+/i.test(sourceLink);
  const knowledgeInputValid =
    !knowledgeReferenceInput || /^https?:\/\/\S+\.\S+/i.test(knowledgeReferenceInput);

  function onCategoryChange(v: string) {
    setCategory(v);
    setSubcategory(SUBCATEGORIES[v][0]);
  }

  function handleAutoMapCompetency() {
    const inferred = inferCompetencyFromText(title, description);
    setCategory(inferred);
    setSubcategory(SUBCATEGORIES[inferred][0]);
    toast.success("Competency auto-mapped.");
  }

  function handlePolishContent() {
    if (!title.trim() && !description.trim()) {
      toast.info("Add title or description first.");
      return;
    }
    if (title.trim()) setTitle((prev) => polishText(prev));
    if (description.trim()) setDescription((prev) => polishText(prev));
    toast.success("Content polished.");
  }

  function resetKnowledgeFields() {
    setChallenge("");
    setLesson("");
    setKnowledgeReferenceInput("");
    setKnowledgeReferenceLinks([]);
  }

  function addKnowledgeReferenceLink() {
    const trimmed = knowledgeReferenceInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/\S+\.\S+/i.test(trimmed)) {
      toast.error("Enter a valid URL starting with http:// or https://");
      return;
    }
    setKnowledgeReferenceLinks((previous) => {
      if (previous.some((link) => link.toLowerCase() === trimmed.toLowerCase())) return previous;
      return [...previous, trimmed];
    });
    setKnowledgeReferenceInput("");
  }

  function removeKnowledgeReferenceLink(linkToRemove: string) {
    setKnowledgeReferenceLinks((previous) => previous.filter((link) => link !== linkToRemove));
  }

  return (
    <Backdrop onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-xl border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: C.border }}
        >
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Manual Capture
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: C.navy }}>
              Capture activity
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#F4F5F7]"
            style={{ color: C.slate }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div
            className="inline-flex rounded-md border p-0.5"
            style={{ borderColor: C.border }}
            role="tablist"
            aria-label="Capture mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "evidence"}
              onClick={() => setTab("evidence")}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                tab === "evidence" ? "text-white" : ""
              }`}
              style={{
                background: tab === "evidence" ? C.primary : "transparent",
                color: tab === "evidence" ? "#fff" : C.slate,
              }}
            >
              Capture Evidence
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "knowledge"}
              onClick={() => setTab("knowledge")}
              className="px-3 py-1.5 text-xs font-semibold rounded"
              style={{
                background: tab === "knowledge" ? C.primary : "transparent",
                color: tab === "knowledge" ? "#fff" : C.slate,
              }}
            >
              Log Knowledge
            </button>
          </div>

          {tab === "evidence" ? (
            <>
              <Field label="Evidence Title" required>
                <Input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Led RFC review for payments cutover"
                />
              </Field>
              <Field label="Description / Context" optional>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What challenge did you solve and what was the impact?"
                  rows={4}
                />
              </Field>
              <div
                className="rounded-md border p-2.5 space-y-2"
                style={{ borderColor: C.border, background: "#FAFBFC" }}
              >
                <div className="text-[11px] font-semibold" style={{ color: C.slate }}>
                  AI Assistant Actions
                </div>
                <div className="flex items-center gap-2">
                  <GhostBtn type="button" className="border h-8 px-2.5" onClick={handlePolishContent}>
                    <Sparkles size={13} />
                    Polish Content
                  </GhostBtn>
                  <GhostBtn
                    type="button"
                    className="border h-8 px-2.5"
                    onClick={handleAutoMapCompetency}
                  >
                    <Sparkles size={13} />
                    Auto-Map Competency
                  </GhostBtn>
                </div>
                <div className="text-[11px]" style={{ color: C.subtle }}>
                  AI will clean up your engineering shorthand for corporate clarity and auto-select
                  matching competency options.
                </div>
              </div>
              <Field label="Source Link" optional>
                <div className="relative">
                  <LinkIcon
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: C.subtle }}
                  />
                  <Input
                    value={sourceLink}
                    onChange={(e) => setSourceLink(e.target.value)}
                    placeholder="https://github.com/org/repo/pull/142"
                    className="pl-8"
                  />
                </div>
                <div className="text-[11px] mt-1" style={{ color: linkValid ? C.subtle : C.red }}>
                  {linkValid
                    ? "Add URL to a Jira ticket, PR, or Confluence page."
                    : "Enter a valid URL starting with http:// or https://"}
                </div>
              </Field>
              <Field label="Competency Category" required>
                <Select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
                <div className="text-[11px] mt-1.5 leading-relaxed" style={{ color: C.subtle }}>
                  {COMPETENCY_DESC[category]}
                </div>
              </Field>
              <Field label="Subcategory / Question" required>
                <Select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                  {SUBCATEGORIES[category].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
            </>
          ) : (
            <>
              <Field label="Core Activity / Challenge" required>
                <Textarea
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="What challenge did you run into?"
                  rows={4}
                />
              </Field>
              <Field label="Solution / Lesson Learned" required>
                <Textarea
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  placeholder="What did you learn that you'll reuse?"
                  rows={5}
                />
              </Field>
              <Field label="External Reference Links" optional>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: C.subtle }}
                    />
                    <Input
                      value={knowledgeReferenceInput}
                      onChange={(e) => setKnowledgeReferenceInput(e.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addKnowledgeReferenceLink();
                        }
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="pl-8"
                    />
                  </div>
                  <GhostBtn
                    type="button"
                    className="border h-9 px-2.5 whitespace-nowrap"
                    onClick={addKnowledgeReferenceLink}
                  >
                    <Plus size={13} />
                    Add Reference Link
                  </GhostBtn>
                </div>
                {!knowledgeInputValid && (
                  <div className="text-[11px] mt-1" style={{ color: C.red }}>
                    Enter a valid URL starting with http:// or https://
                  </div>
                )}
                {knowledgeReferenceLinks.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {knowledgeReferenceLinks.map((link) => (
                      <span
                        key={link}
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
                        style={{ borderColor: "#B3D4FF", background: "#DEEBFF", color: C.primary }}
                      >
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          Link
                          <ExternalLink size={11} />
                        </a>
                        <button
                          type="button"
                          onClick={() => removeKnowledgeReferenceLink(link)}
                          className="rounded-full p-0.5 hover:bg-[#B3D4FF]"
                          aria-label={`Remove reference link ${link}`}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </Field>
            </>
          )}
        </div>
        <div
          className="p-4 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border }}
        >
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          {tab === "evidence" ? (
            <PrimaryBtn
              disabled={
                !title.trim() || !category.trim() || !subcategory.trim() || !linkValid
              }
              onClick={() =>
                onSaveEvidence({
                  title,
                  description,
                  sourceLink,
                  category,
                  subcategory,
                })
              }
            >
              Save Evidence
            </PrimaryBtn>
          ) : (
            <PrimaryBtn
              disabled={!challenge.trim() || !lesson.trim() || !knowledgeInputValid}
              onClick={() =>
                onSaveKnowledge({
                  challenge,
                  lesson,
                  referenceLinks: knowledgeReferenceLinks,
                  reset: resetKnowledgeFields,
                })
              }
            >
              Save Knowledge
            </PrimaryBtn>
          )}
        </div>
      </motion.div>
    </Backdrop>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(9, 30, 66, 0.54)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
}

function Field({
  label,
  children,
  required,
  optional,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-xs font-semibold" style={{ color: C.slate }}>
          {label}
          {required && (
            <span className="ml-0.5" style={{ color: "#DE350B" }}>
              *
            </span>
          )}
        </div>
        {optional && (
          <span className="text-[10px] tracking-wide" style={{ color: C.subtle }}>
            (optional)
          </span>
        )}
      </div>
      {children}
      {hint && (
        <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
          {hint}
        </div>
      )}
    </label>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 text-sm rounded border bg-[#F4F5F7] focus:bg-white outline-none transition-all resize-none"
      style={{ borderColor: C.border, color: C.navy, overflowWrap: "anywhere" }}
      onFocus={(e) => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.borderColor = C.primary;
        e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = "#F4F5F7";
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

/* ============================================================ */
/*          OVERLAY: CREATE SMART OBJECTIVE                     */
/* ============================================================ */

function CreateObjectiveModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (o: Omit<Objective, "id" | "status">) => void;
}) {
  const objCategories = Object.keys(SUBCATEGORIES);
  const [competency, setCompetency] = useState(objCategories[0]);
  const [subcategory, setSubcategory] = useState(SUBCATEGORIES[objCategories[0]][0]);
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [s, setS] = useState("");
  const [m, setM] = useState("");
  const [a, setA] = useState("");
  const [r, setR] = useState("");
  const [timeboundDate, setTimeboundDate] = useState("");
  const [learn, setLearn] = useState<SuccessCriterion[]>([
    { criteria: "", evidence: "", attachments: [] },
  ]);
  const [demonstrate, setDemonstrate] = useState<SuccessCriterion[]>([
    { criteria: "", evidence: "", attachments: [] },
  ]);
  const [share, setShare] = useState<SuccessCriterion[]>([
    { criteria: "", evidence: "", attachments: [] },
  ]);

  function onCatChange(v: string) {
    setCompetency(v);
    setSubcategory(SUBCATEGORIES[v][0]);
  }

  useEffect(() => {
    if (!startDate || !timeboundDate) return;
    if (timeboundDate < startDate) {
      setTimeboundDate(startDate);
    }
  }, [startDate, timeboundDate]);

  return (
    <Backdrop onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl border max-h-[90vh] overflow-hidden flex flex-col"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: C.border }}
        >
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              New Objective
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: C.navy }}>
              Create SMART Objective
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#F4F5F7]"
            style={{ color: C.slate }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-5 flex-1 overflow-hidden">
          {/* Form */}
          <div className="col-span-3 p-6 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <div className="text-[11px]" style={{ color: C.subtle }}>
                Fields marked <span style={{ color: "#DE350B" }}>*</span> are required.
              </div>
              <Field label="Objective Title" required>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short, action-oriented title"
                />
              </Field>
              <Field label="Objective Statement" required>
                <Textarea
                  rows={3}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Describe what you intend to achieve and why it matters."
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Start Date (Authored Date)"
                  required
                  hint="Defaults to today and represents when the objective starts."
                >
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    icon={<Calendar size={14} />}
                  />
                </Field>
                <Field label="Target Category" required>
                  <Select value={competency} onChange={(e) => onCatChange(e.target.value)}>
                    {objCategories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Target Subcategory / Question" required>
                <Select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                  {SUBCATEGORIES[competency].map((sc) => (
                    <option key={sc}>{sc}</option>
                  ))}
                </Select>
                <div className="text-[11px] mt-1.5 leading-relaxed" style={{ color: C.subtle }}>
                  {COMPETENCY_DESC[competency]}
                </div>
              </Field>
            </div>

            <hr style={{ borderColor: C.border }} />

            <div className="space-y-4">
              <div
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: C.subtle }}
              >
                SMART Breakdown
              </div>
              <SmartField
                letter="S"
                name="Specific"
                hint="Clearly state who, what action, and context. Avoid vague verbs like 'understand'."
                value={s}
                onChange={setS}
              />
              <SmartField
                letter="M"
                name="Measurable"
                hint="Define how you will evaluate success (e.g., a completed project or assessment)."
                value={m}
                onChange={setM}
              />
              <SmartField
                letter="A"
                name="Achievable"
                hint="Ensure it is realistic based on your current skills, resources, and time."
                value={a}
                onChange={setA}
              />
              <SmartField
                letter="R"
                name="Relevant"
                hint="How does this align with your promotion goals?"
                value={r}
                onChange={setR}
              />
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: C.primary }}
                  >
                    T
                  </div>
                  <div className="text-sm font-semibold" style={{ color: C.navy }}>
                    Time-bound
                    <span className="ml-0.5" style={{ color: "#DE350B" }}>
                      *
                    </span>
                  </div>
                </div>
                <Input
                  type="date"
                  value={timeboundDate}
                  onChange={(e) => setTimeboundDate(e.target.value)}
                  min={startDate || undefined}
                  icon={<Calendar size={14} />}
                />
                <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
                  Completion date. Dates earlier than Start Date are disabled.
                </div>
              </div>
            </div>

            <hr style={{ borderColor: C.border }} />

            <CriteriaSection
              title="Learn"
              icon={BookOpen}
              tone="info"
              evidenceLabel="Materials Used"
              evidencePlaceholder="Link to docs, videos, courses"
              rows={learn}
              onChange={setLearn}
              criteriaPlaceholder="What will you learn?"
            />

            <hr style={{ borderColor: C.border }} />

            <CriteriaSection
              title="Demonstrate"
              icon={Wrench}
              tone="warning"
              evidenceLabel="Evidence"
              evidencePlaceholder="Link to PR, code snippet, doc"
              rows={demonstrate}
              onChange={setDemonstrate}
              criteriaPlaceholder="How will you apply what you learned?"
            />

            <hr style={{ borderColor: C.border }} />

            <CriteriaSection
              title="Share"
              icon={Share2}
              tone="success"
              evidenceLabel="Presentation Artifacts"
              evidencePlaceholder="Link to slides, YouTube, doc"
              rows={share}
              onChange={setShare}
              criteriaPlaceholder="How will you teach others?"
            />
          </div>

          {/* Guidance */}
          <aside
            className="col-span-2 border-l p-6 overflow-y-auto"
            style={{ borderColor: C.border, background: C.bg }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} style={{ color: C.primary }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Writing Effective Objectives
              </div>
            </div>

            <div
              className="p-3 rounded border mb-4"
              style={{ background: C.primarySoft, borderColor: "transparent" }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-wider mb-1"
                style={{ color: C.primary }}
              >
                Pro Tip - Bloom's Taxonomy
              </div>
              <div className="text-xs leading-relaxed" style={{ color: C.navy }}>
                Rely on observable action verbs (identify, analyze, demonstrate). Instead of
                "understand the new software", use "execute core data-entry tasks".
              </div>
            </div>

            <div
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: C.subtle }}
            >
              Examples
            </div>
            <div
              className="p-3 rounded border mb-2 text-xs"
              style={{ borderColor: C.border, background: "#fff" }}
            >
              <div className="font-bold mb-1" style={{ color: C.red }}>
                Weak
              </div>
              <div style={{ color: C.slate }}>"Get better at system design."</div>
            </div>
            <div
              className="p-3 rounded border text-xs"
              style={{ borderColor: C.border, background: "#fff" }}
            >
              <div className="font-bold mb-1" style={{ color: "#006644" }}>
                SMART
              </div>
              <div style={{ color: C.slate }}>
                "By Q1 end, author and present 2 RFCs for the search platform re-architecture,
                reviewed by a Staff engineer, and reduce p95 query latency by 30% in staging."
              </div>
            </div>
          </aside>
        </div>

        <div
          className="p-4 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border }}
        >
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn
            disabled={!title.trim() || !statement.trim() || !startDate || !timeboundDate}
            onClick={() =>
              onSubmit({
                title: title.trim(),
                competency,
                targetSubcategory: subcategory,
                due: timeboundDate,
                statement: statement.trim(),
                dateAuthored: startDate,
                specific: s,
                measurable: m,
                achievable: a,
                relevant: r,
                timebound: timeboundDate,
                successCriteria: {
                  learn: learn.filter((x) => x.criteria.trim()),
                  demonstrate: demonstrate.filter((x) => x.criteria.trim()),
                  share: share.filter((x) => x.criteria.trim()),
                },
              })
            }
          >
            Submit for Manager Approval
          </PrimaryBtn>
        </div>
      </motion.div>
    </Backdrop>
  );
}

function SmartField({
  letter,
  name,
  hint,
  value,
  onChange,
}: {
  letter: string;
  name: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
          style={{ background: C.primary }}
        >
          {letter}
        </div>
        <div className="text-sm font-semibold" style={{ color: C.navy }}>
          {name}
        </div>
        <span className="text-[10px] uppercase tracking-wide" style={{ color: C.subtle }}>
          Optional
        </span>
      </div>
      <Textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
        {hint}
      </div>
    </div>
  );
}

function CriteriaSection({
  title,
  icon: Icon,
  tone,
  evidenceLabel,
  evidencePlaceholder,
  rows,
  onChange,
  criteriaPlaceholder,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  tone: "info" | "warning" | "success";
  evidenceLabel: string;
  evidencePlaceholder: string;
  rows: SuccessCriterion[];
  onChange: (rows: SuccessCriterion[]) => void;
  criteriaPlaceholder: string;
}) {
  const update = (i: number, patch: Partial<SuccessCriterion>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const add = () => onChange([...rows, { criteria: "", evidence: "", attachments: [] }]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: C.primary }} />
          <div className="text-sm font-bold" style={{ color: C.navy }}>
            {title}
          </div>
          <Badge tone={tone}>{rows.length}</Badge>
        </div>
        <GhostBtn onClick={add}>
          <Plus size={12} />
          Add row
        </GhostBtn>
      </div>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="p-3 rounded border space-y-2"
            style={{ borderColor: C.border, background: "#FAFBFC" }}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  value={row.criteria}
                  onChange={(e) => update(i, { criteria: e.target.value })}
                  placeholder={criteriaPlaceholder}
                />
                <Input
                  value={row.evidence}
                  onChange={(e) => update(i, { evidence: e.target.value })}
                  placeholder={`${evidenceLabel}: ${evidencePlaceholder}`}
                  icon={<LinkIcon size={12} />}
                />
              </div>
              <button
                onClick={() => remove(i)}
                className="p-1.5 rounded hover:bg-[#FFEBE6]"
                style={{ color: C.red }}
                title="Remove row"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div
            className="text-xs px-3 py-4 rounded border border-dashed text-center"
            style={{ borderColor: C.border, color: C.subtle }}
          >
            No criteria added yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
/*       OVERLAY: OBJECTIVE DETAILS SLIDE-OVER                  */
/* ============================================================ */

function ObjectiveSlideover({
  objective,
  onClose,
  onSave,
  onChangeStatus,
  onArchive,
}: {
  objective: Objective;
  onClose: () => void;
  onSave: (o: Objective) => void;
  onChangeStatus: (o: Objective, next: Objective["status"]) => void;
  onArchive: (o: Objective) => void;
}) {
  const objCategories = Object.keys(SUBCATEGORIES);
  const [smartOpen, setSmartOpen] = useState(false);
  const [title, setTitle] = useState(objective.title);
  const [competency, setCompetency] = useState(objective.competency);
  const [targetSubcategory, setTargetSubcategory] = useState(
    objective.targetSubcategory ?? SUBCATEGORIES[objective.competency]?.[0] ?? "",
  );
  const [links, setLinks] = useState(objective.links ?? []);
  const [newLink, setNewLink] = useState("");
  const [notes, setNotes] = useState(objective.notes ?? "");
  const [statement, setStatement] = useState(objective.statement ?? "");
  const [criteria, setCriteria] = useState(
    objective.successCriteria ?? { learn: [], demonstrate: [], share: [] },
  );
  const isTodo = objective.status === "Pending Approval";
  const locked = objective.status === "Completed";
  const readOnly = !isTodo;
  const [editMode, setEditMode] = useState(false);
  const isEditable = isTodo && editMode;
  const [confirmArchive, setConfirmArchive] = useState(false);

  function onObjectiveCategoryChange(nextCategory: string) {
    setCompetency(nextCategory);
    setTargetSubcategory(SUBCATEGORIES[nextCategory]?.[0] ?? "");
  }

  function buildUpdated(): Objective {
    return {
      ...objective,
      title,
      competency,
      targetSubcategory,
      notes,
      links,
      statement,
      successCriteria: criteria,
    };
  }

  const nextStatus: Objective["status"] | null =
    objective.status === "Pending Approval"
      ? "In Progress"
      : objective.status === "In Progress"
        ? "Completed"
        : null;
  const nextLabel =
    objective.status === "Pending Approval"
      ? "Approve & Move to In Progress"
      : objective.status === "In Progress"
        ? "Mark as Completed"
        : "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50"
      style={{ background: "rgba(9, 30, 66, 0.45)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 right-0 h-full w-full md:w-[48%] bg-white shadow-2xl flex flex-col overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs" style={{ color: C.subtle }}>
              <span>Objectives</span>
              <ChevronRight size={12} />
              <span
                className="font-semibold truncate max-w-[220px] md:max-w-[320px]"
                style={{ color: C.slate }}
                title={objective.title}
              >
                {objective.title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {isTodo && (
                <button
                  onClick={() => setEditMode((v) => !v)}
                  title={editMode ? "Done editing" : "Edit"}
                  className="p-1.5 rounded hover:bg-[#F4F5F7]"
                  style={{ color: editMode ? C.primary : C.slate }}
                >
                  <Pencil size={16} />
                </button>
              )}
              {!locked && (
                <button
                  onClick={() => {
                    setConfirmArchive(true);
                  }}
                  title="Archive"
                  className="p-1.5 rounded hover:bg-[#FFEBE6]"
                  style={{ color: C.red }}
                >
                  <Archive size={16} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-[#F4F5F7]"
                style={{ color: C.slate }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          {isEditable ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold mt-2"
              placeholder="Objective title"
            />
          ) : (
            <div className="text-xl font-bold mt-2 leading-snug" style={{ color: C.navy }}>
              {title}
            </div>
          )}
          <div className="flex items-center gap-2 mt-3">
            <Badge
              tone={
                objective.status === "Completed"
                  ? "success"
                  : objective.status === "In Progress"
                    ? "info"
                    : "warning"
              }
            >
              {locked && <Lock size={10} className="inline mr-1" />}
              {objective.status}
            </Badge>
            <Badge tone="info">{competency}</Badge>
            <Badge tone="neutral">{targetSubcategory || "No subcategory selected"}</Badge>
            <CountdownBadge due={objective.due} />
            {readOnly && (
              <span className="text-[11px]" style={{ color: C.subtle }}>
                {locked ? "Locked - read only" : "Read only after moving out of To Do"}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-6">
          {/* SMART accordion */}
          <div className="rounded border" style={{ borderColor: C.border }}>
            <button
              onClick={() => setSmartOpen((x) => !x)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold"
              style={{ color: C.navy }}
            >
              <span>SMART Details</span>
              <motion.span
                animate={{ rotate: smartOpen ? 180 : 0 }}
                transition={{ duration: 0.18 }}
              >
                <ChevronDown size={16} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {smartOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 text-sm" style={{ color: C.slate }}>
                    {(
                      [
                        ["S", "Specific", objective.specific],
                        ["M", "Measurable", objective.measurable],
                        ["A", "Achievable", objective.achievable],
                        ["R", "Relevant", objective.relevant],
                        ["T", "Time-bound", objective.timebound],
                      ] as const
                    ).map(([k, n, v]) => (
                      <div key={k}>
                        <div
                          className="text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: C.primary }}
                        >
                          {k} - {n}
                        </div>
                        <div className="mt-0.5">
                          {v || <span style={{ color: C.subtle }}>Not provided</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <section
            className="p-4 rounded border"
            style={{ borderColor: C.border, background: "#FAFBFC" }}
          >
            <div
              className="text-[11px] font-bold uppercase tracking-wider mb-2"
              style={{ color: C.subtle }}
            >
              Competency Mapping
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.subtle }}>
                  Target Category
                </div>
                {isEditable ? (
                  <Select value={competency} onChange={(e) => onObjectiveCategoryChange(e.target.value)}>
                    {objCategories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                ) : (
                  <div className="text-sm" style={{ color: C.navy }}>
                    {competency}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.subtle }}>
                  Target Subcategory / Question
                </div>
                {isEditable ? (
                  <Select
                    value={targetSubcategory}
                    onChange={(e) => setTargetSubcategory(e.target.value)}
                  >
                    {(SUBCATEGORIES[competency] ?? []).map((sc) => (
                      <option key={sc}>{sc}</option>
                    ))}
                  </Select>
                ) : (
                  <div className="text-sm leading-snug" style={{ color: C.navy }}>
                    {targetSubcategory || "Not provided"}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Objective Statement */}
          {(objective.statement || isEditable) && (
            <section
              className="p-4 rounded border"
              style={{ borderColor: C.border, background: "#FAFBFC" }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: C.subtle }}
              >
                Objective Statement
              </div>
              {isEditable ? (
                <Textarea
                  rows={3}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Describe what you intend to achieve and why it matters."
                />
              ) : (
                <div className="text-sm leading-relaxed break-words" style={{ color: C.navy }}>
                  {statement || <span style={{ color: C.subtle }}>No statement.</span>}
                </div>
              )}
              <div className="flex items-center justify-between mt-2 gap-3 flex-wrap">
                {objective.dateAuthored && (
                  <div className="text-[11px]" style={{ color: C.subtle }}>
                    Authored {objective.dateAuthored} - Time-bound {objective.due}
                  </div>
                )}
                <CountdownBadge due={objective.due} />
              </div>
            </section>
          )}

          {/* Success Criteria - Learn / Demonstrate / Share */}
          {(criteria || isEditable) && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} style={{ color: C.slate }} />
                <div className="text-sm font-bold" style={{ color: C.navy }}>
                  Success Criteria
                </div>
              </div>
              <div className="space-y-4">
                {(
                  [
                    {
                      key: "learn" as const,
                      label: "Learn",
                      icon: BookOpen,
                      tone: "info" as const,
                      evidenceLabel: "Materials Used",
                      evidencePlaceholder: "Link to docs, videos, courses",
                      criteriaPlaceholder: "What will you learn?",
                    },
                    {
                      key: "demonstrate" as const,
                      label: "Demonstrate",
                      icon: Wrench,
                      tone: "warning" as const,
                      evidenceLabel: "Evidence",
                      evidencePlaceholder: "Link to PR, code snippet, doc",
                      criteriaPlaceholder: "How will you apply what you learned?",
                    },
                    {
                      key: "share" as const,
                      label: "Share",
                      icon: Share2,
                      tone: "success" as const,
                      evidenceLabel: "Presentation Artifacts",
                      evidencePlaceholder: "Link to slides, YouTube, doc",
                      criteriaPlaceholder: "How will you teach others?",
                    },
                  ] as const
                ).map(
                  ({
                    key,
                    label,
                    icon: Icon,
                    tone,
                    evidenceLabel,
                    evidencePlaceholder,
                    criteriaPlaceholder,
                  }) => {
                    const rows = criteria[key] ?? [];
                    if (isEditable) {
                      return (
                        <div
                          key={key}
                          className="rounded border p-3"
                          style={{ borderColor: C.border }}
                        >
                          <CriteriaSection
                            title={label}
                            icon={Icon}
                            tone={tone}
                            evidenceLabel={evidenceLabel}
                            evidencePlaceholder={evidencePlaceholder}
                            rows={rows}
                            onChange={(next) => setCriteria((c) => ({ ...c, [key]: next }))}
                            criteriaPlaceholder={criteriaPlaceholder}
                          />
                        </div>
                      );
                    }
                    return (
                      <div
                        key={key}
                        className="rounded border overflow-hidden"
                        style={{ borderColor: C.border }}
                      >
                        <div
                          className="px-4 py-2.5 flex items-center justify-between border-b"
                          style={{ borderColor: C.border, background: "#FAFBFC" }}
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={14} style={{ color: C.primary }} />
                            <span className="text-sm font-semibold" style={{ color: C.navy }}>
                              {label}
                            </span>
                          </div>
                          <Badge tone={tone}>{rows.length} criteria</Badge>
                        </div>
                        <div className="divide-y" style={{ borderColor: C.border }}>
                          {rows.map((r, i) => (
                            <div
                              key={i}
                              className="px-4 py-3 grid grid-cols-[1fr_auto] gap-3 items-start min-w-0"
                              style={{ borderColor: C.border }}
                            >
                              <div className="min-w-0">
                                <div className="text-sm leading-snug break-words" style={{ color: C.navy }}>
                                  {r.criteria}
                                </div>
                                <div
                                  className="text-[11px] mt-1 flex items-center gap-1 break-all"
                                  style={{ color: C.subtle }}
                                >
                                  <Paperclip size={11} />
                                  Evidence: {r.evidence}
                                </div>
                              </div>
                              {r.evidence && /^https?:\/\//i.test(r.evidence) ? (
                                <button
                                  onClick={() => window.open(r.evidence, "_blank", "noopener")}
                                  className="text-[11px] font-semibold px-2 py-1 rounded border inline-flex items-center gap-1 hover:bg-[#DEEBFF]"
                                  style={{ borderColor: C.border, color: C.primary }}
                                  title="Open evidence link"
                                >
                                  <ExternalLink size={11} />
                                  Open
                                </button>
                              ) : r.done ? (
                                <Badge tone="success">Done</Badge>
                              ) : null}
                            </div>
                          ))}
                          {rows.length === 0 && (
                            <div className="px-4 py-3 text-xs" style={{ color: C.subtle }}>
                              No criteria added.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </section>
          )}

          {/* Links */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Learning Resources
              </div>
            </div>
            <div className="space-y-2">
              {links.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded border gap-2"
                  style={{ borderColor: C.border }}
                >
                  {isEditable ? (
                    <Input
                      value={l.label}
                      onChange={(e) =>
                        setLinks((arr) =>
                          arr.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)),
                        )
                      }
                      placeholder="Label"
                    />
                  ) : (
                    <span className="text-sm truncate min-w-0 max-w-[360px]" style={{ color: C.navy }} title={l.label}>
                      {l.label}
                    </span>
                  )}
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => window.open(l.url, "_blank", "noopener")}
                      className="text-[11px] font-semibold px-2 py-1 rounded border inline-flex items-center gap-1 hover:bg-[#DEEBFF]"
                      style={{ borderColor: C.border, color: C.primary }}
                      title="Open link"
                    >
                      <ExternalLink size={11} />
                      Open
                    </button>
                    {isEditable && (
                      <button
                        onClick={() => setLinks((arr) => arr.filter((_, idx) => idx !== i))}
                        className="p-1.5 rounded hover:bg-[#FFEBE6]"
                        style={{ color: C.red }}
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {links.length === 0 && (
                <div className="text-xs" style={{ color: C.subtle }}>
                  No resources added yet.
                </div>
              )}
              {isEditable && (
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="Add URL..."
                  />
                  <GhostBtn
                    onClick={() => {
                      if (!newLink) return;
                      setLinks((l) => [
                        ...l,
                        { label: newLink.replace(/^https?:\/\//, ""), url: newLink },
                      ]);
                      setNewLink("");
                    }}
                  >
                    <Plus size={14} />
                    Add
                  </GhostBtn>
                </div>
              )}
            </div>
          </section>

          {/* Evidence & Artifacts */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Evidence & Artifacts
              </div>
            </div>
            {isEditable ? (
              <div
                className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:border-[#0052CC] transition-colors"
                style={{ borderColor: C.border }}
              >
                <UploadCloud size={28} className="mx-auto" style={{ color: C.primary }} />
                <div className="text-sm font-semibold mt-2" style={{ color: C.navy }}>
                  Drop files here or click to upload
                </div>
                <div className="text-xs mt-1" style={{ color: C.subtle }}>
                  PDF, images, or code snippets
                </div>
              </div>
            ) : (
              <div className="text-xs" style={{ color: C.subtle }}>
                {locked
                  ? "Locked - artifacts are read-only."
                  : "Enter edit mode to upload artifacts."}
              </div>
            )}
          </section>

          {/* Notes */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Learning Log & Notes
              </div>
            </div>
            <Textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What are your key takeaways so far? Summarize your findings here."
              disabled={!isEditable}
              readOnly={!isEditable}
            />
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <div className="flex items-center gap-2">
            <GhostBtn onClick={onClose}>Close</GhostBtn>
            {locked && (
              <GhostBtn onClick={() => onChangeStatus(objective, "In Progress")}>
                <RotateCcw size={14} />
                Revert to In Progress
              </GhostBtn>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditable && (
              <GhostBtn
                onClick={() => {
                  onSave(buildUpdated());
                  setEditMode(false);
                }}
              >
                <Save size={14} />
                Save changes
              </GhostBtn>
            )}
            {nextStatus && (
              <PrimaryBtn onClick={() => onChangeStatus(buildUpdated(), nextStatus)}>
                <CheckCircle size={16} />
                {nextLabel}
              </PrimaryBtn>
            )}
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {confirmArchive && (
          <ConfirmDialog
            title="Archive this objective?"
            description="Archived objectives are removed from the Kanban board but can be restored from the Archive view. They will not be permanently deleted."
            confirmLabel="Archive"
            destructive
            onCancel={() => setConfirmArchive(false)}
            onConfirm={() => {
              setConfirmArchive(false);
              onArchive(objective);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================================================ */
/*           VIEW 1: CHROME EXTENSION POPUP                     */
/* ============================================================ */

/* ============================================================ */
/*                   TAB 5: SETTINGS HUB                        */
/* ============================================================ */

type SettingsSection =
  | "profile"
  | "team"
  | "notifications"
  | "extension"
  | "framework"
  | "dashboard";

const SETTINGS_SECTIONS: SettingsSection[] = [
  "profile",
  "team",
  "notifications",
  "extension",
  "framework",
  "dashboard",
];
function isSettingsSection(value: string | undefined): value is SettingsSection {
  return Boolean(value && SETTINGS_SECTIONS.includes(value as SettingsSection));
}

/* ============================================================ */
/*               TAB: 360 FEEDBACK                              */
/* ============================================================ */

type FeedbackType = "Manager Requested" | "Ad-hoc" | "Peer Review";
type FeedbackItem = {
  id: string;
  date: string;
  provider: string;
  type: FeedbackType;
  notes: string;
  anonymous: boolean;
};

function FeedbackTypeBadge({ type }: { type: FeedbackType }) {
  const tone: "info" | "success" | "neutral" =
    type === "Manager Requested" ? "info" : type === "Peer Review" ? "success" : "neutral";
  return <Badge tone={tone}>{type}</Badge>;
}

type SeniorityBand = "Junior / Associate" | "Mid-Level" | "Senior / Lead / Staff";
type CapabilityKey = "technicalExecution" | "collaboration" | "deliveryReliability";

const SENIORITY_TEMPLATE: Record<
  SeniorityBand,
  {
    prompt: string;
    focusAreas: string[];
    requestFocusSeed: string;
  }
> = {
  "Junior / Associate": {
    prompt: "Template tuned for early-career growth and execution consistency.",
    focusAreas: [
      "Learning acceleration and speed of skill acquisition.",
      "Executing assigned ticket mechanics with clarity and quality.",
      "Applying pull request code review notes in follow-up work.",
    ],
    requestFocusSeed:
      "How effectively am I applying code review feedback and accelerating my learning on assigned tickets?",
  },
  "Mid-Level": {
    prompt: "Template tuned for independent delivery and broader team contribution.",
    focusAreas: [
      "Feature branch ownership from planning through merge readiness.",
      "Prompt pull request testing and issue resolution.",
      "Self-sufficient debugging and active cross-functional participation.",
    ],
    requestFocusSeed:
      "How effectively am I owning features end-to-end, testing PRs promptly, and collaborating across functions?",
  },
  "Senior / Lead / Staff": {
    prompt: "Template tuned for technical leadership and organizational impact.",
    focusAreas: [
      "Scalable systems architecture and long-term maintainability.",
      "Technical mentorship and raising engineering standards.",
      "Risk mitigation, trade-off decisions, and product alignment.",
    ],
    requestFocusSeed:
      "How effectively am I driving scalable architecture, mentoring others, and balancing engineering risk with product goals?",
  },
};

const CAPABILITY_MATRIX: Array<{ key: CapabilityKey; label: string; focus: string }> = [
  {
    key: "technicalExecution",
    label: "Technical Execution",
    focus: "Code Quality, Architectural Soundness, and Code Review Contributions",
  },
  {
    key: "collaboration",
    label: "Collaboration",
    focus: "Team Communication and Cross-functional Interacting",
  },
  {
    key: "deliveryReliability",
    label: "Delivery Reliability",
    focus: "Execution Ownership and Scope Management",
  },
];

function resolveSeniorityBand(level: string | undefined): SeniorityBand {
  const value = (level ?? "").trim().toLowerCase();
  if (value.includes("junior") || value.includes("associate")) return "Junior / Associate";
  if (value.includes("senior") || value.includes("lead") || value.includes("staff")) {
    return "Senior / Lead / Staff";
  }
  return "Mid-Level";
}

function normalizeExternalUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function FeedbackView() {
  const { userId, user } = useAuth();
  const feedbackUserId = userId ?? "";
  const { data: items = [] } = useFeedbackQuery(feedbackUserId);
  const addFeedbackMutation = useAddFeedback(feedbackUserId);
  const [filter, setFilter] = useState<"All" | FeedbackType>("All");
  const [asking, setAsking] = useState(false);
  const [seniorityBand, setSeniorityBand] = useState<SeniorityBand>(() =>
    resolveSeniorityBand(user?.currentLevel),
  );
  const [seniorityOverridden, setSeniorityOverridden] = useState(false);
  const [scores, setScores] = useState<Record<CapabilityKey, number>>({
    technicalExecution: 3,
    collaboration: 3,
    deliveryReliability: 3,
  });
  const [strengthNarrative, setStrengthNarrative] = useState("");
  const [improvementNarrative, setImprovementNarrative] = useState("");
  const [nextSkillNarrative, setNextSkillNarrative] = useState("");
  const [externalSurveyDraft, setExternalSurveyDraft] = useState("");
  const [externalSurveyUrl, setExternalSurveyUrl] = useState("");
  const [requestLink, setRequestLink] = useState("");

  const filtered = useMemo(
    () => (filter === "All" ? items : items.filter((i) => i.type === filter)),
    [items, filter],
  );
  const activeTemplate = SENIORITY_TEMPLATE[seniorityBand];
  const avgScore = useMemo(
    () =>
      Number(
        (
          CAPABILITY_MATRIX.reduce((sum, item) => sum + (scores[item.key] ?? 0), 0) /
          CAPABILITY_MATRIX.length
        ).toFixed(2),
      ),
    [scores],
  );

  const canSubmitEvaluation =
    strengthNarrative.trim().length > 0 &&
    improvementNarrative.trim().length > 0 &&
    nextSkillNarrative.trim().length > 0;

  useEffect(() => {
    if (!seniorityOverridden) {
      setSeniorityBand(resolveSeniorityBand(user?.currentLevel));
    }
  }, [user?.currentLevel, seniorityOverridden]);

  useEffect(() => {
    if (typeof window === "undefined" || !feedbackUserId) return;
    const saved = window.localStorage.getItem(`evitrace.external-feedback-url.${feedbackUserId}`);
    if (!saved) return;
    setExternalSurveyUrl(saved);
    setExternalSurveyDraft(saved);
  }, [feedbackUserId]);

  function updateCapabilityScore(key: CapabilityKey, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }));
  }

  function saveExternalSurveyUrl() {
    if (!feedbackUserId) {
      toast.error("Please sign in before saving external survey links.");
      return;
    }
    if (!externalSurveyDraft.trim()) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(`evitrace.external-feedback-url.${feedbackUserId}`);
      }
      setExternalSurveyUrl("");
      toast.success("External survey link removed");
      return;
    }
    const normalized = normalizeExternalUrl(externalSurveyDraft);
    if (!normalized) {
      toast.error("Please provide a valid HTTP(S) URL.");
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`evitrace.external-feedback-url.${feedbackUserId}`, normalized);
    }
    setExternalSurveyUrl(normalized);
    setExternalSurveyDraft(normalized);
    toast.success("External survey link saved");
  }

  function buildRequestLink() {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    params.set("tab", "feedback");
    params.set("request", "1");
    if (feedbackUserId) params.set("profile", feedbackUserId);
    if (user?.fullName) params.set("engineer", user.fullName);
    if (user?.team) params.set("team", user.team);
    params.set("seniority", seniorityBand);
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?${params.toString()}`;
  }

  function handleRequestFeedbackLink() {
    const nextLink = buildRequestLink();
    if (!nextLink) {
      toast.error("Unable to generate feedback request link.");
      return;
    }
    setRequestLink(nextLink);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(nextLink)
        .then(() => toast.success("Request feedback link copied"))
        .catch(() => toast.success("Request feedback link generated"));
      return;
    }
    toast.success("Request feedback link generated");
  }

  function submitQualitativeEvaluation() {
    if (!canSubmitEvaluation) {
      toast.error("Please complete all mandatory qualitative prompts.");
      return;
    }
    const payload =
      `Seniority Template: ${seniorityBand}\n` +
      `Capability Matrix (1-5): Technical Execution ${scores.technicalExecution}, ` +
      `Collaboration ${scores.collaboration}, Delivery Reliability ${scores.deliveryReliability} ` +
      `(Avg ${avgScore})\n` +
      `Strength: ${strengthNarrative.trim()}\n` +
      `Improvement Example: ${improvementNarrative.trim()}\n` +
      `Next Skill: ${nextSkillNarrative.trim()}`;

    addFeedbackMutation.mutate(
      {
        date: new Date().toISOString().slice(0, 10),
        provider: "Self 360 Evaluation",
        type: "Ad-hoc",
        notes: payload,
        anonymous: false,
      },
      {
        onSuccess: () => {
          toast.success("360 evaluation saved");
        },
      },
    );
  }

  function addRequest(reviewer: string, focus: string) {
    addFeedbackMutation.mutate(
      {
        date: new Date().toISOString().slice(0, 10),
        provider: reviewer,
        type: "Manager Requested",
        notes: `Requested feedback on: ${focus}. Awaiting response.`,
        anonymous: false,
      },
      {
        onSuccess: () => {
          setAsking(false);
          toast.success("Feedback request sent");
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 px-6 py-8 md:px-8">
          <div className="flex flex-col gap-5">
            <div>
              <div className="text-lg font-semibold" style={{ color: C.navy }}>
                360-Degree Feedback
              </div>
              <div className="text-sm mt-1" style={{ color: C.subtle }}>
                Seniority-tailored 360 survey, qualitative coaching inputs, and historical feedback in one workspace.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill active={filter === "All"} onClick={() => setFilter("All")}>
                All
              </Pill>
              <Pill
                active={filter === "Manager Requested"}
                onClick={() => setFilter("Manager Requested")}
              >
                Manager Requested
              </Pill>
              <Pill active={filter === "Peer Review"} onClick={() => setFilter("Peer Review")}>
                Peer
              </Pill>
              <Pill active={filter === "Ad-hoc"} onClick={() => setFilter("Ad-hoc")}>
                Ad-hoc
              </Pill>
            </div>
          </div>
        </Card>
        <Card className="p-6 md:p-7 min-h-[220px] h-auto flex flex-col gap-4 justify-between">
          <div>
            <div className="text-sm font-semibold" style={{ color: C.navy }}>
              Ask for feedback
            </div>
            <div className="text-xs mt-1" style={{ color: C.subtle }}>
              Generate a shareable request link or log a direct feedback request with full-text prompts.
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <GhostBtn
              onClick={handleRequestFeedbackLink}
              className="w-full h-auto min-h-[2.75rem] px-4 py-2.5 justify-center whitespace-normal break-words leading-snug"
            >
              <Share2 size={14} />
              Request Feedback Link
            </GhostBtn>
            <PrimaryBtn
              onClick={() => setAsking(true)}
              className="w-full h-auto min-h-[2.75rem] px-4 py-2.5 justify-center whitespace-normal break-words leading-snug"
            >
              <Send size={14} />
              Log Feedback Request
            </PrimaryBtn>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
          <div className="text-sm font-semibold" style={{ color: C.navy }}>
            Historical Feedback
          </div>
          <div className="text-xs mt-1" style={{ color: C.subtle }}>
            Received and requested feedback entries, ordered by date.
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-[11px] uppercase tracking-wide"
                style={{ background: "#F4F5F7", color: C.subtle }}
              >
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Provider</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Type</th>
                <th className="px-4 py-3 font-semibold">Feedback Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: C.subtle }}
                  >
                    No feedback in this filter yet.
                  </td>
                </tr>
              )}
              {filtered.map((f) => (
                <tr key={f.id} className="border-t align-top" style={{ borderColor: C.border }}>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.slate }}>
                    {formatDisplayDate(f.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
                        style={{ background: f.anonymous ? "#6B778C" : "#5243AA" }}
                      >
                        {f.anonymous
                          ? "?"
                          : f.provider
                              .split(" ")
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join("")}
                      </div>
                      <span className="font-semibold" style={{ color: C.navy }}>
                        {f.provider}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <FeedbackTypeBadge type={f.type} />
                  </td>
                  <td className="px-4 py-3" style={{ color: C.slate }}>
                    <div className="max-w-2xl leading-relaxed">{f.notes}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 lg:items-end">
          <Field
            label="Feedback Template Seniority Tier"
            hint="Defaults to your profile level, but you can override it for a custom review context."
          >
            <Select
              value={seniorityBand}
              onChange={(e) => {
                setSeniorityOverridden(true);
                setSeniorityBand(e.target.value as SeniorityBand);
              }}
            >
              <option value="Junior / Associate">Junior / Associate</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior / Lead / Staff">Senior / Lead / Staff</option>
            </Select>
          </Field>
          <div className="text-xs rounded border px-3 py-2" style={{ borderColor: C.border, color: C.slate }}>
            Active profile: <span className="font-semibold" style={{ color: C.navy }}>{user?.currentLevel || "Not set"}</span>
          </div>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: C.border, background: "#F8FAFF" }}>
          <div className="text-sm font-semibold" style={{ color: C.navy }}>
            {activeTemplate.prompt}
          </div>
          <ul className="mt-2 space-y-1 text-sm list-disc pl-5" style={{ color: C.slate }}>
            {activeTemplate.focusAreas.map((focus) => (
              <li key={focus}>{focus}</li>
            ))}
          </ul>
        </div>
      </Card>

      <Card className="p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-semibold" style={{ color: C.navy }}>
              Core Capability Scalar Matrix (1-5)
            </div>
            <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
              1 = emerging, 3 = meeting expectations, 5 = exemplary and consistently scalable.
            </div>
          </div>
          <Badge tone="info">Average Score: {avgScore.toFixed(2)} / 5</Badge>
        </div>
        <div className="space-y-3">
          {CAPABILITY_MATRIX.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-3 border rounded-lg px-3 py-3"
              style={{ borderColor: C.border }}
            >
              <div>
                <div className="text-sm font-semibold" style={{ color: C.navy }}>
                  {row.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
                  {row.focus}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((point) => {
                  const active = scores[row.key] === point;
                  return (
                    <button
                      key={`${row.key}-${point}`}
                      type="button"
                      onClick={() => updateCapabilityScore(row.key, point)}
                      className="w-8 h-8 rounded border text-xs font-semibold transition-colors"
                      style={{
                        borderColor: active ? C.primary : C.border,
                        color: active ? C.primary : C.slate,
                        background: active ? C.primarySoft : "#fff",
                      }}
                    >
                      {point}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 pt-1">
          <Field
            label="What specific technical or collaborative strength does this engineer demonstrate that significantly impacts the team's success?"
            required
          >
            <Textarea
              value={strengthNarrative}
              onChange={(e) => setStrengthNarrative(e.target.value)}
              rows={4}
              placeholder="Describe the strongest recurring contribution and why it matters."
            />
          </Field>
          <Field
            label="Can you share an example of a recent project or pull request (PR) where this engineer could have improved their approach, code quality, or communication?"
            required
          >
            <Textarea
              value={improvementNarrative}
              onChange={(e) => setImprovementNarrative(e.target.value)}
              rows={4}
              placeholder="Reference a concrete project, pull request, or communication moment."
            />
          </Field>
          <Field
            label="What is the single most important skill this engineer should focus on next to advance to the next level?"
            required
          >
            <Textarea
              value={nextSkillNarrative}
              onChange={(e) => setNextSkillNarrative(e.target.value)}
              rows={4}
              placeholder="Identify one high-leverage skill and the expected impact."
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <PrimaryBtn onClick={submitQualitativeEvaluation} disabled={!canSubmitEvaluation}>
            <Save size={14} />
            Save 360 Evaluation
          </PrimaryBtn>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div>
          <div className="text-sm font-semibold" style={{ color: C.navy }}>
            Share Links & External Platform Configuration
          </div>
          <div className="text-xs mt-1" style={{ color: C.subtle }}>
            Add one central survey URL (Google Forms, Typeform, Confluence Forms, etc.) and share a profile-aware request link.
          </div>
        </div>
        <Field label="External Survey URL" optional>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={externalSurveyDraft}
              onChange={(e) => setExternalSurveyDraft(e.target.value)}
              placeholder="https://forms.gle/... or https://typeform.com/..."
            />
            <GhostBtn onClick={saveExternalSurveyUrl} className="sm:whitespace-nowrap">
              <Save size={14} />
              Save Anchor
            </GhostBtn>
          </div>
        </Field>
        {externalSurveyUrl && (
          <a
            href={externalSurveyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: C.primary }}
          >
            <ExternalLink size={12} />
            Open external survey anchor
          </a>
        )}
        <Field label="Request Feedback Link" optional>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={requestLink}
              readOnly
              placeholder="Click 'Request Feedback' above to generate a profile-aware link."
            />
            <GhostBtn onClick={handleRequestFeedbackLink} className="sm:whitespace-nowrap">
              <LinkIcon size={14} />
              Generate
            </GhostBtn>
          </div>
        </Field>
      </Card>

      <AnimatePresence>
        {asking && (
          <AskFeedbackModal
            initialFocus={activeTemplate.requestFocusSeed}
            onClose={() => setAsking(false)}
            onSubmit={addRequest}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AskFeedbackModal({
  initialFocus,
  onClose,
  onSubmit,
}: {
  initialFocus: string;
  onClose: () => void;
  onSubmit: (reviewer: string, focus: string) => void;
}) {
  const [reviewer, setReviewer] = useState("");
  const [focus, setFocus] = useState(initialFocus);
  const canSend = reviewer.trim().length > 0 && focus.trim().length > 0;
  return (
    <Backdrop onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: C.border }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: C.primarySoft, color: C.primary }}
            >
              <MessageCircleHeart size={16} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Request 360 Feedback
              </div>
              <div className="text-xs" style={{ color: C.subtle }}>
                Responses can be submitted anonymously.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#F4F5F7]"
            style={{ color: C.slate }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Reviewer (name or email)">
            <Input
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              placeholder="e.g. Daniela Espitia"
            />
          </Field>
          <Field label="Focus area">
            <Textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              rows={4}
              placeholder="What would you like feedback on? e.g. Collaboration on the payments migration."
            />
          </Field>
        </div>
        <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: C.border }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn
            onClick={() => canSend && onSubmit(reviewer.trim(), focus.trim())}
            disabled={!canSend}
          >
            <Send size={14} />
            Send Request
          </PrimaryBtn>
        </div>
      </motion.div>
    </Backdrop>
  );
}

function SettingsView({
  sampleContent,
  onSampleContentChange,
  section,
  onSectionChange,
}: {
  sampleContent: SampleContentVisibility;
  onSampleContentChange: (next: SampleContentVisibility) => void;
  section: SettingsSection;
  onSectionChange: (next: SettingsSection) => void;
}) {
  const items: {
    id: SettingsSection;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
  }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "team", label: "Team & Manager", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "extension", label: "Extension Preferences", icon: Puzzle },
    { id: "framework", label: "Competency Framework", icon: Layers },
    { id: "dashboard", label: "Sample Content", icon: LayoutDashboard },
  ];
  return (
    <div className="grid grid-cols-4 gap-6">
      <Card className="col-span-1 p-2 h-fit">
        <nav className="space-y-0.5">
          {items.map((it) => {
            const Icon = it.icon;
            const active = section === it.id;
            return (
              <button
                key={it.id}
                onClick={() => onSectionChange(it.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-sm font-medium transition-colors"
                style={{
                  background: active ? C.primarySoft : "transparent",
                  color: active ? C.primary : C.slate,
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "#F4F5F7";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={16} />
                {it.label}
              </button>
            );
          })}
        </nav>
      </Card>

      <div className="col-span-3 space-y-6">
        {section === "profile" && <ProfileSettings />}
        {section === "team" && <TeamSettings />}
        {section === "notifications" && <NotificationsSettings />}
        {section === "extension" && <ExtensionSettings />}
        {section === "framework" && <FrameworkSettings />}
        {section === "dashboard" && (
          <DashboardSamplesSettings
            sampleContent={sampleContent}
            onSampleContentChange={onSampleContentChange}
          />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <GhostBtn>Cancel</GhostBtn>
          <PrimaryBtn onClick={() => toast.success("Settings saved")}>
            <Save size={14} />
            Save Settings
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

function DashboardSamplesSettings({
  sampleContent,
  onSampleContentChange,
}: {
  sampleContent: SampleContentVisibility;
  onSampleContentChange: (next: SampleContentVisibility) => void;
}) {
  const toggle = (key: keyof SampleContentVisibility) =>
    onSampleContentChange({ ...sampleContent, [key]: !sampleContent[key] });

  return (
    <Card className="p-6">
      <SectionHeader
        title="Sample Content Visibility"
        sub="Choose where educational sample content appears. Turn off any area once you have enough real activity."
      />
      <div className="mt-3 space-y-1">
        <SettingRow
          title="Dashboard Samples"
          desc="Controls sample cards and placeholder records in dashboard highlights."
          right={<Toggle on={sampleContent.dashboard} onChange={() => toggle("dashboard")} />}
        />
        <SettingRow
          title="Objectives Samples"
          desc="Controls preloaded SMART objective examples in the Objectives board."
          right={<Toggle on={sampleContent.objectives} onChange={() => toggle("objectives")} />}
        />
        <SettingRow
          title="Evidence Log Samples"
          desc="Controls sample captured evidence and sample objective-logged entries in Evidence Log."
          right={<Toggle on={sampleContent.evidence} onChange={() => toggle("evidence")} />}
        />
      </div>
    </Card>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className="relative inline-flex w-9 h-5 rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      style={{ background: on ? C.primary : "#C1C7D0" }}
    >
      <span
        aria-hidden
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: on ? "translateX(16px)" : "translateX(0px)" }}
      />
    </button>
  );
}

function SettingRow({
  title,
  desc,
  right,
}: {
  title: string;
  desc: string;
  right: React.ReactNode;
}) {
  return (
    <div
      className="grid grid-cols-[1fr_auto] items-center gap-4 py-3 border-b last:border-b-0"
      style={{ borderColor: C.border }}
    >
      <div className="pr-2 min-w-0">
        <div className="text-sm font-semibold" style={{ color: C.navy }}>
          {title}
        </div>
        <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
          {desc}
        </div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function ProfileSettings() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { userId } = useAuth();
  const uploadAvatarMutation = useUploadAvatar(userId ?? "");
  const [photo, setPhoto] = useState<string | null>(null);
  const { user, updateUser } = useAuth();
  const displayName = getDisplayName(user?.fullName, user?.email);
  const displayTitle = user?.currentLevel?.trim() || "Engineer";
  const displaySubtitle = user?.team ? `${displayTitle} · ${user.team}` : displayTitle;
  const profileInitials =
    displayName
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{
    fullName: string;
    email: string;
    currentLevel: string;
    targetLevel: string;
  }>({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    currentLevel: user?.currentLevel ?? "",
    targetLevel: user?.targetLevel ?? "",
  });
  const [confirming, setConfirming] = useState(false);
  const [pwd, setPwd] = useState("");
  if (!user) return null;

  useEffect(() => {
    if (user?.avatarUrl) setPhoto(user.avatarUrl);
  }, [user?.avatarUrl]);

  function onPickPhoto(file: File | null | undefined) {
    if (!file) return;
    uploadAvatarMutation.mutate(file, {
      onSuccess: (url) => {
        setPhoto(url);
        toast.success("Profile picture updated");
      },
    });
  }

  function startEdit() {
    setDraft({
      fullName: user!.fullName,
      email: user!.email,
      currentLevel: user!.currentLevel ?? "",
      targetLevel: user!.targetLevel,
    });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setConfirming(false);
    setPwd("");
  }

  async function saveAll() {
    const unifiedCurrentLevel = draft.currentLevel.trim();
    const ok = await updateUser(
      {
        fullName: draft.fullName.trim(),
        email: draft.email.trim(),
        currentLevel: unifiedCurrentLevel,
        jobTitle: unifiedCurrentLevel,
        targetLevel: draft.targetLevel.trim(),
      },
      pwd,
    );
    if (!ok) {
      toast.error("Incorrect password");
      return;
    }
    toast.success("Profile updated");
    cancelEdit();
  }

  return (
    <Card className="p-6">
      <SectionHeader
        title="Profile"
        sub="Your personal information and role"
        right={
          !editing ? (
            <GhostBtn onClick={startEdit}>
              <Pencil size={12} />
              Edit profile
            </GhostBtn>
          ) : (
            <div className="flex gap-2">
              <GhostBtn onClick={cancelEdit}>Cancel</GhostBtn>
              <PrimaryBtn onClick={() => setConfirming(true)}>Save changes</PrimaryBtn>
            </div>
          )
        }
      />
      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative group w-16 h-16 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2"
          style={{ background: "#5243AA" }}
          aria-label="Change profile photo"
        >
          {photo ? (
            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-white">
              {profileInitials}
            </span>
          )}
          <span
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(9,30,66,0.55)" }}
          >
            <Camera size={18} color="#fff" />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPickPhoto(e.target.files?.[0])}
        />
        <div className="min-w-0">
          <div className="text-base font-semibold" style={{ color: C.navy }}>
            {displayName}
          </div>
          <div className="text-sm" style={{ color: C.subtle }}>
            {displaySubtitle}
          </div>
        </div>
      </div>
      <div className="mt-4 text-xs flex items-center gap-1.5" style={{ color: C.subtle }}>
        <ShieldCheck size={12} />
        Identity fields are protected. You'll be asked to confirm your password before saving.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Full name">
          <Input
            value={editing ? draft.fullName : displayName}
            readOnly={!editing}
            onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={editing ? draft.email : user.email}
            readOnly={!editing}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
          />
        </Field>
        <Field label="Current Job Title / Level">
          <Input
            value={editing ? draft.currentLevel : user.currentLevel || ""}
            readOnly={!editing}
            onChange={(e) => setDraft((d) => ({ ...d, currentLevel: e.target.value }))}
          />
        </Field>
        <Field label="Target level">
          <Input
            value={editing ? draft.targetLevel : user.targetLevel}
            readOnly={!editing}
            onChange={(e) => setDraft((d) => ({ ...d, targetLevel: e.target.value }))}
          />
        </Field>
      </div>

      <AnimatePresence>
        {confirming && (
          <Backdrop onClose={() => setConfirming(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-md border"
              style={{ borderColor: C.border }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="p-5 border-b flex items-center justify-between"
                style={{ borderColor: C.border }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ background: C.primarySoft, color: C.primary }}
                  >
                    <Lock size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: C.navy }}>
                      Confirm your password
                    </div>
                    <div className="text-xs" style={{ color: C.subtle }}>
                      Required to save profile changes.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setConfirming(false)}
                  className="p-1 rounded hover:bg-[#F4F5F7]"
                  style={{ color: C.slate }}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                <Field label="Current password" required>
                  <Input
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="Enter your password"
                    icon={<KeyRound size={14} />}
                  />
                </Field>
              </div>
              <div
                className="p-4 border-t flex justify-end gap-2"
                style={{ borderColor: C.border }}
              >
                <GhostBtn onClick={() => setConfirming(false)}>Cancel</GhostBtn>
                <PrimaryBtn disabled={!pwd.trim()} onClick={saveAll}>
                  Save changes
                </PrimaryBtn>
              </div>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>
    </Card>
  );
}

function TeamSettings() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pwd, setPwd] = useState("");
  const [draft, setDraft] = useState({
    manager: user?.manager ?? "",
    managerEmail: user?.managerEmail ?? "",
    team: user?.team ?? "",
    skipLevel: user?.skipLevel ?? "",
  });
  if (!user) return null;

  function startEdit() {
    setDraft({
      manager: user!.manager,
      managerEmail: user!.managerEmail,
      team: user!.team,
      skipLevel: user!.skipLevel ?? "",
    });
    setEditing(true);
  }
  function cancelEdit() {
    setEditing(false);
    setConfirming(false);
    setPwd("");
  }
  async function saveAll() {
    const ok = await updateUser(
      {
        manager: draft.manager.trim(),
        managerEmail: draft.managerEmail.trim(),
        team: draft.team.trim(),
        skipLevel: draft.skipLevel.trim(),
      },
      pwd,
    );
    if (!ok) {
      toast.error("Incorrect password");
      return;
    }
    toast.success("Team & manager details updated");
    cancelEdit();
  }

  return (
    <Card className="p-6">
      <SectionHeader
        title="Team & Manager"
        sub="Who reviews your evidence and approves objectives"
        right={
          !editing ? (
            <GhostBtn onClick={startEdit}>
              <Pencil size={12} />
              Edit details
            </GhostBtn>
          ) : (
            <div className="flex gap-2">
              <GhostBtn onClick={cancelEdit}>Cancel</GhostBtn>
              <PrimaryBtn onClick={() => setConfirming(true)}>Save changes</PrimaryBtn>
            </div>
          )
        }
      />
      <div className="mt-3 text-xs flex items-center gap-1.5" style={{ color: C.subtle }}>
        <ShieldCheck size={12} />
        Reporting fields are protected. You'll be asked to confirm your password before saving.
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Reporting manager">
          <Input
            value={editing ? draft.manager : user.manager}
            readOnly={!editing}
            onChange={(e) => setDraft((d) => ({ ...d, manager: e.target.value }))}
          />
        </Field>
        <Field label="Manager email">
          <Input
            type="email"
            value={editing ? draft.managerEmail : user.managerEmail}
            readOnly={!editing}
            onChange={(e) => setDraft((d) => ({ ...d, managerEmail: e.target.value }))}
          />
        </Field>
        <Field label="Business unit / Team">
          <Input
            value={editing ? draft.team : user.team}
            readOnly={!editing}
            onChange={(e) => setDraft((d) => ({ ...d, team: e.target.value }))}
          />
        </Field>
        <Field
          label="Manager's Manager (Skip-Level)"
          optional
          hint="The engineering leader or executive your direct manager reports to."
        >
          <Input
            value={editing ? draft.skipLevel : user.skipLevel}
            readOnly={!editing}
            onChange={(e) => setDraft((d) => ({ ...d, skipLevel: e.target.value }))}
          />
        </Field>
      </div>

      <AnimatePresence>
        {confirming && (
          <Backdrop onClose={() => setConfirming(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-md border"
              style={{ borderColor: C.border }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="p-5 border-b flex items-center justify-between"
                style={{ borderColor: C.border }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ background: C.primarySoft, color: C.primary }}
                  >
                    <Lock size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: C.navy }}>
                      Confirm your password
                    </div>
                    <div className="text-xs" style={{ color: C.subtle }}>
                      Required to update reporting details.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setConfirming(false)}
                  className="p-1 rounded hover:bg-[#F4F5F7]"
                  style={{ color: C.slate }}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                <Field label="Current password" required>
                  <Input
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="Enter your password"
                    icon={<KeyRound size={14} />}
                  />
                </Field>
              </div>
              <div
                className="p-4 border-t flex justify-end gap-2"
                style={{ borderColor: C.border }}
              >
                <GhostBtn onClick={() => setConfirming(false)}>Cancel</GhostBtn>
                <PrimaryBtn disabled={!pwd.trim()} onClick={saveAll}>
                  Save changes
                </PrimaryBtn>
              </div>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>
    </Card>
  );
}

function NotificationsSettings() {
  const { userId } = useAuth();
  const settingsUserId = userId ?? "";
  const { data: settings } = useSettingsQuery(settingsUserId);
  const saveNotificationsMutation = useSaveNotifications(settingsUserId);
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  const [c, setC] = useState(false);
  const [d, setD] = useState(true);
  const [timeSlots, setTimeSlots] = useState<string[]>(["16:00"]);
  const [snoozeMinutes, setSnoozeMinutes] = useState(15);
  const [weekdaysOnly, setWeekdaysOnly] = useState(true);
  const [timezone, setTimezone] = useState("GMT");

  function sendExtensionConfig(notifications: NotificationPrefs) {
    const chromeApi = (globalThis as typeof globalThis & { chrome?: any }).chrome;
    if (!chromeApi?.runtime?.sendMessage) return;
    chromeApi.runtime.sendMessage({
      type: "UPDATE_PROMPT_CONFIG",
      scheduleTimes: notifications.dailyReminder
        ? notifications.extensionPromptTimes
        : [],
      snoozeMinutes: notifications.extensionSnoozeMinutes,
      weekdaysOnly: notifications.extensionWeekdaysOnly,
      timezone: notifications.extensionTimezone,
    });
  }

  useEffect(() => {
    if (!settings) return;
    setA(settings.notifications.dailyReminder);
    setB(settings.notifications.managerApprovals);
    setC(settings.notifications.weeklyDigest);
    setD(settings.notifications.browserPush);
    setTimeSlots(
      settings.notifications.extensionPromptTimes.length > 0
        ? settings.notifications.extensionPromptTimes
        : ["16:00"],
    );
    setSnoozeMinutes(settings.notifications.extensionSnoozeMinutes);
    setWeekdaysOnly(settings.notifications.extensionWeekdaysOnly);
    setTimezone(settings.notifications.extensionTimezone);
  }, [settings]);

  useEffect(() => {
    if (!settings) return;
    sendExtensionConfig(settings.notifications);
  }, [settings]);

  function persist(next: Partial<NotificationPrefs>) {
    if (!settings) return;
    const notifications = { ...settings.notifications, ...next };
    saveNotificationsMutation.mutate(notifications);
    sendExtensionConfig(notifications);
  }

  function updateTimeSlot(index: number, nextValue: string) {
    const next = [...timeSlots];
    next[index] = nextValue;
    setTimeSlots(next);
    const sanitized = [...new Set(next.filter((v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v)))].sort();
    if (sanitized.length > 0) {
      persist({ extensionPromptTimes: sanitized });
    }
  }

  function addTimeSlot() {
    const next = [...timeSlots, "17:00"];
    setTimeSlots(next);
    persist({ extensionPromptTimes: [...new Set(next)].sort() });
  }

  function removeTimeSlot(index: number) {
    if (timeSlots.length <= 1) return;
    const next = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(next);
    const sanitized = [...new Set(next.filter((v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v)))].sort();
    persist({ extensionPromptTimes: sanitized.length > 0 ? sanitized : ["16:00"] });
  }

  return (
    <Card className="p-6">
      <SectionHeader title="Notifications" sub="Control how Evitrace reaches you" />
      <div className="mt-3">
        <SettingRow
          title="Daily reflection reminder"
          desc="Nudge me at 16:00 to log evidence before close of day."
          right={
            <Toggle
              on={a}
              onChange={(v) => {
                setA(v);
                persist({ dailyReminder: v });
              }}
            />
          }
        />
        <SettingRow
          title="Manager approvals"
          desc="Email me when my manager approves or comments."
          right={
            <Toggle
              on={b}
              onChange={(v) => {
                setB(v);
                persist({ managerApprovals: v });
              }}
            />
          }
        />
        <SettingRow
          title="Weekly digest"
          desc="Monday summary of evidence, gaps, and objective progress."
          right={
            <Toggle
              on={c}
              onChange={(v) => {
                setC(v);
                persist({ weeklyDigest: v });
              }}
            />
          }
        />
        <SettingRow
          title="Browser push"
          desc="Show desktop notifications from the Evitrace extension."
          right={
            <Toggle
              on={d}
              onChange={(v) => {
                setD(v);
                persist({ browserPush: v });
              }}
            />
          }
        />
        <div
          className="flex items-start justify-between py-3 border-b last:border-b-0"
          style={{ borderColor: C.border }}
        >
          <div className="pr-6 min-w-0">
            <div className="text-sm font-semibold" style={{ color: C.navy }}>
              Extension prompt times
            </div>
            <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
              Add one or more reminder times. These drive extension prompt alarms.
            </div>
          </div>
          <div className="w-[220px] space-y-2">
            {timeSlots.map((slot, idx) => (
              <div key={`slot-${idx}`} className="flex items-center gap-2">
                <input
                  type="time"
                  value={slot}
                  onChange={(e) => updateTimeSlot(idx, e.target.value)}
                  className="h-9 w-full px-2 rounded border text-sm bg-[#F4F5F7] focus:bg-white outline-none"
                  style={{ borderColor: C.border, color: C.navy }}
                />
                <button
                  type="button"
                  onClick={() => removeTimeSlot(idx)}
                  disabled={timeSlots.length <= 1}
                  className="h-9 w-9 rounded border inline-flex items-center justify-center disabled:opacity-50"
                  style={{ borderColor: C.border, color: C.slate }}
                  title="Remove time"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTimeSlot}
              className="h-8 px-2.5 rounded border inline-flex items-center gap-1 text-xs font-semibold"
              style={{ borderColor: C.border, color: C.primary }}
            >
              <Plus size={12} />
              Add time slot
            </button>
          </div>
        </div>
        <SettingRow
          title="Weekdays only"
          desc="Only trigger reminders Monday through Friday."
          right={
            <Toggle
              on={weekdaysOnly}
              onChange={(v) => {
                setWeekdaysOnly(v);
                persist({ extensionWeekdaysOnly: v });
              }}
            />
          }
        />
        <div
          className="flex items-center justify-between py-3 border-b last:border-b-0"
          style={{ borderColor: C.border }}
        >
          <div className="pr-6 min-w-0">
            <div className="text-sm font-semibold" style={{ color: C.navy }}>
              Snooze duration
            </div>
            <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
              One-time snooze window for each prompt event.
            </div>
          </div>
          <div className="w-[120px]">
            <select
              value={String(snoozeMinutes)}
              onChange={(e) => {
                const next = Number(e.target.value);
                setSnoozeMinutes(next);
                persist({ extensionSnoozeMinutes: next });
              }}
              className="h-9 w-full px-2 rounded border text-sm bg-[#F4F5F7] focus:bg-white outline-none"
              style={{ borderColor: C.border, color: C.navy }}
            >
              {[5, 10, 15, 20, 30, 45, 60].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
          </div>
        </div>
        <SettingRow
          title="Prompt timezone label"
          desc="Shown in the extension header and synced to reminder config."
          right={
            <input
              value={timezone}
              onChange={(e) => {
                const next = e.target.value || "GMT";
                setTimezone(next);
                persist({ extensionTimezone: next });
              }}
              placeholder="GMT"
              className="h-9 w-[120px] px-2 rounded border text-sm bg-[#F4F5F7] focus:bg-white outline-none"
              style={{ borderColor: C.border, color: C.navy }}
            />
          }
        />
      </div>
    </Card>
  );
}

function ExtensionSettings() {
  const { userId } = useAuth();
  const settingsUserId = userId ?? "";
  const { data: settings } = useSettingsQuery(settingsUserId);
  const saveIntegrationsMutation = useSaveIntegrations(settingsUserId);
  const [auto, setAuto] = useState(true);
  const [jira, setJira] = useState(true);
  const [github, setGithub] = useState(true);
  const [bitbucket, setBitbucket] = useState(false);
  const [slack, setSlack] = useState(false);
  const [teams, setTeams] = useState(false);
  const [confluence, setConfluence] = useState(false);
  const [notion, setNotion] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setAuto(settings.integrations.autoCaptureEvents);
    setJira(settings.integrations.jira);
    setGithub(settings.integrations.github);
    setBitbucket(settings.integrations.bitbucket);
    setSlack(settings.integrations.slack);
    setTeams(settings.integrations.teams);
    setConfluence(settings.integrations.confluence);
    setNotion(settings.integrations.notion);
  }, [settings]);

  function persist(next: Partial<IntegrationPrefs>) {
    if (!settings) return;
    const integrations = { ...settings.integrations, ...next };
    saveIntegrationsMutation.mutate(integrations);
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionHeader title="Extension Preferences" sub="Capture sources and trigger windows" />
        <div className="mt-3">
          <SettingRow
            title="Auto-capture events"
            desc="Surface a capture prompt when work is completed."
            right={
              <Toggle
                on={auto}
                onChange={(v) => {
                  setAuto(v);
                  persist({ autoCaptureEvents: v });
                }}
              />
            }
          />
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeader
          title="Development & Issue Tracking"
          sub="Capture merged PRs, code reviews, and ticket transitions."
        />
        <div className="mt-3">
          <IntegrationRow
            icon={<ListTodo size={16} />}
            iconBg="#DEEBFF"
            iconColor="#0052CC"
            title="Jira"
            desc="Trigger when a ticket moves to Done."
            on={jira}
            onChange={(v) => {
              setJira(v);
              persist({ jira: v });
            }}
          />
          <IntegrationRow
            icon={<Github size={16} />}
            iconBg="#F4F5F7"
            iconColor="#172B4D"
            title="GitHub"
            desc="Trigger when a PR is merged with you as author or reviewer."
            on={github}
            onChange={(v) => {
              setGithub(v);
              persist({ github: v });
            }}
          />
          <IntegrationRow
            icon={<GitBranch size={16} />}
            iconBg="#DEEBFF"
            iconColor="#0052CC"
            title="Bitbucket"
            desc="Capture merged pull requests and code reviews."
            on={bitbucket}
            onChange={(v) => {
              setBitbucket(v);
              persist({ bitbucket: v });
            }}
          />
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeader
          title="Communication"
          sub="Capture saved conversations, recaps, and channel highlights."
        />
        <div className="mt-3">
          <IntegrationRow
            icon={<Slack size={16} />}
            iconBg="#F4ECFB"
            iconColor="#5243AA"
            title="Slack"
            desc="Capture saved messages and channel threads tagged with #wins."
            on={slack}
            onChange={(v) => {
              setSlack(v);
              persist({ slack: v });
            }}
          />
          <IntegrationRow
            icon={<MessageSquare size={16} />}
            iconBg="#E6F0FF"
            iconColor="#4B53BC"
            title="Microsoft Teams"
            desc="Capture meeting recaps and team channel mentions."
            on={teams}
            onChange={(v) => {
              setTeams(v);
              persist({ teams: v });
            }}
          />
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeader
          title="Documentation"
          sub="Capture docs, pages, and knowledge base contributions."
        />
        <div className="mt-3">
          <IntegrationRow
            icon={<BookOpen size={16} />}
            iconBg="#DEEBFF"
            iconColor="#0052CC"
            title="Confluence"
            desc="Capture pages you author, edit, or get tagged in."
            on={confluence}
            onChange={(v) => {
              setConfluence(v);
              persist({ confluence: v });
            }}
          />
          <IntegrationRow
            icon={<Notebook size={16} />}
            iconBg="#F4F5F7"
            iconColor="#172B4D"
            title="Notion"
            desc="Capture databases and docs you contribute to."
            on={notion}
            onChange={(v) => {
              setNotion(v);
              persist({ notion: v });
            }}
          />
        </div>
      </Card>
    </div>
  );
}

function IntegrationRow({
  icon,
  iconBg,
  iconColor,
  title,
  desc,
  on,
  onChange,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b last:border-b-0"
      style={{ borderColor: C.border }}
    >
      <div className="flex items-center gap-3 pr-6 min-w-0">
        <div
          className="w-9 h-9 rounded flex items-center justify-center shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold" style={{ color: C.navy }}>
            {title}
          </div>
          <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
            {desc}
          </div>
        </div>
      </div>
      <Toggle on={on} onChange={() => onChange(!on)} />
    </div>
  );
}

function FrameworkSettings() {
  const { userId } = useAuth();
  const frameworkUserId = userId ?? "";
  const { data: activeFramework } = useFrameworkQuery(frameworkUserId);
  const uploadFrameworkMutation = useUploadFramework(frameworkUserId);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  function handleFile(file: File) {
    const name = file.name.toLowerCase();
    const validExt =
      name.endsWith(".json") ||
      name.endsWith(".csv") ||
      name.endsWith(".pdf") ||
      name.endsWith(".xlsx");
    if (!validExt) {
      toast.error("Unsupported file type. Use .CSV, .JSON, .PDF, or .XLSX.");
      return;
    }
    setMismatch(false);
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      // Mock validation: treat PDFs as "unrelatable" to demonstrate mismatch
      const looksUnrelatable = name.endsWith(".pdf");
      if (looksUnrelatable) {
        setMismatch(true);
        return;
      }
      const frameworkId = generateSafeId();
      const frameworkName = file.name.replace(/\.(json|csv|pdf|xlsx)$/i, "");
      uploadFrameworkMutation.mutate(
        {
          framework: {
            id: frameworkId,
            user_id: frameworkUserId,
            name: frameworkName,
            version: "1.0",
            is_active: true,
          },
          categories: COMPETENCIES.map((name, idx) => ({
            id: generateSafeId(),
            framework_id: frameworkId,
            user_id: frameworkUserId,
            name,
            weight: 1,
            questions: SUBCATEGORIES[name] ?? [],
            sort_order: idx,
          })),
        },
        {
          onSuccess: () => {
            toast.success("Framework successfully updated.");
          },
        },
      );
    }, 1000);
  }

  function downloadTemplate() {
    const sample = {
      version: "1.0",
      categories: COMPETENCIES.map((name) => ({
        name,
        weight: 1,
        questions: ["Example signal 1", "Example signal 2"],
      })),
    };
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evitrace-framework-template.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="p-6">
      <SectionHeader
        title="Competency Framework"
        sub="Upload a custom schema or use the default 8-axis matrix"
      />

      {/* Upload zone */}
      <div
        onClick={() => !parsing && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`mt-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors px-6 py-8 flex flex-col items-center justify-center text-center ${
          dragOver ? "bg-[#DEEBFF]" : "hover:bg-slate-50"
        }`}
        style={{ borderColor: dragOver ? C.primary : "#C1C7D0" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json,.csv,.pdf,.xlsx,application/json,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        {parsing ? (
          <>
            <Loader2 size={28} className="animate-spin" style={{ color: C.primary }} />
            <div className="mt-3 text-sm font-semibold" style={{ color: C.navy }}>
              Parsing framework…
            </div>
          </>
        ) : (
          <>
            <CloudUpload size={32} style={{ color: C.primary }} />
            <div className="mt-2 text-sm font-semibold" style={{ color: C.navy }}>
              Drag and drop your framework file here
            </div>
            <div className="text-xs mt-1" style={{ color: C.subtle }}>
              Supports .CSV, .JSON, .PDF, or .XLSX
            </div>
          </>
        )}
      </div>

      {mismatch && (
        <div
          className="mt-4 p-4 rounded border flex gap-3"
          style={{ borderColor: "#FFC400", background: "#FFFBE6" }}
        >
          <AlertTriangle size={18} style={{ color: "#FF8B00" }} className="shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold" style={{ color: C.navy }}>
              Format Mismatch: We couldn't automatically map your framework.
            </div>
            <div className="text-xs mt-1" style={{ color: C.slate }}>
              Please adapt your framework to match our standard 8-axis category format for a
              seamless override.
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <GhostBtn onClick={downloadTemplate}>
                <Download size={14} />
                Download Standard Template
              </GhostBtn>
              <GhostBtn onClick={() => setMismatch(false)}>Dismiss</GhostBtn>
            </div>
          </div>
        </div>
      )}

      {activeFramework && (
        <div
          className="mt-4 p-3 rounded border flex items-center justify-between"
          style={{ borderColor: C.border, background: "#FAFBFC" }}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle size={16} style={{ color: C.green }} />
            <div>
              <div className="text-xs uppercase tracking-wider" style={{ color: C.subtle }}>
                Active Framework
              </div>
              <div className="text-sm font-semibold" style={{ color: C.navy }}>
                {activeFramework.name} - {activeFramework.competency_categories?.length ?? 0}{" "}
                Categories
              </div>
            </div>
          </div>
          <Badge tone="success">Active</Badge>
        </div>
      )}

      <div
        className="mt-6 text-xs font-semibold uppercase tracking-wider"
        style={{ color: C.subtle }}
      >
        Current Competency Axes
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {COMPETENCIES.map((c) => (
          <div
            key={c}
            className="flex items-center justify-between px-3 py-2.5 rounded border"
            style={{ borderColor: C.border }}
          >
            <div className="flex items-center gap-2">
              <Layers size={14} style={{ color: C.primary }} />
              <span className="text-sm font-semibold" style={{ color: C.navy }}>
                {c}
              </span>
            </div>
            <Badge tone="neutral">Active</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================================================ */
/*        OVERLAY: EVIDENCE DETAILS SLIDE-OVER                  */
/* ============================================================ */

function EvidenceSlideover({
  item,
  onClose,
  onSave,
  onArchive,
}: {
  item: EvidenceItem;
  onClose: () => void;
  onSave: (updated: EvidenceItem) => void;
  onArchive: (id: string) => void;
}) {
  const [draft, setDraft] = useState<EvidenceItem>(item);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const objectiveLinked = item.source === "Objective" || Boolean(item.linkageKey);
  const dirty = !objectiveLinked && JSON.stringify(draft) !== JSON.stringify(item);
  const update = <K extends keyof EvidenceItem>(k: K, v: EvidenceItem[K]) =>
    setDraft((d) => (objectiveLinked ? d : { ...d, [k]: v }));
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50"
      style={{ background: "rgba(9, 30, 66, 0.45)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 right-0 h-full w-full md:w-[44%] bg-white shadow-2xl flex flex-col overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs" style={{ color: C.subtle }}>
              <span>Evidence Log</span>
              <ChevronRight size={12} />
              <span
                className="font-semibold truncate max-w-[220px] md:max-w-[320px]"
                style={{ color: C.slate }}
                title={item.title}
              >
                {item.title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConfirmArchive(true)}
                className="p-1.5 rounded hover:bg-[#FFEBE6]"
                style={{ color: C.slate }}
                title="Archive evidence"
              >
                <Archive size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-[#F4F5F7] ml-1"
                style={{ color: C.slate }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          {objectiveLinked ? (
            <div className="text-xl font-bold mt-2 leading-snug" style={{ color: C.navy }}>
              {draft.title}
            </div>
          ) : (
            <input
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              className="text-xl font-bold mt-2 leading-snug w-full bg-transparent outline-none border border-transparent hover:border-[#DFE1E6] focus:border-[#0052CC] focus:bg-white rounded px-1 -mx-1 py-0.5"
              style={{ color: C.navy }}
            />
          )}
          <div
            className="flex flex-wrap items-center gap-2 mt-3 text-xs"
            style={{ color: C.subtle }}
          >
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {formatDisplayDate(item.date)}
            </span>
            <SourceChip source={draft.source} />
            {draft.status === "Reviewed" ? (
              <Badge tone="success" icon={<CheckCircle size={11} />}>
                Reviewed
              </Badge>
            ) : (
              <Badge tone="warning" icon={<Clock size={11} />}>
                Pending Review
              </Badge>
            )}
            <MatchBadge match={draft.matchState} />
          </div>
          {objectiveLinked && (
            <div className="text-[11px] mt-2" style={{ color: C.subtle }}>
              Logged from Objectives. Edit this objective in the Objectives board.
            </div>
          )}
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-8">
          <section>
            <div
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: C.subtle }}
            >
              Competency Mapping
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Category
                </div>
                <Dropdown
                  value={PDF_CATEGORIES.includes(draft.category) ? draft.category : ""}
                  options={PDF_CATEGORIES}
                  placeholder="Select a competency category…"
                  onChange={(nextCat) => {
                    update("category", nextCat);
                    // Reset subcategory to the first question under the new category
                    const firstSub = PDF_FRAMEWORK[nextCat]?.[0] ?? "";
                    update("competency", firstSub);
                  }}
                  disabled={objectiveLinked}
                />
              </div>
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Subcategory / Question
                </div>
                <Dropdown
                  value={
                    (PDF_FRAMEWORK[draft.category] ?? []).includes(draft.competency)
                      ? draft.competency
                      : ""
                  }
                  options={PDF_FRAMEWORK[draft.category] ?? []}
                  placeholder={
                    PDF_CATEGORIES.includes(draft.category)
                      ? "Select a subcategory / question…"
                      : "Pick a category first"
                  }
                  onChange={(val) => update("competency", val)}
                  disabled={objectiveLinked || !PDF_CATEGORIES.includes(draft.category)}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Description & Reflection
              </div>
            </div>
            <textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full min-h-[160px] resize-y text-sm rounded border px-3 py-2 outline-none focus:ring-2"
              style={{ borderColor: C.border, color: C.slate, overflowWrap: "anywhere" }}
              readOnly={objectiveLinked}
            />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Links & Artifacts
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Source
                </div>
                {objectiveLinked ? (
                  <Input value={draft.source} readOnly />
                ) : (
                  <Select value={draft.source} onChange={(e) => update("source", e.target.value)}>
                    {[
                      "Bitbucket",
                      "GitHub",
                      "GitLab",
                      "Jira",
                      "Slack",
                      "Teams",
                      "Confluence",
                      "Figma",
                      "Trello",
                      "Excel",
                      "PowerPoint",
                      "Word",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                )}
              </div>
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Link
                </div>
                <div className="flex gap-2">
                  <Input
                    value={draft.link}
                    onChange={(e) => update("link", e.target.value)}
                    placeholder="example.com/path or full URL"
                    icon={<LinkIcon size={14} />}
                    readOnly={objectiveLinked}
                  />
                  {draft.link && (
                    <GhostBtn
                      onClick={() => {
                        const u = /^https?:\/\//i.test(draft.link)
                          ? draft.link
                          : `https://${draft.link}`;
                        window.open(u, "_blank", "noopener");
                      }}
                    >
                      <ExternalLink size={12} /> Open
                    </GhostBtn>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Manager Review
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Review Status
                </div>
                <Select
                  value={draft.status}
                  onChange={(e) => update("status", e.target.value as EvidenceStatus)}
                  disabled={objectiveLinked}
                >
                  <option>Pending Review</option>
                  <option>Reviewed</option>
                </Select>
              </div>
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Competency Match
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["Yes", "Somewhat", "No", "Unset"] as EvidenceMatch[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => update("matchState", m)}
                      disabled={objectiveLinked}
                      className="px-2 py-1.5 rounded border text-xs font-semibold transition-colors"
                      style={{
                        borderColor: draft.matchState === m ? C.primary : C.border,
                        background: draft.matchState === m ? C.primarySoft : "#fff",
                        color: draft.matchState === m ? C.primary : C.slate,
                      }}
                    >
                      {m === "Unset" ? "Not Set" : m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: C.subtle }}
              >
                Manager Assessment
              </div>
              <textarea
                value={draft.managerNotes}
                onChange={(e) => update("managerNotes", e.target.value)}
                placeholder="Manager corroborates context, asks for more detail, suggests rewording, or links related artifacts."
                className="w-full min-h-[120px] resize-y text-sm rounded border px-3 py-2 outline-none focus:ring-2"
                style={{
                  borderColor: C.border,
                  color: C.slate,
                  background: "#fff",
                  overflowWrap: "anywhere",
                }}
                readOnly={objectiveLinked}
              />
            </div>
          </section>
        </div>

        <div
          className="px-6 py-4 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <GhostBtn onClick={onClose}>Close</GhostBtn>
          {!objectiveLinked && (
            <PrimaryBtn
              onClick={() => {
                onSave(draft);
              }}
              disabled={!dirty}
            >
              <Save size={14} />
              Save Changes
            </PrimaryBtn>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {confirmArchive && (
          <ConfirmDialog
            title="Archive this evidence?"
            description="Archiving removes the item from the active log. You can restore or permanently delete it from the View Archived tab."
            confirmLabel="Archive"
            onCancel={() => setConfirmArchive(false)}
            onConfirm={() => {
              setConfirmArchive(false);
              onArchive(item.id);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================================================ */
/*                    REPORT VIEW                               */
/* ============================================================ */

function ReportView({
  evidence,
  objectives,
  radarData: _radarData,
  onFlash,
  review,
  assessments,
  historyAssessments,
  onOpenAssessment,
  onSaveTopics,
  onDeleteHistoryAssessment,
  onClearReview,
  onStartReview,
  onOpenHistory,
}: {
  evidence: EvidenceRecord[];
  objectives: Objective[];
  radarData: ReturnType<typeof deriveRadarData>;
  onFlash: (m: string) => void;
  review: ReviewSession | null;
  assessments: Assessment[];
  historyAssessments: Assessment[];
  onOpenAssessment: (a: Assessment) => void;
  onSaveTopics: (assessmentId: string, topics: string[]) => void;
  onDeleteHistoryAssessment: (assessmentId: string) => void;
  onClearReview: () => void;
  onStartReview: () => void;
  onOpenHistory: () => void;
}) {
  const approved = evidence.filter((e) => e.status === "Reviewed" && !e.isArchived);
  const completed = objectives.filter((o) => o.status === "Completed");
  const upcoming = objectives.filter((o) => o.status !== "Completed");

  // Build deltas / justification log strictly from the wizard-captured review.
  const deltas = useMemo(() => {
    if (!review) return [] as { name: string; from: number; to: number }[];
    return Object.entries(review.scores)
      .map(([cat, subs]) => {
        const entries = Object.values(subs);
        if (entries.length === 0) return null;
        const from = +(entries.reduce((s, q) => s + q.prev, 0) / entries.length).toFixed(2);
        const to = +(entries.reduce((s, q) => s + q.next, 0) / entries.length).toFixed(2);
        return { name: cat, from, to };
      })
      .filter((d): d is { name: string; from: number; to: number } => !!d && d.to !== d.from);
  }, [review]);

  const justification = useMemo(() => {
    if (!review) return [] as { cat: string; sub: string; q: ReviewQuestion }[];
    const out: { cat: string; sub: string; q: ReviewQuestion }[] = [];
    Object.entries(review.scores).forEach(([cat, subs]) => {
      Object.entries(subs).forEach(([sub, q]) => {
        if (q.next !== q.prev && q.notes.trim().length > 0) out.push({ cat, sub, q });
      });
    });
    return out;
  }, [review]);

  const highlightedEvidence = useMemo(() => {
    if (!review) return [] as typeof approved;
    const ids = new Set<string>();
    Object.values(review.scores).forEach((subs) =>
      Object.values(subs).forEach((q) => q.evidenceIds.forEach((id) => ids.add(id))),
    );
    return evidence.filter((e) => ids.has(e.id)).slice(0, 3);
  }, [review, evidence]);

  const overallReadiness = useMemo(() => {
    if (!review) return null;
    const all = Object.values(review.scores).flatMap((s) => Object.values(s));
    if (all.length === 0) return null;
    const avg = all.reduce((s, q) => s + q.next, 0) / all.length;
    return Math.round((avg / 4) * 100);
  }, [review]);

  const topStrengths = useMemo(
    () =>
      [...deltas]
        .sort((a, b) => b.to - a.to)
        .slice(0, 2)
        .map((d) => d.name),
    [deltas],
  );
  const primaryGaps = useMemo(
    () =>
      [...deltas]
        .sort((a, b) => a.to - b.to)
        .slice(0, 2)
        .map((d) => d.name),
    [deltas],
  );

  const [topics, setTopics] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [topicsDirty, setTopicsDirty] = useState(false);
  const isPersistedAssessment = useMemo(
    () => (review ? assessments.some((item) => item.id === review.id) : false),
    [assessments, review],
  );

  useEffect(() => {
    if (!review) return;
    const selected = assessments.find((a) => a.id === review.id);
    setTopics(selected?.oneOnOneTopics ?? []);
    setTopicsDirty(false);
  }, [review, assessments]);

  type LearningResource = {
    id: string;
    competency: string;
    title: string;
    url: string;
    notes: string;
  };
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);

  function addTopic() {
    const t = draft.trim();
    if (!t) return;
    setTopics((x) => [...x, t]);
    setTopicsDirty(true);
    setDraft("");
  }

  function removeTopic(i: number) {
    setTopics((x) => x.filter((_, idx) => idx !== i));
    setTopicsDirty(true);
  }

  function copyLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href + "?report=q3-2026").catch(() => {});
    }
    onFlash("Share link copied to clipboard");
  }

  function exportPdf() {
    if (typeof window !== "undefined") window.print();
  }

  // Empty state when no review has been finalized
  if (!review) {
    return (
      <div className="space-y-6">
        {/* Action Hub bar */}
        <div className="flex items-center justify-between print-hide">
          <div className="text-sm" style={{ color: C.subtle }}>
            Archive of all performance assessments. Click any row to load its full report.
          </div>
          <div className="flex items-center gap-2">
            <GhostBtn onClick={onOpenHistory}>
              <History size={14} />
              Open in modal
            </GhostBtn>
            <PrimaryBtn onClick={onStartReview} className="!px-6 !h-10 whitespace-nowrap">
              <ClipboardList size={14} />
              Start Performance Review
            </PrimaryBtn>
          </div>
        </div>

        <AssessmentsArchiveTable
          assessments={historyAssessments}
          onOpen={onOpenAssessment}
          onDelete={onDeleteHistoryAssessment}
        />

        {historyAssessments.length === 0 && (
          <Card className="p-10 text-center max-w-2xl mx-auto">
            <div
              className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ background: C.primarySoft, color: C.primary }}
            >
              <FileCheck2 size={26} />
            </div>
            <h3 className="text-lg font-bold tracking-tight" style={{ color: C.navy }}>
              No finalized performance review yet
            </h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: C.slate }}>
              Click "Start Performance Review" above to launch the wizard. Once finalized, this page
              auto-generates a shareable summary with the competency delta, justification notes,
              highlighted evidence, and a 1-on-1 talking points checklist.
            </p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Action Hub bar */}
      <div className="flex items-center justify-between mb-6 print-hide gap-3">
        <GhostBtn onClick={onClearReview} className="-ml-2">
          <ArrowLeft size={14} />
          Back to Assessments Archive
        </GhostBtn>
        <PrimaryBtn onClick={onStartReview} className="!px-6 !h-10 whitespace-nowrap">
          <ClipboardList size={14} />
          Start Performance Review
        </PrimaryBtn>
      </div>

      {/* Document */}
      <article
        className="max-w-4xl mx-auto bg-white border rounded shadow-md p-10 print-document print:w-full print:m-0 print:p-0 print:text-slate-900 print:border-slate-200"
        style={{ borderColor: C.border }}
      >
        {/* 1. Header */}
        <header className="print:break-inside-avoid">
          <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                style={{ background: C.primary }}
              >
                <RadarIcon size={18} color="#fff" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: C.navy }}>
                {review.period}
              </h1>
            </div>
            <div className="flex items-center gap-2 print-hide">
              <GhostBtn onClick={copyLink} className="border">
                <LinkIcon size={14} />
                Copy Share Link
              </GhostBtn>
              <GhostBtn onClick={() => window.print()} className="border">
                <Download size={14} />
                Export to PDF
              </GhostBtn>
            </div>
          </div>
          <div className="text-sm font-semibold mb-1" style={{ color: C.subtle }}>
            Evitrace Performance Report
          </div>
          <div className="mt-3 space-y-1 text-sm" style={{ color: C.slate }}>
            <div>
              Engineer: <span style={{ color: C.navy, fontWeight: 600 }}>{review.engineer}</span>
              {"  |  "}Role: L3 Engineer{"  |  "}Target: L4 Senior Engineer
            </div>
            <div>
              Manager: <span style={{ color: C.navy, fontWeight: 600 }}>{review.manager}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} style={{ color: C.subtle }} />
              Period: {review.period} · Finalized {review.date}
            </div>
          </div>
          <div className="mt-6 border-t" style={{ borderColor: C.border }} />
        </header>

        {/* 2. Executive summary */}
        <section className="mt-8 print:break-inside-avoid">
          <SectionHeading icon={<Target size={18} />} title="Executive Summary" />
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: C.slate }}>
            Engineer <span style={{ color: C.navy, fontWeight: 600 }}>{review.engineer}</span> is
            currently tracking at{" "}
            <span style={{ color: C.primary, fontWeight: 700 }}>{overallReadiness ?? 0}%</span>{" "}
            overall readiness for the L4 Senior target. Demonstrates exceptional proficiency in{" "}
            <span style={{ color: C.navy, fontWeight: 600 }}>
              {topStrengths.length > 0
                ? topStrengths.join(" and ")
                : "Analytical Thinking and Code Quality"}
            </span>
            . Primary growth opportunities exist in{" "}
            <span style={{ color: C.navy, fontWeight: 600 }}>
              {primaryGaps.length > 0 ? primaryGaps.join(" and ") : "System Design and Leadership"}
            </span>
            , requiring targeted focus in the upcoming cycle to bridge the remaining gaps. Verified
            evidence log: {approved.length} item{approved.length === 1 ? "" : "s"}.
          </p>
        </section>

        {/* 3. Competency delta */}
        <section className="mt-10 print:break-inside-avoid">
          <SectionHeading icon={<TrendingUp size={18} />} title="Competency Delta" />
          {deltas.length === 0 ? (
            <div
              className="mt-3 text-sm p-4 rounded border border-dashed"
              style={{ color: C.subtle, borderColor: C.border }}
            >
              No score changes were recorded in this review.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 print:break-inside-avoid">
              {deltas.map((d) => {
                const pct = d.from === 0 ? 0 : Math.round(((d.to - d.from) / d.from) * 100);
                const width = Math.min(100, (d.to / 4) * 100);
                const positive = d.to >= d.from;
                return (
                  <div key={d.name} className="print:break-inside-avoid">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="text-sm font-semibold" style={{ color: C.navy }}>
                        {d.name}
                      </div>
                      <div className="text-xs font-medium" style={{ color: C.slate }}>
                        {d.from.toFixed(2)} → {d.to.toFixed(2)}{" "}
                        <span style={{ color: positive ? C.green : C.red, fontWeight: 700 }}>
                          {positive ? "+" : ""}
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "#EBECF0" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${width}%`, background: positive ? C.green : C.red }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. Justification notes log */}
        <section className="mt-10 print:break-before-page print:break-inside-avoid">
          <SectionHeading icon={<AlignLeft size={18} />} title="Justification Notes Log" />
          {justification.length === 0 ? (
            <div
              className="mt-3 text-sm p-4 rounded border border-dashed"
              style={{ color: C.subtle, borderColor: C.border }}
            >
              No justification notes were attached to changed scores.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {justification.map(({ cat, sub, q }, i) => (
                <li
                  key={i}
                  className="p-4 rounded border print:break-inside-avoid"
                  style={{ borderColor: C.border, background: "#FFFFFF" }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="info">{cat}</Badge>
                    <span className="text-xs font-semibold" style={{ color: C.navy }}>
                      {sub}
                    </span>
                    <span className="text-xs" style={{ color: C.subtle }}>
                      {q.prev} → {q.next}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: C.slate }}>
                    {q.notes}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 5. Highlighted evidence */}
        <section className="mt-10 print:break-inside-avoid">
          <SectionHeading icon={<Award size={18} />} title="Highlighted Evidence" />
          {highlightedEvidence.length === 0 ? (
            <div
              className="mt-3 text-sm p-4 rounded border border-dashed"
              style={{ color: C.subtle, borderColor: C.border }}
            >
              No evidence was attached during the review.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {highlightedEvidence.map((e) => (
                <div
                  key={e.id}
                  className="border-l-4 pl-4 py-3 pr-4 rounded-sm print:break-inside-avoid"
                  style={{ borderColor: C.primary, background: "#FAFBFC" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[15px] font-bold" style={{ color: C.navy }}>
                      {e.title}
                    </div>
                    <Badge tone="info">{e.competency}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.slate }}>
                    {e.description}
                  </p>
                  <div
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: "#006644" }}
                  >
                    <CheckCircle size={13} />
                    Verified on {formatDisplayDate(e.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. Suggested Learning Resources */}
        <section className="mt-10 print:break-inside-avoid">
          <div className="flex items-start justify-between gap-3">
            <SectionHeading icon={<BookOpen size={18} />} title="Suggested Learning Resources" />
            <GhostBtn
              onClick={() => setResourceModalOpen(true)}
              className="border print-hide"
              style={{ borderColor: C.border }}
            >
              <Plus size={14} />
              Add Learning Resource
            </GhostBtn>
          </div>
          <p className="mt-2 text-sm" style={{ color: C.subtle }}>
            Resources curated by the manager to address competencies rated below target.
          </p>
          {resources.length === 0 ? (
            <div
              className="mt-4 text-sm p-4 rounded border border-dashed"
              style={{ color: C.subtle, borderColor: C.border }}
            >
              No learning resources added yet. Click "Add Learning Resource" to curate materials for
              the engineer.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {resources.map((r) => (
                <li
                  key={r.id}
                  className="p-4 rounded border flex items-start justify-between gap-4 print:break-inside-avoid"
                  style={{ borderColor: C.border, background: "#FFFFFF" }}
                >
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap h-fit"
                      style={{ background: C.primarySoft, color: C.primary }}
                    >
                      {r.competency}
                    </span>
                    <div className="mt-2 text-[15px] font-bold text-slate-900">{r.title}</div>
                    {r.notes && (
                      <div className="mt-1 text-sm text-slate-500 leading-relaxed">{r.notes}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 print-hide">
                    <button
                      type="button"
                      onClick={() => window.open(r.url, "_blank")}
                      className="inline-flex items-center gap-1.5 px-3 h-9 text-sm font-semibold rounded border transition-colors hover:bg-[#F4F5F7]"
                      style={{ borderColor: C.primary, color: C.primary }}
                    >
                      <ExternalLink size={14} />
                      Open Resource
                    </button>
                    <button
                      type="button"
                      onClick={() => setResources((rs) => rs.filter((x) => x.id !== r.id))}
                      aria-label="Remove resource"
                      className="w-9 h-9 inline-flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-[#F4F5F7] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 7. Objectives */}
        <section className="mt-10 print:break-inside-avoid">
          <SectionHeading icon={<ListTodo size={18} />} title="Active Objectives" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ObjectiveColumn
              label="Completed This Period"
              tone="success"
              items={completed}
              emptyText="No objectives completed this period."
            />
            <ObjectiveColumn
              label="Focus for Next Period"
              tone="info"
              items={upcoming}
              emptyText="No active objectives planned."
            />
          </div>
        </section>

        {/* 7. Talking points */}
        <section className="mt-10 print:break-inside-avoid">
          <SectionHeading icon={<MessageSquare size={18} />} title="1-on-1 Discussion Topics" />
          <div
            className="mt-4 p-5 rounded border print:break-inside-avoid"
            style={{ background: C.bg, borderColor: C.border }}
          >
            <ol className="space-y-2.5">
              {topics.map((t, i) => (
                <li
                  key={i}
                  className="group flex items-start gap-3 text-sm print:break-inside-avoid"
                  style={{ color: C.slate }}
                >
                  <span
                    className="shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center"
                    style={{ background: C.primarySoft, color: C.primary }}
                  >
                    {i + 1}
                  </span>
                  <span className="leading-relaxed flex-1">{t}</span>
                  <button
                    onClick={() => removeTopic(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: C.subtle }}
                    aria-label="Remove topic"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTopic();
                }}
                placeholder="Add a discussion topic..."
                className="flex-1 h-9 px-3 text-sm rounded border bg-white focus:outline-none"
                style={{ borderColor: C.border, color: C.navy }}
              />
              <GhostBtn onClick={addTopic}>
                <Plus size={14} />
                Add Topic
              </GhostBtn>
              <PrimaryBtn
                disabled={!topicsDirty || !isPersistedAssessment}
                onClick={() => {
                  if (!review || !isPersistedAssessment) return;
                  onSaveTopics(review.id, topics);
                  setTopicsDirty(false);
                }}
              >
                <Save size={14} />
                Save Topics
              </PrimaryBtn>
            </div>
            {!isPersistedAssessment && review && (
              <div className="mt-2 text-xs" style={{ color: C.subtle }}>
                Sample assessments are read-only. Finalize a live assessment to persist 1-on-1 topics.
              </div>
            )}
          </div>
        </section>

        <footer
          className="mt-10 pt-6 border-t text-xs flex items-center justify-between"
          style={{ borderColor: C.border, color: C.subtle }}
        >
          <span>Generated by Evitrace · Confidential</span>
          <span>Report ID · {review.id}</span>
        </footer>
      </article>
      <AnimatePresence>
        {resourceModalOpen && (
          <LearningResourceModal
            competencies={Object.keys(review.scores)}
            onCancel={() => setResourceModalOpen(false)}
            onSave={(r) => {
              setResources((rs) => [...rs, { ...r, id: `lr-${Date.now()}` }]);
              setResourceModalOpen(false);
              onFlash("Learning resource added");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LearningResourceModal({
  competencies,
  onCancel,
  onSave,
}: {
  competencies: string[];
  onCancel: () => void;
  onSave: (r: { competency: string; title: string; url: string; notes: string }) => void;
}) {
  const fallback = COMPETENCIES;
  const options = competencies.length > 0 ? competencies : fallback;
  const [competency, setCompetency] = useState(options[0] ?? "");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const canSave = title.trim() && url.trim() && competency;
  return (
    <Backdrop onClose={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b" style={{ borderColor: C.border }}>
          <div className="text-base font-bold" style={{ color: C.navy }}>
            Add Learning Resource
          </div>
          <div className="text-sm mt-1" style={{ color: C.slate }}>
            Curate a resource to help close the gap on a target competency.
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Target Competency
            </label>
            <select
              value={competency}
              onChange={(e) => setCompetency(e.target.value)}
              className="mt-1.5 w-full h-10 px-3 text-sm rounded border bg-white focus:outline-none"
              style={{ borderColor: C.border, color: C.navy }}
            >
              {options.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Resource Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Designing Data-Intensive Applications"
              className="mt-1.5 w-full h-10 px-3 text-sm rounded border bg-white focus:outline-none"
              style={{ borderColor: C.border, color: C.navy }}
            />
          </div>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Resource URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1.5 w-full h-10 px-3 text-sm rounded border bg-white focus:outline-none"
              style={{ borderColor: C.border, color: C.navy }}
            />
          </div>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: C.subtle }}
            >
              Manager Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this resource, and what to focus on..."
              className="mt-1.5 w-full min-h-[80px] px-3 py-2 text-sm rounded border bg-white focus:outline-none resize-y"
              style={{ borderColor: C.border, color: C.navy }}
            />
          </div>
        </div>
        <div
          className="px-5 py-3 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
          <button
            onClick={() =>
              canSave &&
              onSave({ competency, title: title.trim(), url: url.trim(), notes: notes.trim() })
            }
            disabled={!canSave}
            className="px-4 h-9 rounded text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: C.primary }}
          >
            Save Resource
          </button>
        </div>
      </motion.div>
    </Backdrop>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: C.primary }}>{icon}</span>
      <h2 className="text-lg font-bold tracking-tight" style={{ color: C.navy }}>
        {title}
      </h2>
    </div>
  );
}

function ObjectiveColumn({
  label,
  tone,
  items,
  emptyText,
}: {
  label: string;
  tone: "success" | "info";
  items: Objective[];
  emptyText: string;
}) {
  return (
    <div>
      <div
        className="text-[11px] font-bold uppercase tracking-wider mb-2"
        style={{ color: C.subtle }}
      >
        {label}
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <div
            className="text-sm p-3 rounded border border-dashed"
            style={{ color: C.subtle, borderColor: C.border }}
          >
            {emptyText}
          </div>
        )}
        {items.map((o) => (
          <div
            key={o.id}
            className="p-3 rounded border print:break-inside-avoid"
            style={{ borderColor: C.border, background: "#FFFFFF" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold leading-snug" style={{ color: C.navy }}>
                {o.title}
              </div>
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap h-fit shrink-0"
                style={{
                  background: tone === "success" ? C.greenSoft : C.primarySoft,
                  color: tone === "success" ? "#006644" : C.primary,
                }}
              >
                {o.status}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs" style={{ color: C.subtle }}>
              <span className="inline-flex items-center gap-1">
                <Target size={12} />
                {o.competency}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} />
                Due {o.due}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================ */
/*       SLIDE-OVER 3: REVIEW & EDIT AUTO-CAPTURED EVIDENCE     */
/* ============================================================ */

function InboxReviewSlideover({
  item,
  onClose,
  onConfirm,
  onDismiss,
}: {
  item: InboxViewItem;
  onClose: () => void;
  onConfirm: (payload: InboxConfirmPayload) => void;
  onDismiss: () => void;
}) {
  const inboxCats = Object.keys(SUBCATEGORIES);
  const initialCat = inboxCats.find((c) => item.suggestion.includes(c)) ?? inboxCats[0];
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(initialCat);
  const [subcategory, setSubcategory] = useState(SUBCATEGORIES[initialCat][0]);
  function onCatChange(v: string) {
    setCategory(v);
    setSubcategory(SUBCATEGORIES[v][0]);
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50"
      style={{ background: "rgba(9, 30, 66, 0.45)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 right-0 h-full w-full md:w-[44%] bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs" style={{ color: C.subtle }}>
              <Sparkles size={12} style={{ color: C.primary }} />
              <span className="font-semibold uppercase tracking-wider" style={{ color: C.slate }}>
                Review Auto-Captured Event
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[#F4F5F7]"
              style={{ color: C.slate }}
            >
              <X size={18} />
            </button>
          </div>
          <div className="text-[13px] mt-2" style={{ color: C.subtle }}>
            The AI captured this event {item.when}. Confirm details before saving to your evidence
            log.
          </div>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <section>
            <label
              className="text-xs font-bold uppercase tracking-wider mb-1.5 block"
              style={{ color: C.subtle }}
            >
              Evidence Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 h-10 rounded border text-sm bg-[#FAFBFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition"
              style={{ borderColor: C.border, color: C.navy }}
            />
          </section>

          <section>
            <label
              className="text-xs font-bold uppercase tracking-wider mb-1.5 block"
              style={{ color: C.subtle }}
            >
              Source Link
            </label>
            <div
              className="flex items-center justify-between gap-2 px-3 py-2 rounded border"
              style={{ borderColor: C.border, background: "#FAFBFC" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                  style={{ background: "#FFFFFF", color: C.slate, border: `1px solid ${C.border}` }}
                >
                  <SourceIcon source={item.source} size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold" style={{ color: C.navy }}>
                    {item.source}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: C.subtle }}>
                    {item.title}
                  </div>
                </div>
              </div>
              <button
                className="shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded hover:bg-white"
                style={{ color: C.primary }}
              >
                Open
                <ExternalLink size={12} />
              </button>
            </div>
          </section>

          <section>
            <label
              className="text-xs font-bold uppercase tracking-wider mb-1.5 block"
              style={{ color: C.subtle }}
            >
              Description & Context
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="The AI captured this event, but please add context. What did you learn? What was the technical challenge?"
              className="w-full px-3 py-2 rounded border text-sm bg-[#FAFBFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition resize-none"
              style={{ borderColor: C.border, color: C.navy }}
            />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} style={{ color: C.primary }} />
              <label
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: C.subtle }}
              >
                AI Competency Mapping
              </label>
            </div>
            <div className="flex items-start gap-2 mb-3 p-2.5 rounded bg-blue-50 text-blue-800">
              <Info size={14} className="mt-0.5 shrink-0" />
              <div className="text-[12px] leading-snug">
                AI Suggestion: Mapped based on context.
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Category
                </div>
                <Select value={category} onChange={(e) => onCatChange(e.target.value)}>
                  {inboxCats.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: C.subtle }}
                >
                  Subcategory / Question
                </div>
                <Select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                  {SUBCATEGORIES[category].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: C.border, background: "#FAFBFC" }}
        >
          <button
            onClick={onDismiss}
            className="px-3 h-9 rounded text-sm font-medium hover:bg-[#FFEBE6] transition-colors"
            style={{ color: C.red }}
          >
            {item.isSample ? "Close Sample" : "Dismiss Event"}
          </button>
          <PrimaryBtn
            onClick={() =>
              onConfirm({
                title,
                description,
                category,
                subcategory,
              })
            }
          >
            <CheckCircle size={14} />
            Confirm & Save
          </PrimaryBtn>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================ */
/*           OVERLAY: PERFORMANCE REVIEW WIZARD                 */
/* ============================================================ */

function ReviewWizard({
  evidence,
  onClose,
  onFinalize,
  onOpenEvidence,
  latestAssessment,
  initialDraft,
  engineerName,
  managerName,
  onSaveDraft,
}: {
  evidence: EvidenceRecord[];
  onClose: () => void;
  onFinalize: (s: ReviewSession) => void;
  onOpenEvidence: (e: EvidenceRecord) => void;
  latestAssessment: Assessment | undefined;
  initialDraft: AssessmentWizardDraft | null;
  engineerName: string;
  managerName: string;
  onSaveDraft: (draft: AssessmentWizardDraft) => void;
}) {
  const categories = ALL_CATEGORIES;
  const [activeIdx, setActiveIdx] = useState(initialDraft?.activeIdx ?? 0);
  const [scores, setScores] = useState<Record<string, Record<string, ReviewQuestion>>>(() => {
    if (initialDraft?.scores) {
      return initialDraft.scores;
    }
    const init: Record<string, Record<string, ReviewQuestion>> = {};
    categories.forEach((cat) => {
      init[cat] = {};
      SUBCATEGORIES[cat].forEach((sub) => {
        const historical = getHistoricalQuestionScores(latestAssessment, cat, sub);
        const prev = historical.previous;
        init[cat][sub] = { prev, next: historical.current, notes: historical.note, evidenceIds: [] };
      });
    });
    return init;
  });
  const [attachOpenFor, setAttachOpenFor] = useState<string | null>(null);
  const [showUnsavedExitDialog, setShowUnsavedExitDialog] = useState(false);
  const initialScoresSnapshotRef = useRef<string | null>(null);

  const activeCat = categories[activeIdx];
  const isLast = activeIdx === categories.length - 1;
  const isDirty =
    initialScoresSnapshotRef.current != null &&
    JSON.stringify(scores) !== initialScoresSnapshotRef.current;

  useEffect(() => {
    if (initialScoresSnapshotRef.current == null) {
      initialScoresSnapshotRef.current = JSON.stringify(scores);
    }
  }, [scores]);

  function updateQ(cat: string, sub: string, patch: Partial<ReviewQuestion>) {
    setScores((s) => ({
      ...s,
      [cat]: { ...s[cat], [sub]: { ...s[cat][sub], ...patch } },
    }));
  }

  function toggleEvidence(cat: string, sub: string, id: string) {
    setScores((s) => {
      const existing = s[cat][sub].evidenceIds;
      const next = existing.includes(id) ? existing.filter((x) => x !== id) : [...existing, id];
      return { ...s, [cat]: { ...s[cat], [sub]: { ...s[cat][sub], evidenceIds: next } } };
    });
  }

  function categoryProgress(cat: string): number {
    const subs = scores[cat] ?? {};
    const total = Object.keys(subs).length;
    if (total === 0) return 0;
    const touched = Object.values(subs).filter(
      (q) => q.next !== q.prev || q.notes.trim().length > 0,
    ).length;
    return Math.round((touched / total) * 100);
  }

  function finalize() {
    const today = new Date();
    const session: ReviewSession = {
      id: generateSafeId(),
      date: formatDisplayDate(today),
      period: `${today.toLocaleString("en-US", { month: "long" })} ${today.getFullYear()}`,
      engineer: engineerName,
      manager: managerName,
      scores,
    };
    onFinalize(session);
  }

  function saveDraft() {
    onSaveDraft({
      activeIdx,
      scores,
      savedAt: new Date().toISOString(),
    });
    onClose();
  }

  function requestClose() {
    if (isDirty) {
      setShowUnsavedExitDialog(true);
      return;
    }
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "rgba(9, 30, 66, 0.54)" }}
    >
      <motion.div
        className="w-full h-full flex flex-col"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{ background: C.bg }}
      >
        {/* Top bar */}
        <div
          className="h-14 px-6 flex items-center justify-between border-b bg-white"
          style={{ borderColor: C.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: C.primarySoft, color: C.primary }}
            >
              <ClipboardList size={16} />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight" style={{ color: C.navy }}>
                Performance Review Session
              </div>
              <div className="text-[11px]" style={{ color: C.subtle }}>
                Score each subcategory on the 1–5 effectiveness scale and add justification notes.
              </div>
            </div>
          </div>
          <button
            onClick={requestClose}
            className="w-8 h-8 rounded flex items-center justify-center hover:bg-[#F4F5F7]"
            style={{ color: C.subtle }}
            aria-label="Close wizard"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex max-w-6xl w-full mx-auto p-6 gap-6">
          {/* Left stepper */}
          <aside
            className="w-64 shrink-0 bg-white border rounded shadow-sm flex flex-col"
            style={{ borderColor: C.border }}
          >
            <div
              className="px-4 py-3 border-b text-[11px] uppercase tracking-wider font-bold"
              style={{ borderColor: C.border, color: C.subtle }}
            >
              Categories
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {categories.map((cat, i) => {
                const active = i === activeIdx;
                const pct = categoryProgress(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveIdx(i)}
                    className="w-full text-left px-3 py-2.5 rounded transition-colors"
                    style={{
                      background: active ? C.primarySoft : "transparent",
                      color: active ? C.primary : C.slate,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                        Step {i + 1}
                      </span>
                      {pct === 100 && <CheckCircle size={13} style={{ color: C.green }} />}
                    </div>
                    <div className="text-sm font-semibold mt-0.5 leading-snug">{cat}</div>
                    <div
                      className="mt-1.5 h-1 rounded-full overflow-hidden"
                      style={{ background: "#EBECF0" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: active ? C.primary : C.green }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="mb-4">
                <div
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: C.subtle }}
                >
                  Category {activeIdx + 1} of {categories.length}
                </div>
                <h2 className="text-2xl font-bold tracking-tight mt-1" style={{ color: C.navy }}>
                  {activeCat}
                </h2>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: C.slate }}>
                  {COMPETENCY_DESC[activeCat]}
                </p>
              </div>

              <div className="space-y-4">
                {SUBCATEGORIES[activeCat].map((sub) => {
                  const q = scores[activeCat][sub];
                  const attachOpen = attachOpenFor === `${activeCat}::${sub}`;
                  return (
                    <Card key={sub} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: C.subtle }}
                          >
                            Question
                          </div>
                          <div className="text-[15px] font-semibold mt-1" style={{ color: C.navy }}>
                            {sub}
                          </div>
                        </div>
                        <Badge tone="neutral">Previous Score: {q.prev}</Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <Field label="New score (1-5)">
                          <Select
                            value={String(q.next)}
                            onChange={(e) =>
                              updateQ(activeCat, sub, { next: Number(e.target.value) })
                            }
                          >
                            {EFFECTIVENESS_SCALE.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.value} - {s.label}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field label="Change vs previous">
                          <div
                            className="h-9 px-3 flex items-center text-sm rounded border"
                            style={{
                              background: "#F4F5F7",
                              borderColor: C.border,
                              color: q.next > q.prev ? C.green : q.next < q.prev ? C.red : C.subtle,
                              fontWeight: 600,
                            }}
                          >
                            {q.next === q.prev
                              ? "No change"
                              : `${q.prev} → ${q.next} (${q.next > q.prev ? "+" : ""}${q.next - q.prev})`}
                          </div>
                        </Field>
                      </div>

                      <div className="mt-4">
                        <Field label="Manager & Engineer notes / justification">
                          <Textarea
                            rows={3}
                            placeholder="Document examples, behaviors, and rationale for this score..."
                            value={q.notes}
                            onChange={(e) => updateQ(activeCat, sub, { notes: e.target.value })}
                          />
                        </Field>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button
                          onClick={() =>
                            setAttachOpenFor(attachOpen ? null : `${activeCat}::${sub}`)
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded border hover:border-[#0052CC] transition-colors"
                          style={{ borderColor: C.border, color: C.primary }}
                        >
                          <Paperclip size={13} />
                          Attach Evidence
                          {q.evidenceIds.length > 0 ? ` (${q.evidenceIds.length})` : ""}
                        </button>
                        {q.evidenceIds.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {q.evidenceIds.map((id) => {
                              const ev = evidence.find((e) => e.id === id);
                              if (!ev) return null;
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => onOpenEvidence(ev)}
                                  title={`${ev.id} - ${ev.title}`}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                                >
                                  <ExternalLink size={10} />
                                  {ev.id}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {attachOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 border-t pt-3 space-y-1.5 max-h-56 overflow-y-auto"
                            style={{ borderColor: C.border }}
                          >
                            {(() => {
                              const subLower = sub.toLowerCase();
                              const filtered = evidence.filter(
                                (ev) =>
                                  ev.category === activeCat ||
                                  ev.competency === activeCat ||
                                  subLower.includes(ev.competency.toLowerCase()) ||
                                  ev.competency.toLowerCase().includes(subLower),
                              );
                              if (filtered.length === 0) {
                                return (
                                  <div
                                    className="px-2 py-3 text-[12px] text-center"
                                    style={{ color: C.subtle }}
                                  >
                                    No evidence mapped to this question yet.
                                  </div>
                                );
                              }
                              return filtered.map((ev) => {
                                const checked = q.evidenceIds.includes(ev.id);
                                return (
                                  <label
                                    key={ev.id}
                                    className="flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[#F4F5F7]"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleEvidence(activeCat, sub, ev.id)}
                                      className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div
                                        className="text-[13px] font-semibold truncate"
                                        style={{ color: C.navy }}
                                      >
                                        {ev.title}
                                      </div>
                                      <div className="text-[11px]" style={{ color: C.subtle }}>
                                        {ev.id} · {ev.source} · {formatDisplayDate(ev.date)}
                                      </div>
                                    </div>
                                  </label>
                                );
                              });
                            })()}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Sticky footer */}
            <div
              className="mt-4 -mx-6 px-6 py-3 border-t bg-white flex items-center justify-between"
              style={{ borderColor: C.border }}
            >
              <div className="flex items-center gap-2">
                <GhostBtn onClick={requestClose}>
                  <X size={14} />
                  Cancel
                </GhostBtn>
                <GhostBtn
                  onClick={saveDraft}
                >
                  <Save size={14} />
                  Save Draft
                </GhostBtn>
              </div>
              <div className="flex items-center gap-2">
                <GhostBtn
                  onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                  disabled={activeIdx === 0}
                >
                  <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
                  Previous
                </GhostBtn>
                {!isLast && (
                  <PrimaryBtn
                    onClick={() => setActiveIdx((i) => Math.min(categories.length - 1, i + 1))}
                  >
                    Next Category
                    <ChevronRight size={14} />
                  </PrimaryBtn>
                )}
                {isLast && (
                  <PrimaryBtn onClick={finalize}>
                    <FileCheck2 size={14} />
                    Complete & Finalize Assessment
                  </PrimaryBtn>
                )}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showUnsavedExitDialog && (
            <Backdrop onClose={() => setShowUnsavedExitDialog(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-lg shadow-2xl w-full max-w-md border"
                style={{ borderColor: C.border }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-amber-100">
                      <AlertCircle size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold" style={{ color: C.navy }}>
                        Unsaved changes
                      </div>
                      <div className="text-sm mt-1.5 leading-relaxed" style={{ color: C.slate }}>
                        You have unsaved changes. Closing this without saving your draft will result in
                        lost data. Are you sure you want to exit?
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="px-5 py-3 border-t flex items-center justify-end gap-2"
                  style={{ borderColor: C.border, background: C.bg }}
                >
                  <GhostBtn onClick={() => setShowUnsavedExitDialog(false)}>Cancel</GhostBtn>
                  <GhostBtn
                    onClick={() => {
                      setShowUnsavedExitDialog(false);
                      saveDraft();
                    }}
                  >
                    <Save size={14} />
                    Save Draft
                  </GhostBtn>
                  <button
                    onClick={() => {
                      setShowUnsavedExitDialog(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors"
                    style={{ background: C.red }}
                  >
                    Exit Anyway
                  </button>
                </div>
              </motion.div>
            </Backdrop>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================ */
/*               MODAL: ASSESSMENT HISTORY                      */
/* ============================================================ */

function AssessmentsArchiveTable({
  assessments,
  onOpen,
  onDelete,
}: {
  assessments: Assessment[];
  onOpen: (a: Assessment) => void;
  onDelete: (assessmentId: string) => void;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5 border-b" style={{ borderColor: C.border }}>
        <SectionHeader
          title="Assessment Archive"
          sub="All historical performance assessments. Click a row to open the full report."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: "#F4F5F7", color: C.subtle }}>
            <tr className="text-left text-[11px] uppercase tracking-wider">
              <Th>Review Period</Th>
              <Th>Date Completed</Th>
              <Th>Manager</Th>
              <Th>Status</Th>
              <Th>Overall Readiness</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {assessments.length === 0 && (
              <tr>
                <Td>
                  <span style={{ color: C.subtle }}>No assessments yet.</span>
                </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
                <Td> </Td>
              </tr>
            )}
            {assessments.map((a) => {
              const date = formatDisplayDate(a.dateCompleted);
              const statusTone: "success" | "warning" | "info" =
                a.status === "Finalized" ? "success" : a.status === "Draft" ? "warning" : "info";
              const pct = a.overallReadinessScore;
              return (
                <tr
                  key={a.id}
                  onClick={() => onOpen(a)}
                  className="border-t hover:bg-[#FAFBFC] transition-colors cursor-pointer"
                  style={{ borderColor: C.border }}
                >
                  <Td className="font-semibold" style={{ color: C.navy }}>
                    {a.reviewPeriod}
                    <div className="text-[11px] font-normal" style={{ color: C.subtle }}>
                      {a.id}
                    </div>
                  </Td>
                  <Td style={{ color: C.slate }}>{date}</Td>
                  <Td style={{ color: C.slate }}>{a.managerName}</Td>
                  <Td>
                    <Badge tone={statusTone}>{a.status}</Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: "#EBECF0" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: pct >= 75 ? C.green : C.primary }}
                        />
                      </div>
                      <span className="text-xs font-bold tabular-nums" style={{ color: C.navy }}>
                        {pct}%
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      {a.status === "Finalized" && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            triggerAssessmentPdfDownload(a);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border hover:border-[#0052CC] transition-colors"
                          style={{ borderColor: C.border, color: C.primary }}
                          aria-label={`Download ${a.reviewPeriod} PDF`}
                        >
                          <Download size={12} />
                          Download PDF
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(a.id);
                        }}
                        className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-[#FFEBE6]"
                        style={{ color: C.red }}
                        aria-label={`Delete assessment ${a.reviewPeriod}`}
                      >
                        <Trash2 size={14} />
                      </button>
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-[#F4F5F7]"
                        style={{ color: C.subtle }}
                        aria-label="Open report"
                      >
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AssessmentHistoryModal({
  assessments,
  currentId,
  onDelete,
  onClose,
  onOpen,
}: {
  assessments: Assessment[];
  currentId: string | null;
  onDelete: (assessmentId: string) => void;
  onClose: () => void;
  onOpen: (a: Assessment) => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "rgba(9, 30, 66, 0.54)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        className="w-full max-w-lg bg-white rounded-md shadow-xl border"
        style={{ borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 h-14 flex items-center justify-between border-b"
          style={{ borderColor: C.border }}
        >
          <div className="flex items-center gap-2">
            <History size={16} style={{ color: C.primary }} />
            <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
              Assessment History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center hover:bg-[#F4F5F7]"
            style={{ color: C.subtle }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {assessments.length === 0 && (
            <div className="text-sm text-center py-8" style={{ color: C.subtle }}>
              No assessments yet. Finalize a performance review to start the log.
            </div>
          )}
          {assessments.map((a) => {
            const isCurrent = a.id === currentId;
            const date = formatDisplayDate(a.dateCompleted);
            return (
              <div
                key={a.id}
                onClick={() => onOpen(a)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(a);
                  }
                }}
                role="button"
                tabIndex={0}
                className="w-full text-left p-3 rounded border hover:border-[#0052CC] hover:bg-[#F4F5F7] transition-colors"
                style={{
                  borderColor: isCurrent ? C.primary : C.border,
                  background: isCurrent ? C.primarySoft : "#FAFBFC",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold" style={{ color: C.navy }}>
                    {a.reviewPeriod}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isCurrent && <Badge tone="info">Current</Badge>}
                    <Badge tone={a.status === "Finalized" ? "success" : "warning"}>
                      {a.status}
                    </Badge>
                    {a.status === "Finalized" && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          triggerAssessmentPdfDownload(a);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border hover:border-[#0052CC]"
                        style={{ borderColor: C.border, color: C.primary }}
                      >
                        <Download size={11} />
                        PDF
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(a.id);
                      }}
                      className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[#FFEBE6]"
                      style={{ color: C.red }}
                      aria-label={`Delete assessment ${a.reviewPeriod}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="text-xs" style={{ color: C.subtle }}>
                    {date} &middot; {a.id} &middot; Mgr {a.managerName}
                  </div>
                  <div className="text-xs font-bold" style={{ color: C.primary }}>
                    {a.overallReadinessScore}% readiness
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="px-5 h-14 flex items-center justify-end border-t"
          style={{ borderColor: C.border }}
        >
          <GhostBtn onClick={onClose}>Close</GhostBtn>
        </div>
      </motion.div>
    </motion.div>
  );
}
