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
import { getSafeErrorMessage } from './safe-error-message'
import { supabase } from './supabase'
import type { Database } from './database.types'
import { getCurrentTimeZone } from './datetime'
import { profileRowToAuthUser, type AuthUser } from './api/mappers'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
type MirroredSupabaseSession = {
  accessToken: string
  refreshToken: string
  storageKey?: string
  sourceUrl?: string
  syncedAt?: number
}

const AUTH_STATE_CHANGE_EVENT = 'EVITRACE_AUTH_STATE_CHANGE'

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
  extensionTimezone: getCurrentTimeZone(),
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

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getProfileSeedFromMetadata(metadata: Record<string, unknown> | undefined, email: string) {
  const emailPrefix = (email ?? '').split('@')[0] || 'User'
  const unifiedCurrentLevel =
    readString(metadata?.current_level) ||
    readString(metadata?.currentLevel) ||
    readString(metadata?.job_title) ||
    readString(metadata?.jobTitle)
  const fullName =
    readString(metadata?.full_name) ||
    readString(metadata?.fullName) ||
    emailPrefix ||
    'Unknown'
  return {
    full_name: fullName,
    current_level: unifiedCurrentLevel,
    target_level: readString(metadata?.target_level) || readString(metadata?.targetLevel),
    team: readString(metadata?.team),
    manager: readString(metadata?.manager),
    manager_email: readString(metadata?.manager_email) || readString(metadata?.managerEmail),
    skip_level: readString(metadata?.skip_level) || readString(metadata?.skipLevel) || null,
    job_title: unifiedCurrentLevel || null,
  }
}

function getProfileSeedFromSignupInput(u: AuthUser) {
  const unifiedCurrentLevel = u.currentLevel.trim()
  return {
    full_name: u.fullName.trim(),
    current_level: unifiedCurrentLevel,
    target_level: u.targetLevel.trim(),
    team: u.team.trim(),
    manager: u.manager.trim(),
    manager_email: u.managerEmail.trim(),
    skip_level: u.skipLevel?.trim() ? u.skipLevel.trim() : null,
    job_title: unifiedCurrentLevel || null,
  }
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

function getChromeApi() {
  return (globalThis as typeof globalThis & { chrome?: any }).chrome
}

type BridgeSessionPayload = {
  access_token: string
  refresh_token: string
} | null

function toBridgeSessionPayload(session: unknown): BridgeSessionPayload {
  if (!session || typeof session !== 'object') return null
  const candidate = session as Record<string, unknown>
  const accessToken = candidate.access_token
  const refreshToken = candidate.refresh_token
  if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') return null
  if (!accessToken.trim() || !refreshToken.trim()) return null
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  }
}

function broadcastAuthStateChangeToBridge(event: string, session: unknown): void {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return
  const payload = toBridgeSessionPayload(session)
  window.dispatchEvent(
    new CustomEvent(AUTH_STATE_CHANGE_EVENT, {
      detail: {
        type: 'AUTH_STATE_CHANGE',
        event,
        session: payload,
      },
    }),
  )
}

function normalizeMirroredSession(value: unknown): MirroredSupabaseSession | null {
  if (!value || typeof value !== 'object') return null
  const session = value as Record<string, unknown>

  const accessToken =
    typeof session.accessToken === 'string'
      ? session.accessToken
      : typeof session.access_token === 'string'
        ? session.access_token
        : null
  const refreshToken =
    typeof session.refreshToken === 'string'
      ? session.refreshToken
      : typeof session.refresh_token === 'string'
        ? session.refresh_token
        : null

  if (!accessToken || !refreshToken) return null

  return {
    accessToken,
    refreshToken,
    storageKey: typeof session.storageKey === 'string' ? session.storageKey : undefined,
    sourceUrl: typeof session.sourceUrl === 'string' ? session.sourceUrl : undefined,
    syncedAt: typeof session.syncedAt === 'number' ? session.syncedAt : undefined,
  }
}

async function readMirroredSessionFromChromeStorage(): Promise<MirroredSupabaseSession | null> {
  const chromeApi = getChromeApi()
  if (!chromeApi?.storage?.local) return null

  return await new Promise((resolve) => {
    chromeApi.storage.local.get(['evitrace_supabase_session'], (stored: Record<string, unknown>) => {
      resolve(normalizeMirroredSession(stored?.evitrace_supabase_session))
    })
  })
}

