// src/lib/api/frameworks.ts
// TanStack Query hooks for competency frameworks domain.
// All hooks accept userId: string (from useAuth().user!.id).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSafeErrorMessage } from '../safe-error-message'
import { supabase } from '../supabase'
import type { Database } from '../database.types'

// ── DB Row/Insert type aliases ─────────────────────────────────────────────────

type FrameworkRow = Database['public']['Tables']['competency_frameworks']['Row']
type FrameworkInsert = Database['public']['Tables']['competency_frameworks']['Insert']
type CategoryRow = Database['public']['Tables']['competency_categories']['Row']
type CategoryInsert = Database['public']['Tables']['competency_categories']['Insert']

// ── Nested query response shape ────────────────────────────────────────────────

/**
 * A competency framework row with its nested categories included.
 */
export type FrameworkWithCategories = FrameworkRow & {
  competency_categories: CategoryRow[]
}

// ── Mutation variable types ────────────────────────────────────────────────────

/**
 * Variables accepted by useUploadFramework.
 * Provides the framework row and its associated categories as separate arrays.
 */
export interface UploadFrameworkVariables {
  framework: FrameworkInsert
  categories: CategoryInsert[]
}

// ── Query key helpers ──────────────────────────────────────────────────────────

const frameworksKey = (userId: string) => ['frameworks', userId] as const

// ── useFrameworkQuery ──────────────────────────────────────────────────────────

/**
 * Fetches the single active competency framework for a user, including nested categories.
 *
 * Key: ['frameworks', userId]
 * staleTime: 10 minutes (600_000 ms)
 *
 * Returns null when no active framework exists (PGRST116 "no rows" from .single()).
 */
export function useFrameworkQuery(userId: string) {
  return useQuery({
    queryKey: frameworksKey(userId),
    queryFn: async (): Promise<FrameworkWithCategories | null> => {
      const { data, error } = await supabase
        .from('competency_frameworks')
        .select('*, competency_categories(*)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      // PGRST116 = "no rows returned" — not an error for this hook
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data as FrameworkWithCategories
    },
    staleTime: 600_000,
    enabled: Boolean(userId),
  })
}

// ── useUploadFramework ─────────────────────────────────────────────────────────

/**
 * Upserts a competency framework row, then bulk-upserts its categories.
 *
 * Transaction sequence:
 *   1. Upsert the competency_frameworks row (ON CONFLICT (id) DO UPDATE)
 *   2. Bulk upsert competency_categories rows (ON CONFLICT (id) DO UPDATE)
 *
 * On any error: show a sanitized toast message and rethrow.
 * On success: invalidate ['frameworks', userId].
 */
export function useUploadFramework(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ framework, categories }: UploadFrameworkVariables) => {
      // Step 1: Upsert the framework row, injecting user_id
      const frameworkRow: FrameworkInsert = {
        ...framework,
        user_id: userId,
      }

      const { data: upsertedFramework, error: frameworkError } = await supabase
        .from('competency_frameworks')
        .upsert(frameworkRow, { onConflict: 'id' })
        .select('id')
        .single()

      if (frameworkError) throw frameworkError

      const frameworkId: string = upsertedFramework.id

      // Step 2: Bulk upsert categories, injecting user_id and framework_id
      if (categories.length > 0) {
        const categoryRows: CategoryInsert[] = categories.map((cat) => ({
          ...cat,
          user_id: userId,
          framework_id: frameworkId,
        }))

        const { error: categoriesError } = await supabase
          .from('competency_categories')
          .upsert(categoryRows, { onConflict: 'id' })

        if (categoriesError) throw categoriesError
      }
    },

    onError: (error: Error) => {
      toast.error(getSafeErrorMessage(error, 'Unable to save framework right now.'))
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: frameworksKey(userId) })
    },
  })
}
