# Design Document: Supabase Wiring Blueprint

## Overview

This document describes the complete technical design for replacing all in-memory mock state in
`src/routes/index.tsx` with a real Supabase backend. The goal is zero visual regression — no CSS,
layout, or component hierarchy changes — while swapping every `useState` seeded with hardcoded
data for TanStack Query hooks backed by Supabase Postgres + Auth + Storage.

The migration is additive: new files are created alongside the existing monolith, and `index.tsx`
is the last file touched. At no point is a partially-wired state shipped.

---

## Architecture

### Layered Architecture

```
Browser (React components)
  └── AuthContext  (src/lib/auth.tsx)
  │     Supabase session + profiles hydration
  │     State machine: loading | authenticated | unauthenticated
  └── TanStack Query cache  (QueryClient in src/routes/__root.tsx)
        Domain data: evidence, objectives, assessments, feedback, inbox, settings, profile
        └── Domain hooks  (src/lib/api/*.ts)
              └── Mappers  (src/lib/api/mappers.ts)
              │     DB row types ↔ UI types (snake_case ↔ camelCase)
              └── Supabase client  (src/lib/supabase.ts)
                    createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
                    └── Supabase project
                          Postgres (RLS-gated tables)
                          Supabase Auth (email/password + OAuth)
                          Supabase Storage (avatars bucket)
```

### Why TanStack Query v5

TanStack Query v5 is already installed (`@tanstack/react-query: ^5.83.0`) and the `QueryClient`
is already bootstrapped in `src/router.tsx` and exposed through `__root.tsx` via
`QueryClientProvider`. It is the right cache layer because:

- **SSR-aware**: `dehydrate`/`hydrate` patterns integrate with TanStack Start's Nitro SSR without
  any additional setup.
- **Optimistic updates**: `onMutate` / `onError` / `onSettled` lifecycle gives fine-grained
  control over the cache during write operations, replacing the current manual `setEvidence` calls.
- **Automatic invalidation**: `invalidateQueries` by key prefix means a single mutation can
  refresh all derived views (e.g. archiving evidence refreshes both the active list and dashboard
  stats).
- **Stale-while-revalidate**: `staleTime` configuration lets us serve cached data immediately
  while re-fetching in the background, keeping the app feel snappy.

### Why the Supabase Client Stays Client-Side

The Supabase anon key (`VITE_SUPABASE_ANON_KEY`) is intentionally public — it is the key used
with Row Level Security (RLS) policies, not an admin key. All data access is gated by
`auth.uid() = user_id` policies at the database level. Using `VITE_` env vars means the values
are inlined into the client bundle at build time by Vite, which is exactly the intended pattern
for public configuration. There is no server secret involved.

`createServerFn` is reserved for operations that genuinely require server-side execution:
- Signed URL generation (e.g. expiring download links for attachments)
- Webhook validation (e.g. verifying HMAC signatures from GitHub/Jira)
- Any future operation that would expose a service-role key

Standard CRUD (evidence, objectives, feedback, etc.) goes directly through the anon client with
RLS enforcement.

### No UI/CSS Changes Constraint

The architecture preserves this constraint by:
1. All hooks return the same TypeScript types that the existing components already consume
   (via mapper functions in `src/lib/api/mappers.ts`).
2. `AuthContext` function signatures (`signin`, `signup`, `signout`, `updateUser`) remain
   identical — only the implementation changes.
3. `EvitraceApp` keeps all UI state (`tab`, `sidebarCollapsed`, modals, etc.) as local
   `useState`; only server-state moves to TanStack Query.
4. The `ExtensionPopup` extraction is purely structural — props interface unchanged.

---

## Database Schema

### Entity Relationship Overview

```
auth.users (Supabase managed)
  ├── profiles           1:1  (id FK → auth.users.id)
  ├── user_settings      1:1  (user_id FK → auth.users.id)
  ├── evidence           N:1  (user_id FK → auth.users.id)
  ├── inbox_events       N:1  (user_id FK → auth.users.id)
  ├── objectives         N:1  (user_id FK → auth.users.id)
  ├── assessments        N:1  (user_id FK → auth.users.id)
  │     └── assessment_categories  N:1  (assessment_id FK → assessments.id)
  │           └── assessment_questions  N:1  (category_id FK → assessment_categories.id)
  ├── feedback           N:1  (user_id FK → auth.users.id)
  └── competency_frameworks  N:1  (user_id FK → auth.users.id)
        └── competency_categories  N:1  (framework_id FK → competency_frameworks.id)
```

### Migration Strategy

All migrations live in `supabase/migrations/` as numbered SQL files executed in order:

```
supabase/migrations/
  000_shared_functions.sql        ← set_updated_at() trigger function, created once
  001_create_profiles.sql
  002_create_user_settings.sql
  003_create_evidence.sql
  004_create_objectives.sql
  005_create_assessments.sql
  006_create_feedback.sql
  007_create_inbox_events.sql
  008_create_competency_frameworks.sql
  009_seed_dev.sql                ← dev-only seed data (guarded by IF NOT EXISTS)
```

The shared trigger function defined in `000_shared_functions.sql`:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

Every table with an `updated_at` column reuses this function rather than inlining it.

The seed file (`009_seed_dev.sql`) is guarded so it only runs when `current_database()` matches
a dev database name, preventing accidental execution in production.

### Table Specifications

