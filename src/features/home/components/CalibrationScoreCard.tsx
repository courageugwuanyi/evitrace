import { useWorkspace } from "@/features/home/context/WorkspaceContext";
import { useLiveAssessmentSync } from "@/features/home/hooks/useLiveAssessmentSync";
import { useAuth } from "@/lib/auth";

interface CalibrationScoreCardProps {
  criterionLabel: string;
  dataKey: string;
}

export function CalibrationScoreCard({ criterionLabel, dataKey }: CalibrationScoreCardProps) {
  const { userId } = useAuth();
  const { mode, selectedEngineerId } = useWorkspace();
  const syncEngineerId = mode === "manager" ? selectedEngineerId : (userId ?? null);
  const { sharedState, broadcastDelta, isSyncActive } = useLiveAssessmentSync(syncEngineerId, mode);

  const isInputLocked = mode === "engineer";
  const rawValue = Number(sharedState[dataKey] ?? 1);
  const activeValue = Number.isFinite(rawValue) ? Math.min(5, Math.max(1, rawValue)) : 1;

  return (
    <div className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-5 font-sans shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
            {criterionLabel}
          </h4>
          {isSyncActive && (
            <span className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-emerald-600">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live Workspace Sync Connected
            </span>
          )}
        </div>
        <span className="rounded border border-slate-200/60 bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-600">
          Score: {activeValue} / 5
        </span>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          disabled={isInputLocked}
          value={activeValue}
          onChange={(event) => broadcastDelta(dataKey, Number.parseInt(event.target.value, 10))}
          className={`h-1.5 w-full appearance-none rounded-lg transition-all ${
            isInputLocked
              ? "cursor-not-allowed bg-slate-100 accent-slate-400"
              : "cursor-pointer bg-slate-200 accent-indigo-600 hover:bg-slate-200/80"
          }`}
        />

        {isInputLocked && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
            <p className="text-[10px] italic leading-normal text-slate-400">
              Evaluation broadcast stream active. Performance score tracks are adjusted exclusively
              by your supervisor during calibration reviews.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
