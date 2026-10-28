import { X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { type WorkoutFilters, useRankings } from '../api/queries'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/ui/Button'
import { DatePicker } from '../components/ui/DatePicker'
import { Select } from '../components/ui/Select'
import { WorkoutList } from '../components/WorkoutList'
import { shortName } from '../lib/visual'

const KEYS = ['member', 'since', 'until'] as const

export function FeedTab({ challengeId }: { challengeId: number }) {
  const [params, setParams] = useSearchParams()
  const rankings = useRankings(challengeId)

  // A URL é a fonte da verdade: cada controle grava direto nela.
  const member = params.get('member') ?? ''
  const since = params.get('since') ?? ''
  const until = params.get('until') ?? ''
  const filters: WorkoutFilters = {
    member: member && Number.isFinite(Number(member)) ? Number(member) : undefined,
    since: since || undefined,
    until: until || undefined,
  }

  function update(key: (typeof KEYS)[number], value: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  function clear() {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const k of KEYS) next.delete(k)
      return next
    })
  }

  const members = (rankings.data ?? []).filter((r) => r.account.id != null)

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile: membro em linha cheia, as duas datas lado a lado. */}
      <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
        <div className="col-span-2 sm:w-64">
          <Select
            label="Membro"
            value={member}
            onValueChange={(v) => update('member', v)}
            options={[
              { value: '', label: 'Todos' },
              ...members.map((r) => ({
                value: String(r.account.id),
                label: shortName(r.account.full_name ?? `#${r.account.id}`),
                icon: <Avatar url={r.account.profile_picture_url} name={r.account.full_name} size="xs" />,
              })),
            ]}
          />
        </div>
        <div className="sm:w-44">
          <DatePicker label="Desde" value={since} max={until || undefined} onChange={(v) => update('since', v)} />
        </div>
        <div className="sm:w-44">
          <DatePicker label="Até" value={until} min={since || undefined} onChange={(v) => update('until', v)} />
        </div>
        {(member || since || until) && (
          <Button variant="ghost" icon={X} onClick={clear} className="col-span-2 justify-self-start">
            Limpar
          </Button>
        )}
      </div>

      <WorkoutList challengeId={challengeId} filters={filters} />
    </div>
  )
}
