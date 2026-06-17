import { createFileRoute } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
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
  component: EvitraceApp,
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
  "Code Quality":
    "Writes maintainable, well-tested code and raises the bar through reviews.",
  Communication:
    "Listens and communicates openly, honestly, and respectfully with different audiences.",
  Leadership:
    "Influences direction, mentors peers, and drives alignment across teams.",
  "Engineering for UX":
    "Partners with design to deliver thoughtful, accessible, and performant user experiences.",
  Security:
    "Anticipates threats and embeds secure-by-default practices into the SDLC.",
  Delivery:
    "Breaks down complex work and ships reliably with predictable cadence.",
};

const EFFECTIVENESS_SCALE: { value: number; label: string; tone: "danger" | "warning" | "info" | "success" }[] = [
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

function subRating(cat: string, sub: string): number {
  // deterministic pseudo-rating for the mock matrix
  const key = (cat + sub).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return 1 + (key % 5);
}

/* ---------- Shared category helpers ---------- */
const ALL_CATEGORIES = Object.keys(SUBCATEGORIES);
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
    date: new Date(a.dateCompleted).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
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
      "Analytical Thinking": [[2, 3, "Improved root-cause analysis on incident IR-4421."], [2, 3], [2, 3]],
      "System Design": [[2, 3, "Led RFC for sharded inventory service."], [2, 3], [1, 2]],
      "Code Quality": [[3, 3], [3, 4, "Drove team-wide refactor of payment module."], [3, 3]],
      Communication: [[3, 3], [3, 3], [3, 3]],
      Leadership: [[2, 2], [2, 3, "Mentored two L2 engineers."], [2, 2]],
      "Engineering for UX": [[2, 3, "Shipped accessibility pass on checkout."], [2, 3], [2, 2]],
      Security: [[2, 3], [2, 3, "Completed OWASP Top 10 internal cert."], [2, 2]],
      Delivery: [[3, 3], [3, 4, "Three consecutive on-time releases."], [3, 3]],
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
      "Analytical Thinking": [[2, 2], [1, 2], [2, 2]],
      "System Design": [[1, 2], [2, 2], [1, 1]],
      "Code Quality": [[3, 3], [3, 3], [2, 3]],
      Communication: [[3, 3], [2, 3], [3, 3]],
      Leadership: [[2, 2], [2, 2], [1, 2]],
      "Engineering for UX": [[2, 2], [2, 2], [2, 2]],
      Security: [[2, 2], [2, 2], [1, 2]],
      Delivery: [[3, 3], [3, 3], [2, 3]],
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
      "Analytical Thinking": [[1, 2, "Demonstrated excellent root-cause analysis during the multi-node latency incident."], [1, 1, "Starting to identify patterns in logs, but needs more autonomy."], [1, 2]],
      "System Design": [[1, 1], [1, 2], [1, 1]],
      "Code Quality": [[2, 3], [2, 3], [2, 2]],
      Communication: [[2, 3], [2, 2], [2, 3]],
      Leadership: [[1, 2], [1, 2], [1, 1]],
      "Engineering for UX": [[2, 2], [2, 2], [1, 2]],
      Security: [[1, 2], [1, 2], [1, 1]],
      Delivery: [[2, 3], [2, 3], [2, 2]],
    },
    topics: ["Set focus areas for Q1 - System Design, Security"],
  }),
];

/* ---------- Primitives ---------- */
function Card({
  children,
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
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
    <path d="M2.65 3a.65.65 0 0 0-.65.76l2.72 16.5a.88.88 0 0 0 .87.74h13.04a.65.65 0 0 0 .65-.55l2.72-16.69a.65.65 0 0 0-.65-.76zm11.46 11.85h-4.21l-1.14-5.95h6.36z"/>
  </svg>
);

const JiraIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.53 2a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V2.7a.7.7 0 0 0-.7-.7zM6.18 7.34a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V8.04a.7.7 0 0 0-.7-.7zM.84 12.66a5.7 5.7 0 0 0 5.7 5.7h2.3v2.23a5.7 5.7 0 0 0 5.7 5.7V13.36a.7.7 0 0 0-.7-.7z" transform="scale(0.85)"/>
  </svg>
);

const ConfluenceIcon = BookOpen;

function SourceIcon({ source, size = 14 }: { source: string; size?: number }) {
  const s = source.toLowerCase();
  const cls = "shrink-0";
  if (s.includes("bitbucket")) return <span className={cls} style={{ color: "#2684FF" }}><BitbucketIcon size={size} /></span>;
  if (s.includes("jira")) return <span className={cls} style={{ color: "#2684FF" }}><JiraIcon size={size} /></span>;
  if (s.includes("github")) return <Github size={size} className={cls} style={{ color: "#24292F" }} />;
  if (s.includes("gitlab")) return <Gitlab size={size} className={cls} style={{ color: "#FC6D26" }} />;
  if (s.includes("slack")) return <Slack size={size} className={cls} style={{ color: "#4A154B" }} />;
  if (s.includes("teams") || s.includes("microsoft")) return <MessageSquare size={size} className={cls} style={{ color: "#5059C9" }} />;
  if (s.includes("excel") || s.includes("sheet")) return <FileSpreadsheet size={size} className={cls} style={{ color: "#21A366" }} />;
  if (s.includes("powerpoint") || s.includes("slides")) return <Presentation size={size} className={cls} style={{ color: "#D24726" }} />;
  if (s.includes("confluence")) return <ConfluenceIcon size={size} className={cls} style={{ color: "#2684FF" }} />;
  if (s.includes("trello")) return <Trello size={size} className={cls} style={{ color: "#0079BF" }} />;
  if (s.includes("figma")) return <Figma size={size} className={cls} style={{ color: "#A259FF" }} />;
  if (s.includes("git")) return <GitBranch size={size} className={cls} style={{ color: C.slate }} />;
  if (s.includes("word") || s.includes("doc")) return <FileText size={size} className={cls} style={{ color: "#2B579A" }} />;
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
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-2.5 pointer-events-none" style={{ color: C.subtle }}>
          {icon}
        </span>
      )}
      <select
        {...rest}
        className={`h-9 ${icon ? "pl-8" : "pl-3"} pr-8 text-sm rounded border bg-[#F4F5F7] hover:bg-white outline-none appearance-none cursor-pointer transition-all`}
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
    managerNotes: "Strong example of cross-team coordination. Tag this for the L4 architecture criterion in your packet.",
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
    managerNotes: "Add a short note on the dependency-tracking spreadsheet you maintained week over week.",
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
    managerNotes: "Re-word the description to highlight the threat model and your remediation approach more explicitly.",
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
          criteria:
            "Use design system components to maintain UI consistency across a full feature",
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
          criteria:
            "Design intuitive API endpoints around what users are trying to accomplish",
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
      { label: "Testing strategies overview", url: "https://martinfowler.com/articles/practical-test-pyramid.html" },
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

type Tab = "dashboard" | "radar" | "evidence" | "objectives" | "report" | "settings";

