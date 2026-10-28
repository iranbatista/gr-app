// Esqueletos espelham o layout final (mesmo grid, paddings e raios) para a
// tela não pular quando os dados chegam.
import { Bar, Block, Circle, SkeletonGroup } from './ui/Skeleton'

export const challengeGrid = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
export const workoutGrid = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'

function ChallengeCardSkeleton() {
  return (
    <div className="surface flex flex-col gap-4 p-3">
      <Block className="h-40 w-full rounded-[1.25rem]" />
      <div className="flex flex-col gap-2 px-2 pb-2">
        <div className="flex items-start justify-between gap-3">
          <Bar className="mt-1 h-4 w-40" />
          <Bar className="h-[1.375rem] w-16" />
        </div>
        <div className="flex gap-4">
          <Bar className="h-3.5 w-40" />
          <Bar className="h-3.5 w-20" />
        </div>
      </div>
    </div>
  )
}

export function ChallengesSkeleton() {
  return (
    <SkeletonGroup label="Carregando desafios" className="flex flex-col gap-6">
      <div className="flex gap-2 pb-1">
        <Bar className="h-[2.375rem] w-28" />
        <Bar className="h-[2.375rem] w-36" />
      </div>
      <div className={challengeGrid}>
        {Array.from({ length: 3 }, (_, i) => (
          <ChallengeCardSkeleton key={i} />
        ))}
      </div>
    </SkeletonGroup>
  )
}

export function ChallengeHeroSkeleton() {
  return (
    <SkeletonGroup label="Carregando desafio" className="flex flex-col gap-8">
      <Bar className="h-8 w-[6.5rem]" />
      <div className="surface flex flex-col gap-5 p-3">
        <Block className="h-48 w-full rounded-[1.25rem] sm:h-56" />
        <div className="flex flex-col gap-3 px-3 pb-3">
          <div className="flex items-center justify-between gap-3">
            <Bar className="h-3 w-44" />
            <Bar className="h-[1.375rem] w-16" />
          </div>
          <Bar className="h-8 w-72 max-w-full sm:h-9" />
          <Bar className="h-4 w-40" />
        </div>
      </div>
      <div className="flex gap-2 pb-1">
        <Bar className="h-[2.375rem] w-[7.25rem]" />
        <Bar className="h-[2.375rem] w-[7.5rem]" />
        <Bar className="h-[2.375rem] w-24" />
      </div>
    </SkeletonGroup>
  )
}

export function RankingSkeleton() {
  return (
    <SkeletonGroup label="Carregando ranking" className="flex flex-col gap-4">
      <ol className="surface divide-y divide-[var(--hairline)] overflow-hidden">
        {Array.from({ length: 10 }, (_, i) => (
          <li key={i} className="flex items-center gap-4 px-5 py-3.5">
            <div className="flex w-14 shrink-0 justify-end">
              <Bar className={i < 3 ? 'h-6 w-10' : 'h-5 w-7'} />
            </div>
            <Circle className={i < 3 ? 'h-12 w-12' : 'h-10 w-10'} />
            <Bar className="h-4 w-40 max-w-[50%]" />
            <span className="flex-1" />
            <Bar className="h-6 w-14" />
          </li>
        ))}
      </ol>
      <div className="flex items-center justify-end gap-3">
        <Bar className="h-3.5 w-20" />
        <Circle className="h-9 w-9" />
        <Circle className="h-9 w-9" />
      </div>
    </SkeletonGroup>
  )
}

function StatTileSkeleton() {
  return (
    <div className="surface flex flex-col gap-2 p-5">
      {/* Altura da linha do eyebrow, não só do texto. */}
      <div className="flex h-4 items-center">
        <Bar className="h-3 w-20" />
      </div>
      <Bar className="h-7 w-16" />
    </div>
  )
}

function ChartCardSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="surface flex flex-col gap-4 p-5">
      <div className="flex items-baseline justify-between gap-4">
        <Bar className="h-5 w-40" />
        <Bar className="hidden h-3.5 w-48 sm:block" />
      </div>
      {children}
    </div>
  )
}

