import { ChevronDown } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { type WorkoutFilters, useRankings } from '../api/queries'
import { WorkoutList } from '../components/WorkoutList'
import { icon } from '../lib/ui'

const labelClass = 'flex min-w-0 flex-col gap-2'
const labelText = 'eyebrow px-1'

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
    <div className="flex flex-col gap-6">
      <div className="surface grid gap-4 p-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <label className={labelClass}>
          <span className={labelText}>Membro</span>
          <span className="relative">
            <select
              value={member ?? ''}
              onChange={(e) => update('member', e.target.value)}
              className="field w-full cursor-pointer appearance-none pr-10"
            >
              <option value="">Todos</option>
              {(rankings.data ?? []).map((r) =>
                r.account.id != null ? (
                  <option key={r.account.id} value={r.account.id}>
                    {r.account.full_name ?? `#${r.account.id}`}
                  </option>
                ) : null,
              )}
            </select>
            {/* appearance-none tira a seta nativa: esta segue a cor do texto. */}
            <ChevronDown
              {...icon}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]"
            />
          </span>
        </label>
        <label className={labelClass}>
          <span className={labelText}>Desde</span>
          <input
            type="date"
            value={params.get('since') ?? ''}
            onChange={(e) => update('since', e.target.value)}
            className="field w-full"
          />
        </label>
        <label className={labelClass}>
          <span className={labelText}>Até</span>
          <input
            type="date"
            value={params.get('until') ?? ''}
            onChange={(e) => update('until', e.target.value)}
            className="field w-full"
          />
        </label>
      </div>
      <WorkoutList challengeId={challengeId} filters={filters} />
    </div>
  )
}
