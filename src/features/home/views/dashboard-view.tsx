import React, { useMemo } from "react";
import type { InboxItem } from "@/lib/api/mappers";
import { useDashboardStats } from "@/lib/api/dashboard";
import type { EvidenceRecord, Objective } from "@/features/home/shared/models";
import { C, Badge, Card, SourceIcon } from "@/features/home/shared/ui-kit";
import { formatDisplayDate } from "@/features/home/shared/formatters";
import {
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  ListTodo,
  FileText,
  Target,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { MessageCircleHeart } from "lucide-react";

type InboxViewItem = InboxItem & { isSample?: boolean };

export function DashboardView({
  workspaceUserId,
  inbox,
  showSampleData,
  dismissedSampleInboxIds,
  onOpenInbox,
  onOpenObjective,
  onOpenEvidence,
}: {
  workspaceUserId: string;
  inbox: InboxItem[];
  showSampleData: boolean;
  dismissedSampleInboxIds: string[];
  onOpenInbox: (item: InboxViewItem) => void;
  onOpenObjective: (o: Objective) => void;
  onOpenEvidence: (e: EvidenceRecord) => void;
}) {
  const stats = useDashboardStats(workspaceUserId, { showSamples: showSampleData });
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
  const safeItem = item ?? ({} as Partial<InboxItem>);
  const canOpen = Boolean(onOpen && typeof safeItem.id === "string" && safeItem.id.trim().length > 0);
  const sourceLabel = safeItem.source || "Unknown source";
  const timeLabel = safeItem.when || "Unknown time";
  const titleLabel = safeItem.title || "Untitled action";
  const suggestions = Array.isArray(safeItem.suggestion) ? safeItem.suggestion.filter(Boolean) : [];

  return (
    <button
      onClick={canOpen ? onOpen : undefined}
      disabled={!canOpen}
      className="w-full text-left py-4 flex items-start gap-3 hover:bg-[#FAFBFC] disabled:hover:bg-transparent transition-colors rounded px-2 -mx-2 disabled:cursor-default"
    >
      <div
        className="w-9 h-9 rounded flex items-center justify-center shrink-0"
        style={{ background: "#F4F5F7", color: C.slate }}
      >
        <SourceIcon source={sourceLabel} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[11px]" style={{ color: C.subtle }}>
          <span className="font-semibold uppercase tracking-wider">{sourceLabel}</span>
          <span>•</span>
          <span>{timeLabel}</span>
        </div>
        <div className="text-sm font-semibold mt-0.5 truncate" style={{ color: C.navy }}>
          {titleLabel}
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
          {suggestions.length > 0 ? (
            suggestions.map((c) => (
              <span
                key={c}
                className="text-[11px] px-2 py-0.5 rounded-full border"
                style={{ borderColor: C.border, color: C.slate, background: "#F4F5F7" }}
              >
                {c}
              </span>
            ))
          ) : (
            <span className="text-[11px]" style={{ color: C.subtle }}>
              No suggestions
            </span>
          )}
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
