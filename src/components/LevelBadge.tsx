import { LEVEL_LABELS } from '../lib/rules'
import type { Level } from '../types'

export function LevelBadge({ level, compact = false }: { level: Level; compact?: boolean }) {
  return (
    <span className={`level-badge level-${level} ${compact ? 'level-badge-compact' : ''}`}>
      <span className="level-dot" aria-hidden="true" />
      {compact ? LEVEL_LABELS[level].replace('Intermediate', 'Int.') : LEVEL_LABELS[level]}
    </span>
  )
}
