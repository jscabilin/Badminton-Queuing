import { Trophy, X } from 'lucide-react'
import type { Court, Player } from '../types'

interface MatchResultModalProps {
  court: Court
  players: Player[]
  onSubmit: (winnerIds: string[]) => void
  onCancelMatch: () => void
  onClose: () => void
}

export function MatchResultModal({ court, players, onSubmit, onCancelMatch, onClose }: MatchResultModalProps) {
  const matchPlayers = court.playerIds
    .map((id) => players.find((player) => player.id === id))
    .filter((player): player is Player => Boolean(player))
  const teams = [matchPlayers.slice(0, 2), matchPlayers.slice(2, 4)]

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="result-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close result dialog"><X size={20} /></button>
        <span className="eyebrow">Court {court.number}</span>
        <h2 id="result-title">Who won the rally?</h2>
        <p className="modal-copy">Choose the winning pair. Ratings and queue positions update instantly.</p>
        <div className="winner-options">
          {teams.map((team, index) => (
            <button className="winner-card" key={index} onClick={() => onSubmit(team.map(({ id }) => id))}>
              <span className="winner-icon"><Trophy size={20} /></span>
              <span className="winner-label">Team {index + 1}</span>
              <strong>{team.map(({ name }) => name.split(' ')[0]).join(' + ')}</strong>
              <span>Record as winner</span>
            </button>
          ))}
        </div>
        <button className="text-button danger-text" onClick={onCancelMatch}>Cancel match, no rating changes</button>
      </section>
    </div>
  )
}
