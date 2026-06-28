import { useNavigate } from "@tanstack/react-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
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
import { getManagerTeamOverview, signOffTransfer } from "@/lib/api/manager-invites.functions";
import { sendNotification } from "@/lib/api/notifications.functions";
import { getSafeErrorMessage } from "@/lib/safe-error-message";
import { supabase } from "@/lib/supabase";
import { formatUtcToLocal, toLocalDateString } from "@/lib/datetime";
import { generateSafeId } from "@/lib/utils/generateSafeId";
import { useFramework } from "@/context/FrameworkContext";
import { ManagerActionsPanel } from "@/components/ManagerActionsPanel";
import {
  C,
  BrandMark,
  Card,
  PrimaryBtn,
  GhostBtn,
  Pill,
  Badge,
  SourceIcon,
  SourceChip,
  Input,
  Select,
  Dropdown,
  Field,
} from "@/features/home/shared/ui-kit";
import { Backdrop, ConfirmDialog, Textarea } from "@/features/home/shared/overlays";
import { HomeAuthApp } from "@/features/home/auth/auth";
import {
  MANAGER_ONBOARDING_CONTEXT_KEY,
  PENDING_WORKSPACE_INVITE_HASH_KEY,
} from "@/features/home/shared/constants";
import {
  initialRadar,
  initialEvidence,
  initialInbox,
  initialObjectives,
  type EvidenceRecord,
  type Objective,
  type EvidenceStatus,
  type EvidenceMatch,
  type SuccessCriterion,
} from "@/features/home/shared/models";
import { SecureField } from "@/features/home/settings/profile-security";
import { useManagerRelationships } from "@/features/home/hooks/use-manager-relationships";
import { CountdownBadge, ObjectivesView } from "@/features/home/views/objectives-view";
import {
  type KnowledgeHubItem,
  type KnowledgeItemRow,
  parseKnowledgeItemRow,
} from "@/features/home/knowledge/knowledge";
import { KnowledgeEditorModal, KnowledgeHubView } from "@/features/home/knowledge/knowledge-view";
import { CaptureModal } from "@/features/home/capture/capture-modal";
import { type SettingsSection, type Tab } from "@/features/home/shared/navigation";
import { getTabPath } from "@/features/home/shell/route-state";
import type {
  HomeRouteAppProps,
  InboxConfirmPayload,
  InboxViewItem,
} from "@/features/home/shell/home-route-contracts";
import { HOME_PAGE_TITLES } from "@/features/home/shell/home-route-view-model";
import { SettingsView } from "@/features/home/settings/settings-view";
import { WorkspaceProvider, useWorkspace } from "@/features/home/context/WorkspaceContext";
import { type PinnedResourceRow } from "@/features/home/shared/pinned-resource-samples";
import { isHttpUrl, parsePinnedKnowledgeId } from "@/features/home/shared/pinned-resource-targets";
import {
  buildHomeGlobalSearchResults,
  buildPinnedResourceLookups,
  buildVisiblePinnedResources,
} from "@/features/home/shell/selectors/home-route-selectors";
import { useHomePinnedResourcesActions } from "@/features/home/shell/actions/use-home-pinned-resources-actions";
import { useHomeInboxActions } from "@/features/home/shell/actions/use-home-inbox-actions";
import { useHomeNavigationActions } from "@/features/home/shell/actions/use-home-navigation-actions";
import { useHomeAssessmentActions } from "@/features/home/shell/actions/use-home-assessment-actions";
import { useHomeAssessmentDraft } from "@/features/home/shell/hooks/use-home-assessment-draft";
import { useHomeSampleContentVisibility } from "@/features/home/shell/hooks/use-home-sample-content-visibility";
import { useHomeCaptureOnLoad } from "@/features/home/shell/hooks/use-home-capture-on-load";
import { useHomePinnedQuickAddDismiss } from "@/features/home/shell/hooks/use-home-pinned-quick-add-dismiss";
import {
  deriveHomeWorkspaceScope,
  getSelectedEngineerRole,
  pickWorkspaceData,
  shouldShowTeamTransitionCard,
} from "@/features/home/shell/selectors/home-manager-workspace-selectors";
import {
  COMPETENCY_DESC,
  EFFECTIVENESS_SCALE,
  SUBCATEGORIES,
  type FrameworkCategoryDefinition,
  type FrameworkCategoryMap,
  resolveFrameworkCategoryEntries,
  buildFrameworkCategoryMapFromContext,
  normalizeCategoryName,
  resolveCategoryFromFramework,
  resolveFrameworkEffectivenessScale,
  buildFeedbackScoreMap,
  resolveFrameworkCategoryMap,
} from "@/features/home/shared/framework-taxonomy";
import { formatDisplayDate, formatObjectiveCode } from "@/features/home/shared/formatters";
import { Sidebar, TopHeader } from "@/features/home/shell/home-shell";
import { BusinessCaseTab } from "@/features/home/components/BusinessCaseTab";
import { OneOnOneWorkspace } from "@/features/home/components/OneOnOneWorkspace";
import { ManagerDashboardView } from "@/features/home/components/ManagerDashboardView";
import {
  CreateObjectiveModal,
  ObjectiveSlideover,
} from "@/features/home/shell/home-objective-overlays";
import {
  EvidenceSlideover,
  InboxReviewSlideover,
} from "@/features/home/shell/home-evidence-overlays";
import { ReviewWizard } from "@/features/home/shell/home-review-wizard";
import { DashboardView } from "@/features/home/views/dashboard-view";
import { RadarView } from "@/features/home/views/radar-view";
import { FeedbackView } from "@/features/home/views/feedback-view";
import { ReportView } from "@/features/home/views/report-view";
import { EvidenceView, MatchBadge } from "@/features/home/views/evidence-view";
import {
  AssessmentsArchiveTable,
  AssessmentHistoryModal,
} from "@/features/home/assessment/assessment-history";
import {
  type Assessment,
  type AssessmentCategory,
  type AssessmentQuestion,
  type AssessmentWizardDraft,
  type ReviewQuestion,
  type ReviewSession,
  calculateScoreDelta,
  deriveRadarData,
  getHistoricalQuestionScores,
  initialAssessments,
  assessmentToSession,
  sessionToAssessment,
  triggerAssessmentPdfDownload,
} from "@/features/home/assessment/assessment-domain";
import {
  extractFirstLink,
  polishText,
  getDisplayName,
  inferCompetencyFromText,
  extractYouTubeVideoId,
  firstUrlInText,
  urlsInText,
  normalizeReferenceLinks,
} from "@/features/home/shared/text-utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Radar as RadarIcon,
  LayoutDashboard,
  Target,
  Search,
  Plus,
  Pin,
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
import { LogOut, ShieldCheck, ChevronLeft } from "lucide-react";
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

const MANAGER_ENGINEER_LAST_TAB_STORAGE_KEY = "evitrace.manager.engineerLastTab";
const MANAGER_ENGINEER_ALLOWED_TABS: Tab[] = ["evidence", "objectives", "radar", "report"];

