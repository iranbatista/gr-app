import { CalendarCheck, Clock, type LucideIcon, Users, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Insights } from '../api/types'
import { dashboardKpis, formatDecimal, formatDelta, formatHours, type SparkPoint } from '../lib/dashboard'
import { Sparkline } from './Sparkline'
import { Badge } from './ui/Badge'

interface CardProps {
  label: string
  Icon: LucideIcon
  value: string
  badge?: ReactNode
  detail: string
  series: SparkPoint[]
  format: (v: number) => string
}

function KpiCard({ label, Icon, value, badge, detail, series, format }: CardProps) {
  return (
    <div role="group" aria-label={`${label}: ${value}`} className="surface flex min-w-0 flex-col overflow-hidden">
      <div className="flex flex-col gap-2 p-4 pb-1 sm:p-5 sm:pb-1">
        <p className="eyebrow flex items-center gap-1.5 truncate">
          <Icon size={13} strokeWidth={1.75} className="shrink-0" />
          <span className="truncate">{label}</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-heading text-[1.75rem] font-semibold leading-none tracking-tight text-[var(--ink)] tabular-nums sm:text-[2rem]">
            {value}
          </span>
          {badge}
        </div>
        <p className="text-[0.8125rem] leading-snug text-[var(--ink-muted)]">{detail}</p>
      </div>
      <Sparkline data={series} format={format} className="mt-auto h-14 w-full" />
    </div>
  )
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const percent = (v: number) => `${Math.round(v)}%`

/** Quatro KPIs do topo, cada um com a tendência dos últimos 14 dias. */
export function KpiCards({ insights, refDay, isToday }: { insights: Insights; refDay: string; isToday: boolean }) {
  const k = dashboardKpis(insights, refDay)
  const delta = k.checkins.delta
  const since = isToday ? 'ontem' : 'dia anterior'
  const relative = isToday ? 'em relação a ontem' : 'em relação ao dia anterior'
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        label={isToday ? 'Check-ins hoje' : 'Último dia'}
        Icon={CalendarCheck}
        value={String(k.checkins.value)}
        badge={
          <Badge
            tone={delta > 0 ? 'positive' : 'wash'}
            size="xs"
            aria-label={`${formatDelta(delta)} ${relative}`}
          >
            {formatDelta(delta)}
          </Badge>
        }
        detail={`vs ${since}`}
        series={k.checkins.series}
        format={(v) => plural(v, 'check-in', 'check-ins')}
      />
      <KpiCard
        label="Participação"
        Icon={Users}
        value={percent(k.participation.pct)}
        detail={`média 7 dias: ${percent(k.participation.avg7)}`}
        series={k.participation.series}
        format={(v) => `${percent(v)} dos atletas`}
      />
      <KpiCard
        label="Média por atleta"
        Icon={UserRound}
        value={formatDecimal(k.perAthlete.value)}
        detail={`de ${plural(k.perAthlete.active, 'atleta ativo', 'atletas ativos')}`}
        series={k.perAthlete.series}
        format={(v) => `${formatDecimal(v)} check-ins por atleta`}
      />
      <KpiCard
        label="Horas treinadas"
        Icon={Clock}
        value={formatHours(k.hours.hours)}
        detail={
          k.hours.avgMinutes == null ? 'sem duração registrada' : `média ${Math.round(k.hours.avgMinutes)} min por check-in`
        }
        series={k.hours.series}
        format={(v) => `${Math.round(v)} min`}
      />
    </div>
  )
}
