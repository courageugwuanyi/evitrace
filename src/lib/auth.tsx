// src/lib/auth.tsx
// AuthContext, AuthProvider, and useAuth hook.
// Implements the three-state session machine:
//   loading → authenticated | unauthenticated
//
// DO NOT import from any .server.ts file.
// DO NOT touch index.tsx — this provider is wired in Task 10.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'
import { supabase } from './supabase'
import type { Database } from './database.types'
import { profileRowToAuthUser, type AuthUser } from './api/mappers'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// ── Public interface ───────────────────────────────────────────────────────────

export interface AuthCtx {
  user: AuthUser | null
  /** The Supabase auth UUID for the signed-in user. Available whenever user is non-null. */
  userId: string | null
  /** True only while the initial getSession() call is in-flight. */
  loading: boolean
  signin: (email: string, password: string) => Promise<boolean>
  /** u must contain a `password` field for the signUp call; it is NOT stored. */
  signup: (u: AuthUser & { password: string }) => Promise<boolean>
  signout: () => Promise<void>
  updateUser: (patch: Partial<AuthUser>, password: string) => Promise<boolean>
  /** OAuth helpers — called by SsoButtons. */
  signInWithGoogle: () => Promise<void>
  signInWithMicrosoft: () => Promise<void>
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthCtx | null>(null)

/** Throws if used outside <AuthProvider>. */
export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth() must be used inside <AuthProvider>')
  return ctx
}

// ── Default user_settings for new sign-ups ─────────────────────────────────────

const DEFAULT_NOTIFICATIONS = {
  dailyReminder: true,
  managerApprovals: true,
  weeklyDigest: false,
  browserPush: true,
  extensionPromptTimes: ['16:00'],
  extensionSnoozeMinutes: 15,
  extensionWeekdaysOnly: true,
  extensionTimezone: 'GMT',
}

const DEFAULT_INTEGRATIONS = {
  autoCaptureEvents: true,
  jira: true,
  github: true,
  bitbucket: false,
  slack: false,
  teams: false,
  confluence: false,
  notion: false,
}

// ── Helper: fetch profile row and convert to AuthUser ─────────────────────────

