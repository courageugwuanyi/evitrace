# Evitrace Supabase Wiring Tasks Blueprint

This document is a **no-code wiring plan** based on a full scan of the current Lovable UI implementation.

## Scope scanned

- `src/routes/index.tsx` (primary app UI, auth gate, all mock datasets, all feature views, Extension Preview)
- `src/routes/__root.tsx` (app shell + React Query provider)
- `src/router.tsx` (TanStack Router bootstrap)
- `package.json` (dependencies currently available)
- `.kiro/specs/supabase-wiring-blueprint/requirements.md` (existing product requirements context)

## Current architecture snapshot (important for wiring order)

- The entire product currently runs from a single route component: `src/routes/index.tsx`.
- All domain data is currently in-memory via `useState` seeded by:
  - `initialRadar`
  - `initialEvidence`
  - `initialInbox`
  - `initialObjectives`
  - `initialAssessments`
  - `initialFeedback`
- Authentication is also in-memory via `AuthContext` (`signin`, `signup`, `signout`, `updateUser`) with no external backend.
- The "Extension Preview" is a floating UI component (`ExtensionPopup`) inside the web app, not yet a real extension package.

---

## Phase 1: Database Schema Mapping (UI + mock-data driven)

Goal: define the exact Supabase schema required to faithfully represent the current UI state and interactions.

### 1.1 Core identity and settings tables

#### `profiles` (maps current `AuthUser`)

Columns:

