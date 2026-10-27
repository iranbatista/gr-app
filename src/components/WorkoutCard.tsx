import type { Workout } from '../api/types'
import { formatCalories, formatDate, formatDistance, formatDuration, formatPoints } from '../lib/format'
import { Avatar } from './Avatar'

function metrics(w: Workout): string[] {
  const out: string[] = []
  if (w.duration != null) out.push(formatDuration(w.duration))
  if (w.distance != null) out.push(formatDistance(w.distance))
  if (w.calories != null) out.push(formatCalories(w.calories))
  if (w.points != null) out.push(`${formatPoints(w.points)} pts`)
  return out
}

export function WorkoutCard({ workout: w, showMember = true }: { workout: Workout; showMember?: boolean }) {
  const m = metrics(w)
  return (
    <article className="overflow-hidden rounded-lg border bg-white">
      {w.photo_url && (
        <img src={w.photo_url} alt="" loading="lazy" className="aspect-video w-full object-cover" />
      )}
      <div className="space-y-2 p-3">
        {showMember && (
          <div className="flex items-center gap-2">
            <Avatar url={w.account.profile_picture_url} name={w.account.full_name} size="sm" />
            <span className="font-medium">{w.account.full_name ?? 'Sem nome'}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold">{w.title || w.activity_type || 'Check-in'}</h3>
          <time className="shrink-0 text-sm text-gray-500">{formatDate(w.occurred_at)}</time>
        </div>
        {m.length > 0 && <p className="text-sm text-gray-600">{m.join(' · ')}</p>}
      </div>
    </article>
  )
}
