import { CalendarCheck, Clock, type LucideIcon, TrendingDown, TrendingUp, UserRound, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Insights } from '../api/types'
import { SPARK_DAYS, type SparkPoint, compareText, dashboardKpis, formatDecimal, formatHours } from '../lib/dashboard'
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
        {/* Celular: rótulo pode quebrar e reserva 2 linhas, os números ficam alinhados no 2×2.
            Ícone só a partir do sm, onde há largura. */}
        <p className="eyebrow flex min-h-[2.5em] items-start gap-1.5 leading-[1.25] sm:min-h-0 sm:items-center">
          <Icon size={13} strokeWidth={1.75} className="hidden shrink-0 sm:block" />
          <span className="line-clamp-2 sm:truncate">{label}</span>
        </p>
        <p className="font-heading leading-none tracking-tight text-[var(--ink)] tabular-nums">
          <span className="text-[1.75rem] font-semibold sm:text-[2rem]">{value}</span>
          {suffix && <span className="ml-0.5 text-base font-medium text-[var(--ink-muted)]">{suffix}</span>}
        </p>
        <p className="text-[0.8125rem] leading-snug text-[var(--ink-muted)]">{detail}</p>
      </div>
      <div className="mt-auto">
        {/* Legenda da sparkline: sem ela a linha não diz de quando é. */}
        <span className="block px-4 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-[var(--ink-muted)] sm:px-5">
          últimos {SPARK_DAYS} dias
        </span>
        <Sparkline data={series} format={format} className="h-14 w-full" />
      </div>
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
    <span className="inline-flex items-center gap-1">
      {Arrow && (
        <Arrow
          size={13}
          strokeWidth={2}
          className={`shrink-0 ${diff > 0 ? 'text-[var(--positive)]' : 'text-[var(--ink-muted)]'}`}
        />
      )}
      {compareText(value, previous, isToday)}
    </span>
  )
}

/** Quatro KPIs do topo; cada um se lê como frase: rótulo + número + contexto. */
export function KpiCards({ insights, refDay, isToday }: { insights: Insights; refDay: string; isToday: boolean }) {
  const k = dashboardKpis(insights, refDay)
  const when = isToday ? 'hoje' : 'no último dia'
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        label={`Check-ins ${when}`}
        Icon={CalendarCheck}
        value={String(k.checkins.value)}
        detail={<Compare value={k.checkins.value} previous={k.checkins.previous} isToday={isToday} />}
        series={k.checkins.series}
        format={(v) => plural(v, 'check-in', 'check-ins')}
      />
      <KpiCard
        label={`Atletas ativos ${when}`}
        Icon={Users}
        value={String(k.participation.athletes)}
        suffix={`/${k.participation.members}`}
        detail={`${percent(k.participation.pct)} do grupo · média 7 dias ${percent(k.participation.avg7)}`}
        series={k.participation.series}
        format={(v) => `${percent(v)} do grupo`}
      />
      <KpiCard
        label="Check-ins por atleta"
        Icon={UserRound}
        value={formatDecimal(k.perAthlete.value)}
        detail={`média do grupo (${k.perAthlete.workouts} ÷ ${k.perAthlete.members})`}
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
            : `${Math.round(k.hours.avgMinutes)} min por check-in, em média`
        }
        series={k.hours.series}
        format={(v) => `${Math.round(v)} min`}
      />
    </div>
  )
}
