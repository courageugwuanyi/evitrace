# Implementation Plan: Supabase Wiring Blueprint

## Overview

Replace all in-memory mock state in `src/routes/index.tsx` with a real Supabase backend across five phases: database schema migrations, authentication wiring, component-by-component data wiring, extension preview wiring, and future Chrome extension extraction. The migration is additive — new files are created alongside the existing monolith, and `index.tsx` is touched last. No CSS, layout, or visual design changes at any point.

## Tasks

- [x] 1. Install dependencies and bootstrap environment
  - [x] 1.1 Install @supabase/supabase-js and set up environment variables
    - Run `bun add @supabase/supabase-js`
    - Create `.env.local` with placeholder entries for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
    - Add `.env.local` to `.gitignore` if not already present
    - _Requirements: 1.1, 1.2_
  - [ ]* 1.2 Write unit test for environment variable guard
    - Verify `src/lib/supabase.ts` throws `Error` containing `"VITE_SUPABASE_URL"` when URL is missing
    - Verify same for `VITE_SUPABASE_ANON_KEY`
    - _Requirements: 1.3_

- [x] 2. Create SQL migration files (Phase 1 — Database Schema)
  - [x] 2.1 Create shared trigger function migration
    - Create `supabase/migrations/000_shared_functions.sql`
    - Define `CREATE OR REPLACE FUNCTION set_updated_at()` that sets `NEW.updated_at = now()` and returns `NEW`
    - _Requirements: 2.5, 3, 4, 5, 6, 7, 9_
  - [x] 2.2 Create profiles table migration
    - Create `supabase/migrations/001_create_profiles.sql`
    - Define `profiles` table with all columns per Requirement 2.1
    - Enable RLS; add `SELECT`, `UPDATE`, `INSERT` policies WHERE `auth.uid() = id`
    - Attach `set_updated_at()` trigger on `BEFORE UPDATE`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 2.3 Create user_settings table migration
    - Create `supabase/migrations/002_create_user_settings.sql`
    - Define `user_settings` with `notifications` and `integrations` JSONB columns with correct defaults
    - Enable RLS; add `SELECT`, `INSERT`, `UPDATE` policies WHERE `auth.uid() = user_id`
    - Attach `set_updated_at()` trigger on `BEFORE UPDATE`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 2.4 Create evidence table migration
    - Create `supabase/migrations/003_create_evidence.sql`
    - Define `evidence` table with `status` and `match_state` CHECK constraints
    - Enable RLS; add full CRUD policies WHERE `auth.uid() = user_id`
    - Create composite indexes on `(user_id, is_archived, date DESC)` and `(user_id, status)`
    - Attach `set_updated_at()` trigger on `BEFORE UPDATE`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 2.5 Create objectives table migration
    - Create `supabase/migrations/004_create_objectives.sql`
    - Define `objectives` table with `status` CHECK, `links JSONB DEFAULT '[]'`, `success_criteria JSONB DEFAULT '{}'`
    - Enable RLS; add full CRUD policies WHERE `auth.uid() = user_id`
    - Create composite index on `(user_id, is_archived, status)`
    - Attach `set_updated_at()` trigger on `BEFORE UPDATE`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 2.6 Create assessments, assessment_categories, and assessment_questions migrations
    - Create `supabase/migrations/005_create_assessments.sql`
    - Define `assessments` with `id TEXT PRIMARY KEY` and `overall_readiness_score` CHECK
    - Define `assessment_categories` with `category_current_avg NUMERIC(3,2)` and FK to `assessments`
    - Define `assessment_questions` with score range CHECKs and FK to both `assessment_categories` and `assessments`
    - Enable RLS on all three tables WHERE `auth.uid() = user_id`
    - Attach `set_updated_at()` trigger on `assessments` `BEFORE UPDATE`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [x] 2.7 Create feedback table migration
    - Create `supabase/migrations/006_create_feedback.sql`
    - Define `feedback` table with `type` CHECK constraint
    - Enable RLS; add `SELECT`, `INSERT`, `UPDATE` policies WHERE `auth.uid() = user_id`
    - Create index on `(user_id, date DESC)`
    - Attach `set_updated_at()` trigger on `BEFORE UPDATE`
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 2.8 Create inbox_events table migration
    - Create `supabase/migrations/007_create_inbox_events.sql`
    - Define `inbox_events` with `suggestion TEXT[] NOT NULL DEFAULT '{}'`
    - Enable RLS; add `SELECT`, `INSERT`, `DELETE` policies WHERE `auth.uid() = user_id`
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 2.9 Create competency_frameworks and competency_categories migrations
    - Create `supabase/migrations/008_create_competency_frameworks.sql`
    - Define `competency_frameworks` with `is_active BOOLEAN NOT NULL DEFAULT true`
    - Define `competency_categories` with `framework_id` FK, `questions TEXT[]`, `weight NUMERIC(4,2)`
    - Enable RLS on both tables WHERE `auth.uid() = user_id`
    - Attach `set_updated_at()` trigger on `competency_frameworks` `BEFORE UPDATE`
    - _Requirements: 9.1, 9.2, 9.3_
  - [x] 2.10 Create dev seed data migration
    - Create `supabase/migrations/009_seed_dev.sql`
    - Guard with `IF current_database() NOT LIKE '%prod%'`
    - Seed one dev user profile matching current mock (`Courage Ugwuanyi`, L3→L4, Payments Platform)
    - Seed 5 evidence rows, 5 objectives rows, 3 assessments (REV-2026-Q2, Q1, REV-2025-Q4) with nested categories and questions
    - Seed 3 inbox_events rows and 2+ feedback rows
    - _Requirements: 1–9_

