# Project Setup and Owner Checklist

This document lists the actions you need to take to move Rally Queue from the included local demo into a live multi-device application.

## What works now

The app can be run without any accounts or secrets. It includes:

- A mobile-first organizer dashboard with three courts
- Fair queue ordering by fewest games played, then longest wait
- Suggested doubles matches that start within a 150-point rating range and widen as needed
- Start, finish, and cancel match flows
- Team-average ELO updates using K=32 before 20 matches and K=16 afterward
- Games-played counters, resting status, activity history, and level review actions
- Browser persistence through `localStorage`; use **Reset demo session** in Profile to restore sample data
- Automated tests for the core queue and rating rules

Demo mode is intentionally single-browser. Supabase setup is required for real accounts and synchronized phones.

## 1. Install and run locally

Install Node.js 20 or newer, then run:

```bash
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

Before publishing a change, run:

```bash
npm test
npm run lint
npm run build
```

## 2. Create the Supabase project

1. Create a free project at `https://supabase.com` and save the database password in a password manager.
2. Open **SQL Editor** in the Supabase dashboard.
3. Run `supabase/migrations/202608070001_initial_schema.sql`.
4. Open **Project Settings > API** and copy the Project URL and publishable/anon key.
5. Copy `.env.example` to `.env.local` and fill in:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Never put the service-role key in this frontend project. Never commit `.env.local`; it is already ignored by Git.

## 3. Create the organizer account

The first production organizer must be promoted manually:

1. Create an account through Supabase Authentication or the app after authentication UI is connected.
2. In **Table Editor > players**, locate that account.
3. Change `is_admin` from `false` to `true`.

Only admins can manage sessions, matches, rating history, and level decisions under the included Row Level Security policies.

## 4. Connect production data

The database client is initialized in `src/lib/supabase.ts`, but the current screens intentionally use `src/hooks/useSession.ts` and local demo data. The remaining production integration work is:

1. Add `/login` and `/signup` screens using Supabase email/password authentication. Include `name` and `level` in signup metadata; the database trigger creates the player profile and starting rating.
2. Replace local session reads/writes in `useSession.ts` with Supabase queries for `sessions`, `session_players`, `matches`, and `level_change_suggestions`.
3. Subscribe to Realtime changes for those four tables and refresh the affected state.
4. Move match completion and ELO updates into one database function or Edge Function before real use. This transaction must update the match, four player ratings, four rating-history rows, and session counters atomically.
5. Keep player profile edits within the included column permissions. The migration grants players access to update `name` only; queue status changes belong in `session_players`. Ratings, levels, match counts, and admin access remain protected.
6. Add server-side validation that every match player belongs to the active session and is not active on another court.

Do not use client-side ELO as the production source of truth. It is suitable for the demo but can be manipulated in a browser.

## 5. Configure authentication

In **Supabase > Authentication > URL Configuration**:

- Set the Site URL to the final Vercel URL.
- Add `http://localhost:5173` as a redirect URL for development.
- Add your Vercel preview URL pattern if you test preview deployments.
- Decide whether email confirmation stays enabled. If enabled, configure a sender and test the confirmation flow before inviting players.

## 6. Deploy to Vercel

1. Push this repository to GitHub.
2. Import it into Vercel; the framework should be detected as Vite.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Project Settings > Environment Variables** for Production and Preview.
4. Deploy and update the Supabase Site URL to the resulting domain.
5. Test signup, login, queue joining, a complete four-player match, cancellation, and session closing from at least two devices.

The Vercel build command is `npm run build` and the output directory is `dist`.

## 7. Launch checklist

- Create one organizer account and verify non-admin accounts cannot access organizer writes.
- Create a session with the venue's actual court count, from 1 to 4.
- Test with at least five accounts so waiting and active players are visible at the same time.
- Confirm a cancelled match changes no ratings and returns players to the queue.
- Manually verify one ELO result against the formula in `docs/RULES.md`.
- Test on the organizer's phone in bright light and with a weak connection.
- Back up the database before changing schema or rating logic after launch.
- Decide whether level-down suggestions are enabled; the current MVP presents level-up suggestions only.

## Known boundaries

- The current demo uses doubles only, matching the four-player court flow.
- Dates and venue text in the demo dashboard are sample content.
- Session reopening is available for demonstration; production should normally make a closed session immutable as required by `RULES.md`.
- Production match completion still needs an atomic server-side function, as described above.
- Notifications, tournament mode, multi-venue support, payments, and dedicated doubles ratings remain post-MVP features.
