import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useChallenge } from '../api/queries'
import { Cover } from '../components/Cover'
import { ErrorState } from '../components/ErrorState'
import { Skeleton } from '../components/Skeleton'
import { StatusBadge } from '../components/StatusBadge'
import { formatPeriod } from '../lib/format'
import { isActive } from '../lib/visual'
import { RankingTab } from './RankingTab'

const TABS = [
  { id: 'ranking', label: 'Ranking' },
  { id: 'stats', label: 'Gráficos' },
  { id: 'feed', label: 'Feed' },
] as const

type TabId = (typeof TABS)[number]['id']

function currentTab(value: string | null): TabId {
  return TABS.find((t) => t.id === value)?.id ?? 'ranking'
}

export function ChallengePage() {
  const id = Number(useParams().id)
  const [params, setParams] = useSearchParams()
  const tab = currentTab(params.get('tab'))
  const q = useChallenge(id)

  if (q.isPending) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 p-4">
        <Skeleton className="h-64 w-full" />
      </main>
    )
  }
  if (q.isError) {
    return (
      <main className="mx-auto max-w-5xl p-4">
        <ErrorState error={q.error} onRetry={() => q.refetch()} notFound="Desafio não encontrado" />
      </main>
    )
  }

  const c = q.data
  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      <Link to="/" className="text-sm text-gray-500 hover:underline">
        ← Desafios
      </Link>
      <header className="overflow-hidden rounded-xl border bg-white">
        <Cover url={c.profile_picture_url} name={c.name} className="h-48 w-full" />
        <div className="space-y-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold">{c.name ?? `Desafio #${c.id}`}</h1>
            <StatusBadge active={isActive(c)} />
          </div>
          <p className="text-sm text-gray-500">
            {formatPeriod(c.start_date, c.end_date)} · {c.member_count ?? 0} membros
          </p>
          {c.description && <p className="text-gray-700">{c.description}</p>}
        </div>
      </header>

      <nav role="tablist" className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setParams({ tab: t.id })}
            className={`-mb-px border-b-2 px-4 py-2 ${
              tab === t.id ? 'border-orange-500 font-semibold' : 'border-transparent text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'ranking' && <RankingTab challengeId={id} />}
    </main>
  )
}
