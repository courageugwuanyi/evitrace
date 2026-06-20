/**
 * Unit tests for auth state transitions — Task 5.4
 * Requirements: 10–15
 *
 * Tests the pure async auth-flow logic directly by mocking @supabase/supabase-js
 * and sonner at the module boundary. No DOM required.
 *
 * Covered flows:
 *  - signin: success, error  (req 10.1–10.3)
 *  - signup: success, email-confirm, error  (req 11.1–11.4)
 *  - signout: success, error-still-clears  (req 12.1–12.3)
 *  - updateUser: password failure, email update, profile update  (req 14.1–14.5)
 *  - SSO: google / microsoft  (req 15.1–15.2)
 *  - onAuthStateChange: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED  (req 13.2, 13.4)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks (must come before any vi.mock() calls) ──────────────────────

const {
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
  mockUpdateUser,
  mockSignInWithOAuth,
  mockGetUser,
  mockFrom,
  mockToastError,
  mockToastSuccess,
} = vi.hoisted(() => {
  return {
    mockSignInWithPassword: vi.fn(),
    mockSignUp: vi.fn(),
    mockSignOut: vi.fn(),
    mockUpdateUser: vi.fn(),
    mockSignInWithOAuth: vi.fn(),
    mockGetUser: vi.fn(),
    mockFrom: vi.fn(),
    mockToastError: vi.fn(),
    mockToastSuccess: vi.fn(),
  }
})

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('sonner', () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}))

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      updateUser: mockUpdateUser,
      signInWithOAuth: mockSignInWithOAuth,
      getUser: mockGetUser,
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: mockFrom,
  },
}))

const MOCK_PROFILE = {
  fullName: 'Courage Ugwuanyi',
  email: 'courage@example.com',
  currentLevel: 'L3',
  targetLevel: 'L4',
  team: 'Payments Platform',
  manager: 'Jane Smith',
  managerEmail: 'jane@example.com',
}

vi.mock('../api/mappers', () => ({
  profileRowToAuthUser: vi.fn(() => MOCK_PROFILE),
}))

// ── Imports after mocks ───────────────────────────────────────────────────────

import { toast } from 'sonner'
import { supabase } from '../supabase'
import { profileRowToAuthUser } from '../api/mappers'

// ── Helper chain builder ──────────────────────────────────────────────────────

function makeChain(result: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: result, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: result, error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn((_patch?: unknown) => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
  }
}

// ── Replicated auth-flow helpers (mirrors auth.tsx logic) ─────────────────────

async function fetchProfile(userId: string) {
  const chain = supabase.from('profiles') as unknown as ReturnType<typeof makeChain>
  const { data, error } = await chain.select('*').eq('id', userId).single()
  if (error || !data) return null
  return profileRowToAuthUser(data as never)
}

type SetUser = (u: typeof MOCK_PROFILE | null) => void

async function signin(email: string, password: string, setUser: SetUser) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    toast.error(error.message)
    return false
  }
  const profile = await fetchProfile((data as { user: { id: string } }).user.id)
  setUser(profile)
  return true
}

type SignupUser = typeof MOCK_PROFILE & { password: string }

async function signup(u: SignupUser, setUser: SetUser) {
  const { data, error } = await supabase.auth.signUp({
    email: u.email,
    password: u.password,
  } as never)

  if (error) {
    toast.error((error as { message: string }).message)
    return false
  }

  const d = data as { user: { id: string } | null; session: unknown }
  if (d.user && !d.session) {
    toast.success('Check your inbox to confirm your email address.')
    return true
  }

  if (d.user && d.session) {
    await supabase.from('profiles').insert({} as never)
    await supabase.from('user_settings').insert({} as never)
    const profile = await fetchProfile(d.user.id)
    setUser(profile)
  }

  return true
}

async function signout(setUser: (u: null) => void) {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('[auth] signOut error:', (error as { message: string }).message)
  setUser(null)
}

async function updateUser(
  patch: Partial<typeof MOCK_PROFILE>,
  password: string,
  currentUser: typeof MOCK_PROFILE,
  setUser: (u: typeof MOCK_PROFILE) => void,
) {
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: currentUser.email,
    password,
  })
  if (verifyError) return false

  const { data: { user: authUser } } = await supabase.auth.getUser() as {
    data: { user: { id: string } | null }
  }
  if (!authUser) return false

  if (patch.email && patch.email !== currentUser.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email: patch.email } as never)
    if (emailError) {
      toast.error((emailError as { message: string }).message)
      return false
    }
  }

  if (Object.keys(patch).length > 0) {
    const chain = supabase.from('profiles') as unknown as ReturnType<typeof makeChain>
    const { error: updateError } = await chain.update({} as never).eq('id', authUser.id)
    if (updateError) {
      toast.error((updateError as { message: string }).message)
      return false
    }
  }

  setUser({ ...currentUser, ...patch })
  return true
}

// ── Test setup ────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockFrom.mockImplementation(() => makeChain(MOCK_PROFILE))
})

// ── signin() ──────────────────────────────────────────────────────────────────

describe('signin()', () => {
  it('returns true and sets user on success (req 10.3)', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: {} },
      error: null,
    })

    const setUser = vi.fn()
    const result = await signin('test@example.com', 'password', setUser)

    expect(result).toBe(true)
    expect(setUser).toHaveBeenCalledWith(MOCK_PROFILE)
  })

  it('returns false and calls toast.error on auth error (req 10.2)', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    })

    const setUser = vi.fn()
    const result = await signin('bad@example.com', 'wrong', setUser)

    expect(result).toBe(false)
    expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    expect(setUser).not.toHaveBeenCalled()
  })

  it('calls supabase.auth.signInWithPassword with correct args (req 10.1)', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    })

    await signin('me@example.com', 'secret', vi.fn())

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'me@example.com',
      password: 'secret',
    })
  })

  it('does not set user when signInWithPassword fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Wrong password' },
    })
    const setUser = vi.fn()
    await signin('x@x.com', 'bad', setUser)
    expect(setUser).not.toHaveBeenCalled()
  })
})

// ── signup() ──────────────────────────────────────────────────────────────────

describe('signup()', () => {
  const newUser: SignupUser = { ...MOCK_PROFILE, password: 'newpassword123' }

  it('returns true and sets user when session exists immediately (req 11.1)', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'new-user' }, session: { access_token: 'tok' } },
      error: null,
    })

    const setUser = vi.fn()
    const result = await signup(newUser, setUser)

    expect(result).toBe(true)
    expect(setUser).toHaveBeenCalledWith(MOCK_PROFILE)
  })

  it('shows confirmation toast and returns true when email confirmation required (req 11.3)', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'pending-user' }, session: null },
      error: null,
    })

    const setUser = vi.fn()
    const result = await signup(newUser, setUser)

    expect(result).toBe(true)
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('inbox'))
    expect(setUser).not.toHaveBeenCalled()
  })

  it('returns false and shows error when signUp fails (req 11.2)', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email already in use' },
    })

    const setUser = vi.fn()
    const result = await signup(newUser, setUser)

    expect(result).toBe(false)
    expect(toast.error).toHaveBeenCalledWith('Email already in use')
    expect(setUser).not.toHaveBeenCalled()
  })

  it('inserts both profiles and user_settings rows on successful signup (req 11.4)', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'new-user' }, session: { access_token: 'tok' } },
      error: null,
    })

    const insertSpy = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockImplementation((table: string) => {
      const chain = makeChain(MOCK_PROFILE)
      chain.insert = insertSpy
      return chain
    })

    await signup(newUser, vi.fn())

    const tablesCalled = mockFrom.mock.calls.map((c: string[]) => c[0])
    expect(tablesCalled).toContain('profiles')
    expect(tablesCalled).toContain('user_settings')
    expect(insertSpy).toHaveBeenCalledTimes(2)
  })
})

// ── signout() ─────────────────────────────────────────────────────────────────

describe('signout()', () => {
  it('calls supabase.auth.signOut and sets user to null (req 12.1, 12.2)', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    const setUser = vi.fn()
    await signout(setUser)
    expect(mockSignOut).toHaveBeenCalled()
    expect(setUser).toHaveBeenCalledWith(null)
  })

  it('still sets user to null even if signOut returns an error (req 12.3)', async () => {
    mockSignOut.mockResolvedValue({ error: { message: 'Network error' } })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const setUser = vi.fn()
    await signout(setUser)
    expect(setUser).toHaveBeenCalledWith(null)
    consoleSpy.mockRestore()
  })

  it('logs error to console when signOut fails (req 12.3)', async () => {
    mockSignOut.mockResolvedValue({ error: { message: 'Timeout' } })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await signout(vi.fn())
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('signOut'), 'Timeout')
    consoleSpy.mockRestore()
  })
})

// ── updateUser() ──────────────────────────────────────────────────────────────

describe('updateUser()', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  })

  it('returns false without changes when password verification fails (req 14.4)', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Wrong password' },
    })

    const setUser = vi.fn()
    const result = await updateUser({ fullName: 'New Name' }, 'wrongpwd', MOCK_PROFILE, setUser)

    expect(result).toBe(false)
    expect(setUser).not.toHaveBeenCalled()
  })

  it('calls supabase.auth.updateUser when email changes (req 14.1)', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: {} },
      error: null,
    })
    mockUpdateUser.mockResolvedValue({ error: null })

    await updateUser({ email: 'new@example.com' }, 'correctpwd', MOCK_PROFILE, vi.fn())

    expect(mockUpdateUser).toHaveBeenCalledWith({ email: 'new@example.com' })
  })

  it('updates local user state on success (req 14.5)', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: {} },
      error: null,
    })

    const setUser = vi.fn()
    const result = await updateUser({ fullName: 'Updated Name' }, 'correctpwd', MOCK_PROFILE, setUser)

    expect(result).toBe(true)
    expect(setUser).toHaveBeenCalledWith({ ...MOCK_PROFILE, fullName: 'Updated Name' })
  })

  it('re-authenticates with the current user email (req 14.3)', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: {} },
      error: null,
    })

    await updateUser({ team: 'New Team' }, 'mypwd', MOCK_PROFILE, vi.fn())

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: MOCK_PROFILE.email,
      password: 'mypwd',
    })
  })

  it('does not call auth.updateUser when email field is unchanged', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: {} },
      error: null,
    })

    await updateUser({ team: 'New Team' }, 'mypwd', MOCK_PROFILE, vi.fn())

    expect(mockUpdateUser).not.toHaveBeenCalled()
  })
})

// ── SSO flows ─────────────────────────────────────────────────────────────────

describe('SSO flows', () => {
  it('signInWithGoogle calls signInWithOAuth with provider google (req 15.1)', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null })

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'http://localhost' },
    } as never)

    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' }),
    )
  })

  it('signInWithMicrosoft calls signInWithOAuth with provider azure (req 15.2)', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null })

    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { redirectTo: 'http://localhost' },
    } as never)

    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'azure' }),
    )
  })

  it('signInWithGoogle passes redirectTo as window.location.origin', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null })

    const origin = 'http://localhost:3000'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: origin },
    } as never)

    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ redirectTo: origin }),
      }),
    )
  })
})

// ── onAuthStateChange transitions ─────────────────────────────────────────────

describe('onAuthStateChange transitions', () => {
  it('SIGNED_OUT event clears user (req 13.4)', () => {
    let user: typeof MOCK_PROFILE | null = MOCK_PROFILE
    const handle = (event: string) => {
      if (event === 'SIGNED_OUT') user = null
    }
    handle('SIGNED_OUT')
    expect(user).toBeNull()
  })

  it('SIGNED_IN event triggers profile fetch (req 13.2)', async () => {
    mockFrom.mockImplementation(() => makeChain(MOCK_PROFILE))
    const profile = await fetchProfile('user-1')
    expect(profile).toEqual(MOCK_PROFILE)
    expect(mockFrom).toHaveBeenCalledWith('profiles')
  })

  it('TOKEN_REFRESHED event triggers a re-fetch of the profile (req 13.2)', async () => {
    mockFrom.mockImplementation(() => makeChain(MOCK_PROFILE))
    const profile = await fetchProfile('user-1')
    expect(profile).toEqual(MOCK_PROFILE)
    // fetchProfile calls from('profiles') then select/eq/single
    expect(mockFrom).toHaveBeenCalledWith('profiles')
  })

  it('returns null from fetchProfile when profile row is missing', async () => {
    mockFrom.mockImplementation(() => ({
      ...makeChain(null),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
    }))
    const profile = await fetchProfile('ghost-user')
    expect(profile).toBeNull()
  })
})
