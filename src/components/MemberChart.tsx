import { useId, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MemberStats } from '../api/types'
import { paginate } from '../lib/paginate'
import { shortName } from '../lib/visual'
import { cursorFill, tick, tooltipItemStyle, tooltipLabelStyle, tooltipStyle } from './chartStyle'
import { Pager } from './Pager'

const PAGE_SIZE = 10

export function MemberChart({ data }: { data: MemberStats[] }) {
  const [page, setPage] = useState(1)
  const rows = data.map((m) => {
    const full = m.name ?? `#${m.account_id}`
    return { full, name: shortName(full), workouts: m.workouts }
  })
  const current = paginate(rows, page, PAGE_SIZE)
  // Altura fixa por página cheia: a moldura não pula ao trocar de página.
  const height = Math.min(rows.length, PAGE_SIZE) * 34 + 40
  const gradient = `member-${useId().replace(/:/g, '')}`
  return (
    <div className="surface flex flex-col gap-3 px-3 pb-4 pt-5">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={current.items} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
            <defs>
              {/* Barras horizontais: a varredura corre na horizontal. */}
              <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" style={{ stopColor: 'var(--brand-from)' }} />
                <stop offset="55%" style={{ stopColor: 'var(--brand-mid)' }} />
                <stop offset="100%" style={{ stopColor: 'var(--brand-to)' }} />
              </linearGradient>
            </defs>
            <XAxis type="number" allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" width={130} tick={tick} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={cursorFill}
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              // Eixo mostra o nome curto; o tooltip devolve o nome inteiro.
              labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ''}
            />
            <Bar dataKey="workouts" name="Check-ins" fill={`url(#${gradient})`} radius={[6, 6, 6, 6]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="px-2">
        <Pager page={current} onChange={setPage} />
      </div>
    </div>
  )
}
