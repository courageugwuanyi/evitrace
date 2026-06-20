// src/lib/api/evidence.ts
// TanStack Query hooks for evidence domain.
// All hooks accept userId: string (from useAuth().user!.id).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../supabase'
import {
  evidenceRowToRecord,
  evidenceRecordToRow,
  type EvidenceRecord,
} from './mappers'

// ── Query key helpers ──────────────────────────────────────────────────────────

const evidenceKey = (userId: string, archived: boolean) =>
  ['evidence', userId, { archived }] as const

// ── useEvidenceQuery ───────────────────────────────────────────────────────────

interface UseEvidenceQueryOpts {
  archived?: boolean
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
  return useQuery({
    queryKey: evidenceKey(userId, archived),
    queryFn: async () => {
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
      const queryKey = evidenceKey(userId, record.isArchived)

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
      const today = new Date().toISOString().slice(0, 10)
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
        queryKey: evidenceKey(userId, false),
      })
      void queryClient.invalidateQueries({
        queryKey: evidenceKey(userId, true),
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
        queryKey: evidenceKey(userId, false),
      })
      void queryClient.invalidateQueries({
        queryKey: evidenceKey(userId, true),
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
        queryKey: evidenceKey(userId, true),
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
        queryKey: evidenceKey(userId, false),
      })
    },
  })
}
