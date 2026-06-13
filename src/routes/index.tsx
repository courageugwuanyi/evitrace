import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
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
      { property: "og:title", content: "Evitrace — Competency & Promotion Tracking" },
      {
        property: "og:description",
        content: "Capture, map, and close the loop on your engineering growth.",
      },
    ],
  }),
  component: Index,
});

/* ---------------- Design tokens (inline for clarity) ---------------- */
const C = {
  appBg: "#FAFBFC",
  card: "#FFFFFF",
  border: "#DFE1E6",
  primary: "#0052CC",
  primaryHover: "#0065FF",
  navy: "#172B4D",
  slate: "#42526E",
  green: "#36B37E",
  amber: "#FFAB00",
  amberDeep: "#FF8B00",
  paleBlue: "#DEEBFF",
  paleAmber: "#FFFAE6",
  inputRest: "#F4F5F7",
};

/* ---------------- Page ---------------- */
function Index() {
  return (
    <div
      style={{ backgroundColor: C.appBg, color: C.slate, fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
      className="min-h-screen flex"
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        <main className="p-8 flex-1">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-3">
              <ActionInbox />
            </div>
            <div className="xl:col-span-2">
              <CareerRadar />
            </div>
            <div className="xl:col-span-1">
              <RecentWins />
            </div>
          </div>

          {/* Extension popup showcase */}
          <section className="mt-12">
            <div className="flex items-baseline justify-between mb-4">
              <h2 style={{ color: C.navy }} className="text-lg font-bold">
                Chrome Extension — Capture Loop
              </h2>
              <span className="text-xs" style={{ color: C.slate }}>
                Floats over Jira / GitHub when work closes
              </span>
            </div>
            <div
              className="rounded-lg p-10 flex justify-center"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #DFE1E6 1px, transparent 0)",
                backgroundSize: "20px 20px",
                backgroundColor: "#F4F5F7",
                border: `1px solid ${C.border}`,
              }}
            >
              <ExtensionPopup />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ---------------- Sidebar ---------------- */
function Sidebar() {
  const items = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: FileText, label: "Evidence Log" },
    { icon: Target, label: "Promotion Radar" },
    { icon: Flag, label: "Objectives" },
  ];
  return (
    <aside
      className="w-64 shrink-0 flex flex-col"
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
          return (
            <button
              key={it.label}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: it.active ? C.paleBlue : "transparent",
                color: it.active ? C.primary : C.slate,
              }}
            >
              <Icon size={16} />
              {it.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <div
          className="rounded-md p-3"
          style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}
        >
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
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "#EBECF0" }}
            >
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
function TopHeader() {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-8 h-16"
      style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}
    >
      <h1 className="text-xl font-bold" style={{ color: C.navy }}>
        Dashboard
      </h1>
      <div className="flex items-center gap-3">
        <div
          className="hidden md:flex items-center gap-2 px-3 h-9 rounded-md w-72"
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
        >
          <Bell size={17} />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ backgroundColor: C.amber }}
          />
        </button>
        <button
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

