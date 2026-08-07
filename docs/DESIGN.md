# Design Document
## Badminton Court Queue & Fair-Play Rating System

**Status:** Draft v1.0

---

## 1. Design Principles
- **Glanceable:** organizer should understand the whole session state in under 5 seconds
- **Mobile-first:** built and tested for phone browser first, since it's used courtside
- **Low-friction for players:** checking in, viewing stats, and understanding your level should take no more than 2 taps
- **Assistive, not automatic:** the system suggests (level changes, next match-up), the organizer confirms

## 2. User Flows

### Flow A — Player joins a session
1. Player opens app on phone → logs in
2. Sees "Join Today's Session" button → taps it
3. Lands on dashboard showing: their position/status (waiting/playing), their games played today, current queue

### Flow B — Organizer runs a match
1. Organizer opens `/admin` view
2. Sees suggested next match-up per free court (auto-suggested based on fewest games played + similar rating)
3. Taps "Start Match" → court status updates to "in progress" for all viewers
4. After the game, organizer taps "End Match" → enters winner → ratings update automatically
5. If a level-change is triggered, a small notification badge appears for organizer to review

### Flow C — Player checks their profile
1. Player taps "My Profile"
2. Sees: current level, rating number (optional — can hide raw number and just show a progress bar toward next level), match history, games played today

### Flow D — Level-up suggestion review
1. Organizer sees a badge: "1 pending suggestion"
2. Opens list → sees player name, current level, suggested level, and reason (e.g., "Won 3 of last 5 vs Higher Intermediate")
3. Taps Approve or Dismiss

## 3. Screens / Pages

| Screen | Purpose | Key elements |
|---|---|---|
| Login/Signup | Auth entry point | Name, email, password, "I'm a: [level]" selector on signup |
| Dashboard (Player view) | Session status | Queue position, games played today, current court status |
| Dashboard (Admin view) | Session control | 4 court cards, live queue list, "Start/End Match" buttons |
| Profile | Personal stats | Level, rating/progress bar, match history list |
| Level Suggestions | Admin review queue | List of pending suggestions with approve/reject |
| Session Setup | Start of day | Organizer sets number of active courts, opens session |

## 4. Component List (for the build)
- `CourtCard` — shows court number, current players, match status, timer (optional)
- `QueueList` — ordered list of waiting players with games-played count
- `PlayerBadge` — small chip showing name + level (color-coded)
- `MatchResultModal` — form to submit winner after a match
- `LevelSuggestionCard` — shows suggestion + approve/reject buttons
- `ProfileStatsPanel` — rating, level, history

## 5. Visual Style Guide
- **Style:** clean, high-contrast, readable in outdoor/gym lighting on a phone screen
- **Color coding by level** (for quick visual scanning):
  - Beginner → Green
  - Lower Intermediate → Blue
  - Higher Intermediate → Orange
  - Advanced → Red/Purple
- **Typography:** simple sans-serif (system font stack is fine — no custom font loading needed for MVP)
- **Layout:** card-based, generous tap targets (courtside use means quick taps, not precise clicks)

## 6. Responsive / Mobile Considerations
- Design mobile-first (most usage will be on phones courtside)
- Organizer's admin view should also work fine on a tablet if available, but must not require it
- Avoid hover-dependent interactions (no hover tooltips as the only way to see info)

## 7. Accessibility Notes
- Don't rely on color alone for level indication — always pair color with a text label (e.g., "Beginner" text next to the green badge)
- Ensure tap targets are large enough for use with sweaty hands / while standing