function readManagerEngineerLastTabMap(): Record<string, Tab> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(MANAGER_ENGINEER_LAST_TAB_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const normalized: Record<string, Tab> = {};
    Object.entries(parsed).forEach(([engineerId, maybeTab]) => {
      if (
        typeof engineerId === "string" &&
        MANAGER_ENGINEER_ALLOWED_TABS.includes(maybeTab as Tab)
      ) {
        normalized[engineerId] = maybeTab as Tab;
      }
    });
    return normalized;
  } catch {
    return {};
  }
}

function writeManagerEngineerLastTabMap(map: Record<string, Tab>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(MANAGER_ENGINEER_LAST_TAB_STORAGE_KEY, JSON.stringify(map));
}

export function HomeRouteApp({
  activeTab,
  activeSettingsSection = "profile",
  openCaptureOnLoad = false,
  routedEngineerId = null,
}: HomeRouteAppProps) {
  return (
    <HomeAuthApp
      EvitraceApp={() => (
        <WorkspaceProvider>
          <EvitraceApp
            activeTab={activeTab}
            activeSettingsSection={activeSettingsSection}
            openCaptureOnLoad={openCaptureOnLoad}
            routedEngineerId={routedEngineerId}
          />
        </WorkspaceProvider>
      )}
    />
  );
}

