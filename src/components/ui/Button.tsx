import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

const VARIANTS = {
  // O gradiente cheio fica para a ação principal da tela.
  primary:
    'brand-gradient font-semibold text-white shadow-[0_6px_20px_-8px_rgba(249,133,16,0.9)] hover:brightness-[1.04] active:translate-y-px',
  secondary:
    'border border-[var(--hairline)] bg-[var(--card)] font-medium text-[var(--ink-muted)] hover:bg-[var(--tint)] hover:text-[var(--brand-ink)]',
  ghost: 'font-medium text-[var(--ink-muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)]',
}

const SIZES = {
  sm: 'h-8 gap-1.5 px-3.5 text-[0.8125rem]',
  md: 'h-10 gap-2 px-5 text-sm',
  icon: 'h-9 w-9',
}

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  icon?: LucideIcon
}

export function buttonClass(variant: keyof typeof VARIANTS = 'secondary', size: keyof typeof SIZES = 'md') {
  return `inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,filter,transform] disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]}`
}

export function Button({ variant, size, icon: Icon, className = '', children, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={`${buttonClass(variant, size)} ${className}`} {...props}>
      {Icon && <Icon size={size === 'sm' ? 14 : 15} strokeWidth={1.75} />}
      {children}
    </button>
  )
}
