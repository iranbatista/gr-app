import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Insights } from '../../api/types'
import { checkinsText, hourLabel } from '../../lib/dashboard'
import { type DurationPair, type PeriodPair, durationPairs, peakHour, periodPairs } from '../../lib/compare'
import { ChartCard } from '../ChartCard'
import { cursorFill, tick } from '../chartStyle'
import { COLOR, CompareTooltipBox, SideDot, useNames } from './shared'

// Barras agrupadas: A cheia na cor da marca, B na tinta neutra; 2px de folga entre elas.
const barProps = { radius: [4, 4, 4, 4] as [number, number, number, number], maxBarSize: 22, isAnimationActive: false }

function PeriodsCard({ rows, peakA, peakB }: { rows: PeriodPair[]; peakA: number | null; peakB: number | null }) {
  const n = useNames()
  const peak = (h: number | null) => (h == null ? '—' : hourLabel(h))
  return (
    <ChartCard title="Períodos do dia" aside="% dos check-ins de cada desafio" className="flex-1">
      <div
        role="img"
        aria-label={`Períodos do dia: ${rows.map((r) => `${r.label} ${r.aPct}% × ${r.bPct}%`).join(', ')}`}
        className="relative -mx-2 h-56"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 6, right: 8, left: 0, bottom: 0 }} barGap={2} barCategoryGap="24%">
            <CartesianGrid stroke="var(--hairline)" vertical={false} />
            <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} />
            <YAxis tick={tick} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => `${v}%`} allowDecimals={false} />
            <Tooltip
              cursor={cursorFill}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as PeriodPair
                return (
                  <CompareTooltipBox
                    title={`${r.label} · ${r.range}`}
                    rows={[
                      { side: 'a', value: `${r.aPct}% · ${checkinsText(r.a)}` },
                      { side: 'b', value: `${r.bPct}% · ${checkinsText(r.b)}` },
                    ]}
                  />
                )
              }}
            />
            <Bar dataKey="aPct" name={n.a} fill={COLOR.a} {...barProps} />
            <Bar dataKey="bPct" name={n.b} fill={COLOR.b} fillOpacity={0.7} {...barProps} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Horário de pico de cada lado, somando todos os dias da semana. */}
      <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-[var(--hairline)] pt-3 text-[0.8125rem]">
        {(['a', 'b'] as const).map((side) => (
          <div key={side} className="flex min-w-0 items-center gap-2">
            <SideDot side={side} />
            <dt className="truncate text-[var(--ink-muted)]">
              Pico<span className="hidden sm:inline"> em {n[side]}</span>
            </dt>
            <dd className="ml-auto font-semibold tabular-nums text-[var(--ink)]">{peak(side === 'a' ? peakA : peakB)}</dd>
          </div>
        ))}
      </dl>
    </ChartCard>
  )
}

function DurationCard({ rows }: { rows: DurationPair[] }) {
  const n = useNames()
  const min = (v: number | null) => (v == null ? 'sem duração' : `${v} min`)
  return (
    <ChartCard title="Duração média por dia" aside="minutos por check-in" className="flex-1">
      <div
        role="img"
        aria-label={`Duração média por dia: ${rows.map((r) => `${r.label} ${min(r.a)} × ${min(r.b)}`).join(', ')}`}
        className="relative -mx-2 min-h-56 flex-1"
      >
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 6, right: 8, left: 0, bottom: 0 }} barGap={2} barCategoryGap="22%">
              <CartesianGrid stroke="var(--hairline)" vertical={false} />
              <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} />
              <YAxis tick={tick} tickLine={false} axisLine={false} width={56} allowDecimals={false} tickFormatter={(v: number) => `${v} min`} />
              <Tooltip
                cursor={cursorFill}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const r = payload[0].payload as DurationPair
                  return (
                    <CompareTooltipBox
                      title={r.label}
                      rows={[
                        { side: 'a', value: min(r.a) },
                        { side: 'b', value: min(r.b) },
                      ]}
                    />
                  )
                }}
              />
              <Bar dataKey="a" name={n.a} fill={COLOR.a} {...barProps} />
              <Bar dataKey="b" name={n.b} fill={COLOR.b} fillOpacity={0.7} {...barProps} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  )
}

export function WhenCompare({ a, b }: { a: Insights; b: Insights }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <PeriodsCard rows={periodPairs(a.periods, b.periods)} peakA={peakHour(a.punchcard)} peakB={peakHour(b.punchcard)} />
      <DurationCard rows={durationPairs(a.duration_by_weekday, b.duration_by_weekday)} />
    </div>
  )
}