#### `profiles`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `full_name` | TEXT | NOT NULL |
| `email` | TEXT | NOT NULL |
| `current_level` | TEXT | NOT NULL |
| `target_level` | TEXT | NOT NULL |
| `team` | TEXT | NOT NULL |
| `manager` | TEXT | NOT NULL |
| `manager_email` | TEXT | NOT NULL |
| `skip_level` | TEXT | nullable |
| `avatar_url` | TEXT | nullable |
| `job_title` | TEXT | nullable |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

RLS policies: `SELECT` and `UPDATE` WHERE `auth.uid() = id`.
Trigger: `set_updated_at()` on `BEFORE UPDATE`.

#### `user_settings`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL UNIQUE, FK → `auth.users(id)` ON DELETE CASCADE |
| `notifications` | JSONB | NOT NULL DEFAULT `{"dailyReminder":true,"managerApprovals":true,"weeklyDigest":false,"browserPush":true}` |
| `integrations` | JSONB | NOT NULL DEFAULT `{"autoCaptureEvents":true,"jira":true,"github":true,"bitbucket":false,"slack":false,"teams":false,"confluence":false,"notion":false}` |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

RLS policies: `SELECT`, `INSERT`, `UPDATE` WHERE `auth.uid() = user_id`.

#### `evidence`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `date` | DATE | NOT NULL |
| `source` | TEXT | NOT NULL |
| `category` | TEXT | NOT NULL |
| `competency` | TEXT | NOT NULL |
| `title` | TEXT | NOT NULL |
| `description` | TEXT | NOT NULL DEFAULT '' |
| `link` | TEXT | NOT NULL DEFAULT '' |
| `status` | TEXT | NOT NULL CHECK IN ('Pending Review','Reviewed') DEFAULT 'Pending Review' |
| `match_state` | TEXT | NOT NULL CHECK IN ('Yes','No','Somewhat','Unset') DEFAULT 'Unset' |
| `manager_notes` | TEXT | NOT NULL DEFAULT '' |
| `is_archived` | BOOLEAN | NOT NULL DEFAULT false |
| `archived_date` | DATE | nullable |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

RLS policies: `SELECT`, `INSERT`, `UPDATE`, `DELETE` WHERE `auth.uid() = user_id`.
Indexes: `(user_id, is_archived, date DESC)`, `(user_id, status)`.

#### `objectives`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `title` | TEXT | NOT NULL |
| `competency` | TEXT | NOT NULL |
| `due` | DATE | NOT NULL |
| `status` | TEXT | NOT NULL CHECK IN ('Pending Approval','In Progress','Completed') DEFAULT 'Pending Approval' |
| `statement` | TEXT | nullable |
| `date_authored` | DATE | nullable |
| `specific` | TEXT | nullable |
| `measurable` | TEXT | nullable |
| `achievable` | TEXT | nullable |
| `relevant` | TEXT | nullable |
| `timebound` | TEXT | nullable |
| `links` | JSONB | NOT NULL DEFAULT '[]' |
| `notes` | TEXT | nullable |
| `success_criteria` | JSONB | NOT NULL DEFAULT '{}' |
| `is_archived` | BOOLEAN | NOT NULL DEFAULT false |
| `archived_date` | DATE | nullable |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

RLS policies: `SELECT`, `INSERT`, `UPDATE`, `DELETE` WHERE `auth.uid() = user_id`.
Index: `(user_id, is_archived, status)`.

`success_criteria` JSONB structure:
```json
{
  "learn": [{ "criteria": "string", "evidence": "string", "attachments": [], "done": false }],
  "demonstrate": [...],
  "share": [...]
}
```

`links` JSONB structure: `[{ "label": "string", "url": "string" }]`

#### `assessments`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | TEXT | PK (e.g. "REV-2026-Q2") |
| `user_id` | UUID | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `date_completed` | TIMESTAMPTZ | NOT NULL |
| `review_period` | TEXT | NOT NULL |
| `status` | TEXT | NOT NULL CHECK IN ('Finalized','Draft','In Review') DEFAULT 'Draft' |
| `engineer_name` | TEXT | NOT NULL |
| `manager_name` | TEXT | NOT NULL |
| `overall_readiness_score` | INTEGER | NOT NULL DEFAULT 0 CHECK BETWEEN 0 AND 100 |
| `one_on_one_topics` | JSONB | NOT NULL DEFAULT '[]' |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

RLS: all operations WHERE `auth.uid() = user_id`.

#### `assessment_categories`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `assessment_id` | TEXT | NOT NULL, FK → `assessments(id)` ON DELETE CASCADE |
| `user_id` | UUID | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `category_id` | TEXT | NOT NULL |
| `category_name` | TEXT | NOT NULL |
| `summary` | TEXT | NOT NULL DEFAULT '' |
| `category_current_avg` | NUMERIC(3,2) | NOT NULL DEFAULT 0 |
| `category_target` | NUMERIC(3,2) | NOT NULL DEFAULT 4 |
| `sort_order` | INTEGER | NOT NULL DEFAULT 0 |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

RLS: all operations WHERE `auth.uid() = user_id`.

