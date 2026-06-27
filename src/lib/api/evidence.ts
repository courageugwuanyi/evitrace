// src/lib/api/evidence.ts
// TanStack Query hooks for evidence domain.
// All hooks accept userId: string (from useAuth().user!.id).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../supabase'
import { toLocalDateString } from '../datetime'
import {
  evidenceRowToRecord,
  evidenceRecordToRow,
  type EvidenceRecord,
} from './mappers'

// ── Query key helpers ──────────────────────────────────────────────────────────

const evidenceKey = (userId: string, archived: boolean, includeSamples: boolean) =>
  ['evidence', userId, { archived, includeSamples }] as const

function buildSampleEvidence(userId: string) {
  const today = new Date()
  const addDays = (days: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() + days)
    return toLocalDateString(d)
  }

  return [
    {
      id: '00000000-0000-4000-8000-000000002001',
      user_id: userId,
      date: addDays(-2),
      source: 'Manual',
      category: 'Code Quality',
      competency: 'Maintains adequate unit and integration test coverage',
      title: 'Captured test strategy notes from auth service hardening',
      description:
        'Captured summary of test-matrix decisions and flaky-test fixes after auth refactor.',
      link: 'https://example.com/docs/auth-test-strategy',
      status: 'Pending Review',
      match_state: 'Yes',
      manager_notes: '[sample-content]',
      is_archived: false,
    },
    {
      id: '00000000-0000-4000-8000-000000002002',
      user_id: userId,
      date: addDays(-6),
      source: 'Manual',
      category: 'System Design',
      competency: 'Designs systems with observability and operational maturity in mind',
      title: 'Captured architecture notes from trace instrumentation session',
      description:
        'Logged design decisions for OpenTelemetry spans, trace propagation, and dashboard ownership.',
      link: 'https://example.com/rfc/otel-tracing-plan',
      status: 'Pending Review',
      match_state: 'Somewhat',
      manager_notes: '[sample-content]',
      is_archived: false,
    },
    {
      id: '00000000-0000-4000-8000-000000002003',
      user_id: userId,
      date: addDays(-11),
      source: 'Manual',
      category: 'Delivery',
      competency: 'Turns reliability targets into measurable delivery outcomes',
      title: 'Captured rollout checklist for checkout canary release',
      description:
        'Recorded canary checklist, rollback gates, and release readiness criteria from release review.',
      link: 'https://example.com/runbooks/checkout-canary',
      status: 'Reviewed',
      match_state: 'Yes',
      manager_notes: '[sample-content]',
      is_archived: false,
    },
    {
      id: '00000000-0000-4000-8000-000000002004',
      user_id: userId,
      date: addDays(-15),
      source: 'Manual',
      category: 'Communication',
      competency: 'Communicates status and technical decisions clearly across teams',
      title: 'Captured weekly engineering updates summary',
      description:
        'Saved the structured async update highlighting risks, milestones, and dependencies across squads.',
      link: '',
      status: 'Reviewed',
      match_state: 'Yes',
      manager_notes: '[sample-content]',
      is_archived: false,
    },
    {
      id: '00000000-0000-4000-8000-000000002005',
      user_id: userId,
      date: addDays(-4),
      source: 'Objective',
      category: 'Security',
      competency: 'Builds practical vulnerability response workflows',
      title: 'Automate dependency vulnerability triage workflow',
      description:
        'Automate severity triage and ownership routing for dependency CVEs so remediation starts within 24 hours.',
      link: 'https://example.com/security/vuln-triage',
      status: 'Reviewed',
      match_state: 'Yes',
      manager_notes: '[sample-content] [auto-objective:00000000-0000-4000-8000-000000001009]',
      is_archived: false,
    },
    {
      id: '00000000-0000-4000-8000-000000002006',
      user_id: userId,
      date: addDays(-8),
      source: 'Objective',
      category: 'Delivery',
      competency: 'Delivers work predictably with measurable operational outcomes',
      title: 'Deliver CI performance baseline dashboard',
      description:
        'Published weekly CI baseline dashboard covering runtime, flaky tests, and queue delays; shared with platform leads.',
      link: 'https://example.com/dashboards/ci-baseline',
      status: 'Reviewed',
      match_state: 'Yes',
      manager_notes: '[sample-content] [auto-objective:00000000-0000-4000-8000-000000001005]',
      is_archived: false,
    },
    {
      id: '00000000-0000-4000-8000-000000002007',
      user_id: userId,
      date: addDays(-12),
      source: 'Objective',
      category: 'Communication',
      competency: 'Leads clear technical communication rituals across teams',
      title: 'Complete postmortem template rollout across squads',
      description:
        'Rolled out standard incident postmortem template and trained three squads on consistent write-up quality.',
      link: 'https://example.com/templates/postmortem-v2',
      status: 'Reviewed',
      match_state: 'Yes',
      manager_notes: '[sample-content] [auto-objective:00000000-0000-4000-8000-000000001010]',
      is_archived: false,
    },
    {
      id: '00000000-0000-4000-8000-000000002008',
      user_id: userId,
      date: addDays(-18),
      source: 'Objective',
      category: 'System Design',
      competency: 'Designs migration plans with rollback and risk controls',
      title: 'Draft migration plan for Redis session storage',
      description:
        'Created migration plan covering cutover, rollback, and consistency safeguards for moving sessions to Redis.',
      link: 'https://example.com/rfc/redis-session-migration',
      status: 'Reviewed',
      match_state: 'Yes',
      manager_notes: '[sample-content] [auto-objective:00000000-0000-4000-8000-000000001008]',
      is_archived: false,
    },
  ]
}

