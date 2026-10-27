import { Minus, Star, Trophy } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRankings } from '../api/queries'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { Pager } from '../components/Pager'
import { formatPoints } from '../lib/format'
import { paginate } from '../lib/paginate'

const PAGE_SIZE = 10

/** Linha vazia no formato da linha do ranking. */
function RowSkeleton() {
  return (
    <li aria-hidden className="flex items-center gap-4 px-5 py-4">
      <div className="h-5 w-8 rounded-full bg-[var(--wash)]" />
      <div className="h-10 w-10 rounded-full bg-[var(--wash)]" />
      <div className="h-4 flex-1 rounded-full bg-[var(--wash)]" />
      <div className="h-6 w-12 rounded-full bg-[var(--wash)]" />
    </li>
  )
}

export function RankingTab({ challengeId }: { challengeId: number }) {
  const q = useRankings(challengeId)
  // Página volta para 1 ao trocar de desafio: ChallengePage remonta a aba com key.
  const [page, setPage] = useState(1)

  if (q.isPending) {
    return (
      <ol className="surface animate-pulse divide-y divide-[var(--hairline)] overflow-hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <RowSkeleton key={i} />
        ))}
      </ol>
    )
  }
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  if (q.data.length === 0) return <EmptyState eyebrow="Ranking" Icon={Trophy}>Ranking vazio</EmptyState>

  const current = paginate(q.data, page, PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      <ol className="surface divide-y divide-[var(--hairline)] overflow-hidden">
        {current.items.map((r, i) => {
          // Pódio ganha o gradiente no número e o aro na foto.
          const podium = r.rank != null && r.rank <= 3
          const row = (
            <>
              <span
                className={`flex w-14 shrink-0 items-center justify-end gap-1 font-heading font-semibold tabular-nums tracking-tight ${
                  podium ? 'text-2xl' : 'text-lg text-[var(--ink-muted)]'
                }`}
              >
                {podium && <Trophy size={14} strokeWidth={1.75} className="text-[var(--brand-from)]" />}
                {r.rank != null ? (
                  <span className={podium ? 'brand-text' : undefined}>{r.rank}º</span>
                ) : (
                  <Minus size={16} strokeWidth={1.75} />
                )}
              </span>
              <Avatar url={r.account.profile_picture_url} name={r.account.full_name} ring={podium} />
              <span className="min-w-0 flex-1 truncate font-medium text-[var(--ink)]">
                {r.account.full_name ?? 'Sem nome'}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--brand-from)]/35 bg-[var(--tint)] px-3 py-0.5 text-[0.8125rem] font-semibold tabular-nums text-[var(--brand-ink)]">
                <Star size={12} strokeWidth={1.75} />
                {formatPoints(r.score ?? 0)}
              </span>
            </>
          )
          return (
            <li key={r.account.id ?? i}>
              {r.account.id == null ? (
                <div className="flex items-center gap-4 px-5 py-3.5">{row}</div>
              ) : (
                <Link
                  to={`/c/${challengeId}/m/${r.account.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--wash)]"
                >
                  {row}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
      <Pager page={current} onChange={setPage} />
    </div>
  )
}