#### `assessment_questions`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `category_id` | UUID | NOT NULL, FK → `assessment_categories(id)` ON DELETE CASCADE |
| `assessment_id` | TEXT | NOT NULL, FK → `assessments(id)` ON DELETE CASCADE |
| `user_id` | UUID | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `question_id` | TEXT | NOT NULL |
| `question_text` | TEXT | NOT NULL |
| `previous_score` | INTEGER | NOT NULL CHECK BETWEEN 1 AND 5 |
| `current_score` | INTEGER | NOT NULL CHECK BETWEEN 1 AND 5 |
| `target_score` | INTEGER | NOT NULL DEFAULT 4 CHECK BETWEEN 1 AND 5 |
| `justification` | TEXT | NOT NULL DEFAULT '' |
| `attached_evidence_ids` | UUID[] | NOT NULL DEFAULT '{}' |
| `sort_order` | INTEGER | NOT NULL DEFAULT 0 |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

RLS: all operations WHERE `auth.uid() = user_id`.

#### `feedback`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `date` | DATE | NOT NULL |
| `provider` | TEXT | NOT NULL |
| `type` | TEXT | NOT NULL CHECK IN ('Manager Requested','Ad-hoc','Peer Review') |
| `notes` | TEXT | NOT NULL DEFAULT '' |
| `anonymous` | BOOLEAN | NOT NULL DEFAULT false |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

RLS: `SELECT`, `INSERT`, `UPDATE` WHERE `auth.uid() = user_id`.
Index: `(user_id, date DESC)`.

#### `inbox_events`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `source` | TEXT | NOT NULL (e.g. 'GitHub', 'Jira', 'Slack') |
| `title` | TEXT | NOT NULL |
| `suggestion` | TEXT[] | NOT NULL DEFAULT '{}' |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

RLS: `SELECT`, `INSERT`, `DELETE` WHERE `auth.uid() = user_id`.
Note: no `when` column — `created_at` is the timestamp. The `icon` field in `InboxItem` is
derived client-side from `source` via the existing `SourceIcon` component, not stored.

#### `competency_frameworks`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `name` | TEXT | NOT NULL |
| `version` | TEXT | nullable |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

#### `competency_categories`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() |
| `framework_id` | UUID | NOT NULL, FK → `competency_frameworks(id)` ON DELETE CASCADE |
| `user_id` | UUID | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `name` | TEXT | NOT NULL |
| `weight` | NUMERIC(4,2) | NOT NULL DEFAULT 1 |
| `questions` | TEXT[] | NOT NULL DEFAULT '{}' |
| `sort_order` | INTEGER | NOT NULL DEFAULT 0 |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

Both tables: RLS all operations WHERE `auth.uid() = user_id`.

---

## Components and Interfaces

### File Structure

```
src/lib/
  supabase.ts                ← Supabase client singleton + Database type export
  database.types.ts          ← Generated by `supabase gen types typescript --local`
  auth.tsx                   ← AuthContext, AuthProvider, useAuth hook
  api/
    mappers.ts               ← DB row ↔ UI type converters (pure functions)
    evidence.ts              ← useEvidenceQuery, useSaveEvidence, useArchiveEvidence,
                               useRestoreEvidence, useDeleteEvidence
    inbox.ts                 ← useInboxQuery, useApproveInbox, useDismissInbox
    objectives.ts            ← useObjectivesQuery, useCreateObjective, useMoveObjective,
                               useSaveObjective, useArchiveObjective
    assessments.ts           ← useAssessmentsQuery, useFinalizeAssessment,
                               useUpdateOneOnOneTopics
    feedback.ts              ← useFeedbackQuery, useAddFeedback
    profile.ts               ← useProfileQuery, useSaveProfile, useSaveTeam,
                               useUploadAvatar
    settings.ts              ← useSettingsQuery, useSaveNotifications,
                               useSaveIntegrations
    frameworks.ts            ← useFrameworkQuery, useUploadFramework
    dashboard.ts             ← useDashboardStats (aggregates over evidence + objectives)
src/components/
  ExtensionPopup.tsx         ← Extracted from index.tsx, deps on auth + evidence + settings hooks
```

### Supabase Client Module (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || url.trim() === '')
  throw new Error('VITE_SUPABASE_URL is not set')
if (!key || key.trim() === '')
  throw new Error('VITE_SUPABASE_ANON_KEY is not set')

export const supabase = createClient<Database>(url, key)
export type { Database }
```

Module-level guard throws immediately at bundle evaluation, catching misconfigured deployments
before any component mounts. The module does not import from any `.server.ts` file.

### AuthContext (`src/lib/auth.tsx`)

State machine with three states:

```
loading ──── getSession() resolves ──── session found ──── fetchProfile() ──── authenticated
                                    └── no session ─────────────────────────── unauthenticated

authenticated ──── SIGNED_OUT event ──── unauthenticated
unauthenticated ── SIGNED_IN event ───── fetchProfile() ── authenticated
authenticated ──── TOKEN_REFRESHED ───── fetchProfile() ── authenticated (refresh user)
```

The `AuthProvider` renders nothing (no children) while `loading` is true — this prevents both
the auth screen and the app from flashing before session is known.

**`AuthCtx` interface** (signatures unchanged from existing code):

```typescript
interface AuthCtx {
  user: AuthUser | null
  loading: boolean
  signin: (email: string, password: string) => Promise<boolean>
  signup: (u: AuthUser) => Promise<boolean>
  signout: () => Promise<void>
  updateUser: (patch: Partial<AuthUser>, password: string) => Promise<boolean>
}
```

**`AuthUser` shape** — `password` field removed, replaced with an empty-string sentinel only
where `updateUser` currently validates it:

```typescript
interface AuthUser {
  fullName: string
  email: string
  // password field removed — not stored after Supabase auth introduction
  currentLevel: string
  targetLevel: string
  team: string
  manager: string
  managerEmail: string
  skipLevel?: string
  avatarUrl?: string
  jobTitle?: string
}
```

**Sign-in flow:**
```
signin(email, pwd)
  → supabase.auth.signInWithPassword({ email, password: pwd })
  → error? → return false, toast.error(error.message)
  → success → fetchProfile(data.user.id) → setUser(profile) → return true
