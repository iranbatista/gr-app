import { useId } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { WeekdayDuration } from '../api/types'
import { durationRows, durationText } from '../lib/dashboard'
import { useReducedMotion } from '../lib/motion'
import { ChartCard } from './ChartCard'
import { ChartTooltip } from './ChartTooltip'
import { cursorFill, tick } from './chartStyle'

type Row = ReturnType<typeof durationRows>[number]

/** Duração média por dia da semana; dia sem duração fica só com o trilho vazio. */
export function DurationChart({ data }: { data: WeekdayDuration[] }) {
  const rows = durationRows(data)
  const gradient = `dur-${useId().replace(/:/g, '')}`
  const reduced = useReducedMotion()
  const timed = rows.filter((r) => r.avg != null)
  const longest = timed.reduce<Row | null>((best, r) => (!best || (r.avg ?? 0) > (best.avg ?? 0) ? r : best), null)
  return (
    <ChartCard
      title="Duração média por dia"
      className="flex-1"
      aside={longest && `treinos mais longos: ${longest.label.toLowerCase()}`}
    >
      <div className="relative -mx-2 min-h-56 flex-1">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: 'var(--brand-from)' }} />
                  <stop offset="100%" style={{ stopColor: 'var(--brand-to)' }} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--hairline)" vertical={false} />
              <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} />
              <YAxis
                allowDecimals={false}
                tick={tick}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v: number) => `${v} min`}
              />
              <Tooltip
                cursor={cursorFill}
                content={(p) => <ChartTooltip {...p} render={(_, __, row) => durationText(row as Row)} />}
              />
              <Bar
                dataKey="value"
                name="Duração média"
                fill={`url(#${gradient})`}
                radius={[6, 6, 6, 6]}
                maxBarSize={40}
                background={{ fill: 'var(--wash)', radius: 6 }}
                isAnimationActive={!reduced}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  )
}
