import { ArrowLeft, Trophy } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useMemberWorkoutsAll, useRankings, useStats } from '../api/queries'
import type { DayCount, Workout } from '../api/types'
import { Avatar } from '../components/Avatar'
import { DayChart } from '../components/DayChart'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { StatTile } from '../components/StatTile'
import { WorkoutList } from '../components/WorkoutList'
import { formatCalories, formatDistance, formatPoints, localDayKey } from '../lib/format'
import { backLinkClass, icon, pageClass } from '../lib/ui'

const sectionTitle = 'font-heading text-lg font-medium tracking-tight text-[var(--ink)]'

/** Hero vazio no formato do cabeçalho do membro. */
function HeroSkeleton() {
  return (
    <div aria-hidden className="surface flex animate-pulse items-center gap-5 p-6">
      <div className="h-[6.25rem] w-[6.25rem] shrink-0 rounded-full bg-[var(--wash)]" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="h-3 w-16 rounded-full bg-[var(--wash)]" />
        <div className="h-7 w-48 max-w-full rounded-full bg-[var(--wash)]" />
        <div className="h-6 w-28 rounded-full bg-[var(--wash)]" />
      </div>
    </div>
  )
}

function countByDay(items: Workout[]): DayCount[] {
  const counts = new Map<string, number>()
  for (const w of items) {
    const day = w.occurred_at ? localDayKey(w.occurred_at) : undefined
    if (day) counts.set(day, (counts.get(day) ?? 0) + 1)
  }
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }))
}

export function MemberPage() {
  const params = useParams()
  const challengeId = Number(params.id)
  const memberId = Number(params.memberId)

  if (!Number.isFinite(challengeId) || !Number.isFinite(memberId)) {
    return (
      <main className={pageClass}>
        <ErrorState error={new ApiError(404, 'invalid id')} notFound="Membro não encontrado" />
      </main>
    )
  }
  return <MemberView challengeId={challengeId} memberId={memberId} />
}

function MemberView({ challengeId, memberId }: { challengeId: number; memberId: number }) {
  const rankings = useRankings(challengeId)
  const stats = useStats(challengeId)
  const all = useMemberWorkoutsAll(challengeId, memberId)

  const back = (
    <div>
      <Link to={`/c/${challengeId}`} className={backLinkClass}>
        <ArrowLeft {...icon} />
        Desafio
      </Link>
    </div>
  )

  if (rankings.isPending || stats.isPending) {
    return (
      <main className={`${pageClass} flex flex-col gap-8`}>
        {back}
        <HeroSkeleton />
        <div aria-hidden className="surface h-72 animate-pulse" />
      </main>
    )
  }
  if (rankings.isError || stats.isError) {
    const failed = rankings.error ?? stats.error
    return (
      <main className={`${pageClass} flex flex-col gap-8`}>
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
      <main className={`${pageClass} flex flex-col gap-8`}>
        {back}
        <EmptyState eyebrow="Membro">Membro não encontrado</EmptyState>
      </main>
    )
  }

  const name = entry?.account.full_name ?? totals?.name ?? `Membro #${memberId}`

  return (
    <main className={`${pageClass} flex flex-col gap-10`}>
      {back}
      <header className="surface flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <Avatar url={entry?.account.profile_picture_url} name={name} size="lg" ring />
        <div className="flex min-w-0 flex-col items-center gap-2.5 sm:items-start">
          <p className="eyebrow">Atleta</p>
          <h1 className="break-words font-heading text-[1.875rem] font-semibold leading-[1.1] tracking-tight text-[var(--ink)] sm:text-[2.25rem]">
            {name}
          </h1>
          {entry?.rank != null && (
            <p className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-from)]/35 bg-[var(--tint)] px-3.5 py-1 text-[0.8125rem] font-semibold text-[var(--brand-ink)]">
              <Trophy size={13} strokeWidth={1.75} />
              {entry.rank}º no ranking
            </p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Check-ins" value={totals?.workouts ?? 0} />
        <StatTile label="Pontos" value={formatPoints(entry?.score ?? totals?.points ?? 0)} />
        <StatTile label="Calorias" value={formatCalories(totals?.calories ?? 0)} />
        <StatTile label="Distância" value={formatDistance(totals?.distance ?? 0)} />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className={sectionTitle}>Check-ins por dia</h2>
        {all.isPending ? (
          <div aria-hidden className="surface h-72 animate-pulse" />
        ) : all.isError ? (
          <ErrorState error={all.error} onRetry={() => all.refetch()} />
        ) : (
          <DayChart data={countByDay(all.data.items)} />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className={sectionTitle}>Histórico</h2>
        <WorkoutList challengeId={challengeId} filters={{ member: memberId }} showMember={false} />
      </section>
    </main>
  )
}
