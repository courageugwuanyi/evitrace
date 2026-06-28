// src/lib/api/settings.ts
// TanStack Query hooks for user settings domain.
// All hooks accept userId: string (from useAuth().user!.id).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSafeErrorMessage } from '../safe-error-message'
import { supabase } from '../supabase'
import {
  settingsRowToSettings,
  type NotificationPrefs,
  type IntegrationPrefs,
} from './mappers'

// ── Query key helpers ──────────────────────────────────────────────────────────

const settingsKey = (userId: string) => ['user_settings', userId] as const
const profileActiveFrameworkKey = (userId: string) => ['profile-active-framework', userId] as const
const activeFrameworkMatrixKey = (userId: string) => ['active-framework-matrix', userId] as const
const activeFrameworkContextKey = (userId: string) => ['active-framework-context', userId] as const
const profileKey = (userId: string) => ['profile', userId] as const

export type FrameworkOption = {
  id: string
  name: string
  description: string | null
  is_system_default: boolean
  matrix: unknown
  created_at: string
}

const SYSTEM_DEFAULT_NAME_SUFFIX_REGEX = /\s*\((?:system default|built-in template)\)\s*$/i

function normalizeFrameworkName(rawName: string): string {
  const cleaned = rawName
    .replace(SYSTEM_DEFAULT_NAME_SUFFIX_REGEX, '')
    .replace(/^company\s+custom\s+/i, '')
    .replace(/\breference guide\b/i, 'Framework')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return cleaned || rawName.trim() || rawName
}

export function getFrameworkDisplayName(framework: Pick<FrameworkOption, 'name' | 'is_system_default'>): string {
  const cleanTemplateName = normalizeFrameworkName(framework.name)
  if (framework.is_system_default) {
    return `${cleanTemplateName || framework.name} (Built-in)`
  }
  return cleanTemplateName
}

function normalizeWallClockTime(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

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
      const normalizedPromptTimes = (notifications.extensionPromptTimes ?? [])
        .map((value) => normalizeWallClockTime(value))
        .filter((value): value is string => Boolean(value))
      const safeNotifications: NotificationPrefs = {
        ...notifications,
        extensionPromptTimes:
          normalizedPromptTimes.length > 0 ? [...new Set(normalizedPromptTimes)] : ["16:00"],
      }
      const { error } = await supabase
        .from('user_settings')
        .update({ notifications: safeNotifications as unknown as import('../database.types').Json })
        .eq('user_id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(getSafeErrorMessage(error, 'Unable to update notification settings right now.'))
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
      toast.error(getSafeErrorMessage(error, 'Unable to update integration settings right now.'))
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: settingsKey(userId),
      })
    },
  })
}

/**
 * Updates profiles.active_framework_id for the signed-in user and refreshes all
 * framework-dependent queries used across the app.
 */
export function useSetActiveFramework(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (frameworkId: string) => {
      if (!userId) throw new Error('Sign in to update the active framework.')
      if (!frameworkId) throw new Error('Select a valid framework.')
      const { data, error } = await supabase
        .from('profiles')
        .update({ active_framework_id: frameworkId })
        .eq('id', userId)
        .select('active_framework_id')
        .maybeSingle()
      if (error) throw error
      return (data?.active_framework_id as string | null) ?? frameworkId
    },
    onSuccess: (frameworkId) => {
      queryClient.setQueryData(profileActiveFrameworkKey(userId), frameworkId)
      void queryClient.invalidateQueries({ queryKey: profileActiveFrameworkKey(userId) })
      void queryClient.invalidateQueries({ queryKey: activeFrameworkMatrixKey(userId) })
      void queryClient.invalidateQueries({ queryKey: activeFrameworkContextKey(userId) })
      void queryClient.invalidateQueries({ queryKey: profileKey(userId) })
    },
    onError: (error: Error) => {
      toast.error(getSafeErrorMessage(error, 'Unable to switch active framework right now.'))
    },
  })
}
