import { Dumbbell } from 'lucide-react'
import { useStats } from '../api/queries'
import { DayChart } from '../components/DayChart'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { MemberChart } from '../components/MemberChart'
import { StatTile } from '../components/StatTile'

const sectionTitle = 'font-heading text-lg font-medium tracking-tight text-[var(--ink)]'

export function StatsTab({ challengeId }: { challengeId: number }) {
  const q = useStats(challengeId)

  if (q.isPending) {
    return (
      <div aria-hidden className="flex animate-pulse flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="surface h-[5.5rem]" />
          <div className="surface h-[5.5rem]" />
        </div>
        <div className="surface h-72" />
      </div>
    )
  }
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const s = q.data
  if (s.total_workouts === 0) return <EmptyState eyebrow="Gráficos" Icon={Dumbbell}>Nenhum check-in ainda</EmptyState>

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-4">
        <StatTile label="Check-ins" value={s.total_workouts} />
        <StatTile label="Membros ativos" value={s.members} />
      </div>
      <section className="flex flex-col gap-4">
        <h2 className={sectionTitle}>Check-ins por dia</h2>
        <DayChart data={s.by_day} />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className={sectionTitle}>Check-ins por membro</h2>
        <MemberChart data={s.by_member} />
      </section>
    </div>
  )
}
