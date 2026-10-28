import { Dumbbell } from 'lucide-react'
import { useStats } from '../api/queries'
import { DayHeatmap } from '../components/DayHeatmap'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { MemberChart } from '../components/MemberChart'
import { StatsSkeleton } from '../components/skeletons'
import { StatTile } from '../components/StatTile'
import { WeeklyChart } from '../components/WeeklyChart'

export function StatsTab({ challengeId }: { challengeId: number }) {
  const q = useStats(challengeId)

  if (q.isPending) return <StatsSkeleton />
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const s = q.data
  if (s.total_workouts === 0) return <EmptyState eyebrow="Gráficos" Icon={Dumbbell}>Nenhum check-in ainda</EmptyState>

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-4">
        <StatTile label="Check-ins" value={s.total_workouts} />
        <StatTile label="Membros ativos" value={s.members} />
      </div>
      {/* Dia e semana lado a lado no desktop, empilhados no celular. */}
      <div className="grid gap-5 lg:grid-cols-2">
        <DayHeatmap data={s.by_day} />
        <WeeklyChart data={s.by_day} />
      </div>
      <MemberChart data={s.by_member} />
    </div>
  )
}
