// src/lib/api/objectives.ts
// TanStack Query hooks for objectives domain.
// All hooks accept userId: string (from useAuth().user!.id).

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "../supabase";
import { toLocalDateString } from "../datetime";
import { objectiveRowToObjective, objectiveToRow, type Objective } from "./mappers";

// ── Exported interfaces ────────────────────────────────────────────────────────

export interface MoveObjectiveVariables {
  id: string;
  status: Objective["status"];
  objective: Objective;
}

// ── Query key helpers ──────────────────────────────────────────────────────────

const objectivesKey = (userId: string, archived: boolean, includeSamples: boolean) =>
  ["objectives", userId, { archived, includeSamples }] as const;

const evidenceActiveKey = (userId: string) => ["evidence", userId, { archived: false }] as const;
const objectiveEvidenceMarker = (objectiveId: string) => `[auto-objective:${objectiveId}]`;

function patchObjectiveCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  update: (row: Objective) => Objective,
) {
  const caches = queryClient.getQueriesData<Objective[]>({
    queryKey: ["objectives", userId],
  });

  caches.forEach(([key, value]) => {
    if (!Array.isArray(value)) return;
    const meta = (Array.isArray(key) ? key[2] : undefined) as { archived?: boolean } | undefined;
    const archivedView = Boolean(meta?.archived);
    const next = value
      .map((row) => update(row))
      .filter((row) => (archivedView ? Boolean(row.isArchived) : !row.isArchived));
    queryClient.setQueryData(key, next);
  });
}

function objectiveLinksToLogText(links?: { label: string; url: string }[]): string {
  if (!links || links.length === 0) return "";
  return links
    .map((link) => {
      const label = link.label?.trim();
      const url = link.url?.trim();
      if (label && url) return `${label}: ${url}`;
      return url || label || "";
    })
    .filter(Boolean)
    .join(" | ");
}

function buildSampleObjectives(userId: string) {
  const today = new Date();
  const addDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return toLocalDateString(d);
  };
  const authored = toLocalDateString(today);

  return [
    {
      id: "00000000-0000-4000-8000-000000001001",
      user_id: userId,
      title: "Instrument checkout service with OpenTelemetry traces",
      competency: "System Design",
      due: addDays(21),
      status: "In Progress",
      statement:
        "Add end-to-end tracing for checkout API, workers, and downstream billing calls to reduce incident triage time.",
      date_authored: authored,
      links: [{ label: "OTel spec", url: "https://opentelemetry.io/docs/" }],
      success_criteria: {
        sampleSeed: true,
        targetSubcategory: "Designs systems with observability and operational maturity in mind",
        learn: [],
        demonstrate: [],
        share: [],
      },
      is_archived: false,
    },
    {
      id: "00000000-0000-4000-8000-000000001002",
      user_id: userId,
      title: "Define retry/idempotency policy for payment webhooks",
      competency: "Technical Design",
      due: addDays(35),
      status: "Pending Approval",
      statement:
        "Publish and align on a robust idempotency and retry policy to prevent duplicate payment side effects.",
      date_authored: authored,
      success_criteria: {
        sampleSeed: true,
        targetSubcategory: "Designs systems with appropriate trade-off analysis",
        learn: [],
        demonstrate: [],
        share: [],
      },
      is_archived: false,
    },
    {
      id: "00000000-0000-4000-8000-000000001003",
      user_id: userId,
      title: "Raise auth service test coverage to 85%",
      competency: "Code Quality",
      due: addDays(45),
      status: "In Progress",
      statement:
        "Increase confidence in auth service changes by expanding unit and integration test coverage and enforcing CI gates.",
      date_authored: authored,
      success_criteria: {
        sampleSeed: true,
        targetSubcategory: "Maintains adequate unit and integration test coverage",
        learn: [],
        demonstrate: [],
        share: [],
      },
      is_archived: false,
    },
    {
      id: "00000000-0000-4000-8000-000000001004",
      user_id: userId,
      title: "Run incident retrospective facilitation for P1 outages",
      competency: "Communication",
      due: addDays(14),
      status: "Pending Approval",
      statement:
        "Lead structured post-incident retrospectives and ensure action items are documented, assigned, and tracked.",
      date_authored: authored,
      success_criteria: {
        sampleSeed: true,
        targetSubcategory: "Communicates status and technical decisions clearly across teams",
        learn: [],
        demonstrate: [],
        share: [],
      },
      is_archived: false,
    },
    {
      id: "00000000-0000-4000-8000-000000001005",
      user_id: userId,
      title: "Deliver CI performance baseline dashboard",
      competency: "Delivery",
      due: addDays(-7),
      status: "Completed",
      statement:
        "Published weekly CI baseline dashboard covering runtime, flaky tests, and queue delays; shared with platform leads.",
      date_authored: addDays(-40),
      success_criteria: {
        sampleSeed: true,
        targetSubcategory: "Delivers work predictably with measurable operational outcomes",
        learn: [],
        demonstrate: [],
        share: [],
      },
      is_archived: false,
    },
    {
      id: "00000000-0000-4000-8000-000000001006",
      user_id: userId,
      title: "Complete secure coding refresher and threat model review",
      competency: "Security",
      due: addDays(-2),
      status: "Completed",
      statement:
        "Completed internal secure coding refresher and reviewed threat model updates for auth and session boundaries.",
      date_authored: addDays(-28),
      success_criteria: {
        sampleSeed: true,
        targetSubcategory: "Identifies and mitigates common application security risks",
        learn: [],
        demonstrate: [],
        share: [],
      },
      is_archived: false,
    },
    {
      id: "00000000-0000-4000-8000-000000001007",
      user_id: userId,
      title: "Publish SLOs and alert policy for payment APIs",
      competency: "Delivery",
      due: addDays(18),
      status: "In Progress",
      statement:
        "Define SLOs, error-budget policy, and actionable alert thresholds for checkout and settlement API endpoints.",
      date_authored: authored,
      success_criteria: {
        sampleSeed: true,
        targetSubcategory: "Turns reliability targets into measurable delivery outcomes",
        learn: [],
        demonstrate: [],
        share: [],
      },
      is_archived: false,
    },
    {
      id: "00000000-0000-4000-8000-000000001008",
      user_id: userId,
      title: "Draft migration plan for Redis session storage",
      competency: "System Design",
      due: addDays(32),
      status: "Pending Approval",
      statement:
        "Create migration plan covering cutover, rollback, and consistency safeguards for moving sessions to Redis.",
      date_authored: authored,
      success_criteria: {
        sampleSeed: true,
        targetSubcategory: "Designs migration plans with rollback and risk controls",
        learn: [],
        demonstrate: [],
        share: [],
      },
      is_archived: false,
    },
    {
      id: "00000000-0000-4000-8000-000000001009",
      user_id: userId,
      title: "Automate dependency vulnerability triage workflow",
      competency: "Security",
      due: addDays(27),
      status: "Pending Approval",
      statement:
        "Automate severity triage and ownership routing for dependency CVEs so remediation starts within 24 hours.",
      date_authored: authored,
      success_criteria: {
        sampleSeed: true,
        targetSubcategory: "Builds practical vulnerability response workflows",
        learn: [],
        demonstrate: [],
        share: [],
      },
      is_archived: false,
    },
    {
      id: "00000000-0000-4000-8000-000000001010",
      user_id: userId,
      title: "Complete postmortem template rollout across squads",
      competency: "Communication",
      due: addDays(-4),
      status: "Completed",
      statement:
        "Rolled out standard incident postmortem template and trained three squads on consistent write-up quality.",
      date_authored: addDays(-46),
      success_criteria: {
        sampleSeed: true,
        targetSubcategory: "Leads clear technical communication rituals across teams",
        learn: [],
        demonstrate: [],
        share: [],
      },
      is_archived: false,
    },
  ];
}