function EvitraceApp({
  activeTab,
  activeSettingsSection,
  openCaptureOnLoad,
  routedEngineerId,
}: {
  activeTab: Tab;
  activeSettingsSection: SettingsSection;
  openCaptureOnLoad: boolean;
  routedEngineerId: string | null;
}) {
  const { user, userId: authUserId, signout } = useAuth();
  const {
    mode,
    isManagerAccount,
    selectedEngineerId: workspaceSelectedEngineerId,
    setSelectedEngineerId: setWorkspaceSelectedEngineerId,
    refreshWorkspace,
    loading: workspaceContextLoading,
  } = useWorkspace();
  const { categories: frameworkCategories, currentFramework } = useFramework();
  const navigate = useNavigate();
  const userId = authUserId ?? "";
  const {
    managedEngineers,
    isLoadingManagedEngineers,
    activeView,
    setActiveView,
    managerRelationshipsRefreshNonce,
    setManagerRelationshipsRefreshNonce,
    handoverNotes,
    setHandoverNotes,
    isSigningOffTransfer,
    setIsSigningOffTransfer,
  } = useManagerRelationships(userId);
  const isManagerMode = mode === "manager";
  const managerWorkspaceEnabled = mode === "manager" && isManagerAccount;
  const managedEngineersInScope = isManagerMode ? managedEngineers : [];
  const selectedEngineerId = isManagerMode ? workspaceSelectedEngineerId : null;
  const scopedRouteEngineerId = routedEngineerId?.trim() || null;
  const isManagerScopedToEngineer = managerWorkspaceEnabled && Boolean(selectedEngineerId);
  const reportSubjectEngineerId =
    managerWorkspaceEnabled && selectedEngineerId ? selectedEngineerId : userId;
  const assessmentWorkspaceUserId = reportSubjectEngineerId;

  useEffect(() => {
    if (!isManagerMode) {
      setWorkspaceSelectedEngineerId(null);
    }
  }, [isManagerMode, setWorkspaceSelectedEngineerId]);

  useEffect(() => {
    if (workspaceContextLoading) return;
    if (!isManagerMode) return;
    if (workspaceSelectedEngineerId === scopedRouteEngineerId) return;
    setWorkspaceSelectedEngineerId(scopedRouteEngineerId);
  }, [
    isManagerMode,
    scopedRouteEngineerId,
    setWorkspaceSelectedEngineerId,
    workspaceContextLoading,
    workspaceSelectedEngineerId,
  ]);

  useEffect(() => {
    if (!isManagerMode) return;
    if (scopedRouteEngineerId) {
      if (activeView !== "profile") {
        setActiveView("profile");
      }
      return;
    }
    if (activeView === "profile") {
      setActiveView("directory");
    }
  }, [activeView, isManagerMode, scopedRouteEngineerId, setActiveView]);

  const tab = activeTab;
  const settingsSection = activeSettingsSection;
  const getTabPathForCurrentScope = useCallback(
    (nextTab: Tab) =>
      getTabPath(nextTab, {
        mode: isManagerMode ? "manager" : "engineer",
        engineerId: selectedEngineerId,
      }),
    [isManagerMode, selectedEngineerId],
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [managerProfileSubTab, setManagerProfileSubTab] = useState<
    "tracking_workspace" | "compilation_dossier" | "one_on_one_sync"
  >("tracking_workspace");
  const managerEngineerLastTabRef = useRef<Record<string, Tab>>(readManagerEngineerLastTabMap());
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const hasProcessedPendingInviteRef = useRef(false);
  const { sampleContent, setSampleContent } = useHomeSampleContentVisibility();

  useEffect(() => {
    if (!managerWorkspaceEnabled) {
      setActiveView("profile");
      setManagerProfileSubTab("tracking_workspace");
      return;
    }
    if (
      selectedEngineerId &&
      !managedEngineersInScope.some((engineer) => engineer.id === selectedEngineerId)
    ) {
      setWorkspaceSelectedEngineerId(null);
      setActiveView("directory");
      return;
    }
    if (isLoadingManagedEngineers) {
      return;
    }
    if (managedEngineersInScope.length === 0) {
      setWorkspaceSelectedEngineerId(null);
      setManagerProfileSubTab("tracking_workspace");
    }
  }, [
    isLoadingManagedEngineers,
    selectedEngineerId,
    managedEngineersInScope.length,
    managedEngineersInScope,
    managerWorkspaceEnabled,
    setActiveView,
    setWorkspaceSelectedEngineerId,
  ]);

  useEffect(() => {
    if (!selectedEngineerId || activeView !== "profile") {
      setManagerProfileSubTab("tracking_workspace");
    }
  }, [activeView, selectedEngineerId]);

  useEffect(() => {
    if (!isManagerMode || !selectedEngineerId || activeView !== "profile") return;
    if (!MANAGER_ENGINEER_ALLOWED_TABS.includes(tab)) return;
    managerEngineerLastTabRef.current = {
      ...managerEngineerLastTabRef.current,
      [selectedEngineerId]: tab,
    };
    writeManagerEngineerLastTabMap(managerEngineerLastTabRef.current);
  }, [activeView, isManagerMode, selectedEngineerId, tab]);

  useEffect(() => {
    if (workspaceContextLoading || isLoadingManagedEngineers) return;

    if (mode === "engineer" && scopedRouteEngineerId) {
      void navigate({ to: getTabPath("dashboard"), replace: true });
      return;
    }

    if (mode === "manager") {
      const managerNeedsEngineerContext =
        tab === "evidence" ||
        tab === "objectives" ||
        tab === "radar" ||
        tab === "report" ||
        tab === "knowledge";

      if (managerNeedsEngineerContext && !scopedRouteEngineerId) {
        void navigate({ to: getTabPath("dashboard"), replace: true });
      }
    }
  }, [
    isLoadingManagedEngineers,
    mode,
    navigate,
    scopedRouteEngineerId,
    tab,
    workspaceContextLoading,
  ]);

  useEffect(() => {
    if (!userId || hasProcessedPendingInviteRef.current || typeof window === "undefined") return;
    const storedHash = window.localStorage.getItem(PENDING_WORKSPACE_INVITE_HASH_KEY)?.trim();
    if (!storedHash) return;
    hasProcessedPendingInviteRef.current = true;

    async function acceptPendingWorkspaceInvite() {
      try {
        const { data, error } = await supabase.rpc("accept_manager_invite", {
          target_hash: storedHash,
          current_manager_id: userId,
        });
        const response = (Array.isArray(data) ? data[0] : data) as {
          success?: boolean;
          message?: string;
        } | null;
        if (error || response?.success === false) {
          toast.error(
            getSafeErrorMessage(
              response?.message ?? error,
              "Workspace connection linking transaction failed.",
            ),
          );
          return;
        }
        toast.success(
          response?.message ??
            "Teammate profile successfully added to your organization hierarchy.",
        );
        await refreshWorkspace();
        setManagerRelationshipsRefreshNonce((prev) => prev + 1);
      } catch {
        toast.error("Network synchronization timeout during invite activation.");
      } finally {
        window.localStorage.removeItem(PENDING_WORKSPACE_INVITE_HASH_KEY);
      }
    }

    void acceptPendingWorkspaceInvite();
  }, [refreshWorkspace, userId, setManagerRelationshipsRefreshNonce]);

  const { data: evidence = [] } = useEvidenceQuery(userId, {
    includeSamples: sampleContent.evidence,
  });
  const { data: archivedEvidence = [] } = useEvidenceQuery(userId, { archived: true });
  const saveEvidenceMutation = useSaveEvidence(userId);
  const saveSelectedEngineerEvidenceMutation = useSaveEvidence(selectedEngineerId ?? "");
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
  const moveSelectedEngineerObjectiveMutation = useMoveObjective(selectedEngineerId ?? "");
  const saveSelectedEngineerObjectiveMutation = useSaveObjective(selectedEngineerId ?? "");
  const archiveObjectiveMutation = useArchiveObjective(userId);
  const restoreObjectiveMutation = useRestoreObjective(userId);
  const deleteObjectiveMutation = useDeleteObjective(userId);
  const { data: assessments = [] } = useAssessmentsQuery(userId);
  const { data: selectedEngineerEvidence = [] } = useEvidenceQuery(selectedEngineerId ?? "", {
    includeSamples: false,
  });
  const { data: selectedEngineerObjectives = [] } = useObjectivesQuery(selectedEngineerId ?? "", {
    includeSamples: false,
  });
  const { data: selectedEngineerArchivedEvidence = [] } = useEvidenceQuery(
    selectedEngineerId ?? "",
    {
      includeSamples: false,
      archived: true,
    },
  );
  const { data: selectedEngineerArchivedObjectives = [] } = useObjectivesQuery(
    selectedEngineerId ?? "",
    {
      includeSamples: false,
      archived: true,
    },
  );
  const { data: selectedEngineerInbox = [] } = useInboxQuery(selectedEngineerId ?? "");
  const { data: selectedEngineerAssessments = [] } = useAssessmentsQuery(selectedEngineerId ?? "");
  const {
    data: managerTeamOverview = [],
    isLoading: isManagerTeamOverviewLoading,
    isError: isManagerTeamOverviewError,
  } = useQuery({
    queryKey: ["manager-team-overview", userId, managerRelationshipsRefreshNonce],
    enabled: Boolean(userId) && managedEngineersInScope.length > 0,
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("Session expired. Please sign in again.");
      }
      return await getManagerTeamOverview({
        data: {
          token,
        },
      });
    },
  });
  const { data: assessmentManagerName = "" } = useQuery({
    queryKey: [
      "assessment-manager-name",
      reportSubjectEngineerId,
      selectedEngineerId,
      managerWorkspaceEnabled,
    ],
    enabled: Boolean(reportSubjectEngineerId),
    queryFn: async (): Promise<string> => {
      if (!reportSubjectEngineerId) return "";

      const { data, error } = await (supabase as any)
        .from("reporting_relationships")
        .select("manager_id, profiles!manager_id(full_name)")
        .eq("engineer_id", reportSubjectEngineerId)
        .eq("relation_type", "direct_manager")
        .in("status", ["active", "in_handover"])
        .limit(1)
        .maybeSingle();

      if (error) return "";
      const managerId = typeof data?.manager_id === "string" ? data.manager_id.trim() : "";
      if (!managerId) return "";
      const managerProfile = Array.isArray(data?.profiles) ? data.profiles[0] : data?.profiles;
      const managerName = managerProfile?.full_name?.trim();
      if (typeof managerName === "string" && managerName.length > 0) return managerName;
      return "";
    },
  });
  const finalizeAssessmentMutation = useFinalizeAssessment(assessmentWorkspaceUserId);
  const deleteAssessmentMutation = useDeleteAssessment(assessmentWorkspaceUserId);
  const updateTopicsMutation = useUpdateOneOnOneTopics(assessmentWorkspaceUserId);
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
  const { data: activeFrameworkMatrix = null } = useQuery({
    queryKey: ["active-framework-matrix", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<unknown | null> => {
      if (!userId) return null;

      const { data: profile, error: profileError } = await (supabase.from("profiles") as any)
        .select("active_framework_id")
        .eq("id", userId)
        .maybeSingle();
      if (profileError) throw profileError;

      const activeFrameworkId = (profile?.active_framework_id as string | null) ?? null;
      if (activeFrameworkId) {
        const { data: activeFramework, error: activeFrameworkError } = await (
          supabase.from("competency_frameworks") as any
        )
          .select("matrix")
          .eq("id", activeFrameworkId)
          .maybeSingle();
        if (activeFrameworkError) throw activeFrameworkError;
        if (activeFramework?.matrix) return activeFramework.matrix as unknown;
      }

      const { data: fallbackFramework, error: fallbackError } = await (
        supabase.from("competency_frameworks") as any
      )
        .select("matrix")
        .or(`is_system_default.eq.true,user_id.eq.${userId}`)
        .order("is_system_default", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (fallbackError) throw fallbackError;
      return (fallbackFramework?.matrix as unknown) ?? null;
    },
  });
  const knowledgeQueryKey = ["knowledge_items", userId] as const;
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
      void queryClient.invalidateQueries({ queryKey: knowledgeQueryKey });
    },
  });
  const updateKnowledgeMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      title: string;
      description: string;
      reference_links: string[];
    }) => {
      const { error } = await (supabase as any)
        .from("knowledge_items")
        .update({
          title: payload.title,
          description: payload.description,
          reference_links: payload.reference_links,
        })
        .eq("id", payload.id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: knowledgeQueryKey });
      const previousRows = queryClient.getQueryData<KnowledgeItemRow[]>(knowledgeQueryKey) ?? [];
      queryClient.setQueryData<KnowledgeItemRow[]>(knowledgeQueryKey, (rows = []) =>
        rows.map((row) =>
          row.id === payload.id
            ? {
                ...row,
                title: payload.title,
                description: payload.description,
                reference_links: payload.reference_links,
              }
            : row,
        ),
      );
      return { previousRows };
    },
    onError: (error: Error, _payload, context) => {
      if (context?.previousRows) {
        queryClient.setQueryData(knowledgeQueryKey, context.previousRows);
      }
      toast.error(getSafeErrorMessage(error, "Failed to update knowledge entry."));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: knowledgeQueryKey });
    },
  });
  const deleteKnowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("knowledge_items")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: knowledgeQueryKey });
      const previousRows = queryClient.getQueryData<KnowledgeItemRow[]>(knowledgeQueryKey) ?? [];
      queryClient.setQueryData<KnowledgeItemRow[]>(knowledgeQueryKey, (rows = []) =>
        rows.filter((row) => row.id !== id),
      );
      return { previousRows };
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousRows) {
        queryClient.setQueryData(knowledgeQueryKey, context.previousRows);
      }
      toast.error(getSafeErrorMessage(error, "Failed to delete knowledge entry."));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: knowledgeQueryKey });
    },
  });
  const [sampleAssessments, setSampleAssessments] = useState<Assessment[]>(() =>
    initialAssessments.slice(0, 3),
  );
  const { wizardDraft, setWizardDraft } = useHomeAssessmentDraft(assessmentWorkspaceUserId);

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

  const radarData = useMemo(
    () =>
      deriveRadarData(
        selectedEngineerId ? selectedEngineerAssessments[0] : assessments[0],
        frameworkCategories,
        currentFramework?.matrix ?? activeFrameworkMatrix,
      ),
    [
      selectedEngineerAssessments,
      selectedEngineerId,
      assessments,
      currentFramework?.matrix,
      frameworkCategories,
      activeFrameworkMatrix,
    ],
  );

  const [showCapture, setShowCapture] = useState(false);
  const [showCreateObjective, setShowCreateObjective] = useState(false);
  const [openObjective, setOpenObjective] = useState<Objective | null>(null);
  const [openEvidence, setOpenEvidence] = useState<EvidenceRecord | null>(null);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeHubItem | null>(null);
  const [pendingKnowledgeDelete, setPendingKnowledgeDelete] = useState<KnowledgeHubItem | null>(
    null,
  );
  const [openInbox, setOpenInbox] = useState<InboxViewItem | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [review, setReview] = useState<ReviewSession | null>(null);
  const [pendingAssessmentDeleteId, setPendingAssessmentDeleteId] = useState<string | null>(null);
  const [showDiscardDraftConfirm, setShowDiscardDraftConfirm] = useState(false);
  const [dismissedSampleInboxIds, setDismissedSampleInboxIds] = useState<string[]>([]);
  const [pinnedResources, setPinnedResources] = useState<PinnedResourceRow[]>([]);
  const [newPinnedTitle, setNewPinnedTitle] = useState("");
  const [newPinnedUrl, setNewPinnedUrl] = useState("");
  const [isSubmittingPinnedResource, setIsSubmittingPinnedResource] = useState(false);
  const [isPinnedQuickAddOpen, setIsPinnedQuickAddOpen] = useState(false);
  const pinnedQuickAddPopoverRef = useRef<HTMLDivElement | null>(null);
  const pinnedQuickAddTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [focusedKnowledgeId, setFocusedKnowledgeId] = useState<string | null>(null);

  useHomeCaptureOnLoad({ openCaptureOnLoad, setShowCapture });

  const visibleEvidence = useMemo(
    () => (sampleContent.evidence ? evidence : evidence.filter((item) => !item.isSample)),
    [evidence, sampleContent.evidence],
  );
  const visibleArchivedEvidence = useMemo(
    () =>
      sampleContent.evidence ? archivedEvidence : archivedEvidence.filter((item) => !item.isSample),
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
  const globalSearchResults = useMemo(
    () =>
      buildHomeGlobalSearchResults({
        query: globalSearchQuery,
        visibleObjectives,
        visibleEvidence,
        knowledgeItems,
      }),
    [globalSearchQuery, knowledgeItems, visibleEvidence, visibleObjectives],
  );
  const {
    isManagerWorkspace,
    isManagerDirectoryView,
    activeWorkspaceId,
    notificationTargetUserId,
  } = useMemo(
    () =>
      deriveHomeWorkspaceScope({
        activeView,
        selectedEngineerId,
        managedEngineersCount: managedEngineersInScope.length,
        tab,
        userId,
      }),
    [activeView, managedEngineersInScope.length, selectedEngineerId, tab, userId],
  );
  const contextEvidence = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerEvidence,
    personalWorkspaceData: visibleEvidence,
  });
  const contextArchivedEvidence = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerArchivedEvidence,
    personalWorkspaceData: visibleArchivedEvidence,
  });
  const contextObjectives = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerObjectives,
    personalWorkspaceData: visibleObjectives,
  });
  const contextArchivedObjectives = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerArchivedObjectives,
    personalWorkspaceData: visibleArchivedObjectives,
  });
  const contextInbox = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerInbox,
    personalWorkspaceData: inbox,
  });
  const contextAssessments = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerAssessments,
    personalWorkspaceData: assessments,
  });
  const contextHistoryAssessments = pickWorkspaceData({
    isManagerWorkspace,
    managerWorkspaceData: selectedEngineerAssessments,
    personalWorkspaceData: historyAssessments,
  });
  const selectedEngineerRole = useMemo(
    () =>
      getSelectedEngineerRole({
        selectedEngineerId,
        isManagerWorkspace,
        managedEngineers: managedEngineersInScope,
      }),
    [isManagerWorkspace, managedEngineersInScope, selectedEngineerId],
  );
  const showTeamTransitionCard = useMemo(
    () =>
      shouldShowTeamTransitionCard({
        selectedEngineerId,
        isManagerWorkspace,
        managedEngineers: managedEngineersInScope,
      }),
    [isManagerWorkspace, managedEngineersInScope, selectedEngineerId],
  );
  const selectedManagedEngineer = useMemo(
    () => managedEngineersInScope.find((engineer) => engineer.id === selectedEngineerId) ?? null,
    [managedEngineersInScope, selectedEngineerId],
  );
  const reportSubjectEngineerName = useMemo(() => {
    if (managerWorkspaceEnabled && selectedManagedEngineer?.fullName?.trim()) {
      return selectedManagedEngineer.fullName.trim();
    }
    return user?.fullName?.trim() || user?.email || "Engineer";
  }, [managerWorkspaceEnabled, selectedManagedEngineer?.fullName, user?.email, user?.fullName]);
  const notifyManagerAssessmentReady = useCallback(
    async (engineerId: string, engineerName: string) => {
      const { data: relationships, error: relationshipError } = await (supabase as any)
        .from("reporting_relationships")
        .select("manager_id")
        .eq("engineer_id", engineerId)
        .eq("relation_type", "direct_manager")
        .in("status", ["active", "in_handover"])
        .limit(1);

      if (relationshipError) {
        console.error(
          "[assessment-notification] unable to load manager relationship:",
          relationshipError,
        );
        return;
      }

      const managerId = (relationships as Array<{ manager_id: string }> | null)?.[0]?.manager_id;
      if (!managerId) return;

      const { success } = await sendNotification({
        data: {
          userId: managerId,
          type: "assessment",
          title: "Q3 assessment ready for review",
          description: `${engineerName} has finalized their readiness report and submitted it to your workspace.`,
        },
      });

      if (!success) {
        console.error("[assessment-notification] failed to send manager notification");
      }
    },
    [],
  );

  useHomePinnedQuickAddDismiss({
    isPinnedQuickAddOpen,
    setIsPinnedQuickAddOpen,
    pinnedQuickAddPopoverRef,
    pinnedQuickAddTriggerRef,
  });

  const visiblePinnedResources = useMemo(
    () =>
      buildVisiblePinnedResources({
        activeWorkspaceId,
        pinnedResources,
        includeSamplePinnedResources: sampleContent.pinnedResources,
      }),
    [activeWorkspaceId, pinnedResources, sampleContent.pinnedResources],
  );
  const {
    pinnedObjectiveIdToPinId,
    pinnedEvidenceIdToPinId,
    pinnedKnowledgeIdToPinId,
    pinnedObjectiveIds,
    pinnedEvidenceIds,
    pinnedKnowledgeIds,
  } = useMemo(() => buildPinnedResourceLookups(pinnedResources), [pinnedResources]);

  function flash(msg: string) {
    toast.success(msg);
  }

  const {
    loadPinnedResources,
    handleUnpin,
    handlePinGenericResource,
    handleToggleObjectivePin,
    handleToggleEvidencePin,
    handleToggleKnowledgePin,
  } = useHomePinnedResourcesActions({
    activeWorkspaceId,
    notificationTargetUserId,
    userId,
    pinnedResources,
    setPinnedResources,
    newPinnedTitle,
    setNewPinnedTitle,
    newPinnedUrl,
    setNewPinnedUrl,
    isSubmittingPinnedResource,
    setIsSubmittingPinnedResource,
    setIsPinnedQuickAddOpen,
    pinnedObjectiveIdToPinId,
    pinnedEvidenceIdToPinId,
    pinnedKnowledgeIdToPinId,
    onFlash: flash,
  });
  const { approveInbox, dismissInbox } = useHomeInboxActions({
    userId,
    inbox,
    setDismissedSampleInboxIds,
    insertEvidenceMutation,
    approveInboxMutation,
    dismissInboxMutation,
    onFlash: flash,
  });

  useEffect(() => {
    void loadPinnedResources();
  }, [loadPinnedResources]);

  const handlePinnedResourceSelect = useCallback(
    (pin: PinnedResourceRow) => {
      const knowledgeId = parsePinnedKnowledgeId(pin.url);
      if (knowledgeId) {
        setFocusedKnowledgeId(null);
        window.requestAnimationFrame(() => {
          setFocusedKnowledgeId(knowledgeId);
        });
        if (tab !== "knowledge") {
          void navigate({ to: getTabPathForCurrentScope("knowledge") });
        }
        return;
      }

      if (pin.resource_type === "evidence" && pin.evidence_id) {
        const evidenceTarget = [...contextEvidence, ...contextArchivedEvidence].find(
          (item) => item.id === pin.evidence_id,
        );
        if (evidenceTarget) {
          setOpenEvidence(evidenceTarget);
          if (tab !== "evidence") void navigate({ to: getTabPathForCurrentScope("evidence") });
          return;
        }
      }

      if (pin.resource_type === "objective" && pin.objective_id) {
        const objectiveTarget = [...contextObjectives, ...contextArchivedObjectives].find(
          (item) => item.id === pin.objective_id,
        );
        if (objectiveTarget) {
          setOpenObjective(objectiveTarget);
          if (tab !== "objectives") void navigate({ to: getTabPathForCurrentScope("objectives") });
          return;
        }
      }

      if (isHttpUrl(pin.url)) {
        window.open(pin.url, "_blank", "noopener,noreferrer");
        return;
      }

      if (pin.resource_type === "evidence") {
        void navigate({ to: getTabPathForCurrentScope("evidence") });
        return;
      }

      if (pin.resource_type === "objective") {
        void navigate({ to: getTabPathForCurrentScope("objectives") });
        return;
      }

      void navigate({ to: getTabPathForCurrentScope("knowledge") });
    },
    [
      contextArchivedEvidence,
      contextArchivedObjectives,
      contextEvidence,
      contextObjectives,
      navigate,
      tab,
    ],
  );

  const showUnlinkedManagerFallback =
    managerWorkspaceEnabled && !isLoadingManagedEngineers && managedEngineersInScope.length === 0;
  const showWorkspaceConnectionFallback =
    showUnlinkedManagerFallback ||
    (isManagerDirectoryView &&
      !isManagerTeamOverviewLoading &&
      !isManagerTeamOverviewError &&
      managerTeamOverview.length === 0);
  const showManagerProfileSubNavigation =
    managerWorkspaceEnabled && activeView === "profile" && Boolean(selectedEngineerId);
  const getManagerEngineerLandingTab = useCallback(
    (engineerId: string): Tab => managerEngineerLastTabRef.current[engineerId] ?? "evidence",
    [],
  );

  async function handleSignOutForWorkspaceReset() {
    await signout();
    sessionStorage.removeItem(MANAGER_ONBOARDING_CONTEXT_KEY);
    window.location.assign("/");
  }

  const { handleTabChange, handleSettingsSectionChange, handleGlobalSearchSelect } =
    useHomeNavigationActions({
      navigate,
      settingsSection,
      setMobileSidebarOpen,
      setGlobalSearchQuery,
      getTabPathForCurrentScope,
    });
  const { requestAssessmentDelete, executeAssessmentDelete, clearAssessmentWizardDraft } =
    useHomeAssessmentActions({
      userId: assessmentWorkspaceUserId,
      sampleAssessments,
      setSampleAssessments,
      review,
      setReview,
      setWizardDraft,
      setPendingAssessmentDeleteId,
      deleteAssessmentMutation,
      onFlash: flash,
    });

  function archiveObjectiveById(id: string) {
    archiveObjectiveMutation.mutate(id, {
      onSuccess: () => flash("Objective archived"),
    });
  }

  if (workspaceContextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-5 w-36 rounded-md bg-slate-200 animate-pulse" />
      </div>
    );
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
        managedEngineers={managedEngineersInScope}
        selectedEngineerId={selectedEngineerId}
        managerDirectoryActive={managerWorkspaceEnabled && !selectedEngineerId}
        onOpenTeamOverview={() => {
          setWorkspaceSelectedEngineerId(null);
          setActiveView("directory");
          void navigate({ to: getTabPath("dashboard") });
        }}
        onSelectEngineer={(engineerId) => {
          const landingTab = getManagerEngineerLandingTab(engineerId);
          const isAlreadyFocused = selectedEngineerId === engineerId && activeView === "profile";
          if (isAlreadyFocused) {
            void navigate({
              to: getTabPath(landingTab, { mode: "manager", engineerId }),
            });
            return;
          }
          setWorkspaceSelectedEngineerId(engineerId);
          if (activeView !== "profile") {
            setActiveView("profile");
          }
          void navigate({
            to: getTabPath(landingTab, { mode: "manager", engineerId }),
          });
        }}
      />

      <div
        className={`${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"} flex flex-col min-h-screen min-w-0 transition-[margin] duration-200 print:ml-0`}
      >
        <TopHeader
          title={HOME_PAGE_TITLES[tab]}
          onCapture={() => {
            if (managerWorkspaceEnabled) {
              setShowCapture(true);
              return;
            }
            setShowCapture(true);
          }}
          captureLabel={managerWorkspaceEnabled ? "Log Knowledge" : "Capture Evidence"}
          onMenuClick={() => setMobileSidebarOpen(true)}
          globalSearchQuery={globalSearchQuery}
          onGlobalSearchQueryChange={setGlobalSearchQuery}
          globalSearchResults={globalSearchResults}
          onGlobalSearchSelect={handleGlobalSearchSelect}
        />
        <main className="flex-1 print-main">
          <div className="max-w-7xl mx-auto w-full px-4 py-4 sm:px-6 lg:px-8 md:py-6">
            {!showWorkspaceConnectionFallback &&
              !isManagerScopedToEngineer &&
              tab === "dashboard" &&
              !isManagerDirectoryView &&
              !(mode === "manager" && !selectedEngineerId) && (
                <div className="max-w-7xl mx-auto w-full mb-6">
                  <div className="h-12 px-4 bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                      <Pin size={12} className="rotate-45 text-slate-400" />
                      Pinned
                    </div>
                    {visiblePinnedResources.length === 0 ? (
                      <span className="flex-1 text-xs italic text-slate-400 font-medium">
                        No resources pinned to this workspace yet.
                      </span>
                    ) : (
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {visiblePinnedResources.map((pin) => (
                            <div
                              key={pin.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => handlePinnedResourceSelect(pin)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  handlePinnedResourceSelect(pin);
                                }
                              }}
                              className="shrink-0 inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 shadow-sm transition-all duration-150 ease-in-out"
                            >
                              {pin.resource_type === "evidence" ? (
                                <FileText size={13} className="text-blue-500" />
                              ) : pin.resource_type === "objective" ? (
                                <Target size={13} className="text-emerald-500" />
                              ) : (
                                <LinkIcon size={13} className="text-slate-400" />
                              )}
                              <span
                                className="max-w-[160px] truncate text-slate-800"
                                title={pin.title}
                              >
                                {pin.title}
                              </span>
                              {!pin.isSample && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void handleUnpin(pin.id);
                                  }}
                                  className="p-0.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="relative shrink-0">
                      <button
                        ref={pinnedQuickAddTriggerRef}
                        type="button"
                        onClick={() => setIsPinnedQuickAddOpen((prev) => !prev)}
                        className="h-7 w-7 rounded-md border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                        aria-label="Add workspace pin"
                      >
                        <Plus size={14} />
                      </button>
                      {isPinnedQuickAddOpen && (
                        <div
                          ref={pinnedQuickAddPopoverRef}
                          className="absolute right-0 top-9 w-64 bg-white border border-slate-200 rounded-xl p-3 shadow-xl z-50 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150"
                        >
                          <input
                            value={newPinnedTitle}
                            onChange={(event) => setNewPinnedTitle(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter") return;
                              event.preventDefault();
                              void handlePinGenericResource();
                            }}
                            placeholder="Label"
                            className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                          />
                          <input
                            value={newPinnedUrl}
                            onChange={(event) => setNewPinnedUrl(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter") return;
                              event.preventDefault();
                              void handlePinGenericResource();
                            }}
                            placeholder="URL"
                            className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                          />
                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsPinnedQuickAddOpen(false)}
                              className="h-7 px-2.5 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void handlePinGenericResource()}
                              disabled={isSubmittingPinnedResource}
                              className="h-7 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isSubmittingPinnedResource ? "Anchoring..." : "Anchor to Workspace"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            {!showWorkspaceConnectionFallback && showTeamTransitionCard && selectedEngineerId && (
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 mb-6 space-y-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 block">
                    Team Transition In Progress
                  </span>
                  <h4 className="text-sm font-medium text-slate-900">
                    Brief the incoming manager before access transfers
                  </h4>
                </div>
                <div className="bg-white border border-slate-100 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-400 mb-2">
                    AI-Compiled Technical Dossier (Past 6 Months)
                  </div>
                  <p className="text-sm text-slate-600">
                    Compiling achievements from Bitbucket and Jira logs to construct the cross-team
                    advocacy bridge...
                  </p>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2">
                    Manager Insights &amp; Leadership Style Notes (Optional)
                  </div>
                  <textarea
                    value={handoverNotes}
                    onChange={(event) => setHandoverNotes(event.target.value)}
                    placeholder="Add any personal notes on mentorship strengths, autonomy preferences, or career goals for the incoming manager..."
                    className="w-full min-h-[80px] p-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isSigningOffTransfer}
                    onClick={() => {
                      if (!selectedEngineerId) return;
                      setIsSigningOffTransfer(true);
                      void supabase.auth
                        .getSession()
                        .then(({ data: { session } }) => {
                          const token = session?.access_token;
                          if (!token) {
                            throw new Error("Session expired. Please sign in again.");
                          }
                          return signOffTransfer({
                            data: {
                              engineerId: selectedEngineerId,
                              workEthicsNotes: handoverNotes.trim(),
                              token,
                            },
                          });
                        })
                        .then(() => {
                          toast.success("Transfer signed off and dossier shared.");
                          setHandoverNotes("");
                          setManagerRelationshipsRefreshNonce((prev) => prev + 1);
                          setWorkspaceSelectedEngineerId(null);
                          setActiveView("directory");
                        })
                        .catch((error) => {
                          const message = getSafeErrorMessage(
                            error,
                            "Failed to sign off transfer.",
                          );
                          toast.error(message);
                        })
                        .finally(() => {
                          setIsSigningOffTransfer(false);
                        });
                    }}
                    className="inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSigningOffTransfer ? "Signing off..." : "Sign Off & Transfer Advocacy"}
                  </button>
                </div>
              </div>
            )}
            {showWorkspaceConnectionFallback ? (
              <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">
                  Awaiting Workspace Connection
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  You don&apos;t have any active engineer tracking lines assigned to your profile
                  yet. Please request a secure single-use invitation link from your engineer to sync
                  metrics.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void handleSignOutForWorkspaceReset();
                  }}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Sign Out / Switch Accounts
                </button>
              </div>
            ) : mode === "manager" && !selectedEngineerId ? (
              <ManagerDashboardView
                linkedEngineers={managedEngineersInScope}
                teamOverview={managerTeamOverview}
                isLoading={isManagerTeamOverviewLoading}
                isError={isManagerTeamOverviewError}
                onInspectEngineer={(engineerId) => {
                  const landingTab = getManagerEngineerLandingTab(engineerId);
                  const isAlreadyFocused =
                    selectedEngineerId === engineerId && activeView === "profile";
                  if (isAlreadyFocused) {
                    void navigate({
                      to: getTabPath(landingTab, { mode: "manager", engineerId }),
                    });
                    return;
                  }
                  setWorkspaceSelectedEngineerId(engineerId);
                  if (activeView !== "profile") {
                    setActiveView("profile");
                  }
                  void navigate({
                    to: getTabPath(landingTab, { mode: "manager", engineerId }),
                  });
                }}
              />
            ) : (
              <>
                {showManagerProfileSubNavigation && (
                  <div className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Reviewing Engineer
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedManagedEngineer?.fullName ?? "Selected engineer"}
                      </p>
                      <p className="text-xs text-slate-600">
                        {selectedManagedEngineer?.status === "in_handover"
                          ? "Transitioning handover"
                          : "Active reporting line"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: "tracking_workspace" as const, label: "Tracking Workspace" },
                        { id: "compilation_dossier" as const, label: "Compilation Dossier" },
                        { id: "one_on_one_sync" as const, label: "1-on-1 Sync Agenda" },
                      ].map((subTab) => (
                        <button
                          key={subTab.id}
                          type="button"
                          onClick={() => setManagerProfileSubTab(subTab.id)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            managerProfileSubTab === subTab.id
                              ? "border-slate-300 bg-slate-100 text-slate-900"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {subTab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {showManagerProfileSubNavigation &&
                managerProfileSubTab === "compilation_dossier" &&
                selectedEngineerId ? (
                  <BusinessCaseTab engineerId={selectedEngineerId} />
                ) : showManagerProfileSubNavigation &&
                  managerProfileSubTab === "one_on_one_sync" &&
                  selectedEngineerId ? (
                  <OneOnOneWorkspace engineerId={selectedEngineerId} />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      {!isManagerScopedToEngineer && tab === "dashboard" && (
                        <DashboardView
                          workspaceUserId={selectedEngineerId ?? userId}
                          inbox={contextInbox}
                          showSampleData={sampleContent.dashboard}
                          dismissedSampleInboxIds={dismissedSampleInboxIds}
                          onOpenInbox={isManagerWorkspace ? () => {} : setOpenInbox}
                          onOpenObjective={setOpenObjective}
                          onOpenEvidence={setOpenEvidence}
                        />
                      )}
                      {tab === "radar" && (
                        <RadarView
                          data={radarData}
                          assessments={contextAssessments}
                          evidence={contextEvidence}
                          objectives={contextObjectives}
                          wizardDraft={wizardDraft}
                          selectedEngineerId={selectedEngineerId}
                          onCreateObjective={() => setShowCreateObjective(true)}
                          onStartReview={() => setShowWizard(true)}
                          onResumeDraft={() => setShowWizard(true)}
                          onDiscardDraft={() => setShowDiscardDraftConfirm(true)}
                          onOpenHistory={() => setShowHistory(true)}
                        />
                      )}
                      {tab === "evidence" && (
                        <EvidenceView
                          rows={
                            isManagerWorkspace
                              ? contextEvidence
                              : [...contextEvidence, ...contextArchivedEvidence]
                          }
                          readOnly={!isManagerWorkspace ? false : true}
                          managerReviewEnabled={isManagerWorkspace}
                          onOpenRow={setOpenEvidence}
                          pinnedEvidenceIds={pinnedEvidenceIds}
                          onTogglePin={(item) => {
                            void handleToggleEvidencePin(item);
                          }}
                          onArchive={(id) => {
                            if (isManagerWorkspace) {
                              flash(
                                "Managers can review evidence but cannot archive engineer logs.",
                              );
                              return;
                            }
                            archiveEvidenceMutation.mutate(id, {
                              onSuccess: () => flash("Evidence archived"),
                            });
                          }}
                          onPermanentDelete={(id) => {
                            if (isManagerWorkspace) {
                              flash(
                                "Managers can review evidence but cannot permanently delete engineer logs.",
                              );
                              return;
                            }
                            const pinnedId = pinnedEvidenceIdToPinId.get(id);
                            deleteEvidenceMutation.mutate(id, {
                              onSuccess: () => {
                                if (pinnedId) void handleUnpin(pinnedId);
                                flash("Evidence permanently deleted");
                              },
                            });
                          }}
                          onRestore={(id) => {
                            if (isManagerWorkspace) {
                              flash(
                                "Managers can review evidence but cannot restore archived engineer logs.",
                              );
                              return;
                            }
                            restoreEvidenceMutation.mutate(id, {
                              onSuccess: () => flash("Evidence restored to log"),
                            });
                          }}
                        />
                      )}
                      {tab === "objectives" && (
                        <ObjectivesView
                          items={
                            isManagerWorkspace
                              ? contextObjectives
                              : [...contextObjectives, ...contextArchivedObjectives]
                          }
                          readOnly={isManagerWorkspace}
                          onOpen={setOpenObjective}
                          onCreate={() => {
                            if (isManagerWorkspace) {
                              flash(
                                "Managers review and approve objectives from the manager panel.",
                              );
                              return;
                            }
                            setShowCreateObjective(true);
                          }}
                          pinnedObjectiveIds={pinnedObjectiveIds}
                          onTogglePin={(objective) => {
                            void handleToggleObjectivePin(objective);
                          }}
                          formatObjectiveCode={formatObjectiveCode}
                          formatDisplayDate={formatDisplayDate}
                          onRestore={(o) => {
                            if (isManagerWorkspace) {
                              flash("Managers can only approve objectives into In Progress.");
                              return;
                            }
                            restoreObjectiveMutation.mutate(o.id, {
                              onSuccess: () => flash("Objective restored to Kanban board"),
                            });
                          }}
                          onDelete={(o) => {
                            if (isManagerWorkspace) {
                              flash("Managers can only approve objectives into In Progress.");
                              return;
                            }
                            const pinnedId = pinnedObjectiveIdToPinId.get(o.id);
                            deleteObjectiveMutation.mutate(o, {
                              onSuccess: () => {
                                if (pinnedId) void handleUnpin(pinnedId);
                                flash("Objective permanently deleted");
                              },
                            });
                          }}
                          onMove={(id, status) => {
                            const target = [
                              ...contextObjectives,
                              ...contextArchivedObjectives,
                            ].find((o) => o.id === id);
                            if (
                              !target ||
                              target.status === status ||
                              target.status === "Completed"
                            )
                              return;
                            if (
                              isManagerWorkspace &&
                              !(target.status === "Pending Approval" && status === "In Progress")
                            ) {
                              return;
                            }
                            const activeMoveMutation = isManagerWorkspace
                              ? moveSelectedEngineerObjectiveMutation
                              : moveObjectiveMutation;
                            activeMoveMutation.mutate(
                              { id, status, objective: target },
                              {
                                onSuccess: () => {
                                  if (status === "Completed")
                                    flash("Objective completed and added to evidence");
                                  else if (
                                    target.status === "Completed" &&
                                    status === "In Progress"
                                  )
                                    flash("Objective reverted and removed from evidence log");
                                  else flash(`Moved to ${status}`);
                                },
                              },
                            );
                          }}
                        />
                      )}
                      {!isManagerScopedToEngineer && tab === "knowledge" && (
                        <KnowledgeHubView
                          items={knowledgeItems}
                          pinnedKnowledgeIds={pinnedKnowledgeIds}
                          focusedItemId={focusedKnowledgeId}
                          onTogglePin={(item) => {
                            void handleToggleKnowledgePin(item);
                          }}
                          onEdit={setEditingKnowledge}
                          onDelete={(item) => setPendingKnowledgeDelete(item)}
                        />
                      )}
                      {tab === "report" && (
                        <ReportView
                          evidence={contextEvidence}
                          objectives={contextObjectives}
                          radarData={radarData}
                          onFlash={flash}
                          review={review}
                          assessments={contextAssessments}
                          historyAssessments={contextHistoryAssessments}
                          selectedEngineerId={selectedEngineerId}
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
                      {!isManagerScopedToEngineer && tab === "feedback" && <FeedbackView />}
                      {!isManagerScopedToEngineer && tab === "settings" && (
                        <SettingsView
                          sampleContent={sampleContent}
                          onSampleContentChange={setSampleContent}
                          section={settingsSection}
                          onSectionChange={handleSettingsSectionChange}
                        />
                      )}
                      {selectedEngineerId &&
                        selectedEngineerRole &&
                        (tab === "dashboard" || tab === "radar" || tab === "report") && (
                          <ManagerActionsPanel
                            engineerId={selectedEngineerId}
                            currentUserRole={selectedEngineerRole}
                          />
                        )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Capture modal */}
      <AnimatePresence>
        {showCapture && (
          <CaptureModal
            onClose={() => setShowCapture(false)}
            managerMode={managerWorkspaceEnabled}
            competencyDescriptions={COMPETENCY_DESC}
            onSaveEvidence={({ title, description, sourceLink, category, subcategory }) => {
              insertEvidenceMutation.mutate(
                {
                  id: "",
                  date: toLocalDateString(),
                  source: "Manual",
                  category,
                  competency: subcategory,
                  title: title.trim(),
                  description: description.trim(),
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

      {/* Knowledge edit modal */}
      <AnimatePresence>
        {editingKnowledge && (
          <KnowledgeEditorModal
            item={editingKnowledge}
            isSaving={updateKnowledgeMutation.isPending}
            onClose={() => setEditingKnowledge(null)}
            onSave={({ challenge, lesson, referenceLinks }) => {
              updateKnowledgeMutation.mutate(
                {
                  id: editingKnowledge.id,
                  title: challenge.trim(),
                  description: lesson.trim(),
                  reference_links: referenceLinks,
                },
                {
                  onSuccess: () => {
                    setEditingKnowledge(null);
                    flash("Knowledge log updated");
                  },
                },
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* Knowledge delete confirmation */}
      <AnimatePresence>
        {pendingKnowledgeDelete && (
          <ConfirmDialog
            title="Delete knowledge log?"
            description="This action cannot be undone. This knowledge entry will be permanently deleted."
            confirmLabel="Delete log"
            cancelLabel="Cancel"
            destructive
            onCancel={() => setPendingKnowledgeDelete(null)}
            onConfirm={() => {
              const target = pendingKnowledgeDelete;
              if (!target) return;
              const pinnedId = pinnedKnowledgeIdToPinId.get(target.id);
              deleteKnowledgeMutation.mutate(target.id, {
                onSuccess: () => {
                  if (pinnedId) void handleUnpin(pinnedId);
                  if (editingKnowledge?.id === target.id) setEditingKnowledge(null);
                  setPendingKnowledgeDelete(null);
                  flash("Knowledge log deleted");
                },
                onError: () => {
                  setPendingKnowledgeDelete(null);
                },
              });
            }}
          />
        )}
      </AnimatePresence>

      {/* Create SMART objective modal */}
      <AnimatePresence>
        {showCreateObjective && (
          <CreateObjectiveModal
            frameworkMatrix={activeFrameworkMatrix}
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
            frameworkMatrix={activeFrameworkMatrix}
            onClose={() => setOpenObjective(null)}
            onPin={(objective) => {
              void handleToggleObjectivePin(objective);
            }}
            onSave={(o) => {
              const activeSaveMutation = isManagerWorkspace
                ? saveSelectedEngineerObjectiveMutation
                : saveObjectiveMutation;
              activeSaveMutation.mutate(o, {
                onSuccess: () => {
                  setOpenObjective(o);
                  flash("Objective updated");
                },
              });
            }}
            onChangeStatus={(o, next) => {
              if (
                isManagerWorkspace &&
                !(o.status === "Pending Approval" && next === "In Progress")
              ) {
                return;
              }
              const updated = { ...o, status: next as Objective["status"] };
              const activeMoveMutation = isManagerWorkspace
                ? moveSelectedEngineerObjectiveMutation
                : moveObjectiveMutation;
              activeMoveMutation.mutate(
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
              if (isManagerWorkspace) {
                flash("Managers can only approve objectives into In Progress.");
                return;
              }
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
            frameworkMatrix={activeFrameworkMatrix}
            managerReviewOnly={isManagerWorkspace}
            onClose={() => setOpenEvidence(null)}
            onPin={(item) => {
              void handleToggleEvidencePin(item);
            }}
            onSave={(updated) => {
              const activeSaveMutation = isManagerWorkspace
                ? saveSelectedEngineerEvidenceMutation
                : saveEvidenceMutation;
              activeSaveMutation.mutate(updated, {
                onSuccess: () => {
                  setOpenEvidence(updated);
                  flash("Evidence updated");
                },
              });
            }}
            onArchive={(id) => {
              if (isManagerWorkspace) {
                flash("Managers can review evidence but cannot archive engineer logs.");
                return;
              }
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
            frameworkMatrix={activeFrameworkMatrix}
            onClose={() => setOpenInbox(null)}
            onConfirm={(comps) => {
              approveInbox(openInbox, comps);
              setOpenInbox(null);
            }}
            onDismiss={() => {
              dismissInbox(openInbox);
              setOpenInbox(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Performance Review wizard */}
      <AnimatePresence>
        {showWizard && (
          <ReviewWizard
            evidence={contextEvidence}
            onOpenEvidence={setOpenEvidence}
            onClose={() => setShowWizard(false)}
            latestAssessment={contextAssessments[0]}
            initialDraft={wizardDraft}
            engineerName={reportSubjectEngineerName}
            managerName={assessmentManagerName}
            onSaveDraft={(draft) => {
              setWizardDraft(draft);
              flash("Assessment draft saved");
            }}
            onFinalize={(session: ReviewSession) => {
              const assessmentOwnerUserId = assessmentWorkspaceUserId;
              if (!assessmentOwnerUserId) {
                toast.error("Unable to finalize assessment: no authenticated user session found.");
                return;
              }
              const newAssessment = sessionToAssessment(session);
              finalizeAssessmentMutation.mutate(
                { assessment: newAssessment, userId: assessmentOwnerUserId },
                {
                  onSuccess: () => {
                    if (!isManagerWorkspace) {
                      void notifyManagerAssessmentReady(
                        assessmentOwnerUserId,
                        newAssessment.engineerName?.trim() || reportSubjectEngineerName,
                      );
                    }
                    setReview(session);
                    clearAssessmentWizardDraft();
                    setShowWizard(false);
                    void navigate({ to: getTabPathForCurrentScope("report") });
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
            assessments={contextHistoryAssessments}
            currentId={review?.id ?? null}
            onDelete={(assessmentId) => {
              requestAssessmentDelete(assessmentId);
            }}
            onClose={() => setShowHistory(false)}
            onOpen={(a) => {
              setReview(assessmentToSession(a));
              setShowHistory(false);
              void navigate({ to: getTabPathForCurrentScope("report") });
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
/*                  TAB 1: DASHBOARD                            */
/* ============================================================ */

/* ============================================================ */
/*                  TAB 2: RADAR                                */
/* ============================================================ */

/* ============================================================ */
/*                  TAB 3: EVIDENCE LOG                         */
/* ============================================================ */