/** Heatmap e barras semanais lado a lado, como no layout final. */
export function ChartsRowSkeleton({ className = 'lg:grid-cols-2' }: { className?: string }) {
  return (
    <div className={`grid gap-5 ${className}`}>
      <ChartCardSkeleton>
        {/* Mesma célula do HeatGrid (--cell). */}
        <div className="mx-auto grid grid-cols-[2rem_repeat(5,var(--cell))] gap-[3px] [--cell:2.125rem]">
          <span className="col-span-6 h-[0.9375rem]" />
          {Array.from({ length: 7 }, (_, r) => (
            <div key={r} className="contents">
              <Bar className="my-auto h-2.5 w-6" />
              {Array.from({ length: 5 }, (_, c) => (
                <div key={c} aria-hidden className="aspect-square rounded-[3px] bg-[var(--wash)]" />
              ))}
            </div>
          ))}
        </div>
        <div className="mx-auto flex w-[calc(2rem+5*var(--cell)+15px)] justify-end [--cell:2.125rem]">
          <Bar className="h-3 w-28" />
        </div>
      </ChartCardSkeleton>
      <ChartCardSkeleton>
        <div className="flex min-h-56 flex-1 items-end gap-4 px-6 pb-6">
          {[30, 90, 85, 80, 25].map((h, i) => (
            <Block key={i} className="flex-1 rounded-[6px]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </ChartCardSkeleton>
    </div>
  )
}

function MemberChartSkeleton() {
  return (
    <ChartCardSkeleton>
      <div className="flex gap-2">
        <Bar className="h-[2.375rem] w-28" />
        <Bar className="h-[2.375rem] w-32" />
      </div>
      <div className="flex h-[380px] flex-col justify-around pb-10">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bar className="h-3 w-24 shrink-0" />
            <Bar className="h-[18px]" style={{ width: `${85 - i * 6}%` }} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        <Bar className="h-3.5 w-20" />
        <Circle className="h-9 w-9" />
        <Circle className="h-9 w-9" />
      </div>
    </ChartCardSkeleton>
  )
}

/** Rótulo de seção do dashboard: eyebrow + fio. */
function SectionHeadSkeleton() {
  return (
    <div className="flex h-4 items-center gap-3">
      <Circle className="h-3.5 w-3.5" />
      <Bar className="-ml-1 h-3 w-28" />
      <span aria-hidden className="h-px flex-1 bg-[var(--hairline)]" />
    </div>
  )
}

function ProgressSkeleton() {
  return (
    <div className="surface flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-4">
        <Bar className="h-3 w-24" />
        <Bar className="h-4 w-56 max-w-[60%]" />
      </div>
      <Bar className="h-2.5 w-full" />
      <div className="flex justify-between">
        <Bar className="h-3 w-10" />
        <Bar className="h-3 w-10" />
      </div>
    </div>
  )
}

export function KpiRowSkeleton({ label }: { label?: string }) {
  const body = (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="surface flex flex-col overflow-hidden">
          <div className="flex flex-col gap-2 p-4 pb-1 sm:p-5 sm:pb-1">
            <div className="flex h-4 items-center">
              <Bar className="h-3 w-24" />
            </div>
            <Bar className="h-7 w-16 sm:h-8" />
            <Bar className="h-3 w-28 max-w-full" />
          </div>
          <div aria-hidden className="mt-auto h-14 bg-gradient-to-t from-[var(--wash)] to-transparent" />
        </div>
      ))}
    </div>
  )
  return label ? <SkeletonGroup label={label}>{body}</SkeletonGroup> : body
}

