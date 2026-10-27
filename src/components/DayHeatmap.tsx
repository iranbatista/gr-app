import type { DayCount } from '../api/types'
import { formatShortDate } from '../lib/format'
import { type HeatLevel, buildHeatmap, monthLabels } from '../lib/heatmap'

// Escala de 5 níveis: bege vazio até a marca cheia, que no topo puxa para o coral.
const LEVEL_BG: Record<HeatLevel, string> = {
  0: 'var(--wash)',
  1: 'color-mix(in srgb, var(--brand-from) 25%, transparent)',
  2: 'color-mix(in srgb, var(--brand-from) 50%, transparent)',
  3: 'color-mix(in srgb, var(--brand-from) 80%, transparent)',
  4: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
}

// Só segunda, quarta e sexta ganham rótulo, como no GitHub.
const WEEKDAYS = ['Seg', '', 'Qua', '', 'Sex', '', '']

// Célula cresce no desktop: com poucas semanas o mapa não fica perdido no card.
const CELL = 'var(--cell)'
const GAP = 'var(--cell-gap)'

function Square({ level }: { level: HeatLevel }) {
  return (
    <span
      className="block rounded-[25%] border border-[var(--hairline)]"
      style={{ width: CELL, height: CELL, background: LEVEL_BG[level] }}
    />
  )
}

export function DayHeatmap({ data }: { data: DayCount[] }) {
  const weeks = buildHeatmap(data)
  const months = new Map(monthLabels(weeks).map((m) => [m.week, m.label]))
  const columns = `repeat(${weeks.length}, ${CELL})`

  return (
    <div className="surface flex flex-col gap-4 p-5 [--cell-gap:0.25rem] [--cell:1rem] sm:[--cell-gap:0.375rem] sm:[--cell:1.5rem]">
      {/* Rola dentro da superfície em telas estreitas; a página não estoura. */}
      <div className="overflow-x-auto pb-1">
        <div className="mx-auto flex w-max gap-2">
          <div className="grid pt-[calc(0.875rem+0.25rem)]" style={{ gridTemplateRows: `repeat(7, ${CELL})`, gap: GAP }}>
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="flex items-center pr-1 text-[0.625rem] text-[var(--ink-muted)]">
                {d}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <div className="grid h-[0.875rem]" style={{ gridTemplateColumns: columns, columnGap: GAP }}>
              {weeks.map((_, i) => (
                <span key={i} className="overflow-visible whitespace-nowrap text-[0.625rem] leading-[0.875rem] text-[var(--ink-muted)]">
                  {months.get(i) ?? ''}
                </span>
              ))}
            </div>
            <div
              className="grid grid-flow-col"
              style={{ gridTemplateColumns: columns, gridTemplateRows: `repeat(7, ${CELL})`, gap: GAP }}
            >
              {weeks.flat().map((c) =>
                c.inRange ? (
                  <span
                    key={c.date}
                    role="img"
                    title={`${formatShortDate(c.date)}: ${c.count} ${c.count === 1 ? 'check-in' : 'check-ins'}`}
                    aria-label={`${formatShortDate(c.date)}: ${c.count} ${c.count === 1 ? 'check-in' : 'check-ins'}`}
                  >
                    <Square level={c.level} />
                  </span>
                ) : (
                  <span key={c.date} aria-hidden />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden className="flex items-center justify-end gap-1.5 [--cell:0.75rem] text-[0.6875rem] text-[var(--ink-muted)]">
        Menos
        {([0, 1, 2, 3, 4] as const).map((l) => (
          <Square key={l} level={l} />
        ))}
        Mais
      </div>
    </div>
  )
}
