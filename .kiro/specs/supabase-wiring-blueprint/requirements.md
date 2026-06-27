# Requirements Document

## Introduction

This document specifies the complete wiring blueprint for replacing all in-memory mock state in
`src/routes/index.tsx` with a real Supabase backend. The Evitrace application is an engineering
competency and promotion tracking SaaS built with TanStack Start (React 19, Vite, TypeScript).
Currently every piece of state — authentication, evidence records, objectives, assessments,
feedback, inbox events, and settings — lives in React `useState` hooks seeded with hardcoded mock
data. This spec covers five phases: (1) database schema mapping, (2) authentication wiring,
(3) component-by-component data wiring, (4) extension preview wiring, and (5) future Chrome
extension extraction. No CSS, layout, or visual design is changed at any point.

## Glossary

- **Supabase_Client**: The singleton `@supabase/supabase-js` client created in `src/lib/supabase.ts`.
- **AuthContext**: The `React.createContext<AuthCtx | null>` defined in `index.tsx`, providing
  `user`, `signin`, `signup`, `signout`, and `updateUser` to all descendants.
- **AuthUser**: The TypeScript type `{ fullName, email, password, currentLevel, targetLevel, team, manager, managerEmail, skipLevel }` currently used as the in-memory user shape.
- **EvidenceRecord**: The TypeScript type for a single evidence item, keyed by `id: string`, with
  fields `date`, `source`, `category`, `competency`, `title`, `description`, `link`,
  `status: EvidenceStatus`, `matchState: EvidenceMatch`, `managerNotes`, `isArchived`,
  `archivedDate`.
- **Objective**: The TypeScript type for a SMART objective, including nested `SuccessCriterion`
  arrays under `successCriteria.learn`, `.demonstrate`, and `.share`.
- **Assessment**: The strict TypeScript type holding `AssessmentCategory[]` and
  `AssessmentQuestion[]`, with the invariant that `categoryCurrentAvg` equals the arithmetic mean
  of its questions' `currentScore` values, enforced by `withDerivedAverages()`.
- **ReviewSession**: The in-memory wizard capture type `{ id, date, period, engineer, manager, scores }` converted to/from `Assessment` via `sessionToAssessment()` and `assessmentToSession()`.
- **FeedbackItem**: The TypeScript type `{ id, date, provider, type: FeedbackType, notes, anonymous }`.
- **InboxItem**: The in-memory shape `{ id, source, icon, title, suggestion: string[], when }`.
- **RLS**: Row Level Security — Supabase/PostgreSQL policies restricting each row to its owning `user_id`.
- **TanStack_Query**: The `@tanstack/react-query` v5 library already listed in `package.json`, used for all server-state management.
- **createServerFn**: The `@tanstack/react-start` helper used in `src/lib/api/` for server-side logic.
- **VITE_SUPABASE_URL**: Public environment variable holding the Supabase project URL.
- **VITE_SUPABASE_ANON_KEY**: Public environment variable holding the Supabase anonymous key.
- **competency_frameworks**: Supabase table storing uploaded competency framework definitions.
- **user_settings**: Supabase table (or JSONB column on `profiles`) storing notification and integration toggle preferences.


## Requirements

---

## Phase 1: Database Schema Mapping

### Requirement 1: Supabase Client Singleton

**User Story:** As a developer, I want a single, reusable Supabase client instance, so that all
parts of the application share one authenticated connection and environment variables are read in
one place.

#### Acceptance Criteria

1. THE Supabase_Client SHALL be created in `src/lib/supabase.ts` using
   `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)`
   from `@supabase/supabase-js`.
2. THE Supabase_Client SHALL be exported as a named export `supabase` from `src/lib/supabase.ts`.
3. WHEN `import.meta.env.VITE_SUPABASE_URL` is `undefined` or an empty string at module
   evaluation time, THE module SHALL throw an `Error` whose `.message` contains the string
   `"VITE_SUPABASE_URL"`; the same rule applies independently to `VITE_SUPABASE_ANON_KEY`.
4. THE `src/lib/supabase.ts` module SHALL NOT import from any `.server.ts` file so that it
   remains safe to import in client-side code.
5. THE `src/lib/supabase.ts` module SHALL export a named TypeScript type `Database` (generated
   via `supabase gen types typescript --local > src/lib/database.types.ts`) and every
   `supabase.from<T>()` call-site SHALL supply `T` as a key of `Database['public']['Tables']`,
   verified at compile time by `tsc --noEmit`.

---

### Requirement 2: `profiles` Table Schema

**User Story:** As a developer, I want a `profiles` table that mirrors the `AuthUser` type, so
that user profile data persists in Postgres and is accessible via Supabase RLS-secured queries.

#### Acceptance Criteria

1. THE `profiles` table SHALL contain the columns:
   `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`,
   `full_name TEXT NOT NULL`,
   `email TEXT NOT NULL`,
   `current_level TEXT NOT NULL`,
   `target_level TEXT NOT NULL`,
   `team TEXT NOT NULL`,
   `manager TEXT NOT NULL`,
   `manager_email TEXT NOT NULL`,
   `skip_level TEXT`,
   `avatar_url TEXT`,
   `job_title TEXT`,
   `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
   `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
2. THE `profiles` table SHALL have an RLS policy `"Users can view own profile"` permitting
   `SELECT` WHERE `auth.uid() = id`.
3. THE `profiles` table SHALL have an RLS policy `"Users can update own profile"` permitting
   `UPDATE` WHERE `auth.uid() = id`.
4. WHEN a new user signs up via `supabase.auth.signUp()`, THE System SHALL insert a corresponding
   row into `profiles` within the same signup flow, mapping `AuthUser.fullName → full_name`,
   `AuthUser.currentLevel → current_level`, `AuthUser.targetLevel → target_level`,
   `AuthUser.team → team`, `AuthUser.manager → manager`,
   `AuthUser.managerEmail → manager_email`, `AuthUser.skipLevel → skip_level`.
5. THE `profiles` table SHALL have a `TRIGGER` that sets `updated_at = now()` on every `UPDATE`.


---

### Requirement 3: `user_settings` Table Schema

**User Story:** As a developer, I want a `user_settings` table that persists notification
preferences and integration toggles, so that settings survive page refreshes and are accessible
server-side.

#### Acceptance Criteria

