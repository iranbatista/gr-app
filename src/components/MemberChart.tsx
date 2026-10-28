import { useId, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MemberStats } from '../api/types'
import { paginate } from '../lib/paginate'
import { type MemberMetric, metricValue, rankMembers, shortName } from '../lib/visual'
import { SegmentedControl } from './ui/SegmentedControl'
import { ChartTooltip } from './ChartTooltip'
import { cursorFill, tick } from './chartStyle'
import { Pager } from './Pager'

const PAGE_SIZE = 10

const LABELS: Record<MemberMetric, (n: number) => string> = {
  checkins: (n) => `${n} ${n === 1 ? 'check-in' : 'check-ins'}`,
  dias: (n) => `${n} ${n === 1 ? 'dia ativo' : 'dias ativos'}`,
}

export function MemberChart({ data }: { data: MemberStats[] }) {
  const [params, setParams] = useSearchParams()
  const [page, setPage] = useState(1)
  // Enquanto a API não manda active_days, "Dias ativos" fica desligado (sem zeros falsos).
  const hasDays = data.length > 0 && data.every((m) => typeof m.active_days === 'number')
  const metric: MemberMetric = params.get('metric') === 'dias' && hasDays ? 'dias' : 'checkins'

  function changeMetric(next: MemberMetric) {
    setPage(1)
    setParams((prev) => {
      const out = new URLSearchParams(prev)
      if (next === 'dias') out.set('metric', 'dias')
      else out.delete('metric')
      return out
    })
  }

  const rows = rankMembers(data, metric).map((m) => {
    const full = m.name ?? `#${m.account_id}`
    return { full, name: shortName(full), value: metricValue(m, metric) }
  })
  const current = paginate(rows, page, PAGE_SIZE)
  // Altura fixa por página cheia: a moldura não pula ao trocar de página.
  const height = Math.min(rows.length, PAGE_SIZE) * 34 + 40
  const gradient = `member-${useId().replace(/:/g, '')}`
  return (
    <div className="surface flex flex-col gap-3 px-3 pb-4 pt-4">
      <div className="px-2">
        <SegmentedControl
          label="Métrica"
          value={metric}
          onChange={changeMetric}
          options={[
            { value: 'checkins', label: 'Check-ins' },
            {
              value: 'dias',
              label: 'Dias ativos',
              disabled: !hasDays,
              hint: hasDays ? undefined : 'Disponível após atualizar a API',
            },
          ]}
        />
      </div>
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
              // Eixo mostra o nome curto; o tooltip devolve o nome inteiro.
              content={(p) => (
                <ChartTooltip
                  {...p}
                  render={(_, v, row) => `${(row as { full: string }).full} · ${LABELS[metric](v)}`}
                />
              )}
            />
            <Bar dataKey="value" name={metric === 'dias' ? 'Dias ativos' : 'Check-ins'} fill={`url(#${gradient})`} radius={[6, 6, 6, 6]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="px-2">
        <Pager page={current} onChange={setPage} />
      </div>
    </div>
  )
}