// ── useObjectivesQuery ─────────────────────────────────────────────────────────

/**
 * Fetches non-archived objectives for a user, ordered by due date ascending.
 * Key: ['objectives', userId]
 * staleTime: 60s
 */
interface UseObjectivesQueryOpts {
  archived?: boolean;
  includeSamples?: boolean;
}

export function useObjectivesQuery(userId: string, opts: UseObjectivesQueryOpts = {}) {
  const archived = opts.archived ?? false;
  const includeSamples = opts.includeSamples ?? true;
  return useQuery({
    queryKey: objectivesKey(userId, archived, includeSamples),
    queryFn: async () => {
      if (!archived && includeSamples) {
        const sampleRows = buildSampleObjectives(userId);
        const { error: seedError } = await supabase
          .from("objectives")
          .upsert(sampleRows, { onConflict: "id", ignoreDuplicates: true });
        if (seedError) {
          console.warn("[objectives] sample seeding skipped:", seedError.message);
        }
      }

      const { data, error } = await supabase
        .from("objectives")
        .select("*")
        .eq("user_id", userId)
        .eq("is_archived", archived)
        .order("due", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(objectiveRowToObjective);
    },
    staleTime: 60_000,
    enabled: Boolean(userId),
  });
}

// ── useCreateObjective ─────────────────────────────────────────────────────────

/**
 * Inserts a new objective with status: 'Pending Approval'.
 * Invalidates ['objectives', userId] on success.
 */
export function useCreateObjective(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (objective: Objective) => {
      const row = objectiveToRow({ ...objective, status: "Pending Approval" }, userId);
      // If no id provided, omit it so the DB generates a UUID
      const { id, ...rowWithoutId } = row;
      const insertPayload = id ? row : rowWithoutId;
      const { data, error } = await supabase
        .from("objectives")
        .insert(insertPayload)
        .select("*")
        .single();
      if (error) throw error;
      return objectiveRowToObjective(data);
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },

    onSuccess: (createdObjective) => {
      const caches = queryClient.getQueriesData<Objective[]>({
        queryKey: ["objectives", userId],
      });
      caches.forEach(([key, value]) => {
        if (!Array.isArray(value)) return;
        const meta = (Array.isArray(key) ? key[2] : undefined) as { archived?: boolean } | undefined;
        if (meta?.archived) return;
        if (value.some((row) => row.id === createdObjective.id)) return;
        queryClient.setQueryData(key, [...value, createdObjective]);
      });
      void queryClient.invalidateQueries({
        queryKey: ["objectives", userId],
      });
    },
  });
}

