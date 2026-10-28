import { useId } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DayCount } from '../api/types'
import { formatShortDate } from '../lib/format'
import { weeklyTotals } from '../lib/heatmap'
import { ChartTooltip } from './ChartTooltip'
import { cursorFill, tick } from './chartStyle'

const checkins = (n: number) => (n === 0 ? 'Nenhum check-in' : `${n} ${n === 1 ? 'check-in' : 'check-ins'}`)

export function WeeklyChart({ data }: { data: DayCount[] }) {
  const rows = weeklyTotals(data).map((w) => ({ ...w, label: formatShortDate(w.weekStart) }))
  const gradient = `week-${useId().replace(/:/g, '')}`
  return (
    // Altura vem da linha do grid (lado a lado com o heatmap): o gráfico ocupa por absoluto.
    <div className="surface relative min-h-64 flex-1">
      <div className="absolute inset-0 px-3 pb-3 pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {/* Varredura da marca de cima (laranja) para baixo (coral). */}
              <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: 'var(--brand-from)' }} />
                <stop offset="100%" style={{ stopColor: 'var(--brand-to)' }} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--hairline)" vertical={false} />
            <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={tick} tickLine={false} axisLine={false} width={30} />
            <Tooltip
              cursor={cursorFill}
              content={(p) => <ChartTooltip {...p} render={(l, v) => `Semana de ${l} · ${checkins(v)}`} />}
            />
            <Bar dataKey="count" name="Check-ins" fill={`url(#${gradient})`} radius={[6, 6, 6, 6]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
