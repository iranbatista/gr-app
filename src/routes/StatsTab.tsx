import { useStats } from '../api/queries'
import { DayChart } from '../components/DayChart'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { MemberChart } from '../components/MemberChart'
import { Skeleton } from '../components/Skeleton'
import { StatTile } from '../components/StatTile'

export function StatsTab({ challengeId }: { challengeId: number }) {
  const q = useStats(challengeId)

  if (q.isPending) return <Skeleton className="h-80" />
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const s = q.data
  if (s.total_workouts === 0) return <EmptyState>Nenhum check-in ainda</EmptyState>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Check-ins" value={s.total_workouts} />
        <StatTile label="Membros ativos" value={s.members} />
      </div>
      <section className="space-y-2">
        <h2 className="font-semibold">Check-ins por dia</h2>
        <DayChart data={s.by_day} />
      </section>
      <section className="space-y-2">
        <h2 className="font-semibold">Check-ins por membro</h2>
        <MemberChart data={s.by_member} />
      </section>
    </div>
  )
}
