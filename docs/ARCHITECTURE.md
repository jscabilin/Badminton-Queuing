# Architecture Document
## Badminton Court Queue & Fair-Play Rating System

**Status:** Draft v1.0

---

## 1. Tech Stack Summary
| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Fast to build, huge AI-assisted-coding support, free hosting |
| Backend / DB | Supabase (Postgres) | Free tier, built-in Auth + Realtime, no custom server needed |
| Auth | Supabase Auth | Handles player login/signup out of the box |
| Realtime | Supabase Realtime (Postgres change subscriptions) | Live queue/court updates without polling |
| Hosting (frontend) | Vercel (free tier) | One-click deploy from GitHub, free SSL |
| Hosting (backend) | Supabase (managed, free tier) | No server to maintain |
| Rating logic | Client-side function or Supabase Edge Function | ELO math is lightweight, doesn't need a heavy backend |

No custom backend server (e.g., FastAPI/Node/Express) is required for MVP — Supabase's client library talks directly to Postgres with Row Level Security (RLS) rules protecting data. This keeps the project buildable by a beginner.

## 2. System Overview
```
[Player's Phone Browser] ──┐
                            ├──> [React App on Vercel] ──> [Supabase Client SDK]
[Organizer's Tablet/Phone]─┘                                    │
                                                                 ▼
                                                   [Supabase: Postgres DB + Auth + Realtime]
                                                                 │
                                                     (optional) [Edge Function: ELO calc]
```

## 3. Frontend Architecture
- **Framework:** React (Vite build) — single-page app
- **Styling:** Tailwind CSS for fast, consistent styling without writing custom CSS
- **State management:** React state + Supabase Realtime subscriptions (no Redux needed at this scale)
- **Key views/pages:**
  - `/login` — player/organizer login & signup
  - `/dashboard` — session view: courts, queue, games-played counter
  - `/profile` — player's own stats, rating, level, history
  - `/admin` — organizer-only: manage session, confirm matches, approve level changes

## 4. Backend / Database (Supabase)
Supabase provides:
- Managed Postgres database
- Auth (email/password or magic link login)
- Row Level Security (RLS) — e.g., a player can only edit their own profile, only admins can approve level changes
- Realtime subscriptions — frontend subscribes to changes in `matches` and `queue` tables so all devices update live

## 5. Database Schema (MVP)

**players**
| column | type | notes |
|---|---|---|
| id | uuid (PK) | matches Supabase auth user id |
| name | text | |
| self_tagged_level | text | beginner / lower_intermediate / higher_intermediate / advanced |
| current_level | text | system-tracked, may differ from self-tag after promotions |
| rating | integer | ELO-style rating, default seeded per level (see Rules.md) |
| is_admin | boolean | default false |
| created_at | timestamp | |

**sessions**
| column | type | notes |
|---|---|---|
| id | uuid (PK) | |
| date | date | |
| status | text | active / closed |
| court_count | integer | 1-4 |

**session_players** (join table — tracks per-session stats)
| column | type | notes |
|---|---|---|
| id | uuid (PK) | |
| session_id | uuid (FK) | |
| player_id | uuid (FK) | |
| games_played | integer | resets to 0 each session |
| status | text | waiting / playing / resting |

**matches**
| column | type | notes |
|---|---|---|
| id | uuid (PK) | |
| session_id | uuid (FK) | |
| court_number | integer | |
| player_ids | uuid[] | 2 (singles) or 4 (doubles) |
| winner_ids | uuid[] | nullable until match ends |
| status | text | in_progress / completed |
| created_at | timestamp | |
| completed_at | timestamp | nullable |

**rating_history**
| column | type | notes |
|---|---|---|
| id | uuid (PK) | |
| player_id | uuid (FK) | |
| match_id | uuid (FK) | |
| rating_before | integer | |
| rating_after | integer | |
| created_at | timestamp | |

**level_change_suggestions**
| column | type | notes |
|---|---|---|
| id | uuid (PK) | |
| player_id | uuid (FK) | |
| suggested_level | text | |
| reason | text | e.g. "3 wins vs higher_intermediate in last 5 matches" |
| status | text | pending / approved / rejected |
| created_at | timestamp | |

## 6. Authentication & Authorization
- Supabase Auth handles signup/login (email + password is simplest for MVP)
- `is_admin` flag on the `players` table determines organizer access
- RLS policies:
  - Players can `SELECT`/`UPDATE` only their own row in `players`
  - Only `is_admin = true` can update `matches.status`, approve `level_change_suggestions`, or manage `sessions`
  - All authenticated users can `SELECT` session/queue/court data (read-only for players)

## 7. Real-time Updates
- Frontend subscribes to Postgres changes on `matches` and `session_players` via Supabase Realtime
- When a match is marked "completed," all connected clients (players' phones, organizer's tablet) update automatically — no manual refresh

## 8. API / Data Access Layer
- No custom REST API needed — Supabase auto-generates a REST/PostgREST API and provides a JS client (`@supabase/supabase-js`)
- Rating calculation can live in:
  - **Option A (simpler):** a JS function in the frontend, called when organizer submits a match result
  - **Option B (more robust):** a Supabase Edge Function triggered on match completion — keeps rating logic server-side and tamper-proof
  - **Recommendation for MVP:** start with Option A, migrate to Option B later if needed

## 9. Deployment Architecture
1. Push code to GitHub repo
2. Connect repo to Vercel → auto-deploys frontend on every push to `main`
3. Supabase project hosts the database — connection via environment variables (Supabase URL + anon key) stored in Vercel project settings
4. No server maintenance required

## 10. Scalability & Future Considerations
- Current schema supports multiple sessions/dates already (via `sessions` table) — makes multi-day history free
- Multi-venue support would require adding a `venues` table and linking `sessions.venue_id`
- If rating logic grows complex (e.g., doubles-specific rating, decay over time), move fully to Edge Functions
