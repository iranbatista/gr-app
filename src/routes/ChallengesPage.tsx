import { CalendarDays, Dumbbell, GitCompareArrows, Trophy, Users } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useChallenges } from '../api/queries'
import type { Challenge } from '../api/types'
import { Cover } from '../components/Cover'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { ChallengesSkeleton, challengeGrid } from '../components/skeletons'
import { StatusBadge } from '../components/StatusBadge'
import { buttonClass } from '../components/ui/Button'
import { SegmentedControl } from '../components/ui/SegmentedControl'
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

const grid = challengeGrid

const STATUS = [
  { id: 'ativos', label: 'Ativos', empty: 'Nenhum desafio ativo no momento' },
  { id: 'encerrados', label: 'Encerrados', empty: 'Nenhum desafio encerrado ainda' },
] as const

type StatusId = (typeof STATUS)[number]['id']

export function ChallengesPage() {
  const q = useChallenges()
  const [params, setParams] = useSearchParams()
  // Sem ?status na URL = ativos.
  const status: StatusId = params.get('status') === 'encerrados' ? 'encerrados' : 'ativos'

  function changeStatus(next: StatusId) {
    setParams((prev) => {
      const out = new URLSearchParams(prev)
      if (next === 'ativos') out.delete('status')
      else out.set('status', next)
      return out
    })
  }

  const all = q.data ?? []
  const active = all.filter((c) => isActive(c))
  const ended = all.filter((c) => !isActive(c))
  const counts = q.data ? { ativos: active.length, encerrados: ended.length } : null
  const shown = status === 'ativos' ? active : ended

  let content
  if (q.isPending) {
    content = <ChallengesSkeleton />
  } else if (q.isError) {
    content = <ErrorState error={q.error} onRetry={() => q.refetch()} />
  } else if (all.length === 0) {
    content = (
      <EmptyState eyebrow="Lista vazia" Icon={Dumbbell}>
        Nenhum desafio sincronizado ainda
      </EmptyState>
    )
  } else if (shown.length === 0) {
    content = (
      <EmptyState eyebrow={status === 'ativos' ? 'Ativos' : 'Encerrados'} Icon={Dumbbell}>
        {STATUS.find((st) => st.id === status)!.empty}
      </EmptyState>
    )
  } else {
    content = (
      <div className={grid}>
        {shown.map((c) => (
          <ChallengeCard key={c.id} c={c} />
        ))}
      </div>
    )
  }

  // Com erro a contagem seria "0 desafios": melhor não dizer nada.
  const total = q.data?.length ?? 0
  const atual = active[0]
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
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="eyebrow">GymRats</p>
          <h1 className="max-w-2xl font-heading text-[2.25rem] font-semibold leading-[1.1] tracking-tight text-[var(--ink)] sm:text-[2.5rem]">
            Desafios em <span className="brand-text">andamento</span>
          </h1>
          <p className="flex max-w-xl flex-wrap items-center gap-x-4 gap-y-1 text-[15px] leading-relaxed text-[var(--ink-muted)]">
            {legenda}
          </p>
        </div>
        {/* Comparar só faz sentido com dois desafios ou mais; o par padrão sai da própria página. */}
        {total > 1 && (
          <Link to="/comparar" className={`${buttonClass('secondary')} self-start sm:self-auto`}>
            <GitCompareArrows {...icon} />
            Comparar
          </Link>
        )}
      </header>
      <div className="flex flex-col gap-6">
        {q.data && q.data.length > 0 && (
          <SegmentedControl
            label="Status dos desafios"
            value={status}
            onChange={changeStatus}
            options={STATUS.map((st) => ({ value: st.id, label: st.label, count: counts?.[st.id] }))}
          />
        )}
        {content}
      </div>
    </main>
  )
}