// ── useMoveObjective ───────────────────────────────────────────────────────────

/**
 * Updates the status of an objective.
 * When status === 'Completed', also INSERTs a new evidence row with:
 *   category: 'Objective', competency: objective.competency,
 *   status: 'Pending Review', match_state: 'Unset'
 *
 * Invalidates ['objectives', userId] on success.
 * If Completed, also invalidates ['evidence', userId, { archived: false }].
 */
export function useMoveObjective(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, objective }: MoveObjectiveVariables) => {
      const previousStatus = objective.status;

      const { error: updateError } = await supabase
        .from("objectives")
        .update({ status })
        .eq("id", id)
        .eq("user_id", userId);
      if (updateError) throw updateError;

      if (status === "Completed" && previousStatus !== "Completed") {
        const targetSubcategory =
          objective.targetSubcategory?.trim() || objective.specific?.trim() || objective.competency;
        const sourceLinks = objectiveLinksToLogText(objective.links);
        const { error: evidenceError } = await supabase.from("evidence").insert({
          user_id: userId,
          title: objective.title,
          description: objective.statement ?? "",
          category: objective.competency,
          competency: targetSubcategory,
          source: "Objective",
          link: sourceLinks,
          status: "Reviewed",
          match_state: "Yes",
          manager_notes: objectiveEvidenceMarker(id),
          date: toLocalDateString(),
          is_archived: false,
        });
        if (evidenceError) {
          await supabase
            .from("objectives")
            .update({ status: previousStatus })
            .eq("id", id)
            .eq("user_id", userId);
          throw evidenceError;
        }
      }

      if (previousStatus === "Completed" && status === "In Progress") {
        const { error: cleanupError } = await supabase
          .from("evidence")
          .delete()
          .eq("user_id", userId)
          .eq("source", "Objective")
          .eq("manager_notes", objectiveEvidenceMarker(id));
        if (cleanupError) throw cleanupError;
      }
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },

    onSuccess: (_data, { status, objective }) => {
      void queryClient.invalidateQueries({
        queryKey: ["objectives", userId],
      });
      if (status === "Completed" || objective.status === "Completed") {
        void queryClient.invalidateQueries({
          queryKey: evidenceActiveKey(userId),
        });
      }
    },
  });
}

// ── useSaveObjective ───────────────────────────────────────────────────────────

/**
 * Updates an existing objective with all fields.
 * Invalidates ['objectives', userId] on success.
 */
export function useSaveObjective(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (objective: Objective) => {
      const row = objectiveToRow(objective, userId);
      const { data, error } = await supabase
        .from("objectives")
        .update(row)
        .eq("id", objective.id)
        .eq("user_id", userId)
        .eq("status", "Pending Approval")
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Only objectives in To Do (Pending Approval) can be edited.");
      }
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["objectives", userId],
      });
    },
  });
}

// ── useArchiveObjective ────────────────────────────────────────────────────────

/**
 * Archives an objective: sets is_archived = true, archived_date = today.
 * Invalidates ['objectives', userId] on success.
 */
export function useArchiveObjective(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async (id: string) => {
      patchObjectiveCaches(queryClient, userId, (row) =>
        row.id === id
          ? {
              ...row,
              isArchived: true,
              archivedDate: toLocalDateString(),
            }
          : row,
      );
    },
    mutationFn: async (id: string) => {
      const today = toLocalDateString();
      const { error } = await supabase
        .from("objectives")
        .update({ is_archived: true, archived_date: today })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["objectives", userId],
      });
    },
  });
}

// ── useRestoreObjective ────────────────────────────────────────────────────────

/**
 * Restores an archived objective: sets is_archived = false, archived_date = null.
 * Invalidates ['objectives', userId] on success.
 */
export function useRestoreObjective(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async (id: string) => {
      patchObjectiveCaches(queryClient, userId, (row) =>
        row.id === id ? { ...row, isArchived: false, archivedDate: undefined } : row,
      );
    },
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("objectives")
        .update({ is_archived: false, archived_date: null })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["objectives", userId],
      });
    },
  });
}

// ── useDeleteObjective ─────────────────────────────────────────────────────────

/**
 * Permanently deletes an objective.
 * Invalidates ['objectives', userId] on success.
 */
export function useDeleteObjective(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (objectiveOrId: Objective | string) => {
      const id = typeof objectiveOrId === "string" ? objectiveOrId : objectiveOrId.id;
      const { error } = await supabase
        .from("objectives")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;

      const { error: cleanupError } = await supabase
        .from("evidence")
        .delete()
        .eq("user_id", userId)
        .eq("source", "Objective")
        .eq("manager_notes", objectiveEvidenceMarker(id));
      if (cleanupError) throw cleanupError;
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["objectives", userId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["evidence", userId],
      });
    },
  });
}