```

**Sign-up flow:**
```
signup(u)
  → supabase.auth.signUp({ email: u.email, password: u.password })
  → error? → toast.error(error.message) → return false
  → data.user exists but no session? → email confirmation required
    → show confirmation message → user stays null → return true (no error)
  → data.session exists → INSERT profiles row → INSERT user_settings row → setUser → return true
```

**Sign-out flow:**
```
signout()
  → supabase.auth.signOut()
  → error? → console.error (still proceed)
  → setUser(null)
```

**Update user flow:**
```
updateUser(patch, password)
  → supabase.auth.signInWithPassword({ email: currentUser.email, password })
  → error? → return false (no changes made)
  → patch.email? → supabase.auth.updateUser({ email: patch.email })
  → remaining fields → supabase.from('profiles').update(mapped).eq('id', userId)
  → success → setUser({ ...currentUser, ...patch }) → return true
```

**SSO flows:**
```
signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
signInWithOAuth({ provider: 'azure', options: { redirectTo: window.location.origin } })

On SIGNED_IN callback:
  → check if profiles row exists for user.id
  → if not → INSERT profiles with full_name from user_metadata.full_name ?? user.email
```

---

## Data Models

### Domain Hook Architecture

Each domain module exports query and mutation hooks following a consistent pattern. All hooks
accept `userId: string` (from `useAuth().user!` — only called when authenticated).

#### Query Key Conventions

```
['evidence', userId, { archived: false }]   ← active evidence list
['evidence', userId, { archived: true }]    ← archived evidence list
['inbox', userId]
['objectives', userId]
['assessments', userId]
['feedback', userId]
['profile', userId]
['user_settings', userId]
['frameworks', userId]
['dashboard', userId]                        ← aggregated stats
```

#### Cache Staleness Strategy

| Hook | staleTime | Rationale |
|------|-----------|-----------|
| `useEvidenceQuery` | 60s | Changes infrequently mid-session |
| `useInboxQuery` | 30s | Auto-capture events arrive periodically |
| `useObjectivesQuery` | 60s | User-driven changes only |
| `useAssessmentsQuery` | 5 min | Heavy fetch, rarely changes |
| `useFeedbackQuery` | 60s | Infrequent writes |
| `useProfileQuery` | 5 min | Near-static data |
| `useSettingsQuery` | 5 min | Near-static data |
| `useFrameworkQuery` | 10 min | Very rarely changes |
| `useDashboardStats` | 30s | Derived; short stale acceptable |

#### Optimistic Update Pattern (Evidence)

Used in `useSaveEvidence` and `useMoveObjective`:

```typescript
// 1. onMutate: snapshot current cache, apply optimistic update
const previousData = queryClient.getQueryData(queryKey)
queryClient.setQueryData(queryKey, (old) => applyUpdate(old, variables))

// 2. onError: roll back to snapshot
queryClient.setQueryData(queryKey, previousData)
toast.error(error.message)