- [x] 3. Bootstrap Supabase client and TypeScript types
  - [x] 3.1 Generate TypeScript database types
    - Run `supabase gen types typescript --local > src/lib/database.types.ts` after applying all migrations
    - Verify exported `Database` type has `public.Tables` keys for all 10 tables
    - Commit `database.types.ts` to version control
    - _Requirements: 1.5_
  - [x] 3.2 Create Supabase client singleton
    - Create `src/lib/supabase.ts`
    - Read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at module evaluation time
    - Throw `new Error('VITE_SUPABASE_URL is not set')` when URL is undefined or empty; same for anon key
    - Export `supabase = createClient<Database>(url, key)` and re-export `Database` type
    - Do NOT import from any `.server.ts` file
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Create type mapper utilities
  - [x] 4.1 Implement all mapper functions in src/lib/api/mappers.ts
    - Create `src/lib/api/mappers.ts`
    - Define DB row type aliases for all 10 tables from `Database['public']['Tables'][T]['Row']`
    - Implement forward mappers: `profileRowToAuthUser`, `evidenceRowToRecord`, `objectiveRowToObjective`, `assessmentRowsToAssessment` (calls `withDerivedAverages()`), `feedbackRowToItem`, `inboxRowToItem` (derives `icon` from `source`, `when` from `created_at`), `settingsRowToSettings`
    - Implement inverse mappers: `evidenceRecordToRow`, `objectiveToRow`, `assessmentToRows`
    - Move `withDerivedAverages()`, `sessionToAssessment()`, `assessmentToSession()` pure functions from `index.tsx` to this file
    - _Requirements: 2–9_
  - [x] 4.2 Write property test for assessment average invariant
    - **Property 1: Assessment Average Invariant**
    - **Validates: Requirements 6.6, 23.1**
    - For arbitrary score arrays (integers 1–5), verify every `categoryCurrentAvg` equals arithmetic mean of its questions' `currentScore` rounded to 2 decimal places
    - _Requirements: 6.6_
  - [x] 4.3 Write property test for assessmentToSession/sessionToAssessment round trip
    - **Property 7: assessmentToSession / sessionToAssessment Round Trip**
    - **Validates: Requirements 22.2**
    - For arbitrary `Assessment` objects, verify `sessionToAssessment(assessmentToSession(a))` is lossless for `currentScore`, `previousScore`, `justification`, `questionText`
    - _Requirements: 22.2_
  - [x] 4.4 Write unit tests for mapper functions
    - Test each forward mapper with representative DB rows and edge cases (null fields, empty JSONB arrays, date edge cases)
    - Test `withDerivedAverages` with empty questions, single question, all same score
    - _Requirements: 2–9_

