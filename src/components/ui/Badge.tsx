import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

const TONES = {
  // Destaque suave da marca: status ativo, pontos, posição.
  tint: 'border border-[var(--brand-from)]/35 bg-[var(--tint)] font-semibold text-[var(--brand-ink)]',
  // Neutro: métricas, status encerrado.
  wash: 'border border-transparent bg-[var(--wash)] font-medium text-[var(--ink-muted)]',
  danger: 'border border-[var(--danger-hairline)] bg-[var(--danger-tint)] font-medium text-[var(--danger)]',
}

const SIZES = {
  xs: 'gap-1 px-2 py-0.5 text-[0.6875rem]',
  sm: 'gap-1 px-3 py-0.5 text-xs',
  md: 'gap-1.5 px-3.5 py-1 text-[0.8125rem]',
}

interface Props extends ComponentProps<'span'> {
  tone?: keyof typeof TONES
  size?: keyof typeof SIZES
  icon?: LucideIcon
}

export function Badge({ tone = 'wash', size = 'sm', icon: Icon, className = '', children, ...props }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full tabular-nums ${TONES[tone]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'xs' ? 11 : 12} strokeWidth={1.75} />}
      {children}
    </span>
  )
}