- `id uuid primary key references auth.users(id) on delete cascade`
- `full_name text not null`
- `email text not null`
- `current_level text not null`
- `target_level text not null`
- `team text not null`
- `manager text not null`
- `manager_email text not null`
- `skip_level text`
- `job_title text`
- `avatar_url text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Relationships:

- 1:1 with `auth.users` via `profiles.id`.

RLS:

- Select/update only own row (`auth.uid() = id`).

#### `user_settings` (maps `NotificationsSettings` + `ExtensionSettings`)

Columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null unique references auth.users(id) on delete cascade`
- `notifications jsonb not null`
- `integrations jsonb not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Suggested JSON structure:

- `notifications`:
  - `dailyReminder` (maps `a`)
  - `managerApprovals` (maps `b`)
  - `weeklyDigest` (maps `c`)
  - `browserPush` (maps `d`)
- `integrations`:
  - `autoCaptureEvents`, `jira`, `github`, `bitbucket`, `slack`, `teams`, `confluence`, `notion`

RLS:

- Own-row select/insert/update only (`auth.uid() = user_id`).

### 1.2 Evidence ingestion and review tables

#### `evidence` (maps `EvidenceRecord`)

Columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `date date not null`
- `source text not null`
- `category text not null`
- `competency text not null`
- `title text not null`
- `description text not null default ''`
- `link text not null default ''`
- `status text not null check (status in ('Pending Review','Reviewed')) default 'Pending Review'`
- `match_state text not null check (match_state in ('Yes','No','Somewhat','Unset')) default 'Unset'`
- `manager_notes text not null default ''`
- `is_archived boolean not null default false`
- `archived_date date`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes:

- `(user_id, is_archived, date desc)`
- `(user_id, status)`
- `(user_id, competency)`

RLS:

- Full CRUD only for owner (`auth.uid() = user_id`).

#### `inbox_events` (maps `initialInbox`)

Columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `source text not null`
- `title text not null`
- `suggestion text[] not null default '{}'`
- `event_link text`
- `created_at timestamptz not null default now()`

RLS:

- Select/insert/delete for owner.

### 1.3 Objectives tables

#### `objectives` (maps `Objective`)

Columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `title text not null`
- `competency text not null`
- `due date not null`
- `status text not null check (status in ('Pending Approval','In Progress','Completed')) default 'Pending Approval'`
- `statement text`
- `date_authored date`
- `specific text`
- `measurable text`
- `achievable text`
- `relevant text`
- `timebound text`
- `links jsonb not null default '[]'::jsonb`
- `notes text`
- `success_criteria jsonb not null default '{}'::jsonb`
- `is_archived boolean not null default false`
- `archived_date date`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

`success_criteria` json shape:

- `{ learn: SuccessCriterion[], demonstrate: SuccessCriterion[], share: SuccessCriterion[] }`

RLS:

- Full CRUD by owner.

Indexes:

- `(user_id, is_archived, status)`

### 1.4 Assessment and report tables

Current UI holds nested assessment structure (`Assessment -> categories -> questions`) and uses conversions (`sessionToAssessment`, `assessmentToSession`).

#### `assessments`

- `id text primary key` (compatible with current `REV-YYYY-Qx` pattern)
- `user_id uuid not null references auth.users(id) on delete cascade`
- `date_completed timestamptz not null`
- `review_period text not null`
- `status text not null check (status in ('Finalized','Draft','In Review'))`
- `engineer_name text not null`
- `manager_name text not null`
- `overall_readiness_score int not null check (overall_readiness_score between 0 and 100)`
- `one_on_one_topics jsonb not null default '[]'::jsonb`
- timestamps

#### `assessment_categories`

- `id uuid primary key default gen_random_uuid()`
- `assessment_id text not null references assessments(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `category_id text not null`
- `category_name text not null`
- `summary text not null default ''`
- `category_current_avg numeric(3,2) not null default 0`
- `category_target numeric(3,2) not null default 4`
- `sort_order int not null default 0`
- `created_at timestamptz not null default now()`

#### `assessment_questions`

- `id uuid primary key default gen_random_uuid()`
- `category_id uuid not null references assessment_categories(id) on delete cascade`
- `assessment_id text not null references assessments(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `question_id text not null`
- `question_text text not null`
- `previous_score int not null check (previous_score between 1 and 5)`
- `current_score int not null check (current_score between 1 and 5)`
- `target_score int not null check (target_score between 1 and 5)`
- `justification text not null default ''`
- `attached_evidence_ids uuid[] not null default '{}'`
- `sort_order int not null default 0`
- `created_at timestamptz not null default now()`

RLS:

- All three tables owner-scoped by `user_id`.

### 1.5 Feedback + framework tables

#### `feedback` (maps `FeedbackItem`)

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `date date not null`
- `provider text not null`
- `type text not null check (type in ('Manager Requested','Ad-hoc','Peer Review'))`
- `notes text not null default ''`
- `anonymous boolean not null default false`
- timestamps

RLS:

- Owner select/insert/update.

#### `competency_frameworks`

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `name text not null`
- `version text`
- `is_active boolean not null default true`
- timestamps

#### `competency_categories`

- `id uuid primary key default gen_random_uuid()`
- `framework_id uuid not null references competency_frameworks(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `name text not null`
- `weight numeric(4,2) not null default 1`
- `questions text[] not null default '{}'`
- `sort_order int not null default 0`
- `created_at timestamptz not null default now()`

RLS:

- owner-scoped.

### 1.6 Cross-table relationship map

- `auth.users 1 -> 1 profiles`
- `auth.users 1 -> 1 user_settings`
- `auth.users 1 -> many evidence`
- `auth.users 1 -> many inbox_events`
- `auth.users 1 -> many objectives`
- `auth.users 1 -> many assessments`
- `assessments 1 -> many assessment_categories`
- `assessment_categories 1 -> many assessment_questions`
- `auth.users 1 -> many feedback`
- `auth.users 1 -> many competency_frameworks`
- `competency_frameworks 1 -> many competency_categories`

### 1.7 Phase-1 task list

- [ ] Add Supabase project and generate SQL migration files.
- [ ] Create all tables and indexes listed above.
- [ ] Add timestamp update trigger function and attach to mutable tables.
- [ ] Enable RLS on all user data tables.
- [ ] Add owner policies per table.
- [ ] Seed a dev user + representative seed data matching current mock structures.
- [ ] Generate Supabase TypeScript types for DB.

---

## Phase 2: Authentication & Context Wiring (no UI/CSS changes)

Goal: replace in-memory auth in `AuthContext` with Supabase Auth while keeping `AuthScreens`, `SigninForm`, `SignupForm`, and Settings UI unchanged.

### 2.1 Current auth behavior to replace

- `signin`: currently validates against local state or auto-creates a mock user.
- `signup`: currently stores full `AuthUser` in memory.
- `signout`: clears local state only.
- `updateUser`: checks plaintext password against in-memory `user.password`.
- SSO buttons currently call demo toasts only.

### 2.2 Wiring tasks

#### Task A: Supabase client + env contract

- [ ] Add `src/lib/supabase.ts` singleton client.
- [ ] Enforce required env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) with clear runtime errors.
- [ ] Export generated `Database` typing.

#### Task B: Auth context contract preservation

- [ ] Keep existing `AuthCtx` function signatures so child components remain untouched.
- [ ] Internally map Supabase session/user to existing `AuthUser` shape.
- [ ] Remove plaintext password persistence (keep only password input handling at form step).

#### Task C: Sign-in flow (`SigninForm`)

- [ ] Replace in-memory credential check with `supabase.auth.signInWithPassword`.
- [ ] On success, fetch `profiles` row and set context user.
- [ ] On failure, return `false` to existing caller and continue showing toast errors from current UI flow.

#### Task D: Sign-up flow (`SignupForm`)

- [ ] Keep existing form fields and validation.
- [ ] On submit, create auth account with email/password.
- [ ] Insert `profiles` + default `user_settings` row.
- [ ] Handle email-confirmation projects (do not force user into app until confirmed if session absent).

#### Task E: Session restoration

- [ ] On mount, call `supabase.auth.getSession()`.
- [ ] Add auth loading guard to avoid sign-in flash for existing sessions.
- [ ] Subscribe to `onAuthStateChange` and keep context synced.

#### Task F: Secure updates from settings screens

- [ ] Replace `pwd !== user.password` check with Supabase re-auth verification path.
- [ ] Update `profiles` and auth email as needed.
- [ ] Keep existing confirmation modals and UX unchanged.

#### Task G: SSO button wiring

- [ ] Google button -> `signInWithOAuth({ provider: 'google' })`
- [ ] Microsoft button -> Supabase Azure provider.
- [ ] On return, ensure `profiles` and `user_settings` rows exist.

### 2.3 Phase-2 done criteria

- Existing auth screens look identical.
- Page refresh keeps user signed in.
- Settings password confirmations still gate protected updates.
- Demo SSO toasts replaced with real provider redirects.

---

## Phase 3: Web App Data Wiring (component-by-component)

Goal: replace all mock `useState` domain data in `EvitraceApp` and nested views with Supabase-backed query/mutation hooks.

## 3.1 Shared data layer groundwork

- [ ] Introduce domain query keys (`profile`, `settings`, `evidence`, `inbox`, `objectives`, `assessments`, `feedback`, `framework`).
- [ ] Add typed mapping utilities between DB rows and UI types:
  - snake_case (DB) <-> camelCase (UI)
  - date/timestamp formatting for existing UI display
- [ ] Centralize query + mutation hooks under `src/lib/api/` (or feature hooks folder).

## 3.2 EvitraceApp state replacements

Current in-memory states to remove:

- `evidence`, `inbox`, `radarData`, `objectives`, `assessments`

Keep local UI-only states:

- tab/overlays/modals/open-item references/toasts.

Tasks:

- [ ] Replace `useState(initialEvidence)` with query-backed `evidence`.
- [ ] Replace `useState(initialInbox)` with query-backed `inbox`.
- [ ] Replace `useState(initialObjectives)` with query-backed `objectives`.
- [ ] Replace `useState(initialAssessments)` with query-backed `assessments`.
- [ ] Replace `radarData` stored state with derived projection from latest assessment/categories.

## 3.3 Dashboard wiring

Components affected: `DashboardView`, `StatCard`, `PendingReviewCard`, `InboxRow`.

Tasks:

- [ ] "Evidence This Quarter" from `evidence` count query by date range.
- [ ] "Current Streak" computed from queried evidence dates.
- [ ] `PendingReviewCard` counts from evidence/objectives (and optionally feedback queue if later modeled).
- [ ] Action Inbox list from `inbox_events`.
- [ ] Recent Evidence from latest non-archived evidence.
- [ ] Current Focus Areas from objectives where status = `In Progress`.

## 3.4 Inbox review flow wiring

Components affected: `InboxReviewSlideover`, `approveInbox`, dismiss handlers.

Tasks:

- [ ] Confirm-save path inserts new evidence row then removes inbox event.
- [ ] Dismiss path deletes inbox event.
- [ ] Invalidate/update cache for inbox and evidence.

## 3.5 Radar / readiness wiring

Components affected: `RadarView`, `HierarchicalMatrix`, assessment modal/table.

Tasks:

- [ ] Use latest assessment snapshot for readiness and chart metrics.
- [ ] Build category chart data from `assessment_categories` and previous cycle comparison.
- [ ] Keep current UI transforms (`radarLabelToCategory`, scale conversion) with DB-backed inputs.
- [ ] Replace manager status static text with optional real metadata later (non-blocking).

## 3.6 Evidence Log wiring

Components affected: `EvidenceView`, `EvidenceSlideover`.

Tasks:

- [ ] Active tab query where `is_archived = false`.
- [ ] Archived tab query where `is_archived = true`.
- [ ] Save changes mutation updates row fields.
- [ ] Archive mutation sets `is_archived=true`, `archived_date=today`.
- [ ] Restore mutation clears archive fields.
- [ ] Permanent delete mutation removes row.

## 3.7 Capture modal wiring

Component affected: `CaptureModal`.

Tasks:

- [ ] "Save to Log" inserts a new evidence row using current form payload.
- [ ] Preserve existing field-level UX and validation text.

## 3.8 Objectives wiring

Components affected: `ObjectivesView`, `CreateObjectiveModal`, `ObjectiveSlideover`, `ArchivedObjectivesTable`.

Tasks:

- [ ] Board columns from objectives query.
- [ ] Drag/drop status changes persisted with mutation.
- [ ] Create modal inserts new objective with default `Pending Approval`.
- [ ] Objective slideover saves full edits (SMART fields, links, notes, success criteria).
- [ ] Archive/restore/delete flows mapped to objective mutations.
- [ ] When objective becomes `Completed`, auto-create linked evidence row (same behavior as current UI logic).

## 3.9 Feedback wiring

Components affected: `FeedbackView`, `AskFeedbackModal`.

Tasks:

- [ ] Load list from `feedback` table ordered by date.
- [ ] Add-request flow inserts manager-requested feedback stub.
- [ ] Keep filter chips client-side (All/Manager/Peer/Ad-hoc).

## 3.10 Settings wiring

Components affected: `ProfileSettings`, `TeamSettings`, `NotificationsSettings`, `ExtensionSettings`, `FrameworkSettings`.

Tasks:

- [ ] Profile/team reads from `profiles`.
- [ ] Profile/team save flows update `profiles` and context cache.
- [ ] Profile photo path:
  - upload to Supabase Storage bucket (e.g., `avatars`)
  - persist public URL in `profiles.avatar_url`
- [ ] Notification toggles read/write `user_settings.notifications`.
- [ ] Extension integration toggles read/write `user_settings.integrations`.
- [ ] Framework upload:
  - parse file (current UI behavior retained)
  - persist framework + categories
  - mark active framework

## 3.11 Review/report wiring

Components affected: `ReviewWizard`, `ReportView`, `AssessmentsArchiveTable`, `AssessmentHistoryModal`.

Tasks:

- [ ] On finalize, persist `ReviewSession` as normalized assessment rows.
- [ ] Refresh assessments query so report/radar consume same source of truth.
- [ ] Persist editable 1-on-1 topic list (currently local `topics` state in `ReportView`).
- [ ] Optionally persist learning resources list (currently local `resources` state) to a new table if kept as feature.

---

## Phase 4: Extension Preview Wiring (inside current web app)

Goal: wire the existing floating preview (`ExtensionPopup`) to real backend state without changing visual design.

### 4.1 Current behavior

- Trigger select and text are local state only.
- Competency pills are local state only.
- Save button only calls parent callback and toast.
- No persistence and no dependency on settings toggles.

### 4.2 Wiring tasks

- [ ] Read current user from auth context.
- [ ] Read enabled integrations from `user_settings.integrations`.
- [ ] Dynamically build Trigger dropdown options based on enabled integrations.
- [ ] On "Save Evidence":
  - derive source from selected trigger
  - insert evidence row (`Pending Review`, `Unset match_state`)
  - dismiss preview on success
  - keep preview open and show error on failure
- [ ] Invalidate evidence query so Dashboard/Evidence Log updates immediately.
- [ ] Preserve current competency-pill interaction for manual override.

### 4.3 Preview-state contracts to define

- Trigger option model:
  - `id`
  - `label`
  - `source`
  - optional `integrationKey`
- Save payload mapper:
  - `text` -> `description`
  - first selected competency -> `competency`
  - deterministic fallback category/source values if missing.

---

## Phase 5: Real Extension Extraction (future packaging plan)

Goal: convert current preview UI into a real Chrome extension deliverable while sharing backend state.

### 5.1 Repo/build structure

- [ ] Add `extension/` directory with:
  - `manifest.json` (MV3)
  - `background.ts`
  - `content-scripts/` per integration
  - `popup/` entrypoint rendering reused `ExtensionPopup` UI shell
  - `icons/`
- [ ] Add dedicated extension Vite config (`vite.extension.config.ts`).
- [ ] Add `build:extension` npm script.

### 5.2 Session/auth bridge

- [ ] Decide extension auth strategy:
  - Supabase auth directly inside extension with persisted refresh tokens, or
  - message bridge from web app to extension storage.
- [ ] Implement secure token storage and rotation path.
- [ ] Handle signed-out state in popup gracefully.

### 5.3 Event capture pipeline

- [ ] Implement content scripts for Jira/GitHub/Bitbucket/Slack event detection.
- [ ] Post normalized events to background worker.
- [ ] Background writes `inbox_events` rows.
- [ ] Respect integration toggles from `user_settings`.

### 5.4 Notifications/alarm behavior

- [ ] Map `dailyReminder` to chrome alarms.
- [ ] Map `browserPush` to chrome notifications permission and dispatch.

### 5.5 Release readiness tasks

- [ ] Add local unpacked loading instructions.
- [ ] Add QA checklist across supported host sites.
- [ ] Add privacy/security review for captured event fields.
- [ ] Add CI build artifact generation for extension bundle.

---

## Suggested execution order (across phases)

1. Phase 1 migrations + RLS first.
2. Phase 2 auth/session wiring (unblocks user-scoped queries).
3. Phase 3 core data flows in this order:
   - profile/settings
   - evidence + inbox
   - objectives
   - assessments/radar/report
   - feedback/framework
4. Phase 4 extension preview persistence.
5. Phase 5 extension packaging once preview behavior is stable in prod backend.

---

## Risks and dependencies to watch

- Single-file architecture (`index.tsx`) means wiring can become hard to manage quickly; feature hook extraction should happen alongside data wiring.
- Date formatting currently uses display strings (e.g., `"Nov 28, 2026"`), so mapper functions are required to avoid query/sort issues.
- Objective completion currently auto-creates evidence; this cross-entity behavior needs transaction-safe mutation sequencing.
- Assessment/radar currently uses mixed scales (1-5 and 0-4 visual mapping); preserve conversion logic exactly during backend move.
- Existing settings "Save Settings" button is mostly cosmetic; decide whether to save on toggle change or batch save.

---

## Deliverable checkpoint for review

Before writing backend integration code, we should review and sign off on:

- Exact table list and column definitions above.
- Whether to keep normalized assessment tables vs JSON storage.
- Whether to persist report learning resources as first-class table now or defer.
- Extension auth sharing strategy for Phase 5.