function EvitraceApp() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [evidence, setEvidence] = useState(initialEvidence);
  const [inbox, setInbox] = useState(initialInbox);
  const [radarData, setRadarData] = useState(initialRadar);
  const [objectives, setObjectives] = useState(initialObjectives);
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);

  const [showExtension, setShowExtension] = useState(true);
  const [showCapture, setShowCapture] = useState(false);
  const [showCreateObjective, setShowCreateObjective] = useState(false);
  const [openObjective, setOpenObjective] = useState<Objective | null>(null);
  const [openEvidence, setOpenEvidence] = useState<(typeof initialEvidence)[number] | null>(null);
  const [openInbox, setOpenInbox] = useState<(typeof initialInbox)[number] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [review, setReview] = useState<ReviewSession | null>(null);

  const pageTitle: Record<Tab, string> = {
    dashboard: "Dashboard",
    radar: "Promotion Readiness",
    evidence: "Evidence Log",
    objectives: "Objectives",
    report: "Reviews & Reports",
    settings: "Settings",
  };

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  function approveInbox(id: string, comps: string[]) {
    const item = inbox.find((i) => i.id === id);
    if (!item) return;
    setInbox((x) => x.filter((i) => i.id !== id));
    setEvidence((e) => [
      {
        id: `EV-${300 + e.length}`,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        source: item.source,
        category: "Technical",
        competency: comps[0] ?? "Delivery",
        title: item.title,
        description: "Auto-captured and mapped from " + item.source,
        link: "",
        status: "Pending Review" as const,
                  matchState: "Unset" as const,
                  managerNotes: "",
                  isArchived: false,
      },
      ...e,
    ]);
    setRadarData((d) =>
      d.map((row) =>
        comps.some((c) => c.toLowerCase().includes(row.competency.toLowerCase().split(" ")[0]))
          ? { ...row, current: Math.min(4, +(row.current + 0.1).toFixed(2)) }
          : row,
      ),
    );
    flash("Evidence mapped and added to log");
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.navy, fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar
        tab={tab}
        setTab={(t) => {
          setTab(t);
          setMobileSidebarOpen(false);
        }}
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
                  objectives={objectives}
                  evidence={evidence}
                  onOpenInbox={setOpenInbox}
                  onOpenObjective={setOpenObjective}
                  onOpenEvidence={setOpenEvidence}
                />
              )}
              {tab === "radar" && (
                <RadarView
                  data={radarData}
                  assessments={assessments}
                  onCreateObjective={() => setShowCreateObjective(true)}
                  onStartReview={() => setShowWizard(true)}
                  onOpenHistory={() => setShowHistory(true)}
                />
              )}
              {tab === "evidence" && (
                <EvidenceView
                  rows={evidence}
                  onOpenRow={setOpenEvidence}
                  onPermanentDelete={(id) => {
                    setEvidence((e) => e.filter((x) => x.id !== id));
                    flash("Evidence permanently deleted");
                  }}
                  onRestore={(id) => {
                    setEvidence((e) =>
                      e.map((x) => (x.id === id ? { ...x, isArchived: false, archivedDate: undefined } : x)),
                    );
                    flash("Evidence restored to log");
                  }}
                />
              )}
              {tab === "objectives" && (
                <ObjectivesView
                  items={objectives}
                  onOpen={setOpenObjective}
                  onCreate={() => setShowCreateObjective(true)}
                  onRestore={(o) => {
                    setObjectives((x) =>
                      x.map((it) =>
                        it.id === o.id
                          ? { ...it, isArchived: false, archivedDate: undefined, status: "In Progress" as const }
                          : it,
                      ),
                    );
                    flash("Objective restored to Kanban board");
                  }}
                  onDelete={(o) => {
                    setObjectives((x) => x.filter((it) => it.id !== o.id));
                    flash("Objective permanently deleted");
                  }}
                  onMove={(id, status) => {
                    const target = objectives.find((o) => o.id === id);
                    if (!target || target.status === status || target.status === "Completed") return;
                    setObjectives((x) =>
                      x.map((it) => (it.id === id ? { ...it, status } : it)),
                    );
                    if (status === "Completed") {
                      setEvidence((e) => [
                        {
                          id: `EV-${300 + e.length}`,
                          date: new Date().toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          }),
                          source: "Bitbucket",
                          category: "Objective",
                          competency: target.competency,
                          title: target.title,
                          description: target.notes ?? "Completed objective summary",
                          link: "",
                          status: "Pending Review" as const,
                  matchState: "Unset" as const,
                  managerNotes: "",
                  isArchived: false,
                        },
                        ...e,
                      ]);
                      flash("Objective completed and added to evidence");
                    } else {
                      flash(`Moved to ${status}`);
                    }
                  }}
                />
              )}
              {tab === "report" && (
                <ReportView
                  evidence={evidence}
                  objectives={objectives}
                  radarData={radarData}
                  onFlash={flash}
                  review={review}
                  assessments={assessments}
                  onOpenAssessment={(a) => setReview(assessmentToSession(a))}
                  onClearReview={() => setReview(null)}
                  onStartReview={() => setShowWizard(true)}
                  onOpenHistory={() => setShowHistory(true)}
                />
              )}
              {tab === "settings" && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating extension preview */}
      <AnimatePresence>
        {showExtension && (
          <ExtensionPopup
            onDismiss={() => setShowExtension(false)}
            onSave={() => {
              setShowExtension(false);
              flash("Evidence saved from extension");
            }}
          />
        )}
      </AnimatePresence>

      {/* Capture modal */}
      <AnimatePresence>
        {showCapture && (
          <CaptureModal
            onClose={() => setShowCapture(false)}
            onSave={(title, comps, link, reflection) => {
              setEvidence((e) => [
                {
                  id: `EV-${300 + e.length}`,
                  date: new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }),
                  source: "Bitbucket",
                  category: "Technical",
                  competency: comps[0] ?? "Delivery",
                  title,
                  description: reflection || "Manually captured reflection",
                  link,
                  status: "Pending Review" as const,
                  matchState: "Unset" as const,
                  managerNotes: "",
                  isArchived: false,
                },
                ...e,
              ]);
              setShowCapture(false);
              flash("Evidence captured");
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
              setObjectives((x) => [
                { ...o, id: `OBJ-${100 + x.length}`, status: "Pending Approval" as const },
                ...x,
              ]);
              setShowCreateObjective(false);
              flash("Objective submitted for approval");
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
              setObjectives((x) => x.map((it) => (it.id === o.id ? o : it)));
              setOpenObjective(o);
              flash("Objective updated");
            }}
            onChangeStatus={(o, next) => {
              const updated = { ...o, status: next };
              setObjectives((x) => x.map((it) => (it.id === o.id ? updated : it)));
              setOpenObjective(updated);
              if (next === "Completed") {
                setEvidence((e) => [
                  {
                    id: `EV-${300 + e.length}`,
                    date: new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    }),
                    source: "Bitbucket",
                    category: "Objective",
                    competency: o.competency,
                    title: o.title,
                    description: o.notes ?? "Completed objective summary",
                    link: "",
                    status: "Pending Review" as const,
                  matchState: "Unset" as const,
                  managerNotes: "",
                  isArchived: false,
                  },
                  ...e,
                ]);
                flash("Objective completed and added to evidence");
              } else if (next === "In Progress") {
                flash("Objective approved and moved to In Progress");
              }
            }}
            onArchive={(o) => {
              setObjectives((x) =>
                x.map((it) =>
                  it.id === o.id
                    ? {
                        ...it,
                        isArchived: true,
                        archivedDate: new Date().toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        }),
                      }
                    : it,
                ),
              );
              setOpenObjective(null);
              flash("Objective archived");
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
              setEvidence((e) => e.map((x) => (x.id === updated.id ? updated : x)));
              setOpenEvidence(updated);
              flash("Evidence updated");
            }}
            onArchive={(id) => {
              setEvidence((e) =>
                e.map((x) =>
                  x.id === id
                    ? {
                        ...x,
                        isArchived: true,
                        archivedDate: new Date().toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        }),
                      }
                    : x,
                ),
              );
              setOpenEvidence(null);
              flash("Evidence archived");
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
              approveInbox(openInbox.id, comps);
              setOpenInbox(null);
            }}
            onDismiss={() => {
              setInbox((x) => x.filter((i) => i.id !== openInbox.id));
              setOpenInbox(null);
              flash("Event dismissed");
            }}
          />
        )}
      </AnimatePresence>

      {/* Performance Review wizard */}
      <AnimatePresence>
        {showWizard && (
          <ReviewWizard
            evidence={evidence}
            onOpenEvidence={setOpenEvidence}
            onClose={() => setShowWizard(false)}
            onFinalize={(session: ReviewSession) => {
              setReview(session);
              // Persist the finalized session into the historical assessments log
              const newAssessment = sessionToAssessment(session);
              setAssessments((prev) => [newAssessment, ...prev]);
              // Roll up averaged "next" scores into the radarData for matrix + radar chart
              setRadarData((rows) =>
                rows.map((r) => {
                  const cat = radarLabelToCategory(r.competency);
                  const subs = session.scores[cat];
                  if (!subs) return r;
                  const vals = (Object.values(subs) as ReviewQuestion[]).map((q) => q.next);
                  if (vals.length === 0) return r;
                  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
                  // radar uses 0-4 scale, scores use 1-5; map by clamp
                  return { ...r, current: +Math.min(4, (avg / 5) * 4).toFixed(2) };
                }),
              );
              setShowWizard(false);
              setTab("report");
              flash("Assessment finalized · Report generated");
            }}
          />
        )}
      </AnimatePresence>

      {/* Assessment history modal */}
      <AnimatePresence>
        {showHistory && (
          <AssessmentHistoryModal
            assessments={assessments}
            currentId={review?.id ?? null}
            onClose={() => setShowHistory(false)}
            onOpen={(a) => {
              setReview(assessmentToSession(a));
              setShowHistory(false);
              setTab("report");
            }}
          />
        )}
      </AnimatePresence>



      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded shadow-lg text-white text-sm font-medium"
            style={{ background: C.navy }}
          >
            <CheckCircle size={16} style={{ color: C.green }} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating "show extension" toggle when hidden */}
      {!showExtension && (
        <button
          onClick={() => setShowExtension(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 h-10 rounded-full shadow-lg border bg-white text-sm font-medium"
          style={{ borderColor: C.border, color: C.slate }}
        >
          <RadarIcon size={16} style={{ color: C.primary }} />
          Show extension preview
        </button>
      )}
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
  const mainNav: { id: Tab; label: string; sub: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: "dashboard", label: "Dashboard", sub: "Daily Actions", icon: LayoutDashboard },
    { id: "evidence", label: "Evidence Log", sub: "Data Table", icon: TableProperties },
    { id: "objectives", label: "Objectives", sub: "Skill Gap Planning", icon: Target },
    { id: "radar", label: "Promotion Readiness", sub: "Assessment & Gaps", icon: TrendingUp },
    { id: "report", label: "Reviews & Reports", sub: "Archive & 1-on-1 Prep", icon: FileText },
  ];
  const settingsItem = { id: "settings" as Tab, label: "Settings", sub: "App & Profile", icon: SettingsIcon };

  const NavButton = ({ n }: { n: typeof mainNav[number] }) => {
    const active = tab === n.id;
    const Icon = n.icon;
    return (
      <button
        key={n.id}
        onClick={() => setTab(n.id)}
        title={collapsed ? n.label : undefined}
        className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} py-2.5 rounded text-left transition-colors`}
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
        <Icon size={18} />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{n.label}</div>
            <div className="text-[11px]" style={{ color: active ? C.primary : C.subtle }}>
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
        className={`h-16 ${collapsed ? "px-2 justify-center" : "px-5"} flex items-center gap-2 border-b`}
        style={{ borderColor: C.border }}
      >
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ background: C.primary }}
        >
          <RadarIcon size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight" style={{ color: C.navy }}>
              Evitrace
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: C.subtle }}>
              Continuous Performance Intelligence
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {mainNav.map((n) => <NavButton key={n.id} n={n} />)}
      </nav>

      <div className="p-3 border-t space-y-2" style={{ borderColor: C.border }}>
        <NavButton n={settingsItem} />
        {!collapsed && (
          <div className="flex items-center gap-2 px-1 pt-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ background: "#5243AA" }}
            >
              JM
            </div>
            <div className="leading-tight">
              <div className="text-xs font-semibold" style={{ color: C.navy }}>
                Jordan Mills
              </div>
              <div className="text-[11px]" style={{ color: C.subtle }}>
                Senior Engineer L3
              </div>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-end"} gap-2 px-2 py-2 rounded text-xs font-medium hover:bg-[#F4F5F7]`}
          style={{ color: C.slate }}
        >
          {collapsed ? <PanelLeft size={16} /> : <><span>Collapse</span><PanelLeftClose size={16} /></>}
        </button>
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
              <div className="h-16 px-5 flex items-center justify-between border-b" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: C.primary }}>
                    <RadarIcon size={18} color="#fff" />
                  </div>
                  <div className="text-[15px] font-bold tracking-tight" style={{ color: C.navy }}>
                    Evitrace
                  </div>
                </div>
                <button onClick={onCloseMobile} className="p-1.5 rounded hover:bg-[#F4F5F7]" style={{ color: C.slate }}>
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {mainNav.map((n) => <NavButton key={n.id} n={n} />)}
              </nav>
              <div className="p-3 border-t" style={{ borderColor: C.border }}>
                <NavButton n={settingsItem} />
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
}: {
  title: string;
  onCapture: () => void;
  onMenuClick: () => void;
}) {
  const [notifs, setNotifs] = useState<{ id: string; icon: React.ComponentType<{ size?: number }>; title: string; body: string; when: string; read: boolean }[]>([
    { id: "N-1", icon: MessageSquare, title: "Manager added feedback to EV-198", body: "Alex Morgan suggested rewording your JWT remediation evidence.", when: "12m ago", read: false },
    { id: "N-2", icon: Sparkles, title: "Auto-captured event ready for review", body: "A new Bitbucket PR was detected and waiting in your inbox.", when: "1h ago", read: false },
    { id: "N-3", icon: UserCheck, title: "Objective approved", body: "UX-01 was moved to In Progress after manager approval.", when: "Yesterday", read: false },
    { id: "N-4", icon: FileCheck2, title: "Q3 assessment archived", body: "Your Q3 readiness report was saved to Reviews & Reports.", when: "3d ago", read: true },
  ]);
  const [open, setOpen] = useState(false);
  const unread = notifs.filter((n) => !n.read).length;
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
        <h1 className="text-base md:text-xl font-bold tracking-tight truncate" style={{ color: C.navy }}>
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="hidden md:block w-72">
          <Input placeholder="Search evidence, objectives, people…" icon={<Search size={14} />} />
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
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center bg-red-500"
              >
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
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
                    <div className="text-sm font-bold" style={{ color: C.navy }}>Notifications</div>
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
                      <div className="px-4 py-8 text-center text-xs" style={{ color: C.subtle }}>No notifications.</div>
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
                            <div className="text-xs font-semibold truncate" style={{ color: C.navy }}>{n.title}</div>
                            <div className="text-[11px] mt-0.5 leading-snug" style={{ color: C.slate }}>{n.body}</div>
                            <div className="text-[10px] mt-1" style={{ color: C.subtle }}>{n.when}</div>
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
  objectives,
  evidence,
  onOpenInbox,
  onOpenObjective,
  onOpenEvidence,
}: {
  inbox: typeof initialInbox;
  objectives: Objective[];
  evidence: typeof initialEvidence;
  onOpenInbox: (item: (typeof initialInbox)[number]) => void;
  onOpenObjective: (o: Objective) => void;
  onOpenEvidence: (e: (typeof initialEvidence)[number]) => void;
}) {
  const active = objectives.filter((o) => o.status === "In Progress");
  const recentEvidence = evidence.filter((e) => !e.isArchived).slice(0, 4);
  function relativeDate(dateStr: string) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return dateStr;
  }
  return (
    <div className="space-y-6">
      {/* Widget A */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Evidence This Quarter"
          value="42"
          delta="+8 vs last quarter"
          tone="info"
        />
        <StatCard
          icon={<Calendar size={18} />}
          label="Current Streak"
          value="14 days"
          delta="Best: 21 days"
          tone="success"
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Awaiting Manager Review"
          value="3"
          delta="Oldest: 2 days"
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Widget B - Inbox + Recent Evidence stacked */}
        <div className="col-span-2 space-y-6">
          <Card className="p-5">
            <SectionHeader
              title="Action Inbox"
              sub="Auto-captured events that need your mapping"
              right={<Badge tone="warning" icon={<AlertCircle size={12} />}>{inbox.length} pending</Badge>}
            />
            <div className="mt-4 divide-y" style={{ borderColor: C.border }}>
              {inbox.length === 0 ? (
                <div
                  className="py-10 text-center text-sm flex flex-col items-center gap-2"
                  style={{ color: C.subtle }}
                >
                  <CheckCircle size={28} style={{ color: C.green }} />
                  Inbox zero. Nice work.
                </div>
              ) : (
                inbox.map((it) => (
                  <InboxRow key={it.id} item={it} onOpen={() => onOpenInbox(it)} />
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader
              title="Recent Evidence"
              sub="Latest logged and verified contributions"
            />
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
                        <div className="mt-1 flex items-center gap-2 text-[11px]" style={{ color: C.subtle }}>
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
                  <div className="text-[11px] mt-1 flex items-center gap-2" style={{ color: C.subtle }}>
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
  delta,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
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
      <div className="text-xs mt-1" style={{ color: C.subtle }}>
        {delta}
      </div>
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
    <div className="flex items-start justify-between">
      <div>
        <div className="text-sm font-bold" style={{ color: C.navy }}>
          {title}
        </div>
        {sub && (
          <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
            {sub}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

function InboxRow({
  item,
  onOpen,
}: {
  item: (typeof initialInbox)[number];
  onOpen: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onOpen}
      className="w-full text-left py-4 flex items-start gap-3 hover:bg-[#FAFBFC] transition-colors rounded px-2 -mx-2"
    >
      <div
        className="w-9 h-9 rounded flex items-center justify-center shrink-0"
        style={{ background: "#F4F5F7", color: C.slate }}
      >
        <Icon size={16} />
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
      <div className="shrink-0 self-center flex items-center gap-1 text-xs font-medium" style={{ color: C.primary }}>
        Review
        <ChevronRight size={14} />
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
  onCreateObjective,
  onStartReview,
  onOpenHistory,
}: {
  data: typeof initialRadar;
  assessments: Assessment[];
  onCreateObjective: () => void;
  onStartReview: () => void;
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
  void onStartReview;
  void onOpenHistory;

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
        : +Math.max(0, r.current - 0.4).toFixed(2);
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
      {/* Subtitle */}
      <div className="text-sm" style={{ color: C.subtle }}>
        Assessment of current scores vs Level 4 target across the competency framework.
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.subtle }}>
            Overall Readiness
          </div>
          <div className="text-3xl font-bold mt-2 tracking-tight" style={{ color: C.navy }}>
            {readiness}%
          </div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "#EBECF0" }}>
            <div className="h-full rounded-full" style={{ width: `${readiness}%`, background: C.green }} />
          </div>
          <div className="text-xs mt-2" style={{ color: C.subtle }}>
            Toward Level 4 threshold
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.subtle }}>
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
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.subtle }}>
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
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.subtle }}>
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
              <div className="inline-flex items-center rounded border overflow-hidden" style={{ borderColor: C.border }}>
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
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: "#00B8D9" }}
              />
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
                  <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fill: C.subtle, fontSize: 10 }} />
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
                  <Bar
                    dataKey="target"
                    name="Target L4"
                    fill="#00B8D9"
                    radius={[0, 2, 2, 0]}
                  />
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
          <HierarchicalMatrix
            data={data}
            latest={latest}
            onCreateObjective={onCreateObjective}
          />
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
  data: typeof initialRadar;
  latest: Assessment | undefined;
  onCreateObjective: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const mapToCanonical = (label: string): string => radarLabelToCategory(label);

  /** Atlassian lozenge utility for change % values. */
  const changeLozenge = (pct: number) =>
    pct > 0
      ? "bg-green-100 text-green-800"
      : pct < 0
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

  const fmtChange = (prev: number, cur: number) => {
    if (prev === 0) return cur === 0 ? 0 : 100;
    return Math.round(((cur - prev) / prev) * 100);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead style={{ background: "#F4F5F7", color: C.subtle }}>
          <tr className="text-left text-[11px] uppercase tracking-wider">
            <Th>Competency / Question</Th>
            <Th>Previous</Th>
            <Th>Current</Th>
            <Th>Change</Th>
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
            // Category-level rollups derived strictly from the most recent assessment
            const prevAvg = latestCat
              ? +(
                  latestCat.questions.reduce((s, q) => s + q.previousScore, 0) /
                  Math.max(latestCat.questions.length, 1)
                ).toFixed(2)
              : +Math.max(0, row.current - 0.4).toFixed(2);
            const curAvg = latestCat ? latestCat.categoryCurrentAvg : row.current;
            const targetAvg = latestCat ? latestCat.categoryTarget : row.target;
            const gapAvg = +(curAvg - targetAvg).toFixed(2);
            const changePct = fmtChange(prevAvg, curAvg);
            return (
              <React.Fragment key={row.competency}>
                <tr
                  className="border-t hover:bg-[#FAFBFC] transition-colors cursor-pointer"
                  style={{ borderColor: C.border }}
                  onClick={() => setOpen((s) => ({ ...s, [row.competency]: !s[row.competency] }))}
                >
                  <Td className="font-semibold" style={{ color: C.navy }}>
                    <span className="inline-flex items-center gap-2">
                      <motion.span animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.15 }}>
                        <ChevronDown size={14} style={{ color: C.subtle }} />
                      </motion.span>
                      {canonical}
                      <span className="text-[10px] font-normal px-1.5 py-0.5 rounded" style={{ background: "#F4F5F7", color: C.subtle }}>
                        {subs.length} questions
                      </span>
                    </span>
                  </Td>
                  <Td style={{ color: C.slate }}>{prevAvg.toFixed(2)}</Td>
                  <Td style={{ color: C.navy, fontWeight: 600 }}>{curAvg.toFixed(2)}</Td>
                  <Td>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(changePct)}`}>
                      {changePct > 0 ? `+${changePct}%` : `${changePct}%`}
                    </span>
                  </Td>
                  <Td style={{ color: C.slate }}>{targetAvg.toFixed(2)}</Td>
                  <Td>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${gapLozenge(gapAvg)}`}>
                      {gapAvg > 0 ? `+${gapAvg}` : gapAvg}
                    </span>
                  </Td>
                  <Td style={{ color: C.subtle }}>
                    <span className="text-[11px]">{latestCat ? "Rollup" : "-"}</span>
                  </Td>
                  <Td>
                    <button
                      onClick={(e) => { e.stopPropagation(); onCreateObjective(); }}
                      className="text-xs font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded border hover:border-[#0052CC] transition-colors"
                      style={{ borderColor: C.border, color: C.primary }}
                    >
                      <Plus size={12} />
                      Create Objective
                    </button>
                  </Td>
                </tr>
                {isOpen && subs.map((sub) => {
                  // Prefer assessment-backed question data; fall back to mock rating.
                  const q = latestCat?.questions.find((qq) => qq.questionText === sub);
                  const prev = q ? q.previousScore : subRating(canonical, sub);
                  const cur = q ? q.currentScore : subRating(canonical, sub);
                  const tgt = q ? q.targetScore : 4;
                  const note = q?.justification ?? "";
                  const scale = EFFECTIVENESS_SCALE[Math.max(0, Math.min(4, cur - 1))];
                  const subGap = +(cur - tgt).toFixed(2);
                  const subChange = fmtChange(prev, cur);
                  return (
                    <tr
                      key={canonical + sub}
                      className="border-t bg-[#FAFBFC] hover:bg-[#F4F5F7] transition-colors"
                      style={{ borderColor: C.border }}
                    >
                      <Td className="pl-12" style={{ color: C.slate }}>
                        <div className="text-[13px] leading-snug" style={{ color: C.navy }}>{sub}</div>
                        <div className="text-[11px] mt-0.5" style={{ color: C.subtle }}>
                          Score: {cur} - {scale.label}
                        </div>
                      </Td>
                      <Td style={{ color: C.slate }}>{prev}</Td>
                      <Td style={{ color: C.navy, fontWeight: 600 }}>{cur}</Td>
                      <Td>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${changeLozenge(subChange)}`}>
                          {subChange > 0 ? `+${subChange}%` : `${subChange}%`}
                        </span>
                      </Td>
                      <Td style={{ color: C.slate }}>{tgt}</Td>
                      <Td>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${gapLozenge(subGap)}`}>
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
                          <span className="text-[11px]" style={{ color: C.subtle }}>-</span>
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
    <Card className="p-5" style={highlight ? { borderColor: C.primary, borderWidth: 1 } : undefined}>
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

type EvidenceItem = (typeof initialEvidence)[number];

function EvidenceView({
  rows,
  onOpenRow,
  onPermanentDelete,
  onRestore,
}: {
  rows: typeof initialEvidence;
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
      <div className="inline-flex rounded border overflow-hidden" style={{ borderColor: C.border }}>
        <button
          onClick={() => setShowArchived(false)}
          className="px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5"
          style={{ background: !showArchived ? C.primarySoft : "#fff", color: !showArchived ? C.primary : C.slate }}
        >
          <TableProperties size={12} /> Active Log
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className="px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 border-l"
          style={{ background: showArchived ? C.primarySoft : "#fff", color: showArchived ? C.primary : C.slate, borderColor: C.border }}
        >
          <Archive size={12} /> View Archived ({rows.filter((r) => r.isArchived).length})
        </button>
      </div>
    </div>
    <Card className="overflow-hidden">
      <div className="p-4 border-b flex items-center gap-2 flex-wrap" style={{ borderColor: C.border }}>
        <div className="w-72">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by title or keyword…"
            icon={<Search size={14} />}
          />
        </div>
        <Select icon={<Calendar size={14} />} defaultValue="all">
          <option value="all">All dates</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>This quarter</option>
        </Select>
        <Select icon={<Filter size={14} />} value={comp} onChange={(e) => setComp(e.target.value)}>
          <option>All</option>
          {COMPETENCIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Select icon={<Filter size={14} />} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Pending Review</option>
          <option>Reviewed</option>
        </Select>
        <Select icon={<Filter size={14} />} value={source} onChange={(e) => setSource(e.target.value)}>
          <option>All</option>
          <option>Bitbucket</option>
          <option>Jira</option>
          <option>GitHub</option>
          <option>GitLab</option>
          <option>Slack</option>
          <option>Teams</option>
          <option>Confluence</option>
        </Select>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-xs" style={{ color: C.subtle }}>
            {filtered.length} of {visible.length} items
          </div>
          <GhostBtn>
            <Download size={14} />
            Export Data
          </GhostBtn>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[960px]">
          <thead style={{ background: "#F4F5F7", color: C.subtle }}>
            <tr className="text-left text-[11px] uppercase tracking-wider">
              <Th>Date</Th>
              <Th>Source</Th>
              <Th>Competency</Th>
              <Th>Title</Th>
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
                <Td className="whitespace-nowrap" style={{ color: C.slate }}>
                  {r.date}
                </Td>
                <Td>
                  <SourceChip source={r.source} />
                </Td>
                <Td>
                  <Badge tone="info">{r.competency}</Badge>
                </Td>
                <Td className="font-semibold max-w-xs" style={{ color: C.navy }}>
                  {r.title}
                </Td>
                <Td>
                  {r.link ? (
                    <a
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 hover:underline"
                      style={{ color: C.primary }}
                      href={`https://${r.link}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={12} />
                      Open
                    </a>
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
                  <Td className="whitespace-nowrap" style={{ color: C.slate }}>{r.archivedDate ?? "-"}</Td>
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
                <td colSpan={showArchived ? 8 : 6} className="text-center py-12 text-sm" style={{ color: C.subtle }}>
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
  if (match === "Yes") return <Badge tone="success" icon={<CheckCircle2 size={11} />}>Match: Yes</Badge>;
  if (match === "No") return <Badge tone="danger" icon={<X size={11} />}>Match: No</Badge>;
  if (match === "Somewhat") return <Badge tone="warning" icon={<AlertCircle size={11} />}>Somewhat</Badge>;
  return <Badge tone="neutral">Not Set</Badge>;
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
    { id: "Pending Approval", label: "Pending Approval", tone: "warning" },
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
          <PrimaryBtn onClick={onCreate}>
            <Plus size={16} />
            Create SMART Objective
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
          <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.subtle }}>
            {o.id}
          </div>
          {o.status !== "Completed" && (
            <GripVertical size={14} style={{ color: C.subtle }} />
          )}
          {o.status === "Completed" && (
            <Lock size={12} style={{ color: C.subtle }} />
          )}
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
        <div className="px-5 py-3 border-t flex items-center justify-end gap-2" style={{ borderColor: C.border, background: C.bg }}>
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
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wider border-b" style={{ background: C.bg, borderColor: C.border, color: C.subtle }}>
            <Th>Objective</Th>
            <Th>Category</Th>
            <Th>Authored</Th>
            <Th>Archived</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id} className="border-b last:border-0 hover:bg-[#FAFBFC]" style={{ borderColor: C.border }}>
              <Td>
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.subtle }}>
                  {o.id}
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
                {o.archivedDate ?? "-"}
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

/* ============================================================ */
/*               OVERLAY: CAPTURE MODAL                         */
/* ============================================================ */

function CaptureModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (title: string, comps: string[], link: string, reflection: string) => void;
}) {
  const categories = Object.keys(SUBCATEGORIES);
  const [title, setTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState(categories[2]); // Code Quality
  const [subcategory, setSubcategory] = useState(SUBCATEGORIES[categories[2]][0]);
  const linkValid = !link || /^https?:\/\/\S+\.\S+/i.test(link);

  function onCategoryChange(v: string) {
    setCategory(v);
    setSubcategory(SUBCATEGORIES[v][0]);
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
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.subtle }}>
              Manual Capture
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: C.navy }}>
              Log new evidence
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[#F4F5F7]" style={{ color: C.slate }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Evidence Title">
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Led RFC review for payments cutover"
            />
          </Field>
          <Field label="Source link(s)">
            <div className="relative">
              <LinkIcon
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: C.subtle }}
              />
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
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
          <Field label="Reflection & Context">
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you learn? What impact did it have?"
              rows={4}
            />
          </Field>
          <Field label="Competency Category">
            <Select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <div className="text-[11px] mt-1.5 leading-relaxed" style={{ color: C.subtle }}>
              {COMPETENCY_DESC[category]}
            </div>
          </Field>
          <Field label="Subcategory / Question">
            <Select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
              {SUBCATEGORIES[category].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="p-4 border-t flex items-center justify-end gap-2" style={{ borderColor: C.border }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn disabled={!title || !linkValid} onClick={() => onSave(title, [category], link, reflection)}>
            Save to Log
          </PrimaryBtn>
        </div>
      </motion.div>
    </Backdrop>
  );
}

function Backdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold mb-1.5" style={{ color: C.slate }}>
        {label}
      </div>
      {children}
    </label>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 text-sm rounded border bg-[#F4F5F7] focus:bg-white outline-none transition-all resize-none"
      style={{ borderColor: C.border, color: C.navy }}
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
  const [deadline, setDeadline] = useState("");
  const [s, setS] = useState("");
  const [m, setM] = useState("");
  const [a, setA] = useState("");
  const [r, setR] = useState("");
  const [t, setT] = useState("");
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

  const formatDate = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "TBD";

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
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.subtle }}>
              New Objective
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: C.navy }}>
              Create SMART Objective
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[#F4F5F7]" style={{ color: C.slate }}>
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-5 flex-1 overflow-hidden">
          {/* Form */}
          <div className="col-span-3 p-6 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <Field label="Objective Title">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short, action-oriented title"
                />
              </Field>
              <Field label="Objective Statement">
                <Textarea
                  rows={3}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Describe what you intend to achieve and why it matters."
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Deadline">
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    icon={<Calendar size={14} />}
                  />
                </Field>
                <Field label="Target Category">
                  <Select value={competency} onChange={(e) => onCatChange(e.target.value)}>
                    {objCategories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Target Subcategory / Question">
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
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.subtle }}>
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
                  </div>
                </div>
                <Input
                  type="date"
                  value={t}
                  onChange={(e) => setT(e.target.value)}
                  icon={<Calendar size={14} />}
                />
                <div className="text-[11px] mt-1" style={{ color: C.subtle }}>
                  Specific timeframe or deadline.
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
              <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: C.primary }}>
                Pro Tip - Bloom's Taxonomy
              </div>
              <div className="text-xs leading-relaxed" style={{ color: C.navy }}>
                Rely on observable action verbs (identify, analyze, demonstrate). Instead of
                "understand the new software", use "execute core data-entry tasks".
              </div>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.subtle }}>
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

        <div className="p-4 border-t flex items-center justify-end gap-2" style={{ borderColor: C.border }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn
            disabled={!title || !statement || !deadline}
            onClick={() =>
              onSubmit({
                title,
                competency,
                due: formatDate(deadline),
                statement,
                dateAuthored: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }),
                specific: s,
                measurable: m,
                achievable: a,
                relevant: r,
                timebound: t ? `Complete by ${formatDate(t)}` : `Complete by ${formatDate(deadline)}`,
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
  const [smartOpen, setSmartOpen] = useState(false);
  const [links, setLinks] = useState(objective.links ?? []);
  const [newLink, setNewLink] = useState("");
  const [notes, setNotes] = useState(objective.notes ?? "");
  const [statement, setStatement] = useState(objective.statement ?? "");
  const [criteria, setCriteria] = useState(
    objective.successCriteria ?? { learn: [], demonstrate: [], share: [] },
  );
  const locked = objective.status === "Completed";
  const [editMode, setEditMode] = useState(false);
  const isEditable = !locked && editMode;
  const [confirmArchive, setConfirmArchive] = useState(false);

  function buildUpdated(): Objective {
    return { ...objective, notes, links, statement, successCriteria: criteria };
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
        className="absolute top-0 right-0 h-full w-full md:w-[48%] bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs" style={{ color: C.subtle }}>
              <span>Objectives</span>
              <ChevronRight size={12} />
              <span className="font-semibold" style={{ color: C.slate }}>
                {objective.id}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {!locked && (
                <>
                  <button
                    onClick={() => setEditMode((v) => !v)}
                    title={editMode ? "Done editing" : "Edit"}
                    className="p-1.5 rounded hover:bg-[#F4F5F7]"
                    style={{ color: editMode ? C.primary : C.slate }}
                  >
                    <Pencil size={16} />
                  </button>
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
                </>
              )}
              <button onClick={onClose} className="p-1.5 rounded hover:bg-[#F4F5F7]" style={{ color: C.slate }}>
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="text-xl font-bold mt-2 leading-snug" style={{ color: C.navy }}>
            {objective.title}
          </div>
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
            <Badge tone="info">{objective.competency}</Badge>
            <CountdownBadge due={objective.due} />
            {locked && (
              <span className="text-[11px]" style={{ color: C.subtle }}>
                Locked - read only
              </span>
            )}
          </div>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* SMART accordion */}
          <div className="rounded border" style={{ borderColor: C.border }}>
            <button
              onClick={() => setSmartOpen((x) => !x)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold"
              style={{ color: C.navy }}
            >
              <span>SMART Details</span>
              <motion.span animate={{ rotate: smartOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
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
                        <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.primary }}>
                          {k} - {n}
                        </div>
                        <div className="mt-0.5">{v || <span style={{ color: C.subtle }}>Not provided</span>}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Objective Statement */}
          {(objective.statement || isEditable) && (
            <section
              className="p-4 rounded border"
              style={{ borderColor: C.border, background: "#FAFBFC" }}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: C.subtle }}>
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
                <div className="text-sm leading-relaxed" style={{ color: C.navy }}>
                  {statement || <span style={{ color: C.subtle }}>No statement.</span>}
                </div>
              )}
              <div className="flex items-center justify-between mt-2 gap-3 flex-wrap">
                {objective.dateAuthored && (
                  <div className="text-[11px]" style={{ color: C.subtle }}>
                    Authored {objective.dateAuthored} - Deadline {objective.due}
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
                    { key: "learn" as const, label: "Learn", icon: BookOpen, tone: "info" as const, evidenceLabel: "Materials Used", evidencePlaceholder: "Link to docs, videos, courses", criteriaPlaceholder: "What will you learn?" },
                    {
                      key: "demonstrate" as const,
                      label: "Demonstrate",
                      icon: Wrench,
                      tone: "warning" as const,
                      evidenceLabel: "Evidence",
                      evidencePlaceholder: "Link to PR, code snippet, doc",
                      criteriaPlaceholder: "How will you apply what you learned?",
                    },
                    { key: "share" as const, label: "Share", icon: Share2, tone: "success" as const, evidenceLabel: "Presentation Artifacts", evidencePlaceholder: "Link to slides, YouTube, doc", criteriaPlaceholder: "How will you teach others?" },
                  ] as const
                ).map(({ key, label, icon: Icon, tone, evidenceLabel, evidencePlaceholder, criteriaPlaceholder }) => {
                  const rows = criteria[key] ?? [];
                  if (isEditable) {
                    return (
                      <div key={key} className="rounded border p-3" style={{ borderColor: C.border }}>
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
                            className="px-4 py-3 grid grid-cols-[1fr_auto] gap-3 items-start"
                            style={{ borderColor: C.border }}
                          >
                            <div>
                              <div className="text-sm leading-snug" style={{ color: C.navy }}>
                                {r.criteria}
                              </div>
                              <div className="text-[11px] mt-1 flex items-center gap-1" style={{ color: C.subtle }}>
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
                })}
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
                  className="flex items-center justify-between px-3 py-2 rounded border"
                  style={{ borderColor: C.border }}
                >
                  {isEditable ? (
                    <Input
                      value={l.label}
                      onChange={(e) =>
                        setLinks((arr) => arr.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))
                      }
                      placeholder="Label"
                    />
                  ) : (
                    <span className="text-sm" style={{ color: C.navy }}>
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
                      setLinks((l) => [...l, { label: newLink.replace(/^https?:\/\//, ""), url: newLink }]);
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
                {locked ? "Locked - artifacts are read-only." : "Enter edit mode to upload artifacts."}
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
              <PrimaryBtn
                onClick={() =>
                  onChangeStatus(buildUpdated(), nextStatus)
                }
              >
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

function ExtensionPopup({ onDismiss, onSave }: { onDismiss: () => void; onSave: () => void }) {
  const [trigger, setTrigger] = useState("event");
  const [text, setText] = useState(
    "Coordinated cutover plan with on-call and data teams; zero downtime achieved.",
  );
  const [comps, setComps] = useState<string[]>(["Analytical Thinking", "Delivery"]);
  function toggle(c: string) {
    setComps((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 right-6 w-96 rounded-lg shadow-xl border bg-white z-40 overflow-hidden"
      style={{ borderColor: C.border }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: C.border }}>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: C.primary }}
          >
            <RadarIcon size={13} color="#fff" />
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: C.navy }}>
            Evitrace
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "#F4F5F7", color: C.subtle }}>
            Extension
          </span>
        </div>
        <button onClick={onDismiss} className="p-1 rounded hover:bg-[#F4F5F7]" style={{ color: C.slate }}>
          <X size={14} />
        </button>
      </div>

      {/* Trigger */}
      <div className="px-4 pt-3">
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: C.subtle }}>
          Trigger
        </div>
        <Select value={trigger} onChange={(e) => setTrigger(e.target.value)}>
          <option value="event">Event: Ticket moved to Done</option>
          <option value="time">Time: 16:00 (1 hour before close)</option>
          <option value="pr">Event: Pull request merged</option>
        </Select>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-sm font-bold" style={{ color: C.navy }}>
          Great work! What did you learn?
        </div>
        <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
          Capture it while it's fresh.
        </div>
        <div className="mt-3">
          <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={12} style={{ color: C.primary }} />
            <span className="text-[11px] font-semibold" style={{ color: C.slate }}>
              AI auto-mapped competencies
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Analytical Thinking", "Delivery", "System Design", "Communication"].map((c) => (
              <Pill key={c} active={comps.includes(c)} onClick={() => toggle(c)}>
                {c}
              </Pill>
            ))}
          </div>
          {comps.length > 0 && (
            <div className="mt-2 space-y-1">
              {comps.map((c) => (
                <div key={c} className="text-[11px] leading-snug" style={{ color: C.subtle }}>
                  <span className="font-semibold" style={{ color: C.slate }}>{c}:</span>{" "}
                  {COMPETENCY_DESC[c]}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: C.border, background: C.bg }}>
        <GhostBtn onClick={onDismiss}>Snooze</GhostBtn>
        <PrimaryBtn onClick={onSave}>
          <CheckCircle size={14} />
          Save Evidence
        </PrimaryBtn>
      </div>
    </motion.div>
  );
}

/* ============================================================ */
/*                   TAB 5: SETTINGS HUB                        */
/* ============================================================ */

type SettingsSection =
  | "profile"
  | "team"
  | "notifications"
  | "extension"
  | "framework";

function SettingsView() {
  const [section, setSection] = useState<SettingsSection>("profile");
  const items: { id: SettingsSection; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "team", label: "Team & Manager", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "extension", label: "Extension Preferences", icon: Puzzle },
    { id: "framework", label: "Competency Framework", icon: Layers },
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
                onClick={() => setSection(it.id)}
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

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
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
    <div className="flex items-center justify-between py-3 border-b last:border-b-0" style={{ borderColor: C.border }}>
      <div className="pr-6">
        <div className="text-sm font-semibold" style={{ color: C.navy }}>
          {title}
        </div>
        <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
          {desc}
        </div>
      </div>
      {right}
    </div>
  );
}

function ProfileSettings() {
  return (
    <Card className="p-6">
      <SectionHeader title="Profile" sub="Your personal information and role" />
      <div className="mt-5 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold text-white"
          style={{ background: "#5243AA" }}
        >
          JM
        </div>
        <div>
          <div className="text-base font-semibold" style={{ color: C.navy }}>
            Jordan Mills
          </div>
          <div className="text-sm" style={{ color: C.subtle }}>
            Senior Engineer L3 - Payments
          </div>
        </div>
        <div className="ml-auto">
          <GhostBtn>Upload photo</GhostBtn>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Field label="Full name">
          <Input defaultValue="Jordan Mills" />
        </Field>
        <Field label="Email">
          <Input defaultValue="jordan.mills@acme.com" />
        </Field>
        <Field label="Current level">
          <Select defaultValue="L3">
            <option>L2</option>
            <option>L3</option>
            <option>L4</option>
            <option>L5</option>
          </Select>
        </Field>
        <Field label="Target level">
          <Select defaultValue="L4">
            <option>L3</option>
            <option>L4</option>
            <option>L5</option>
          </Select>
        </Field>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <GhostBtn>Cancel</GhostBtn>
        <PrimaryBtn>Save changes</PrimaryBtn>
      </div>
    </Card>
  );
}

function TeamSettings() {
  return (
    <Card className="p-6">
      <SectionHeader title="Team & Manager" sub="Who reviews your evidence and approves objectives" />
      <div className="mt-5 grid grid-cols-2 gap-4">
        <Field label="Reporting manager">
          <Input defaultValue="Alex Morgan" />
        </Field>
        <Field label="Manager email">
          <Input defaultValue="alex.morgan@acme.com" />
        </Field>
        <Field label="Team">
          <Input defaultValue="Payments Platform" />
        </Field>
        <Field label="Skip-level reviewer">
          <Input defaultValue="Priya Shah" />
        </Field>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <PrimaryBtn>Request sync</PrimaryBtn>
      </div>
    </Card>
  );
}

function NotificationsSettings() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  const [c, setC] = useState(false);
  const [d, setD] = useState(true);
  return (
    <Card className="p-6">
      <SectionHeader title="Notifications" sub="Control how Evitrace reaches you" />
      <div className="mt-3">
        <SettingRow
          title="Daily reflection reminder"
          desc="Nudge me at 16:00 to log evidence before close of day."
          right={<Toggle on={a} onChange={setA} />}
        />
        <SettingRow
          title="Manager approvals"
          desc="Email me when my manager approves or comments."
          right={<Toggle on={b} onChange={setB} />}
        />
        <SettingRow
          title="Weekly digest"
          desc="Monday summary of evidence, gaps, and objective progress."
          right={<Toggle on={c} onChange={setC} />}
        />
        <SettingRow
          title="Browser push"
          desc="Show desktop notifications from the Evitrace extension."
          right={<Toggle on={d} onChange={setD} />}
        />
      </div>
    </Card>
  );
}

function ExtensionSettings() {
  const [auto, setAuto] = useState(true);
  const [jira, setJira] = useState(true);
  const [gh, setGh] = useState(true);
  const [slack, setSlack] = useState(false);
  return (
    <Card className="p-6">
      <SectionHeader title="Extension Preferences" sub="Capture sources and trigger windows" />
      <div className="mt-3">
        <SettingRow
          title="Auto-capture events"
          desc="Surface a capture prompt when work is completed."
          right={<Toggle on={auto} onChange={setAuto} />}
        />
        <SettingRow
          title="Jira"
          desc="Trigger when a ticket moves to Done."
          right={<Toggle on={jira} onChange={setJira} />}
        />
        <SettingRow
          title="GitHub"
          desc="Trigger when a PR is merged with you as author or reviewer."
          right={<Toggle on={gh} onChange={setGh} />}
        />
        <SettingRow
          title="Slack"
          desc="Trigger on saved threads tagged with #wins."
          right={<Toggle on={slack} onChange={setSlack} />}
        />
      </div>
    </Card>
  );
}

function FrameworkSettings() {
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [activeFramework, setActiveFramework] = useState<{
    name: string;
    summary: string;
  } | null>({
    name: "Company Engineering Matrix v2.0",
    summary: "8 Categories, 42 Questions",
  });
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  function handleFile(file: File) {
    const name = file.name.toLowerCase();
    const validExt = name.endsWith(".json") || name.endsWith(".csv");
    const validType =
      file.type === "application/json" ||
      file.type === "text/csv" ||
      validExt;
    if (!validType) {
      toast.error("Invalid file format. Please upload a valid JSON or CSV framework schema.");
      return;
    }
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      setActiveFramework({
        name: file.name.replace(/\.(json|csv)$/i, ""),
        summary: "8 Categories, 42 Questions",
      });
      toast.success("Framework successfully updated.");
    }, 1000);
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
          accept=".json,.csv,application/json,text/csv"
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
              Supports .JSON or .CSV
            </div>
          </>
        )}
      </div>

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
                {activeFramework.name} - {activeFramework.summary}
              </div>
            </div>
          </div>
          <Badge tone="success">Active</Badge>
        </div>
      )}

      <div className="mt-6 text-xs font-semibold uppercase tracking-wider" style={{ color: C.subtle }}>
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
  const dirty = JSON.stringify(draft) !== JSON.stringify(item);
  const update = <K extends keyof EvidenceItem>(k: K, v: EvidenceItem[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));
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
            <div className="flex items-center gap-1 text-xs" style={{ color: C.subtle }}>
              <span>Evidence Log</span>
              <ChevronRight size={12} />
              <span className="font-semibold" style={{ color: C.slate }}>
                {item.id}
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
          <input
            value={draft.title}
            onChange={(e) => update("title", e.target.value)}
            className="text-xl font-bold mt-2 leading-snug w-full bg-transparent outline-none border border-transparent hover:border-[#DFE1E6] focus:border-[#0052CC] focus:bg-white rounded px-1 -mx-1 py-0.5"
            style={{ color: C.navy }}
          />
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs" style={{ color: C.subtle }}>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {item.date}
            </span>
            <SourceChip source={draft.source} />
            {draft.status === "Reviewed" ? (
              <Badge tone="success" icon={<CheckCircle size={11} />}>Reviewed</Badge>
            ) : (
              <Badge tone="warning" icon={<Clock size={11} />}>Pending Review</Badge>
            )}
            <MatchBadge match={draft.matchState} />
          </div>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
          <section>
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.subtle }}>
              Competency Mapping
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.subtle }}>Category</div>
                <Select value={draft.category} onChange={(e) => update("category", e.target.value)}>
                  {["Technical", "Leadership", "Delivery", "Objective"].map((c) => <option key={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.subtle }}>Subcategory / Question</div>
                <Select value={draft.competency} onChange={(e) => update("competency", e.target.value)}>
                  {COMPETENCIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
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
              style={{ borderColor: C.border, color: C.slate }}
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
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.subtle }}>Source</div>
                <Select value={draft.source} onChange={(e) => update("source", e.target.value)}>
                  {["Bitbucket", "GitHub", "GitLab", "Jira", "Slack", "Teams", "Confluence", "Figma", "Trello", "Excel", "PowerPoint", "Word"].map((s) => <option key={s}>{s}</option>)}
                </Select>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.subtle }}>Link</div>
                <div className="flex gap-2">
                  <Input
                    value={draft.link}
                    onChange={(e) => update("link", e.target.value)}
                    placeholder="example.com/path or full URL"
                    icon={<LinkIcon size={14} />}
                  />
                  {draft.link && (
                    <GhostBtn
                      onClick={() => {
                        const u = /^https?:\/\//i.test(draft.link) ? draft.link : `https://${draft.link}`;
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
              <div className="text-sm font-bold" style={{ color: C.navy }}>Manager Review</div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.subtle }}>Review Status</div>
                <Select value={draft.status} onChange={(e) => update("status", e.target.value as EvidenceStatus)}>
                  <option>Pending Review</option>
                  <option>Reviewed</option>
                </Select>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.subtle }}>Competency Match</div>
                <div className="grid grid-cols-4 gap-2">
                  {(["Yes", "Somewhat", "No", "Unset"] as EvidenceMatch[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => update("matchState", m)}
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
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.subtle }}>Manager Assessment</div>
              <textarea
                value={draft.managerNotes}
                onChange={(e) => update("managerNotes", e.target.value)}
                placeholder="Manager corroborates context, asks for more detail, suggests rewording, or links related artifacts."
                className="w-full min-h-[120px] resize-y text-sm rounded border px-3 py-2 outline-none focus:ring-2"
                style={{ borderColor: C.border, color: C.slate, background: "#fff" }}
              />
            </div>
          </section>
        </div>


        <div
          className="px-6 py-4 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <GhostBtn onClick={onClose}>Close</GhostBtn>
          <PrimaryBtn onClick={() => onSave(draft)} disabled={!dirty}>
            <Save size={14} />
            Save Changes
          </PrimaryBtn>
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
  onOpenAssessment,
  onClearReview,
  onStartReview,
  onOpenHistory,
}: {
  evidence: typeof initialEvidence;
  objectives: Objective[];
  radarData: typeof initialRadar;
  onFlash: (m: string) => void;
  review: ReviewSession | null;
  assessments: Assessment[];
  onOpenAssessment: (a: Assessment) => void;
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

  const [topics, setTopics] = useState<string[]>([
    "Discuss timeline for the formal L4 promotion panel.",
    "Request budget for AWS Advanced Networking certification.",
    "Align on which Q4 initiative best demonstrates System Design at L4.",
  ]);
  const [draft, setDraft] = useState("");

  function addTopic() {
    const t = draft.trim();
    if (!t) return;
    setTopics((x) => [...x, t]);
    setDraft("");
  }

  function removeTopic(i: number) {
    setTopics((x) => x.filter((_, idx) => idx !== i));
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
            <PrimaryBtn onClick={onStartReview}>
              <ClipboardList size={14} />
              Start Performance Review
            </PrimaryBtn>
          </div>
        </div>

        <AssessmentsArchiveTable
          assessments={assessments}
          onOpen={onOpenAssessment}
        />

        {assessments.length === 0 && (
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
      <div className="flex items-center justify-between mb-6 print-hide">
        <div className="text-sm" style={{ color: C.subtle }}>
          Viewing report {review.id}. Use the archive to switch between historical assessments.
        </div>
        <div className="flex items-center gap-2">
          <GhostBtn onClick={onClearReview}>
            <ArrowLeft size={14} />
            Back to archive
          </GhostBtn>
          <GhostBtn onClick={onOpenHistory}>
            <History size={14} />
            Assessment History
          </GhostBtn>
          <PrimaryBtn onClick={onStartReview}>
            <ClipboardList size={14} />
            Start Performance Review
          </PrimaryBtn>
        </div>
      </div>

      {/* Sticky action bar */}
      <div
        className="sticky top-0 z-20 -mx-8 px-8 py-3 mb-6 border-b flex items-center justify-between print-hide"
        style={{ background: C.bg, borderColor: C.border }}
      >
        <nav className="flex items-center gap-1.5 text-xs" style={{ color: C.subtle }}>
          <span>Reviews &amp; Reports</span>
          <ChevronRight size={12} />
          <span className="font-semibold" style={{ color: C.navy }}>
            {review.period}
          </span>
        </nav>
        <div className="flex items-center gap-2">
          <GhostBtn onClick={copyLink}>
            <LinkIcon size={14} />
            Copy Share Link
          </GhostBtn>
          <PrimaryBtn onClick={() => window.print()} className="print:hidden">
            <Download size={14} />
            Export to PDF
          </PrimaryBtn>
        </div>
      </div>

      {/* Document */}
      <article
        className="max-w-4xl mx-auto bg-white border rounded shadow-md p-10 print-document print:w-full print:m-0 print:p-0 print:text-slate-900 print:border-slate-200"
        style={{ borderColor: C.border }}
      >
        {/* 1. Header */}
        <header className="print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: C.primary }}
            >
              <RadarIcon size={18} color="#fff" />
            </div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: C.navy }}
            >
              Evitrace Performance Report
            </h1>
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
            This review captured updated effectiveness scores across{" "}
            <span style={{ color: C.navy, fontWeight: 600 }}>{Object.keys(review.scores).length}</span>{" "}
            competency categories.{" "}
            {deltas.filter((d) => d.to > d.from).length > 0 && (
              <>
                Notable growth was recorded in{" "}
                <span style={{ color: C.navy, fontWeight: 600 }}>
                  {deltas
                    .filter((d) => d.to > d.from)
                    .slice(0, 2)
                    .map((d) => d.name)
                    .join(" and ")}
                </span>
                .{" "}
              </>
            )}
            <span style={{ color: C.navy, fontWeight: 600 }}>{approved.length}</span> pieces of
            evidence are verified in the log. Current readiness for L4 is at{" "}
            <span style={{ color: C.primary, fontWeight: 700 }}>{overallReadiness ?? 0}%</span>.
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
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {deltas.map((d) => {
              const pct = d.from === 0 ? 0 : Math.round(((d.to - d.from) / d.from) * 100);
              const width = Math.min(100, (d.to / 4) * 100);
              const positive = d.to >= d.from;
              return (
                <div key={d.name}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div className="text-sm font-semibold" style={{ color: C.navy }}>
                      {d.name}
                    </div>
                    <div className="text-xs font-medium" style={{ color: C.slate }}>
                      {d.from.toFixed(2)} → {d.to.toFixed(2)}{" "}
                      <span
                        style={{ color: positive ? C.green : C.red, fontWeight: 700 }}
                      >
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
                  className="p-4 rounded border"
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
                className="border-l-4 pl-4 py-3 pr-4 rounded-sm"
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
                  Verified on {e.date}
                </div>
              </div>
            ))}
          </div>
          )}
        </section>

        {/* 6. Objectives */}
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
            className="mt-4 p-5 rounded border"
            style={{ background: C.bg, borderColor: C.border }}
          >
            <ol className="space-y-2.5">
              {topics.map((t, i) => (
                <li key={i} className="group flex items-start gap-3 text-sm" style={{ color: C.slate }}>
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
            </div>
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
    </div>
  );
}

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
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
            className="p-3 rounded border"
            style={{ borderColor: C.border, background: "#FFFFFF" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold leading-snug" style={{ color: C.navy }}>
                {o.title}
              </div>
              <Badge tone={tone}>{o.status}</Badge>
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
  item: (typeof initialInbox)[number];
  onClose: () => void;
  onConfirm: (comps: string[]) => void;
  onDismiss: () => void;
}) {
  const inboxCats = Object.keys(SUBCATEGORIES);
  const initialCat = inboxCats.find((c) => item.suggestion.includes(c)) ?? inboxCats[0];
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>(item.suggestion);
  const [category, setCategory] = useState(initialCat);
  const [subcategory, setSubcategory] = useState(SUBCATEGORIES[initialCat][0]);
  const Icon = item.icon;
  function toggle(c: string) {
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  }
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
            The AI captured this event {item.when}. Confirm details before saving to your evidence log.
          </div>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <section>
            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: C.subtle }}>
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
            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: C.subtle }}>
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
                  <Icon size={14} />
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
            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: C.subtle }}>
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
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: C.subtle }}>
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
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.subtle }}>Category</div>
                <Select value={category} onChange={(e) => onCatChange(e.target.value)}>
                  {inboxCats.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.subtle }}>Subcategory / Question</div>
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
            Dismiss Event
          </button>
          <PrimaryBtn onClick={() => onConfirm(selected.length > 0 ? selected : [category])}>
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
}: {
  evidence: typeof initialEvidence;
  onClose: () => void;
  onFinalize: (s: ReviewSession) => void;
  onOpenEvidence: (e: (typeof initialEvidence)[number]) => void;
}) {
  const categories = ALL_CATEGORIES;
  const [activeIdx, setActiveIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, Record<string, ReviewQuestion>>>(() => {
    const init: Record<string, Record<string, ReviewQuestion>> = {};
    categories.forEach((cat) => {
      init[cat] = {};
      SUBCATEGORIES[cat].forEach((sub) => {
        const prev = subRating(cat, sub);
        init[cat][sub] = { prev, next: prev, notes: "", evidenceIds: [] };
      });
    });
    return init;
  });
  const [attachOpenFor, setAttachOpenFor] = useState<string | null>(null);

  const activeCat = categories[activeIdx];
  const isLast = activeIdx === categories.length - 1;

  function updateQ(cat: string, sub: string, patch: Partial<ReviewQuestion>) {
    setScores((s) => ({
      ...s,
      [cat]: { ...s[cat], [sub]: { ...s[cat][sub], ...patch } },
    }));
  }

  function toggleEvidence(cat: string, sub: string, id: string) {
    setScores((s) => {
      const existing = s[cat][sub].evidenceIds;
      const next = existing.includes(id)
        ? existing.filter((x) => x !== id)
        : [...existing, id];
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
      id: `REV-${today.getFullYear()}-Q${Math.ceil((today.getMonth() + 1) / 3)}`,
      date: today.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      period: `${today.toLocaleString("en-US", { month: "long" })} ${today.getFullYear()}`,
      engineer: "Courage U.",
      manager: "Alex M.",
      scores,
    };
    onFinalize(session);
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
            onClick={onClose}
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
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.subtle }}>
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
                          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.subtle }}>
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
                            onChange={(e) => updateQ(activeCat, sub, { next: Number(e.target.value) })}
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
                              color:
                                q.next > q.prev ? C.green : q.next < q.prev ? C.red : C.subtle,
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
                          Attach Evidence{q.evidenceIds.length > 0 ? ` (${q.evidenceIds.length})` : ""}
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
                                    <div className="text-[13px] font-semibold truncate" style={{ color: C.navy }}>
                                      {ev.title}
                                    </div>
                                    <div className="text-[11px]" style={{ color: C.subtle }}>
                                      {ev.id} · {ev.source} · {ev.date}
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
                <GhostBtn onClick={onClose}>
                  <X size={14} />
                  Cancel
                </GhostBtn>
                <GhostBtn onClick={() => { /* draft is in-memory */ onClose(); }}>
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
                  <PrimaryBtn onClick={() => setActiveIdx((i) => Math.min(categories.length - 1, i + 1))}>
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
}: {
  assessments: Assessment[];
  onOpen: (a: Assessment) => void;
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
              <Th> </Th>
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
              const date = new Date(a.dateCompleted).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              });
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
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#EBECF0" }}>
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
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-[#F4F5F7]"
                      style={{ color: C.subtle }}
                      aria-label="Open report"
                    >
                      <ChevronRight size={16} />
                    </span>
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
  onClose,
  onOpen,
}: {
  assessments: Assessment[];
  currentId: string | null;
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
        <div className="px-5 h-14 flex items-center justify-between border-b" style={{ borderColor: C.border }}>
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
            const date = new Date(a.dateCompleted).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            });
            return (
              <button
                key={a.id}
                onClick={() => onOpen(a)}
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
                    <Badge tone={a.status === "Finalized" ? "success" : "warning"}>{a.status}</Badge>
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
              </button>
            );
          })}
        </div>
        <div className="px-5 h-14 flex items-center justify-end border-t" style={{ borderColor: C.border }}>
          <GhostBtn onClick={onClose}>Close</GhostBtn>
        </div>
      </motion.div>
    </motion.div>
  );
}