/** Punch card cheio e, embaixo, períodos e duração lado a lado. */
export function WhenSkeleton() {
  return (
    <SkeletonGroup label="Carregando horários" className="flex flex-col gap-5">
      <SectionHeadSkeleton />
      <ChartCardSkeleton>
        <div className="mx-auto max-w-full overflow-hidden [--cell:2.125rem]">
          <div className="grid w-max gap-[3px]" style={{ gridTemplateColumns: '2rem repeat(24, var(--cell))' }}>
            <span className="col-span-full h-[0.9375rem]" />
            {Array.from({ length: 7 }, (_, r) => (
              <div key={r} className="contents">
                <Bar className="my-auto h-2.5 w-6" />
                {Array.from({ length: 24 }, (_, c) => (
                  <div key={c} aria-hidden className="aspect-square rounded-[3px] bg-[var(--wash)]" />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Bar className="h-3 w-36" />
        </div>
      </ChartCardSkeleton>
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCardSkeleton>
          <div className="flex min-h-56 flex-col justify-center gap-5">
            {[60, 90, 70, 100].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <Circle className="h-9 w-9" />
                <div className="flex flex-1 flex-col gap-2">
                  <Bar className="h-3.5 w-28" />
                  <Bar className="h-2" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCardSkeleton>
        <ChartCardSkeleton>
          <div className="flex min-h-56 flex-1 items-end gap-4 px-6 pb-6">
            {[55, 70, 85, 60, 40, 75, 50].map((h, i) => (
              <Block key={i} className="flex-1 rounded-[6px]" style={{ height: `${h}%` }} />
            ))}
          </div>
        </ChartCardSkeleton>
      </div>
    </SkeletonGroup>
  )
}

function AwardSkeleton() {
  return (
    <div className="surface flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Circle className="h-9 w-9" />
        <Bar className="h-3 w-24" />
      </div>
      <div className="flex flex-col gap-2">
        <Bar className="h-8 w-12" />
        <Bar className="h-3 w-28" />
      </div>
      <div className="flex items-center gap-2">
        <Circle className="h-9 w-9" />
        <Bar className="h-3.5 w-20" />
      </div>
    </div>
  )
}

/** Card de sequências ao lado do gráfico por membro: cabeçalho de colunas + 5 linhas. */
export function StreaksSkeleton() {
  return (
    <SkeletonGroup label="Carregando sequências" className="flex">
      <div className="surface flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-baseline justify-between gap-4">
          <Bar className="h-5 w-28" />
          <Bar className="hidden h-3.5 w-52 sm:block" />
        </div>
        <div className="flex justify-between border-b border-[var(--hairline)] pb-2">
          <Bar className="h-3 w-14" />
          <Bar className="h-3 w-32" />
        </div>
        <div className="flex flex-1 flex-col">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex min-h-14 flex-1 items-center gap-3">
              <Bar className="h-3 w-3" />
              <Circle className="h-7 w-7" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Bar className="h-3.5 w-24" />
                <Bar className="h-1.5" style={{ width: `${90 - i * 12}%` }} />
              </div>
              <Bar className="h-4 w-14" />
              <Bar className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonGroup>
  )
}

/** Nove prêmios iguais, os três check-ins em destaque e a faixa de emojis. */
export function HighlightsSkeleton() {
  return (
    <SkeletonGroup label="Carregando destaques" className="flex flex-col gap-5">
      <SectionHeadSkeleton />
      <div className="grid auto-rows-fr grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 9 }, (_, i) => (
          <AwardSkeleton key={i} />
        ))}
      </div>
      <ChartCardSkeleton>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Block key={i} className={`aspect-[4/3] rounded-[1.25rem] ${i === 0 ? 'col-span-2 sm:col-span-1' : ''}`} />
          ))}
        </div>
      </ChartCardSkeleton>
      <ChartCardSkeleton>
        <div className="flex flex-wrap gap-2.5">
          {[22, 19, 19, 18, 18, 17, 17, 16].map((w, i) => (
            <Bar key={i} className="h-10" style={{ width: `${w * 0.25}rem` }} />
          ))}
        </div>
      </ChartCardSkeleton>
    </SkeletonGroup>
  )
}

/** Aba inteira enquanto /stats carrega: visão geral, ritmo e atletas. */
export function DashboardSkeleton() {
  return (
    <SkeletonGroup label="Carregando dashboard" className="flex flex-col gap-14">
      <div className="flex flex-col gap-5">
        <SectionHeadSkeleton />
        <ProgressSkeleton />
        <KpiRowSkeleton />
      </div>
      <div className="flex flex-col gap-5">
        <SectionHeadSkeleton />
        <ChartsRowSkeleton className="lg:grid-cols-[minmax(0,auto)_minmax(24rem,1fr)]" />
      </div>
      <div className="flex flex-col gap-5">
        <SectionHeadSkeleton />
        <div className="grid gap-5 lg:grid-cols-2">
          <MemberChartSkeleton />
          <div className="surface hidden lg:block" />
        </div>
      </div>
    </SkeletonGroup>
  )
}

export function WorkoutCardSkeleton({ showMember = true }: { showMember?: boolean }) {
  return (
    <div aria-hidden className="surface flex flex-col gap-3 rounded-[1.375rem] p-2.5">
      <Block className="aspect-[4/3] w-full" />
      <div className="flex flex-col gap-2 px-1.5 pb-1.5">
        {showMember && (
          <div className="flex items-center gap-2">
            <Circle className="h-6 w-6" />
            <Bar className="h-3 w-24" />
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <Bar className="h-3.5 w-36" />
          <Bar className="h-2.5 w-14" />
        </div>
        <div className="flex gap-1">
          <Bar className="h-[1.125rem] w-12" />
          <Bar className="h-[1.125rem] w-14" />
        </div>
      </div>
    </div>
  )
}

export function WorkoutsSkeleton({ showMember = true }: { showMember?: boolean }) {
  return (
    <SkeletonGroup label="Carregando check-ins" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Bar className="h-3 w-12" />
        <span aria-hidden className="h-px flex-1 bg-[var(--hairline)]" />
      </div>
      <div className={workoutGrid}>
        {Array.from({ length: 6 }, (_, i) => (
          <WorkoutCardSkeleton key={i} showMember={showMember} />
        ))}
      </div>
    </SkeletonGroup>
  )
}

export function MemberSkeleton() {
  return (
    <SkeletonGroup label="Carregando atleta" className="flex flex-col gap-10">
      <div className="surface flex flex-col items-center gap-5 p-6 sm:flex-row sm:p-8">
        <Circle className="h-[6.5rem] w-[6.5rem]" />
        <div className="flex flex-col items-center gap-2.5 sm:items-start">
          <Bar className="h-3 w-14" />
          <Bar className="h-8 w-56 sm:h-9" />
          <Bar className="h-7 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <StatTileSkeleton key={i} />
        ))}
      </div>
      <ChartsRowSkeleton />
      <div className="flex flex-col gap-4">
        <Bar className="h-5 w-24" />
        <WorkoutsSkeleton showMember={false} />
      </div>
    </SkeletonGroup>
  )
}
