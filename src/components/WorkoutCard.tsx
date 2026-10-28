import { Flame, type LucideIcon, Route, Star, Timer } from 'lucide-react'
import { Images, MessageCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Workout } from '../api/types'
import { formatCalories, formatDate, formatDistance, formatDuration, formatPoints } from '../lib/format'
import { mediaOf } from '../lib/media'
import { groupReactions } from '../lib/reactions'
import { thumbUrl } from '../lib/thumb'
import { useImgFallback } from '../lib/useImgFallback'
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
  const photo = useImgFallback([thumbUrl(w.photo_url, 256), w.photo_url])
  const [params] = useSearchParams()
  const title = w.title || w.activity_type || 'Check-in'
  const extraMedia = mediaOf(w).length - 1
  const reactions = groupReactions(w.reactions ?? [])
  const reactionTotal = reactions.reduce((t, g) => t + g.count, 0)
  const comments = w.comment_count ?? 0

  // Abre o detalhe por ?checkin=<id>, preservando filtros e aba.
  const search = new URLSearchParams(params)
  search.set('checkin', String(w.id))

  return (
    <article className="surface rounded-[1.375rem] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[var(--wash)]">
      <Link
        to={{ search: `?${search}` }}
        state={{ checkin: true }}
        preventScrollReset
        aria-label={title}
        className="flex h-full flex-col gap-3 rounded-[1.375rem] p-2.5"
      >
        {photo.src && (
          <div className="relative">
            <img
              src={photo.src}
              alt=""
              loading="lazy"
              decoding="async"
              onError={photo.onError}
              className="aspect-[4/3] w-full rounded-[1rem] bg-[var(--wash)] object-cover"
            />
            {extraMedia > 0 && (
              <span
                aria-label={`Mais ${extraMedia} ${extraMedia === 1 ? 'mídia' : 'mídias'}`}
                className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[rgba(20,18,17,0.55)] px-2 py-0.5 text-[0.6875rem] font-medium text-white backdrop-blur"
              >
                <Images size={11} strokeWidth={1.75} />+{extraMedia}
              </span>
            )}
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2 px-1.5 pb-1.5">
          {showMember && (
            <div className="flex min-w-0 items-center gap-2">
              <Avatar url={w.account.profile_picture_url} name={w.account.full_name} size="xs" />
              <span className="truncate text-[0.8125rem] font-medium text-[var(--ink)]">
                {w.account.full_name ?? 'Sem nome'}
              </span>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="line-clamp-2 min-w-0 break-words font-heading text-[0.9375rem] font-medium leading-snug tracking-tight text-[var(--ink)]">
              {title}
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
          {(reactionTotal > 0 || comments > 0) && (
            <div className="mt-auto flex items-center gap-3 pt-1 text-[0.75rem] text-[var(--ink-muted)]">
              {reactionTotal > 0 && (
                <span
                  aria-label={`${reactionTotal} ${reactionTotal === 1 ? 'reação' : 'reações'}`}
                  className="inline-flex items-center gap-1 tabular-nums"
                >
                  <span className="tracking-[-0.1em]">{reactions.slice(0, 3).map((g) => g.emoji).join('')}</span>
                  {reactionTotal}
                </span>
              )}
              {comments > 0 && (
                <span
                  aria-label={`${comments} ${comments === 1 ? 'comentário' : 'comentários'}`}
                  className="inline-flex items-center gap-1 tabular-nums"
                >
                  <MessageCircle size={12} strokeWidth={1.75} />
                  {comments}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}
