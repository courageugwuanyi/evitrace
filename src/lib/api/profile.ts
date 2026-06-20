// src/lib/api/profile.ts
// TanStack Query hooks for profile domain.
// All hooks accept userId: string (from useAuth().user!.id).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../supabase'
import { profileRowToAuthUser, type AuthUser } from './mappers'
import type { Database } from '../database.types'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// ── Query key helpers ──────────────────────────────────────────────────────────

const profileKey = (userId: string) => ['profile', userId] as const

// ── useProfileQuery ────────────────────────────────────────────────────────────

/**
 * Fetches the profile row for a user and maps it to AuthUser.
 * Key: ['profile', userId]
 * staleTime: 5 min (near-static data)
 */
export function useProfileQuery(userId: string) {
  return useQuery({
    queryKey: profileKey(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return profileRowToAuthUser(data)
    },
    staleTime: 300_000,
    enabled: Boolean(userId),
  })
}

// ── useSaveProfile ─────────────────────────────────────────────────────────────

/**
 * Updates the profile fields: full_name, email, current_level, target_level, job_title.
 * Invalidates ['profile', userId] on success.
 */
export function useSaveProfile(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      patch: Pick<AuthUser, 'fullName' | 'email' | 'currentLevel' | 'targetLevel' | 'jobTitle'>
    ) => {
      const update: ProfileUpdate = {
        full_name: patch.fullName,
        email: patch.email,
        current_level: patch.currentLevel,
        target_level: patch.targetLevel,
        job_title: patch.jobTitle ?? null,
      }
      const { error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: profileKey(userId),
      })
    },
  })
}

// ── useSaveTeam ────────────────────────────────────────────────────────────────

/**
 * Updates the team-related profile fields: manager, manager_email, team, skip_level.
 * Invalidates ['profile', userId] on success.
 */
export function useSaveTeam(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      patch: Pick<AuthUser, 'manager' | 'managerEmail' | 'team' | 'skipLevel'>
    ) => {
      const update: ProfileUpdate = {
        manager: patch.manager,
        manager_email: patch.managerEmail,
        team: patch.team,
        skip_level: patch.skipLevel ?? null,
      }
      const { error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', userId)
      if (error) throw error
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: profileKey(userId),
      })
    },
  })
}

// ── useUploadAvatar ────────────────────────────────────────────────────────────

/**
 * Uploads an avatar file to the 'avatars' bucket at `{userId}/{fileName}` (upsert: true),
 * then updates profiles.avatar_url with the public URL.
 * Invalidates ['profile', userId] on success.
 */
export function useUploadAvatar(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const fileName = file.name

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${userId}/${fileName}`, file, { upsert: true })
      if (uploadError) throw uploadError

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${userId}/${fileName}`)
      const publicUrl = urlData.publicUrl

      // Update profiles.avatar_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
      if (updateError) throw updateError

      return publicUrl
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: profileKey(userId),
      })
    },
  })
}
