import type { ReactNode } from 'react'

interface Props {
  active?: boolean
  payload?: readonly { value?: unknown; payload?: unknown }[]
  label?: unknown
  /** Monta o texto a partir do rótulo do eixo e do valor da barra. */
  render: (label: string, value: number, row: unknown) => ReactNode
}

/** Tooltip de gráfico no mesmo balão do ui/Tooltip. */
export function ChartTooltip({ active, payload, label, render }: Props) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-xl border border-[var(--hairline)] bg-[var(--card)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] shadow-[0_12px_32px_-16px_rgba(36,36,36,0.35)]">
      {render(String(label ?? ''), Number(item.value ?? 0), item.payload)}
    </div>
  )
}
