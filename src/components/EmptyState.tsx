import { Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  eyebrow?: string
  Icon?: LucideIcon
}

export function EmptyState({ children, eyebrow = 'Nada por aqui', Icon = Inbox }: Props) {
  return (
    <div className="surface flex flex-col items-center gap-3 px-8 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tint)] text-[var(--brand-ink)]">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <p className="eyebrow">{eyebrow}</p>
      <p className="font-heading text-lg font-medium tracking-tight text-[var(--ink)]">{children}</p>
    </div>
  )
}
