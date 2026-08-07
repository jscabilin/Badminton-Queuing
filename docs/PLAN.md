# Plan Document
## Development Plan — Badminton Court Queue & Fair-Play Rating System

**Status:** Draft v1.0

---

## 1. Development Approach
This project will be built via **AI-assisted "vibe coding"** — you describe what you want, an AI coding assistant (Claude Code, Cursor, etc.) writes the implementation, and you test/iterate in small steps. To make this work well:
- Keep each build step small (one feature at a time)
- Always test after each step before moving to the next
- Refer back to `RULES.md` and `ARCHITECTURE.md` when asking the AI to implement logic, so the assistant has the exact rules instead of guessing

## 2. Phases & Milestones

### Phase 0 — Setup (Day 1)
- Create GitHub repo, add these 5 docs
- Create Supabase project (free tier)
- Create Vercel project, connect to GitHub repo
- Scaffold React + Vite + Tailwind app, confirm it deploys ("Hello World" on Vercel)

### Phase 1 — Auth & Player Profiles
- Implement Supabase Auth (signup/login)
- Build signup flow with self-tagged level selection
- Build basic profile page showing name, level, rating (seeded value)

### Phase 2 — Session & Queue Core
- Build "Session Setup" (organizer opens a session, sets court count)
- Build queue join flow (player marks self "waiting")
- Build dashboard showing live queue ordered by fairness rules

### Phase 3 — Match Flow
- Build court cards showing current match
- Build "Start Match" / "End Match" + result submission
- Implement ELO rating update on match completion
- Implement games_played counter increment

### Phase 4 — Fairness & Match-Making Logic
- Implement queue sorting (fewest games played, then wait time)
- Implement suggested match-up logic (rating range ±150, widening as needed)

### Phase 5 — Level-Up/Down Suggestions
- Implement suggestion-generation logic (Rules.md Section 3)
- Build admin review UI (approve/reject)
- On approval, update `current_level`

### Phase 6 — Polish
- Color-coded level badges
- Mobile responsiveness pass
- Empty states (no players in queue, no active session, etc.)

## 3. MVP Scope Checklist
- [ ] Player signup/login with self-tagged level
- [ ] Organizer can open/close a session and set court count
- [ ] Players can join the queue and see their position
- [ ] Fair queue ordering (fewest games played first)
- [ ] Match-making suggestion within rating range
- [ ] Match result submission updates ELO rating
- [ ] Level-up/down suggestions with organizer approval
- [ ] Live updates across devices (Realtime)
- [ ] Mobile-friendly layout

## 4. Suggested Build Order (for vibe-coding sessions)
1. Static UI first (no data) — get the screens looking right with fake/sample data
2. Wire up Supabase Auth — real login
3. Wire up database reads (show real queue/session data)
4. Wire up database writes (join queue, start/end match)
5. Add rating calculation logic last — it's the most "rules-heavy" piece, easiest to get right once the rest works

## 5. Testing Plan
- Manually test with a small group (3-5 people) before a full session
- Check fairness: after a mock session, confirm games_played counts are close to even
- Check rating math: manually calculate expected ELO change for a test match and compare to what the app produced
- Test on an actual phone browser courtside conditions (bright light, one-handed use)

## 6. Deployment Steps
1. `git push` to `main` branch → Vercel auto-deploys
2. Confirm environment variables (Supabase URL + anon key) are set in Vercel project settings, not hardcoded in the repo
3. Run a smoke test on the live URL after each deploy (login, join queue, submit a match)

## 7. Post-Launch / Iteration Plan
- Collect feedback after first 2-3 real sessions (what felt confusing, what fairness issues came up)
- Revisit K-factor or rating bands if level suggestions feel off in practice
- Consider Phase 2 features (doubles-specific rating, multi-venue) only after MVP is stable through several real sessions
