import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CloudUpload, Download, KeyRound, Layers, Loader2, Lock, Save, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getFrameworkDisplayName, useSetActiveFramework, type FrameworkOption } from "@/lib/api/settings";
import { supabase } from "@/lib/supabase";
import { toLocalDateString } from "@/lib/datetime";
import { type SettingsSection } from "@/features/home/shared/navigation";
import { getSettingsSectionPath } from "@/features/home/shell/route-state";
import {
  C,
  Card,
  Field,
  GhostBtn,
  Input,
  PrimaryBtn,
  Select,
} from "@/features/home/shared/ui-kit";
import { Backdrop } from "@/features/home/shared/overlays";
import {
  EMPTY_PROFILE_TEAM_DRAFT,
  hasProfileTeamDraftChanges,
  profileTeamDraftFromUser,
  SETTINGS_SECTION_ITEMS,
} from "@/features/home/settings/settings-view-model";
import {
  DashboardSamplesSettings,
  type SampleContentVisibility,
} from "@/features/home/settings/settings-ui";
import { ProfileSettings } from "@/features/home/settings/settings-profile";
import { TeamSettings } from "@/features/home/settings/settings-team";
import { NotificationsSettings } from "@/features/home/settings/settings-notifications";
import { ExtensionSettings } from "@/features/home/settings/settings-extension";
import {
  MATRIX_PILLARS,
  type MatrixSchema,
  normalizeMatrix,
  levelFromCurrentRole,
  buildMatrixFromRawText,
  SAMPLE_MATRIX_TEMPLATE,
} from "@/features/home/assessment/competency-matrix";
import { parseFrameworkCategoryMap, resolveFrameworkCategoryEntries } from "@/features/home/shared/framework-taxonomy";
import { useWorkspace } from "@/features/home/context/WorkspaceContext";

