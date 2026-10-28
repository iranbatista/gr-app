import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/** Seção do dashboard: ícone + rótulo eyebrow + fio até a borda (como os dias do feed). */
export function DashboardSection({ title, Icon, children }: { title: string; Icon: LucideIcon; children: ReactNode }) {
  const id = `sec-${title.toLowerCase().normalize('NFD').replace(/[^a-z]+/g, '-')}`
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h2 id={id} className="eyebrow flex shrink-0 items-center gap-2 text-[var(--brand-ink)]">
          <Icon size={14} strokeWidth={1.75} />
          {title}
        </h2>
        <span aria-hidden className="h-px flex-1 bg-[var(--hairline)]" />
      </div>
      {children}
    </section>
  )
}