// 3. onSettled: always re-fetch to sync with server
queryClient.invalidateQueries({ queryKey })
```

#### Invalidation Dependencies

| Mutation | Invalidates |
|----------|-------------|
| `useSaveEvidence` | `['evidence', userId, *]` |
| `useArchiveEvidence` | `['evidence', userId, { archived: false }]`, `['evidence', userId, { archived: true }]`, `['dashboard', userId]` |
| `useRestoreEvidence` | same as archive |
| `useDeleteEvidence` | `['evidence', userId, { archived: true }]` |
| `useApproveInbox` | `['inbox', userId]`, `['evidence', userId, *]`, `['dashboard', userId]` |
| `useDismissInbox` | `['inbox', userId]` |
| `useMoveObjective` (→Completed) | `['objectives', userId]`, `['evidence', userId, *]`, `['dashboard', userId]` |
| `useMoveObjective` (other) | `['objectives', userId]` |
| `useCreateObjective` | `['objectives', userId]`, `['dashboard', userId]` |
| `useSaveObjective` | `['objectives', userId]` |
| `useArchiveObjective` | `['objectives', userId]`, `['dashboard', userId]` |
| `useFinalizeAssessment` | `['assessments', userId]` |
| `useUpdateOneOnOneTopics` | `['assessments', userId]` |
| `useAddFeedback` | `['feedback', userId]` |
| `useSaveProfile` | `['profile', userId]` |
| `useSaveTeam` | `['profile', userId]` |
| `useUploadAvatar` | `['profile', userId]` |
| `useSaveNotifications` | `['user_settings', userId]` |
| `useSaveIntegrations` | `['user_settings', userId]` |
| `useUploadFramework` | `['frameworks', userId]` |

#### Cross-Entity Side Effect: Objective Completion → Evidence

The `useMoveObjective` mutation's `onSuccess` callback sequences two writes when
`newStatus === 'Completed'`:

```typescript
// Inside useMoveObjective mutation handler
async ({ id, status, objective }) => {
  await supabase.from('objectives').update({ status }).eq('id', id)
  if (status === 'Completed') {
    await supabase.from('evidence').insert({
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
  }
}
// onSuccess: invalidate ['objectives', userId] and ['evidence', userId, *]
```

#### `useDashboardStats` Implementation

Aggregates from cached queries rather than making additional DB calls:

```typescript
function useDashboardStats(userId: string) {
  const evidenceQuery = useEvidenceQuery(userId)  // reads from cache
  const objectivesQuery = useObjectivesQuery(userId)

  return useMemo(() => {
    const evidence = evidenceQuery.data ?? []
    const objectives = objectivesQuery.data ?? []
    const now = new Date()
    const qStart = startOfQuarter(now)
    const qEnd = endOfQuarter(now)

    const evidenceThisQuarter = evidence.filter(e =>
      !e.isArchived && e.date >= qStart && e.date <= qEnd
    ).length

    const streak = computeStreak(evidence)   // consecutive days from today

    const pendingReviewCount =
      evidence.filter(e => !e.isArchived && e.status === 'Pending Review').length +
      objectives.filter(o => !o.isArchived && o.status === 'Pending Approval').length

    const recentEvidence = evidence
      .filter(e => !e.isArchived)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)

    const focusAreas = objectives.filter(o =>
      !o.isArchived && o.status === 'In Progress'
    )

    return { evidenceThisQuarter, streak, pendingReviewCount, recentEvidence, focusAreas }
  }, [evidenceQuery.data, objectivesQuery.data])
}
```

`computeStreak` is a pure function that, given a sorted list of evidence records, counts
consecutive calendar days from today backwards that each have at least one entry.

---

### Type Mapping Layer (`src/lib/api/mappers.ts`)

All mapper functions are pure (no side effects, no async). They translate between the database
snake_case row types (from `Database['public']['Tables'][T]['Row']`) and the camelCase UI types
currently defined in `index.tsx`.

#### DB Row Type Aliases

```typescript
type ProfileRow = Database['public']['Tables']['profiles']['Row']
type EvidenceRow = Database['public']['Tables']['evidence']['Row']
type ObjectiveRow = Database['public']['Tables']['objectives']['Row']
type AssessmentRow = Database['public']['Tables']['assessments']['Row']
type CategoryRow = Database['public']['Tables']['assessment_categories']['Row']
type QuestionRow = Database['public']['Tables']['assessment_questions']['Row']
type FeedbackRow = Database['public']['Tables']['feedback']['Row']
type InboxRow = Database['public']['Tables']['inbox_events']['Row']
type SettingsRow = Database['public']['Tables']['user_settings']['Row']
type FrameworkRow = Database['public']['Tables']['competency_frameworks']['Row']
type FrameworkCategoryRow = Database['public']['Tables']['competency_categories']['Row']
```

#### Forward Mappers (DB → UI)

```typescript
// profiles → AuthUser
function profileRowToAuthUser(row: ProfileRow): AuthUser

// evidence → EvidenceRecord
// date: DATE string stays as-is; UI formats it with date-fns
// snake_case fields → camelCase
function evidenceRowToRecord(row: EvidenceRow): EvidenceRecord

// objectives → Objective
// success_criteria JSONB → parsed SuccessCriterion arrays
// links JSONB → parsed { label, url }[] array
function objectiveRowToObjective(row: ObjectiveRow): Objective

// assessments + nested categories + questions → Assessment
// Applies withDerivedAverages() after mapping to enforce the avg invariant
function assessmentRowsToAssessment(
  assessment: AssessmentRow,
  categories: CategoryRow[],
  questions: QuestionRow[]
): Assessment

// feedback → FeedbackItem
function feedbackRowToItem(row: FeedbackRow): FeedbackItem

// inbox_events → InboxItem
// icon field is NOT stored; it is derived from source via SourceIcon mapping
// when field is derived from created_at formatted as relative time or date string
function inboxRowToItem(row: InboxRow): InboxItem

// user_settings → NotificationsSettings + IntegrationSettings shapes
function settingsRowToSettings(row: SettingsRow): { notifications: NotificationPrefs; integrations: IntegrationPrefs }
```

#### Inverse Mappers (UI → DB insert/update types)

```typescript
type EvidenceInsert = Database['public']['Tables']['evidence']['Insert']
type ObjectiveInsert = Database['public']['Tables']['objectives']['Insert']
type AssessmentInsert = Database['public']['Tables']['assessments']['Insert']
type CategoryInsert = Database['public']['Tables']['assessment_categories']['Insert']
type QuestionInsert = Database['public']['Tables']['assessment_questions']['Insert']

function evidenceRecordToRow(r: EvidenceRecord, userId: string): EvidenceInsert
// date stays as DATE string; camelCase → snake_case

function objectiveToRow(o: Objective, userId: string): ObjectiveInsert
// success_criteria and links serialized back to JSONB-compatible objects

function assessmentToRows(
  a: Assessment,
  userId: string
): {
  assessment: AssessmentInsert
  categories: CategoryInsert[]
  questions: QuestionInsert[]
}
// Flattens the nested Assessment structure into three parallel arrays for bulk insert
// category_current_avg computed from questions before insert
```

#### Key Mapping Notes

- `EvidenceRecord.date` is a `string` in `YYYY-MM-DD` format both in the DB and in the UI — no
  conversion needed. The UI already formats it for display using `date-fns`.
- `InboxItem.icon` is `React.ReactNode` derived by `SourceIcon({ source })` — never stored.
- `InboxItem.when` is derived from `inbox_events.created_at` using a relative formatter (e.g.
  `formatDistanceToNow`).
- `Assessment.categories[].questions` is flattened from the three-table join in the query; the
  `assessmentRowsToAssessment` mapper reconstructs the nested shape.
- `Objective.successCriteria` JSONB is parsed with `JSON.parse` inside the mapper; on insert the
  mapper serializes it back with type-safe casting.

---

## EvitraceApp State Refactor

### `useState` Calls: Removed vs Kept

**Removed (replaced by TanStack Query):**

```typescript
// BEFORE — all seeded with mock data
const [evidence, setEvidence] = useState<EvidenceRecord[]>(initialEvidence)
const [inbox, setInbox] = useState<InboxItem[]>(initialInbox)
const [objectives, setObjectives] = useState<Objective[]>(initialObjectives)
const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments)
const [radarData, setRadarData] = useState(initialRadar)
```

**AFTER — replaced by hooks:**

```typescript
const { data: evidence = [] } = useEvidenceQuery(userId)
const { data: archivedEvidence = [] } = useEvidenceQuery(userId, { archived: true })
const { data: inbox = [] } = useInboxQuery(userId)
const { data: objectives = [] } = useObjectivesQuery(userId)
const { data: assessments = [] } = useAssessmentsQuery(userId)
const radarData = useMemo(() => deriveRadarData(assessments[0]), [assessments])
```

**Kept (pure UI state, no changes):**

```typescript
const [tab, setTab] = useState<Tab>('dashboard')
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
const [showExtension, setShowExtension] = useState(false)
const [showCapture, setShowCapture] = useState(false)
const [showCreateObjective, setShowCreateObjective] = useState(false)
const [openObjective, setOpenObjective] = useState<Objective | null>(null)
const [openEvidence, setOpenEvidence] = useState<EvidenceRecord | null>(null)
const [openInbox, setOpenInbox] = useState<InboxItem | null>(null)
const [showWizard, setShowWizard] = useState(false)
const [showHistory, setShowHistory] = useState(false)
const [review, setReview] = useState<ReviewSession | null>(null)
const [toast, setToast] = useState<...)>(null)  // local flash message (if kept)
```

### Mock Data Constants Removed

After wiring is complete, the following top-level constants can be removed from `index.tsx`:
`initialEvidence`, `initialInbox`, `initialObjectives`, `initialAssessments`, `initialRadar`,
`initialFeedback` (inside `FeedbackView`).

The `withDerivedAverages`, `sessionToAssessment`, `assessmentToSession`, `buildHistorical`
functions move to `src/lib/api/mappers.ts` since they are pure data-conversion utilities.

---

## ExtensionPopup Component Extraction

### Target File: `src/components/ExtensionPopup.tsx`

**Props interface (unchanged):**

```typescript
interface ExtensionPopupProps {
  onDismiss: () => void
  onSave: () => void
}
```

**Internal dependencies to extract alongside it:**
- `Pill` component
- `Badge` component
- `Textarea` primitive
- `COMPETENCIES` constant
- `COMPETENCY_DESC` constant
- `SourceIcon` component (or imported from a shared location)

**New internal behavior:**
- Reads `userId` from `useAuth()` hook (no prop drilling)
- Reads integration settings from `useSettingsQuery(userId)` to derive trigger dropdown options
- Save button calls `useSaveEvidence` mutation directly
- Trigger dropdown options derived from `settings.integrations` (not hardcoded):

```typescript
function buildTriggerOptions(integrations: IntegrationPrefs): string[] {
  const options: string[] = []
  if (integrations.jira)       options.push('Event: Ticket moved to Done')
  if (integrations.github)     options.push('Event: Pull request merged')
  if (integrations.bitbucket)  options.push('Event: Bitbucket PR merged')
  // time-based is always present as fallback
  options.push('Time: 16:00 (1 hour before close)')
  return options
}
```

**Source derivation from trigger:**

```typescript
function sourceFromTrigger(trigger: string): string {
  if (trigger.includes('Ticket'))    return 'Jira'
  if (trigger.includes('Pull request')) return 'GitHub'
  if (trigger.includes('Bitbucket')) return 'Bitbucket'
  return 'Manual'
}
```

**Save validation:** Save button is disabled when `comps.length === 0`. A hint text
`"Select at least one competency"` is shown below the pills when the user has deselected all.

**On save success:** `useSaveEvidence` mutation's `onSuccess` calls `onSave()` to dismiss popup.
**On save failure:** `toast.error(supabaseError.message)`, popup stays open.

---

## Migration Execution Plan

The following order respects all dependency relationships. Each step produces a shippable
artefact with no broken imports.

| Step | File(s) | Depends On |
|------|---------|------------|
| 1 | `supabase/migrations/000–009.sql` | Nothing (run against Supabase project) |
| 2 | `src/lib/database.types.ts` | Step 1 (generated via `supabase gen types`) |
| 3 | `src/lib/supabase.ts` | Step 2 |
| 4 | `src/lib/api/mappers.ts` | Step 2 |
| 5 | `src/lib/auth.tsx` | Steps 3, 4 |
| 6 | `src/lib/api/evidence.ts` | Steps 3, 4 |
| 7 | `src/lib/api/inbox.ts` | Steps 3, 4 |
| 7 | `src/lib/api/objectives.ts` | Steps 3, 4, 6 (cross-invalidation) |
| 7 | `src/lib/api/assessments.ts` | Steps 3, 4 |
| 7 | `src/lib/api/feedback.ts` | Steps 3, 4 |
| 7 | `src/lib/api/profile.ts` | Steps 3, 4, 5 |
| 7 | `src/lib/api/settings.ts` | Steps 3, 4 |
| 7 | `src/lib/api/frameworks.ts` | Steps 3, 4 |
| 7 | `src/lib/api/dashboard.ts` | Steps 6, 7 (objectives) |
| 8 | `src/components/ExtensionPopup.tsx` | Steps 5, 6, 7 (settings) |
| 9 | `src/routes/index.tsx` | All previous steps |

Step 9 (touching `index.tsx`) is the final step. The strategy is to import the new hooks and
contexts at the top of `index.tsx`, wire them in place of `useState` calls, and remove mock data
constants. The file shrinks by several thousand lines as mock data and inline AuthContext
implementation are removed.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of
a system — essentially, a formal statement about what the system should do. Properties serve as
the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The following properties are derived from the acceptance criteria. Property-based testing is
applied only to the pure logic layers (mappers, client-side computations, mutation callbacks)
where input variation genuinely reveals bugs. Infrastructure checks (schema, RLS, migrations)
use integration tests with representative examples.

Library: **fast-check** (works with vitest, no separate runner needed).

### Property 1: Assessment Average Invariant

*For any* `Assessment` object produced by `sessionToAssessment()` or `assessmentRowsToAssessment()`,
every `AssessmentCategory`'s `categoryCurrentAvg` SHALL equal the arithmetic mean of its
questions' `currentScore` values, rounded to 2 decimal places — the same invariant enforced by
`withDerivedAverages()`.

**Validates: Requirements 6.6, 23.1**

### Property 2: Objective Completion Always Creates Exactly One Evidence Row

*For any* objective with any `competency` value, when `useMoveObjective` is called with
`status = 'Completed'`, exactly one `evidence` insert is made with `category = 'Objective'`
and `competency` equal to `objective.competency` — never zero inserts, never two.

**Validates: Requirements 20.3**

### Property 3: Inbox Approve Removes Inbox Row and Creates Evidence Row

*For any* `inbox_events` row, calling `approveInbox(id, comps)` results in: (a) zero rows with
that `id` in `inbox_events`, and (b) exactly one new `evidence` row whose `source` and `title`
match the inbox event's fields.

**Validates: Requirements 8.4, 16.2**

### Property 4: Evidence Optimistic Update Consistency

*For any* `EvidenceRecord` update, after `useSaveEvidence` fires `onMutate`, the TanStack Query
cache for `['evidence', userId, { archived: false }]` contains the updated record — before the
network response resolves. If `onError` fires, the cache is restored to its pre-mutation snapshot.

**Validates: Requirements 19.3**

### Property 5: Streak Computation Correctness

*For any* list of `EvidenceRecord` objects (arbitrarily ordered, with random dates, with
possible duplicate dates), `computeStreak(evidence)` returns the count of consecutive calendar
days from today backwards where at least one non-archived evidence entry exists — equal to the
result of the naïve reference implementation that iterates day-by-day.

**Validates: Requirements 17.2**

### Property 6: Feedback Filter Correctness

*For any* array of `FeedbackItem` objects containing mixed `type` values, and *for any* valid
filter value (`'All' | 'Manager Requested' | 'Ad-hoc' | 'Peer Review'`), the filtered result
contains exactly the items that satisfy the filter predicate — no more, no fewer.

**Validates: Requirements 21.4**

### Property 7: assessmentToSession / sessionToAssessment Round Trip

*For any* `Assessment` object (with random scores, category names, question texts), calling
`sessionToAssessment(assessmentToSession(a))` produces an `Assessment` whose categories and
questions match the original — i.e. the round-trip through the wizard session shape is lossless
for data-carrying fields (`currentScore`, `previousScore`, `justification`, `questionText`).

**Validates: Requirements 22.2**

### Property 8: ExtensionPopup Trigger Options Match Enabled Integrations

*For any* `IntegrationPrefs` object (arbitrary combination of boolean flags), the list of
trigger options returned by `buildTriggerOptions(integrations)` contains exactly one entry per
enabled integration (plus the time-based fallback) — and no entries for disabled integrations.

**Validates: Requirements 28.1, 28.2, 28.3, 28.4, 28.5**

### Redundancy Analysis

After reviewing all eight properties:

- Properties 2 and 3 both test "mutation produces expected side-effect rows" but against different
  tables and triggers (objective completion vs inbox approval) — they are not redundant; both are
  kept.
- Properties 1 and 7 both involve the `Assessment` type but test different invariants (average
  calculation vs round-trip losslessness) — kept separate.
- Properties 4 and 5 test orthogonal concerns (cache mutation vs pure computation) — kept.
- No redundancy found; all eight properties provide unique validation value.

---

## Error Handling

### Supabase Error Propagation Pattern

All domain hooks follow a uniform error handling contract:

1. **Query errors**: TanStack Query surfaces them via `query.error`. The component renders a
   fallback state (empty list, skeleton, or retry button) without crashing.
2. **Mutation errors**: Handled in the `onError` callback. Optimistic updates are rolled back.
   `toast.error(error.message)` is called with the Supabase error message.
3. **Auth errors**: `signin`, `signup`, `updateUser` return `false` and call `toast.error`.
   The component stays on the current screen so the user can retry.
4. **Partial writes**: The assessment finalization (one assessments row + N categories + M
   questions) uses sequential inserts. If categories or questions inserts fail after the
   assessment row succeeds, `toast.error` is shown and the wizard stays open. The orphaned
   assessment row will be caught by the upsert logic on retry (ON CONFLICT on `assessments.id`
   updates rather than re-inserting).

### Environment Variable Guard

The guard in `src/lib/supabase.ts` (throwing at module evaluation) means a
misconfigured deployment fails loudly at bundle load time rather than silently at runtime.
The error message includes the variable name so it is immediately actionable.

### RLS Denial Handling

When Supabase returns `{ error: { code: 'PGRST301' } }` (RLS policy violation), the mutation
hook treats it as an error and surfaces `"Permission denied"` via `toast.error`. This should not
occur in normal operation since all queries are keyed by `userId = auth.uid()`.

### Loading State Strategy

- All queries show a skeleton/loading state while `isLoading` is true.
- `useEvidenceQuery` and `useObjectivesQuery` are prefetched on route mount so lists are
  available immediately for most sessions.
- The AuthContext loading state (initial `getSession()` check) blocks both `EvitraceApp` and
  `AuthScreens` from rendering — a minimal centered spinner is shown instead.

---

## Testing Strategy

### Dual Testing Approach

**Unit tests** (vitest): Pure functions, mapper correctness, hook logic with mocked Supabase.

**Property-based tests** (fast-check + vitest): The eight properties defined above. Each runs
a minimum of 100 iterations. Each test is tagged with the property it validates.

**Integration tests**: Schema verification, RLS policy checks, end-to-end auth flows. Run
against a local Supabase instance (`supabase start`) in CI.

### Unit Test Focus Areas

- `mappers.ts`: Each mapper function with representative DB rows and edge cases (null fields,
  empty JSONB arrays, date edge cases).
- `auth.tsx`: Mocked `supabase.auth.*` calls verify state transitions for sign-in, sign-up,
  sign-out, and session refresh.
- `computeStreak`: Edge cases — empty list, single entry, gap in the middle, all today.
- `withDerivedAverages`: Empty questions, single question, all same score.
- `buildTriggerOptions`: All integrations on, all off, mixed.

### Property Test Configuration

All property tests use `fast-check` with `fc.assert(fc.property(...), { numRuns: 100 })`.
Each test carries a tag comment:

```typescript
// Feature: supabase-wiring-blueprint, Property 1: Assessment Average Invariant
```

### Integration Test Setup

```bash
supabase start          # starts local Postgres + Auth
supabase db reset       # applies all migrations in supabase/migrations/
```

Integration tests verify:
- All tables exist with correct column types (query `information_schema.columns`)
- RLS policies are enabled and correctly block cross-user access
- The `set_updated_at()` trigger fires on UPDATE
- The assessment transaction: inserting an assessment + categories + questions in sequence
  produces a consistent state

### What Is Not Tested With PBT

- SQL schema and RLS policies — integration tests only
- `supabase.auth.*` flows — example-based unit tests with mocks
- UI rendering — no change (visual tests out of scope per "no CSS changes" constraint)
- OAuth redirect flows — cannot be automated without a browser
- Chrome extension manifest and content scripts (Phase 5) — file existence checks only

---

## Environment and Deployment Notes

### Environment Variables

```bash
# .env.local (gitignored)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Both variables use the `VITE_` prefix, which Vite inlines into the client bundle at build time.
The anon key is safe for client-side use — it only unlocks rows that RLS policies permit for
the authenticated user.

