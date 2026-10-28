// Esqueletos da comparação: mesmos grids, paddings e alturas das seções finais.
import { Bar, Block, Circle, SkeletonGroup } from '../ui/Skeleton'

function CardHead() {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <Bar className="h-5 w-40" />
      <Bar className="hidden h-3.5 w-32 sm:block" />
    </div>
  )
}

export function ScoreboardSkeleton() {
  return (
    <SkeletonGroup label="Carregando placar" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="surface flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex h-4 items-center">
            <Bar className="h-3 w-24" />
          </div>
          <div className="flex items-center justify-between">
            <Bar className="h-[1.5rem] w-20 sm:h-[1.875rem]" />
            <Bar className="h-[1.125rem] w-10" />
          </div>
          <Bar className="h-3 w-28 max-w-full" />
        </div>
      ))}
    </SkeletonGroup>
  )
}

export function PaceSkeleton() {
  return (
    <SkeletonGroup label="Carregando ritmo" className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="surface flex flex-col gap-4 p-5">
          <CardHead />
          <Block className="h-60 w-full" />
        </div>
      ))}
    </SkeletonGroup>
  )
}

export function WhenCompareSkeleton() {
  return (
    <SkeletonGroup label="Carregando horários" className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="surface flex flex-col gap-4 p-5">
          <CardHead />
          <div className="flex h-56 items-end gap-3 px-6 pb-6">
            {(i === 0 ? [20, 60, 45, 80] : [55, 70, 85, 60, 40, 75, 50]).map((h, j) => (
              <Block key={j} className="flex-1 rounded-[4px]" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      ))}
    </SkeletonGroup>
  )
}

export function AwardsCompareSkeleton() {
  return (
    <SkeletonGroup label="Carregando destaques" className="surface flex flex-col gap-2 p-5">
      <CardHead />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="grid grid-cols-1 gap-2.5 border-b border-[var(--hairline)] py-3.5 last:border-b-0 sm:grid-cols-[11rem_1fr_1fr] sm:items-center sm:gap-4">
          <div className="flex items-center gap-2.5">
            <Circle className="h-8 w-8" />
            <Bar className="h-3 w-24" />
          </div>
          {Array.from({ length: 2 }, (_, j) => (
            <div key={j} className="flex items-center gap-2.5">
              <Circle className="h-10 w-10" />
              <div className="flex flex-col gap-1.5">
                <Bar className="h-3.5 w-24" />
                <Bar className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </SkeletonGroup>
  )
}

export function AthletesSkeleton() {
  return (
    <SkeletonGroup label="Carregando atletas" className="flex flex-col gap-5">
      <div className="flex gap-2">
        <Bar className="h-7 w-24" />
        <Bar className="h-7 w-20" />
        <Bar className="h-7 w-20" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="surface flex flex-col gap-4 p-5">
            <CardHead />
            {Array.from({ length: 3 }, (_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Circle className="h-10 w-10" />
                <Bar className="h-3.5 w-28" />
                <Bar className="ml-auto h-5 w-20" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Bar className="h-[2.375rem] w-32" />
        <Bar className="h-[2.375rem] w-28" />
        <Bar className="h-[2.375rem] w-28" />
      </div>
      <div className="surface flex flex-col px-5 py-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-[var(--hairline)] py-3 last:border-b-0">
            <Circle className="h-7 w-7" />
            <Bar className="h-3.5 w-32" />
            <Bar className="ml-auto h-4 w-48 max-w-[40%]" />
          </div>
        ))}
      </div>
    </SkeletonGroup>
  )
}

/** Página inteira enquanto a lista de desafios carrega. */
export function ComparePageSkeleton() {
  return (
    <SkeletonGroup label="Carregando comparação" className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Bar className="h-8 w-[6.5rem]" />
        <Bar className="mt-5 h-3 w-20" />
        <Bar className="h-10 w-72 max-w-full" />
      </div>
      <div className="surface flex flex-col gap-5 p-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <Bar className="h-10" />
          <Circle className="h-9 w-9" />
          <Bar className="h-10" />
        </div>
        <div className="flex gap-2 border-t border-[var(--hairline)] pt-4">
          <Bar className="h-[2.375rem] w-32" />
          <Bar className="h-[2.375rem] w-36" />
        </div>
      </div>
    </SkeletonGroup>
  )
}
