import type { Level, Player } from '../types'

export const LEVELS: Level[] = [
  'beginner',
  'lower_intermediate',
  'higher_intermediate',
  'advanced',
]

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: 'Beginner',
  lower_intermediate: 'Lower Intermediate',
  higher_intermediate: 'Higher Intermediate',
  advanced: 'Advanced',
}

export const STARTING_RATINGS: Record<Level, number> = {
  beginner: 1100,
  lower_intermediate: 1300,
  higher_intermediate: 1500,
  advanced: 1650,
}

export function sortQueue(players: Player[]): Player[] {
  return players
    .filter((player) => player.status === 'waiting')
    .toSorted((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) return a.gamesPlayed - b.gamesPlayed

      const aWait = a.lastMatchAt ?? a.joinedQueueAt
      const bWait = b.lastMatchAt ?? b.joinedQueueAt
      return new Date(aWait).getTime() - new Date(bWait).getTime()
    })
}

export function suggestMatch(players: Player[], size = 4): Player[] {
  const queue = sortQueue(players)
  if (queue.length < size) return []

  const priorityPool = queue.filter(
    (player) => player.gamesPlayed === queue[0].gamesPlayed,
  )
  const anchor = queue[0]

  for (let range = 150; range <= 600; range += 50) {
    const candidates = queue.filter(
      (player) => Math.abs(player.rating - anchor.rating) <= range,
    )
    const requiredPriority = priorityPool.filter((player) => candidates.includes(player))
    if (candidates.length >= size && requiredPriority.length > 0) {
      return candidates.slice(0, size)
    }
  }

  return queue.slice(0, size)
}

export function expectedScore(teamRating: number, opponentRating: number): number {
  return 1 / (1 + 10 ** ((opponentRating - teamRating) / 400))
}

export function calculateRating(
  rating: number,
  opponentTeamRating: number,
  won: boolean,
  totalMatches: number,
): number {
  const kFactor = totalMatches < 20 ? 32 : 16
  return Math.round(rating + kFactor * ((won ? 1 : 0) - expectedScore(rating, opponentTeamRating)))
}

export function averageRating(players: Player[]): number {
  return players.reduce((sum, player) => sum + player.rating, 0) / players.length
}

export function nextLevel(level: Level): Level | null {
  const index = LEVELS.indexOf(level)
  return index < LEVELS.length - 1 ? LEVELS[index + 1] : null
}

export function ratingCrossedInto(level: Level, rating: number): boolean {
  const target = nextLevel(level)
  return target !== null && rating >= STARTING_RATINGS[target] - 100
}
