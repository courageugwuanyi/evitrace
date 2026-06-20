// src/lib/api/settings.ts
// TanStack Query hooks for user settings domain.
// All hooks accept userId: string (from useAuth().user!.id).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../supabase'
import {
  settingsRowToSettings,
  type NotificationPrefs,
  type IntegrationPrefs,
} from './mappers'

// ── Query key helpers ──────────────────────────────────────────────────────────

const settingsKey = (userId: string) => ['user_settings', userId] as const

// ── useSettingsQuery ───────────────────────────────────────────────────────────

/**
 * Fetches notification and integration preferences for a user.
 * Key: ['user_settings', userId]
 * staleTime: 5 min (near-static data)
 */
export function useSettingsQuery(userId: string) {
  return useQuery({
    queryKey: settingsKey(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error) throw error
      return settingsRowToSettings(data)
    },
    staleTime: 300_000,
    enabled: Boolean(userId),
  })
}

// ── useSaveNotifications ───────────────────────────────────────────────────────

/**
 * PATCHes the notifications JSONB column for the user.
 * Invalidates ['user_settings', userId] on settled.
 */
export function useSaveNotifications(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notifications: NotificationPrefs) => {
      const { error } = await supabase
        .from('user_settings')
        .update({ notifications: notifications as unknown as import('../database.types').Json })
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: settingsKey(userId),
      })
    },
  })
}

// ── useSaveIntegrations ────────────────────────────────────────────────────────

/**
 * PATCHes the integrations JSONB column for the user.
 * Invalidates ['user_settings', userId] on settled.
 */
export function useSaveIntegrations(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (integrations: IntegrationPrefs) => {
      const { error } = await supabase
        .from('user_settings')
        .update({ integrations: integrations as unknown as import('../database.types').Json })
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: settingsKey(userId),
      })
    },
  })
}