/* ---------------- Action Inbox ---------------- */
function ActionInbox() {
  const items = [
    { kind: "jira", title: "Resolved Incident #992", date: "Yesterday" },
    { kind: "github", title: "Merged PR: refactor-auth-flow (#142)", date: "2 days ago" },
    { kind: "jira", title: "Closed Epic: Payments v2 rollout", date: "3 days ago" },
  ];
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
          3 pending
        </span>
      </div>
      <ul>
        {items.map((it, i) => (
          <li
            key={i}
            className="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-[#F4F5F7]"
            style={{ borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}
          >
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              style={{
                backgroundColor: it.kind === "jira" ? C.paleBlue : "#F4F5F7",
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
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-md transition-colors"
              style={{ color: C.primary, backgroundColor: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.paleBlue)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Review & Map
              <ArrowRight size={14} />
            </button>
          </li>
        ))}
      </ul>
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

/* ---------------- Career Radar ---------------- */
function CareerRadar() {
  const data = [
    { axis: "Architecture", current: 70, target: 85 },
    { axis: "Code Quality", current: 80, target: 85 },
    { axis: "Communication", current: 65, target: 80 },
    { axis: "Leadership", current: 45, target: 80 },
    { axis: "DevOps", current: 70, target: 75 },
  ];
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
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: C.navy, fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Target L4"
              dataKey="target"
              stroke={C.navy}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              fill="none"
            />
            <Radar
              name="Current"
              dataKey="current"
              stroke={C.primary}
              strokeWidth={2}
              fill={C.primary}
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="flex gap-5 px-2 pb-2 text-xs" style={{ color: C.slate }}>
          <Legend swatchColor={C.primary} label="Current" />
          <Legend swatchColor={C.navy} dashed label="Target L4" />
        </div>
      </div>
      <div
        className="m-4 mt-0 rounded-md flex items-start gap-3 p-3"
        style={{ backgroundColor: C.paleAmber }}
      >
        <AlertTriangle size={16} style={{ color: C.amberDeep }} className="mt-0.5 shrink-0" />
        <p className="text-sm" style={{ color: C.amberDeep }}>
          <span className="font-semibold">Focus area:</span> You need 2 more logged instances of
          Leadership to meet L4 criteria.
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
        style={{
          borderTop: `${dashed ? "1.5px dashed" : "3px solid"} ${swatchColor}`,
        }}
      />
      {label}
    </div>
  );
}

/* ---------------- Recent Wins ---------------- */
function RecentWins() {
  const wins = [
    {
      title: "Migrated legacy DB",
      badges: ["Architecture", "Code Quality"],
      meta: "Approved by Alex M. • Oct 12",
    },
    {
      title: "Led incident retro for #992",
      badges: ["Leadership", "Communication"],
      meta: "Approved by Priya R. • Oct 9",
    },
    {
      title: "Hardened OAuth flow",
      badges: ["Security", "Architecture"],
      meta: "Approved by Alex M. • Oct 4",
    },
    {
      title: "CI pipeline optimization",
      badges: ["DevOps"],
      meta: "Approved by Sam K. • Sep 28",
    },
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
        <span
          aria-hidden
          className="absolute left-[30px] top-6 bottom-6 w-px"
          style={{ backgroundColor: C.border }}
        />
        {wins.map((w, i) => (
          <li key={i} className="relative pl-8 pb-5 last:pb-0">
            <span
              className="absolute left-0 top-0.5 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E3FCEF" }}
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

function Pill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold px-2 py-0.5 rounded-full transition-colors"
      style={{
        backgroundColor: active ? C.primary : C.paleBlue,
        color: active ? "#FFFFFF" : C.primary,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {children}
    </button>
  );
}

/* ---------------- Extension Popup ---------------- */
function ExtensionPopup() {
  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState<Record<string, boolean>>({
    "System Design": true,
    Security: false,
    "Code Quality": false,
  });
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-96 rounded-lg shadow-xl overflow-hidden"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: C.paleBlue, color: C.primary }}
              >
                <RadarIcon size={14} />
              </div>
              <span className="text-sm font-bold" style={{ color: C.navy }}>
                Evitrace
              </span>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-[#F4F5F7]"
              style={{ color: C.slate }}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h2 className="text-base font-bold leading-snug" style={{ color: C.navy }}>
              PR Merged. Log it while it's fresh.
            </h2>

            <div
              className="mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs"
              style={{ backgroundColor: C.inputRest, color: C.slate }}
            >
              <Github size={13} />
              <span className="font-medium" style={{ color: C.navy }}>
                Git:
              </span>
              <span className="truncate">refactor-auth-flow (#142)</span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="What was the technical challenge? What did you learn?"
              rows={3}
              className="mt-3 w-full text-sm rounded-md px-3 py-2 outline-none resize-none transition-all"
              style={{
                backgroundColor: focused ? C.card : C.inputRest,
                border: `1px solid ${focused ? C.primary : "transparent"}`,
                boxShadow: focused ? `0 0 0 2px ${C.paleBlue}` : "none",
                color: C.navy,
              }}
            />

            <div className="mt-4">
              <div className="text-xs font-semibold mb-2" style={{ color: C.slate }}>
                Suggested Competencies
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(active).map((label) => (
                  <Pill
                    key={label}
                    active={active[label]}
                    onClick={() => setActive((s) => ({ ...s, [label]: !s[label] }))}
                  >
                    {label}
                  </Pill>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: `1px solid ${C.border}`, backgroundColor: "#FBFBFC" }}
          >
            <button
              className="text-sm font-semibold px-2 py-1.5 rounded transition-colors hover:bg-[#F4F5F7]"
              style={{ color: C.slate }}
              onClick={() => setVisible(false)}
            >
              Skip for now
            </button>
            <button
              className="text-sm font-semibold px-3.5 py-1.5 rounded text-white transition-colors"
              style={{ backgroundColor: C.primary }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.primaryHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
            >
              Save Evidence
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
