import { Link } from 'react-router-dom'
import { useChallenges } from '../api/queries'
import type { Challenge } from '../api/types'
import { Cover } from '../components/Cover'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { Skeleton } from '../components/Skeleton'
import { StatusBadge } from '../components/StatusBadge'
import { formatPeriod } from '../lib/format'
import { isActive } from '../lib/visual'

function ChallengeCard({ c }: { c: Challenge }) {
  return (
    <Link
      to={`/c/${c.id}`}
      className="block overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
    >
      <Cover url={c.profile_picture_url} name={c.name} className="h-36 w-full" />
      <div className="space-y-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold">{c.name ?? `Desafio #${c.id}`}</h2>
          <StatusBadge active={isActive(c)} />
        </div>
        <p className="text-sm text-gray-500">{formatPeriod(c.start_date, c.end_date)}</p>
        <p className="text-sm text-gray-500">{c.member_count ?? 0} membros</p>
      </div>
    </Link>
  )
}

export function ChallengesPage() {
  const q = useChallenges()

  let content
  if (q.isPending) {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-60" />
        ))}
      </div>
    )
  } else if (q.isError) {
    content = <ErrorState error={q.error} onRetry={() => q.refetch()} />
  } else if (q.data.length === 0) {
    content = <EmptyState>Nenhum desafio sincronizado ainda</EmptyState>
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {q.data.map((c) => (
          <ChallengeCard key={c.id} c={c} />
        ))}
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Desafios</h1>
      {content}
    </main>
  )
}
