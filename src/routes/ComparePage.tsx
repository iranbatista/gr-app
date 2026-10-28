import { ArrowLeft, Clock, GitCompareArrows, Scale, TrendingUp, Trophy, Users } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { honorsUntil, useChallenges, useInsights, useRankings, useStats } from '../api/queries'
import type { Challenge } from '../api/types'
import { AthletesCompare } from '../components/compare/AthletesCompare'
import { AwardsCompare } from '../components/compare/AwardsCompare'
import { CompareControls } from '../components/compare/CompareControls'
import { PaceCharts } from '../components/compare/PaceCharts'
import { Scoreboard } from '../components/compare/Scoreboard'
import { NamesProvider, type Side } from '../components/compare/shared'
import {
  AthletesSkeleton,
  AwardsCompareSkeleton,
  ComparePageSkeleton,
  PaceSkeleton,
  ScoreboardSkeleton,
  WhenCompareSkeleton,
} from '../components/compare/skeletons'
import { WhenCompare } from '../components/compare/WhenCompare'
import { DashboardSection } from '../components/DashboardSection'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import {
  type CompareMode,
  type Span,
  alignment,
  challengeSpan,
  compareAthletes,
  cutoffDate,
  daysFor,
  defaultPair,
  kpiSide,
  paceSeries,
  previousOf,
  shortLabels,
} from '../lib/compare'
import { addDays } from '../lib/dashboard'
import { formatShortDate } from '../lib/format'
import { backLinkClass, icon, pageClass } from '../lib/ui'

const parseId = (v: string | null) => (v && /^\d+$/.test(v) ? Number(v) : null)

function BackLink() {
  return (
    <div>
      <Link to="/" className={backLinkClass}>
        <ArrowLeft {...icon} />
        Desafios
      </Link>
    </div>
  )
}

/** Período comparado de um lado: "03/10 – 27/10". */
function rangeText(s: Span, days: number) {
  if (!s.start || days < 1) return '—'
  return `${formatShortDate(s.start)} – ${formatShortDate(addDays(s.start, days - 1))}`
}

export function ComparePage() {
  const list = useChallenges()
  const [params, setParams] = useSearchParams()

  let body
  if (list.isPending) body = <ComparePageSkeleton />
  else if (list.isError) body = <ErrorState error={list.error} onRetry={() => list.refetch()} />
  else if (list.data.length < 2) {
    body = (
      <EmptyState eyebrow="Comparar" Icon={GitCompareArrows}>
        É preciso ter pelo menos dois desafios
      </EmptyState>
    )
  } else {
    const all = list.data
    // Sem params: par padrão; só um deles: o outro vem do anterior por data.
    const pair = defaultPair(all)!
    const a = parseId(params.get('a')) ?? (params.has('a') ? NaN : pair[0])
    const b = parseId(params.get('b')) ?? (params.has('b') ? NaN : (previousOf(all, a)?.id ?? pair[1]))
    const ca = all.find((c) => c.id === a)
    const cb = all.find((c) => c.id === b)
    if (!ca || !cb) {
      body = <ErrorState error={new ApiError(404, 'desafio')} notFound="Desafio não encontrado" />
    } else {
      const modo = params.get('modo')
      body = (
        <Comparison
          challenges={all}
          a={ca}
          b={cb}
          requested={modo === 'dia' || modo === 'total' ? modo : null}
          update={(next) =>
            setParams(
              (prev) => {
                const out = new URLSearchParams(prev)
                for (const [k, v] of Object.entries({ a: String(a), b: String(b), ...next })) out.set(k, v)
                return out
              },
              { replace: !next.a && !next.b && !next.modo },
            )
          }
        />
      )
    }
  }

  return (
    <main className={`${pageClass} flex flex-col gap-8`}>
      <BackLink />
      {body}
    </main>
  )
}

interface ComparisonProps {
  challenges: Challenge[]
  a: Challenge
  b: Challenge
  requested: CompareMode | null
  update: (next: Partial<Record<'a' | 'b' | 'modo', string>>) => void
}

