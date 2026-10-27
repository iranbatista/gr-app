import { Link, useParams } from 'react-router-dom'
import { useMemberWorkoutsAll, useRankings, useStats } from '../api/queries'
import type { DayCount, Workout } from '../api/types'
import { Avatar } from '../components/Avatar'
import { DayChart } from '../components/DayChart'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { Skeleton } from '../components/Skeleton'
import { StatTile } from '../components/StatTile'
import { WorkoutList } from '../components/WorkoutList'
import { formatCalories, formatDistance, formatPoints } from '../lib/format'

function countByDay(items: Workout[]): DayCount[] {
  const counts = new Map<string, number>()
  for (const w of items) {
    const day = w.occurred_at?.slice(0, 10)
    if (day) counts.set(day, (counts.get(day) ?? 0) + 1)
  }
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }))
}

export function MemberPage() {
  const params = useParams()
  const challengeId = Number(params.id)
  const memberId = Number(params.memberId)

  const rankings = useRankings(challengeId)
  const stats = useStats(challengeId)
  const all = useMemberWorkoutsAll(challengeId, memberId)

  const back = (
    <Link to={`/c/${challengeId}`} className="text-sm text-gray-500 hover:underline">
      ← Desafio
    </Link>
  )

  if (rankings.isPending || stats.isPending) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 p-4">
        {back}
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </main>
    )
  }
  if (rankings.isError || stats.isError) {
    const failed = rankings.error ?? stats.error
    return (
      <main className="mx-auto max-w-5xl space-y-4 p-4">
        {back}
        <ErrorState
          error={failed}
          onRetry={() => {
            rankings.refetch()
            stats.refetch()
          }}
        />
      </main>
    )
  }

  const entry = rankings.data.find((r) => r.account.id === memberId)
  const totals = stats.data.by_member.find((m) => m.account_id === memberId)
  if (!entry && !totals) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 p-4">
        {back}
        <EmptyState>Membro não encontrado</EmptyState>
      </main>
    )
  }

  const name = entry?.account.full_name ?? totals?.name ?? `Membro #${memberId}`

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4">
      {back}
      <header className="flex items-center gap-4">
        <Avatar url={entry?.account.profile_picture_url} name={name} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          {entry?.rank != null && <p className="text-gray-500">{entry.rank}º no ranking</p>}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Check-ins" value={totals?.workouts ?? 0} />
        <StatTile label="Pontos" value={formatPoints(entry?.score ?? totals?.points ?? 0)} />
        <StatTile label="Calorias" value={formatCalories(totals?.calories ?? 0)} />
        <StatTile label="Distância" value={formatDistance(totals?.distance ?? 0)} />
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Check-ins por dia</h2>
        {all.isPending ? (
          <Skeleton className="h-64" />
        ) : all.isError ? (
          <ErrorState error={all.error} onRetry={() => all.refetch()} />
        ) : (
          <DayChart data={countByDay(all.data.items)} />
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Histórico</h2>
        <WorkoutList challengeId={challengeId} filters={{ member: memberId }} showMember={false} />
      </section>
    </main>
  )
}
