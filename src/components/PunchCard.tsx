import { punchcardLevels } from '../lib/heatmap'
import { WEEKDAYS, checkinsText, hourLabel, peakSlot, slotLabel } from '../lib/dashboard'
import { ChartCard } from './ChartCard'
import { HeatLegend, HeatSquare } from './DayHeatmap'
import { Tooltip } from './ui/Tooltip'

const HOURS = Array.from({ length: 24 }, (_, h) => h)

const describe = (weekday: number, hour: number, count: number) => {
  const text = checkinsText(count)
  return `${slotLabel(weekday, hour)} · ${text.charAt(0).toUpperCase()}${text.slice(1)}`
}

/** Dia da semana × hora do dia (7 × 24), intensidade por quartis como o heatmap. */
export function PunchCard({ grid }: { grid: number[][] }) {
  const levels = punchcardLevels(grid)
  const peak = peakSlot(grid)
  return (
    <ChartCard
      title="Dia e hora dos check-ins"
      aside={peak ? `Horário de pico: ${slotLabel(peak.weekday, peak.hour)} · ${checkinsText(peak.count)}` : undefined}
    >
      {/* No celular a grade mantém a largura mínima e rola dentro do card. */}
      <div className="-mx-5 overflow-x-auto px-5 pb-1">
        <div className="min-w-[36rem]">
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: '2.25rem repeat(24, minmax(0, 1fr))' }}>
            {HOURS.map((h) =>
              h % 3 === 0 ? (
                <span
                  key={h}
                  aria-hidden
                  className="whitespace-nowrap pb-1 text-[11px] font-medium leading-none text-[var(--ink-muted)]"
                  style={{ gridColumn: h + 2, gridRow: 1 }}
                >
                  {hourLabel(h)}
                </span>
              ) : null,
            )}
            {WEEKDAYS.map((d, wd) => (
              <span
                key={d}
                aria-hidden
                className="flex items-center text-[11px] leading-none text-[var(--ink-muted)]"
                style={{ gridColumn: 1, gridRow: wd + 2 }}
              >
                {d}
              </span>
            ))}
            {grid.map((row, wd) =>
              row.map((count, h) => (
                <Tooltip key={`${wd}-${h}`} content={describe(wd, h, count)}>
                  <span
                    role="img"
                    aria-label={describe(wd, h, count)}
                    style={{ gridColumn: h + 2, gridRow: wd + 2 }}
                  >
                    <HeatSquare
                      level={levels[wd][h]}
                      className={
                        peak && peak.weekday === wd && peak.hour === h
                          ? 'ring-2 ring-[var(--ink)] ring-offset-1 ring-offset-[var(--card)]'
                          : ''
                      }
                    />
                  </span>
                </Tooltip>
              )),
            )}
          </div>
        </div>
      </div>
      {/* Fora da rolagem: a legenda fica visível mesmo no celular. */}
      <div className="-mt-3">
        <HeatLegend />
      </div>
    </ChartCard>
  )
}
