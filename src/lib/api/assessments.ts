// src/lib/api/assessments.ts
// TanStack Query hooks for assessments domain.
// All hooks accept userId: string (from useAuth().user!.id).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../supabase'
import {
  assessmentRowsToAssessment,
  assessmentToRows,
  type Assessment,
} from './mappers'
import type { Database } from '../database.types'

// ── DB Row/Insert type aliases ─────────────────────────────────────────────────

type CategoryRow = Database['public']['Tables']['assessment_categories']['Row']
type QuestionRow = Database['public']['Tables']['assessment_questions']['Row']

// ── Exported variable types ────────────────────────────────────────────────────

export interface FinalizeAssessmentVariables {
  assessment: Assessment
  userId?: string
}

export interface UpdateOneOnOneTopicsVariables {
  assessmentId: string
  topics: unknown[]
}

export interface DeleteAssessmentVariables {
  assessmentId: string
}

// ── Query key helpers ──────────────────────────────────────────────────────────

const assessmentsKey = (userId: string) => ['assessments', userId] as const

// ── Nested query response shape ────────────────────────────────────────────────

type AssessmentWithNested = Database['public']['Tables']['assessments']['Row'] & {
  assessment_categories: Array<
    CategoryRow & {
      assessment_questions: QuestionRow[]
    }
  >
}

// ── useAssessmentsQuery ────────────────────────────────────────────────────────

/**
 * Fetches all assessments for a user with nested categories and questions.
 * Key: ['assessments', userId]
 * staleTime: 5 minutes (300_000 ms)
 */
export function useAssessmentsQuery(userId: string) {
  return useQuery({
    queryKey: assessmentsKey(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*, assessment_categories(*, assessment_questions(*))')
        .eq('user_id', userId)
        .order('date_completed', { ascending: false })
      if (error) throw error

      return (data as AssessmentWithNested[] ?? []).map((row) => {
        const categories = row.assessment_categories ?? []
        // Flatten all questions from nested categories into a single array
        const questions = categories.flatMap((cat) => cat.assessment_questions ?? [])
        return assessmentRowsToAssessment(row, categories, questions)
      })
    },
    staleTime: 300_000,
    enabled: Boolean(userId),
  })
}

// ── useFinalizeAssessment ──────────────────────────────────────────────────────

/**
 * Persists (creates or updates) a finalized assessment.
 *
 * Transaction sequence:
 *   1. Call assessmentToRows() to flatten the Assessment into DB rows
 *   2. Upsert the assessments row with onConflict: 'id'
 *   3. For update case: delete existing categories (CASCADE deletes questions), then bulk insert fresh categories
 *   4. Bulk insert questions
 *
 * On any error: toast.error(error.message) and throw (caller keeps wizard open)
 * On success: invalidate ['assessments', userId]
 */
export function useFinalizeAssessment(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ assessment, userId: explicitUserId }: FinalizeAssessmentVariables) => {
      const ownerId = (explicitUserId ?? userId ?? '').trim()
      if (!ownerId) {
        throw new Error('Cannot finalize assessment: Unauthenticated user session')
      }
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      const sessionUserId = authData.user?.id
      if (!sessionUserId) {
        throw new Error('Cannot finalize assessment: Unauthenticated user session')
      }
      if (sessionUserId !== ownerId) {
        throw new Error('Cannot finalize assessment: Authenticated user mismatch')
      }

      const { assessment: assessmentRow, categories, questions } = assessmentToRows(
        assessment,
        ownerId
      )

      // Step 1: Upsert the assessments row (ON CONFLICT (id) DO UPDATE)
      const { error: upsertError } = await supabase
        .from('assessments')
        .upsert(assessmentRow, { onConflict: 'id' })
      if (upsertError) throw upsertError

      // Step 2: Delete existing categories for this assessment (CASCADE deletes questions)
      const { error: deleteError } = await supabase
        .from('assessment_categories')
        .delete()
        .eq('assessment_id', assessment.id)
        .eq('user_id', ownerId)
      if (deleteError) throw deleteError

      // Step 3: Bulk insert fresh categories
      if (categories.length > 0) {
        const { error: categoriesError } = await supabase
          .from('assessment_categories')
          .insert(categories)
        if (categoriesError) throw categoriesError
      }

      // Step 4: Bulk insert questions
      if (questions.length > 0) {
        const { error: questionsError } = await supabase
          .from('assessment_questions')
          .insert(questions)
        if (questionsError) throw questionsError
      }
    },

    onError: (error: Error) => {
      // Surface the error — caller keeps wizard open
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentsKey(userId) })
    },
  })
}

// ── useUpdateOneOnOneTopics ────────────────────────────────────────────────────

/**
 * Updates the one_on_one_topics JSONB column for a specific assessment.
 * Invalidates ['assessments', userId] on success.
 */
export function useUpdateOneOnOneTopics(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ assessmentId, topics }: UpdateOneOnOneTopicsVariables) => {
      const { error } = await supabase
        .from('assessments')
        .update({ one_on_one_topics: topics as Database['public']['Tables']['assessments']['Update']['one_on_one_topics'] })
        .eq('id', assessmentId)
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentsKey(userId) })
    },
  })
}

// ── useDeleteAssessment ────────────────────────────────────────────────────────

/**
 * Deletes an assessment and its nested category/question rows (via DB cascade).
 * Invalidates ['assessments', userId] on success.
 */
export function useDeleteAssessment(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ assessmentId }: DeleteAssessmentVariables) => {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId)
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentsKey(userId) })
    },
  })
}