1. THE `user_settings` table SHALL contain the columns:
   `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
   `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE`,
   `notifications JSONB NOT NULL DEFAULT '{"dailyReminder":true,"managerApprovals":true,"weeklyDigest":false,"browserPush":true}'::jsonb`,
   `integrations JSONB NOT NULL DEFAULT '{"autoCaptureEvents":true,"jira":true,"github":true,"bitbucket":false,"slack":false,"teams":false,"confluence":false,"notion":false}'::jsonb`,
   `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
   `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
2. THE `user_settings` table SHALL have an RLS policy permitting `SELECT`, `INSERT`, and `UPDATE`
   only WHERE `auth.uid() = user_id`.
3. WHEN a new user is created, THE System SHALL insert a `user_settings` row with default values
   matching the initial state of `NotificationsSettings` (booleans `a=true, b=true, c=false,
   d=true`) and `ExtensionSettings` (booleans matching the `useState` defaults in the
   `ExtensionSettings` component: `auto=true, jira=true, github=true, bitbucket=false,
   slack=false, teams=false, confluence=false, notion=false`).
4. THE `notifications` JSONB keys SHALL map directly to the toggle labels in
   `NotificationsSettings`: `dailyReminder` → state `a`, `managerApprovals` → state `b`,
   `weeklyDigest` → state `c`, `browserPush` → state `d`.
5. THE `integrations` JSONB keys SHALL map to the toggle state variables in `ExtensionSettings`:
   `autoCaptureEvents`, `jira`, `github`, `bitbucket`, `slack`, `teams`, `confluence`, `notion`.

---

### Requirement 4: `evidence` Table Schema

**User Story:** As a developer, I want an `evidence` table that persists `EvidenceRecord` objects,
so that evidence logged by the user survives page refreshes and is queryable by date, status, and
competency.

#### Acceptance Criteria

1. THE `evidence` table SHALL contain the columns:
   `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
   `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`,
   `date DATE NOT NULL`,
   `source TEXT NOT NULL`,
   `category TEXT NOT NULL`,
   `competency TEXT NOT NULL`,
   `title TEXT NOT NULL`,
   `description TEXT NOT NULL DEFAULT ''`,
   `link TEXT NOT NULL DEFAULT ''`,
   `status TEXT NOT NULL CHECK (status IN ('Pending Review','Reviewed')) DEFAULT 'Pending Review'`,
   `match_state TEXT NOT NULL CHECK (match_state IN ('Yes','No','Somewhat','Unset')) DEFAULT 'Unset'`,
   `manager_notes TEXT NOT NULL DEFAULT ''`,
   `is_archived BOOLEAN NOT NULL DEFAULT false`,
   `archived_date DATE`,
   `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
   `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
2. THE `evidence` table SHALL have RLS policies permitting `SELECT`, `INSERT`, `UPDATE`, and
   `DELETE` only WHERE `auth.uid() = user_id`.
3. THE `evidence` table SHALL have a `TRIGGER` that sets `updated_at = now()` on every `UPDATE`.
4. THE `evidence` table SHALL have an index on `(user_id, is_archived, date DESC)` to support
   the primary list query used by `EvidenceView`.
5. THE `evidence` table SHALL have an index on `(user_id, status)` to support the
   `PendingReviewCard` count query.


---

### Requirement 5: `objectives` Table Schema

**User Story:** As a developer, I want an `objectives` table that persists `Objective` objects
including nested `SuccessCriterion` arrays, so that SMART objectives and their completion criteria
are durably stored.

#### Acceptance Criteria

1. THE `objectives` table SHALL contain the columns:
   `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
   `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`,
   `title TEXT NOT NULL`,
   `competency TEXT NOT NULL`,
   `due DATE NOT NULL`,
   `status TEXT NOT NULL CHECK (status IN ('Pending Approval','In Progress','Completed')) DEFAULT 'Pending Approval'`,
   `statement TEXT`,
   `date_authored DATE`,
   `specific TEXT`,
   `measurable TEXT`,
   `achievable TEXT`,
   `relevant TEXT`,
   `timebound TEXT`,
   `links JSONB NOT NULL DEFAULT '[]'::jsonb`,
   `notes TEXT`,
   `success_criteria JSONB NOT NULL DEFAULT '{}'::jsonb`,
   `is_archived BOOLEAN NOT NULL DEFAULT false`,
   `archived_date DATE`,
   `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
   `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
2. THE `success_criteria` JSONB column SHALL store the structure
   `{ learn: SuccessCriterion[], demonstrate: SuccessCriterion[], share: SuccessCriterion[] }`
   where each `SuccessCriterion` has keys `criteria: string`, `evidence: string`,
   `attachments?: {label: string, url: string}[]`, `done?: boolean`, matching the
   `SuccessCriterion` TypeScript type in `index.tsx`.
3. THE `links` JSONB column SHALL store an array of `{label: string, url: string}` objects,
   matching the `Objective.links` field.
4. THE `objectives` table SHALL have RLS policies permitting `SELECT`, `INSERT`, `UPDATE`, and
   `DELETE` only WHERE `auth.uid() = user_id`.
5. THE `objectives` table SHALL have an index on `(user_id, is_archived, status)` to support
   Kanban-column queries.

---

### Requirement 6: `assessments`, `assessment_categories`, and `assessment_questions` Table Schemas

**User Story:** As a developer, I want normalized tables for assessments so that the `Assessment`,
`AssessmentCategory`, and `AssessmentQuestion` TypeScript types are durably stored with their
structural invariants preserved.

#### Acceptance Criteria

1. THE `assessments` table SHALL contain the columns:
   `id TEXT PRIMARY KEY`,
   `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`,
   `date_completed TIMESTAMPTZ NOT NULL`,
   `review_period TEXT NOT NULL`,
   `status TEXT NOT NULL CHECK (status IN ('Finalized','Draft','In Review')) DEFAULT 'Draft'`,
   `engineer_name TEXT NOT NULL`,
   `manager_name TEXT NOT NULL`,
   `overall_readiness_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_readiness_score BETWEEN 0 AND 100)`,
   `one_on_one_topics JSONB NOT NULL DEFAULT '[]'::jsonb`,
   `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
   `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
   THE `assessments` table SHALL have a `TRIGGER` that sets `updated_at = now()` on every `UPDATE`.
2. THE `assessment_categories` table SHALL contain:
   `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
   `assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE`,
   `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`,
   `category_id TEXT NOT NULL`,
   `category_name TEXT NOT NULL`,
   `summary TEXT NOT NULL DEFAULT ''`,
   `category_current_avg NUMERIC(3,2) NOT NULL DEFAULT 0`,
   `category_target NUMERIC(3,2) NOT NULL DEFAULT 4`,
   `sort_order INTEGER NOT NULL DEFAULT 0`,
   `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
3. THE `assessment_questions` table SHALL contain:
   `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
   `category_id UUID NOT NULL REFERENCES assessment_categories(id) ON DELETE CASCADE`,
   `assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE`,
   `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`,
   `question_id TEXT NOT NULL`,
   `question_text TEXT NOT NULL`,
   `previous_score INTEGER NOT NULL CHECK (previous_score BETWEEN 1 AND 5)`,
   `current_score INTEGER NOT NULL CHECK (current_score BETWEEN 1 AND 5)`,
   `target_score INTEGER NOT NULL DEFAULT 4 CHECK (target_score BETWEEN 1 AND 5)`,
   `justification TEXT NOT NULL DEFAULT ''`,
   `attached_evidence_ids UUID[] NOT NULL DEFAULT '{}'`,
   `sort_order INTEGER NOT NULL DEFAULT 0`,
   `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
4. ALL three assessment tables SHALL have RLS policies restricting all operations to rows WHERE
   `auth.uid() = user_id`.
5. WHEN an `Assessment` is inserted via `sessionToAssessment()` output, THE System SHALL insert
   one `assessments` row, N `assessment_categories` rows, and M `assessment_questions` rows in a
   single database transaction to preserve referential integrity; IF any part of the transaction
   fails, THE System SHALL roll back all inserts and return the Supabase error to the caller
   without partial writes. IF the same `assessments.id` already exists (`ON CONFLICT (id)`),
   THE System SHALL update the existing row and its related categories and questions via upsert
   rather than inserting a duplicate.
6. WHEN an `assessment_categories` row is inserted or updated, THE `category_current_avg` column
   SHALL be set to `ROUND(SUM(current_score) / COUNT(*), 2)` computed from the
   `assessment_questions` rows sharing the same `category_id`, applying the same arithmetic mean
   as the `withDerivedAverages()` function in `index.tsx`.


---

### Requirement 7: `feedback` Table Schema

**User Story:** As a developer, I want a `feedback` table that persists `FeedbackItem` objects, so
that 360 feedback entries survive page refreshes.

#### Acceptance Criteria

1. THE `feedback` table SHALL contain the columns:
   `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
   `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`,
   `date DATE NOT NULL`,
   `provider TEXT NOT NULL`,
   `type TEXT NOT NULL CHECK (type IN ('Manager Requested','Ad-hoc','Peer Review'))`,
   `notes TEXT NOT NULL DEFAULT ''`,
   `anonymous BOOLEAN NOT NULL DEFAULT false`,
   `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
   `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