- [x] 5. Implement AuthContext with Supabase (Phase 2 — Authentication)
  - [x] 5.1 Create AuthContext with session management
    - Create `src/lib/auth.tsx`
    - Define `AuthUser` interface — remove `password` field, add `avatarUrl?`, `jobTitle?`
    - Define `AuthCtx` interface with identical function signatures to existing code
    - Implement `AuthProvider`: on mount call `supabase.auth.getSession()`; fetch `profiles` row and call `profileRowToAuthUser()` if session found; render loading state (no children) until `getSession()` resolves
    - Subscribe to `supabase.auth.onAuthStateChange()` for `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`; unsubscribe on unmount
    - Export `useAuth()` hook that throws if called outside provider
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  - [x] 5.2 Wire sign-in, sign-up, sign-out, and update-user flows
    - Implement `signin(email, password)`: call `supabase.auth.signInWithPassword`, on error `toast.error` and return `false`, on success fetch profile, set user, return `true`
    - Implement `signup(u)`: call `supabase.auth.signUp`; on error `toast.error` return `false`; if email confirmation required show toast and return `true` with user null; on success INSERT `profiles` and `user_settings` rows with defaults, set user, return `true`
    - Implement `signout()`: call `supabase.auth.signOut`, `console.error` on error but still set user to `null`
    - Implement `updateUser(patch, password)`: re-authenticate with `signInWithPassword`; on error return `false`; if `patch.email` call `supabase.auth.updateUser`; call `supabase.from('profiles').update` for remaining fields; on success update local user state and return `true`
    - _Requirements: 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 14.1, 14.2, 14.3, 14.4, 14.5_
  - [x] 5.3 Wire SSO buttons
    - Replace Google `SsoButton` handler: call `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`
    - Replace Microsoft `SsoButton` handler: call `supabase.auth.signInWithOAuth({ provider: 'azure', ... })`
    - In `SIGNED_IN` handler: check if `profiles` row exists — if not, INSERT with `full_name` from `user.user_metadata.full_name ?? user.email`; check if `user_settings` row exists — if not, INSERT with defaults
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  - [x] 5.4 Write unit tests for auth state transitions
    - Mock `supabase.auth.*` calls and verify state transitions for sign-in, sign-up, sign-out, session refresh
    - Test password verification failure path in `updateUser`
    - _Requirements: 10–15_

- [x] 6. Create domain hooks — evidence and inbox (Phase 3 — Data Layer)
  - [x] 6.1 Implement evidence domain hooks
    - Create `src/lib/api/evidence.ts`
    - `useEvidenceQuery(userId, opts?)`: key `['evidence', userId, { archived }]`, `staleTime: 60_000`, query by `is_archived`, map through `evidenceRowToRecord()`
    - `useSaveEvidence(userId)`: optimistic update (snapshot→apply), `onError` roll back + `toast.error`, `onSettled` invalidate `['evidence', userId]`
    - `useArchiveEvidence(userId)`: update `{ is_archived: true, archived_date: today }`, invalidate both archived keys
    - `useRestoreEvidence(userId)`: update `{ is_archived: false, archived_date: null }`, invalidate both archived keys
    - `useDeleteEvidence(userId)`: delete row, invalidate `{ archived: true }` key
    - `useInsertEvidence(userId)`: insert via `evidenceRecordToRow()`, invalidate `{ archived: false }` key
    - _Requirements: 4, 19, 27_
  - [x] 6.2 Write property test for evidence optimistic update consistency
    - **Property 4: Evidence Optimistic Update Consistency**
    - **Validates: Requirements 19.3**
    - Verify that after `useSaveEvidence` fires `onMutate`, cache contains updated record; verify `onError` restores snapshot
    - _Requirements: 19.3_
  - [x] 6.3 Implement inbox domain hooks
    - Create `src/lib/api/inbox.ts`
    - `useInboxQuery(userId)`: key `['inbox', userId]`, `staleTime: 30_000`, map through `inboxRowToItem()`
    - `useApproveInbox(userId)`: optimistic remove inbox item and prepend evidence; call `evidence.insert` then `inbox_events.delete`; `onError` roll back both caches; `onSuccess` invalidate `['inbox', userId]` and `['evidence', userId, { archived: false }]`
    - `useDismissInbox(userId)`: delete inbox row, invalidate `['inbox', userId]`
    - _Requirements: 8, 16_
  - [x] 6.4 Write property test for inbox approve side effect
    - **Property 3: Inbox Approve Removes Inbox Row and Creates Evidence Row**
    - **Validates: Requirements 8.4, 16.2**
    - Verify `useApproveInbox` makes exactly one evidence insert and one inbox delete, with matching `source` and `title`
    - _Requirements: 8.4, 16.2_

