import { ChevronDown, Dumbbell } from 'lucide-react'
import { icon } from '../lib/ui'
import { type WorkoutFilters, useWorkouts } from '../api/queries'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { WorkoutCard } from './WorkoutCard'

interface Props {
  challengeId: number
  filters: WorkoutFilters
  showMember?: boolean
}

/** Cartão vazio no formato do check-in: foto, membro, título e pills. */
function WorkoutSkeleton() {
  return (
    <div aria-hidden className="surface flex flex-col gap-4 p-3">
      <div className="aspect-video w-full rounded-[1.25rem] bg-[var(--wash)]" />
      <div className="flex flex-col gap-3 px-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-[var(--wash)]" />
          <div className="h-3 w-28 rounded-full bg-[var(--wash)]" />
        </div>
        <div className="h-4 w-40 rounded-full bg-[var(--wash)]" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-full bg-[var(--wash)]" />
          <div className="h-5 w-14 rounded-full bg-[var(--wash)]" />
        </div>
      </div>
    </div>
  )
}

export function WorkoutList({ challengeId, filters, showMember = true }: Props) {
  const q = useWorkouts(challengeId, filters)

  if (q.isPending) {
    return (
      <div className="grid animate-pulse gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <WorkoutSkeleton key={i} />
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
    return (
      <EmptyState eyebrow="Feed vazio" Icon={Dumbbell}>
        {filtered ? 'Nenhum check-in para esses filtros' : 'Nenhum check-in ainda'}
      </EmptyState>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((w) => (
          <WorkoutCard key={w.id} workout={w} showMember={showMember} />
        ))}
      </div>
      {q.hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => q.fetchNextPage()}
            disabled={q.isFetchingNextPage}
            className="btn-secondary gap-2"
          >
            <ChevronDown {...icon} />
            {q.isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  )
}
