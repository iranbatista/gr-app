import type { DayCount } from '../api/types'
import { formatShortDate, localDayKey } from '../lib/format'
import { type HeatLevel, buildHeatmap, heatmapSummary, monthLabels } from '../lib/heatmap'
import { ChartCard } from './ChartCard'
import { Tooltip } from './ui/Tooltip'

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const SHORT_WEEKDAY = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const checkins = (n: number) => (n === 0 ? 'Nenhum check-in' : `${n} ${n === 1 ? 'check-in' : 'check-ins'}`)

function describe(date: string, count: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return `${SHORT_WEEKDAY[new Date(y, m - 1, d).getDay()]}, ${formatShortDate(date)} · ${checkins(count)}`
}

export function HeatSquare({ level, className = '' }: { level: HeatLevel; className?: string }) {
  return (
    <span
      className={`block aspect-square w-full rounded-[3px] ${level === 0 ? 'border border-[var(--hairline)]' : ''} ${className}`}
      style={{ background: `var(--heat-${level})` }}
    />
  )
}

interface Props {
  data: DayCount[]
  title?: string
  /** Resumo próprio no lugar do padrão (o dashboard usa um curto, o card fica do tamanho da grade). */
  aside?: string
}

export function DayHeatmap({ data, title = 'Check-ins por dia', aside }: Props) {
  const weeks = buildHeatmap(data)
  const months = monthLabels(weeks)
  const { total, activeDays, peak } = heatmapSummary(data)
  const today = localDayKey(new Date().toISOString())
  // Gutter fixo dos dias da semana + colunas do tamanho da célula (--cell, responsivo).
  const columns = `2rem repeat(${weeks.length}, var(--cell))`

  return (
    <ChartCard
      title={title}
      className="flex-1"
      aside={aside ?? [
        `${total} check-ins`,
        `${activeDays} ${activeDays === 1 ? 'dia ativo' : 'dias ativos'}`,
        peak && `pico ${peak.count} em ${formatShortDate(peak.date)}`,
      ]
        .filter(Boolean)
        .join(' · ')}
    >
      <div className="flex flex-1 flex-col justify-center gap-3">
        {/* Rola dentro do card se houver semanas demais; a página não estoura. */}
        <div className="overflow-x-auto pb-1">
          <div className="mx-auto w-max [--cell:clamp(0.875rem,7vw,2.25rem)] sm:[--cell:2.25rem]">
            <div className="grid gap-[3px]" style={{ gridTemplateColumns: columns }}>
              {months.map((m) => (
                <span
                  key={m.week}
                  className="whitespace-nowrap pb-1 text-[11px] font-medium leading-none text-[var(--ink-muted)]"
                  style={{ gridColumn: m.week + 2, gridRow: 1 }}
                >
                  {m.label}
                </span>
              ))}
              {WEEKDAYS.map((d, i) => (
                <span
                  key={d}
                  className="flex items-center text-[11px] leading-none text-[var(--ink-muted)]"
                  style={{ gridColumn: 1, gridRow: i + 2 }}
                >
                  {d}
                </span>
              ))}
              {weeks.map((week, w) =>
                week.map((c, i) =>
                  c.inRange ? (
                    <Tooltip key={c.date} content={describe(c.date, c.count)}>
                      <span
                        role="img"
                        aria-label={describe(c.date, c.count)}
                        style={{ gridColumn: w + 2, gridRow: i + 2 }}
                      >
                        <HeatSquare
                          level={c.level}
                          className={
                            c.date === today ? 'ring-2 ring-[var(--ink)] ring-offset-1 ring-offset-[var(--card)]' : ''
                          }
                        />
                      </span>
                    </Tooltip>
                  ) : null,
                ),
              )}
            </div>
            <HeatLegend />
          </div>
        </div>
      </div>
    </ChartCard>
  )
}

/** Legenda "Menos ▢▢▢▢▢ Mais" alinhada à direita, sob a grade. */
export function HeatLegend() {
  return (
    <div
      aria-hidden
      className="mt-3 flex items-center justify-end gap-[3px] text-[11px] leading-none text-[var(--ink-muted)]"
    >
      <span className="mr-1.5">Menos</span>
      {([0, 1, 2, 3, 4] as const).map((l) => (
        <span key={l} className="w-3">
          <HeatSquare level={l} />
        </span>
      ))}
      <span className="ml-1.5">Mais</span>
    </div>
  )
}
