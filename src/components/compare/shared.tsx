import { createContext, type ReactNode, useContext } from 'react'
import { Badge } from '../ui/Badge'

// Cores fixas da comparação: A = laranja da marca, B = tinta neutra. Em todo gráfico e badge.
export const COLOR = { a: 'var(--brand-from)', b: 'var(--ink-muted)' } as const

export type Side = 'a' | 'b'

export interface CompareNames {
  /** Nomes curtos ("Outubro") para legenda, tooltips e cabeçalhos. */
  a: string
  b: string
  ids: { a: number; b: number }
}

const NamesContext = createContext<CompareNames>({ a: 'A', b: 'B', ids: { a: 0, b: 0 } })
export const NamesProvider = NamesContext.Provider
export const useNames = () => useContext(NamesContext)

/** Bolinha de identidade do lado. */
export function SideDot({ side, className = '' }: { side: Side; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: COLOR[side] }}
    />
  )
}

/** Chip de legenda: bolinha + nome curto. */
export function LegendChip({ side, children }: { side: Side; children: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--card)] px-3 py-1 text-xs font-medium text-[var(--ink)]">
      <SideDot side={side} />
      <span className="truncate">{children}</span>
    </span>
  )
}

export function Legend() {
  const n = useNames()
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Legenda">
      <LegendChip side="a">{n.a}</LegendChip>
      <LegendChip side="b">{n.b}</LegendChip>
    </div>
  )
}

/** Variação de A sobre B: verde subindo, neutra caindo (como os KPIs do dashboard). */
export function DeltaBadge({ value, text, label }: { value: number | null; text: string; label?: string }) {
  const up = value == null || value > 0.5
  return (
    <Badge tone={up ? 'positive' : 'wash'} size="xs" aria-label={label} className={up ? '' : 'border-[var(--hairline)]'}>
      {text}
    </Badge>
  )
}

interface TooltipRow {
  side: Side
  value: string | null
}

/** Balão compartilhado dos gráficos: título (dia, período) e uma linha por lado. */
export function CompareTooltipBox({ title, rows }: { title: string; rows: TooltipRow[] }) {
  const n = useNames()
  return (
    <div className="flex min-w-36 flex-col gap-1 rounded-xl border border-[var(--hairline)] bg-[var(--card)] px-3 py-2 text-xs shadow-[0_12px_32px_-16px_rgba(36,36,36,0.35)]">
      <p className="font-medium text-[var(--ink-muted)]">{title}</p>
      {rows.map((r) => (
        <p key={r.side} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-[var(--ink)]">
            <SideDot side={r.side} />
            {n[r.side]}
          </span>
          <span className="font-semibold tabular-nums text-[var(--ink)]">{r.value ?? '—'}</span>
        </p>
      ))}
    </div>
  )
}
