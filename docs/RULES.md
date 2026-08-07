# Rules Document
## Business Rules & Game Logic — Badminton Court Queue & Fair-Play Rating System

**Status:** Draft v1.0

---

## 1. Player Categories & Starting Rating Bands
When a player self-tags on signup, they are seeded with a starting rating at the middle of their band:

| Level | Rating Band | Starting Rating |
|---|---|---|
| Beginner | 1000 - 1199 | 1100 |
| Lower Intermediate | 1200 - 1399 | 1300 |
| Higher Intermediate | 1400 - 1599 | 1500 |
| Advanced | 1600+ | 1650 |

`current_level` is derived from `rating` using these bands, but only updates automatically through the level-change suggestion + approval flow (see Section 3) — not instantly the moment rating crosses a line. This avoids level "flickering" from one good/bad match.

## 2. ELO-Style Rating System
Standard ELO formula, adapted for badminton matches:

**Expected score calculation:**
```
Expected_A = 1 / (1 + 10^((Rating_B - Rating_A) / 400))
```

**Rating update after a match:**
```
New_Rating_A = Rating_A + K * (Actual_A - Expected_A)
```
Where:
- `Actual_A` = 1 if Player A won, 0 if lost (0.5 each for a draw, if applicable)
- `K` = a constant controlling how much a single match can move the rating

**Recommended K-factor:** `K = 32` for players with fewer than 20 recorded matches (new players' ratings adjust faster), `K = 16` after that (ratings stabilize as more data comes in).

**Doubles matches:** treat the match as team-vs-team by averaging each team's rating, then apply the same formula to each individual player using their team's expected score.

## 3. Level-Up / Level-Down Suggestion Rules
A suggestion is generated (not auto-applied) when:
- **Level-up trigger:** player wins at least 3 of their last 5 matches against opponents from the next level up, **and** their rating has crossed into the next band
- **Level-down trigger:** player loses at least 4 of their last 5 matches against same-or-lower level opponents, **and** their rating has dropped below their current band — this is optional and can be disabled if you don't want auto-demotion suggestions (many casual groups prefer levels to only go up)

Each suggestion includes a human-readable reason (e.g., "Won 3 of last 5 vs Higher Intermediate, rating 1410") so the organizer can sanity-check before approving.

Suggestions expire or get dismissed after the session if not acted on — they can regenerate in a future session if conditions are still met.

## 4. Queue Fairness Rules
When suggesting who plays next:
1. **Primary sort:** fewest `games_played` this session goes first
2. **Tie-break:** longest time since their last match (waiting time)
3. Players marked "resting" (opted out temporarily) are skipped until they mark themselves "waiting" again

## 5. Match-Making Rules
When forming a match from the queue:
1. Take the top players by the Queue Fairness Rules (Section 4)
2. Prefer pairing/grouping players within **±150 rating points** of each other for a competitive, fair game
3. If not enough same-range players are waiting, widen the range in steps of 50 until a match can be formed
4. Organizer can always manually override the suggested match-up

## 6. Court Rotation Rules
- As soon as a court's match ends, it becomes available for the next suggested match-up
- If multiple courts free up at once, fill them in court-number order
- No player should be suggested for a second consecutive match while others are still waiting on their first game of the session (i.e., games_played = 0 players are always prioritized over games_played ≥ 1 players)

## 7. Session Rules
- A session is opened by the organizer at the start of the day and closed at the end
- `games_played` and queue status reset to 0/"waiting" for every new session
- `rating` and `current_level` persist across sessions (long-term skill tracking)
- Matches cannot be started/edited once a session is marked "closed"

## 8. Edge Cases
- **Odd number of players waiting for doubles:** system flags "waiting for 1 more player" rather than forming an incomplete match
- **New player, no rating history:** uses their self-tagged starting rating (Section 1) until their first match
- **Admin cancels a match mid-game:** match status set to "cancelled," no rating change applied, players return to the front of the queue
- **Player leaves early:** organizer can mark them "inactive" for the session so they stop appearing in the queue
