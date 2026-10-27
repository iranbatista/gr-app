import { Link } from 'react-router-dom'
import { useRankings } from '../api/queries'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { Skeleton } from '../components/Skeleton'
import { formatPoints } from '../lib/format'

export function RankingTab({ challengeId }: { challengeId: number }) {
  const q = useRankings(challengeId)

  if (q.isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    )
  }
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  if (q.data.length === 0) return <EmptyState>Ranking vazio</EmptyState>

  return (
    <ol className="divide-y overflow-hidden rounded-lg border bg-white">
      {q.data.map((r, i) => {
        const row = (
          <>
            <span className="w-8 text-right font-bold text-gray-500">
              {r.rank != null ? `${r.rank}º` : '—'}
            </span>
            <Avatar url={r.account.profile_picture_url} name={r.account.full_name} />
            <span className="flex-1 font-medium">{r.account.full_name ?? 'Sem nome'}</span>
            <span className="font-semibold">{formatPoints(r.score ?? 0)}</span>
          </>
        )
        return (
          <li key={r.account.id ?? i}>
            {r.account.id == null ? (
              <div className="flex items-center gap-3 p-3">{row}</div>
            ) : (
              <Link
                to={`/c/${challengeId}/m/${r.account.id}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50"
              >
                {row}
              </Link>
            )}
          </li>
        )
      })}
    </ol>
  )
}
