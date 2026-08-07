import type { SessionState } from '../types'

const baseTime = '2026-08-07T10:00:00.000Z'

export const demoSession: SessionState = {
  id: 'demo-session',
  status: 'active',
  startedAt: baseTime,
  players: [
    { id: 'maya', name: 'Maya Santos', initials: 'MS', level: 'higher_intermediate', rating: 1512, gamesPlayed: 2, status: 'playing', joinedQueueAt: baseTime, lastMatchAt: '2026-08-07T10:42:00.000Z', totalMatches: 18 },
    { id: 'enzo', name: 'Enzo Reyes', initials: 'ER', level: 'higher_intermediate', rating: 1478, gamesPlayed: 2, status: 'playing', joinedQueueAt: baseTime, lastMatchAt: '2026-08-07T10:42:00.000Z', totalMatches: 27 },
    { id: 'lea', name: 'Lea Lim', initials: 'LL', level: 'lower_intermediate', rating: 1386, gamesPlayed: 2, status: 'playing', joinedQueueAt: baseTime, lastMatchAt: '2026-08-07T10:42:00.000Z', totalMatches: 14 },
    { id: 'nico', name: 'Nico Cruz', initials: 'NC', level: 'higher_intermediate', rating: 1442, gamesPlayed: 2, status: 'playing', joinedQueueAt: baseTime, lastMatchAt: '2026-08-07T10:42:00.000Z', totalMatches: 22 },
    { id: 'bea', name: 'Bea Garcia', initials: 'BG', level: 'lower_intermediate', rating: 1334, gamesPlayed: 1, status: 'waiting', joinedQueueAt: baseTime, lastMatchAt: '2026-08-07T10:24:00.000Z', totalMatches: 8 },
    { id: 'kai', name: 'Kai Mendoza', initials: 'KM', level: 'lower_intermediate', rating: 1360, gamesPlayed: 1, status: 'waiting', joinedQueueAt: baseTime, lastMatchAt: '2026-08-07T10:28:00.000Z', totalMatches: 11 },
    { id: 'tina', name: 'Tina Ramos', initials: 'TR', level: 'lower_intermediate', rating: 1288, gamesPlayed: 1, status: 'waiting', joinedQueueAt: baseTime, lastMatchAt: '2026-08-07T10:31:00.000Z', totalMatches: 6 },
    { id: 'omar', name: 'Omar Sy', initials: 'OS', level: 'beginner', rating: 1176, gamesPlayed: 1, status: 'waiting', joinedQueueAt: baseTime, lastMatchAt: '2026-08-07T10:34:00.000Z', totalMatches: 4 },
    { id: 'ria', name: 'Ria Torres', initials: 'RT', level: 'beginner', rating: 1132, gamesPlayed: 2, status: 'waiting', joinedQueueAt: baseTime, lastMatchAt: '2026-08-07T10:15:00.000Z', totalMatches: 9 },
    { id: 'jules', name: 'Jules Tan', initials: 'JT', level: 'advanced', rating: 1674, gamesPlayed: 2, status: 'resting', joinedQueueAt: baseTime, lastMatchAt: '2026-08-07T10:38:00.000Z', totalMatches: 41 },
  ],
  courts: [
    { number: 1, status: 'in_progress', playerIds: ['maya', 'enzo', 'lea', 'nico'], startedAt: '2026-08-07T10:48:00.000Z' },
    { number: 2, status: 'available', playerIds: [], startedAt: null },
    { number: 3, status: 'available', playerIds: [], startedAt: null },
  ],
  matches: [
    { id: 'match-1', courtNumber: 2, playerIds: ['bea', 'kai', 'ria', 'omar'], winnerIds: ['bea', 'kai'], completedAt: '2026-08-07T10:24:00.000Z' },
    { id: 'match-2', courtNumber: 1, playerIds: ['maya', 'enzo', 'lea', 'nico'], winnerIds: ['maya', 'enzo'], completedAt: '2026-08-07T10:42:00.000Z' },
  ],
  suggestions: [
    { id: 'suggestion-1', playerId: 'lea', suggestedLevel: 'higher_intermediate', reason: 'Won 3 of the last 5 matches against Higher Intermediate players; rating reached 1,406.', status: 'pending' },
  ],
}