- [x] 7. Create domain hooks — objectives, assessments, and dashboard
  - [x] 7.1 Implement objectives domain hooks
    - Create `src/lib/api/objectives.ts`
    - `useObjectivesQuery(userId)`: key `['objectives', userId]`, `staleTime: 60_000`, query non-archived, map through `objectiveRowToObjective()`
    - `useCreateObjective(userId)`: insert via `objectiveToRow()` with `status: 'Pending Approval'`, invalidate `['objectives', userId]`
    - `useMoveObjective(userId)`: update status; when `status === 'Completed'` also INSERT evidence row with `category: 'Objective'`, `competency: objective.competency`, `status: 'Pending Review'`, `match_state: 'Unset'`; invalidate objectives; if Completed also invalidate evidence
    - `useSaveObjective`, `useArchiveObjective`, `useRestoreObjective`, `useDeleteObjective` mutations with appropriate invalidations
    - _Requirements: 5, 20_
  - [x] 7.2 Write property test for objective completion side effect
    - **Property 2: Objective Completion Always Creates Exactly One Evidence Row**
    - **Validates: Requirements 20.3**
    - For any `competency` string, verify `useMoveObjective` with `status = 'Completed'` makes exactly one evidence insert with `category: 'Objective'` and matching `competency`
    - _Requirements: 20.3_
  - [x] 7.3 Implement assessments domain hooks
    - Create `src/lib/api/assessments.ts`
    - `useAssessmentsQuery(userId)`: key `['assessments', userId]`, `staleTime: 300_000`, select with nested `assessment_categories(*, assessment_questions(*))`, map through `assessmentRowsToAssessment()`
    - `useFinalizeAssessment(userId)`: call `assessmentToRows()` to flatten; upsert `assessments` row (`ON CONFLICT (id) DO UPDATE`); bulk insert categories then questions; `toast.error` and leave wizard open on any failure; invalidate `['assessments', userId]`
    - `useUpdateOneOnOneTopics(userId)`: update `one_on_one_topics` JSONB column, invalidate `['assessments', userId]`
    - _Requirements: 6, 18, 22, 23_
  - [x] 7.4 Implement dashboard stats hook
    - Create `src/lib/api/dashboard.ts`
    - `useDashboardStats(userId)`: reads from `useEvidenceQuery` and `useObjectivesQuery` caches (no extra DB calls); returns `useMemo` with `evidenceThisQuarter`, `streak`, `pendingReviewCount`, `recentEvidence`, `focusAreas`
    - Implement `computeStreak(evidence: EvidenceRecord[]): number` as a pure exported function — counts consecutive calendar days from today backwards with at least one non-archived entry
    - _Requirements: 17_
  - [x] 7.5 Write property test for streak computation
    - **Property 5: Streak Computation Correctness**
    - **Validates: Requirements 17.2**
    - For arbitrary arrays of evidence records (random dates, duplicates, random `is_archived`), verify `computeStreak()` matches naïve day-by-day reference implementation
    - _Requirements: 17.2_

