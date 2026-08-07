import { describe, expect, it } from 'vitest'
import { demoSession } from '../data/demo'
import { cancelMatch, completeMatch, startSuggestedMatch } from './session'

describe('session match lifecycle', () => {
  it('starts a suggested match on an available court', () => {
    const state = startSuggestedMatch(structuredClone(demoSession), 2)
    const court = state.courts.find(({ number }) => number === 2)

    expect(court?.status).toBe('in_progress')
    expect(court?.playerIds).toHaveLength(4)
    expect(state.players.filter(({ status }) => status === 'playing')).toHaveLength(8)
  })

  it('completes a match and updates ratings, counts, and queue state', () => {
    const state = structuredClone(demoSession)
    const before = state.players.find(({ id }) => id === 'maya')!
    const result = completeMatch(state, 1, ['maya', 'enzo'])
    const winner = result.players.find(({ id }) => id === 'maya')!
    const loser = result.players.find(({ id }) => id === 'lea')!

    expect(winner.rating).toBeGreaterThan(before.rating)
    expect(loser.rating).toBeLessThan(1406)
    expect(winner.gamesPlayed).toBe(before.gamesPlayed + 1)
    expect(winner.status).toBe('waiting')
    expect(result.courts[0].status).toBe('available')
    expect(result.matches).toHaveLength(state.matches.length + 1)
  })

  it('cancels without changing ratings or game counts', () => {
    const state = structuredClone(demoSession)
    const before = state.players.find(({ id }) => id === 'maya')!
    const result = cancelMatch(state, 1)
    const after = result.players.find(({ id }) => id === 'maya')!

    expect(after.rating).toBe(before.rating)
    expect(after.gamesPlayed).toBe(before.gamesPlayed)
    expect(after.status).toBe('waiting')
    expect(result.courts[0].status).toBe('available')
  })
})