async function fetchProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return profileRowToAuthUser(data)
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Prevent double-subscription in React StrictMode dev double-invocation
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  useEffect(() => {
    let cancelled = false

    // ── Step 1: hydrate from existing session ───────────────────────────────
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (!cancelled) {
          setUser(profile)
          setUserId(session.user.id)
        }
      }
      if (!cancelled) setLoading(false)
    })

    // ── Step 2: subscribe to future auth state changes ──────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (!session?.user) return
          const profile = await fetchProfile(session.user.id)

          // SSO first-sign-in: auto-create profiles + user_settings if missing
          if (!profile && session.user) {
            const fullName =
              (session.user.user_metadata?.full_name as string | undefined) ??
              session.user.email ??
              'Unknown'

            await supabase.from('profiles').insert({
              id: session.user.id,
              full_name: fullName,
              email: session.user.email ?? '',
              current_level: '',
              target_level: '',
              team: '',
              manager: '',
              manager_email: '',
            })

            const { data: existingSettings } = await supabase
              .from('user_settings')
              .select('id')
              .eq('user_id', session.user.id)
              .maybeSingle()

            if (!existingSettings) {
              await supabase.from('user_settings').insert({
                user_id: session.user.id,
                notifications: DEFAULT_NOTIFICATIONS,
                integrations: DEFAULT_INTEGRATIONS,
              })
            }

            const newProfile = await fetchProfile(session.user.id)
            setUser(newProfile)
            setUserId(session.user.id)
          } else {
            setUser(profile)
            setUserId(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setUserId(null)
        }
      },
    )

    subscriptionRef.current = subscription

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  // ── signin ────────────────────────────────────────────────────────────────

  const signin = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      return false
    }

    // Self-heal first-login-after-verification cases where signup had no session
    // and profile/settings rows were not created yet.
    const { data: existingProfile, error: profileLookupError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileLookupError) {
      toast.error(profileLookupError.message)
      return false
    }

    if (!existingProfile) {
      const metadataName = (data.user.user_metadata?.full_name as string | undefined)?.trim()
      const emailPrefix = (data.user.email ?? email).split('@')[0] || 'User'
      const fullName = metadataName && metadataName.length > 0 ? metadataName : emailPrefix

      const { error: insertProfileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        email: data.user.email ?? email,
        current_level: '',
        target_level: '',
        team: '',
        manager: '',
        manager_email: '',
      })
      if (insertProfileError) {
        toast.error(insertProfileError.message)
        return false
      }
    }

    const { data: existingSettings, error: settingsLookupError } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (settingsLookupError) {
      toast.error(settingsLookupError.message)
      return false
    }

    if (!existingSettings) {
      const { error: insertSettingsError } = await supabase.from('user_settings').insert({
        user_id: data.user.id,
        notifications: DEFAULT_NOTIFICATIONS,
        integrations: DEFAULT_INTEGRATIONS,
      })
      if (insertSettingsError) {
        toast.error(insertSettingsError.message)
        return false
      }
    }

    const profile = await fetchProfile(data.user.id)
    setUser(profile)
    setUserId(data.user.id)
    return true
  }, [])

  // ── signup ────────────────────────────────────────────────────────────────

  const signup = useCallback(
    async (u: AuthUser & { password: string }): Promise<boolean> => {
      const { data, error } = await supabase.auth.signUp({
        email: u.email,
        password: u.password,
      })

      if (error) {
        toast.error(error.message)
        return false
      }

      // Email confirmation required — no session yet
      if (data.user && !data.session) {
        toast.success('Check your inbox to confirm your email address.')
        return true
      }

      if (data.user && data.session) {
        // Insert profiles row
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: u.fullName,
          email: u.email,
          current_level: u.currentLevel,
          target_level: u.targetLevel,
          team: u.team,
          manager: u.manager,
          manager_email: u.managerEmail,
          skip_level: u.skipLevel ?? null,
          avatar_url: u.avatarUrl ?? null,
          job_title: u.jobTitle ?? null,
        })

        // Insert user_settings row with defaults
        await supabase.from('user_settings').insert({
          user_id: data.user.id,
          notifications: DEFAULT_NOTIFICATIONS,
          integrations: DEFAULT_INTEGRATIONS,
        })

        const profile = await fetchProfile(data.user.id)
        setUser(profile)
        setUserId(data.user.id)
      }

      return true
    },
    [],
  )

  // ── signout ───────────────────────────────────────────────────────────────

  const signout = useCallback(async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('[auth] signOut error:', error.message)
    setUser(null)
    setUserId(null)
  }, [])

  // ── updateUser ────────────────────────────────────────────────────────────

  const updateUser = useCallback(
    async (patch: Partial<AuthUser>, password: string): Promise<boolean> => {
      if (!user) return false

      // Re-authenticate to verify the password before applying any changes
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      })
      if (verifyError) return false

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return false

      // If email is changing, update it in Supabase Auth
      if (patch.email && patch.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: patch.email,
        })
        if (emailError) {
          toast.error(emailError.message)
          return false
        }
      }

      // Map AuthUser patch → profiles columns
      const profilePatch: ProfileUpdate = {}
      if (patch.fullName !== undefined) profilePatch.full_name = patch.fullName
      if (patch.email !== undefined) profilePatch.email = patch.email
      if (patch.currentLevel !== undefined) profilePatch.current_level = patch.currentLevel
      if (patch.targetLevel !== undefined) profilePatch.target_level = patch.targetLevel
      if (patch.team !== undefined) profilePatch.team = patch.team
      if (patch.manager !== undefined) profilePatch.manager = patch.manager
      if (patch.managerEmail !== undefined) profilePatch.manager_email = patch.managerEmail
      if (patch.skipLevel !== undefined) profilePatch.skip_level = patch.skipLevel ?? null
      if (patch.avatarUrl !== undefined) profilePatch.avatar_url = patch.avatarUrl ?? null
      if (patch.jobTitle !== undefined) profilePatch.job_title = patch.jobTitle ?? null

      if (Object.keys(profilePatch).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profilePatch)
          .eq('id', authUser.id)

        if (updateError) {
          toast.error(updateError.message)
          return false
        }
      }

      setUser((prev) => (prev ? { ...prev, ...patch } : prev))
      return true
    },
    [user],
  )

  // ── SSO ───────────────────────────────────────────────────────────────────

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }, [])

  const signInWithMicrosoft = useCallback(async (): Promise<void> => {
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { redirectTo: window.location.origin },
    })
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  const value: AuthCtx = {
    user,
    userId,
    loading,
    signin,
    signup,
    signout,
    updateUser,
    signInWithGoogle,
    signInWithMicrosoft,
  }

  return (
    <AuthContext.Provider value={value}>
      {/* Render nothing while the initial session check is in flight.
          This prevents both the app and the sign-in screen from flashing. */}
      {loading ? null : children}
    </AuthContext.Provider>
  )
}
