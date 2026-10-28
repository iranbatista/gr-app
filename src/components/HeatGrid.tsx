import type { HeatLevel } from '../lib/heatmap'
import { Tooltip } from './ui/Tooltip'

/** Linhas de todo heatmap: semana começando na segunda. */
const HEAT_ROWS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export interface HeatGridCell {
  count: number
  level: HeatLevel
  /** Texto do tooltip e do aria-label ("Ter, 20/10 · 2 check-ins"). */
  label: string
  /** Dia de hoje / hora de agora: anel de tinta em volta. */
  highlight?: boolean
}

interface Props {
  /** Uma entrada por coluna, cada uma com 7 linhas (Seg..Dom); null = fora do intervalo. */
  columns: (HeatGridCell | null)[][]
  /** Rótulos sobre as colunas (mês da semana, hora do dia). */
  headers: { column: number; label: string }[]
  /** O que o destaque marca: hoje (calendário) ou a hora de agora (punch card). */
  current?: 'date' | 'time'
}

const axisLabel = 'text-[11px] leading-none text-[var(--ink-muted)]'

export function HeatSquare({ level, className = '' }: { level: HeatLevel; className?: string }) {
  return (
    <span
      className={`block aspect-square w-full rounded-[3px] ${level === 0 ? 'border border-[var(--hairline)]' : ''} ${className}`}
      style={{ background: `var(--heat-${level})` }}
    />
  )
}

/** Legenda "Menos ▢▢▢▢▢ Mais", embaixo à direita da grade. */
export function HeatLegend() {
  return (
    <div aria-hidden className={`flex items-center justify-end gap-[3px] ${axisLabel}`}>
      <span className="mr-1.5">Menos</span>
      {([0, 1, 2, 3, 4] as const).map((l) => (
        <span key={l} className="w-3">
          <HeatSquare level={l} />
        </span>
      ))}
      <span className="ml-1.5">Mais</span>
    </div>
  )
}

/**
 * Grade de calor comum ao calendário (semanas × dias) e ao punch card
 * (horas × dias): mesma célula (--cell), gutter, rótulos, anel e legenda.
 * --cell cabe as 24 horas na largura do desktop; com colunas demais a grade
 * rola dentro do card e a legenda fica visível na borda direita.
 */
export function HeatGrid({ columns, headers, current = 'date' }: Props) {
  return (
    <div className="mx-auto flex w-max max-w-full flex-col gap-3 [--cell:2.125rem]">
      {/* Padding compensado: o anel fica fora da célula e seria cortado pelo overflow. */}
      <div className="-m-1 overflow-x-auto p-1 pb-2">
        <div
          className="grid w-max gap-[3px]"
          style={{ gridTemplateColumns: `2rem repeat(${columns.length}, var(--cell))` }}
        >
          {headers.map((h) => (
            <span
              key={h.column}
              aria-hidden
              className={`whitespace-nowrap pb-1 font-medium ${axisLabel}`}
              style={{ gridColumn: h.column + 2, gridRow: 1 }}
            >
              {h.label}
            </span>
          ))}
          {HEAT_ROWS.map((d, row) => (
            <span
              key={d}
              aria-hidden
              className={`flex items-center ${axisLabel}`}
              style={{ gridColumn: 1, gridRow: row + 2 }}
            >
              {d}
            </span>
          ))}
          {columns.map((col, c) =>
            col.map((cell, row) =>
              cell ? (
                <Tooltip key={`${c}-${row}`} content={cell.label}>
                  <span
                    role="img"
                    aria-label={cell.label}
                    aria-current={cell.highlight ? current : undefined}
                    style={{ gridColumn: c + 2, gridRow: row + 2 }}
                  >
                    <HeatSquare
                      level={cell.level}
                      className={
                        cell.highlight ? 'ring-2 ring-[var(--ink)] ring-offset-1 ring-offset-[var(--card)]' : ''
                      }
                    />
                  </span>
                </Tooltip>
              ) : null,
            ),
          )}
        </div>
      </div>
      <HeatLegend />
    </div>
  )
}