- [x] 8. Create domain hooks — feedback, profile, settings, and frameworks
  - [x] 8.1 Implement feedback domain hooks
    - Create `src/lib/api/feedback.ts`
    - `useFeedbackQuery(userId)`: key `['feedback', userId]`, `staleTime: 60_000`, order by `date DESC`, map through `feedbackRowToItem()`
    - `useAddFeedback(userId)`: insert new feedback row, invalidate `['feedback', userId]`
    - _Requirements: 7, 21_
  - [x] 8.2 Write property test for feedback filter correctness
    - **Property 6: Feedback Filter Correctness**
    - **Validates: Requirements 21.4**
    - For any array of `FeedbackItem` and any valid filter value, verify filtered result contains exactly the matching items — no more, no fewer
    - _Requirements: 21.4_
  - [x] 8.3 Implement profile domain hooks
    - Create `src/lib/api/profile.ts`
    - `useProfileQuery(userId)`: key `['profile', userId]`, `staleTime: 300_000`, map through `profileRowToAuthUser()`
    - `useSaveProfile(userId)`: UPDATE `profiles` for `full_name`, `email`, `current_level`, `target_level`, `job_title`; invalidate `['profile', userId]`
    - `useSaveTeam(userId)`: UPDATE `profiles` for `manager`, `manager_email`, `team`, `skip_level`; invalidate `['profile', userId]`
    - `useUploadAvatar(userId)`: upload to `supabase.storage.from('avatars').upload(\`${userId}/${fileName}\`, file, { upsert: true })`, then update `profiles.avatar_url` with public URL; invalidate `['profile', userId]`
    - _Requirements: 24_
  - [x] 8.4 Implement settings domain hooks
    - Create `src/lib/api/settings.ts`
    - `useSettingsQuery(userId)`: key `['user_settings', userId]`, `staleTime: 300_000`, map through `settingsRowToSettings()`
    - `useSaveNotifications(userId)`: PATCH `notifications` JSONB column, invalidate `['user_settings', userId]`
    - `useSaveIntegrations(userId)`: PATCH `integrations` JSONB column, invalidate `['user_settings', userId]`
    - _Requirements: 25_
  - [x] 8.5 Implement framework domain hooks
    - Create `src/lib/api/frameworks.ts`
    - `useFrameworkQuery(userId)`: key `['frameworks', userId]`, `staleTime: 600_000`, select active framework with nested categories; query with `.eq('is_active', true).single()`
    - `useUploadFramework(userId)`: upsert `competency_frameworks` row then bulk upsert `competency_categories`; invalidate `['frameworks', userId]`
    - _Requirements: 9, 26_

- [x] 9. Checkpoint — Ensure all data layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Wire AuthContext into index.tsx (Phase 4 — Web App Wiring)
  - [x] 10.1 Extract and wire AuthContext into index.tsx
    - Import `AuthProvider` and `useAuth` from `src/lib/auth.tsx`
    - Remove inline `AuthContext`, `AuthCtx` type, `useAuth` hook, and `App` auth state machine from `index.tsx`
    - Wrap `App` component return value with `<AuthProvider>` instead of inline `<AuthContext.Provider>`
    - Replace all `useContext(AuthContext)` references with imported `useAuth()`
    - Run `tsc --noEmit` — zero type errors expected
    - _Requirements: 10–15_

- [x] 11. Replace EvitraceApp mock state with domain hooks
  - [x] 11.1 Replace server-state useState calls with TanStack Query hooks
    - Add `const { user } = useAuth()` and derive `userId = user!.id` at top of `EvitraceApp`
    - Replace `const [evidence, setEvidence] = useState(initialEvidence)` with `useEvidenceQuery(userId)` and `useEvidenceQuery(userId, { archived: true })`
    - Replace `const [inbox, setInbox] = useState(initialInbox)` with `useInboxQuery(userId)`
    - Replace `const [objectives, setObjectives] = useState(initialObjectives)` with `useObjectivesQuery(userId)`
    - Replace `const [assessments, setAssessments] = useState(initialAssessments)` with `useAssessmentsQuery(userId)`
    - Replace `const [radarData, setRadarData] = useState(initialRadar)` with `useMemo(() => deriveRadarData(assessments[0]), [assessments])` using a pure `deriveRadarData` function applying `radarLabelToCategory`/`categoryToRadarLabel`
    - Keep all UI-only `useState` calls unchanged (tab, sidebar, modals, openObjective, openEvidence, etc.)
    - _Requirements: 16–18, 20, 22_
  - [x] 11.2 Wire DashboardView stat cards and inbox
    - In `DashboardView`, call `useDashboardStats(userId)` for all stat values
    - Connect `StatCard "Evidence This Quarter"` to `stats.evidenceThisQuarter`
    - Connect `StatCard "Current Streak"` to `stats.streak`
    - Connect `PendingReviewCard` total to `stats.pendingReviewCount`
    - Connect Recent Evidence list to `stats.recentEvidence`
    - Connect Current Focus Areas to `stats.focusAreas`
    - _Requirements: 16, 17_
  - [x] 11.3 Wire inbox approval and dismissal
    - Replace `approveInbox(id, comps)` implementation with `useApproveInbox(userId)` mutation; build `newEvidenceRow` from inbox item's `source`, `title`, and first suggested competency
    - Replace dismiss path in `InboxReviewSlideover` with `useDismissInbox(userId)` mutation
    - Remove all manual `setInbox` and `setEvidence` calls from these paths
    - _Requirements: 8, 16_

