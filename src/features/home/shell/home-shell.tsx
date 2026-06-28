import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/features/home/context/WorkspaceContext";
import { C, BrandMark, Input, PrimaryBtn } from "@/features/home/shared/ui-kit";
import { getDisplayName } from "@/features/home/shared/text-utils";
import {
  LayoutDashboard,
  TableProperties,
  Target,
  BookOpen,
  TrendingUp,
  FileText,
  Settings as SettingsIcon,
  MessageSquare,
  Bell,
  Sparkles,
  UserCheck,
  Plus,
  Search,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
  Terminal,
  ClipboardCheck,
} from "lucide-react";
import { MessageCircleHeart } from "lucide-react";

export type HomeTab =
  | "dashboard"
  | "radar"
  | "evidence"
  | "objectives"
  | "knowledge"
  | "feedback"
  | "report"
  | "settings";

export type HomeGlobalSearchResultItem = {
  id: string;
  title: string;
  description: string;
  section: "objectives" | "evidence" | "knowledge";
};

type WorkspaceMode = "engineer" | "manager";
const RECENT_ENGINEERS_STORAGE_KEY = "evitrace.manager.recentEngineerIds";

export function Sidebar({
  tab,
  setTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  managedEngineers = [],
  selectedEngineerId = null,
  onSelectEngineer,
  onOpenTeamOverview,
  managerDirectoryActive = false,
}: {
  tab: HomeTab;
  setTab: (t: HomeTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  managedEngineers?: Array<{
    id: string;
    fullName: string;
    email: string;
    status: "active" | "in_handover";
  }>;
  selectedEngineerId?: string | null;
  onSelectEngineer?: (id: string) => void;
  onOpenTeamOverview?: () => void;
  managerDirectoryActive?: boolean;
}) {
  const { user, signout } = useAuth();
  const { mode, setMode, isManagerAccount, loading } = useWorkspace();
  const hasFullName = Boolean(user?.fullName?.trim());
  const displayName = getDisplayName(user?.fullName, user?.email);
  const displayEmail = user?.email ?? "";
  const initials =
    displayName
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";
  const displayRole = user
    ? `${user.currentLevel || "Engineer"}${user.team ? ` · ${user.team}` : ""}`
    : "Senior Engineer L3";
  function handleSignout() {
    void signout();
    onCloseMobile();
    toast.success("Signed out");
  }
  const mainNav: {
    id: HomeTab;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    visibleIn: WorkspaceMode | "all";
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      visibleIn: "all",
    },
    {
      id: "evidence",
      label: "Evidence Log",
      icon: TableProperties,
      visibleIn: "all",
    },
    {
      id: "objectives",
      label: "Objectives",
      icon: Target,
      visibleIn: "all",
    },
    {
      id: "knowledge",
      label: "Knowledge Hub",
      icon: BookOpen,
      visibleIn: "engineer",
    },
    {
      id: "feedback",
      label: "360 Feedback",
      icon: MessageCircleHeart,
      visibleIn: "engineer",
    },
    {
      id: "radar",
      label: "Promotion Readiness",
      icon: TrendingUp,
      visibleIn: "all",
    },
    {
      id: "report",
      label: "Reviews & Reports",
      icon: FileText,
      visibleIn: "all",
    },
  ];
  const settingsItem = {
    id: "settings" as HomeTab,
    label: "Settings",
    sub: "App & Profile",
    icon: SettingsIcon,
  };
  const [engineerQuery, setEngineerQuery] = useState("");
  const [recentEngineerIds, setRecentEngineerIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.sessionStorage.getItem(RECENT_ENGINEERS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((value): value is string => typeof value === "string");
    } catch {
      return [];
    }
  });
  const normalizedEngineerQuery = engineerQuery.trim().toLowerCase();
  const filteredEngineers = useMemo(() => {
    if (!normalizedEngineerQuery) return managedEngineers;
    return managedEngineers.filter((engineer) => {
      const fullName = engineer.fullName.toLowerCase();
      const email = engineer.email.toLowerCase();
      return fullName.includes(normalizedEngineerQuery) || email.includes(normalizedEngineerQuery);
    });
  }, [managedEngineers, normalizedEngineerQuery]);
  function rememberRecentEngineer(engineerId: string) {
    setRecentEngineerIds((prev) => {
      const next = [engineerId, ...prev.filter((id) => id !== engineerId)].slice(0, 5);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(RECENT_ENGINEERS_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }
  const NavButton = ({ n }: { n: (typeof mainNav)[number] }) => {
    const active = tab === n.id;
    const Icon = n.icon;
    return (
      <button
        key={n.id}
        onClick={() => setTab(n.id)}
        title={collapsed ? n.label : undefined}
        className={`w-full flex items-center ${
          collapsed ? "justify-center px-2" : "gap-2.5 px-2.5"
        } h-10 rounded-lg text-left transition-colors border`}
        style={{
          background: active ? "#EEF2FF" : "transparent",
          color: active ? C.navy : C.slate,
          borderColor: active ? "#C7D2FE" : "transparent",
        }}
        onMouseEnter={(e) => !active && (e.currentTarget.style.background = "#F8FAFC")}
        onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}
      >
        <Icon size={18} />
        {!collapsed && <div className="text-sm font-semibold truncate">{n.label}</div>}
      </button>
    );
  };

  const DesktopAside = (
    <aside
      className={`hidden lg:flex fixed inset-y-0 left-0 z-40 ${collapsed ? "w-16" : "w-64"} h-screen border-r flex-col print-hide print:hidden transition-[width] duration-200`}
      style={{ background: C.card, borderColor: C.border }}
    >
      <div
        className={`h-16 ${collapsed ? "px-1.5" : "px-5"} flex items-center gap-2 border-b`}
        style={{ borderColor: C.border }}
      >
        <div
          className={`flex items-center min-w-0 ${collapsed ? "justify-center flex-1" : "gap-2"}`}
        >
          <BrandMark size={32} />
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight" style={{ color: C.navy }}>
                Evitrace
              </div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: C.subtle }}>
                Workspace
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
        {loading && !collapsed && (
          <div className="h-10 w-full rounded-md bg-slate-100 animate-pulse" />
        )}
        {mode === "manager" && managedEngineers.length > 0 && !collapsed && (
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Team ({managedEngineers.length})
              </label>
              {selectedEngineerId && (
                <button
                  type="button"
                  onClick={onOpenTeamOverview}
                  className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  View Dashboard
                </button>
              )}
            </div>
            <div className="relative mx-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                value={engineerQuery}
                onChange={(event) => setEngineerQuery(event.target.value)}
                placeholder="Search engineers..."
                className="w-full text-xs bg-white border border-slate-200 pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-indigo-300 transition-all text-slate-800"
              />
            </div>
            <div className="mx-1 rounded-lg border border-slate-200 bg-white p-2">
              {filteredEngineers.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic p-1 text-center">
                  No matching profiles found.
                </p>
              ) : (
                <select
                  value={selectedEngineerId ?? "__team_overview__"}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    if (nextValue === "__team_overview__") {
                      onOpenTeamOverview?.();
                      onCloseMobile();
                      return;
                    }
                    rememberRecentEngineer(nextValue);
                    onSelectEngineer?.(nextValue);
                    onCloseMobile();
                  }}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-300 focus:bg-white"
                >
                  <option value="__team_overview__">Team Overview</option>
                  {filteredEngineers.map((engineer) => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.fullName}
                    </option>
                  ))}
                </select>
              )}
              {selectedEngineerId && !managerDirectoryActive && (
                <p className="mt-1.5 text-[10px] text-slate-500 px-0.5">
                  Viewing selected engineer workspace.
                </p>
              )}
            </div>
          </div>
        )}
        {!collapsed && (
          <div className="pt-1">
            <div className="px-2 pb-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Navigation
            </div>
          </div>
        )}
        {mainNav
          .filter((n) => n.visibleIn === "all" || n.visibleIn === mode)
          .filter((n) => {
            if (mode !== "manager") return true;
            if (selectedEngineerId) {
              return n.id === "evidence" || n.id === "objectives" || n.id === "radar";
            }
            return n.id === "dashboard";
          })
          .map((n) => (
            <NavButton key={n.id} n={n} />
          ))}
      </nav>

      <div className="px-3 pb-2">
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-2.5 px-3"} py-2 rounded border hover:bg-[#F4F5F7] transition-colors`}
          style={{ color: C.slate, borderColor: C.border }}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && <span className="text-xs font-semibold">Collapse sidebar</span>}
        </button>
      </div>

      <div className="p-3 border-t space-y-2" style={{ borderColor: C.border }}>
        {mode !== "manager" && <NavButton n={settingsItem} />}
        {isManagerAccount && (
          <button
            onClick={() => setMode(mode === "manager" ? "engineer" : "manager")}
            title={collapsed ? "Switch workspace profile" : undefined}
            className={`w-full flex items-center ${
              collapsed ? "justify-center px-2" : "justify-between px-3"
            } h-10 rounded-lg border transition-all ${
              mode === "manager"
                ? "border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {collapsed ? (
              mode === "manager" ? (
                <ClipboardCheck size={16} />
              ) : (
                <Terminal size={16} />
              )
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  {mode === "manager" ? <ClipboardCheck size={14} /> : <Terminal size={14} />}
                  Switch Workspace
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                    mode === "manager"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {mode.toUpperCase()}
                </span>
              </>
            )}
          </button>
        )}
        {!collapsed && (
          <div className="px-2.5 py-2 rounded-lg border bg-white" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                style={{ background: "#5243AA" }}
              >
                {initials}
              </div>
              <div className="leading-tight flex-1 min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: C.navy }}>
                  {displayName}
                </div>
                {hasFullName && (
                  <div className="text-[11px] truncate" style={{ color: C.subtle }}>
                    {displayEmail}
                  </div>
                )}
              </div>
            </div>
            <div
              className="mt-2 pt-2 border-t flex items-center justify-between"
              style={{ borderColor: C.border }}
            >
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                {displayRole}
              </span>
              <button
                onClick={handleSignout}
                title="Sign out"
                className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-semibold hover:bg-[#F4F5F7]"
                style={{ color: C.slate }}
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          </div>
        )}
        {collapsed && (
          <button
            onClick={handleSignout}
            title="Sign out"
            className="w-full flex items-center justify-center py-2 rounded text-xs hover:bg-[#F4F5F7]"
            style={{ color: C.slate }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {DesktopAside}
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
              <div
                className="h-16 px-5 flex items-center justify-between border-b"
                style={{ borderColor: C.border }}
              >
                <div className="flex items-center gap-2">
                  <BrandMark size={32} />
                  <div className="text-[15px] font-bold tracking-tight" style={{ color: C.navy }}>
                    Evitrace
                  </div>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded hover:bg-[#F4F5F7]"
                  style={{ color: C.slate }}
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {mode === "manager" && managedEngineers.length > 0 && (
                  <div
                    className="mb-3 rounded-lg border p-2.5"
                    style={{ borderColor: C.border, background: "#FAFBFC" }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: C.subtle }}
                      >
                        Team ({managedEngineers.length})
                      </div>
                      {selectedEngineerId && (
                        <button
                          type="button"
                          onClick={onOpenTeamOverview}
                          className="text-[10px] font-bold text-indigo-600 hover:underline"
                        >
                          View Dashboard
                        </button>
                      )}
                    </div>
                    <div className="relative mb-2">
                      <Search
                        size={12}
                        className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        value={engineerQuery}
                        onChange={(event) => setEngineerQuery(event.target.value)}
                        placeholder="Search engineers..."
                        className="h-8 w-full rounded border border-slate-200 bg-white pl-7 pr-2 text-xs text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                      />
                    </div>
                    {filteredEngineers.length === 0 ? (
                      <div className="rounded border border-dashed border-slate-200 px-2 py-2 text-[11px] text-slate-500">
                        No matching profiles found.
                      </div>
                    ) : (
                      <>
                        <select
                          value={selectedEngineerId ?? "__team_overview__"}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            if (nextValue === "__team_overview__") {
                              onOpenTeamOverview?.();
                              onCloseMobile();
                              return;
                            }
                            rememberRecentEngineer(nextValue);
                            onSelectEngineer?.(nextValue);
                            onCloseMobile();
                          }}
                          className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                        >
                          <option value="__team_overview__">Team Overview</option>
                          {filteredEngineers.map((engineer) => (
                            <option key={engineer.id} value={engineer.id}>
                              {engineer.fullName}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                )}
                {mainNav
                  .filter((n) => n.visibleIn === "all" || n.visibleIn === mode)
                  .filter((n) => {
                    if (mode !== "manager") return true;
                    if (selectedEngineerId) {
                      return n.id === "evidence" || n.id === "objectives" || n.id === "radar";
                    }
                    return n.id === "dashboard";
                  })
                  .map((n) => (
                    <NavButton key={n.id} n={n} />
                  ))}
              </nav>
              <div className="p-3 border-t space-y-2" style={{ borderColor: C.border }}>
                {isManagerAccount && (
                  <button
                    onClick={() => setMode(mode === "manager" ? "engineer" : "manager")}
                    className={`w-full flex items-center justify-between p-2.5 border rounded-xl text-left transition-all cursor-pointer ${
                      mode === "manager"
                        ? "border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700"
                        : "border-slate-200/60 bg-slate-50 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                      {mode === "manager" ? <ClipboardCheck size={14} /> : <Terminal size={14} />}
                      Switch Workspace
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                        mode === "manager"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {mode.toUpperCase()}
                    </span>
                  </button>
                )}
                {mode !== "manager" && <NavButton n={settingsItem} />}
                <button
                  onClick={handleSignout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-left text-sm font-semibold hover:bg-[#F4F5F7]"
                  style={{ color: C.slate }}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

type HeaderNotification = {
  id: string;
  type: "feedback" | "auto_capture" | "objective" | "assessment";
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
};

export function TopHeader({
  title,
  onCapture,
  captureLabel = "Capture Evidence",
  onMenuClick,
  globalSearchQuery,
  onGlobalSearchQueryChange,
  globalSearchResults,
  onGlobalSearchSelect,
}: {
  title: string;
  onCapture: () => void;
  captureLabel?: string;
  onMenuClick: () => void;
  globalSearchQuery: string;
  onGlobalSearchQueryChange: (next: string) => void;
  globalSearchResults: {
    objectives: HomeGlobalSearchResultItem[];
    evidence: HomeGlobalSearchResultItem[];
    knowledge: HomeGlobalSearchResultItem[];
  };
  onGlobalSearchSelect: (item: HomeGlobalSearchResultItem) => void;
}) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: ["header-notifications", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<HeaderNotification[]> => {
      const { data, error } = await (supabase.from("notifications") as any)
        .select("id, type, title, description, is_read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as HeaderNotification[];
    },
  });
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("No active session found.");
      const { error } = await (supabase.from("notifications") as any)
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData<HeaderNotification[]>(
        ["header-notifications", userId],
        (rows = []) => rows.map((row) => ({ ...row, is_read: true })),
      );
      void queryClient.invalidateQueries({ queryKey: ["header-notifications", userId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update notifications right now.");
    },
  });
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.is_read).length;
  const hasSearchQuery = globalSearchQuery.length > 0;
  const hasGlobalResults =
    globalSearchResults.objectives.length > 0 ||
    globalSearchResults.evidence.length > 0 ||
    globalSearchResults.knowledge.length > 0;
  const groupedSearchResults: Array<{
    key: "objectives" | "evidence" | "knowledge";
    label: string;
    items: HomeGlobalSearchResultItem[];
  }> = [
    { key: "objectives", label: "Objectives", items: globalSearchResults.objectives },
    { key: "evidence", label: "Evidence", items: globalSearchResults.evidence },
    { key: "knowledge", label: "Knowledge", items: globalSearchResults.knowledge },
  ];
  function formatNotificationTime(createdAt: string): string {
    const parsed = new Date(createdAt);
    const ts = parsed.getTime();
    if (Number.isNaN(ts)) return "";
    const elapsedMs = Date.now() - ts;
    const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / (1000 * 60)));
    if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return `${elapsedHours}h ago`;
    const elapsedDays = Math.floor(elapsedHours / 24);
    if (elapsedDays === 1) return "Yesterday";
    return `${elapsedDays}d ago`;
  }
  function getNotificationVisual(type: "feedback" | "auto_capture" | "objective" | "assessment") {
    if (type === "feedback")
      return { Icon: MessageSquare, iconClassName: "bg-blue-50 text-blue-600" };
    if (type === "auto_capture")
      return { Icon: Sparkles, iconClassName: "bg-blue-50 text-indigo-600" };
    if (type === "objective")
      return { Icon: UserCheck, iconClassName: "bg-blue-50 text-emerald-600" };
    return { Icon: FileText, iconClassName: "bg-blue-50 text-slate-600" };
  }
  function toggle() {
    setOpen((o) => !o);
  }
  return (
    <header
      className="h-16 sticky top-0 z-30 border-b print-hide print:hidden"
      style={{ background: C.card, borderColor: C.border }}
    >
      <div className="max-w-7xl mx-auto w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded hover:bg-[#F4F5F7] shrink-0"
            style={{ color: C.slate }}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1
            className="text-base md:text-xl font-bold tracking-tight truncate"
            style={{ color: C.navy }}
          >
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="hidden md:block w-72 relative">
            <Input
              value={globalSearchQuery}
              onChange={(e) => onGlobalSearchQueryChange(e.target.value)}
              placeholder="Search evidence, objectives, knowledge…"
              icon={<Search size={14} />}
            />
            {hasSearchQuery && (
              <div
                className="absolute left-0 right-0 top-full mt-2 z-40 rounded-lg border bg-white shadow-xl max-h-[420px] overflow-y-auto"
                style={{ borderColor: C.border }}
              >
                {groupedSearchResults.map((group) =>
                  group.items.length > 0 ? (
                    <div
                      key={group.key}
                      className="px-3 py-2 border-b last:border-b-0"
                      style={{ borderColor: C.border }}
                    >
                      <div
                        className="text-[11px] font-semibold uppercase tracking-wide mb-2"
                        style={{ color: C.subtle }}
                      >
                        {group.label}
                      </div>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => onGlobalSearchSelect(item)}
                            className="w-full rounded-md border px-2.5 py-2 text-left hover:bg-[#F8FAFF] transition-colors"
                            style={{ borderColor: C.border }}
                          >
                            <div
                              className="text-sm font-semibold truncate"
                              style={{ color: C.navy }}
                            >
                              {item.title}
                            </div>
                            <div
                              className="text-xs mt-0.5 line-clamp-2 break-words"
                              style={{ color: C.slate }}
                            >
                              {item.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null,
                )}
                {!hasGlobalResults && (
                  <div className="px-4 py-6 text-center text-xs" style={{ color: C.subtle }}>
                    No matches found in objectives, evidence, or knowledge.
                  </div>
                )}
              </div>
            )}
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
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center bg-red-500">
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
                    <div
                      className="px-4 py-3 border-b flex items-center justify-between"
                      style={{ borderColor: C.border }}
                    >
                      <div className="text-sm font-bold" style={{ color: C.navy }}>
                        Notifications
                      </div>
                      <button
                        onClick={() => {
                          void markAllReadMutation.mutateAsync();
                        }}
                        disabled={markAllReadMutation.isPending || unread === 0}
                        className="text-[11px] font-semibold hover:underline"
                        style={{ color: C.primary }}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 && (
                        <div className="px-4 py-8 text-center text-xs" style={{ color: C.subtle }}>
                          Your workspace alerts are completely up to date.
                        </div>
                      )}
                      {notifications.map((n) => {
                        const { Icon, iconClassName } = getNotificationVisual(n.type);
                        return (
                          <div
                            key={n.id}
                            className="px-4 py-3 border-b flex gap-3 hover:bg-[#FAFBFC]"
                            style={{ borderColor: C.border }}
                          >
                            <div
                              className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${iconClassName}`}
                            >
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className="text-xs font-semibold truncate"
                                style={{ color: C.navy }}
                              >
                                {n.title}
                              </div>
                              <div
                                className="text-[11px] mt-0.5 leading-snug"
                                style={{ color: C.slate }}
                              >
                                {n.description}
                              </div>
                              <div className="text-[10px] mt-1" style={{ color: C.subtle }}>
                                {formatNotificationTime(n.created_at)}
                              </div>
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
            <span className="hidden sm:inline">{captureLabel}</span>
            <span className="sm:hidden">
              {captureLabel.toLowerCase().includes("knowledge") ? "Log" : "Capture"}
            </span>
          </PrimaryBtn>
        </div>
      </div>
    </header>
  );
}
