// src/lib/api/objectives.ts
// TanStack Query hooks for objectives domain.
// All hooks accept userId: string (from useAuth().user!.id).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../supabase'
import {
  objectiveRowToObjective,
  objectiveToRow,
  type Objective,
} from './mappers'

// ── Exported interfaces ────────────────────────────────────────────────────────

export interface MoveObjectiveVariables {
  id: string
  status: Objective['status']
  objective: Objective
}

// ── Query key helpers ──────────────────────────────────────────────────────────

const objectivesKey = (userId: string) => ['objectives', userId] as const

const evidenceActiveKey = (userId: string) =>
  ['evidence', userId, { archived: false }] as const

// ── useObjectivesQuery ─────────────────────────────────────────────────────────

/**
 * Fetches non-archived objectives for a user, ordered by due date ascending.
 * Key: ['objectives', userId]
 * staleTime: 60s
 */
export function useObjectivesQuery(userId: string) {
  return useQuery({
    queryKey: objectivesKey(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('due', { ascending: true })
      if (error) throw error
      return (data ?? []).map(objectiveRowToObjective)
    },
    staleTime: 60_000,
    enabled: Boolean(userId),
  })
}

// ── useCreateObjective ─────────────────────────────────────────────────────────

/**
 * Inserts a new objective with status: 'Pending Approval'.
 * Invalidates ['objectives', userId] on success.
 */
export function useCreateObjective(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (objective: Objective) => {
      const row = objectiveToRow(
        { ...objective, status: 'Pending Approval' },
        userId
      )
      // If no id provided, omit it so the DB generates a UUID
      const { id, ...rowWithoutId } = row
      const insertPayload = id ? row : rowWithoutId
      const { error } = await supabase.from('objectives').insert(insertPayload)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: objectivesKey(userId),
      })
    },
  })
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, objective }: MoveObjectiveVariables) => {
      // Update the objective status
      const { error: updateError } = await supabase
        .from('objectives')
        .update({ status })
        .eq('id', id)
        .eq('user_id', userId)
      if (updateError) throw updateError

      // Side effect: insert evidence row when completing an objective
      if (status === 'Completed') {
        const { error: evidenceError } = await supabase
          .from('evidence')
          .insert({
            user_id: userId,
            title: `Objective completed: ${objective.title}`,
            description: `SMART objective "${objective.title}" was completed.`,
            category: 'Objective',
            competency: objective.competency,
            source: 'Manual',
            status: 'Pending Review',
            match_state: 'Unset',
            date: new Date().toISOString().slice(0, 10),
            is_archived: false,
          })
        if (evidenceError) throw evidenceError
      }
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: (_data, { status }) => {
      void queryClient.invalidateQueries({
        queryKey: objectivesKey(userId),
      })
      if (status === 'Completed') {
        void queryClient.invalidateQueries({
          queryKey: evidenceActiveKey(userId),
        })
      }
    },
  })
}

// ── useSaveObjective ───────────────────────────────────────────────────────────

/**
 * Updates an existing objective with all fields.
 * Invalidates ['objectives', userId] on success.
 */
export function useSaveObjective(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (objective: Objective) => {
      const row = objectiveToRow(objective, userId)
      const { error } = await supabase
        .from('objectives')
        .update(row)
        .eq('id', objective.id)
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: objectivesKey(userId),
      })
    },
  })
}

// ── useArchiveObjective ────────────────────────────────────────────────────────

/**
 * Archives an objective: sets is_archived = true, archived_date = today.
 * Invalidates ['objectives', userId] on success.
 */
export function useArchiveObjective(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const today = new Date().toISOString().slice(0, 10)
      const { error } = await supabase
        .from('objectives')
        .update({ is_archived: true, archived_date: today })
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: objectivesKey(userId),
      })
    },
  })
}

// ── useRestoreObjective ────────────────────────────────────────────────────────

/**
 * Restores an archived objective: sets is_archived = false, archived_date = null.
 * Invalidates ['objectives', userId] on success.
 */
export function useRestoreObjective(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('objectives')
        .update({ is_archived: false, archived_date: null })
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: objectivesKey(userId),
      })
    },
  })
}

// ── useDeleteObjective ─────────────────────────────────────────────────────────

/**
 * Permanently deletes an objective.
 * Invalidates ['objectives', userId] on success.
 */
export function useDeleteObjective(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('objectives')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: objectivesKey(userId),
      })
    },
  })
}
