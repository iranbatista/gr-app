import { Equal, type LucideIcon, Percent, Rocket, TrendingDown, TrendingUp, Users } from 'lucide-react'
import type { SummaryItem } from '../../lib/compare'
import { Bar, Circle, SkeletonGroup } from '../ui/Skeleton'

// Ícone por frase; ritmo e participação mudam com a direção (verde à frente, vermelho atrás).
function iconFor(item: SummaryItem): { Icon: LucideIcon; cls: string } {
  const tone =
    item.tone === 'up'
      ? 'bg-[var(--positive-tint)] text-[var(--positive)]'
      : item.tone === 'down'
        ? 'bg-[var(--danger-tint)] text-[var(--danger)]'
        : 'bg-[var(--tint)] text-[var(--brand-ink)]'
  switch (item.id) {
    case 'pace':
      return { Icon: item.tone === 'up' ? TrendingUp : item.tone === 'down' ? TrendingDown : Equal, cls: tone }
    case 'participation':
      return { Icon: Percent, cls: tone }
    case 'roster':
      return { Icon: Users, cls: tone }
    case 'mover':
      return { Icon: Rocket, cls: 'bg-[var(--tint)] text-[var(--brand-ink)]' }
  }
}

/** Veredito em 3–4 frases, logo abaixo dos seletores. */
export function SummaryCard({ items, aside }: { items: SummaryItem[]; aside: string }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="resumo-title" className="surface flex flex-col gap-4 p-5 sm:p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="resumo-title" className="font-heading text-lg font-medium tracking-tight text-[var(--ink)]">
          Resumo
        </h2>
        <p className="text-[0.8125rem] text-[var(--ink-muted)]">{aside}</p>
      </header>
      <ul aria-label="Resumo" className="grid gap-x-8 gap-y-3.5 md:grid-cols-2">
        {items.map((item) => {
          const { Icon, cls } = iconFor(item)
          return (
            <li key={item.id} className="flex items-start gap-3 text-[0.9375rem] leading-snug text-[var(--ink)]/85">
              <span className={`mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cls}`}>
                <Icon size={14} strokeWidth={2} />
              </span>
              <span className="pt-0.5">
                {item.parts.map((p, i) =>
                  p.strong ? (
                    <strong key={i} className="font-semibold text-[var(--ink)]">
                      {p.text}
                    </strong>
                  ) : (
                    <span key={i}>{p.text}</span>
                  ),
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function SummarySkeleton() {
  return (
    <SkeletonGroup label="Carregando resumo" className="surface flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <Bar className="h-5 w-24" />
        <Bar className="h-3.5 w-28" />
      </div>
      <div className="grid gap-x-8 gap-y-3.5 md:grid-cols-2">
        {[85, 60, 70, 55].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <Circle className="h-7 w-7" />
            <Bar className="h-4" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </SkeletonGroup>
  )
}
