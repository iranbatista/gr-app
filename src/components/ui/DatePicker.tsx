import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Popover } from 'radix-ui'
import { useId, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import { Button } from './Button'

interface Props {
  label: string
  /** "YYYY-MM-DD" ou "" sem data. */
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
}

function toDate(key: string): Date | undefined {
  if (!key) return undefined
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function display(key: string): string {
  const [y, m, d] = key.split('-')
  return `${d}/${m}/${y}`
}

// Calendário sem o CSS da lib: cada peça recebe as classes do design system.
const dayClasses = {
  root: 'relative text-sm text-[var(--ink)]',
  months: 'flex flex-col',
  month: 'flex flex-col gap-2',
  month_caption: 'flex h-9 items-center px-2',
  caption_label: 'font-heading text-[0.9375rem] font-semibold capitalize tracking-tight',
  nav: 'absolute right-0 top-0 flex gap-1',
  button_previous:
    'inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)] disabled:opacity-30',
  button_next:
    'inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)] disabled:opacity-30',
  month_grid: 'border-collapse',
  weekdays: '',
  weekday: 'h-8 w-10 text-[0.6875rem] font-medium uppercase tracking-wide text-[var(--ink-muted)]',
  week: '',
  day: 'p-0.5 text-center',
  day_button:
    'inline-flex h-9 w-9 items-center justify-center rounded-full tabular-nums transition-colors hover:bg-[var(--wash)] disabled:pointer-events-none',
  // Hoje: aro de marca; selecionado: gradiente cheio (escrito por extenso: .brand-gradient
  // é classe de componente e não funciona como variante arbitrária).
  today: '[&>button]:font-semibold [&>button]:text-[var(--brand-ink)] [&>button]:ring-1 [&>button]:ring-[var(--brand-from)]/50',
  selected:
    '[&>button]:bg-[linear-gradient(100deg,var(--brand-from),var(--brand-mid)_45%,var(--brand-to))] [&>button]:font-semibold [&>button]:!text-white [&>button]:ring-0 [&>button]:hover:brightness-[1.04]',
  outside: 'text-[var(--ink-muted)]/50',
  disabled: 'opacity-30',
}

export function DatePicker({ label, value, onChange, min, max, placeholder = 'dd/mm/aaaa' }: Props) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const selected = toDate(value)
  const disabled = [
    ...(min ? [{ before: toDate(min)! }] : []),
    ...(max ? [{ after: toDate(max)! }] : []),
  ]

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span id={id} className="eyebrow px-1">
        {label}
      </span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          aria-labelledby={id}
          className="field flex w-full cursor-pointer items-center gap-2 text-left data-[state=open]:border-[var(--brand-from)]"
        >
          <CalendarDays size={15} strokeWidth={1.75} className="shrink-0 text-[var(--ink-muted)]" />
          <span className={value ? 'tabular-nums' : 'text-[var(--ink-muted)]'}>{value ? display(value) : placeholder}</span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            collisionPadding={12}
            className="surface z-[60] flex flex-col gap-2 rounded-3xl p-3 data-[state=open]:animate-[pop-in_140ms_ease-out] motion-reduce:animate-none"
          >
            <DayPicker
              mode="single"
              locale={ptBR}
              weekStartsOn={1}
              selected={selected}
              defaultMonth={selected ?? toDate(max ?? '') ?? undefined}
              disabled={disabled}
              onSelect={(d) => {
                if (!d) return
                onChange(toKey(d))
                setOpen(false)
              }}
              classNames={dayClasses}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === 'left' ? (
                    <ChevronLeft size={16} strokeWidth={1.75} />
                  ) : (
                    <ChevronRight size={16} strokeWidth={1.75} />
                  ),
              }}
            />
            <div className="flex justify-end border-t border-[var(--hairline)] pt-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!value}
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
              >
                Limpar
              </Button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
