import type { ReactNode } from 'react'

/** Seção do dashboard: rótulo eyebrow com fio até a borda (como os dias do feed). */
export function DashboardSection({ title, children }: { title: string; children: ReactNode }) {
  const id = `sec-${title.toLowerCase().normalize('NFD').replace(/[^a-z]+/g, '-')}`
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h2 id={id} className="eyebrow shrink-0">
          {title}
        </h2>
        <span aria-hidden className="h-px flex-1 bg-[var(--hairline)]" />
      </div>
      {children}
    </section>
  )
}
