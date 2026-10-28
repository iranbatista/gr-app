import { CalendarCheck, Clock, type LucideIcon, TrendingDown, TrendingUp, UserRound, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Insights } from '../api/types'
import { type SparkPoint, compareText, dashboardKpis, formatDecimal, formatHours } from '../lib/dashboard'
import { Sparkline } from './Sparkline'

interface CardProps {
  label: string
  Icon: LucideIcon
  /** Número principal (o que o rótulo diz). */
  value: string
  /** Complemento menor ao lado do número ("/48"). */
  suffix?: string
  /** Contexto em palavras, uma linha. */
  detail: ReactNode
  series: SparkPoint[]
  format: (v: number) => string
}

function KpiCard({ label, Icon, value, suffix, detail, series, format }: CardProps) {
  return (
    <div
      role="group"
      aria-label={`${label}: ${value}${suffix ?? ''}`}
      className="surface flex min-w-0 flex-col overflow-hidden"
    >
      <div className="flex flex-col gap-2 p-4 pb-2 sm:p-5 sm:pb-2">
        {/* Rótulo curto numa linha; no 2×2 do celular o espaçamento aperta e o ícone sai. */}
        <p className="eyebrow flex items-center gap-1.5 tracking-[0.1em] sm:tracking-[0.16em]">
          <Icon size={13} strokeWidth={1.75} className="hidden shrink-0 sm:block" />
          <span className="truncate">{label}</span>
        </p>
        <p className="font-heading leading-none tracking-tight text-[var(--ink)] tabular-nums">
          <span className="text-[1.75rem] font-semibold sm:text-[2rem]">{value}</span>
          {suffix && <span className="ml-0.5 text-base font-medium text-[var(--ink-muted)]">{suffix}</span>}
        </p>
        <p className="text-[0.8125rem] leading-snug text-[var(--ink-muted)]">{detail}</p>
      </div>
      <Sparkline data={series} format={format} className="mt-auto h-14 w-full" />
    </div>
  )
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const percent = (v: number) => `${Math.round(v)}%`

/** Variação em palavras, com seta só como apoio (verde subindo, neutra caindo). */
function Compare({ value, previous, isToday }: { value: number; previous: number; isToday: boolean }) {
  const diff = value - previous
  const Arrow = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : null
  return (
    <span className="inline-flex max-w-full items-center gap-1">
      {Arrow && (
        <Arrow
          size={13}
          strokeWidth={2}
          className={`hidden shrink-0 sm:block ${diff > 0 ? 'text-[var(--positive)]' : 'text-[var(--ink-muted)]'}`}
        />
      )}
      {compareText(value, previous, isToday)}
    </span>
  )
}

/** Quatro KPIs do topo; cada um se lê como frase: rótulo + número + contexto. */
export function KpiCards({ insights, refDay, isToday }: { insights: Insights; refDay: string; isToday: boolean }) {
  const k = dashboardKpis(insights, refDay)
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        label={isToday ? 'Check-ins hoje' : 'Check-ins, último dia'}
        Icon={CalendarCheck}
        value={String(k.checkins.value)}
        detail={<Compare value={k.checkins.value} previous={k.checkins.previous} isToday={isToday} />}
        series={k.checkins.series}
        format={(v) => plural(v, 'check-in', 'check-ins')}
      />
      <KpiCard
        label={isToday ? 'Atletas hoje' : 'Atletas, último dia'}
        Icon={Users}
        value={String(k.participation.athletes)}
        suffix={`/${k.participation.members}`}
        detail={`${percent(k.participation.pct)} do grupo`}
        series={k.participation.series}
        format={(v) => `${percent(v)} do grupo`}
      />
      <KpiCard
        label="Check-ins/atleta"
        Icon={UserRound}
        value={formatDecimal(k.perAthlete.value)}
        detail="média do grupo"
        series={k.perAthlete.series}
        format={(v) => `${formatDecimal(v)} por atleta`}
      />
      <KpiCard
        label="Horas treinadas"
        Icon={Clock}
        value={formatHours(k.hours.hours)}
        detail={
          k.hours.avgMinutes == null
            ? 'sem duração registrada'
            : `${Math.round(k.hours.avgMinutes)} min por check-in`
        }
        series={k.hours.series}
        format={(v) => `${Math.round(v)} min`}
      />
    </div>
  )
}
