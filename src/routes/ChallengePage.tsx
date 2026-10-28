import { Activity, ArrowLeft, CalendarDays, LayoutDashboard, ListOrdered, Users } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useChallenge } from '../api/queries'
import { Cover } from '../components/Cover'
import { ErrorState } from '../components/ErrorState'
import { ChallengeHeroSkeleton } from '../components/skeletons'
import { StatusBadge } from '../components/StatusBadge'
import { segmentClass } from '../components/ui/SegmentedControl'
import { formatPeriod } from '../lib/format'
import { backLinkClass, icon, pageClass } from '../lib/ui'
import { isActive } from '../lib/visual'
import { FeedTab } from './FeedTab'
import { RankingTab } from './RankingTab'
import { StatsTab } from './StatsTab'

const TABS = [
  { id: 'ranking', label: 'Ranking', Icon: ListOrdered },
  { id: 'stats', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'feed', label: 'Feed', Icon: Activity },
] as const

type TabId = (typeof TABS)[number]['id']

function currentTab(value: string | null): TabId {
  return TABS.find((t) => t.id === value)?.id ?? 'ranking'
}

export function ChallengePage() {
  const id = Number(useParams().id)
  const [params, setParams] = useSearchParams()
  const tab = currentTab(params.get('tab'))
  const valid = Number.isFinite(id)
  const q = useChallenge(id, valid)

  if (!valid) {
    return (
      <main className={pageClass}>
        <ErrorState error={new ApiError(404, 'invalid id')} notFound="Desafio não encontrado" />
      </main>
    )
  }

  if (q.isPending) {
    return (
      <main className={pageClass}>
        <ChallengeHeroSkeleton />
      </main>
    )
  }
  if (q.isError) {
    return (
      <main className={pageClass}>
        <ErrorState error={q.error} onRetry={() => q.refetch()} notFound="Desafio não encontrado" />
      </main>
    )
  }

  const c = q.data
  return (
    <main className={`${pageClass} flex flex-col gap-8`}>
      <div>
        <Link to="/" className={backLinkClass}>
          <ArrowLeft {...icon} />
          Desafios
        </Link>
      </div>
      <header className="surface flex flex-col gap-5 p-3">
        <Cover cssPx={1000} url={c.profile_picture_url} name={c.name} className="h-48 w-full rounded-[1.25rem] sm:h-56" />
        <div className="flex flex-col gap-3 px-3 pb-3">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow flex items-center gap-1.5">
              <CalendarDays size={13} strokeWidth={1.75} />
              {formatPeriod(c.start_date, c.end_date)}
            </p>
            <StatusBadge active={isActive(c)} />
          </div>
          <h1 className="break-words font-heading text-[1.875rem] font-semibold leading-[1.1] tracking-tight text-[var(--ink)] sm:text-[2.25rem]">
            {c.name ?? `Desafio #${c.id}`}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-[var(--ink-muted)]">
            <Users {...icon} />
            {c.member_count ?? 0} atletas no desafio
          </p>
          {c.description && (
            <p className="max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-[var(--ink)]/80">
              {c.description}
            </p>
          )}
        </div>
      </header>

      {/* Rola no eixo x em telas estreitas em vez de quebrar em duas linhas. */}
      <nav role="tablist" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() =>
              setParams((prev) => {
                const next = new URLSearchParams(prev)
                next.set('tab', t.id)
                return next
              })
            }
            className={`${segmentClass(tab === t.id)} px-5`}
          >
            <t.Icon {...icon} />
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'ranking' && <RankingTab key={id} challengeId={id} />}
      {tab === 'stats' && <StatsTab challengeId={id} />}
      {tab === 'feed' && <FeedTab challengeId={id} />}
    </main>
  )
}