function Comparison({ challenges, a, b, requested, update }: ComparisonProps) {
  const same = a.id === b.id
  const spanA = challengeSpan(a)
  const spanB = challengeSpan(b)
  const al = alignment(spanA, spanB)
  // API antiga ignora `until` e não ecoa o corte: o modo dia sai de cena.
  const [noUntil, setNoUntil] = useState(false)
  const mode: CompareMode = (requested ?? al.defaultMode) === 'dia' && al.n != null && !noUntil ? 'dia' : 'total'
  const untilA = mode === 'dia' ? cutoffDate(spanA.start!, al.n!) : undefined
  const untilB = mode === 'dia' ? cutoffDate(spanB.start!, al.n!) : undefined
  const daysA = daysFor(spanA, mode, al.n)
  const daysB = daysFor(spanB, mode, al.n)

  const insA = useInsights(a.id, untilA, !same)
  const insB = useInsights(b.id, untilB, !same)
  const statsA = useStats(a.id, untilA, !same)
  const statsB = useStats(b.id, untilB, !same)
  const rankA = useRankings(a.id, !same)
  const rankB = useRankings(b.id, !same)

  const echo = [
    honorsUntil(insA.data, untilA),
    honorsUntil(insB.data, untilB),
    honorsUntil(statsA.data, untilA),
    honorsUntil(statsB.data, untilB),
  ]
  const ignored = echo.includes(false)
  // Ajuste durante o render (padrão do React para estado derivado): fica ligado de vez.
  if (ignored && !noUntil) setNoUntil(true)
  // No modo dia, resposta sem o corte não vale: espera o refetch sem `until`.
  const stale = mode === 'dia' && ignored

  // URL sempre com o par explícito: o link pode ser compartilhado como está.
  const { id: ia } = a
  const { id: ib } = b
  const { search } = useLocation()
  useEffect(() => {
    const p = new URLSearchParams(search)
    if (p.get('a') !== String(ia) || p.get('b') !== String(ib)) update({})
  }, [ia, ib, search, update])

  const [na, nb] = shortLabels(a.name, b.name)
  const names = { a: na || `#${a.id}`, b: nb || `#${b.id}`, ids: { a: a.id, b: b.id } }

  const pick = (side: Side, id: number) => update({ [side]: String(id) })
  const swap = () => update({ a: String(b.id), b: String(a.id) })

  const insights = insA.data && insB.data && !stale ? { a: insA.data, b: insB.data } : null
  const insError = insA.error ?? insB.error
  const retryIns = () => {
    void insA.refetch()
    void insB.refetch()
  }
  const insSection = (pending: ReactNode, ready: (x: NonNullable<typeof insights>) => ReactNode) =>
    insError ? <ErrorState error={insError} onRetry={retryIns} /> : insights ? ready(insights) : pending

  const athletesReady = statsA.data && statsB.data && rankA.data && rankB.data && !stale
  const athletesError = statsA.error ?? statsB.error ?? rankA.error ?? rankB.error

  return (
    <NamesProvider value={names}>
      <header className="flex flex-col gap-3">
        <p className="eyebrow flex items-center gap-1.5">
          <GitCompareArrows size={13} strokeWidth={1.75} />
          Comparar
        </p>
        <h1 className="break-words font-heading text-[2rem] font-semibold leading-[1.1] tracking-tight text-[var(--ink)] sm:text-[2.5rem]">
          <span className="brand-text">{names.a}</span> <span className="font-normal text-[var(--ink-muted)]">×</span> {names.b}
        </h1>
        {!same && (
          <p className="text-[15px] leading-relaxed text-[var(--ink-muted)]">
            {mode === 'dia' ? `Até o dia ${al.n} de cada desafio` : 'Desafios inteiros'}
            <span aria-hidden className="mx-2">·</span>
            <span className="tabular-nums">
              {rangeText(spanA, daysA)} e {rangeText(spanB, daysB)}
            </span>
          </p>
        )}
      </header>

      <CompareControls
        challenges={challenges}
        a={a.id}
        b={b.id}
        onPick={pick}
        onSwap={swap}
        mode={mode}
        onMode={(m) => update({ modo: m })}
        n={al.n}
        noUntil={noUntil}
      />

      {same ? (
        <EmptyState eyebrow="Mesmo desafio" Icon={GitCompareArrows}>
          Escolha dois desafios diferentes
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-14">
          <DashboardSection title="Placar" Icon={Scale}>
            {insSection(<ScoreboardSkeleton />, (x) => (
              <Scoreboard a={kpiSide(x.a, spanA.start, daysA)} b={kpiSide(x.b, spanB.start, daysB)} />
            ))}
          </DashboardSection>

          <DashboardSection title="Ritmo" Icon={TrendingUp}>
            {insSection(<PaceSkeleton />, (x) => (
              <PaceCharts
                rows={paceSeries({ ins: x.a, start: spanA.start, days: daysA }, { ins: x.b, start: spanB.start, days: daysB })}
              />
            ))}
          </DashboardSection>

          <DashboardSection title="Quando o grupo treina" Icon={Clock}>
            {insSection(<WhenCompareSkeleton />, (x) => <WhenCompare a={x.a} b={x.b} />)}
          </DashboardSection>

          <DashboardSection title="Destaques" Icon={Trophy}>
            {insSection(<AwardsCompareSkeleton />, (x) => <AwardsCompare a={x.a} b={x.b} />)}
          </DashboardSection>

          <DashboardSection title="Atletas" Icon={Users}>
            {athletesError ? (
              <ErrorState
                error={athletesError}
                onRetry={() => [statsA, statsB, rankA, rankB].forEach((q) => void q.refetch())}
              />
            ) : athletesReady ? (
              <AthletesCompare
                key={`${a.id}-${b.id}-${mode}`}
                data={compareAthletes(
                  { stats: statsA.data!, rankings: rankA.data! },
                  { stats: statsB.data!, rankings: rankB.data! },
                  mode,
                )}
              />
            ) : (
              <AthletesSkeleton />
            )}
          </DashboardSection>
        </div>
      )}
    </NamesProvider>
  )
}
