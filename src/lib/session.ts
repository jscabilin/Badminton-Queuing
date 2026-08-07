import type { CompletedMatch, LevelSuggestion, Player, SessionState } from '../types'
import { averageRating, calculateRating, nextLevel, ratingCrossedInto, suggestMatch } from './rules'

export function startSuggestedMatch(state: SessionState, courtNumber: number): SessionState {
  if (state.status === 'closed') return state
  const suggested = suggestMatch(state.players)
  if (suggested.length < 4) return state

  const selectedIds = new Set(suggested.map(({ id }) => id))
  return {
    ...state,
    players: state.players.map((player) =>
      selectedIds.has(player.id) ? { ...player, status: 'playing' } : player,
    ),
    courts: state.courts.map((court) =>
      court.number === courtNumber
        ? { ...court, status: 'in_progress', playerIds: [...selectedIds], startedAt: new Date().toISOString() }
        : court,
    ),
  }
}

export function completeMatch(
  state: SessionState,
  courtNumber: number,
  winnerIds: string[],
): SessionState {
  const court = state.courts.find((item) => item.number === courtNumber)
  if (!court || court.status !== 'in_progress' || winnerIds.length !== 2) return state

  const matchPlayers = court.playerIds
    .map((id) => state.players.find((player) => player.id === id))
    .filter((player): player is Player => Boolean(player))
  const winners = matchPlayers.filter((player) => winnerIds.includes(player.id))
  const losers = matchPlayers.filter((player) => !winnerIds.includes(player.id))
  const winnerRating = averageRating(winners)
  const loserRating = averageRating(losers)
  const completedAt = new Date().toISOString()

  const players = state.players.map((player) => {
    if (!court.playerIds.includes(player.id)) return player
    const won = winnerIds.includes(player.id)
    return {
      ...player,
      rating: calculateRating(player.rating, won ? loserRating : winnerRating, won, player.totalMatches),
      gamesPlayed: player.gamesPlayed + 1,
      totalMatches: player.totalMatches + 1,
      status: 'waiting' as const,
      lastMatchAt: completedAt,
      joinedQueueAt: completedAt,
    }
  })

  const match: CompletedMatch = {
    id: crypto.randomUUID(),
    courtNumber,
    playerIds: court.playerIds,
    winnerIds,
    completedAt,
  }

  return {
    ...state,
    players,
    courts: state.courts.map((item) =>
      item.number === courtNumber
        ? { ...item, status: 'available', playerIds: [], startedAt: null }
        : item,
    ),
    matches: [match, ...state.matches],
    suggestions: generateSuggestions(players, [match, ...state.matches], state.suggestions),
  }
}

export function cancelMatch(state: SessionState, courtNumber: number): SessionState {
  const court = state.courts.find((item) => item.number === courtNumber)
  if (!court || court.status !== 'in_progress') return state
  const returned = new Set(court.playerIds)
  const queueTime = new Date(Date.now() - 60_000).toISOString()

  return {
    ...state,
    players: state.players.map((player) =>
      returned.has(player.id)
        ? { ...player, status: 'waiting', joinedQueueAt: queueTime }
        : player,
    ),
    courts: state.courts.map((item) =>
      item.number === courtNumber
        ? { ...item, status: 'available', playerIds: [], startedAt: null }
        : item,
    ),
  }
}

function generateSuggestions(
  players: Player[],
  matches: CompletedMatch[],
  existing: LevelSuggestion[],
): LevelSuggestion[] {
  const pendingPlayerIds = new Set(
    existing.filter(({ status }) => status === 'pending').map(({ playerId }) => playerId),
  )
  const additions: LevelSuggestion[] = []

  for (const player of players) {
    const target = nextLevel(player.level)
    if (!target || pendingPlayerIds.has(player.id) || !ratingCrossedInto(player.level, player.rating)) continue

    const recent = matches.filter(({ playerIds }) => playerIds.includes(player.id)).slice(0, 5)
    const winsUp = recent.filter((match) => {
      if (!match.winnerIds.includes(player.id)) return false
      return match.playerIds.some((id) => {
        const opponent = players.find((candidate) => candidate.id === id)
        return opponent?.level === target && !match.winnerIds.includes(id)
      })
    }).length

    if (recent.length === 5 && winsUp >= 3) {
      additions.push({
        id: crypto.randomUUID(),
        playerId: player.id,
        suggestedLevel: target,
        reason: `Won ${winsUp} of the last 5 matches against higher-level opponents; rating reached ${player.rating.toLocaleString()}.`,
        status: 'pending',
      })
    }
  }

  return [...additions, ...existing]
}
