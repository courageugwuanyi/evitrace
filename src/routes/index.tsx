import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar as RadarIcon,
  X,
  LayoutDashboard,
  FileText,
  Target,
  Flag,
  Search,
  Bell,
  Plus,
  Github,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Filter,
  ChevronDown,
  Circle,
  Clock,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Evitrace — Engineering Competency & Promotion Tracking" },
      {
        name: "description",
        content:
          "Capture engineering evidence, map it to competencies, and visualize your path to promotion.",
      },
    ],
  }),
  component: Index,
});

/* ---------------- Tokens ---------------- */
const C = {
  appBg: "#FAFBFC",
  card: "#FFFFFF",
  border: "#DFE1E6",
  primary: "#0052CC",
  primaryHover: "#0065FF",
  navy: "#172B4D",
  slate: "#42526E",
  muted: "#6B778C",
  green: "#36B37E",
  greenSoft: "#E3FCEF",
  amber: "#FFAB00",
  amberDeep: "#FF8B00",
  paleBlue: "#DEEBFF",
  paleAmber: "#FFFAE6",
  inputRest: "#F4F5F7",
  rowHover: "#F4F5F7",
};

type View = "dashboard" | "evidence" | "radar" | "objectives";

type PendingItem = {
  id: string;
  kind: "jira" | "github";
  title: string;
  date: string;
  context: string;
  suggested: string[];
};

const COMPETENCIES = [
  "Architecture",
  "Code Quality",
  "Communication",
  "Leadership",
  "DevOps",
  "Security",
  "System Design",
  "Mentorship",
];

const TITLES: Record<View, string> = {
  dashboard: "Dashboard Overview",
  evidence: "Evidence Log",
  radar: "Promotion Radar",
  objectives: "Objectives",
};

