export type Level =
  | 'beginner'
  | 'lower_intermediate'
  | 'higher_intermediate'
  | 'advanced'

export type PlayerStatus = 'waiting' | 'playing' | 'resting' | 'inactive'

export interface Player {
  id: string
  name: string
  initials: string
  level: Level
  rating: number
  gamesPlayed: number
  status: PlayerStatus
  joinedQueueAt: string
  lastMatchAt: string | null
  totalMatches: number
}

export interface Court {
  number: number
  status: 'available' | 'in_progress'
  playerIds: string[]
  startedAt: string | null
}

export interface CompletedMatch {
  id: string
  courtNumber: number
  playerIds: string[]
  winnerIds: string[]
  completedAt: string
}

export interface LevelSuggestion {
  id: string
  playerId: string
  suggestedLevel: Level
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface SessionState {
  id: string
  status: 'active' | 'closed'
  startedAt: string
  players: Player[]
  courts: Court[]
  matches: CompletedMatch[]
  suggestions: LevelSuggestion[]
}
