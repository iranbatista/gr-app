import { Flame, type LucideIcon, Route, Star, Timer } from 'lucide-react'
import { useState } from 'react'
import type { Workout } from '../api/types'
import { formatCalories, formatDate, formatDistance, formatDuration, formatPoints } from '../lib/format'
import { Avatar } from './Avatar'

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
    <article className="surface flex flex-col gap-4 p-3">
      {w.photo_url && !photoFailed && (
        <img
          src={w.photo_url}
          alt=""
          loading="lazy"
          onError={() => setPhotoFailed(true)}
          className="aspect-video w-full rounded-[1.25rem] bg-[var(--wash)] object-cover"
        />
      )}
      <div className="flex flex-col gap-3 px-2 pb-2 pt-1">
        {showMember && (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar url={w.account.profile_picture_url} name={w.account.full_name} size="sm" />
            <span className="truncate text-sm font-medium text-[var(--ink)]">{w.account.full_name ?? 'Sem nome'}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="min-w-0 break-words font-heading text-[1.0625rem] font-medium leading-snug tracking-tight text-[var(--ink)]">
            {w.title || w.activity_type || 'Check-in'}
          </h3>
          <time className="shrink-0 text-xs text-[var(--ink-muted)]">{formatDate(w.occurred_at)}</time>
        </div>
        {m.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {m.map(([Icon, v], i) => (
              <li
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--wash)] px-2.5 py-0.5 text-xs font-medium text-[var(--ink-muted)] tabular-nums"
              >
                <Icon size={12} strokeWidth={1.75} className="text-[var(--brand-ink)]" />
                {v}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