/* ---------------- Page ---------------- */
function Index() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [isCaptureModalOpen, setCaptureModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<PendingItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [pending, setPending] = useState<PendingItem[]>([
    {
      id: "p1",
      kind: "github",
      title: "Merged PR: refactor-auth-flow (#142)",
      date: "2 hours ago",
      context: "Git: refactor-auth-flow (#142) • +482 / -311 lines",
      suggested: ["System Design", "Security", "Code Quality"],
    },
    {
      id: "p2",
      kind: "jira",
      title: "Resolved Incident #992 — payments outage",
      date: "Yesterday",
      context: "Jira: INC-992 • Sev2 resolved in 38m",
      suggested: ["Leadership", "Communication"],
    },
  ]);

  type EvidenceRow = {
    id: string;
    date: string;
    title: string;
    source: "github" | "jira";
    comps: string[];
    status: "Pending" | "Approved";
  };
  const [evidence, setEvidence] = useState<EvidenceRow[]>([
    { id: "e1", date: "Oct 12", title: "Migrated legacy DB", source: "github", comps: ["Architecture", "Code Quality"], status: "Approved" },
    { id: "e2", date: "Oct 9", title: "Led incident retro for #992", source: "jira", comps: ["Leadership", "Communication"], status: "Approved" },
    { id: "e3", date: "Oct 4", title: "Hardened OAuth flow", source: "github", comps: ["Security", "Architecture"], status: "Approved" },
    { id: "e4", date: "Sep 28", title: "CI pipeline optimization", source: "github", comps: ["DevOps"], status: "Approved" },
    { id: "e5", date: "Sep 22", title: "Drafted RFC: feature flags v2", source: "jira", comps: ["System Design"], status: "Pending" },
    { id: "e6", date: "Sep 18", title: "Mentored new hire onboarding", source: "jira", comps: ["Mentorship", "Communication"], status: "Approved" },
  ]);

  // baseline radar scores; "Confirm Mapping" bumps mapped competencies
  const [scores, setScores] = useState<Record<string, number>>({
    Architecture: 70,
    "Code Quality": 80,
    Communication: 65,
    Leadership: 45,
    DevOps: 70,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const handleSaveCapture = (title: string, comps: string[]) => {
    setEvidence((prev) => [
      {
        id: `e${Date.now()}`,
        date: "Today",
        title: title || "Untitled evidence",
        source: "github",
        comps,
        status: "Pending",
      },
      ...prev,
    ]);
    setCaptureModalOpen(false);
    showToast("Evidence saved!");
  };

  const handleConfirmMapping = (item: PendingItem, comps: string[]) => {
    setPending((p) => p.filter((x) => x.id !== item.id));
    setEvidence((prev) => [
      { id: `e${Date.now()}`, date: "Today", title: item.title, source: item.kind, comps, status: "Approved" },
      ...prev,
    ]);
    setScores((s) => {
      const next = { ...s };
      comps.forEach((c) => {
        if (next[c] != null) next[c] = Math.min(100, next[c] + 4);
      });
      return next;
    });
    setReviewItem(null);
    showToast("Mapping confirmed — radar updated");
  };

  return (
    <div
      style={{ backgroundColor: C.appBg, color: C.slate, fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
      className="min-h-screen flex"
    >
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader title={TITLES[activeView]} onCapture={() => setCaptureModalOpen(true)} />
        <main className="p-8 flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeView === "dashboard" && (
                <DashboardView
                  pending={pending}
                  onReview={setReviewItem}
                  scores={scores}
                />
              )}
              {activeView === "evidence" && <EvidenceView evidence={evidence} />}
              {activeView === "radar" && <RadarView scores={scores} />}
              {activeView === "objectives" && <ObjectivesView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isCaptureModalOpen && (
          <CaptureModal onClose={() => setCaptureModalOpen(false)} onSave={handleSaveCapture} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {reviewItem && (
          <ReviewSlideover
            item={reviewItem}
            onClose={() => setReviewItem(null)}
            onConfirm={handleConfirmMapping}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>
    </div>
  );
}

/* ---------------- Sidebar ---------------- */
function Sidebar({ activeView, onNavigate }: { activeView: View; onNavigate: (v: View) => void }) {
  const items: { id: View; icon: typeof LayoutDashboard; label: string }[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "evidence", icon: FileText, label: "Evidence Log" },
    { id: "radar", icon: Target, label: "Promotion Radar" },
    { id: "objectives", icon: Flag, label: "Objectives" },
  ];
  return (
    <aside
      className="w-64 shrink-0 flex flex-col sticky top-0 h-screen"
      style={{ backgroundColor: C.card, borderRight: `1px solid ${C.border}` }}
    >
      <div className="px-6 py-5 flex items-center gap-2" style={{ color: C.navy }}>
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ backgroundColor: C.paleBlue, color: C.primary }}
        >
          <RadarIcon size={18} />
        </div>
        <span className="font-bold text-lg tracking-tight">Evitrace</span>
      </div>

      <nav className="px-3 mt-2 flex flex-col gap-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = activeView === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onNavigate(it.id)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left"
              style={{
                backgroundColor: active ? C.paleBlue : "transparent",
                color: active ? C.primary : C.slate,
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = C.inputRest;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon size={16} />
              {it.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-md p-3" style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ backgroundColor: C.paleBlue, color: C.primary }}
            >
              CU
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: C.navy }}>
                Courage U.
              </div>
              <div className="text-xs" style={{ color: C.slate }}>
                L3 Engineer
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: C.slate }}>Progress to L4</span>
              <span style={{ color: C.navy, fontWeight: 600 }}>85%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#EBECF0" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: C.green }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Top Header ---------------- */
function TopHeader({ title, onCapture }: { title: string; onCapture: () => void }) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-8 h-16"
      style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}
    >
      <h1 className="text-xl font-bold" style={{ color: C.navy }}>
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <div
          className="hidden md:flex items-center gap-2 px-3 h-9 rounded-md w-72 transition-colors"
          style={{ backgroundColor: C.inputRest, border: `1px solid transparent` }}
        >
          <Search size={15} style={{ color: C.slate }} />
          <input
            placeholder="Search evidence, competencies…"
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: C.navy }}
          />
        </div>
        <button
          className="relative w-9 h-9 rounded-md flex items-center justify-center transition-colors hover:bg-[#F4F5F7]"
          style={{ color: C.slate }}
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: C.amber }} />
        </button>
        <button
          onClick={onCapture}
          className="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: C.primary }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.primaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
        >
          <Plus size={15} />
          Manual Capture
        </button>
      </div>
    </header>
  );
}