async function requestSessionSyncFromWebAppTab(): Promise<void> {
  const chromeApi = getChromeApi()
  if (!chromeApi?.runtime?.sendMessage) return

  await new Promise<void>((resolve) => {
    chromeApi.runtime.sendMessage({ type: 'SYNC_SUPABASE_SESSION', source: 'auth_provider' }, () => {
      resolve()
    })
  })
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

      let activeSession = session
      if (!activeSession) {
        await requestSessionSyncFromWebAppTab()
        const mirrored = await readMirroredSessionFromChromeStorage()
        if (mirrored) {
          const { data: hydrated, error } = await supabase.auth.setSession({
            access_token: mirrored.accessToken,
            refresh_token: mirrored.refreshToken,
          })
          if (!error) {
            activeSession = hydrated.session
          }
        }
      }

      if (activeSession?.user) {
        const profile = await fetchProfile(activeSession.user.id)
        if (!cancelled) {
          setUser(profile)
          setUserId(activeSession.user.id)
        }
      }

      if (!cancelled) setLoading(false)
    })

    // ── Step 2: subscribe to future auth state changes ──────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        broadcastAuthStateChangeToBridge(event, session)

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (!session?.user) return
          const profile = await fetchProfile(session.user.id)

          // SSO first-sign-in: auto-create profiles + user_settings if missing
          if (!profile && session.user) {
            const metadata = (session.user.user_metadata ?? {}) as Record<string, unknown>
            const seeded = getProfileSeedFromMetadata(metadata, session.user.email ?? '')

            await supabase.from('profiles').insert({
              id: session.user.id,
              full_name: seeded.full_name,
              email: session.user.email ?? '',
              current_level: seeded.current_level,
              target_level: seeded.target_level,
              team: seeded.team,
              manager: seeded.manager,
              manager_email: seeded.manager_email,
              skip_level: seeded.skip_level,
              job_title: seeded.job_title,
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
      toast.error(getSafeErrorMessage(error, 'Unable to sign in right now.'))
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
      toast.error(getSafeErrorMessage(profileLookupError, 'Unable to load your profile right now.'))
      return false
    }

    if (!existingProfile) {
      const metadata = (data.user.user_metadata ?? {}) as Record<string, unknown>
      const seeded = getProfileSeedFromMetadata(metadata, data.user.email ?? email)

      const { error: insertProfileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: seeded.full_name,
        email: data.user.email ?? email,
        current_level: seeded.current_level,
        target_level: seeded.target_level,
        team: seeded.team,
        manager: seeded.manager,
        manager_email: seeded.manager_email,
        skip_level: seeded.skip_level,
        job_title: seeded.job_title,
      })
      if (insertProfileError) {
        toast.error(getSafeErrorMessage(insertProfileError, 'Unable to create your profile right now.'))
        return false
      }
    }

    const { data: existingSettings, error: settingsLookupError } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (settingsLookupError) {
      toast.error(getSafeErrorMessage(settingsLookupError, 'Unable to load your settings right now.'))
      return false
    }

    if (!existingSettings) {
      const { error: insertSettingsError } = await supabase.from('user_settings').insert({
        user_id: data.user.id,
        notifications: DEFAULT_NOTIFICATIONS,
        integrations: DEFAULT_INTEGRATIONS,
      })
      if (insertSettingsError) {
        toast.error(getSafeErrorMessage(insertSettingsError, 'Unable to create your settings right now.'))
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
      const seededProfile = getProfileSeedFromSignupInput(u)
      const { data, error } = await supabase.auth.signUp({
        email: u.email,
        password: u.password,
        options: {
          data: {
            full_name: seededProfile.full_name,
            current_level: seededProfile.current_level,
            target_level: seededProfile.target_level,
            team: seededProfile.team,
            manager: seededProfile.manager,
            manager_email: seededProfile.manager_email,
            skip_level: seededProfile.skip_level,
            job_title: seededProfile.job_title,
          },
        },
      })

      if (error) {
        toast.error(getSafeErrorMessage(error, 'Unable to sign up right now.'))
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
          full_name: seededProfile.full_name,
          email: u.email,
          current_level: seededProfile.current_level,
          target_level: seededProfile.target_level,
          team: seededProfile.team,
          manager: seededProfile.manager,
          manager_email: seededProfile.manager_email,
          skip_level: seededProfile.skip_level,
          avatar_url: u.avatarUrl ?? null,
          job_title: seededProfile.job_title,
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
          toast.error(getSafeErrorMessage(emailError, 'Unable to update email right now.'))
          return false
        }
      }

      // Map AuthUser patch → profiles columns
      const profilePatch: ProfileUpdate = {}
      if (patch.fullName !== undefined) profilePatch.full_name = patch.fullName
      if (patch.email !== undefined) profilePatch.email = patch.email
      if (patch.currentLevel !== undefined) {
        const unifiedCurrentLevel = patch.currentLevel.trim()
        profilePatch.current_level = unifiedCurrentLevel
        profilePatch.job_title = unifiedCurrentLevel || null
      }
      if (patch.targetLevel !== undefined) profilePatch.target_level = patch.targetLevel
      if (patch.team !== undefined) profilePatch.team = patch.team
      if (patch.manager !== undefined) profilePatch.manager = patch.manager
      if (patch.managerEmail !== undefined) profilePatch.manager_email = patch.managerEmail
      if (patch.skipLevel !== undefined) {
        profilePatch.skip_level = patch.skipLevel?.trim() ? patch.skipLevel.trim() : null
      }
      if (patch.avatarUrl !== undefined) profilePatch.avatar_url = patch.avatarUrl ?? null
      if (patch.jobTitle !== undefined && patch.currentLevel === undefined) {
        const unifiedCurrentLevel = patch.jobTitle.trim()
        profilePatch.current_level = unifiedCurrentLevel
        profilePatch.job_title = unifiedCurrentLevel || null
      }

      if (Object.keys(profilePatch).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profilePatch)
          .eq('id', authUser.id)

        if (updateError) {
          toast.error(getSafeErrorMessage(updateError, 'Unable to update profile right now.'))
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
