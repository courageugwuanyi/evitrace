// src/lib/api/feedback.ts
// TanStack Query hooks for feedback domain.
// All hooks accept userId: string (from useAuth().user!.id).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../supabase'
import { feedbackRowToItem, type FeedbackItem } from './mappers'
import type { Database } from '../database.types'

type FeedbackInsert = Database['public']['Tables']['feedback']['Insert']

// ── Query key helpers ──────────────────────────────────────────────────────────

const feedbackKey = (userId: string) => ['feedback', userId] as const

// ── useFeedbackQuery ───────────────────────────────────────────────────────────

/**
 * Fetches all feedback items for a user, ordered by date descending.
 * Key: ['feedback', userId]
 * staleTime: 60s
 */
export function useFeedbackQuery(userId: string) {
  return useQuery({
    queryKey: feedbackKey(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
      if (error) throw error
      return (data ?? []).map(feedbackRowToItem)
    },
    staleTime: 60_000,
    enabled: Boolean(userId),
  })
}

// ── useAddFeedback ─────────────────────────────────────────────────────────────

/**
 * Inserts a new feedback row.
 * Invalidates ['feedback', userId] on success.
 */
export function useAddFeedback(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: Omit<FeedbackItem, 'id'> & { referenceLinks?: string[] }) => {
      const row: Omit<FeedbackInsert, 'id'> = {
        user_id: userId,
        date: item.date,
        provider: item.provider,
        type: item.type,
        notes: item.notes,
        reference_links: item.referenceLinks ?? [],
        anonymous: item.anonymous,
      }
      const { error } = await supabase.from('feedback').insert(row)
      if (!error) return

      const missingReferenceLinksColumn =
        /reference_links/i.test(error.message) &&
        /(schema cache|column)/i.test(error.message)

      if (!missingReferenceLinksColumn) throw error

      const fallbackRow: Omit<FeedbackInsert, 'id'> = {
        user_id: userId,
        date: item.date,
        provider: item.provider,
        type: item.type,
        notes: item.notes,
        anonymous: item.anonymous,
      }
      const { error: fallbackError } = await supabase.from('feedback').insert(fallbackRow)
      if (fallbackError) throw fallbackError
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: feedbackKey(userId),
      })
    },
  })
}
