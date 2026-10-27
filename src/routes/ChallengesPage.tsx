import { CalendarDays, Dumbbell, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useChallenges } from '../api/queries'
import type { Challenge } from '../api/types'
import { Cover } from '../components/Cover'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { StatusBadge } from '../components/StatusBadge'
import { formatPeriod } from '../lib/format'
import { icon, pageClass } from '../lib/ui'
import { isActive } from '../lib/visual'

function ChallengeCard({ c }: { c: Challenge }) {
  return (
    <Link
      to={`/c/${c.id}`}
      className="surface group flex flex-col gap-4 p-3 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[var(--wash)]"
    >
      <Cover url={c.profile_picture_url} name={c.name} className="h-40 w-full rounded-[1.25rem]" />
      <div className="flex flex-col gap-2 px-2 pb-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 break-words font-heading text-[1.0625rem] font-medium leading-snug tracking-tight text-[var(--ink)]">
            {c.name ?? `Desafio #${c.id}`}
          </h2>
          <StatusBadge active={isActive(c)} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-[var(--ink-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} strokeWidth={1.75} />
            <span>{formatPeriod(c.start_date, c.end_date)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users size={13} strokeWidth={1.75} />
            <span>{c.member_count ?? 0} membros</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

/** Cartão vazio no formato do ChallengeCard. */
function ChallengeSkeleton() {
  return (
    <div aria-hidden className="surface flex flex-col gap-4 p-3">
      <div className="h-40 w-full rounded-[1.25rem] bg-[var(--wash)]" />
      <div className="flex flex-col gap-2.5 px-2 pb-2">
        <div className="flex justify-between gap-3">
          <div className="h-4 w-36 rounded-full bg-[var(--wash)]" />
          <div className="h-5 w-14 rounded-full bg-[var(--wash)]" />
        </div>
        <div className="h-3 w-48 rounded-full bg-[var(--wash)]" />
      </div>
    </div>
  )
}

const grid = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'

export function ChallengesPage() {
  const q = useChallenges()

  let content
  if (q.isPending) {
    content = (
      <div className={`${grid} animate-pulse`}>
        {Array.from({ length: 3 }, (_, i) => (
          <ChallengeSkeleton key={i} />
        ))}
      </div>
    )
  } else if (q.isError) {
    content = <ErrorState error={q.error} onRetry={() => q.refetch()} />
  } else if (q.data.length === 0) {
    content = <EmptyState eyebrow="Lista vazia" Icon={Dumbbell}>Nenhum desafio sincronizado ainda</EmptyState>
  } else {
    content = (
      <div className={grid}>
        {q.data.map((c) => (
          <ChallengeCard key={c.id} c={c} />
        ))}
      </div>
    )
  }

  // Com erro a contagem seria "0 desafios": melhor não dizer nada.
  const total = q.data?.length ?? 0
  const atual = q.data?.find((c) => isActive(c))
  const legenda = q.isPending ? (
    'Carregando os desafios…'
  ) : q.isError ? (
    'Não foi possível carregar os desafios.'
  ) : (
    <>
      <span className="inline-flex items-center gap-1.5">
        <Trophy {...icon} />
        {total} {total === 1 ? 'desafio' : 'desafios'}
      </span>
      {atual && (
        <span className="inline-flex items-center gap-1.5">
          <Users {...icon} />
          {atual.member_count ?? 0} atletas no atual
        </span>
      )}
    </>
  )

  return (
    <main className={`${pageClass} flex flex-col gap-10`}>
      <header className="space-y-3">
        <p className="eyebrow">GymRats</p>
        <h1 className="max-w-2xl font-heading text-[2.25rem] font-semibold leading-[1.1] tracking-tight text-[var(--ink)] sm:text-[2.5rem]">
          Desafios em <span className="brand-text">andamento</span>
        </h1>
        <p className="flex max-w-xl flex-wrap items-center gap-x-4 gap-y-1 text-[15px] leading-relaxed text-[var(--ink-muted)]">
          {legenda}
        </p>
      </header>
      {content}
    </main>
  )
}