No server-side Supabase service key is needed for the current phases. All access goes through
the anon key + RLS. If a service key is ever needed (e.g. admin operations), it belongs in
`src/lib/config.server.ts` and is consumed only inside `createServerFn` handlers.

### Supabase Storage

The `avatars` storage bucket is configured with:
- **Public read**: avatar URLs are embedded in `<img>` tags
- **Owner write**: RLS policy on `storage.objects` restricts uploads to
  `auth.uid()::text = (storage.foldername(name))[1]` (the `userId/` prefix)

Upload path pattern: `avatars/{userId}/{fileName}`

### Phase 5 Extension Build

The Chrome extension build (`vite.extension.config.ts`) needs the same two env vars injected
via Vite's `define` block since `import.meta.env` is not available in service workers:

```typescript
define: {
  'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
  'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
}
```

### Local Development Workflow

```bash
# Terminal 1: Supabase local stack
supabase start

# Terminal 2: Vite dev server
bun run dev

# Apply new migrations
supabase db push

# Regenerate types after schema changes
supabase gen types typescript --local > src/lib/database.types.ts
```

### CI Checklist

1. `bun run lint` — ESLint passes
2. `tsc --noEmit` — TypeScript strict mode passes (validates all `supabase.from<T>()` calls)
3. `supabase db reset && vitest run` — all unit + property + integration tests pass