// ── useEvidenceQuery ───────────────────────────────────────────────────────────

interface UseEvidenceQueryOpts {
  archived?: boolean
  includeSamples?: boolean
}

/**
 * Fetches evidence records for a user, filtered by archived state.
 * Key: ['evidence', userId, { archived }]
 * staleTime: 60s
 */
export function useEvidenceQuery(
  userId: string,
  opts: UseEvidenceQueryOpts = {}
) {
  const archived = opts.archived ?? false
  const includeSamples = opts.includeSamples ?? true
  return useQuery({
    queryKey: evidenceKey(userId, archived, includeSamples),
    queryFn: async () => {
      if (!archived && includeSamples) {
        const sampleRows = buildSampleEvidence(userId)
        const { error: seedError } = await supabase
          .from('evidence')
          .upsert(sampleRows, { onConflict: 'id', ignoreDuplicates: true })
        if (seedError) {
          console.warn('[evidence] sample seeding skipped:', seedError.message)
        }
      }

      const { data, error } = await supabase
        .from('evidence')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', archived)
        .order('date', { ascending: false })
      if (error) throw error
      return (data ?? []).map(evidenceRowToRecord)
    },
    staleTime: 60_000,
    enabled: Boolean(userId),
  })
}

// ── useSaveEvidence ────────────────────────────────────────────────────────────

/**
 * Updates an existing evidence record with optimistic update.
 * onMutate: snapshot → apply optimistic patch
 * onError: roll back + toast.error
 * onSettled: invalidate ['evidence', userId, *]
 */
export function useSaveEvidence(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (record: EvidenceRecord) => {
      const { data: existingRow, error: existingError } = await supabase
        .from('evidence')
        .select('source, manager_notes')
        .eq('id', record.id)
        .eq('user_id', userId)
        .maybeSingle()
      if (existingError) throw existingError
      const linkedObjective =
        existingRow?.source === 'Objective' ||
        Boolean(existingRow?.manager_notes?.includes('[auto-objective:'))
      if (linkedObjective) {
        throw new Error('Objective-logged evidence is managed from Objectives and cannot be edited here.')
      }

      const row = evidenceRecordToRow(record, userId)
      const { error } = await supabase
        .from('evidence')
        .update(row)
        .eq('id', record.id)
        .eq('user_id', userId)
      if (error) throw error
    },

    onMutate: async (record: EvidenceRecord) => {
      // Determine which key this record belongs to (active or archived)
      const queryKey = evidenceKey(userId, record.isArchived, true)

      // Cancel in-flight queries so they don't overwrite the optimistic update
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the current cache
      const previousData = queryClient.getQueryData<EvidenceRecord[]>(queryKey)

      // Apply optimistic update
      queryClient.setQueryData<EvidenceRecord[]>(queryKey, (old) =>
        (old ?? []).map((e) => (e.id === record.id ? record : e))
      )

      return { previousData, queryKey }
    },

    onError: (error: Error, _record, context) => {
      // Roll back to snapshot
      if (context?.previousData !== undefined && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData)
      }
      toast.error(error.message)
    },

    onSettled: () => {
      // Always re-fetch both active and archived to sync with server
      void queryClient.invalidateQueries({
        queryKey: ['evidence', userId],
      })
    },
  })
}

// ── useArchiveEvidence ─────────────────────────────────────────────────────────

/**
 * Archives an evidence record: sets is_archived = true, archived_date = today.
 * Invalidates both archived and active evidence keys.
 */
export function useArchiveEvidence(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const today = toLocalDateString()
      const { error } = await supabase
        .from('evidence')
        .update({ is_archived: true, archived_date: today })
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: evidenceKey(userId, false, true),
      })
      void queryClient.invalidateQueries({
        queryKey: evidenceKey(userId, true, true),
      })
    },
  })
}

// ── useRestoreEvidence ─────────────────────────────────────────────────────────

/**
 * Restores an archived evidence record: sets is_archived = false, archived_date = null.
 * Invalidates both archived and active evidence keys.
 */
export function useRestoreEvidence(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('evidence')
        .update({ is_archived: false, archived_date: null })
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: evidenceKey(userId, false, true),
      })
      void queryClient.invalidateQueries({
        queryKey: evidenceKey(userId, true, true),
      })
    },
  })
}

// ── useDeleteEvidence ──────────────────────────────────────────────────────────

/**
 * Permanently deletes an evidence record.
 * Invalidates the archived evidence key (delete is only available on archived items).
 */
export function useDeleteEvidence(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('evidence')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['evidence', userId],
      })
    },
  })
}

// ── useInsertEvidence ──────────────────────────────────────────────────────────

/**
 * Inserts a new evidence record via evidenceRecordToRow().
 * Invalidates the active (archived: false) evidence key.
 */
export function useInsertEvidence(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (record: EvidenceRecord) => {
      const row = evidenceRecordToRow(record, userId)
      // If no id provided, omit it so the DB generates a UUID
      const { id, ...rowWithoutId } = row
      const insertPayload = id ? row : rowWithoutId
      const { error } = await supabase.from('evidence').insert(insertPayload)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: evidenceKey(userId, false, true),
      })
    },
  })
}
