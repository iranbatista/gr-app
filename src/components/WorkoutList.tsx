import { type WorkoutFilters, useWorkouts } from '../api/queries'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { Skeleton } from './Skeleton'
import { WorkoutCard } from './WorkoutCard'

interface Props {
  challengeId: number
  filters: WorkoutFilters
  showMember?: boolean
}

export function WorkoutList({ challengeId, filters, showMember = true }: Props) {
  const q = useWorkouts(challengeId, filters)

  if (q.isPending) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />

  // páginas por offset podem se sobrepor quando há check-ins novos entre as requisições
  const seen = new Set<number>()
  const items = q.data.pages.flatMap((p) => p.items).filter((w) => !seen.has(w.id) && seen.add(w.id))
  if (items.length === 0) {
    const filtered = filters.member != null || !!filters.since || !!filters.until
    return <EmptyState>{filtered ? 'Nenhum check-in para esses filtros' : 'Nenhum check-in ainda'}</EmptyState>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((w) => (
          <WorkoutCard key={w.id} workout={w} showMember={showMember} />
        ))}
      </div>
      {q.hasNextPage && (
        <button
          type="button"
          onClick={() => q.fetchNextPage()}
          disabled={q.isFetchingNextPage}
          className="w-full rounded-lg border bg-white py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          {q.isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
        </button>
      )}
    </div>
  )
}