- [ ] 12. Wire evidence, capture, objectives, radar, review wizard, and report views
  - [ ] 12.1 Wire EvidenceView and EvidenceSlideover
    - Pass `useEvidenceQuery(userId, { archived: false })` data to `EvidenceView`
    - Pass `useEvidenceQuery(userId, { archived: true })` data to the Archive tab
    - Replace `onSave` in `EvidenceSlideover` with `useSaveEvidence(userId)` mutation (with optimistic update)
    - Replace `onArchive` with `useArchiveEvidence(userId)`, `onRestore` with `useRestoreEvidence(userId)`, `onPermanentDelete` with `useDeleteEvidence(userId)`
    - Remove all remaining `setEvidence` calls from these paths
    - _Requirements: 19_
  - [ ] 12.2 Wire CaptureModal
    - Replace `setEvidence(e => [newRow, ...e])` in `CaptureModal`'s `onSave` callback with `useInsertEvidence(userId)` mutation
    - Preserve `toast` on success
    - _Requirements: 19, 27_
  - [ ] 12.3 Wire ObjectivesView, CreateObjectiveModal, and ObjectiveSlideover
    - Pass `useObjectivesQuery(userId)` data to `ObjectivesView`
    - Replace `onMove(id, status)` with `useMoveObjective(userId)` (handles `Completed → evidence` side effect internally)
    - Replace `onCreate` with `useCreateObjective(userId)`, `onSave` with `useSaveObjective(userId)`, `onArchive` with `useArchiveObjective(userId)`, `onRestore` with `useRestoreObjective(userId)`, `onDelete` with `useDeleteObjective(userId)`, `onChangeStatus` with `useMoveObjective(userId)`
    - Remove all `setObjectives` and cross-entity `setEvidence` calls
    - _Requirements: 20_
  - [ ] 12.4 Wire RadarView and ReviewWizard finalization
    - Pass `assessments` and derived `radarData` to `RadarView`; remove all `setRadarData` calls from `EvitraceApp`
    - In `EvitraceApp.onFinalize(session)`: call `sessionToAssessment(session)` then `useFinalizeAssessment(userId)` mutation; on success set `review` state and navigate to report tab; remove manual `setAssessments` and `setRadarData` recalculation
    - _Requirements: 18, 23_
  - [ ] 12.5 Wire ReportView, FeedbackView, and SettingsView
    - In `ReportView`: pass `assessments` from `useAssessmentsQuery`; replace local `useState` topics buffer save with `useUpdateOneOnOneTopics(userId)` mutation on explicit save; verify `onOpenAssessment(a)` still calls `assessmentToSession(a)` client-side
    - In `FeedbackView`: replace `const [items, setItems] = useState(initialFeedback)` with `useFeedbackQuery(userId)`; replace `addRequest` submit path with `useAddFeedback(userId)` mutation; keep `filter` state and `useMemo` filter logic as-is
    - In `ProfileSettings`: wire to `useProfileQuery`, `useSaveProfile`, `useUploadAvatar` mutations with password re-auth
    - In `TeamSettings`: wire save to `useSaveTeam` mutation with password re-auth
    - In `NotificationsSettings`: replace `useState` initials with `useSettingsQuery` data; wire toggle changes to `useSaveNotifications` mutation
    - In `ExtensionSettings`: replace `useState` initials with `useSettingsQuery` data; wire toggle changes to `useSaveIntegrations` mutation
    - In `FrameworkSettings`: replace `activeFramework` state with `useFrameworkQuery` data; wire `handleFile()` success to `useUploadFramework` mutation
    - _Requirements: 21, 22, 24, 25, 26_

