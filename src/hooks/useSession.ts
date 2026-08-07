import { useEffect, useState } from 'react'
import { demoSession } from '../data/demo'
import type { LevelSuggestion, PlayerStatus, SessionState } from '../types'
import { completeMatch, cancelMatch, startSuggestedMatch } from '../lib/session'

const STORAGE_KEY = 'rally-queue-demo-v1'

function loadSession(): SessionState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) as SessionState : structuredClone(demoSession)
  } catch {
    return structuredClone(demoSession)
  }
}

export function useSession() {
  const [session, setSession] = useState<SessionState>(loadSession)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [session])

  return {
    session,
    startMatch: (courtNumber: number) => setSession((state) => startSuggestedMatch(state, courtNumber)),
    endMatch: (courtNumber: number, winnerIds: string[]) =>
      setSession((state) => completeMatch(state, courtNumber, winnerIds)),
    cancelMatch: (courtNumber: number) => setSession((state) => cancelMatch(state, courtNumber)),
    setPlayerStatus: (playerId: string, status: PlayerStatus) =>
      setSession((state) => ({
        ...state,
        players: state.players.map((player) =>
          player.id === playerId
            ? { ...player, status, joinedQueueAt: status === 'waiting' ? new Date().toISOString() : player.joinedQueueAt }
            : player,
        ),
      })),
    decideSuggestion: (suggestionId: string, decision: LevelSuggestion['status']) =>
      setSession((state) => {
        const suggestion = state.suggestions.find(({ id }) => id === suggestionId)
        return {
          ...state,
          suggestions: state.suggestions.map((item) =>
            item.id === suggestionId ? { ...item, status: decision } : item,
          ),
          players: decision === 'approved' && suggestion
            ? state.players.map((player) =>
                player.id === suggestion.playerId ? { ...player, level: suggestion.suggestedLevel } : player,
              )
            : state.players,
        }
      }),
    toggleSession: () => setSession((state) => ({ ...state, status: state.status === 'active' ? 'closed' : 'active' })),
    resetDemo: () => setSession(structuredClone(demoSession)),
  }
}
