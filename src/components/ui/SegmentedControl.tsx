import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Tooltip } from './Tooltip'

/** Pill do grupo: ativa em --tint com aro de marca, inativa em contorno fino. */
export function segmentClass(active: boolean) {
  return `inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
    active
      ? 'border-[var(--brand-from)] bg-[var(--tint)] font-semibold text-[var(--brand-ink)]'
      : 'border-[var(--hairline)] bg-[var(--card)] text-[var(--ink-muted)] hover:bg-[var(--wash)]'
  }`
}

/** Contagem dentro da pill. */
export function SegmentCount({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span
      className={`min-w-5 rounded-full px-1.5 text-center text-xs leading-5 tabular-nums ${
        active ? 'bg-[var(--brand-from)]/15 text-[var(--brand-ink)]' : 'bg-[var(--wash)] text-[var(--ink-muted)]'
      }`}
    >
      {children}
    </span>
  )
}

export interface Segment<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
  count?: number
  disabled?: boolean
  /** Explicação em tooltip, útil quando a opção está desabilitada. */
  hint?: string
}

interface Props<T extends string> {
  label: string
  value: T
  options: readonly Segment<T>[]
  onChange: (value: T) => void
}

/** Grupo de botões com aria-pressed; rola no eixo x em telas estreitas. */
export function SegmentedControl<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {options.map((o) => {
        const active = o.value === value
        const button = (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={`${segmentClass(active)} disabled:cursor-not-allowed disabled:opacity-45`}
          >
            {o.icon && <o.icon size={15} strokeWidth={1.75} />}
            {o.label}
            {o.count !== undefined && <SegmentCount active={active}>{o.count}</SegmentCount>}
          </button>
        )
        if (!o.hint) return button
        // Botão desabilitado não recebe hover: o tooltip mora num span em volta.
        return (
          <Tooltip key={o.value} content={o.hint}>
            <span tabIndex={o.disabled ? 0 : undefined} className="inline-flex shrink-0 rounded-full">
              {button}
            </span>
          </Tooltip>
        )
      })}
    </div>
  )
}
