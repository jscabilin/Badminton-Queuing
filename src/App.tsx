import { useMemo, useState } from 'react'
import {
  Activity,
  Bell,
  ChevronRight,
  CircleUserRound,
  Clock3,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  RotateCcw,
  Settings2,
  Sparkles,
  Trophy,
  UsersRound,
  X,
} from 'lucide-react'
import { CourtCard } from './components/CourtCard'
import { LevelBadge } from './components/LevelBadge'
import { MatchResultModal } from './components/MatchResultModal'
import { useSession } from './hooks/useSession'
import { sortQueue, suggestMatch } from './lib/rules'
import type { Court, PlayerStatus } from './types'

type View = 'dashboard' | 'players' | 'activity' | 'profile'

function App() {
  const {
    session,
    startMatch,
    endMatch,
    cancelMatch,
    setPlayerStatus,
    decideSuggestion,
    toggleSession,
    resetDemo,
  } = useSession()
  const [view, setView] = useState<View>('dashboard')
  const [resultCourt, setResultCourt] = useState<Court | null>(null)
  const queue = useMemo(() => sortQueue(session.players), [session.players])
  const suggestion = useMemo(() => suggestMatch(session.players), [session.players])
  const playingCount = session.players.filter(({ status }) => status === 'playing').length
  const pending = session.suggestions.filter(({ status }) => status === 'pending')

  const submitResult = (winnerIds: string[]) => {
    if (!resultCourt) return
    endMatch(resultCourt.number, winnerIds)
    setResultCourt(null)
  }

  const doCancelMatch = () => {
    if (!resultCourt) return
    cancelMatch(resultCourt.number)
    setResultCourt(null)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('dashboard')} aria-label="Rally Queue home">
          <span className="brand-mark"><span /></span>
          <span><strong>RALLY</strong><small>QUEUE</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <NavButton active={view === 'dashboard'} icon={<LayoutDashboard />} label="Session" onClick={() => setView('dashboard')} />
          <NavButton active={view === 'players'} icon={<UsersRound />} label="Players" onClick={() => setView('players')} />
          <NavButton active={view === 'activity'} icon={<Activity />} label="Activity" onClick={() => setView('activity')} />
        </nav>
        <div className="topbar-actions">
          <button className="icon-button notification-button" aria-label={`${pending.length} notifications`}>
            <Bell size={20} />
            {pending.length > 0 && <span>{pending.length}</span>}
          </button>
          <button className="admin-chip" onClick={() => setView('profile')}>
            <span className="avatar avatar-admin">JA</span>
            <span><strong>Jan Alvarez</strong><small>Organizer</small></span>
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <main>
        {view === 'dashboard' && (
          <Dashboard
            session={session}
            queue={queue}
            suggestion={suggestion}
            playingCount={playingCount}
            pending={pending}
            onStart={startMatch}
            onEnd={(court) => setResultCourt(court)}
            onStatusChange={setPlayerStatus}
            onDecision={decideSuggestion}
            onToggleSession={toggleSession}
            onReset={resetDemo}
          />
        )}
        {view === 'players' && <PlayersView players={session.players} onStatusChange={setPlayerStatus} />}
        {view === 'activity' && <ActivityView session={session} />}
        {view === 'profile' && <ProfileView onReset={resetDemo} />}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <NavButton active={view === 'dashboard'} icon={<LayoutDashboard />} label="Session" onClick={() => setView('dashboard')} />
        <NavButton active={view === 'players'} icon={<UsersRound />} label="Players" onClick={() => setView('players')} />
        <NavButton active={view === 'activity'} icon={<Activity />} label="Activity" onClick={() => setView('activity')} />
        <NavButton active={view === 'profile'} icon={<CircleUserRound />} label="Profile" onClick={() => setView('profile')} />
      </nav>

      {resultCourt && (
        <MatchResultModal
          court={resultCourt}
          players={session.players}
          onSubmit={submitResult}
          onCancelMatch={doCancelMatch}
          onClose={() => setResultCourt(null)}
        />
      )}
    </div>
  )
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={active ? 'nav-button active' : 'nav-button'} onClick={onClick}>{icon}<span>{label}</span></button>
}

