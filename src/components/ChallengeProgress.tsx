import { Flag } from 'lucide-react'
import type { Challenge } from '../api/types'
import { challengeProgress } from '../lib/dashboard'
import { formatShortDate } from '../lib/format'

/** Barra do andamento do desafio: dia atual, % e quanto falta. */
export function ChallengeProgress({ challenge: c, now }: { challenge: Challenge; now?: Date }) {
  const p = challengeProgress(c.start_date, c.end_date, now)
  if (!p || !c.start_date) return null
  return (
    <div className="surface flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="eyebrow flex items-center gap-1.5">
          <Flag size={13} strokeWidth={1.75} />
          Andamento
        </p>
        <p className="text-sm font-medium tabular-nums text-[var(--ink)]">{p.text}</p>
      </div>
      {p.pct != null && (
        <div
          role="progressbar"
          aria-label="Andamento do desafio"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={p.pct}
          aria-valuetext={p.text}
          className="h-2.5 overflow-hidden rounded-full bg-[var(--wash)]"
        >
          <div
            className="brand-gradient h-full rounded-full motion-safe:transition-[width] motion-safe:duration-700"
            style={{ width: `${p.pct}%` }}
          />
        </div>
      )}
      {c.end_date && (
        <div className="flex justify-between text-xs tabular-nums text-[var(--ink-muted)]">
          <span>{formatShortDate(c.start_date)}</span>
          <span>{formatShortDate(c.end_date)}</span>
        </div>
      )}
    </div>
  )
}
