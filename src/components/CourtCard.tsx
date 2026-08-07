import { Check, Play, Square } from 'lucide-react'
import type { Court, Player } from '../types'

interface CourtCardProps {
  court: Court
  players: Player[]
  canStart: boolean
  onStart: () => void
  onEnd: () => void
}

export function CourtCard({ court, players, canStart, onStart, onEnd }: CourtCardProps) {
  const activePlayers = court.playerIds
    .map((id) => players.find((player) => player.id === id))
    .filter((player): player is Player => Boolean(player))

  if (court.status === 'available') {
    return (
      <article className="court-card court-card-free">
        <div className="court-header">
          <span className="court-number">0{court.number}</span>
          <span className="status-pill status-free"><span /> Available</span>
        </div>
        <div className="empty-court-mark" aria-hidden="true">
          <span className="court-net" />
          <Check size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h3>Ready for play</h3>
          <p>{canStart ? 'A fair match is ready to go.' : 'Waiting for four available players.'}</p>
        </div>
        <button className="button button-primary button-full" disabled={!canStart} onClick={onStart}>
          <Play size={17} fill="currentColor" /> Start suggested match
        </button>
      </article>
    )
  }

  return (
    <article className="court-card court-card-live">
      <div className="court-header">
        <span className="court-number">0{court.number}</span>
        <span className="status-pill status-live"><span /> In play</span>
      </div>
      <div className="versus-grid">
        <div className="team-column">
          {activePlayers.slice(0, 2).map((player) => (
            <div className="court-player" key={player.id}>
              <span className="avatar avatar-small">{player.initials}</span>
              <span>{player.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
        <span className="versus">VS</span>
        <div className="team-column team-column-right">
          {activePlayers.slice(2).map((player) => (
            <div className="court-player" key={player.id}>
              <span>{player.name.split(' ')[0]}</span>
              <span className="avatar avatar-small">{player.initials}</span>
            </div>
          ))}
        </div>
      </div>
      <button className="button button-dark button-full" onClick={onEnd}>
        <Square size={15} fill="currentColor" /> End match
      </button>
    </article>
  )
}
