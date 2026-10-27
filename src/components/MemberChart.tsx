import { useId } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MemberStats } from '../api/types'
import { cursorFill, tick, tooltipItemStyle, tooltipLabelStyle, tooltipStyle } from './chartStyle'

export function MemberChart({ data }: { data: MemberStats[] }) {
  const rows = data.map((m) => ({ name: m.name ?? `#${m.account_id}`, workouts: m.workouts }))
  const height = Math.max(160, rows.length * 34) + 40
  const gradient = `member-${useId().replace(/:/g, '')}`
  return (
    <div className="surface px-3 pb-3 pt-5" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
          <defs>
            {/* Barras horizontais: a varredura corre na horizontal. */}
            <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style={{ stopColor: 'var(--brand-from)' }} />
              <stop offset="55%" style={{ stopColor: 'var(--brand-mid)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--brand-to)' }} />
            </linearGradient>
          </defs>
          <XAxis type="number" allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" width={140} tick={tick} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={cursorFill}
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
          />
          <Bar dataKey="workouts" name="Check-ins" fill={`url(#${gradient})`} radius={[6, 6, 6, 6]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
