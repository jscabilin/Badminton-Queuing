import { describe, expect, it } from 'vitest'
import type { Player } from '../types'
import { calculateRating, expectedScore, sortQueue, suggestMatch } from './rules'

const player = (overrides: Partial<Player>): Player => ({
  id: 'player',
  name: 'Player',
  initials: 'P',
  level: 'beginner',
  rating: 1100,
  gamesPlayed: 0,
  status: 'waiting',
  joinedQueueAt: '2026-08-07T08:00:00.000Z',
  lastMatchAt: null,
  totalMatches: 0,
  ...overrides,
})

describe('queue fairness', () => {
  it('prioritizes fewer games, then longest wait', () => {
    const players = [
      player({ id: 'a', gamesPlayed: 1 }),
      player({ id: 'b', joinedQueueAt: '2026-08-07T08:10:00.000Z' }),
      player({ id: 'c', joinedQueueAt: '2026-08-07T08:05:00.000Z' }),
      player({ id: 'd', status: 'resting' }),
    ]

    expect(sortQueue(players).map(({ id }) => id)).toEqual(['c', 'b', 'a'])
  })

  it('returns a complete doubles group only', () => {
    const players = ['a', 'b', 'c'].map((id) => player({ id }))
    expect(suggestMatch(players)).toEqual([])
  })

  it('widens the rating range when needed', () => {
    const players = [1100, 1200, 1280, 1310].map((rating, index) =>
      player({ id: String(index), rating }),
    )
    expect(suggestMatch(players).map(({ id }) => id)).toEqual(['0', '1', '2', '3'])
  })
})

describe('ELO ratings', () => {
  it('gives equal teams a 50% expected score', () => {
    expect(expectedScore(1400, 1400)).toBe(0.5)
  })

  it('uses K=32 for a new player and K=16 after 20 matches', () => {
    expect(calculateRating(1400, 1400, true, 5)).toBe(1416)
    expect(calculateRating(1400, 1400, true, 20)).toBe(1408)
  })
})
