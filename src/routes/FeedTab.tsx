import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { type WorkoutFilters, useRankings } from '../api/queries'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { DatePicker } from '../components/ui/DatePicker'
import { Dialog } from '../components/ui/Dialog'
import { Select } from '../components/ui/Select'
import { WorkoutList } from '../components/WorkoutList'
import { shortName } from '../lib/visual'

interface Draft {
  member: string
  since: string
  until: string
}

const KEYS = ['member', 'since', 'until'] as const

// "2026-10-01" → "01/10": rótulo curto do chip.
function dayMonth(key: string): string {
  const [, m, d] = key.split('-')
  return `${d}/${m}`
}

export function FeedTab({ challengeId }: { challengeId: number }) {
  const [params, setParams] = useSearchParams()
  const rankings = useRankings(challengeId)

  // A URL é a fonte da verdade; o modal só edita um rascunho até "Aplicar".
  const current: Draft = {
    member: params.get('member') ?? '',
    since: params.get('since') ?? '',
    until: params.get('until') ?? '',
  }
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(current)

  const filters: WorkoutFilters = {
    member: current.member && Number.isFinite(Number(current.member)) ? Number(current.member) : undefined,
    since: current.since || undefined,
    until: current.until || undefined,
  }

  function apply(next: Draft) {
    setParams((prev) => {
      const out = new URLSearchParams(prev)
      for (const k of KEYS) {
        if (next[k]) out.set(k, next[k])
        else out.delete(k)
      }
      return out
    })
  }

  function openDialog() {
    setDraft(current)
    setOpen(true)
  }

  const members = (rankings.data ?? []).filter((r) => r.account.id != null)
  const memberName = (id: string) => {
    const r = members.find((m) => String(m.account.id) === id)
    return r?.account.full_name ?? `#${id}`
  }

  const chips = [
    current.member && { key: 'member' as const, label: memberName(current.member) },
    current.since && { key: 'since' as const, label: `desde ${dayMonth(current.since)}` },
    current.until && { key: 'until' as const, label: `até ${dayMonth(current.until)}` },
  ].filter((c): c is { key: (typeof KEYS)[number]; label: string } => !!c)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button icon={SlidersHorizontal} onClick={openDialog}>
          Filtros
          {chips.length > 0 && (
            <span className="min-w-5 rounded-full bg-[var(--brand-from)]/15 px-1.5 text-center text-xs leading-5 text-[var(--brand-ink)]">
              {chips.length}
            </span>
          )}
        </Button>
        {chips.map((c) => (
          <Badge key={c.key} tone="tint" size="md" className="pr-1.5">
            {c.label}
            <button
              type="button"
              aria-label={`Remover filtro ${c.label}`}
              onClick={() => apply({ ...current, [c.key]: '' })}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-[var(--brand-from)]/15"
            >
              <X size={12} strokeWidth={2} />
            </button>
          </Badge>
        ))}
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        eyebrow="Feed"
        title="Filtros"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                apply({ member: '', since: '', until: '' })
                setOpen(false)
              }}
            >
              Limpar filtros
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                apply(draft)
                setOpen(false)
              }}
            >
              Aplicar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Select
            label="Membro"
            value={draft.member}
            onValueChange={(member) => setDraft((d) => ({ ...d, member }))}
            options={[
              { value: '', label: 'Todos' },
              ...members.map((r) => ({
                value: String(r.account.id),
                label: shortName(r.account.full_name ?? `#${r.account.id}`),
                icon: <Avatar url={r.account.profile_picture_url} name={r.account.full_name} size="xs" />,
              })),
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Desde"
              value={draft.since}
              max={draft.until || undefined}
              onChange={(since) => setDraft((d) => ({ ...d, since }))}
            />
            <DatePicker
              label="Até"
              value={draft.until}
              min={draft.since || undefined}
              onChange={(until) => setDraft((d) => ({ ...d, until }))}
            />
          </div>
        </div>
      </Dialog>

      <WorkoutList challengeId={challengeId} filters={filters} />
    </div>
  )
}
