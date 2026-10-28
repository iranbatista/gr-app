import type { DayCount } from '../api/types'
import { formatShortDate, localDayKey } from '../lib/format'
import { buildHeatmap, heatmapSummary, monthLabels } from '../lib/heatmap'
import { ChartCard } from './ChartCard'
import { HeatGrid } from './HeatGrid'

const SHORT_WEEKDAY = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const checkins = (n: number) => (n === 0 ? 'Nenhum check-in' : `${n} ${n === 1 ? 'check-in' : 'check-ins'}`)

function describe(date: string, count: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return `${SHORT_WEEKDAY[new Date(y, m - 1, d).getDay()]}, ${formatShortDate(date)} · ${checkins(count)}`
}

/** Calendário semanas × dias, na mesma grade do punch card. */
export function DayHeatmap({ data, title = 'Check-ins por dia' }: { data: DayCount[]; title?: string }) {
  const weeks = buildHeatmap(data)
  const { activeDays, peak } = heatmapSummary(data)
  const today = localDayKey(new Date().toISOString())
  const columns = weeks.map((week) =>
    week.map((c) =>
      c.inRange ? { count: c.count, level: c.level, label: describe(c.date, c.count), highlight: c.date === today } : null,
    ),
  )

  return (
    <ChartCard
      title={title}
      className="flex-1"
      aside={[
        `${activeDays} ${activeDays === 1 ? 'dia ativo' : 'dias ativos'}`,
        peak && `pico ${peak.count} em ${formatShortDate(peak.date)}`,
      ]
        .filter(Boolean)
        .join(' · ')}
    >
      <div className="flex flex-1 flex-col justify-center">
        <HeatGrid columns={columns} headers={monthLabels(weeks).map((m) => ({ column: m.week, label: m.label }))} />
      </div>
    </ChartCard>
  )
}