- [ ] 13. Extract and wire ExtensionPopup (Phase 4 — Extension Preview)
  - [ ] 13.1 Create ExtensionPopup component
    - Create `src/components/ExtensionPopup.tsx`
    - Move `ExtensionPopup` from `index.tsx`; extract alongside it: `Pill`, `Badge`, `Textarea`, `COMPETENCIES`, `COMPETENCY_DESC`, `SourceIcon`
    - Read `userId` from `useAuth()` inside the component (no prop drilling)
    - Read integration settings from `useSettingsQuery(userId)` and build trigger dropdown via `buildTriggerOptions(settings.integrations)`
    - Implement `sourceFromTrigger(trigger: string): string` mapping trigger label to `'Jira'`, `'GitHub'`, `'Bitbucket'`, or `'Manual'`
    - Replace `onSave()` callback with `useInsertEvidence(userId)` mutation with all required fields
    - Disable "Save Evidence" button when `comps.length === 0`; show hint `"Select at least one competency"`
    - On mutation success: call `onSave()` to dismiss; on failure: `toast.error(error.message)`, keep popup open
    - In `index.tsx`: import `ExtensionPopup` from `src/components/ExtensionPopup.tsx`, remove inline definition
    - _Requirements: 27, 28_
  - [ ]* 13.2 Write property test for trigger options
    - **Property 8: ExtensionPopup Trigger Options Match Enabled Integrations**
    - **Validates: Requirements 28.1, 28.2, 28.3, 28.4, 28.5**
    - For any `IntegrationPrefs` object, verify `buildTriggerOptions()` returns exactly one entry per `true` integration plus always the time-based fallback, and no entries for disabled integrations
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5_

- [ ] 14. Checkpoint — Ensure all wiring tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Remove mock data and dead code from index.tsx
  - [ ] 15.1 Delete mock data constants and moved utilities
    - Remove from `index.tsx`: `initialEvidence`, `initialInbox`, `initialObjectives`, `initialAssessments`, `buildHistorical()`, `initialRadar`, `initialFeedback` (inside `FeedbackView`)
    - Remove inline `AuthContext`, `AuthCtx` type definition, `useAuth` hook definition, and `App` auth state machine
    - Remove `withDerivedAverages()`, `sessionToAssessment()`, `assessmentToSession()`, `buildHistorical()` (all moved to `mappers.ts`)
    - Run `tsc --noEmit` — zero errors expected
    - Run `bun run lint` — zero errors expected
    - Run `bun run build` — production build completes successfully
    - _Requirements: All_

