import type { DayCount } from '../api/types'
import { formatShortDate, localDayKey } from '../lib/format'
import { type HeatLevel, buildHeatmap, monthLabels } from '../lib/heatmap'
import { Tooltip } from './ui/Tooltip'

// Só segunda, quarta e sexta ganham rótulo, como no GitHub.
const WEEKDAYS = ['Seg', '', 'Qua', '', 'Sex', '', '']
const SHORT_WEEKDAY = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function describe(date: string, count: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const weekday = SHORT_WEEKDAY[new Date(y, m - 1, d).getDay()]
  const total = count === 0 ? 'Nenhum check-in' : `${count} ${count === 1 ? 'check-in' : 'check-ins'}`
  return `${weekday}, ${formatShortDate(date)} · ${total}`
}

function Square({ level, className = '' }: { level: HeatLevel; className?: string }) {
  return (
    <span
      className={`block aspect-square w-full rounded-[3px] ${level === 0 ? 'border border-[var(--hairline)]' : ''} ${className}`}
      style={{ background: `var(--heat-${level})` }}
    />
  )
}

export function DayHeatmap({ data }: { data: DayCount[] }) {
  const weeks = buildHeatmap(data)
  const months = monthLabels(weeks)
  const today = localDayKey(new Date().toISOString())

  return (
    <div className="surface flex flex-1 flex-col justify-between gap-4 p-5">
      {/* Rola dentro do card se houver semanas demais; a página não estoura. */}
      <div className="overflow-x-auto pb-1">
        <div
          className="mx-auto grid gap-[3px]"
          style={{
            // Células crescem até 2.5rem para preencher o card; abaixo de 0.875rem rola.
            gridTemplateColumns: `auto repeat(${weeks.length}, minmax(0.875rem, 2.5rem))`,
            gridTemplateRows: 'auto',
            justifyContent: 'center',
          }}
        >
          {months.map((m) => (
            <span
              key={m.week}
              className="whitespace-nowrap pb-1 text-[0.6875rem] text-[var(--ink-muted)]"
              style={{ gridColumn: m.week + 2, gridRow: 1 }}
            >
              {m.label}
            </span>
          ))}
          {WEEKDAYS.map((d, i) => (
            <span
              key={i}
              className="flex items-center pr-2 text-[0.6875rem] text-[var(--ink-muted)]"
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
                    <Square
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
      </div>
      <div aria-hidden className="flex items-center justify-end gap-1 text-[0.6875rem] text-[var(--ink-muted)]">
        <span className="mr-1">Menos</span>
        {([0, 1, 2, 3, 4] as const).map((l) => (
          <span key={l} className="w-3">
            <Square level={l} />
          </span>
        ))}
        <span className="ml-1">Mais</span>
      </div>
    </div>
  )
}
