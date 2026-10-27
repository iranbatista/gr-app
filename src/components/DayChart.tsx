import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DayCount } from '../api/types'
import { formatShortDate } from '../lib/format'

export function DayChart({ data }: { data: DayCount[] }) {
  const rows = data.map((d) => ({ ...d, label: formatShortDate(d.date) }))
  return (
    <div className="h-64 rounded-lg border bg-white p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" fontSize={12} />
          <YAxis allowDecimals={false} fontSize={12} width={30} />
          <Tooltip />
          <Bar dataKey="count" name="Check-ins" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
