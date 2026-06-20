# Evitrace

**Engineering competency tracking and promotion readiness, built for individual contributors.**

Evitrace helps software engineers systematically capture evidence of their work, track SMART objectives, run structured promotion reviews, and get clear visibility into where they stand against their target level — all in one place.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Chrome Extension (Preview)](#chrome-extension-preview)
- [Contributing](#contributing)

---

## Overview

Evitrace replaces the spreadsheets, scattered notes, and memory-reliant promotion conversations that most engineers rely on. It gives you a structured system to:

- Log evidence from real work across tools like GitHub, Jira, Slack, and Confluence
- Define and track SMART objectives with measurable success criteria
- Run structured 360° promotion reviews with your manager
- Visualise your readiness across competency dimensions with a radar chart
- Get your manager's approval workflow built in, not bolted on

The app is built with a Supabase backend (Postgres + Auth + Storage), TanStack Start (React 19 + Vite), and TanStack Query for all server-state management. Every piece of data is user-scoped with Row Level Security — no one else can see your records.

---

## Features

### Dashboard
The home view surfaces the most important information at a glance:

- **Evidence This Quarter** — count of non-archived evidence entries in the current quarter
- **Current Streak** — consecutive calendar days with at least one evidence entry logged
- **Pending Review** — combined count of evidence awaiting manager review and objectives awaiting approval
- **Recent Evidence** — the five most recently added entries
- **Current Focus Areas** — objectives currently in progress
- **Action Inbox** — auto-captured integration events waiting to be mapped to evidence or dismissed

### Evidence Log
A chronological, searchable log of everything you've done that demonstrates your competencies:

- Add evidence manually via the Capture Modal (source, competency, category, title, description, link)
- Review and edit entries including manager notes and match state (Yes / No / Somewhat)
- Archive entries to keep your active list clean without losing history
- Restore or permanently delete archived entries
- Filter by competency, status, and date

### Objectives
SMART objective tracking with a Kanban-style board:

- Create objectives with full SMART fields (Specific, Measurable, Achievable, Relevant, Time-bound)
- Move objectives through **Pending Approval → In Progress → Completed**
- Completing an objective automatically creates a linked evidence entry
- Define success criteria across three dimensions: Learn, Demonstrate, and Share
- Archive, restore, or delete objectives as needed

### Promotion Readiness Radar
A visual radar chart that maps your current scores across competency categories and shows the gap to your target level:

- Driven by finalised assessment data — no manual radar input required
- Shows Top Strength and Primary Gap at a glance
- Hierarchical gap analysis breaks down each category to question level
- Comparison against previous assessment cycle built in

### Review Wizard
A step-by-step promotion review tool:

- Walk through each competency category and score yourself with justification
- Attach supporting evidence entries to each question
- Finalize the session to persist a full assessment snapshot
- Assessment data feeds directly into the radar and report views

### Reviews & Reports
A record of all past promotion review sessions:

- View full assessment history
- Edit 1-on-1 discussion topics
- Access archived assessments and previous cycles
- Open any historical assessment to re-enter the scoring detail view

### 360° Feedback
Log and manage feedback from peers, managers, and stakeholders:

- Add feedback requests (Manager Requested, Ad-hoc, Peer Review)
- Filter entries by type
- Anonymous feedback entries supported

### Settings
Full control over your profile and the app's behaviour:

- **Profile** — name, email, current level, target level, job title
- **Team** — manager, manager email, skip-level contact
- **Avatar** — upload a profile photo (stored in Supabase Storage)
- **Notifications** — configure daily reminders, manager approval alerts, weekly digest, and browser push
- **Integrations** — toggle per-source auto-capture (Jira, GitHub, Bitbucket, Slack, Teams, Confluence, Notion)
- **Framework** — upload a custom competency framework CSV/JSON to personalise the radar dimensions

### Extension Preview
A floating panel inside the web app that simulates the Chrome extension capture experience:

- Select a trigger source (based on your enabled integrations)
- Pick one or more competency tags
- Save directly to your Evidence Log without leaving your current context

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, Vite, TypeScript) |
| Routing | [TanStack Router](https://tanstack.com/router) |
| Server State | [TanStack Query v5](https://tanstack.com/query) |
| Backend | [Supabase](https://supabase.com) (Postgres, Auth, Storage) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| UI Components | [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com) |
| Charts | [Recharts](https://recharts.org) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Icons | [Lucide React](https://lucide.dev) |
| Package Manager | [Bun](https://bun.sh) |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0 or later
- A [Supabase](https://supabase.com) project (free tier works fine)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for running migrations locally)

### Installation

```bash
git clone https://github.com/your-org/evitrace.git
cd evitrace
bun install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Both values are available in your Supabase project under **Settings → API**. These are the public anon credentials — all data access is enforced at the database level via Row Level Security policies.

> The app will throw a clear error at startup if either variable is missing or empty.

### Database Setup

Apply all migrations to your Supabase project:

```bash
supabase db push
```

Or if running locally with the Supabase CLI:

```bash
supabase start
supabase db reset
```

The migrations in `supabase/migrations/` create all tables, indexes, RLS policies, and a shared trigger function. A dev seed file (`009_seed_dev.sql`) is included and guarded to only run against non-production databases.

After applying migrations, regenerate the TypeScript types:

```bash
supabase gen types typescript --local > src/lib/database.types.ts
```

### Running the App

```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

**Other scripts:**

```bash
bun run build        # Production build
bun run preview      # Preview production build locally
bun run lint         # ESLint
bun run format       # Prettier
bun run test         # Run tests (Vitest)
```

---

## Project Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client singleton
│   ├── database.types.ts    # Generated DB types (do not edit manually)
│   ├── auth.tsx             # AuthContext, AuthProvider, useAuth hook
│   └── api/
│       ├── mappers.ts       # DB row ↔ UI type converters (pure functions)
│       ├── evidence.ts      # Evidence query and mutation hooks
│       ├── inbox.ts         # Inbox query and mutation hooks
│       ├── objectives.ts    # Objectives query and mutation hooks
│       ├── assessments.ts   # Assessments query and mutation hooks
│       ├── feedback.ts      # Feedback query and mutation hooks
│       ├── profile.ts       # Profile query and mutation hooks
│       ├── settings.ts      # Settings query and mutation hooks
│       ├── frameworks.ts    # Framework query and mutation hooks
│       └── dashboard.ts     # Aggregated dashboard stats hook
├── components/
│   ├── ExtensionPopup.tsx   # Standalone extension preview component
│   └── ui/                  # shadcn/ui base components
├── routes/
│   ├── __root.tsx           # App shell, QueryClientProvider
│   └── index.tsx            # Main application (auth gate + all views)
supabase/
└── migrations/              # Numbered SQL migration files
extension/                   # Chrome extension scaffold (Phase 5)
```

---

## Database Schema

The schema mirrors the app's domain model exactly. Every table is user-scoped via `user_id` with Row Level Security enforced at the database level.

| Table | Purpose |
|---|---|
| `profiles` | User profile data (name, level, team, manager) |
| `user_settings` | Notification and integration toggle preferences (JSONB) |
| `evidence` | Evidence records with competency, status, and archive state |
| `inbox_events` | Auto-captured integration events pending review |
| `objectives` | SMART objectives with success criteria (JSONB) |
| `assessments` | Promotion review snapshots |
| `assessment_categories` | Per-category scores and summaries within an assessment |
| `assessment_questions` | Per-question scores with justification and evidence links |
| `feedback` | 360° feedback entries |
| `competency_frameworks` | Custom uploaded competency framework definitions |
| `competency_categories` | Categories and questions within a framework |

---

## Chrome Extension (Preview)

The floating **Extension Preview** panel in the web app simulates the future Chrome extension experience. The real extension scaffold lives in `extension/` and targets Manifest V3.

When built (`bun run build:extension`), it will:

- Share authentication with the web app via `chrome.storage.local`
- Inject content scripts into Jira, GitHub, Bitbucket, and Slack to detect completable events
- Write captured events to `inbox_events` via the same Supabase backend
- Fire daily reminder notifications based on your notification preferences

The extension is not yet published — it is available for local unpacked loading during development.

---

## Contributing

1. Fork the repository and create a feature branch
2. Run `bun install` and apply the database migrations
3. Make your changes — keep the no-CSS-change rule in mind for backend wiring tasks
4. Run `bun run test` and `bun tsc --noEmit` before opening a PR
5. Open a pull request against `main` with a clear description of what changed and why

---

*Built with care for engineers who want their promotion conversations to be about impact, not memory.*
