import { Moon, MoonStar, Sun, Sunrise } from 'lucide-react'
import type { Periods } from '../api/types'
import { type PeriodKey, checkinsText, periodRows } from '../lib/dashboard'
import { ChartCard } from './ChartCard'

const ICONS: Record<PeriodKey, typeof Sun> = { madrugada: MoonStar, manha: Sunrise, tarde: Sun, noite: Moon }

/** Quatro faixas do dia em barras horizontais, com contagem e %. */
export function PeriodBars({ periods }: { periods: Periods }) {
  const rows = periodRows(periods)
  const max = Math.max(...rows.map((r) => r.count))
  const top = rows.find((r) => r.count === max && max > 0)
  return (
    <ChartCard title="Períodos do dia" className="flex-1" aside={top && `mais forte: ${top.label.toLowerCase()}`}>
      <ul className="flex flex-1 flex-col justify-center gap-5">
        {rows.map((r) => {
          const Icon = ICONS[r.key]
          return (
            <li
              key={r.key}
              aria-label={`${r.label}, ${r.range}: ${checkinsText(r.count)} (${r.pct}%)`}
              className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--tint)] text-[var(--brand-ink)]">
                <Icon size={16} strokeWidth={1.75} />
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate">
                    <span className="font-medium text-[var(--ink)]">{r.label}</span>
                    <span className="ml-1.5 text-xs text-[var(--ink-muted)]">{r.range}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">
                    <span className="font-semibold text-[var(--ink)]">{r.count}</span>
                    <span className="ml-1.5 inline-block w-9 text-right text-xs text-[var(--ink-muted)]">{r.pct}%</span>
                  </span>
                </div>
                <div aria-hidden className="h-2 overflow-hidden rounded-full bg-[var(--wash)]">
                  {/* Largura relativa ao maior período: o líder enche a barra. */}
                  <div
                    className="brand-gradient h-full rounded-full motion-safe:transition-[width] motion-safe:duration-700"
                    style={{ width: max > 0 ? `${(r.count / max) * 100}%` : 0 }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </ChartCard>
  )
}