export function SettingsView({
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
  const { user, updateUser } = useAuth();
  const { mode } = useWorkspace();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(EMPTY_PROFILE_TEAM_DRAFT);
  const [confirmingSave, setConfirmingSave] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savePassword, setSavePassword] = useState("");
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const isProfileOrTeamSection = section === "profile" || section === "team";
  const isManagerMode = mode === "manager";
  const visibleSettingsSections = useMemo(
    () => (isManagerMode ? SETTINGS_SECTION_ITEMS.filter((item) => item.id === "profile") : SETTINGS_SECTION_ITEMS),
    [isManagerMode],
  );

  useEffect(() => {
    if (!user) return;
    setDraft(profileTeamDraftFromUser(user));
  }, [user]);

  useEffect(() => {
    if (!isManagerMode || section === "profile") return;
    onSectionChange("profile");
    void navigate({ to: getSettingsSectionPath("profile") });
  }, [isManagerMode, navigate, onSectionChange, section]);

  const hasProfileTeamChanges = useMemo(() => hasProfileTeamDraftChanges(draft, user), [draft, user]);

  function updateDraft(next: Partial<typeof draft>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  async function saveAllSettings() {
    if (!user) return;
    if (!hasProfileTeamChanges) {
      toast.success("All settings are already up to date.");
      setConfirmingSave(false);
      setSavePassword("");
      return;
    }

    setIsSavingAll(true);
    const unifiedCurrentLevel = draft.currentLevel.trim();
    const ok = await updateUser(
      {
        fullName: draft.fullName.trim(),
        email: draft.email.trim(),
        currentLevel: unifiedCurrentLevel,
        jobTitle: unifiedCurrentLevel,
        targetLevel: draft.targetLevel.trim(),
        manager: draft.manager.trim(),
        managerEmail: draft.managerEmail.trim(),
        team: draft.team.trim(),
        skipLevel: draft.skipLevel.trim(),
      },
      savePassword,
    );
    setIsSavingAll(false);

    if (!ok) {
      toast.error("Incorrect password");
      return;
    }

    setConfirmingSave(false);
    setSavePassword("");
    toast.success("All settings saved");
  }

  async function handleDeleteAccount() {
    try {
      setIsDeletingAccount(true);
      const { error } = await supabase.rpc("delete_user_account");
      if (error) throw error;
      toast.success("Account deleted permanently.");
      await supabase.auth.signOut();
      void navigate({ to: "/", replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete account.";
      toast.error(message);
    } finally {
      setIsDeletingAccount(false);
      setShowConfirmModal(false);
    }
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      <Card className="col-span-1 p-2 h-fit">
        <nav className="space-y-0.5">
          {visibleSettingsSections.map((it) => {
            const Icon = it.icon;
            const active = section === it.id;
            return (
              <Link
                key={it.id}
                to={getSettingsSectionPath(it.id)}
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
              </Link>
            );
          })}
        </nav>
      </Card>

      <div className="col-span-3 space-y-6">
        {isManagerMode ? (
          <ManagerIdentityCard
            fullName={user?.fullName ?? null}
            email={user?.email ?? null}
            currentLevel={user?.currentLevel ?? null}
          />
        ) : (
          <>
            {(section === "profile" || section === "team") && (
              <>
                <ProfileSettings draft={draft} onChange={updateDraft} />
                <TeamSettings />
              </>
            )}
            {section === "notifications" && <NotificationsSettings />}
            {section === "extension" && <ExtensionSettings />}
            {section === "framework" && <FrameworkSettings />}
            {section === "dashboard" && (
              <DashboardSamplesSettings
                sampleContent={sampleContent}
                onSampleContentChange={onSampleContentChange}
              />
            )}
          </>
        )}
        {!isManagerMode && (
          <>
            <div className="border-t pt-4" style={{ borderColor: C.border }}>
              <div className="flex justify-end">
                <PrimaryBtn
                  onClick={() => {
                    if (!isProfileOrTeamSection) {
                      toast.success("Settings saved");
                      return;
                    }
                    setConfirmingSave(true);
                  }}
                >
                  <Save size={14} />
                  Save All Settings
                </PrimaryBtn>
              </div>
            </div>
            <div className="border-t pt-6 mt-8" style={{ borderColor: C.border }}>
              <div
                className="rounded-md border px-4 py-4"
                style={{ borderColor: C.border, background: C.card }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <AlertTriangle size={16} style={{ color: C.subtle }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: C.subtle }}>
                      Danger Zone
                    </div>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: C.slate }}>
                      Permanently delete your account and all related workspace data. This action cannot
                      be undone.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowConfirmModal(true)}
                      className="mt-3 h-9 px-3 rounded border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ borderColor: "#FF5630", color: "#AE2A19", background: "#FFFAF8" }}
                      disabled={isDeletingAccount}
                    >
                      {isDeletingAccount ? "Deleting account..." : "Delete account"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <AnimatePresence>
        {confirmingSave && isProfileOrTeamSection && !isManagerMode && (
          <Backdrop onClose={() => setConfirmingSave(false)}>
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
                      Required to save profile settings.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmingSave(false)}
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
                    value={savePassword}
                    onChange={(e) => setSavePassword(e.target.value)}
                    placeholder="Enter your password"
                    icon={<KeyRound size={14} />}
                  />
                </Field>
              </div>
              <div
                className="p-4 border-t flex justify-end gap-2"
                style={{ borderColor: C.border }}
              >
                <GhostBtn onClick={() => setConfirmingSave(false)}>Cancel</GhostBtn>
                <PrimaryBtn
                  disabled={!savePassword.trim() || isSavingAll}
                  onClick={() => {
                    void saveAllSettings();
                  }}
                >
                  {isSavingAll ? "Saving..." : "Save All Settings"}
                </PrimaryBtn>
              </div>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showConfirmModal && !isManagerMode && (
          <Backdrop onClose={() => setShowConfirmModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-md border"
              style={{ borderColor: C.border }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#FFEBE6" }}
                  >
                    <AlertTriangle size={18} style={{ color: C.red }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold" style={{ color: C.navy }}>
                      Delete account permanently?
                    </div>
                    <div className="text-sm mt-1.5 leading-relaxed" style={{ color: C.slate }}>
                      This removes your login, evidence logs, objectives, and reporting relationships.
                      This action cannot be undone.
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="px-5 py-3 border-t flex items-center justify-end gap-2"
                style={{ borderColor: C.border, background: C.bg }}
              >
                <GhostBtn onClick={() => setShowConfirmModal(false)} disabled={isDeletingAccount}>
                  Cancel
                </GhostBtn>
                <button
                  type="button"
                  onClick={() => void handleDeleteAccount()}
                  disabled={isDeletingAccount}
                  className="px-3 py-1.5 rounded text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: C.red }}
                >
                  {isDeletingAccount ? "Deleting..." : "Delete account"}
                </button>
              </div>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>
    </div>
  );
}

function ManagerIdentityCard({
  fullName,
  email,
  currentLevel,
}: {
  fullName: string | null;
  email: string | null;
  currentLevel: string | null;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Manager Profile Identity
        </h3>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        <IdentityField label="Full Name" value={fullName ?? "Not Provided"} />
        <IdentityField label="Corporate Email" value={email ?? "Not Provided"} />
        <IdentityField label="Current Corporate Title" value={currentLevel ?? "Manager Profile Context"} />
      </div>
      <div className="px-5 py-3 bg-slate-50/30 border-t border-slate-100 flex items-center gap-2">
        <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 font-mono">
          INFO
        </span>
        <p className="text-[11px] italic text-slate-400 leading-normal">
          Manager profile details are synced from your active account context. Toggle to Developer
          Space to manage personal notification and extension preferences.
        </p>
      </div>
    </div>
  );
}

function IdentityField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-xs font-semibold text-slate-800 block truncate" title={value}>
        {value}
      </span>
    </div>
  );
}

function FrameworkSettings() {
  const { userId, user } = useAuth();
  const frameworkUserId = userId ?? "";
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [rawText, setRawText] = useState("");

  const { data: frameworkOptions = [], isLoading: loadingFrameworks } = useQuery({
    queryKey: ["framework-options", frameworkUserId],
    enabled: Boolean(frameworkUserId),
    queryFn: async (): Promise<FrameworkOption[]> => {
      const { data, error } = await (supabase.from("competency_frameworks") as any)
        .select("id,name,description,is_system_default,matrix,created_at")
        .or(`is_system_default.eq.true,user_id.eq.${frameworkUserId}`)
        .order("is_system_default", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FrameworkOption[];
    },
  });

  const { data: profileActiveFrameworkId = null } = useQuery({
    queryKey: ["profile-active-framework", frameworkUserId],
    enabled: Boolean(frameworkUserId),
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await (supabase.from("profiles") as any)
        .select("active_framework_id")
        .eq("id", frameworkUserId)
        .maybeSingle();
      if (error) throw error;
      return (data?.active_framework_id as string | null) ?? null;
    },
  });

  const setActiveFrameworkMutation = useSetActiveFramework(frameworkUserId);

  const saveFrameworkMutation = useMutation({
    mutationFn: async ({
      name,
      matrix,
      description,
    }: {
      name: string;
      matrix: MatrixSchema;
      description?: string;
    }) => {
      const { data, error } = await (supabase.from("competency_frameworks") as any)
        .insert({
          user_id: frameworkUserId,
          name,
          description: description ?? null,
          is_system_default: false,
          matrix,
        })
        .select("id")
        .single();
      if (error) throw error;
      const frameworkId = data.id as string;
      const { error: profileError } = await (supabase.from("profiles") as any)
        .update({ active_framework_id: frameworkId })
        .eq("id", frameworkUserId);
      if (profileError) throw profileError;
      return frameworkId;
    },
    onSuccess: (frameworkId) => {
      setSelectedFrameworkId(frameworkId);
      setMismatch(false);
      queryClient.setQueryData(["profile-active-framework", frameworkUserId], frameworkId);
      void queryClient.invalidateQueries({ queryKey: ["framework-options", frameworkUserId] });
      void queryClient.invalidateQueries({ queryKey: ["profile-active-framework", frameworkUserId] });
      void queryClient.invalidateQueries({ queryKey: ["active-framework-matrix", frameworkUserId] });
      void queryClient.invalidateQueries({ queryKey: ["active-framework-context", frameworkUserId] });
      void queryClient.invalidateQueries({ queryKey: ["profile", frameworkUserId] });
      toast.success("Custom framework imported and linked.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (profileActiveFrameworkId && selectedFrameworkId !== profileActiveFrameworkId) {
      setSelectedFrameworkId(profileActiveFrameworkId);
      return;
    }
    if (!selectedFrameworkId && frameworkOptions.length > 0) {
      setSelectedFrameworkId(frameworkOptions[0].id);
    }
  }, [frameworkOptions, profileActiveFrameworkId, selectedFrameworkId]);

  const activeFramework = useMemo(() => {
    if (frameworkOptions.length === 0) return null;
    return frameworkOptions.find((f) => f.id === selectedFrameworkId) ?? frameworkOptions[0];
  }, [frameworkOptions, selectedFrameworkId]);

  const activeMatrix = useMemo(
    () => (activeFramework ? normalizeMatrix(activeFramework.matrix) : null),
    [activeFramework],
  );
  const hasCategoryPreview = Boolean(parseFrameworkCategoryMap(activeFramework?.matrix ?? null));
  const activeCategoryEntries = useMemo(
    () => resolveFrameworkCategoryEntries(activeFramework?.matrix ?? null),
    [activeFramework],
  );
  const frameworkTracks = useMemo(() => {
    if (hasCategoryPreview) {
      return activeCategoryEntries.map(([categoryName, details], index) => {
        const expectations = [details.summary, ...details.items.map((item) => `• ${item}`)]
          .filter((entry): entry is string => Boolean(entry && entry.trim().length > 0))
          .join("\n");
        return {
          id: `${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
          label: categoryName,
          levels: [
            {
              rank: 1,
              title: "Core Expectations",
              expectationsDescription: expectations || "No expectations defined yet.",
            },
          ],
        };
      });
    }
    if (!activeMatrix) return [];
    const levelMeta = [
      { key: "junior" as const, rank: 1, title: "Junior" },
      { key: "mid" as const, rank: 2, title: "Mid" },
      { key: "senior" as const, rank: 3, title: "Senior" },
    ];
    return MATRIX_PILLARS.map((pillar) => ({
      id: pillar.key,
      label: pillar.label,
      levels: levelMeta.map((level) => {
        const expectations = (activeMatrix[level.key][pillar.key] ?? [])
          .map((item) => `• ${item}`)
          .join("\n");
        return {
          rank: level.rank,
          title: level.title,
          expectationsDescription: expectations || "No expectations defined yet.",
        };
      }),
    }));
  }, [activeCategoryEntries, activeMatrix, hasCategoryPreview]);
  const activeTrack = useMemo(
    () => frameworkTracks.find((track) => track.id === selectedTrackId) ?? frameworkTracks[0] ?? null,
    [frameworkTracks, selectedTrackId],
  );
  const activeLevel = levelFromCurrentRole(user?.currentLevel);

  useEffect(() => {
    if (frameworkTracks.length === 0) {
      setSelectedTrackId("");
      return;
    }
    if (!frameworkTracks.some((track) => track.id === selectedTrackId)) {
      setSelectedTrackId(frameworkTracks[0].id);
    }
  }, [frameworkTracks, selectedTrackId]);

  function linkSelectedFramework(nextFrameworkId: string) {
    if (!frameworkUserId) {
      toast.error("Sign in to change framework preferences.");
      return;
    }
    setSelectedFrameworkId(nextFrameworkId);
    setActiveFrameworkMutation.mutate(nextFrameworkId, {
      onSuccess: () => {
        toast.success("Active framework updated.");
      },
    });
  }

  function downloadTemplate() {
    const blob = new Blob([JSON.stringify(SAMPLE_MATRIX_TEMPLATE, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "career-matrix-framework-template.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importFrameworkJson(file: File) {
    if (!frameworkUserId) {
      toast.error("Sign in before importing frameworks.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".json")) {
      toast.error("Only JSON files are supported for direct import.");
      return;
    }

    setMismatch(false);
    setParsing(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const matrix = normalizeMatrix(parsed);
      if (!matrix) {
        setMismatch(true);
        toast.error(
          "Invalid framework JSON. Required keys: junior, mid, senior with technical_execution, collaboration, delivery_reliability arrays.",
        );
        return;
      }

      const frameworkName = file.name.replace(/\.json$/i, "").trim() || "Imported Framework";
      saveFrameworkMutation.mutate({
        name: frameworkName,
        matrix,
        description: "Imported from JSON template upload.",
      });
    } catch {
      setMismatch(true);
      toast.error("Unable to parse JSON file. Please verify the file format.");
    } finally {
      setParsing(false);
    }
  }

  function processRawTextIntoFramework() {
    if (!frameworkUserId) {
      toast.error("Sign in before importing frameworks.");
      return;
    }
    if (!rawText.trim()) {
      toast.error("Paste source text before processing.");
      return;
    }
    const matrix = buildMatrixFromRawText(rawText);
    saveFrameworkMutation.mutate({
      name: `Quick-Start Framework ${toLocalDateString()}`,
      matrix,
      description: "Generated from quick-start raw text import.",
    });
  }

  return (
    <Card className="p-6">
      <SectionHeader
        title="Competency Matrix Configuration"
        sub="Select defaults, preview pillar expectations, and import your own competency matrix."
      />

      <div className="mt-4 bg-slate-50 border border-slate-200/60 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
          <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-bold text-slate-800 leading-5 break-words">
              {activeFramework ? getFrameworkDisplayName(activeFramework) : "No Active Framework"}
            </div>
            <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-none px-1.5 py-0.5">
              Active
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 max-w-2xl leading-relaxed">
            {activeFramework?.description?.trim() ||
              `Aligned to your current role level: ${activeLevel}.`}
          </p>
        </div>
        <div className="w-full rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold mb-1.5" style={{ color: C.subtle }}>
            Framework Selector
          </div>
          <Select
            icon={<Layers size={14} />}
            value={selectedFrameworkId}
            disabled={loadingFrameworks || frameworkOptions.length === 0}
            onChange={(e) => linkSelectedFramework(e.target.value)}
          >
            {frameworkOptions.length === 0 ? (
              <option value="">No frameworks available</option>
            ) : (
              frameworkOptions.map((framework) => (
                <option
                  key={framework.id}
                  value={framework.id}
                  title={getFrameworkDisplayName(framework)}
                >
                  {truncateFrameworkLabel(getFrameworkDisplayName(framework))}
                </option>
              ))
            )}
          </Select>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="space-y-2">
          {frameworkTracks.length > 0 ? (
            frameworkTracks.map((track) => {
              const isActive = activeTrack?.id === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setSelectedTrackId(track.id)}
                  className={
                    isActive
                      ? "w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-all cursor-pointer bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600 font-bold hover:bg-indigo-50 hover:text-indigo-700 rounded-r-lg rounded-l-none"
                      : "w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-all cursor-pointer"
                  }
                >
                  {track.label}
                </button>
              );
            })
          ) : (
            <div className="text-xs text-slate-500">
              Select a core competency track on the left to review scope and role growth criteria.
            </div>
          )}
        </div>

        <div className="md:col-span-3">
          {activeTrack && activeTrack.levels.length > 0 ? (
            <div className="space-y-4 flex-1">
              {activeTrack.levels.map((level) => (
                <div
                  key={`${activeTrack.id}-${level.rank}-${level.title}`}
                  className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all space-y-3"
                >
                  {level.title === "Core Expectations" ? (
                    <h4 className="text-xs font-bold text-slate-800">{level.title}</h4>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 border border-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded-md">
                        Level {level.rank}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800">{level.title}</h4>
                    </div>
                  )}
                  <div className="max-w-2xl space-y-1.5">
                    {level.expectationsDescription
                      .split("\n")
                      .filter((line) => line.trim().length > 0)
                      .map((line, index) => (
                        <p key={`${level.title}-${index}`} className="whitespace-pre-line text-xs leading-relaxed text-slate-600">
                          {line}
                        </p>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-xs text-slate-500">
              Select a core competency track on the left to review scope and role growth criteria.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <GhostBtn onClick={downloadTemplate}>
          <Download size={14} />
          Download Sample Framework Template
        </GhostBtn>
      </div>

      <div
        onClick={() => !parsing && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) void importFrameworkJson(dropped);
        }}
        className={`mt-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors px-6 py-7 flex flex-col items-center justify-center text-center ${
          dragOver ? "bg-[#DEEBFF]" : "hover:bg-slate-50"
        }`}
        style={{ borderColor: dragOver ? C.primary : "#C1C7D0" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) {
              void importFrameworkJson(selected);
            }
            event.target.value = "";
          }}
        />
        {parsing ? (
          <>
            <Loader2 size={26} className="animate-spin" style={{ color: C.primary }} />
            <div className="mt-2 text-sm font-semibold" style={{ color: C.navy }}>
              Validating and importing framework...
            </div>
          </>
        ) : (
          <>
            <CloudUpload size={30} style={{ color: C.primary }} />
            <div className="mt-2 text-sm font-semibold" style={{ color: C.navy }}>
              Drop JSON framework file or click to browse
            </div>
            <div className="text-xs mt-1" style={{ color: C.subtle }}>
              Required keys: junior, mid, senior + technical_execution/collaboration/delivery_reliability arrays
            </div>
          </>
        )}
      </div>

      {mismatch && (
        <div className="mt-4 p-4 rounded border flex gap-3" style={{ borderColor: "#FFC400", background: "#FFFBE6" }}>
          <AlertTriangle size={18} style={{ color: "#FF8B00" }} className="shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed" style={{ color: C.slate }}>
            Uploaded JSON did not match the required matrix structure. Download the sample template,
            copy your content into the same shape, and retry import.
          </div>
        </div>
      )}

      <details className="mt-6 rounded border" style={{ borderColor: C.border }}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold" style={{ color: C.navy }}>
          Quick-Start: Import Raw Text
        </summary>
        <div className="px-4 pb-4">
          <p className="text-xs leading-relaxed" style={{ color: C.slate }}>
            Paste raw text from a handbook/wiki. We split bullet lines, classify by keywords, map into
            the three matrix pillars, and save as a custom framework.
          </p>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste competency descriptions, bullet points, or handbook excerpts..."
            className="mt-3 w-full min-h-[180px] resize-y rounded border p-3 text-sm leading-relaxed outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            style={{ borderColor: C.border, color: C.navy }}
          />
          <div className="mt-3">
            <PrimaryBtn
              onClick={processRawTextIntoFramework}
              disabled={saveFrameworkMutation.isPending || !rawText.trim()}
            >
              <Sparkles size={14} />
              Process & Adapt Framework
            </PrimaryBtn>
          </div>
        </div>
      </details>
    </Card>
  );
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
        {title}
      </h3>
      <p className="text-xs mt-1" style={{ color: C.subtle }}>
        {sub}
      </p>
    </div>
  );
}

function truncateFrameworkLabel(label: string, maxLength = 56): string {
  const normalized = label.trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
