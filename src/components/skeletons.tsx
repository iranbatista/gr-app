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
export function ChartsRowSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ChartCardSkeleton>
        <div className="mx-auto grid grid-cols-[2rem_repeat(5,var(--cell))] gap-[3px] [--cell:clamp(0.875rem,7vw,2.25rem)] sm:[--cell:2.25rem]">
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
        <div className="flex justify-center">
          <Bar className="h-3 w-36" />
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

export function StatsSkeleton() {
  return (
    <SkeletonGroup label="Carregando gráficos" className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-4">
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>
      <ChartsRowSkeleton />
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
