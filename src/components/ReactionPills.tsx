import type { Reaction } from '../api/types'
import { groupReactions } from '../lib/reactions'
import { Tooltip } from './ui/Tooltip'

const MAX_NAMES = 8

/** Pills "😂 4" com tooltip de quem reagiu. Some quando não há reação. */
interface Props {
  reactions: Reaction[]
  size?: 'sm' | 'md'
  label?: string
}

export function ReactionPills({ reactions, size = 'md', label = 'Reações' }: Props) {
  const groups = groupReactions(reactions)
  if (groups.length === 0) return null
  const pill =
    size === 'md' ? 'gap-1.5 px-3 py-1 text-sm' : 'gap-1 px-2 py-0.5 text-xs'
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {groups.map((g) => {
        const extra = g.names.length - MAX_NAMES
        const who = g.names.slice(0, MAX_NAMES).join(', ') + (extra > 0 ? ` +${extra}` : '')
        return (
          <Tooltip key={g.emoji} content={who}>
            <li
              tabIndex={0}
              className={`inline-flex items-center rounded-full border border-[var(--hairline)] bg-[var(--wash)] font-medium tabular-nums text-[var(--ink-muted)] ${pill}`}
            >
              {g.emoji} {g.count}
            </li>
          </Tooltip>
        )
      })}
    </ul>
  )
}
