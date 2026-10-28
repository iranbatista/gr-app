import { Check, ChevronDown } from 'lucide-react'
import { Select as S } from 'radix-ui'
import { type ReactNode, useId } from 'react'

export interface SelectOption {
  value: string
  label: string
  /** Ícone ou avatar à esquerda do rótulo. */
  icon?: ReactNode
}

interface Props {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}

// Radix não aceita item com value "": "Todos" e afins viajam com este marcador.
const EMPTY = '__vazio__'

export function Select({ label, value, onValueChange, options, placeholder }: Props) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="eyebrow px-1">
        {label}
      </label>
      <S.Root value={value || EMPTY} onValueChange={(v) => onValueChange(v === EMPTY ? '' : v)}>
        <S.Trigger
          id={id}
          className="field flex w-full cursor-pointer items-center justify-between gap-2 text-left data-[placeholder]:text-[var(--ink-muted)] data-[state=open]:border-[var(--brand-from)]"
        >
          <span className="min-w-0 truncate">
            <S.Value placeholder={placeholder} />
          </span>
          <S.Icon className="shrink-0 text-[var(--ink-muted)]">
            <ChevronDown size={15} strokeWidth={1.75} />
          </S.Icon>
        </S.Trigger>
        <S.Portal>
          <S.Content
            position="popper"
            sideOffset={6}
            className="surface z-[60] max-h-[min(22rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] min-w-[12rem] overflow-hidden rounded-2xl p-1.5 data-[state=open]:animate-[pop-in_140ms_ease-out] motion-reduce:animate-none"
          >
            <S.Viewport>
              {options.map((o) => (
                <S.Item
                  key={o.value || EMPTY}
                  value={o.value || EMPTY}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl py-2 pl-2.5 pr-8 text-sm text-[var(--ink)] outline-none data-[highlighted]:bg-[var(--wash)] data-[state=checked]:font-semibold data-[state=checked]:text-[var(--brand-ink)]"
                >
                  {o.icon}
                  <S.ItemText>{o.label}</S.ItemText>
                  <S.ItemIndicator className="absolute right-2.5 text-[var(--brand-from)]">
                    <Check size={15} strokeWidth={2} />
                  </S.ItemIndicator>
                </S.Item>
              ))}
            </S.Viewport>
          </S.Content>
        </S.Portal>
      </S.Root>
    </div>
  )
}
