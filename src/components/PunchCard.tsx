import { WEEKDAYS, checkinsText, hourLabel, peakSlot, slotLabel } from '../lib/dashboard'
import { punchcardLevels } from '../lib/heatmap'
import { ChartCard } from './ChartCard'
import { HeatGrid } from './HeatGrid'

const HOURS = Array.from({ length: 24 }, (_, h) => h)

const describe = (weekday: number, hour: number, count: number) => {
  const text = checkinsText(count)
  return `${slotLabel(weekday, hour)} · ${text.charAt(0).toUpperCase()}${text.slice(1)}`
}

/** Dia da semana × hora (7 × 24), na mesma grade do calendário; o anel marca a hora de agora. */
export function PunchCard({ grid, now = new Date() }: { grid: number[][]; now?: Date }) {
  const levels = punchcardLevels(grid)
  const peak = peakSlot(grid)
  const nowRow = (now.getDay() + 6) % 7
  const nowHour = now.getHours()
  // Colunas são as horas; cada uma desce de Seg a Dom.
  const columns = HOURS.map((h) =>
    WEEKDAYS.map((_, wd) => ({
      count: grid[wd]?.[h] ?? 0,
      level: levels[wd]?.[h] ?? 0,
      label: describe(wd, h, grid[wd]?.[h] ?? 0),
      highlight: wd === nowRow && h === nowHour,
    })),
  )
  return (
    <ChartCard
      title="Dia e hora dos check-ins"
      aside={peak ? `pico: ${slotLabel(peak.weekday, peak.hour)} · ${checkinsText(peak.count)}` : undefined}
    >
      <HeatGrid
        columns={columns}
        current="time"
        headers={HOURS.filter((h) => h % 3 === 0).map((h) => ({ column: h, label: hourLabel(h) }))}
      />
    </ChartCard>
  )
}
