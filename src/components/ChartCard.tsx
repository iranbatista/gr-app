import type { ReactNode } from 'react'

interface Props {
  title: string
  /** Resumo à direita do título, em texto discreto. */
  aside?: ReactNode
  children: ReactNode
  className?: string
}

/** Card de gráfico: título e resumo no topo, conteúdo ocupa o resto da altura. */
export function ChartCard({ title, aside, children, className = '' }: Props) {
  return (
    <section className={`surface flex min-w-0 flex-col gap-4 p-5 ${className}`}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-heading text-lg font-medium tracking-tight text-[var(--ink)]">{title}</h2>
        {aside && <p className="text-[0.8125rem] tabular-nums text-[var(--ink-muted)]">{aside}</p>}
      </header>
      {children}
    </section>
  )
}
