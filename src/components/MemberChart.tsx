import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MemberStats } from '../api/types'

export function MemberChart({ data }: { data: MemberStats[] }) {
  const rows = data.map((m) => ({ name: m.name ?? `#${m.account_id}`, workouts: m.workouts }))
  const height = Math.max(160, rows.length * 32)
  return (
    <div className="rounded-lg border bg-white p-2" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical">
          <XAxis type="number" allowDecimals={false} fontSize={12} />
          <YAxis type="category" dataKey="name" width={120} fontSize={12} />
          <Tooltip />
          <Bar dataKey="workouts" name="Check-ins" fill="#f97316" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
