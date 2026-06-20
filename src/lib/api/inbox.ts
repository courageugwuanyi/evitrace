// src/lib/api/inbox.ts
// TanStack Query hooks for inbox domain.
// All hooks accept userId: string (from useAuth().user!.id).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../supabase'
import { inboxRowToItem, type InboxItem, type EvidenceRecord } from './mappers'
import type { Database } from '../database.types'

// ── DB Insert types ────────────────────────────────────────────────────────────

type EvidenceInsert = Database['public']['Tables']['evidence']['Insert']

// ── ApproveInbox variables ─────────────────────────────────────────────────────

export interface ApproveInboxVariables {
  inboxItem: InboxItem
  newEvidenceRow: Omit<EvidenceInsert, 'id'>
}

// ── Query key helpers ──────────────────────────────────────────────────────────

const inboxKey = (userId: string) => ['inbox', userId] as const

const evidenceActiveKey = (userId: string) =>
  ['evidence', userId, { archived: false }] as const

// ── useInboxQuery ──────────────────────────────────────────────────────────────

/**
 * Fetches inbox_events for a user, ordered newest-first.
 * Key: ['inbox', userId]
 * staleTime: 30s
 */
export function useInboxQuery(userId: string) {
  return useQuery({
    queryKey: inboxKey(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inbox_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(inboxRowToItem)
    },
    staleTime: 30_000,
    enabled: Boolean(userId),
  })
}

// ── useApproveInbox ────────────────────────────────────────────────────────────

/**
 * Approves an inbox item by:
 *   1. Optimistically removing the inbox item from ['inbox', userId]
 *   2. Optimistically prepending the new evidence row to ['evidence', userId, { archived: false }]
 *   3. Inserting the evidence row into the DB
 *   4. Deleting the inbox_events row from the DB
 *
 * onError: rolls back both caches to their snapshots + toast.error
 * onSuccess: invalidates ['inbox', userId] and ['evidence', userId, { archived: false }]
 */
export function useApproveInbox(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ inboxItem, newEvidenceRow }: ApproveInboxVariables) => {
      // Step 1: Insert the new evidence row
      const { error: evidenceError } = await supabase
        .from('evidence')
        .insert(newEvidenceRow)
      if (evidenceError) throw evidenceError

      // Step 2: Delete the inbox_events row
      const { error: inboxError } = await supabase
        .from('inbox_events')
        .delete()
        .eq('id', inboxItem.id)
      if (inboxError) throw inboxError
    },

    onMutate: async ({ inboxItem, newEvidenceRow }: ApproveInboxVariables) => {
      const inboxQueryKey = inboxKey(userId)
      const evidenceQueryKey = evidenceActiveKey(userId)

      // Cancel any in-flight queries for both caches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: inboxQueryKey }),
        queryClient.cancelQueries({ queryKey: evidenceQueryKey }),
      ])

      // Snapshot both caches
      const previousInbox = queryClient.getQueryData<InboxItem[]>(inboxQueryKey)
      const previousEvidence = queryClient.getQueryData<EvidenceRecord[]>(evidenceQueryKey)

      // Optimistically remove inbox item
      queryClient.setQueryData<InboxItem[]>(inboxQueryKey, (old) =>
        (old ?? []).filter((item) => item.id !== inboxItem.id)
      )

      // Optimistically prepend a placeholder evidence row derived from newEvidenceRow.
      // We set a temporary id since the DB will generate the real one.
      const optimisticEvidence: EvidenceRecord = {
        id: `optimistic-${inboxItem.id}`,
        date: newEvidenceRow.date ?? new Date().toISOString().slice(0, 10),
        source: newEvidenceRow.source,
        category: newEvidenceRow.category,
        competency: newEvidenceRow.competency,
        title: newEvidenceRow.title,
        description: newEvidenceRow.description ?? '',
        link: newEvidenceRow.link ?? '',
        status: (newEvidenceRow.status as EvidenceRecord['status']) ?? 'Pending Review',
        matchState: (newEvidenceRow.match_state as EvidenceRecord['matchState']) ?? 'Unset',
        managerNotes: newEvidenceRow.manager_notes ?? '',
        isArchived: newEvidenceRow.is_archived ?? false,
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData<EvidenceRecord[]>(evidenceQueryKey, (old) => [
        optimisticEvidence,
        ...(old ?? []),
      ])

      return { previousInbox, previousEvidence, inboxQueryKey, evidenceQueryKey }
    },

    onError: (error: Error, _variables, context) => {
      // Roll back both caches to their snapshots
      if (context?.previousInbox !== undefined && context?.inboxQueryKey) {
        queryClient.setQueryData(context.inboxQueryKey, context.previousInbox)
      }
      if (context?.previousEvidence !== undefined && context?.evidenceQueryKey) {
        queryClient.setQueryData(context.evidenceQueryKey, context.previousEvidence)
      }
      toast.error(error.message)
    },

    onSuccess: () => {
      // Invalidate both caches to sync with the server
      void queryClient.invalidateQueries({ queryKey: inboxKey(userId) })
      void queryClient.invalidateQueries({ queryKey: evidenceActiveKey(userId) })
    },
  })
}

// ── useDismissInbox ────────────────────────────────────────────────────────────

/**
 * Dismisses (deletes) an inbox item without creating evidence.
 * Invalidates ['inbox', userId] on success.
 */
export function useDismissInbox(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inboxId: string) => {
      const { error } = await supabase
        .from('inbox_events')
        .delete()
        .eq('id', inboxId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inboxKey(userId) })
    },
  })
}
