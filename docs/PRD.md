# Product Requirements Document (PRD)
## Badminton Court Queue & Fair-Play Rating System

**Status:** Draft v1.0
**Owner:** Jan
**Last updated:** 2026-08-07

---

## 1. Overview
A web app for managing badminton court queues at a single venue (1-4 courts) for casual weekend play. The system tags players, tracks how many games each player has played in a session (for fairness), categorizes players by skill level, and automatically suggests skill level changes based on match results using an ELO-style rating system.

## 2. Problem Statement
Casual badminton sessions currently rely on manual, memory-based queuing. This leads to:
- Uneven number of games played per person (some play a lot, others barely play)
- Mismatched skill pairings (beginners stuck against advanced players, or vice versa)
- No objective way to know when a player has actually improved enough to move up a level
- Manual tracking (paper/whiteboard) that doesn't scale past a few players

## 3. Goals & Objectives
- Ensure fair rotation: prioritize players with fewer games played in the session
- Maintain skill-appropriate matches using a rating system
- Automatically suggest level changes (not force them) based on real match performance
- Keep the tool simple enough to run from a phone browser at the court, no app install

## 4. Target Users
- **Players:** log in, see their own stats (games played, rating, current level, history)
- **Organizer/Admin:** manages courts, starts/ends sessions, confirms match results, approves level changes

## 5. Core Features (MVP)
1. **Player accounts** — sign up/login (name, self-tagged starting skill level)
2. **Player tagging & profile** — name, skill category, current rating, games played today
3. **Queue system** — players join a queue; system suggests next match-up per court based on:
   - Fewest games played first (fairness)
   - Similar rating range (skill-appropriate)
4. **Court management** — support 1-4 courts, show current match per court, mark match as "in progress" / "done"
5. **Match result entry** — organizer or players submit score/winner after each game
6. **ELO-style rating engine** — rating updates automatically after each submitted match
7. **Level-up/down suggestions** — system flags "Player X is performing above [level], suggest promotion" for admin to confirm
8. **Session view** — live dashboard showing courts, queue, and games-played-per-player count

## 6. Future Features (Post-MVP)
- Multi-venue support
- Doubles-specific rating (separate from singles)
- Player-vs-player head-to-head history
- Notifications (SMS/push) when it's your turn
- Tournament/bracket mode
- Analytics dashboard (most active players, level distribution over time)

## 7. User Stories
- As a **player**, I want to tag myself with a starting skill level so I can be matched fairly from day one.
- As a **player**, I want to see how many games I've played today so I know if I've been sitting out too long.
- As a **player**, I want the system to notice if I'm consistently beating higher-level players, so I get considered for a level-up.
- As an **organizer**, I want to see all 4 courts and the queue at a glance so I can manage the session without a whiteboard.
- As an **organizer**, I want to confirm or reject a suggested level change, so the system assists but doesn't fully auto-decide.

## 8. Success Metrics
- Games-played variance across players in a session is reduced (fairness achieved)
- At least 80% of matches are between players within a reasonable rating gap
- Organizer can run a full session (2-3 hours) without needing a manual whiteboard
- Level-up suggestions match what the organizer would have decided manually (validate against real sessions)

## 9. Out of Scope (Non-Goals) for MVP
- Payments/court booking fees
- Multi-venue/franchise support
- Native mobile app (web-only for now)
- Full machine learning model — MVP uses a deterministic ELO-style formula, not a trained ML model

## 10. Assumptions & Constraints
- Single venue, 1-4 courts, casual weekend sessions (not competitive league)
- Budget: ₱0 — must run entirely on free tiers
- Builder is a beginner, building primarily via AI-assisted ("vibe") coding
- Players log in themselves; there is also an organizer/admin role
