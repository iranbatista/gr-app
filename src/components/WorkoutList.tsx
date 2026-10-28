import { ChevronDown, Dumbbell } from 'lucide-react'
import { type WorkoutFilters, useWorkouts } from '../api/queries'
import type { Workout } from '../api/types'
import { dayLabel, localDayKey } from '../lib/format'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { Button } from './ui/Button'
import { WorkoutCard } from './WorkoutCard'
import { WorkoutCardSkeleton, WorkoutsSkeleton, workoutGrid } from './skeletons'
import { SkeletonGroup } from './ui/Skeleton'

interface Props {
  challengeId: number
  filters: WorkoutFilters
  showMember?: boolean
}

const NO_DATE = 'sem-data'

// Agrupa pela lista achatada: um dia partido entre páginas continua no mesmo grupo.
// A API já devolve do mais recente para o mais antigo; "Sem data" fica por último.
function groupByDay(items: Workout[]): [string, Workout[]][] {
  const groups = new Map<string, Workout[]>()
  for (const w of items) {
    const key = w.occurred_at ? localDayKey(w.occurred_at) : NO_DATE
    const list = groups.get(key)
    if (list) list.push(w)
    else groups.set(key, [w])
  }
  const undated = groups.get(NO_DATE)
  groups.delete(NO_DATE)
  const out = [...groups.entries()]
  if (undated) out.push([NO_DATE, undated])
  return out
}

export function WorkoutList({ challengeId, filters, showMember = true }: Props) {
  const q = useWorkouts(challengeId, filters)

  if (q.isPending) return <WorkoutsSkeleton showMember={showMember} />
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
    <div className="flex flex-col gap-8">
      {groupByDay(items).map(([key, group]) => (
        <section key={key} className="flex flex-col gap-4">
          {/* Separador de dia: rótulo eyebrow com um fio que corre até a borda. */}
          <div className="flex items-center gap-3">
            <h3 className="eyebrow shrink-0">{key === NO_DATE ? 'Sem data' : dayLabel(key)}</h3>
            <span aria-hidden className="h-px flex-1 bg-[var(--hairline)]" />
          </div>
          <div className={workoutGrid}>
            {group.map((w) => (
              <WorkoutCard key={w.id} workout={w} showMember={showMember} />
            ))}
          </div>
        </section>
      ))}
      {/* Próxima página chegando: cartões vazios no fim do grid em vez de só o texto. */}
      {q.isFetchingNextPage && (
        <SkeletonGroup label="Carregando mais check-ins" className={workoutGrid}>
          {Array.from({ length: 3 }, (_, i) => (
            <WorkoutCardSkeleton key={i} showMember={showMember} />
          ))}
        </SkeletonGroup>
      )}
      {q.hasNextPage && (
        <div className="flex justify-center">
          <Button icon={ChevronDown} onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}>
            {q.isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  )
}
