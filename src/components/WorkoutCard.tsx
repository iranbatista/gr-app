import { Flame, type LucideIcon, Route, Star, Timer } from 'lucide-react'
import { useState } from 'react'
import type { Workout } from '../api/types'
import { formatCalories, formatDate, formatDistance, formatDuration, formatPoints } from '../lib/format'
import { Avatar } from './Avatar'
import { Badge } from './ui/Badge'

function metrics(w: Workout): [LucideIcon, string][] {
  const out: [LucideIcon, string][] = []
  if (w.duration != null) out.push([Timer, formatDuration(w.duration)])
  if (w.distance != null) out.push([Route, formatDistance(w.distance)])
  if (w.calories != null) out.push([Flame, formatCalories(w.calories)])
  if (w.points != null) out.push([Star, `${formatPoints(w.points)} pts`])
  return out
}

export function WorkoutCard({ workout: w, showMember = true }: { workout: Workout; showMember?: boolean }) {
  const m = metrics(w)
  const [photoFailed, setPhotoFailed] = useState(false)
  return (
    <article className="surface flex flex-col gap-3 rounded-[1.375rem] p-2.5">
      {w.photo_url && !photoFailed && (
        <img
          src={w.photo_url}
          alt=""
          loading="lazy"
          onError={() => setPhotoFailed(true)}
          className="aspect-[4/3] w-full rounded-[1rem] bg-[var(--wash)] object-cover"
        />
      )}
      <div className="flex flex-col gap-2 px-1.5 pb-1.5">
        {showMember && (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar url={w.account.profile_picture_url} name={w.account.full_name} size="xs" />
            <span className="truncate text-[0.8125rem] font-medium text-[var(--ink)]">{w.account.full_name ?? 'Sem nome'}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 break-words font-heading text-[0.9375rem] font-medium leading-snug tracking-tight text-[var(--ink)]">
            {w.title || w.activity_type || 'Check-in'}
          </h3>
          <time className="shrink-0 text-[0.6875rem] text-[var(--ink-muted)]">{formatDate(w.occurred_at)}</time>
        </div>
        {m.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {m.map(([Icon, v], i) => (
              <li key={i}>
                <Badge size="xs" icon={Icon}>
                  {v}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
