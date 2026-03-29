# Phase

Phase is a mobile-first personal fitness operating system built as a local-first MVP with Next.js, TypeScript, Tailwind CSS, Framer Motion, Recharts, and an optional Supabase sync layer.

It is designed for one user who wants a premium daily execution dashboard for training, nutrition, hydration, supplements, and progress trends without the friction of meal-by-meal calorie tracking.

## Setup

Requirements:

- Node.js 20+
- npm 10+

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Type-check:

```bash
npm run typecheck
```

Optional Supabase env:

1. Copy `.env.example` to `.env.local`
2. Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PHASE_APP_STATE_ID=primary
```

3. Run the SQL in [supabase/migrations/001_phase_app_state.sql](C:\Users\niedd\OneDrive\Documenti\My Fitness app\supabase\migrations\001_phase_app_state.sql)

Without these values, the app stays fully local-first.

## Commands

- `npm run dev`: starts the Next.js dev server
- `npm run build`: creates a production build
- `npm run start`: serves the production build
- `npm run typecheck`: runs TypeScript without emitting files

## Architecture

The app uses the App Router and a local-first client store.

Core principles:

- The weekly calendar is the source of truth
- Calendar day type resolves ON/OFF nutrition mode
- Daily targets are derived from the resolved mode
- Screens share a strongly typed app state
- Persistence is local-first for MVP, but storage boundaries are clean enough to swap later

Main structure:

- `src/app`: Next.js app shell and global styles
- `src/components/app-shell.tsx`: sticky top context, bottom navigation, screen switching
- `src/components/screens/*`: main mobile screens for Today, Calendar, Log, Meals, Progress, Settings
- `src/components/ui.tsx`: shared UI primitives
- `src/lib/types.ts`: domain models
- `src/lib/seed.ts`: seeded demo data
- `src/lib/store.tsx`: local-first state container and persistence
- `src/lib/insights.ts`: deterministic rules-based insight engine
- `src/lib/supabase/*`: Supabase config and client/server helpers
- `src/app/api/app-state/route.ts`: server route used for remote state sync
- `public/manifest.webmanifest` and `public/sw.js`: PWA setup

Storage model:

- `settings`
- `calendarDays`
- `dailyLogs`
- `workoutTemplates`
- `workoutSessions`
- `mealVariants`
- `progressEntries`
- `photos`

## Product Notes

Implemented MVP areas:

- mobile-first dark UI with premium card-based layout
- bottom tab navigation
- Today dashboard with daily completion and deterministic insights
- weekly calendar as scheduling engine
- ON/OFF nutrition target resolution from calendar
- fast daily logging for macros, hydration, supplements, recovery markers, and notes
- meal planner with ON/OFF meal variants, favorites, copy, and shopping list
- progress charts for weight, waist, adherence, and key lift summaries
- settings for targets, app naming, supplements, import/export, and reset
- seeded workout templates and workout logbook guidance
- local persistence via `localStorage`
- optional Supabase backup/sync via a server route and JSON app-state table
- installable PWA shell with offline-friendly cached core assets

## Tradeoffs

- Persistence stays local-first by default. Supabase is layered in as an optional remote sync target so the app still works with zero backend setup.
- The insight engine is deterministic and rules-based by design. This keeps the MVP useful and trustworthy without pretending to be AI.
- Photos are stored as data URLs locally, which is fine for MVP but not ideal for long-term storage footprint.
- The current Supabase integration stores the whole app state as a single JSON document in `app_state`. This keeps migration simple, but finer-grained tables are the better next step for collaboration, history, and more selective syncing.
- The included SQL policy is intentionally permissive for a one-user MVP with no auth yet. Before any public deployment, add Supabase Auth and tighten RLS.
- The current navigation is single-screen client state rather than route-per-tab to keep the phone flow fast and reduce complexity.
- shadcn/ui was approximated with typed reusable primitives instead of pulling the full CLI-generated component set, which keeps the codebase lighter in this MVP scaffold.

## Future Improvements

- swap storage from `localStorage` to IndexedDB or Supabase
- replace whole-document sync with normalized Supabase tables and row-level updates
- add Supabase Auth before any multi-device public deployment
- add real workout session editing with per-set input and progression suggestions
- add recurring weekly schedule presets and richer month planning
- add better offline caching and update handling
- add user-uploaded icons and branding controls
- split tabs into route segments if deep-linking becomes important
- add more granular adherence analytics and phase-aware recommendations

## Verification

The current codebase has been verified with:

- `npm run typecheck`
- `npm run build`