interface DashboardProps {
  session: ReturnType<typeof useSession>['session']
  queue: ReturnType<typeof sortQueue>
  suggestion: ReturnType<typeof suggestMatch>
  playingCount: number
  pending: ReturnType<typeof useSession>['session']['suggestions']
  onStart: (court: number) => void
  onEnd: (court: Court) => void
  onStatusChange: (playerId: string, status: PlayerStatus) => void
  onDecision: (id: string, decision: 'approved' | 'rejected') => void
  onToggleSession: () => void
  onReset: () => void
}

function Dashboard({ session, queue, suggestion, playingCount, pending, onStart, onEnd, onStatusChange, onDecision, onToggleSession, onReset }: DashboardProps) {
  return (
    <div className="page dashboard-page">
      <section className="session-heading reveal">
        <div>
          <span className="eyebrow">Friday open play</span>
          <h1>Good games start with a <em>fair queue.</em></h1>
          <p>Ayala Sports Center Â· August 7, 2026</p>
        </div>
        <div className="session-actions">
          <span className={`session-live ${session.status === 'closed' ? 'session-closed' : ''}`}><span /> {session.status === 'active' ? 'Session live' : 'Session closed'}</span>
          <button className="button button-outline" onClick={onToggleSession}>{session.status === 'active' ? <X size={17} /> : <RotateCcw size={17} />}{session.status === 'active' ? 'Close session' : 'Reopen session'}</button>
          <button className="icon-button" onClick={onReset} aria-label="Reset demo data" title="Reset demo data"><RotateCcw size={18} /></button>
        </div>
      </section>

      <section className="stat-strip reveal reveal-delay-1" aria-label="Session overview">
        <div className="stat-item"><span className="stat-icon lime"><UsersRound /></span><span><strong>{session.players.length}</strong><small>Checked in</small></span></div>
        <div className="stat-item"><span className="stat-icon orange"><Clock3 /></span><span><strong>{queue.length}</strong><small>In queue</small></span></div>
        <div className="stat-item"><span className="stat-icon blue"><Activity /></span><span><strong>{playingCount}</strong><small>On court</small></span></div>
        <div className="stat-item"><span className="stat-icon pink"><Trophy /></span><span><strong>{session.matches.length}</strong><small>Matches done</small></span></div>
      </section>

      <div className="dashboard-grid">
        <section className="courts-section reveal reveal-delay-2">
          <div className="section-heading">
            <div><span className="eyebrow">Live rotation</span><h2>Courts</h2></div>
            <span className="quiet-label">{session.courts.filter(({ status }) => status === 'available').length} of {session.courts.length} free</span>
          </div>
          <div className="court-grid">
            {session.courts.map((court) => (
              <CourtCard key={court.number} court={court} players={session.players} canStart={suggestion.length === 4 && session.status === 'active'} onStart={() => onStart(court.number)} onEnd={() => onEnd(court)} />
            ))}
          </div>

          {pending.length > 0 && (
            <section className="suggestion-panel">
              <div className="suggestion-icon"><Sparkles size={22} /></div>
              <div className="suggestion-content">
                <span className="eyebrow">Level review</span>
                {pending.map((item) => {
                  const player = session.players.find(({ id }) => id === item.playerId)
                  if (!player) return null
                  return <div className="suggestion-row" key={item.id}><div><h3>{player.name} may be ready to level up</h3><p>{item.reason}</p><div className="level-transition"><LevelBadge level={player.level} compact /><ChevronRight size={15} /><LevelBadge level={item.suggestedLevel} compact /></div></div><div className="suggestion-actions"><button className="button button-primary" onClick={() => onDecision(item.id, 'approved')}>Approve</button><button className="button button-ghost" onClick={() => onDecision(item.id, 'rejected')}>Dismiss</button></div></div>
                })}
              </div>
            </section>
          )}
        </section>

        <aside className="queue-panel reveal reveal-delay-3">
          <div className="queue-heading"><div><span className="eyebrow">Up next</span><h2>Fair-play queue</h2></div><button className="icon-button"><MoreHorizontal size={20} /></button></div>
          <div className="fairness-note"><Sparkles size={16} /><span>Ordered by fewest games, then longest wait.</span></div>
          <ol className="queue-list">
            {queue.map((player, index) => (
              <li className={index < 4 ? 'queue-item suggested-player' : 'queue-item'} key={player.id}>
                <span className="queue-position">{String(index + 1).padStart(2, '0')}</span>
                <span className="avatar">{player.initials}</span>
                <span className="queue-player"><strong>{player.name}</strong><span><LevelBadge level={player.level} compact /> Â· {player.rating}</span></span>
                <span className="games-count"><strong>{player.gamesPlayed}</strong><small>games</small></span>
                <button className="icon-button queue-action" onClick={() => onStatusChange(player.id, 'resting')} aria-label={`Mark ${player.name} as resting`}><MoreHorizontal size={18} /></button>
              </li>
            ))}
          </ol>
          {queue.length < 4 && <div className="queue-empty"><UsersRound size={24} /><strong>Waiting for {4 - queue.length} more player{4 - queue.length === 1 ? '' : 's'}</strong><span>A full doubles match needs four.</span></div>}
          {suggestion.length === 4 && <div className="next-match"><span><strong>Next match ready</strong><small>{suggestion.map(({ name }) => name.split(' ')[0]).join(' Â· ')}</small></span><span className="ready-mark">4</span></div>}
        </aside>
      </div>
    </div>
  )
}

