import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { PacePoint } from '../../lib/compare'
import { ChartCard } from '../ChartCard'
import { tick } from '../chartStyle'
import { COLOR, CompareTooltipBox, useNames } from './shared'

type Key = 'Cum' | 'Pct'

interface Props {
  rows: PacePoint[]
  metric: Key
  title: string
  aside: string
  format: (v: number) => string
}

function PaceChart({ rows, metric, title, aside, format }: Props) {
  const n = useNames()
  const last = rows[rows.length - 1]
  const label = `${title}: ${n.a} ${last?.[`a${metric}`] != null ? format(last[`a${metric}`]!) : '—'}, ${n.b} ${
    last?.[`b${metric}`] != null ? format(last[`b${metric}`]!) : '—'
  } no dia ${last?.day ?? 0}`
  return (
    <ChartCard title={title} aside={aside} className="flex-1">
      <div role="img" aria-label={label} className="relative -mx-2 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--hairline)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={tick}
              tickLine={false}
              axisLine={false}
              tickFormatter={(d: number) => `Dia ${d}`}
              minTickGap={28}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={metric === 'Pct' ? 40 : 36}
              allowDecimals={false}
              tickFormatter={metric === 'Pct' ? (v: number) => `${v}%` : undefined}
              domain={metric === 'Pct' ? [0, 100] : [0, 'auto']}
            />
            <Tooltip
              cursor={{ stroke: 'var(--hairline)', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const row = payload[0].payload as PacePoint
                const v = (x?: number) => (x == null ? null : format(x))
                return (
                  <CompareTooltipBox
                    title={`Dia ${row.day}`}
                    rows={[
                      { side: 'a', value: v(row[`a${metric}`]) },
                      { side: 'b', value: v(row[`b${metric}`]) },
                    ]}
                  />
                )
              }}
            />
            {/* B por baixo, A por cima: a cor da marca nunca some atrás da neutra. */}
            <Line
              dataKey={`b${metric}`}
              name={n.b}
              stroke={COLOR.b}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              dataKey={`a${metric}`}
              name={n.a}
              stroke={COLOR.a}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: 'var(--card)' }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

const avg = (rows: PacePoint[], key: 'aPct' | 'bPct') => {
  const xs = rows.map((r) => r[key]).filter((v): v is number => v != null)
  return xs.length ? Math.round(xs.reduce((t, v) => t + v, 0) / xs.length) : 0
}

/** Ritmo lado a lado: check-ins acumulados e participação diária, por dia do desafio. */
export function PaceCharts({ rows }: { rows: PacePoint[] }) {
  const lastA = [...rows].reverse().find((r) => r.aCum != null)
  const lastB = [...rows].reverse().find((r) => r.bCum != null)
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <PaceChart
        rows={rows}
        metric="Cum"
        title="Check-ins acumulados"
        aside={`${lastA?.aCum ?? 0} × ${lastB?.bCum ?? 0}`}
        format={(v) => v.toLocaleString('pt-BR')}
      />
      <PaceChart
        rows={rows}
        metric="Pct"
        title="Participação diária"
        aside={`média ${avg(rows, 'aPct')}% × ${avg(rows, 'bPct')}%`}
        format={(v) => `${Math.round(v)}%`}
      />
    </div>
  )
}
