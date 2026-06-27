import React, { useMemo } from "react";
import type { ManagerTeamOverviewItem } from "@/lib/api/manager-invites.functions";
import {
  ShieldAlertIcon,
  CheckCircleIcon,
  CalendarIcon,
  ArrowRightIcon,
} from "lucide-react";

type ManagedEngineerLite = {
  id: string;
};

export function ManagerDashboardView({
  linkedEngineers,
  teamOverview,
  isLoading,
  isError,
  onInspectEngineer,
}: {
  linkedEngineers: ManagedEngineerLite[];
  teamOverview: ManagerTeamOverviewItem[];
  isLoading: boolean;
  isError: boolean;
  onInspectEngineer: (engineerId: string) => void;
}) {
  const pendingReviewLogs = useMemo(
    () =>
      teamOverview.reduce((sum, engineer) => sum + Math.max(engineer.pendingReviewsCount, 0), 0),
    [teamOverview],
  );
  const objectiveApprovals = useMemo(
    () => teamOverview.filter((engineer) => engineer.pendingReviewsCount > 0).length,
    [teamOverview],
  );
  const calibrationReadyCount = useMemo(
    () => teamOverview.filter((engineer) => engineer.promotionReadinessIndex >= 70).length,
    [teamOverview],
  );

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6 font-sans animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Lead Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous overview of team performance, artifact approvals, and promotion horizons.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <ShieldAlertIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Review Logs
            </span>
            <span className="text-base font-extrabold text-slate-800 block mt-0.5">
              {pendingReviewLogs} Submissions Waiting
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircleIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Objective Approvals
            </span>
            <span className="text-base font-extrabold text-slate-800 block mt-0.5">
              {objectiveApprovals} Authorizations Queue
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Calibration Windows
            </span>
            <span className="text-base font-extrabold text-slate-800 block mt-0.5">
              {calibrationReadyCount > 0 ? `${calibrationReadyCount} Ready` : "Q2 Review Sync Open"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Direct Reports Progress Matrix
          </h3>
          <span className="text-[10px] bg-slate-100 border text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
            Total Managed: {linkedEngineers.length}
          </span>
        </div>

        {linkedEngineers.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-600">
              No active engineer connections established.
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-normal">
              Share an onboarding invitation link from your developer settings workspace to link a
              direct report profile onto this performance grid.
            </p>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading team overview...</div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Team connection is active, but detailed profile metrics are still syncing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/30 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider select-none">
                  <th className="py-3 px-5 font-bold">Engineer Profile</th>
                  <th className="py-3 px-5 font-bold">Current Grade Baseline</th>
                  <th className="py-3 px-5 font-bold">Evidence Logging Track</th>
                  <th className="py-3 px-5 font-bold">Promotion Status Marker</th>
                  <th className="py-3 px-5 font-bold text-right">Operational Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamOverview.map((eng) => {
                  const totalObjectives = Math.max(eng.totalObjectivesCount, 0);
                  const completedObjectives = Math.max(eng.completedObjectivesCount, 0);
                  const completionPct =
                    totalObjectives > 0
                      ? Math.min(100, Math.round((completedObjectives / totalObjectives) * 100))
                      : 0;
                  const statusLabel =
                    eng.promotionReadinessIndex >= 70
                      ? "Calibration Ready"
                      : eng.pendingReviewsCount > 0
                        ? "Needs Review"
                        : "Tracking";
                  const statusToneClass =
                    eng.promotionReadinessIndex >= 70
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : eng.pendingReviewsCount > 0
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-slate-100 border-slate-200 text-slate-700";

                  return (
                    <tr key={eng.engineerId} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3.5 px-5 font-bold text-slate-800">{eng.fullName}</td>
                      <td className="py-3.5 px-5 text-slate-500 font-medium">
                        {eng.currentTitle || "Software Engineer"}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2 max-w-xs">
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0 border border-slate-200/40">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${completionPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {completionPct}% density
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusToneClass}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => onInspectEngineer(eng.engineerId)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer group-hover:translate-x-0.5 transition-transform"
                        >
                          Inspect Profiles <ArrowRightIcon className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {teamOverview.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 px-5 text-center text-sm text-slate-500">
                      No linked profiles are available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