2. THE `feedback` table SHALL have RLS policies permitting `SELECT`, `INSERT`, and `UPDATE` only
   WHERE `auth.uid() = user_id`.
3. THE `feedback` table SHALL have an index on `(user_id, date DESC)` to support the primary list
   query in `FeedbackView`.

---

### Requirement 8: `inbox_events` Table Schema

**User Story:** As a developer, I want an `inbox_events` table that persists auto-captured
integration events from the inbox, so that the `initialInbox` mock array is replaced with
real data.

#### Acceptance Criteria

1. THE `inbox_events` table SHALL contain the columns:
   `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
   `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`,
   `source TEXT NOT NULL`,
   `title TEXT NOT NULL`,
   `suggestion TEXT[] NOT NULL DEFAULT '{}'`,
   `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
2. THE `source` column SHALL contain the integration name (e.g. `'GitHub'`, `'Jira'`, `'Slack'`)
   and SHALL be used by the `SourceIcon` component to select the appropriate icon.
3. THE `inbox_events` table SHALL have RLS policies permitting `SELECT`, `INSERT`, and `DELETE`
   only WHERE `auth.uid() = user_id`.
4. WHEN a user approves an inbox event via `approveInbox()`, THE System SHALL delete the
   corresponding `inbox_events` row and insert a new `evidence` row in a single Supabase RPC
   or sequential mutation.

---

### Requirement 9: `competency_frameworks` and `competency_categories` Table Schemas

**User Story:** As a developer, I want tables that store uploaded competency framework definitions,
so that the `FrameworkSettings` upload flow persists parsed framework data beyond the current
in-memory mock.

#### Acceptance Criteria

