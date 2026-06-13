import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Evitrace — Engineering Competency & Promotion Tracking" },
      {
        name: "description",
        content:
          "Capture evidence of your work, map it to competencies, and close the gap to your next promotion.",
      },
      { property: "og:title", content: "Evitrace — Promotion Radar for Engineers" },
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
  tone?: "neutral" | "success" | "warning" | "info";
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const map = {
    neutral: { bg: "#F4F5F7", fg: C.slate },
    success: { bg: C.greenSoft, fg: "#006644" },
    warning: { bg: C.amberSoft, fg: "#974F00" },
    info: { bg: C.primarySoft, fg: C.primary },
  } as const;
  const s = map[tone];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 h-6 text-[11px] font-semibold uppercase tracking-wide rounded"
      style={{ background: s.bg, color: s.fg }}
    >
      {icon}
      {children}
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

const initialEvidence = [
  {
    id: "EV-201",
    date: "Dec 02, 2026",
    source: "GitHub",
    category: "Technical",
    competency: "System Design",
    title: "Migrated billing service to event-driven model",
    description: "Designed Kafka topology and rollout plan; zero downtime cutover.",
    link: "github.com/acme/billing/pr/482",
    status: "Approved" as const,
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
    status: "Approved" as const,
  },
  {
    id: "EV-199",
    date: "Nov 24, 2026",
    source: "Manual Capture",
    category: "Leadership",
    competency: "Communication",
    title: "Ran cross-team RFC review",
    description: "Facilitated 12-person review; consolidated 3 proposals into 1.",
    link: "notion.so/rfc-payments",
    status: "Pending" as const,
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
    status: "Approved" as const,
  },
  {
    id: "EV-197",
    date: "Nov 11, 2026",
    source: "GitHub",
    category: "Technical",
    competency: "Code Quality",
    title: "Reduced p95 latency by 38%",
    description: "Profiled hot path, replaced N+1 query with batched loader.",
    link: "github.com/acme/api/pr/612",
    status: "Approved" as const,
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

type Objective = {
  id: string;
  title: string;
  competency: string;
  due: string;
  status: "Pending Approval" | "In Progress" | "Completed";
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  timebound?: string;
  links?: { label: string; url: string }[];
  notes?: string;
};

const initialObjectives: Objective[] = [
  {
    id: "UIUX-01",
    title: "Design a targeted social media advertising campaign",
    competency: "Engineering for User Experience",
    due: "Dec 15, 2026",
    status: "In Progress",
    specific:
      "Design and prototype a 4-channel ad campaign for the developer audience targeting trial signups.",
    measurable:
      "Ship a click-through prototype reviewed by Design, with at least 2 user testing sessions completed.",
    achievable: "Allocate 4 hours weekly; pair with the Brand designer on Figma sessions.",
    relevant: "Closes the UX Eng gap required for L4 promotion criteria.",
    timebound: "Complete by Dec 15, 2026",
    links: [{ label: "Figma Auto-Layout Tutorial", url: "https://figma.com" }],
    notes: "Initial moodboard collected; testing 3 messaging directions next week.",
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

type Tab = "dashboard" | "radar" | "evidence" | "objectives" | "settings";

function EvitraceApp() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [evidence, setEvidence] = useState(initialEvidence);
  const [inbox, setInbox] = useState(initialInbox);
  const [radarData, setRadarData] = useState(initialRadar);
  const [objectives, setObjectives] = useState(initialObjectives);

  const [showExtension, setShowExtension] = useState(true);
  const [showCapture, setShowCapture] = useState(false);
  const [showCreateObjective, setShowCreateObjective] = useState(false);
  const [openObjective, setOpenObjective] = useState<Objective | null>(null);
  const [openEvidence, setOpenEvidence] = useState<(typeof initialEvidence)[number] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const pageTitle: Record<Tab, string> = {
    dashboard: "Dashboard",
    radar: "Promotion Readiness",
    evidence: "Evidence Log",
    objectives: "Objectives",
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
        status: "Pending" as const,
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
    <div className="min-h-screen flex" style={{ background: C.bg, color: C.navy, fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar tab={tab} setTab={setTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader title={pageTitle[tab]} onCapture={() => setShowCapture(true)} />

        <main className="flex-1 px-8 py-6">
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
                  onApprove={approveInbox}
                />
              )}
              {tab === "radar" && (
                <RadarView
                  data={radarData}
                  onCreateObjective={() => setShowCreateObjective(true)}
                />
              )}
              {tab === "evidence" && (
                <EvidenceView rows={evidence} onOpenRow={setOpenEvidence} />
              )}
              {tab === "objectives" && (
                <ObjectivesView
                  items={objectives}
                  onOpen={setOpenObjective}
                  onCreate={() => setShowCreateObjective(true)}
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
            onSave={(title, comps) => {
              setEvidence((e) => [
                {
                  id: `EV-${300 + e.length}`,
                  date: new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }),
                  source: "Manual Capture",
                  category: "Technical",
                  competency: comps[0] ?? "Delivery",
                  title,
                  description: "Manually captured reflection",
                  link: "",
                  status: "Pending" as const,
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
            onComplete={(o) => {
              setObjectives((x) =>
                x.map((it) => (it.id === o.id ? { ...it, status: "Completed" as const } : it)),
              );
              setEvidence((e) => [
                {
                  id: `EV-${300 + e.length}`,
                  date: new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }),
                  source: "Manual Capture",
                  category: "Objective",
                  competency: o.competency,
                  title: o.title,
                  description: o.notes ?? "Completed objective summary",
                  link: "",
                  status: "Pending" as const,
                },
                ...e,
              ]);
              setOpenObjective(null);
              flash("Objective completed and added to evidence");
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
            onDelete={(id: string) => {
              setEvidence((e) => e.filter((x) => x.id !== id));
              setOpenEvidence(null);
              flash("Evidence deleted");
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

function Sidebar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const nav: { id: Tab; label: string; sub: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: "dashboard", label: "Dashboard", sub: "Daily Actions", icon: LayoutDashboard },
    { id: "radar", label: "Promotion Readiness", sub: "Assessment & Gaps", icon: TrendingUp },
    { id: "evidence", label: "Evidence Log", sub: "Data Table", icon: TableProperties },
    { id: "objectives", label: "Objectives", sub: "Skill Gap Planning", icon: Target },
    { id: "settings", label: "Settings", sub: "App & Profile", icon: SettingsIcon },
  ];
  return (
    <aside
      className="w-64 shrink-0 border-r flex flex-col"
      style={{ background: C.card, borderColor: C.border }}
    >
      <div className="h-16 px-5 flex items-center gap-2 border-b" style={{ borderColor: C.border }}>
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ background: C.primary }}
        >
          <RadarIcon size={18} color="#fff" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight" style={{ color: C.navy }}>
            Evitrace
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: C.subtle }}>
            Promotion Radar
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map((n) => {
          const active = tab === n.id;
          const Icon = n.icon;
          return (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className="w-full flex items-start gap-3 px-3 py-2.5 rounded text-left transition-colors group"
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
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{n.label}</div>
                <div
                  className="text-[11px]"
                  style={{ color: active ? C.primary : C.subtle }}
                >
                  {n.sub}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: C.border }}>
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold" style={{ color: C.navy }}>
              Promotion to L4
            </div>
            <span className="text-xs font-bold" style={{ color: C.primary }}>
              68%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#EBECF0" }}>
            <div className="h-full rounded-full" style={{ width: "68%", background: C.primary }} />
          </div>
          <div className="mt-2 text-[11px]" style={{ color: C.subtle }}>
            5 evidence items shy of target
          </div>
        </Card>

        <div className="flex items-center gap-2 mt-3 px-1">
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
      </div>
    </aside>
  );
}

function TopHeader({ title, onCapture }: { title: string; onCapture: () => void }) {
  return (
    <header
      className="h-16 sticky top-0 z-30 flex items-center justify-between px-8 border-b"
      style={{ background: C.card, borderColor: C.border }}
    >
      <h1 className="text-xl font-bold tracking-tight" style={{ color: C.navy }}>
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input placeholder="Search evidence, objectives, people…" icon={<Search size={14} />} />
        </div>
        <button
          className="w-9 h-9 rounded flex items-center justify-center hover:bg-[#F4F5F7] relative"
          style={{ color: C.slate }}
        >
          <Bell size={18} />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: C.red }}
          />
        </button>
        <PrimaryBtn onClick={onCapture}>
          <Plus size={16} />
          Capture Evidence
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
  onApprove,
}: {
  inbox: typeof initialInbox;
  objectives: Objective[];
  onApprove: (id: string, comps: string[]) => void;
}) {
  const active = objectives.filter((o) => o.status === "In Progress");
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
        {/* Widget B */}
        <Card className="col-span-2 p-5">
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
                <InboxRow key={it.id} item={it} onApprove={onApprove} />
              ))
            )}
          </div>
        </Card>

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
              <div
                key={o.id}
                className="flex items-start gap-3 p-3 rounded border hover:border-[#0052CC] transition-colors"
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
              </div>
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
  onApprove,
}: {
  item: (typeof initialInbox)[number];
  onApprove: (id: string, comps: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(item.suggestion);
  const Icon = item.icon;
  function toggle(c: string) {
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  }
  return (
    <div className="py-4 flex items-start gap-3">
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
          {COMPETENCIES.slice(0, 5).map((c) => (
            <Pill key={c} active={selected.includes(c)} onClick={() => toggle(c)}>
              {c}
            </Pill>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <GhostBtn>Dismiss</GhostBtn>
        <PrimaryBtn onClick={() => onApprove(item.id, selected)}>
          Confirm
          <ArrowUpRight size={14} />
        </PrimaryBtn>
      </div>
    </div>
  );
}

/* ============================================================ */
/*                  TAB 2: RADAR                                */
/* ============================================================ */

function RadarView({
  data,
  onCreateObjective,
}: {
  data: typeof initialRadar;
  onCreateObjective: () => void;
}) {
  const current = useMemo(
    () => +(data.reduce((s, d) => s + d.current, 0) / data.length).toFixed(2),
    [data],
  );
  const readiness = Math.round((current / 4) * 100);
  const top = [...data].sort((a, b) => b.current - a.current)[0];
  const gap = [...data].sort((a, b) => b.target - b.current - (a.target - a.current))[0];

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="grid grid-cols-4 gap-4">
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

      {/* Competency Matrix */}
      <div className="grid grid-cols-5 gap-6">
        <Card className="col-span-2 p-6">
          <SectionHeader
            title="Competency Radar"
            sub="Current score vs Level 4 target"
            right={
              <div className="flex items-center gap-3 text-xs" style={{ color: C.slate }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.primary }} />
                  Current
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm border-2"
                    style={{ borderColor: C.amber, background: "transparent" }}
                  />
                  Target L4
                </span>
              </div>
            }
          />
          <div className="h-[420px] mt-4">
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
                  stroke={C.amber}
                  fill={C.amber}
                  fillOpacity={0.08}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke={C.primary}
                  fill={C.primary}
                  fillOpacity={0.25}
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
          </div>
        </Card>

        <Card className="col-span-3 p-0 overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: C.border }}>
            <SectionHeader title="Real-Time Gap Analysis" sub="Targeted actions to close each gap" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "#F4F5F7", color: C.subtle }}>
                <tr className="text-left text-[11px] uppercase tracking-wider">
                  <Th>Competency</Th>
                  <Th>Current</Th>
                  <Th>Target</Th>
                  <Th>Gap</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const g = +(row.target - row.current).toFixed(2);
                  const tone = g >= 1 ? C.red : g >= 0.5 ? C.amber : C.green;
                  return (
                    <tr
                      key={row.competency}
                      className="border-t hover:bg-[#FAFBFC] transition-colors"
                      style={{ borderColor: C.border }}
                    >
                      <Td className="font-semibold" style={{ color: C.navy }}>
                        {row.competency}
                      </Td>
                      <Td style={{ color: C.slate }}>{row.current.toFixed(2)}</Td>
                      <Td style={{ color: C.slate }}>{row.target.toFixed(2)}</Td>
                      <Td>
                        <span className="font-semibold" style={{ color: tone }}>
                          {g > 0 ? `+${g}` : g}
                        </span>
                      </Td>
                      <Td>
                        <button
                          onClick={onCreateObjective}
                          className="text-xs font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded border hover:border-[#0052CC] transition-colors"
                          style={{ borderColor: C.border, color: C.primary }}
                        >
                          <Plus size={12} />
                          Create Objective
                        </button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
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
}: {
  rows: typeof initialEvidence;
  onOpenRow: (r: EvidenceItem) => void;
}) {
  const [q, setQ] = useState("");
  const [comp, setComp] = useState("All");
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");

  const filtered = rows.filter(
    (r) =>
      (q === "" || r.title.toLowerCase().includes(q.toLowerCase())) &&
      (comp === "All" || r.competency === comp) &&
      (status === "All" || r.status === status) &&
      (source === "All" || r.source === source),
  );

  return (
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
          <option>Pending</option>
          <option>Approved</option>
        </Select>
        <Select icon={<Filter size={14} />} value={source} onChange={(e) => setSource(e.target.value)}>
          <option>All</option>
          <option>Jira</option>
          <option>GitHub</option>
          <option>Slack</option>
          <option>Manual Capture</option>
        </Select>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-xs" style={{ color: C.subtle }}>
            {filtered.length} of {rows.length} items
          </div>
          <GhostBtn>
            <Download size={14} />
            Export Data
          </GhostBtn>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: "#F4F5F7", color: C.subtle }}>
            <tr className="text-left text-[11px] uppercase tracking-wider">
              <Th>Date</Th>
              <Th>Source</Th>
              <Th>Category</Th>
              <Th>Competency</Th>
              <Th>Title</Th>
              <Th>Description</Th>
              <Th>Link</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => onOpenRow(r)}
                className="border-t hover:bg-[#FAFBFC] transition-colors cursor-pointer"
                style={{ borderColor: C.border }}
              >
                <Td className="whitespace-nowrap" style={{ color: C.slate }}>
                  {r.date}
                </Td>
                <Td>
                  <Badge tone="neutral">{r.source}</Badge>
                </Td>
                <Td style={{ color: C.slate }}>{r.category}</Td>
                <Td>
                  <Badge tone="info">{r.competency}</Badge>
                </Td>
                <Td className="font-semibold" style={{ color: C.navy }}>
                  {r.title}
                </Td>
                <Td style={{ color: C.slate }} className="max-w-sm">
                  <span className="line-clamp-1">{r.description}</span>
                </Td>
                <Td>
                  {r.link ? (
                    <a
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
                    <span style={{ color: C.subtle }}>—</span>
                  )}
                </Td>
                <Td>
                  {r.status === "Approved" ? (
                    <Badge tone="success" icon={<CheckCircle size={11} />}>
                      Approved
                    </Badge>
                  ) : (
                    <Badge tone="warning" icon={<Clock size={11} />}>
                      Pending
                    </Badge>
                  )}
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-sm" style={{ color: C.subtle }}>
                  No evidence matches your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
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
}: {
  items: Objective[];
  onOpen: (o: Objective) => void;
  onCreate: () => void;
}) {
  const cols: { id: Objective["status"]; label: string; tone: "warning" | "info" | "success" }[] = [
    { id: "Pending Approval", label: "Pending Approval", tone: "warning" },
    { id: "In Progress", label: "In Progress", tone: "info" },
    { id: "Completed", label: "Completed", tone: "success" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: C.navy }}>
            Career Objectives
          </h2>
          <div className="text-sm mt-0.5" style={{ color: C.subtle }}>
            Proactive goals that close competency gaps outside your daily work
          </div>
        </div>
        <PrimaryBtn onClick={onCreate}>
          <Plus size={16} />
          Create SMART Objective
        </PrimaryBtn>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {cols.map((col) => {
          const list = items.filter((i) => i.status === col.id);
          return (
            <div key={col.id} className="space-y-3">
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
                  <ObjectiveCard key={o.id} o={o} onOpen={() => onOpen(o)} />
                ))}
                {list.length === 0 && (
                  <div
                    className="border border-dashed rounded p-6 text-center text-xs"
                    style={{ borderColor: C.border, color: C.subtle }}
                  >
                    Nothing here yet.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ObjectiveCard({ o, onOpen }: { o: Objective; onOpen: () => void }) {
  const statusIcon =
    o.status === "Completed" ? (
      <CheckCircle size={13} style={{ color: C.green }} />
    ) : (
      <Clock size={13} style={{ color: C.amber }} />
    );
  return (
    <motion.button
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onOpen}
      className="w-full text-left"
    >
      <Card className="p-4 hover:border-[#0052CC] transition-colors">
        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.subtle }}>
          {o.id}
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
    </motion.button>
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
  onSave: (title: string, comps: string[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [comps, setComps] = useState<string[]>(["Code Quality"]);
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
        <div className="p-5 space-y-4">
          <Field label="Title">
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Led RFC review for payments cutover"
            />
          </Field>
          <Field label="Reflection">
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you learn? What impact did it have?"
              rows={4}
            />
          </Field>
          <Field label="Tag competencies">
            <div className="flex flex-wrap gap-1.5">
              {COMPETENCIES.map((c) => (
                <Pill
                  key={c}
                  active={comps.includes(c)}
                  onClick={() =>
                    setComps((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))
                  }
                >
                  {c}
                </Pill>
              ))}
            </div>
          </Field>
        </div>
        <div className="p-4 border-t flex items-center justify-end gap-2" style={{ borderColor: C.border }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn disabled={!title} onClick={() => onSave(title, comps)}>
            Save Evidence
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
  const [competency, setCompetency] = useState(COMPETENCIES[0]);
  const [s, setS] = useState("");
  const [m, setM] = useState("");
  const [a, setA] = useState("");
  const [r, setR] = useState("");
  const [t, setT] = useState("");

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
          <div className="col-span-3 p-6 overflow-y-auto space-y-4">
            <Field label="Target Competency">
              <Select value={competency} onChange={(e) => setCompetency(e.target.value)}>
                {COMPETENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
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
            <Field label="T — Time-bound">
              <Input type="date" value={t} onChange={(e) => setT(e.target.value)} icon={<Calendar size={14} />} />
              <div className="text-[11px] mt-1.5" style={{ color: C.subtle }}>
                Specific timeframe or deadline.
              </div>
            </Field>
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
                Pro Tip — Bloom's Taxonomy
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
              <div style={{ color: C.slate }}>"Students will learn about digital marketing."</div>
            </div>
            <div
              className="p-3 rounded border text-xs"
              style={{ borderColor: C.border, background: "#fff" }}
            >
              <div className="font-bold mb-1" style={{ color: "#006644" }}>
                SMART
              </div>
              <div style={{ color: C.slate }}>
                "By the end of this 4-week module, students will design a targeted social media
                advertising campaign with a measurable ROI."
              </div>
            </div>
          </aside>
        </div>

        <div className="p-4 border-t flex items-center justify-end gap-2" style={{ borderColor: C.border }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn
            disabled={!s || !m}
            onClick={() =>
              onSubmit({
                title: s.slice(0, 80) || "New objective",
                competency,
                due: t || "TBD",
                specific: s,
                measurable: m,
                achievable: a,
                relevant: r,
                timebound: t,
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

/* ============================================================ */
/*       OVERLAY: OBJECTIVE DETAILS SLIDE-OVER                  */
/* ============================================================ */

function ObjectiveSlideover({
  objective,
  onClose,
  onComplete,
}: {
  objective: Objective;
  onClose: () => void;
  onComplete: (o: Objective) => void;
}) {
  const [smartOpen, setSmartOpen] = useState(false);
  const [links, setLinks] = useState(objective.links ?? []);
  const [newLink, setNewLink] = useState("");
  const [notes, setNotes] = useState(objective.notes ?? "");
  const [status, setStatus] = useState(objective.status);

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
            <button onClick={onClose} className="p-1.5 rounded hover:bg-[#F4F5F7]" style={{ color: C.slate }}>
              <X size={18} />
            </button>
          </div>
          <div className="text-xl font-bold mt-2 leading-snug" style={{ color: C.navy }}>
            {objective.title}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Select value={status} onChange={(e) => setStatus(e.target.value as Objective["status"])}>
              <option>Pending Approval</option>
              <option>In Progress</option>
              <option>Completed</option>
            </Select>
            <Badge tone="info">{objective.competency}</Badge>
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
                          {k} — {n}
                        </div>
                        <div className="mt-0.5">{v || <span style={{ color: C.subtle }}>Not provided</span>}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded border hover:border-[#0052CC] transition-colors"
                  style={{ borderColor: C.border }}
                >
                  <span className="text-sm" style={{ color: C.navy }}>
                    {l.label}
                  </span>
                  <ExternalLink size={14} style={{ color: C.primary }} />
                </a>
              ))}
              {links.length === 0 && (
                <div className="text-xs" style={{ color: C.subtle }}>
                  No resources added yet.
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="Add URL…"
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
            />
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <GhostBtn onClick={onClose}>Close</GhostBtn>
          <PrimaryBtn onClick={() => onComplete({ ...objective, notes, links })}>
            <CheckCircle size={16} />
            Complete & Add to Evidence Log
          </PrimaryBtn>
        </div>
      </motion.div>
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
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-9 h-5 rounded-full transition-colors"
      style={{ background: on ? C.primary : "#C1C7D0" }}
    >
      <motion.span
        animate={{ x: on ? 16 : 2 }}
        transition={{ duration: 0.18 }}
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
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
            Senior Engineer L3 — Payments
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
  return (
    <Card className="p-6">
      <SectionHeader
        title="Competency Framework"
        sub="The 8 axes used to score progress toward Level 4"
      />
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
      <div className="mt-5 flex items-center justify-between p-3 rounded" style={{ background: C.primarySoft }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: C.navy }}>
          <Info size={14} style={{ color: C.primary }} />
          Framework is managed by your engineering org. Contact admin to propose edits.
        </div>
        <GhostBtn>Contact admin</GhostBtn>
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
  onDelete,
}: {
  item: EvidenceItem;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
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
                className="p-1.5 rounded hover:bg-[#F4F5F7]"
                style={{ color: C.slate }}
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1.5 rounded hover:bg-[#FFEBE6]"
                style={{ color: C.red }}
                title="Delete"
              >
                <Trash2 size={16} />
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
          <div className="text-xl font-bold mt-2 leading-snug" style={{ color: C.navy }}>
            {item.title}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: C.subtle }}>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {item.date}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full" style={{ background: C.subtle }} />
              {item.source}
            </span>
            {item.status === "Approved" ? (
              <Badge tone="success" icon={<CheckCircle size={11} />}>
                Approved
              </Badge>
            ) : (
              <Badge tone="warning" icon={<Clock size={11} />}>
                Pending
              </Badge>
            )}
          </div>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <section>
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.subtle }}>
              Competency Mapping
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge tone="info">{item.competency}</Badge>
              <Badge tone="neutral">{item.category}</Badge>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Full Reflection
              </div>
            </div>
            <div className="text-sm leading-relaxed" style={{ color: C.slate }}>
              {item.description}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Links & Artifacts
              </div>
            </div>
            {item.link ? (
              <a
                href={`https://${item.link}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded border hover:border-[#0052CC] transition-colors"
                style={{ borderColor: C.border }}
              >
                <span className="text-sm" style={{ color: C.navy }}>
                  {item.link}
                </span>
                <ExternalLink size={14} style={{ color: C.primary }} />
              </a>
            ) : (
              <div className="text-xs" style={{ color: C.subtle }}>
                No links attached.
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={14} style={{ color: C.slate }} />
              <div className="text-sm font-bold" style={{ color: C.navy }}>
                Manager Comments
              </div>
            </div>
            {item.status === "Approved" ? (
              <div
                className="p-3 rounded border text-sm"
                style={{ borderColor: C.border, background: C.bg, color: C.slate }}
              >
                <div className="text-xs font-semibold mb-1" style={{ color: C.navy }}>
                  Alex Morgan — Oct 12
                </div>
                Strong example of cross-team coordination. Tag this for the L4 architecture
                criterion in your packet.
              </div>
            ) : (
              <div className="text-xs" style={{ color: C.subtle }}>
                Awaiting manager review.
              </div>
            )}
          </section>
        </div>

        <div
          className="px-6 py-4 border-t flex items-center justify-end gap-2"
          style={{ borderColor: C.border, background: C.bg }}
        >
          <GhostBtn onClick={onClose}>Close</GhostBtn>
          <PrimaryBtn>
            <Edit2 size={14} />
            Edit Evidence
          </PrimaryBtn>
        </div>
      </motion.div>
    </motion.div>
  );
}
