import { Clock, Dumbbell, Gauge, Sparkles, TrendingUp, Trophy, Users } from 'lucide-react'
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
import { DashboardSkeleton, HighlightsSkeleton, KpiRowSkeleton, StreaksSkeleton, WhenSkeleton } from '../components/skeletons'
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
  const streaks = ins.data?.streaks ?? []
  const showStreaks = ins.isPending || streaks.length > 0

  return (
    <div className="flex flex-col gap-14">
      <DashboardSection title="Visão geral" Icon={Gauge}>
        {progress}
        {ins.isPending ? (
          <KpiRowSkeleton label="Carregando indicadores" />
        ) : ins.isError ? (
          // Sem /insights: os totais do /stats seguram o topo.
          <div className="grid grid-cols-2 gap-4">
            <StatTile label="Check-ins" value={s.total_workouts} />
            <StatTile label="Membros ativos" value={s.members} />
          </div>
        ) : (
          <KpiCards insights={ins.data} refDay={ref.day} isToday={ref.isToday} />
        )}
      </DashboardSection>

      <DashboardSection title="Ritmo do desafio" Icon={TrendingUp}>
        {/* Heatmap do tamanho da grade; as barras semanais ficam com o resto da largura. */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,auto)_minmax(24rem,1fr)]">
          <DayHeatmap data={s.by_day} />
          <WeeklyChart data={s.by_day} />
        </div>
      </DashboardSection>

      <DashboardSection title="Atletas" Icon={Users}>
        <div className={`grid gap-5 ${showStreaks ? 'lg:grid-cols-2' : ''}`}>
          <MemberChart data={s.by_member} />
          {ins.isPending ? (
            <StreaksSkeleton />
          ) : (
            streaks.length > 0 && <StreakList streaks={streaks} challengeId={challengeId} />
          )}
        </div>
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
          <DashboardSection title="Quando o grupo treina" Icon={Clock}>
            <PunchCard grid={ins.data.punchcard} />
            <div className="grid gap-5 lg:grid-cols-2">
              <PeriodBars periods={ins.data.periods} />
              <DurationChart data={ins.data.duration_by_weekday} />
            </div>
          </DashboardSection>

          <DashboardSection title="Destaques" Icon={Trophy}>
            <AwardsGrid insights={ins.data} challengeId={challengeId} />
            <TopCheckins items={ins.data.top_workouts} />
            <EmojiCloud emojis={ins.data.emojis} />
          </DashboardSection>
        </>
      )}
      {/* Check-ins em destaque abrem o mesmo modal do feed (busca o check-in sozinho). */}
      <WorkoutDetailDialog items={[]} ready challengeId={challengeId} />
    </div>
  )
}