1. THE `competency_frameworks` table SHALL contain:
   `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
   `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`,
   `name TEXT NOT NULL`,
   `version TEXT`,
   `is_active BOOLEAN NOT NULL DEFAULT true`,
   `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
   `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
2. THE `competency_categories` table SHALL contain:
   `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
   `framework_id UUID NOT NULL REFERENCES competency_frameworks(id) ON DELETE CASCADE`,
   `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`,
   `name TEXT NOT NULL`,
   `weight NUMERIC(4,2) NOT NULL DEFAULT 1`,
   `questions TEXT[] NOT NULL DEFAULT '{}'`,
   `sort_order INTEGER NOT NULL DEFAULT 0`,
   `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
3. BOTH tables SHALL have RLS policies restricting all operations to `auth.uid() = user_id`.
4. WHEN `FrameworkSettings.handleFile()` successfully parses a file, THE System SHALL call
   `supabase.from('competency_frameworks').upsert()` for the framework row and
   `supabase.from('competency_categories').upsert()` for each category.
5. THE radar chart labels derived from `categoryToRadarLabel()` and `radarLabelToCategory()`
   SHALL remain usable against `competency_categories.name` values.


---

## Phase 2: Authentication & Context Wiring

### Requirement 10: Supabase Auth — Sign-In

**User Story:** As an engineer, I want to sign in with my email and password using Supabase Auth,
so that my session is real and persists across page refreshes.

#### Acceptance Criteria

1. WHEN `SigninForm.submit()` calls `signin(email, password)`, THE AuthContext SHALL call
   `supabase.auth.signInWithPassword({ email, password })` instead of the current in-memory
   comparison.
2. WHEN `supabase.auth.signInWithPassword()` returns `{ data, error }` with `error !== null`,
   THE AuthContext `signin` function SHALL return `false` and the caller SHALL display the error
   via `toast.error()`.
3. WHEN `supabase.auth.signInWithPassword()` succeeds, THE AuthContext `signin` function SHALL
   return `true` and the `user` state SHALL be populated from `supabase.auth.getUser()` plus a
   corresponding `profiles` row lookup.
4. THE `AuthUser` shape exposed through `AuthContext.user` SHALL remain identical to the
   existing TypeScript type so no child component prop signatures change.
5. THE password field MUST NOT be stored anywhere in the `AuthUser` shape after Supabase auth
   is introduced; the `password` key SHALL be removed from `AuthUser` and replaced with an
   empty-string sentinel only where the existing `updateUser(patch, password)` signature
   currently validates it.

---

### Requirement 11: Supabase Auth — Sign-Up

**User Story:** As a new engineer, I want to register an account with my profile details, so that
my `profiles` row is created atomically with my Supabase Auth account.

#### Acceptance Criteria

1. WHEN `SignupForm.submit()` calls `signup(u: AuthUser)`, THE AuthContext SHALL call
   `supabase.auth.signUp({ email: u.email, password: u.password })` followed by an
   `INSERT INTO profiles` using the remaining `AuthUser` fields.
2. IF `supabase.auth.signUp()` returns an error (e.g. email already registered), THE AuthContext
   `signup` function SHALL surface the error text via `toast.error()` and SHALL NOT insert a
   `profiles` row.
3. WHEN signup succeeds but the Supabase project requires email confirmation, THE AuthContext
   SHALL display a confirmation message and keep `user` as `null` until the session is confirmed.
4. THE `signup` call SHALL also insert a `user_settings` row with default values as specified in
   Requirement 3, Acceptance Criterion 3.

---

### Requirement 12: Supabase Auth — Sign-Out

**User Story:** As a signed-in engineer, I want to sign out, so that my session is cleared from
both the browser and Supabase.

#### Acceptance Criteria

1. WHEN `signout()` is called, THE AuthContext SHALL call `supabase.auth.signOut()`.
2. WHEN `supabase.auth.signOut()` resolves, THE `user` state SHALL be set to `null`.
3. IF `supabase.auth.signOut()` returns an error, THE AuthContext SHALL log the error to the
   console and still set `user` to `null` locally.

---

### Requirement 13: Supabase Auth — Session Persistence Across Refreshes

**User Story:** As a signed-in engineer, I want my session to be restored automatically on page
reload, so that I do not have to re-authenticate every time.

#### Acceptance Criteria

1. WHEN the `App` component mounts, THE AuthContext SHALL call `supabase.auth.getSession()` and,
   if a session is returned, fetch the corresponding `profiles` row to hydrate the `AuthUser`
   state — before rendering either `EvitraceApp` or `AuthScreens`.
2. THE AuthContext SHALL subscribe to `supabase.auth.onAuthStateChange()` and update `user`
   state on `SIGNED_IN` (populate from the session's `profiles` row), `SIGNED_OUT` (set to
   `null`), and `TOKEN_REFRESHED` (re-fetch `profiles` row to ensure freshness) events.
3. WHILE the initial `getSession()` call is in-flight, THE AuthContext SHALL render a loading
   indicator in place of both `EvitraceApp` and `AuthScreens` — neither branch SHALL be
   rendered — so that a returning user never sees the sign-in screen flash.
4. WHEN `onAuthStateChange` fires with `SIGNED_OUT`, THE `user` state SHALL be set to `null`
   regardless of the current component tree.


---

### Requirement 14: Supabase Auth — Update User Profile

**User Story:** As a signed-in engineer, I want to update my profile fields (name, email, level,
team, manager) via `updateUser()`, so that changes are persisted to both Supabase Auth and the
`profiles` table.

#### Acceptance Criteria

1. WHEN `updateUser(patch, password)` is called with a `patch` containing `email`, THE AuthContext
   SHALL call `supabase.auth.updateUser({ email: patch.email })` to update the Auth email.
2. FOR ALL other profile fields in `patch`, THE AuthContext SHALL call
   `supabase.from('profiles').update(mappedPatch).eq('id', authUserId)`.
3. WHEN the `SecureEditDialog` or `ProfileSettings` component calls `onSave(next, password)`,
   THE AuthContext `updateUser` SHALL re-authenticate the user by calling
   `supabase.auth.signInWithPassword({ email: currentEmail, password })` to verify the password
   before applying any changes, replacing the current in-memory `pwd !== user.password` check.
4. IF the password verification fails (signInWithPassword returns error), THE `updateUser`
   function SHALL return `false` and make no changes to either Auth or `profiles`.
5. WHEN `updateUser` succeeds, THE local `user` state SHALL be updated with the patched values
   so child components re-render immediately without a full refetch.

---

### Requirement 15: Supabase Auth — SSO (Google and Microsoft)

**User Story:** As an engineer, I want to sign in with Google or Microsoft, so that I can use my
existing work identity without managing a separate password.

#### Acceptance Criteria

1. WHEN `SsoButton` with `provider="Google"` is clicked, THE System SHALL call
   `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`
   replacing the current `toast.success('Google sign-in (demo)')` stub.
2. WHEN `SsoButton` with `provider="Microsoft"` is clicked, THE System SHALL call
   `supabase.auth.signInWithOAuth({ provider: 'azure', options: { redirectTo: window.location.origin } })`
   replacing the current `toast.success('Microsoft sign-in (demo)')` stub.
3. WHEN the OAuth redirect returns and `onAuthStateChange` fires `SIGNED_IN`, THE System SHALL
   check whether a `profiles` row exists for the new user; IF NOT, THE System SHALL insert one
   with `full_name` taken from `user.user_metadata.full_name` or `user.email`.
4. THE `AuthContext` shape SHALL remain unchanged after OAuth sign-in so no child component
   prop signatures break.

---

## Phase 3: Web App Data Wiring — Component-by-Component

### Requirement 16: Dashboard — Inbox

**User Story:** As an engineer, I want my inbox to be loaded from `inbox_events`, so that
auto-captured integration events persist and survive page refreshes.

#### Acceptance Criteria

1. THE `inbox` useState initialised from `initialInbox` in `EvitraceApp` SHALL be replaced with
   a TanStack_Query `useQuery` that calls
   `supabase.from('inbox_events').select('*').eq('user_id', userId).order('created_at', { ascending: false })`.
2. WHEN `approveInbox(id, comps)` is called, THE System SHALL execute a `useMutation` that:
   (a) calls `supabase.from('evidence').insert(newEvidenceRow)`,
   (b) calls `supabase.from('inbox_events').delete().eq('id', id)`,
   and invalidates the `['inbox_events']` and `['evidence']` query keys on success.
3. THE optimistic update for `approveInbox` SHALL remove the inbox row from the local cache
   immediately and prepend the new evidence row so the UI does not wait for the round-trip.
4. WHEN the `InboxReviewSlideover` dismiss callback fires, THE System SHALL call
   `supabase.from('inbox_events').delete().eq('id', id)` and invalidate `['inbox_events']`.
5. THE `suggestion` field from `inbox_events.suggestion TEXT[]` SHALL be mapped directly to the
   `initialInbox[].suggestion: string[]` shape consumed by `InboxReviewSlideover`.


---

### Requirement 17: Dashboard — Stat Cards and Recent Evidence

**User Story:** As an engineer, I want the dashboard stat cards and recent evidence list to show
live data from Supabase, so that numbers update as I log new evidence.

#### Acceptance Criteria

1. THE `StatCard "Evidence This Quarter"` SHALL derive its count from a TanStack_Query
   `useQuery` that calls
   `supabase.from('evidence').select('id', { count: 'exact' }).eq('user_id', userId).gte('date', startOfQuarter).lte('date', endOfQuarter).eq('is_archived', false)`.
2. THE `StatCard "Current Streak"` SHALL be computed client-side from the `evidence` query
   result by counting consecutive days with at least one non-archived evidence entry, sorted
   by `date DESC`.
3. THE `PendingReviewCard` count SHALL be derived from:
   `supabase.from('evidence').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'Pending Review').eq('is_archived', false)`
   plus
   `supabase.from('objectives').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'Pending Approval').eq('is_archived', false)`.
4. THE Recent Evidence list on the Dashboard SHALL use a TanStack_Query `useQuery` that calls
   `supabase.from('evidence').select('*').eq('user_id', userId).eq('is_archived', false).order('created_at', { ascending: false }).limit(5)`.
5. THE Current Focus Areas section SHALL query
   `supabase.from('objectives').select('*').eq('user_id', userId).eq('status', 'In Progress').eq('is_archived', false)`.

---

### Requirement 18: Radar / Promotion Readiness View

**User Story:** As an engineer, I want the radar chart and gap analysis to derive from persisted
assessment data, so that `initialRadar` mock data is no longer needed.

#### Acceptance Criteria

1. THE `radarData` useState initialised from `initialRadar` in `EvitraceApp` SHALL be replaced
   with a derived value computed client-side from the most recent `assessments` row, applying the
   same `radarLabelToCategory` / `categoryToRadarLabel` mapping functions from `index.tsx`.
2. THE `assessments` useState initialised from `initialAssessments` SHALL be replaced with a
   TanStack_Query `useQuery` that fetches
   `supabase.from('assessments').select('*, assessment_categories(*, assessment_questions(*))').eq('user_id', userId).order('date_completed', { ascending: false })`.
3. THE Overall Readiness % displayed in `RadarView` SHALL use `assessments[0].overall_readiness_score`
   from the most recent assessment row.
4. THE Top Strength and Primary Gap cards SHALL be computed client-side from
   `assessments[0].assessment_categories` sorted by `category_current_avg DESC` and `ASC`
   respectively.
5. THE Hierarchical Gap Analysis table SHALL join `assessment_categories` and
   `assessment_questions` from the most recent assessment, matching the current
   `SUBCATEGORIES` rendering logic.
6. WHEN `ReviewWizard` finalizes via `onFinalize(session: ReviewSession)`, THE System SHALL
   call `sessionToAssessment(session)` then `supabase.from('assessments').insert()` the result
   (with nested category and question inserts), and invalidate the `['assessments']` query key.

---

### Requirement 19: Evidence Log View

**User Story:** As an engineer, I want the Evidence Log to load from and write to the `evidence`
table, so that my logged evidence is durable.

#### Acceptance Criteria

1. THE `evidence` useState initialised from `initialEvidence` in `EvitraceApp` SHALL be replaced
   with a TanStack_Query `useQuery` (key `['evidence', userId, { archived: false }]`) that calls
   `supabase.from('evidence').select('*').eq('user_id', userId).eq('is_archived', false).order('date', { ascending: false })`.
2. THE Archived tab SHALL use a separate `useQuery` (key `['evidence', userId, { archived: true }]`)
   that calls `supabase.from('evidence').select('*').eq('user_id', userId).eq('is_archived', true).order('date', { ascending: false })`.
3. WHEN `EvidenceSlideover.onSave(updated)` fires, THE System SHALL call a `useMutation` that:
   (a) applies an optimistic update replacing the matching item in the `['evidence', userId, { archived: false }]`
   cache before the round-trip resolves,
   (b) calls `supabase.from('evidence').update(mappedRow).eq('id', updated.id)`,
   (c) IF the mutation fails, THE System SHALL roll back the optimistic update and call
   `toast.error()` with the Supabase error message.
4. WHEN `onArchive(id)` is called from `EvidenceSlideover`, THE System SHALL call
   `supabase.from('evidence').update({ is_archived: true, archived_date: new Date().toISOString().slice(0, 10) }).eq('id', id)`
   and invalidate both `['evidence', userId, { archived: false }]` and `['evidence', userId, { archived: true }]`.
5. WHEN `onPermanentDelete(id)` is called from `EvidenceView`, THE System SHALL call
   `supabase.from('evidence').delete().eq('id', id)` and invalidate
   `['evidence', userId, { archived: true }]`.
6. WHEN `onRestore(id)` is called from `EvidenceView`, THE System SHALL call
   `supabase.from('evidence').update({ is_archived: false, archived_date: null }).eq('id', id)`
   and invalidate both `['evidence', userId, { archived: false }]` and
   `['evidence', userId, { archived: true }]`.
7. THE `EvidenceSlideover` category and competency dropdowns SHALL allow selection from
   `PDF_CATEGORIES` and `PDF_FRAMEWORK` constants (unchanged) with the selected values written
   back to `evidence.category` and `evidence.competency`.


---

### Requirement 20: Objectives View (Kanban)

**User Story:** As an engineer, I want the Objectives Kanban board to load from and write to the
`objectives` table, so that SMART objectives persist.

#### Acceptance Criteria

1. THE `objectives` useState initialised from `initialObjectives` in `EvitraceApp` SHALL be
   replaced with a TanStack_Query `useQuery` that calls
   `supabase.from('objectives').select('*').eq('user_id', userId).eq('is_archived', false)`.
2. WHEN `onMove(id, status)` is called and `status !== 'Completed'`, THE System SHALL call a
   `useMutation` with `supabase.from('objectives').update({ status }).eq('id', id)` and apply
   an optimistic update to the local cache.
3. WHEN `onMove(id, 'Completed')` or `onChangeStatus(o, 'Completed')` is called, THE System
   SHALL call `supabase.from('objectives').update({ status: 'Completed' }).eq('id', id)` AND
   `supabase.from('evidence').insert({ ...autoEvidenceRow })` in sequence, then invalidate both
   `['objectives']` and `['evidence']` query keys.
4. WHEN `CreateObjectiveModal.onSubmit(o)` fires, THE System SHALL call
   `supabase.from('objectives').insert({ ...o, user_id: userId, status: 'Pending Approval' })`
   and invalidate `['objectives']`.
5. WHEN `ObjectiveSlideover.onSave(o)` fires, THE System SHALL call
   `supabase.from('objectives').update(o).eq('id', o.id)` and invalidate `['objectives']`.
6. WHEN `onArchive(o)` fires, THE System SHALL call
   `supabase.from('objectives').update({ is_archived: true, archived_date: today }).eq('id', o.id)`
   and invalidate `['objectives']`.
7. WHEN `onDelete(o)` fires from the archived view, THE System SHALL call
   `supabase.from('objectives').delete().eq('id', o.id)` and invalidate `['objectives']`.
8. WHEN `onRestore(o)` fires, THE System SHALL call
   `supabase.from('objectives').update({ is_archived: false, archived_date: null, status: 'In Progress' }).eq('id', o.id)`
   and invalidate `['objectives']`.

---

### Requirement 21: 360 Feedback View

**User Story:** As an engineer, I want the Feedback view to load from and write to the `feedback`
table, so that feedback entries are durable.

#### Acceptance Criteria

1. THE `items` useState initialised from `initialFeedback` inside `FeedbackView` SHALL be
   replaced with a TanStack_Query `useQuery` that calls
   `supabase.from('feedback').select('*').eq('user_id', userId).order('date', { ascending: false })`.
2. WHEN `addRequest(reviewer, focus)` is called inside `FeedbackView`, THE System SHALL call a
   `useMutation` that calls `supabase.from('feedback').insert({ provider: reviewer, type: 'Manager Requested', notes: ..., anonymous: false, date: today, user_id: userId })`
   and invalidates `['feedback']`.
3. THE `FeedbackTypeBadge` and filter logic SHALL remain unchanged; they operate on the
   `FeedbackItem.type` field that maps directly to `feedback.type`.
4. THE `filter` state (`"All" | FeedbackType`) SHALL remain client-side React state and SHALL
   filter the TanStack_Query result in-memory, matching the existing `useMemo` filter pattern.

---

### Requirement 22: Reviews & Reports View

**User Story:** As an engineer, I want the Reviews & Reports view to display persisted assessment
data with 1-on-1 topics and learning resources linked to Supabase, so that review data is
durable.

#### Acceptance Criteria

1. THE `assessments` prop passed to `ReportView` SHALL come from the TanStack_Query defined in
   Requirement 18, Acceptance Criterion 2.
2. WHEN `onOpenAssessment(a)` is called inside `ReportView`, THE System SHALL call
   `assessmentToSession(a)` on the client using the locally cached assessment data; no additional
   DB round-trip is required.
3. THE `oneOnOneTopics` displayed in `ReportView` SHALL be read from
   `assessments.one_on_one_topics JSONB` (an array of strings) for the selected assessment.
4. WHEN a user edits or saves 1-on-1 topics inside `ReportView`, THE System SHALL call
   `supabase.from('assessments').update({ one_on_one_topics: updatedTopics }).eq('id', assessmentId)`
   and invalidate `['assessments']`.
5. IF a `learning_resources` feature is implemented, THE System SHALL store resources as rows in
   a `learning_resources` table with `(id, user_id, assessment_id, title, url, created_at)` and
   query them with `supabase.from('learning_resources').select('*').eq('assessment_id', id)`.


---

### Requirement 23: Review Wizard — Persist Assessment on Finalize

**User Story:** As an engineer, I want the Review Wizard to persist the finalized `ReviewSession`
as an `Assessment` in Supabase when I click Finalize, so that the new assessment appears in
Reviews & Reports and the radar chart updates.

#### Acceptance Criteria

1. WHEN `ReviewWizard.onFinalize(session: ReviewSession)` fires, THE System SHALL call
   `sessionToAssessment(session)` to produce an `Assessment` object, then persist it by calling
   `supabase.from('assessments').insert(assessmentRow)` followed by bulk inserts into
   `assessment_categories` and `assessment_questions` in a single Supabase transaction or
   sequential RPC call.
2. THE `attached_evidence_ids` field on each `assessment_questions` row SHALL be populated from
   `ReviewQuestion.evidenceIds` captured during the wizard flow.
3. WHEN the wizard insert succeeds, THE System SHALL invalidate the `['assessments']` query key
   so `RadarView` and `ReportView` both reflect the new assessment.
4. THE `setRadarData` call in `EvitraceApp.onFinalize` that manually recalculates radar values
   SHALL be removed; the radar SHALL derive from the refreshed `['assessments']` query as
   described in Requirement 18, Acceptance Criterion 1.
5. WHEN the wizard insert fails, THE System SHALL display the Supabase error message via
   `toast.error()` and keep the wizard open so the user does not lose their session data.

---

### Requirement 24: Settings View — Profile and Team Wiring

**User Story:** As an engineer, I want `ProfileSettings` and `TeamSettings` to read from and
write to the `profiles` table, so that my profile changes persist.

#### Acceptance Criteria

1. THE `ProfileSettings` component SHALL read initial field values from the `profiles` row
   fetched via `supabase.from('profiles').select('*').eq('id', userId).single()`, wrapped in a
   TanStack_Query `useQuery` with key `['profile', userId]`.
2. WHEN `ProfileSettings.saveAll()` is triggered after password confirmation, THE System SHALL
   call `supabase.from('profiles').update({ full_name, email, current_level, target_level, job_title }).eq('id', userId)`.
3. WHEN `TeamSettings.saveAll()` is triggered after password confirmation, THE System SHALL call
   `supabase.from('profiles').update({ manager, manager_email, team, skip_level }).eq('id', userId)`.
4. WHEN a profile photo is selected via the file input in `ProfileSettings`, THE System SHALL
   upload the file to the Supabase Storage bucket `avatars` using
   `supabase.storage.from('avatars').upload(userId + '/' + fileName, file, { upsert: true })`
   then update `profiles.avatar_url` with the resulting public URL.
5. WHEN profile or team updates succeed, THE System SHALL invalidate `['profile', userId]` and
   update the `AuthContext.user` state to reflect the changes immediately.

---

### Requirement 25: Settings View — Notifications and Extension Toggles

**User Story:** As an engineer, I want notification and integration toggles to be persisted in
`user_settings`, so that my preferences survive page refreshes.

#### Acceptance Criteria

1. THE `NotificationsSettings` component SHALL read its four toggle initial states (`a`, `b`,
   `c`, `d`) from
   `supabase.from('user_settings').select('notifications').eq('user_id', userId).single()`
   via a TanStack_Query with key `['user_settings', userId]`.
2. WHEN any notification toggle changes, THE System SHALL call a `useMutation` that calls
   `supabase.from('user_settings').update({ notifications: updatedJson }).eq('user_id', userId)`
   debounced by 500 ms or triggered on the existing "Save Settings" button click.
3. THE `ExtensionSettings` component SHALL read its eight toggle initial states from
   `user_settings.integrations` via the same `['user_settings', userId]` query.
4. WHEN any integration toggle changes, THE System SHALL call a `useMutation` that calls
   `supabase.from('user_settings').update({ integrations: updatedJson }).eq('user_id', userId)`.
5. THE JSONB key names SHALL map exactly to the boolean state variable names in
   `NotificationsSettings` (`dailyReminder`, `managerApprovals`, `weeklyDigest`, `browserPush`)
   and `ExtensionSettings` (`autoCaptureEvents`, `jira`, `github`, `bitbucket`, `slack`,
   `teams`, `confluence`, `notion`) as specified in Requirement 3.

---

### Requirement 26: Settings View — Competency Framework Upload

**User Story:** As an engineer, I want to upload a custom competency framework file and have it
parsed and persisted to Supabase, so that the framework outlasts the browser session.

#### Acceptance Criteria

1. WHEN `FrameworkSettings.handleFile(file)` successfully parses a `.json` or `.csv` file (not
   a `.pdf` which triggers `mismatch`), THE System SHALL call
   `supabase.from('competency_frameworks').upsert({ name: parsedName, user_id: userId, is_active: true })`
   and for each category call
   `supabase.from('competency_categories').upsert({ framework_id, user_id, name, weight, questions, sort_order })`.
2. THE `activeFramework` state in `FrameworkSettings` SHALL be derived from a TanStack_Query
   that fetches `supabase.from('competency_frameworks').select('*, competency_categories(*)').eq('user_id', userId).eq('is_active', true).single()`.
3. THE `"Download Template"` button SHALL remain a client-side download and SHALL NOT interact
   with Supabase.
4. WHEN a framework upload fails (network error or validation error from Supabase), THE System
   SHALL display the error message via `toast.error()` and set `parsing` to `false`.


---

## Phase 4: Extension Preview Wiring

### Requirement 27: ExtensionPopup — Save Evidence Mutation

**User Story:** As an engineer using the extension preview, I want the "Save Evidence" button to
persist evidence to Supabase, so that the `setEvidence` and `setRadarData` in-memory calls are
replaced with durable writes.

#### Acceptance Criteria

1. THE `ExtensionPopup` component SHALL be extracted to `src/components/ExtensionPopup.tsx`
   with no mock data props; it SHALL accept `{ onDismiss: () => void; onSave: () => void }` and
   read `userId` from `AuthContext` via `useAuth()`.
2. WHEN the "Save Evidence" button is clicked AND at least one competency pill is selected,
   THE `ExtensionPopup` SHALL call a `useMutation` that calls
   `supabase.from('evidence').insert({ user_id: userId, title: text.trim().slice(0, 200), description: text, competency: comps[0], source: sourceFromSelectedTrigger, category: 'Technical', status: 'Pending Review', match_state: 'Unset', date: new Date().toISOString().slice(0, 10), is_archived: false })`
   replacing the current `onSave()` callback that calls the in-memory `setEvidence` and
   `setRadarData`; WHERE `sourceFromSelectedTrigger` is derived by mapping the selected trigger
   option to its corresponding source string (e.g. `"Event: Ticket moved to Done"` → `"Jira"`,
   `"Event: Pull request merged"` → `"GitHub"`, time-based option → `"Manual"`).
3. WHEN the mutation succeeds, THE System SHALL invalidate the `['evidence']` query key and call
   `onSave()` to dismiss the popup.
4. IF the mutation fails, THE System SHALL call `toast.error()` with the Supabase error message
   and leave the popup open so the user does not lose their captured text.
5. THE `comps` array SHALL be initialised from the `COMPETENCIES` constant labels; if the user
   deselects all pills, THE "Save Evidence" button SHALL be disabled and a validation hint SHALL
   be shown until at least one competency is selected; the AI classification call is deferred
   to Phase 5.

---

### Requirement 28: ExtensionPopup — Trigger Dropdown from User Settings

**User Story:** As an engineer, I want the extension popup's trigger dropdown to reflect only the
integrations I have enabled in Settings, so that disabled integrations do not appear as options.

#### Acceptance Criteria

1. THE trigger dropdown in `ExtensionPopup` SHALL read the enabled integration keys from the
   `['user_settings', userId]` TanStack_Query cache (the same `integrations` JSONB loaded by
   `ExtensionSettings`).
2. WHEN `user_settings.integrations.jira === true`, THE trigger option
   `"Event: Ticket moved to Done"` SHALL appear in the dropdown.
3. WHEN `user_settings.integrations.github === true`, THE trigger option
   `"Event: Pull request merged"` SHALL appear for GitHub.
4. WHEN `user_settings.integrations.bitbucket === true`, THE trigger option
   `"Event: Bitbucket PR merged"` SHALL appear.
5. WHEN NO integrations are enabled, THE trigger dropdown SHALL show only the time-based option
   `"Time: 16:00 (1 hour before close)"` as a fallback.
6. THE `selectedSource` written to `evidence.source` on save SHALL be derived from the selected
   trigger option (e.g. trigger `"Event: Ticket moved to Done"` → `source = "Jira"`).

---

## Phase 5: Real Chrome Extension Extraction (Future)

### Requirement 29: Extension Directory and Manifest

**User Story:** As a developer, I want an `extension/` directory at the repo root with a valid
Manifest V3 `manifest.json`, so that the extension can be loaded as an unpacked extension in
Chrome.

#### Acceptance Criteria

1. THE `extension/manifest.json` SHALL declare:
   `"manifest_version": 3`,
   `"name": "Evitrace"`,
   `"version": "1.0.0"`,
   `"description": "Capture engineering evidence from your workflow tools."`,
   `"permissions": ["storage", "activeTab", "identity", "alarms"]`,
   `"host_permissions": ["https://*.atlassian.net/*", "https://github.com/*", "https://bitbucket.org/*", "https://slack.com/*"]`,
   `"background": { "service_worker": "background.js", "type": "module" }`,
   `"action": { "default_popup": "popup/popup.html", "default_icon": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" } }`,
   `"content_scripts": [{ "matches": [...], "js": ["content.js"] }]`.
2. THE `extension/icons/` directory SHALL contain `icon16.png`, `icon48.png`, and `icon128.png`
   variants of the Evitrace radar logo (the `<RadarIcon>` in Lucide style).
3. THE `extension/` directory SHALL be excluded from the main TanStack Start build via an entry
   in `vite.config.ts` or `.gitignore` rules for the extension output directory.

---

### Requirement 30: Extension Popup Bundle

**User Story:** As a developer, I want the `ExtensionPopup.tsx` component to be bundled as a
standalone Chrome extension popup, so that it runs in the extension context without TanStack
Start's SSR.

#### Acceptance Criteria

1. A `vite.extension.config.ts` SHALL be created at the repo root with:
   - `build.outDir: 'extension/dist'`
   - `build.rollupOptions.input: { popup: 'extension/popup/popup.html' }`
   - NO TanStack Start plugin (no `tanstackStart`)
   - TailwindCSS and React plugins SHALL be included
   - `build.target: 'chrome110'`
2. THE `extension/popup/popup.html` SHALL be a minimal HTML file referencing the bundled popup
   script and a `<div id="root">`.
3. THE `extension/popup/App.tsx` SHALL import `ExtensionPopup` from
   `src/components/ExtensionPopup.tsx` and render it into `#root` using `createRoot`.
4. THE popup build SHALL NOT include any TanStack Router, TanStack Start server functions,
   or Nitro imports.
5. A `"build:extension"` script SHALL be added to `package.json`:
   `"build:extension": "vite build --config vite.extension.config.ts"`.


---

### Requirement 31: Extension Auth Bridge — Shared Supabase Session

**User Story:** As an engineer, I want the Chrome extension to share the same Supabase session
as the main web app, so that I do not have to sign in separately in the extension.

#### Acceptance Criteria

1. THE background service worker SHALL on startup call `chrome.storage.local.get(['supabase_session'])`
   and IF a session is found call `supabase.auth.setSession({ access_token, refresh_token })`
   to restore the authenticated state.
2. WHEN the main web app detects `onAuthStateChange` with a new session, THE web app SHALL call
   `chrome.storage.local.set({ supabase_session: { access_token, refresh_token } })` using the
   Chrome extension's `externally_connectable` or a content script message bridge.
3. WHEN `supabase.auth.signOut()` is called in the web app, THE web app SHALL also call
   `chrome.storage.local.remove(['supabase_session'])`.
4. THE extension popup SHALL call `supabase.auth.getSession()` on mount; IF no session is
   present, THE popup SHALL display a sign-in prompt rather than the capture form.
5. THE Supabase client inside the extension SHALL use the same `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` values, injected at build time via `vite.extension.config.ts`
   `define` settings.

---

### Requirement 32: Extension Content Script — Auto-Capture

**User Story:** As a developer, I want content scripts injected into Jira, GitHub, Bitbucket,
and Slack that listen for relevant DOM events and post messages to the background worker for
auto-capture, so that the `initialInbox` mock is replaced with real event detection.

#### Acceptance Criteria

1. THE content script for Jira (`https://*.atlassian.net/*`) SHALL watch for the `issue-status`
   DOM element transitioning to `"Done"` (via `MutationObserver`) and post a message
   `{ type: 'CAPTURE_EVENT', source: 'Jira', title: issueKey + ' ' + issueSummary, suggestion: ['Delivery'] }`
   to the background service worker via `chrome.runtime.sendMessage`.
2. THE content script for GitHub (`https://github.com/*`) SHALL watch for the PR merge banner
   (`#partial-pull-merging .flash-success`) appearing and post
   `{ type: 'CAPTURE_EVENT', source: 'GitHub', title: 'PR merged: ' + prTitle, suggestion: ['Code Quality', 'Delivery'] }`.
3. THE content script for Bitbucket (`https://bitbucket.org/*`) SHALL watch for merge
   confirmation and post `{ type: 'CAPTURE_EVENT', source: 'Bitbucket', ... }`.
4. THE content script for Slack (`https://slack.com/*`) SHALL watch for messages in channels
   tagged `#wins` being bookmarked and post
   `{ type: 'CAPTURE_EVENT', source: 'Slack', title: 'Saved message: ' + preview, suggestion: ['Communication'] }`.
5. WHEN the background service worker receives a `CAPTURE_EVENT` message AND the user has a
   valid Supabase session, THE service worker SHALL call
   `supabase.from('inbox_events').insert({ user_id, source, title, suggestion })` using the
   anon key and the stored JWT.
6. EACH content script SHALL be injected only when the corresponding integration is enabled in
   `user_settings.integrations`; THE background worker SHALL check settings before injecting
   via `chrome.scripting.executeScript`.

---

### Requirement 33: Extension Background Service Worker — Daily Reminder Alarm

**User Story:** As a developer, I want the background service worker to set a daily Chrome alarm
at 16:00 that triggers a desktop notification prompting evidence capture, so that the
`NotificationsSettings.dailyReminder` toggle has a real implementation.

#### Acceptance Criteria

1. WHEN the background service worker starts AND `user_settings.notifications.dailyReminder === true`,
   THE service worker SHALL call `chrome.alarms.create('dailyReflection', { when: nextToday16h, periodInMinutes: 1440 })`.
2. WHEN the `dailyReflection` alarm fires, THE service worker SHALL call
   `chrome.notifications.create({ type: 'basic', title: 'Evitrace', message: 'Time to log today\'s evidence. What did you ship?' })`.
3. WHEN the notification is clicked, THE service worker SHALL open the extension popup via
   `chrome.action.openPopup()` or open the web app URL via `chrome.tabs.create`.
4. WHEN `user_settings.notifications.dailyReminder` is toggled to `false` in `NotificationsSettings`,
   THE web app SHALL post a message to the extension background worker (via
   `chrome.runtime.sendMessage`) to call `chrome.alarms.clear('dailyReflection')`.
5. IF the user has not yet granted notification permission, THE background worker SHALL call
   `chrome.notifications.getPermissionLevel()` and skip alarm creation if permission is `'denied'`.