function PlayersView({ players, onStatusChange }: { players: ReturnType<typeof useSession>['session']['players']; onStatusChange: (id: string, status: PlayerStatus) => void }) {
  return <div className="page subpage"><div className="section-heading"><div><span className="eyebrow">Roster</span><h1>Session players</h1><p>Skill, rating, and current availability at a glance.</p></div></div><div className="player-card-grid">{players.map((player) => <article className="player-card" key={player.id}><div className="player-card-top"><span className="avatar avatar-large">{player.initials}</span><span className={`player-status status-${player.status}`}><span />{player.status}</span></div><h3>{player.name}</h3><LevelBadge level={player.level} /><div className="player-stats"><span><strong>{player.rating}</strong><small>Rating</small></span><span><strong>{player.gamesPlayed}</strong><small>Games today</small></span></div>{player.status !== 'playing' && <button className="button button-outline button-full" onClick={() => onStatusChange(player.id, player.status === 'waiting' ? 'resting' : 'waiting')}>{player.status === 'waiting' ? 'Take a rest' : 'Return to queue'}</button>}</article>)}</div></div>
}

function ActivityView({ session }: { session: ReturnType<typeof useSession>['session'] }) {
  return <div className="page subpage narrow-page"><div className="section-heading"><div><span className="eyebrow">Session log</span><h1>Recent activity</h1><p>Completed matches and recorded winners.</p></div></div><div className="activity-list">{session.matches.map((match) => { const players = match.playerIds.map((id) => session.players.find((player) => player.id === id)).filter(Boolean); const winners = match.winnerIds.map((id) => session.players.find((player) => player.id === id)?.name.split(' ')[0]).filter(Boolean); return <article className="activity-card" key={match.id}><span className="activity-court">Court {match.courtNumber}</span><div><h3>{players.map((player) => player?.name.split(' ')[0]).join(' Â· ')}</h3><p><Trophy size={14} /> {winners.join(' + ')} won</p></div><time>{new Date(match.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></article>})}</div></div>
}

function ProfileView({ onReset }: { onReset: () => void }) {
  return <div className="page subpage narrow-page"><div className="profile-hero"><span className="avatar profile-avatar">JA</span><span className="eyebrow">Organizer account</span><h1>Jan Alvarez</h1><p>Session organizer Â· Ayala Sports Center</p></div><div className="settings-list"><button><Settings2 /><span><strong>Session preferences</strong><small>Courts, matching range, and demotions</small></span><ChevronRight /></button><button onClick={onReset}><RotateCcw /><span><strong>Reset demo session</strong><small>Restore the original sample players and matches</small></span><ChevronRight /></button><button className="danger-text"><LogOut /><span><strong>Sign out</strong><small>Supabase authentication is enabled after setup</small></span><ChevronRight /></button></div></div>
}

export default App