- [ ] 16. Create Chrome extension scaffold (Phase 5 — Future)
  - [ ] 16.1 Create extension manifest and directory structure
    - Create `extension/manifest.json` with Manifest V3: `manifest_version: 3`, `name: "Evitrace"`, `version: "1.0.0"`, permissions `["storage", "activeTab", "identity", "alarms"]`, host_permissions for Atlassian/GitHub/Bitbucket/Slack
    - Add `background.service_worker: "background.js"`, `action.default_popup: "popup/popup.html"` with icon sizes 16/48/128
    - Add `content_scripts` array with placeholder matches for Jira, GitHub, Bitbucket, Slack
    - Create `extension/icons/` with placeholder 16px, 48px, 128px PNG files using Evitrace radar icon style
    - _Requirements: 29.1, 29.2, 29.3_
  - [ ] 16.2 Create extension Vite config and popup entry point
    - Create `vite.extension.config.ts`: no `tanstackStart` plugin; include React and TailwindCSS plugins; `build.outDir: 'extension/dist'`; `build.rollupOptions.input: { popup: 'extension/popup/popup.html' }`; `build.target: 'chrome110'`; `define` block injecting `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
    - Add `"build:extension": "vite build --config vite.extension.config.ts"` to `package.json` scripts
    - Add `extension/dist/` to `.gitignore`
    - Create `extension/popup/popup.html` — minimal HTML with `<div id="root">` and script reference
    - Create `extension/popup/App.tsx` — import `ExtensionPopup`, render into `#root` via `createRoot`; call `supabase.auth.getSession()` on mount; show sign-in prompt if no session
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5_
  - [ ] 16.3 Create extension auth bridge and background service worker
    - Create `extension/background.ts` service worker entry point
    - On startup: `chrome.storage.local.get(['supabase_session'])`; if found call `supabase.auth.setSession({ access_token, refresh_token })`
    - In web app `AuthProvider` `onAuthStateChange`: on `SIGNED_IN` call `chrome.storage?.local?.set({ supabase_session: { access_token, refresh_token } })` guarded by `typeof chrome !== 'undefined'`; on `SIGNED_OUT` call `chrome.storage?.local?.remove(['supabase_session'])`
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.5_
  - [ ] 16.4 Create content scripts for auto-capture
    - Create `extension/content-scripts/jira.ts`: watch `MutationObserver` for issue status → `"Done"`; post `chrome.runtime.sendMessage({ type: 'CAPTURE_EVENT', source: 'Jira', title, suggestion: ['Delivery'] })`
    - Create `extension/content-scripts/github.ts`: watch for PR merge banner `#partial-pull-merging .flash-success`; post `{ source: 'GitHub', suggestion: ['Code Quality', 'Delivery'] }`
    - Create `extension/content-scripts/bitbucket.ts`: watch merge confirmation; post `{ source: 'Bitbucket' }`
    - Create `extension/content-scripts/slack.ts`: watch `#wins` bookmarks; post `{ source: 'Slack', suggestion: ['Communication'] }`
    - In `extension/background.ts`: listen for `CAPTURE_EVENT`; if valid session call `supabase.from('inbox_events').insert(...)`; guard injection per enabled `user_settings.integrations` flags
    - _Requirements: 32.1, 32.2, 32.3, 32.4, 32.5, 32.6_
  - [ ] 16.5 Implement daily reminder alarm
    - In `extension/background.ts`: on startup, if `user_settings.notifications.dailyReminder === true`, call `chrome.alarms.create('dailyReflection', { when: nextToday16h, periodInMinutes: 1440 })`
    - Add alarm listener: on `'dailyReflection'` fire, call `chrome.notifications.create({ type: 'basic', title: 'Evitrace', message: "Time to log today's evidence. What did you ship?" })`
    - Add notification click listener: open popup via `chrome.action.openPopup()` or open web app via `chrome.tabs.create`
    - When `useSaveNotifications` sets `dailyReminder: false`, post message to background worker to call `chrome.alarms.clear('dailyReflection')`
    - Check `chrome.notifications.getPermissionLevel()` before creating alarm; skip if `'denied'`
    - _Requirements: 33.1, 33.2, 33.3, 33.4, 33.5_

- [ ] 17. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 9, 14, 17) ensure incremental validation at key phase boundaries
- The migration is additive — `src/routes/index.tsx` is touched last (tasks 10–15)
- Phase 5 (task 16) is for future Chrome extension extraction and can be deferred entirely
- Property tests validate universal correctness properties using `fast-check` with vitest
- Unit tests validate specific examples and edge cases
- Install `fast-check` as a dev dependency before running property tests: `bun add -D fast-check`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9"] },
    { "id": 3, "tasks": ["2.10"] },
    { "id": 4, "tasks": ["3.1"] },
    { "id": 5, "tasks": ["3.2"] },
    { "id": 6, "tasks": ["4.1"] },
    { "id": 7, "tasks": ["1.2", "4.2", "4.3", "4.4"] },
    { "id": 8, "tasks": ["5.1"] },
    { "id": 9, "tasks": ["5.2", "5.3"] },
    { "id": 10, "tasks": ["5.4", "6.1", "6.3", "7.1", "7.3", "7.4", "8.1", "8.3", "8.4", "8.5"] },
    { "id": 11, "tasks": ["6.2", "6.4", "7.2", "7.5", "8.2"] },
    { "id": 12, "tasks": ["10.1"] },
    { "id": 13, "tasks": ["11.1"] },
    { "id": 14, "tasks": ["11.2", "11.3", "12.1", "12.2", "12.3", "12.4", "12.5"] },
    { "id": 15, "tasks": ["13.1"] },
    { "id": 16, "tasks": ["13.2"] },
    { "id": 17, "tasks": ["15.1"] },
    { "id": 18, "tasks": ["16.1"] },
    { "id": 19, "tasks": ["16.2", "16.3"] },
    { "id": 20, "tasks": ["16.4"] },
    { "id": 21, "tasks": ["16.5"] }
  ]
}
```
