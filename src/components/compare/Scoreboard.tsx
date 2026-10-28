import { CalendarCheck, Clock, Hourglass, type LucideIcon, Percent, UserRound, Users } from 'lucide-react'
import { formatDecimal, formatHours } from '../../lib/dashboard'
import { type KpiSide, deltaPct, formatDeltaPct, formatDeltaPp, formatSigned } from '../../lib/compare'
import type { ReactNode } from 'react'
import { DeltaBadge, PpTerm, SideDot, useNames } from './shared'

interface Kpi {
  id: string
  label: string
  Icon: LucideIcon
  value: (k: KpiSide) => string
  suffix?: (k: KpiSide) => string
  /** Número comparado (para a variação). */
  raw: (k: KpiSide) => number | null
  /** Variação em pontos percentuais em vez de %. */
  pp?: boolean
}

const percent = (v: number) => `${Math.round(v)}%`

const KPIS: Kpi[] = [
  { id: 'checkins', label: 'Check-ins', Icon: CalendarCheck, value: (k) => k.workouts.toLocaleString('pt-BR'), raw: (k) => k.workouts },
  {
    id: 'active',
    label: 'Atletas ativos',
    Icon: Users,
    value: (k) => String(k.active),
    suffix: (k) => `/${k.members}`,
    raw: (k) => k.active,
  },
  { id: 'participation', label: 'Participação diária', Icon: Percent, value: (k) => percent(k.participation), raw: (k) => k.participation, pp: true },
  { id: 'per-athlete', label: 'Check-ins/atleta', Icon: UserRound, value: (k) => formatDecimal(k.perAthlete), raw: (k) => k.perAthlete },
  { id: 'hours', label: 'Horas treinadas', Icon: Clock, value: (k) => formatHours(k.hours), raw: (k) => k.hours },
  {
    id: 'duration',
    label: 'Duração média',
    Icon: Hourglass,
    value: (k) => (k.avgMinutes == null ? '—' : `${Math.round(k.avgMinutes)} min`),
    raw: (k) => k.avgMinutes,
  },
]

function deltaOf(kpi: Kpi, a: KpiSide, b: KpiSide): { value: number | null; text: string; node?: ReactNode } | null {
  const x = kpi.raw(a)
  const y = kpi.raw(b)
  if (x == null || y == null) return null
  if (kpi.pp) {
    // Diferença em pontos percentuais: a sigla ganha a explicação.
    return {
      value: x - y,
      text: formatDeltaPp(x - y),
      node: (
        <>
          {formatSigned(Math.round(x - y) || 0)} <PpTerm />
        </>
      ),
    }
  }
  const d = deltaPct(x, y)
  return { value: d, text: formatDeltaPct(d) }
}

function ScoreCard({ kpi, a, b }: { kpi: Kpi; a: KpiSide; b: KpiSide }) {
  const n = useNames()
  const delta = deltaOf(kpi, a, b)
  const va = `${kpi.value(a)}${kpi.suffix?.(a) ?? ''}`
  const vb = `${kpi.value(b)}${kpi.suffix?.(b) ?? ''}`
  return (
    <li
      aria-label={`${kpi.label}: ${n.a} ${va}, ${n.b} ${vb}${delta ? `, ${delta.text}` : ''}`}
      className="surface flex min-w-0 flex-col gap-3 p-4 sm:p-5"
    >
      {/* Rótulo com a largura toda (no 2×2 do celular não sobra espaço para o badge ao lado). */}
      <p className="eyebrow flex min-w-0 items-center gap-1.5 tracking-[0.1em] sm:tracking-[0.16em]">
        <kpi.Icon size={13} strokeWidth={1.75} className="hidden shrink-0 sm:block" />
        <span className="truncate">{kpi.label}</span>
      </p>
      {/* A em destaque com a variação; B logo abaixo, menor e neutro. */}
      <div className="flex items-center gap-2">
        <p className="flex min-w-0 items-baseline gap-2 whitespace-nowrap font-heading leading-none tracking-tight tabular-nums text-[var(--ink)]">
          <SideDot side="a" className="self-center" />
          <span className="text-[1.5rem] font-semibold sm:text-[1.875rem]">{kpi.value(a)}</span>
          {kpi.suffix && <span className="-ml-1.5 text-sm font-medium text-[var(--ink-muted)]">{kpi.suffix(a)}</span>}
        </p>
        {delta && (
          <span className="ml-auto">
            <DeltaBadge value={delta.value} text={delta.node ?? delta.text} />
          </span>
        )}
      </div>
      <p className="flex min-w-0 items-baseline gap-2 text-[0.8125rem] leading-none tabular-nums text-[var(--ink-muted)]">
        <SideDot side="b" className="self-center" />
        <span className="whitespace-nowrap font-semibold text-[var(--ink)]/75">{vb}</span>
        <span className="hidden truncate sm:inline">em {n.b}</span>
      </p>
    </li>
  )
}

/** Seis KPIs A × B com a variação de A sobre B. */
export function Scoreboard({ a, b }: { a: KpiSide; b: KpiSide }) {
  return (
    <ul aria-label="Placar" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {KPIS.map((k) => (
        <ScoreCard key={k.id} kpi={k} a={a} b={b} />
      ))}
    </ul>
  )
}
