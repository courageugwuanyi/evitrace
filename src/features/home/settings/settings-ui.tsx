import type React from "react";
import { C, Card } from "@/features/home/shared/ui-kit";

export type SampleContentVisibility = {
  dashboard: boolean;
  objectives: boolean;
  evidence: boolean;
  pinnedResources: boolean;
};

export function Toggle({ on, onChange }: { on: boolean; onChange: (checked: boolean) => void }) {
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

export function SettingRow({
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

export function DashboardSamplesSettings({
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
      <div>
        <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
          Sample Content Visibility
        </h3>
        <p className="text-xs mt-1" style={{ color: C.subtle }}>
          Choose where educational sample content appears. Turn off any area once you have enough real
          activity.
        </p>
      </div>
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
        <SettingRow
          title="Pinned Resources Samples"
          desc="Controls sample pinned links and knowledge anchors shown in the dashboard pinned bar."
          right={
            <Toggle
              on={sampleContent.pinnedResources}
              onChange={() => toggle("pinnedResources")}
            />
          }
        />
      </div>
    </Card>
  );
}
