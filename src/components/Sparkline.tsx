import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { SparkPoint } from '../lib/dashboard'
import { formatShortDate } from '../lib/format'
import { useReducedMotion } from '../lib/motion'
import { ChartTooltip } from './ChartTooltip'

interface Props {
  data: SparkPoint[]
  /** Texto do valor no tooltip ("12 check-ins"). */
  format: (v: number) => string
  className?: string
}

/** Área mínima, sem eixos: só a tendência dos últimos dias. */
export function Sparkline({ data, format, className = '' }: Props) {
  const id = useId().replace(/:/g, '')
  const reduced = useReducedMotion()
  return (
    <div aria-hidden className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--brand-from)', stopOpacity: 0.32 }} />
              <stop offset="100%" style={{ stopColor: 'var(--brand-to)', stopOpacity: 0 }} />
            </linearGradient>
            <linearGradient id={`line-${id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style={{ stopColor: 'var(--brand-from)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--brand-to)' }} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ stroke: 'var(--hairline)' }}
            content={(p) => (
              <ChartTooltip
                {...p}
                render={(_, v, row) => `${formatShortDate((row as SparkPoint).date)} · ${format(v)}`}
              />
            )}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={`url(#line-${id})`}
            strokeWidth={2}
            fill={`url(#fill-${id})`}
            isAnimationActive={!reduced}
            activeDot={{ r: 4, fill: 'var(--brand-from)', stroke: 'var(--card)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