/* ---------------- Card primitive ---------------- */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg shadow-sm ${className}`}
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
    >
      {children}
    </div>
  );
}

/* ---------------- Dashboard View ---------------- */
function DashboardView({
  pending,
  onReview,
  scores,
}: {
  pending: PendingItem[];
  onReview: (i: PendingItem) => void;
  scores: Record<string, number>;
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-3">
        <ActionInbox items={pending} onReview={onReview} />
      </div>
      <div className="xl:col-span-2">
        <CareerRadar scores={scores} />
      </div>
      <div className="xl:col-span-1">
        <RecentWins />
      </div>
    </div>
  );
}

function ActionInbox({ items, onReview }: { items: PendingItem[]; onReview: (i: PendingItem) => void }) {
  return (
    <Card>
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div>
          <h3 className="text-base font-bold" style={{ color: C.navy }}>
            Pending Evidence
          </h3>
          <p className="text-xs mt-0.5" style={{ color: C.slate }}>
            Auto-captured items waiting for you to map and confirm.
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2 py-1 rounded"
          style={{ backgroundColor: C.paleAmber, color: C.amberDeep }}
        >
          {items.length} pending
        </span>
      </div>
      {items.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm" style={{ color: C.slate }}>
          <CheckCircle2 size={20} className="mx-auto mb-2" style={{ color: C.green }} />
          Inbox zero. Nice work.
        </div>
      ) : (
        <ul>
          {items.map((it, i) => (
            <li
              key={it.id}
              className="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-[#F4F5F7]"
              style={{ borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: it.kind === "jira" ? C.paleBlue : C.inputRest,
                  color: it.kind === "jira" ? C.primary : C.navy,
                }}
              >
                {it.kind === "jira" ? <JiraGlyph /> : <Github size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate" style={{ color: C.navy }}>
                  {it.title}
                </div>
                <div className="text-xs" style={{ color: C.slate }}>
                  {it.date}
                </div>
              </div>
              <button
                onClick={() => onReview(it)}
                className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
                style={{ color: C.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.paleBlue)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Review & Map
                <ArrowRight size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function JiraGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.53 2L2 11.53a.7.7 0 000 .94l9.53 9.53a.7.7 0 00.94 0L22 12.47a.7.7 0 000-.94L12.47 2a.7.7 0 00-.94 0zM12 15.5L8.5 12 12 8.5l3.5 3.5L12 15.5z" />
    </svg>
  );
}

function CareerRadar({ scores }: { scores: Record<string, number> }) {
  const data = Object.entries(scores).map(([axis, current]) => ({
    axis,
    current,
    target: axis === "Code Quality" ? 85 : axis === "DevOps" ? 75 : axis === "Architecture" ? 85 : 80,
  }));
  return (
    <Card className="h-full flex flex-col">
      <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <h3 className="text-base font-bold" style={{ color: C.navy }}>
          L4 Competency Gap
        </h3>
        <p className="text-xs mt-0.5" style={{ color: C.slate }}>
          Current evidence vs. L4 target across core competencies.
        </p>
      </div>
      <div className="p-4 flex-1 min-h-[340px]">
        <ResponsiveContainer width="100%" height={340}>
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke={C.border} />
            <PolarAngleAxis dataKey="axis" tick={{ fill: C.navy, fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                fontSize: 12,
                color: C.navy,
              }}
              formatter={(value, name) => {
                const v = Number(value) || 0;
                return [`${(v / 25).toFixed(1)}/4 (${v})`, String(name)];
              }}
            />
            <Radar name="Target L4" dataKey="target" stroke={C.navy} strokeWidth={1.5} strokeDasharray="5 4" fill="none" />
            <Radar name="Current" dataKey="current" stroke={C.primary} strokeWidth={2} fill={C.primary} fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
        <div className="flex gap-5 px-2 pb-2 text-xs" style={{ color: C.slate }}>
          <Legend swatchColor={C.primary} label="Current" />
          <Legend swatchColor={C.navy} dashed label="Target L4" />
        </div>
      </div>
      <div className="m-4 mt-0 rounded-md flex items-start gap-3 p-3" style={{ backgroundColor: C.paleAmber }}>
        <AlertTriangle size={16} style={{ color: C.amberDeep }} className="mt-0.5 shrink-0" />
        <p className="text-sm" style={{ color: C.amberDeep }}>
          <span className="font-semibold">Focus area:</span> You need 2 more logged instances of Leadership to meet L4 criteria.
        </p>
      </div>
    </Card>
  );
}

function Legend({ swatchColor, label, dashed }: { swatchColor: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block w-4 h-0"
        style={{ borderTop: `${dashed ? "1.5px dashed" : "3px solid"} ${swatchColor}` }}
      />
      {label}
    </div>
  );
}

function RecentWins() {
  const wins = [
    { title: "Migrated legacy DB", badges: ["Architecture", "Code Quality"], meta: "Approved by Alex M. • Oct 12" },
    { title: "Led incident retro for #992", badges: ["Leadership", "Communication"], meta: "Approved by Priya R. • Oct 9" },
    { title: "Hardened OAuth flow", badges: ["Security", "Architecture"], meta: "Approved by Alex M. • Oct 4" },
    { title: "CI pipeline optimization", badges: ["DevOps"], meta: "Approved by Sam K. • Sep 28" },
  ];
  return (
    <Card className="h-full">
      <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <h3 className="text-base font-bold" style={{ color: C.navy }}>
          Verified Trail
        </h3>
        <p className="text-xs mt-0.5" style={{ color: C.slate }}>
          Recent evidence approved by your manager.
        </p>
      </div>
      <ol className="px-6 py-4 relative">
        <span aria-hidden className="absolute left-[30px] top-6 bottom-6 w-px" style={{ backgroundColor: C.border }} />
        {wins.map((w, i) => (
          <li key={i} className="relative pl-8 pb-5 last:pb-0">
            <span
              className="absolute left-0 top-0.5 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: C.greenSoft }}
            >
              <CheckCircle2 size={14} style={{ color: C.green }} />
            </span>
            <div className="text-sm font-semibold" style={{ color: C.navy }}>
              {w.title}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {w.badges.map((b) => (
                <Pill key={b}>{b}</Pill>
              ))}
            </div>
            <div className="text-xs mt-1.5" style={{ color: C.slate }}>
              {w.meta}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function Pill({
  children,
  active,
  onClick,
  size = "sm",
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  size?: "sm" | "xs";
}) {
  const interactive = Boolean(onClick);
  return (
    <button
      onClick={onClick}
      type="button"
      className={`font-semibold rounded-full transition-colors ${size === "sm" ? "text-xs px-2 py-0.5" : "text-[11px] px-2 py-0.5"}`}
      style={{
        backgroundColor: active ? C.primary : C.paleBlue,
        color: active ? "#FFFFFF" : C.primary,
        cursor: interactive ? "pointer" : "default",
        border: active ? `1px solid ${C.primary}` : `1px solid transparent`,
      }}
    >
      {children}
    </button>
  );
}

/* ---------------- Evidence View ---------------- */
function EvidenceView({
  evidence,
}: {
  evidence: {
    id: string;
    date: string;
    title: string;
    source: "github" | "jira";
    comps: string[];
    status: "Pending" | "Approved";
  }[];
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | "Pending" | "Approved">("All");
  const [statusOpen, setStatusOpen] = useState(false);

  const filtered = evidence.filter(
    (e) =>
      (status === "All" || e.status === status) &&
      e.title.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3 px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 h-9 px-3 rounded-md flex-1 min-w-[220px]" style={{ backgroundColor: C.inputRest }}>
          <Search size={15} style={{ color: C.slate }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by title…"
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: C.navy }}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setStatusOpen((o) => !o)}
            className="flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium transition-colors"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, color: C.navy }}
          >
            <Filter size={14} style={{ color: C.slate }} />
            Status: {status}
            <ChevronDown size={14} style={{ color: C.slate }} />
          </button>
          {statusOpen && (
            <div
              className="absolute right-0 mt-1 w-40 rounded-md shadow-md z-10 py-1"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
            >
              {(["All", "Pending", "Approved"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setStatusOpen(false);
                  }}
                  className="block w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-[#F4F5F7]"
                  style={{ color: C.navy }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#FBFBFC", color: C.slate }}>
              {["Date", "Title", "Source", "Competencies", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold uppercase tracking-wide px-6 py-2.5"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr
                key={e.id}
                className="transition-colors hover:bg-[#F4F5F7]"
                style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none" }}
              >
                <td className="px-6 py-3" style={{ color: C.slate }}>{e.date}</td>
                <td className="px-6 py-3 font-semibold" style={{ color: C.navy }}>{e.title}</td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-1.5" style={{ color: C.slate }}>
                    {e.source === "github" ? <Github size={14} /> : <JiraGlyph />}
                    {e.source === "github" ? "GitHub" : "Jira"}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {e.comps.map((c) => (
                      <Pill key={c}>{c}</Pill>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={e.status} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm" style={{ color: C.slate }}>
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

function StatusBadge({ status }: { status: "Pending" | "Approved" }) {
  const approved = status === "Approved";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded"
      style={{
        backgroundColor: approved ? C.greenSoft : C.paleAmber,
        color: approved ? "#006644" : C.amberDeep,
      }}
    >
      {approved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
      {status}
    </span>
  );
}

/* ---------------- Radar standalone view ---------------- */
function RadarView({ scores }: { scores: Record<string, number> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CareerRadar scores={scores} />
      </div>
      <Card>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-base font-bold" style={{ color: C.navy }}>
            Competency Scores
          </h3>
          <p className="text-xs mt-0.5" style={{ color: C.slate }}>
            4-point scale derived from approved evidence.
          </p>
        </div>
        <ul className="px-6 py-4 space-y-3">
          {Object.entries(scores).map(([k, v]) => (
            <li key={k}>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.navy, fontWeight: 600 }}>{k}</span>
                <span style={{ color: C.slate }}>{(v / 25).toFixed(1)}/4</span>
              </div>
              <div className="h-1.5 rounded-full mt-1.5" style={{ backgroundColor: "#EBECF0" }}>
                <div className="h-full rounded-full" style={{ width: `${v}%`, backgroundColor: C.primary }} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------------- Objectives View ---------------- */
function ObjectivesView() {
  const cols: { title: string; tone: string; items: { title: string; desc: string }[] }[] = [
    {
      title: "To Do",
      tone: C.slate,
      items: [
        { title: "Publish RFC: feature flags v2", desc: "Manager-approved goal · Due Nov 30" },
      ],
    },
    {
      title: "In Progress",
      tone: C.primary,
      items: [
        { title: "Lead a cross-functional system design meeting", desc: "Manager-approved goal · Due Oct 30" },
        { title: "Mentor 2 junior engineers through code reviews", desc: "Manager-approved goal · Quarterly" },
      ],
    },
    {
      title: "Done",
      tone: C.green,
      items: [{ title: "Ship OAuth hardening", desc: "Completed Oct 4" }],
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cols.map((col) => (
        <Card key={col.title}>
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2">
              <Circle size={8} fill={col.tone} stroke={col.tone} />
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: C.navy }}>
                {col.title}
              </h3>
            </div>
            <span className="text-xs" style={{ color: C.slate }}>
              {col.items.length}
            </span>
          </div>
          <ul className="p-3 space-y-2">
            {col.items.map((it, i) => (
              <li
                key={i}
                className="rounded-md p-3 cursor-pointer transition-shadow hover:shadow-sm"
                style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}
              >
                <div className="text-sm font-semibold" style={{ color: C.navy }}>
                  {it.title}
                </div>
                <div className="text-xs mt-1" style={{ color: C.slate }}>
                  {it.desc}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Capture Modal ---------------- */
function CaptureModal({ onClose, onSave }: { onClose: () => void; onSave: (title: string, comps: string[]) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [active, setActive] = useState<Record<string, boolean>>({
    "System Design": true,
    Security: false,
    "Code Quality": false,
    Leadership: false,
  });
  const [titleFocused, setTitleFocused] = useState(false);
  const [bodyFocused, setBodyFocused] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const inputStyle = (focused: boolean) => ({
    backgroundColor: focused ? C.card : C.inputRest,
    border: `1px solid ${focused ? C.primary : "transparent"}`,
    boxShadow: focused ? `0 0 0 2px ${C.paleBlue}` : "none",
    color: C.navy,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(23, 43, 77, 0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-lg shadow-xl overflow-hidden"
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: C.paleBlue, color: C.primary }}>
              <Sparkles size={14} />
            </div>
            <span className="text-sm font-bold" style={{ color: C.navy }}>
              Capture Evidence
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-[#F4F5F7]" style={{ color: C.slate }}>
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          <h2 className="text-lg font-bold" style={{ color: C.navy }}>
            Log it while it's fresh.
          </h2>
          <p className="text-sm mt-1" style={{ color: C.slate }}>
            Capture the moment so future-you doesn't have to dig through Jira.
          </p>

          <label className="block mt-4 text-xs font-semibold mb-1.5" style={{ color: C.slate }}>
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            placeholder="e.g. Designed retry strategy for payments queue"
            className="w-full text-sm rounded-md px-3 py-2 outline-none transition-all"
            style={inputStyle(titleFocused)}
          />

          <label className="block mt-3 text-xs font-semibold mb-1.5" style={{ color: C.slate }}>
            What was the challenge? What did you learn?
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => setBodyFocused(true)}
            onBlur={() => setBodyFocused(false)}
            rows={4}
            placeholder="The trade-offs, the constraints, the outcome…"
            className="w-full text-sm rounded-md px-3 py-2 outline-none resize-none transition-all"
            style={inputStyle(bodyFocused)}
          />

          <div className="mt-4">
            <div className="text-xs font-semibold mb-2" style={{ color: C.slate }}>
              Tag competencies
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(active).map((label) => (
                <Pill key={label} active={active[label]} onClick={() => setActive((s) => ({ ...s, [label]: !s[label] }))}>
                  {label}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: `1px solid ${C.border}`, backgroundColor: "#FBFBFC" }}>
          <button onClick={onClose} className="text-sm font-semibold px-3 py-1.5 rounded transition-colors hover:bg-[#F4F5F7]" style={{ color: C.slate }}>
            Cancel
          </button>
          <button
            onClick={() => onSave(title, Object.keys(active).filter((k) => active[k]))}
            className="text-sm font-semibold px-3.5 py-1.5 rounded text-white transition-colors"
            style={{ backgroundColor: C.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.primaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
          >
            Save Evidence
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Review Slide-over ---------------- */
function ReviewSlideover({
  item,
  onClose,
  onConfirm,
}: {
  item: PendingItem;
  onClose: () => void;
  onConfirm: (i: PendingItem, comps: string[]) => void;
}) {
  const initial: Record<string, boolean> = {};
  COMPETENCIES.forEach((c) => (initial[c] = item.suggested.includes(c)));
  const [active, setActive] = useState(initial);
  const [notes, setNotes] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: "rgba(23, 43, 77, 0.45)" }}
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full flex flex-col shadow-xl"
        style={{ backgroundColor: C.card, borderLeft: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
              Review & Map
            </div>
            <div className="text-sm font-bold mt-0.5" style={{ color: C.navy }}>
              {item.title}
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-[#F4F5F7]" style={{ color: C.slate }}>
            <X size={15} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <div className="rounded-md flex items-center gap-2 px-3 py-2 text-xs" style={{ backgroundColor: C.inputRest, color: C.slate }}>
            {item.kind === "github" ? <Github size={13} /> : <JiraGlyph />}
            <span className="font-medium" style={{ color: C.navy }}>
              Context:
            </span>
            <span className="truncate">{item.context}</span>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Sparkles size={14} style={{ color: C.primary }} />
            <span className="text-sm font-semibold" style={{ color: C.navy }}>
              AI auto-mapped competencies
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: C.slate }}>
            Click to toggle. Add or remove until the mapping feels right.
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {COMPETENCIES.map((label) => (
              <Pill key={label} active={active[label]} onClick={() => setActive((s) => ({ ...s, [label]: !s[label] }))}>
                {label}
              </Pill>
            ))}
          </div>

          <label className="block mt-5 text-xs font-semibold mb-1.5" style={{ color: C.slate }}>
            Reflection (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={4}
            placeholder="What stood out about this work?"
            className="w-full text-sm rounded-md px-3 py-2 outline-none resize-none transition-all"
            style={{
              backgroundColor: focused ? C.card : C.inputRest,
              border: `1px solid ${focused ? C.primary : "transparent"}`,
              boxShadow: focused ? `0 0 0 2px ${C.paleBlue}` : "none",
              color: C.navy,
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: `1px solid ${C.border}`, backgroundColor: "#FBFBFC" }}>
          <button onClick={onClose} className="text-sm font-semibold px-3 py-1.5 rounded transition-colors hover:bg-[#F4F5F7]" style={{ color: C.slate }}>
            Dismiss
          </button>
          <button
            onClick={() => onConfirm(item, Object.keys(active).filter((k) => active[k]))}
            className="text-sm font-semibold px-3.5 py-1.5 rounded text-white transition-colors"
            style={{ backgroundColor: C.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.primaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
          >
            Confirm Mapping
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

/* ---------------- Toast ---------------- */
function Toast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-md shadow-lg"
      style={{ backgroundColor: C.green, color: "#FFFFFF" }}
    >
      <CheckCircle2 size={16} />
      <span className="text-sm font-semibold">{message}</span>
    </motion.div>
  );
}
