import { Dumbbell, Sparkles } from 'lucide-react'
import { ApiError } from '../api/client'
import { useChallenge, useInsights, useStats } from '../api/queries'
import { ChallengeProgress } from '../components/ChallengeProgress'
import { DashboardSection } from '../components/DashboardSection'
import { DayHeatmap } from '../components/DayHeatmap'
import { DurationChart } from '../components/DurationChart'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { AwardsGrid, EmojiCloud, StreakList, TopCheckins } from '../components/Highlights'
import { KpiCards } from '../components/KpiCards'
import { MemberChart } from '../components/MemberChart'
import { PeriodBars } from '../components/PeriodBars'
import { PunchCard } from '../components/PunchCard'
import { DashboardSkeleton, HighlightsSkeleton, KpiRowSkeleton, WhenSkeleton } from '../components/skeletons'
import { StatTile } from '../components/StatTile'
import { WeeklyChart } from '../components/WeeklyChart'
import { WorkoutDetailDialog } from '../components/WorkoutDetail'
import { referenceDay } from '../lib/dashboard'

// Antes do deploy da API nova o /insights cai no 404 genérico do FastAPI.
function notDeployed(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404
}

function UpdateNotice() {
  return (
    <div className="surface flex items-center gap-4 p-5 sm:p-6">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--tint)] text-[var(--brand-ink)]">
        <Sparkles size={18} strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="font-heading text-base font-medium tracking-tight text-[var(--ink)]">
          Mais análises disponíveis após atualizar a API
        </p>
        <p className="text-sm text-[var(--ink-muted)]">Horários, prêmios e sequências aparecem aqui assim que ela estiver no ar.</p>
      </div>
    </div>
  )
}

export function StatsTab({ challengeId }: { challengeId: number }) {
  const q = useStats(challengeId)
  const ins = useInsights(challengeId)
  // Já está no cache: a página do desafio carregou antes da aba.
  const challenge = useChallenge(challengeId).data

  if (q.isPending) return <DashboardSkeleton />
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const s = q.data
  const progress = challenge && <ChallengeProgress challenge={challenge} />
  if (s.total_workouts === 0) {
    return (
      <div className="flex flex-col gap-5">
        {progress}
        <EmptyState eyebrow="Dashboard" Icon={Dumbbell}>
          Nenhum check-in ainda
        </EmptyState>
      </div>
    )
  }

  const ref = referenceDay(challenge?.end_date)
  const fallbackTiles = (
    <div className="grid grid-cols-2 gap-4">
      <StatTile label="Check-ins" value={s.total_workouts} />
      <StatTile label="Membros ativos" value={s.members} />
    </div>
  )

  return (
    <div className="flex flex-col gap-14">
      <DashboardSection title="Visão geral">
        {progress}
        {ins.isPending ? (
          <KpiRowSkeleton label="Carregando indicadores" />
        ) : ins.isError ? (
          fallbackTiles
        ) : (
          <KpiCards insights={ins.data} refDay={ref.day} isToday={ref.isToday} />
        )}
        {/* Dia e semana lado a lado no desktop, empilhados no celular. */}
        <div className="grid gap-5 lg:grid-cols-2">
          <DayHeatmap data={s.by_day} />
          <WeeklyChart data={s.by_day} />
        </div>
        <MemberChart data={s.by_member} />
      </DashboardSection>

      {ins.isPending ? (
        <>
          <WhenSkeleton />
          <HighlightsSkeleton />
        </>
      ) : ins.isError ? (
        notDeployed(ins.error) ? (
          <UpdateNotice />
        ) : (
          <ErrorState error={ins.error} onRetry={() => ins.refetch()} />
        )
      ) : (
        <>
          <DashboardSection title="Quando o grupo treina">
            <PunchCard grid={ins.data.punchcard} />
            <div className="grid gap-5 lg:grid-cols-2">
              <PeriodBars periods={ins.data.periods} />
              <DurationChart data={ins.data.duration_by_weekday} />
            </div>
          </DashboardSection>

          <DashboardSection title="Destaques">
            <AwardsGrid insights={ins.data} challengeId={challengeId} />
            {/* Com só um dos dois, ele ocupa a linha inteira. */}
            <div
              className={`grid gap-5 ${ins.data.streaks.length > 0 && ins.data.emojis.length > 0 ? 'lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]' : ''}`}
            >
              <StreakList streaks={ins.data.streaks} challengeId={challengeId} />
              <EmojiCloud emojis={ins.data.emojis} />
            </div>
            <TopCheckins items={ins.data.top_workouts} />
          </DashboardSection>
        </>
      )}
      {/* Check-ins em destaque abrem o mesmo modal do feed (busca o check-in sozinho). */}
      <WorkoutDetailDialog items={[]} ready challengeId={challengeId} />
    </div>
  )
}
