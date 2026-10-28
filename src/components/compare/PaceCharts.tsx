import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AVG_DAYS, type PacePoint, formatSigned } from '../../lib/compare'
import { ChartCard } from '../ChartCard'
import { cursorFill, tick } from '../chartStyle'
import { COLOR, CompareTooltipBox, SideDot, useNames } from './shared'

const dayTick = (d: number) => `Dia ${d}`
const xAxis = { dataKey: 'day', tick, tickLine: false, axisLine: false, tickFormatter: dayTick, minTickGap: 28 } as const

/** Quem está à frente com essa diferença (empate não tem líder). */
function leader(diff: number, names: { a: string; b: string }) {
  return diff > 0 ? `${names.a} à frente` : diff < 0 ? `${names.b} à frente` : 'empate'
}

/**
 * Diferença acumulada de check-ins (A − B) por dia: barra laranja quando A lidera,
 * ardósia quando B lidera. O zero é a linha forte do gráfico.
 */
function DiffChart({ rows }: { rows: PacePoint[] }) {
  const n = useNames()
  const data = rows.filter((r) => r.diff != null)
  const last = data[data.length - 1]
  const aside = last ? `${formatSigned(last.diff!)} no dia ${last.day} · ${leader(last.diff!, n)}` : undefined
  return (
    <ChartCard title="Diferença acumulada" aside={aside} className="flex-1">
      <div role="img" aria-label={`Diferença acumulada de check-ins: ${aside ?? 'sem dados'}`} className="relative -mx-2 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }} barCategoryGap={2}>
            <CartesianGrid stroke="var(--hairline)" vertical={false} />
            <XAxis {...xAxis} interval="preserveStartEnd" />
            <YAxis
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={40}
              allowDecimals={false}
              tickFormatter={(v: number) => formatSigned(v)}
            />
            <ReferenceLine y={0} stroke="var(--ink)" strokeOpacity={0.45} strokeWidth={1.5} />
            <Tooltip
              cursor={cursorFill}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as PacePoint
                return (
                  <CompareTooltipBox
                    title={`Dia ${r.day}`}
                    rows={[
                      { side: 'a', value: r.aCum?.toLocaleString('pt-BR') ?? null },
                      { side: 'b', value: r.bCum?.toLocaleString('pt-BR') ?? null },
                    ]}
                    footer={
                      <span>
                        <span className="font-semibold tabular-nums text-[var(--ink)]">{formatSigned(r.diff!)}</span> ·{' '}
                        {leader(r.diff!, n)}
                      </span>
                    }
                  />
                )
              }}
            />
            <Bar dataKey="diff" name="Diferença" radius={[3, 3, 3, 3]} maxBarSize={18} isAnimationActive={false}>
              {data.map((r) => (
                <Cell key={r.day} fill={r.diff! >= 0 ? COLOR.a : COLOR.b} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Leitura das cores: acima do zero A lidera, abaixo B. */}
      <p className="mt-auto flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem] text-[var(--ink-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <SideDot side="a" />
          acima do zero: {n.a} à frente
        </span>
        <span className="inline-flex items-center gap-1.5">
          <SideDot side="b" />
          abaixo: {n.b} à frente
        </span>
      </p>
    </ChartCard>
  )
}

const pct = (v?: number) => (v == null ? null : `${Math.round(v)}%`)

/** Participação diária: média móvel de 7 dias como linha, o valor do dia como ponto apagado. */
function ParticipationChart({ rows }: { rows: PacePoint[] }) {
  const n = useNames()
  const mean = (key: 'aPct' | 'bPct') => {
    const xs = rows.map((r) => r[key]).filter((v): v is number => v != null)
    return xs.length ? Math.round(xs.reduce((t, v) => t + v, 0) / xs.length) : 0
  }
  const faint = (side: 'a' | 'b') => ({ r: 2, fill: COLOR[side], fillOpacity: 0.28, strokeWidth: 0 })
  return (
    <ChartCard title="Participação diária" aside={`média ${mean('aPct')}% × ${mean('bPct')}%`} className="flex-1">
      <div
        role="img"
        aria-label={`Participação diária, média móvel de ${AVG_DAYS} dias: ${n.a} ${mean('aPct')}%, ${n.b} ${mean('bPct')}% em média`}
        className="relative -mx-2 h-56"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--hairline)" vertical={false} />
            <XAxis {...xAxis} interval="preserveStartEnd" />
            <YAxis tick={tick} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
            <Tooltip
              cursor={{ stroke: 'var(--hairline)', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as PacePoint
                const v = (avg?: number, raw?: number) => (avg == null ? null : `${pct(avg)} · dia ${pct(raw)}`)
                return (
                  <CompareTooltipBox
                    title={`Dia ${r.day} · média ${AVG_DAYS} dias`}
                    rows={[
                      { side: 'a', value: v(r.aAvg, r.aPct) },
                      { side: 'b', value: v(r.bAvg, r.bPct) },
                    ]}
                  />
                )
              }}
            />
            {/* Pontos do dia bem apagados atrás das médias; B por baixo de A. */}
            <Line dataKey="bPct" stroke="none" dot={faint('b')} activeDot={false} isAnimationActive={false} legendType="none" />
            <Line dataKey="aPct" stroke="none" dot={faint('a')} activeDot={false} isAnimationActive={false} legendType="none" />
            <Line
              dataKey="bAvg"
              name={n.b}
              stroke={COLOR.b}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
              isAnimationActive={false}
            />
            <Line
              dataKey="aAvg"
              name={n.a}
              stroke={COLOR.a}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: 'var(--card)' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-auto text-[0.8125rem] text-[var(--ink-muted)]">
        Linhas: média móvel de {AVG_DAYS} dias · pontos: o dia
      </p>
    </ChartCard>
  )
}

/** Ritmo lado a lado: quem está à frente no acumulado e a participação suavizada. */
export function PaceCharts({ rows }: { rows: PacePoint[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <DiffChart rows={rows} />
      <ParticipationChart rows={rows} />
    </div>
  )
}
