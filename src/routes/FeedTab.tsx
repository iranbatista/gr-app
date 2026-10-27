import { useSearchParams } from 'react-router-dom'
import { type WorkoutFilters, useRankings } from '../api/queries'
import { WorkoutList } from '../components/WorkoutList'

const inputClass = 'rounded border px-2 py-1'

export function FeedTab({ challengeId }: { challengeId: number }) {
  const [params, setParams] = useSearchParams()
  const rankings = useRankings(challengeId)

  const member = params.get('member')
  const filters: WorkoutFilters = {
    member: member && Number.isFinite(Number(member)) ? Number(member) : undefined,
    since: params.get('since') ?? undefined,
    until: params.get('until') ?? undefined,
  }

  function update(key: string, value: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-3">
        <label className="flex flex-col gap-1 text-sm">
          Membro
          <select value={member ?? ''} onChange={(e) => update('member', e.target.value)} className={inputClass}>
            <option value="">Todos</option>
            {(rankings.data ?? []).map((r) =>
              r.account.id != null ? (
                <option key={r.account.id} value={r.account.id}>
                  {r.account.full_name ?? `#${r.account.id}`}
                </option>
              ) : null,
            )}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Desde
          <input
            type="date"
            value={params.get('since') ?? ''}
            onChange={(e) => update('since', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Até
          <input
            type="date"
            value={params.get('until') ?? ''}
            onChange={(e) => update('until', e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <WorkoutList challengeId={challengeId} filters={filters} />
    </div>
  )
}
