import { Repeat, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Account, Insights } from '../../api/types'
import { joinNames } from '../../lib/dashboard'
import { pairSlots, sameWinners } from '../../lib/compare'
import { shortName } from '../../lib/visual'
import { Avatar } from '../Avatar'
import { type AwardItem, awardSlots, memberLink } from '../Highlights'
import { ChartCard } from '../ChartCard'
import { Badge } from '../ui/Badge'
import { type Side, SideDot, useNames } from './shared'

const MAX_FACES = 3

function Faces({ accounts }: { accounts: Account[] }) {
  return (
    <span className="flex shrink-0 -space-x-2.5">
      {accounts.slice(0, MAX_FACES).map((a, i) => (
        <span key={a.id ?? i} className="relative rounded-full ring-2 ring-[var(--card)]">
          <Avatar url={a.profile_picture_url} name={a.full_name} size="md" />
        </span>
      ))}
      {accounts.length > MAX_FACES && (
        <span className="relative flex items-center justify-center rounded-full border-2 border-[var(--card)] h-10 w-10 bg-[var(--wash)] text-[0.6875rem] font-semibold text-[var(--ink-muted)]">
          +{accounts.length - MAX_FACES}
        </span>
      )}
    </span>
  )
}

/** Vencedor de um lado: rostos, nome (link para o atleta naquele desafio) e valor com unidade. */
function Winner({ item, side, chip }: { item: AwardItem | null; side: Side; chip?: ReactNode }) {
  const n = useNames()
  if (!item) {
    return <span className="text-sm text-[var(--ink-muted)]">—</span>
  }
  const cid = n.ids[side]
  const unit = item.value === 1 ? item.unit[0] : item.unit[1]
  const names =
    item.accounts.length === 1 ? shortName(item.accounts[0].full_name ?? 'Sem nome') : joinNames(item.accounts.map((a) => a.full_name))
  const to = item.accounts.length === 1 ? memberLink(cid, item.accounts[0]) : null
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <Faces accounts={item.accounts} />
      <div className="flex min-w-0 flex-col">
        {to ? (
          <Link to={to} className="truncate text-sm font-medium text-[var(--ink)] hover:underline">
            {names}
          </Link>
        ) : (
          <span className="line-clamp-2 text-sm font-medium leading-tight text-[var(--ink)]">{names}</span>
        )}
        <span className="truncate text-xs tabular-nums text-[var(--ink-muted)]">
          <span className="font-semibold text-[var(--ink)]">{item.display ?? item.value.toLocaleString('pt-BR')}</span> {unit}
        </span>
      </div>
      {/* Selo à direita no desktop; no celular quebra para baixo do nome. */}
      {chip && <span className="flex basis-full pl-[3.125rem] sm:ml-auto sm:basis-auto sm:pl-0">{chip}</span>}
    </div>
  )
}

const repeatChip = (
  <Badge tone="tint" size="xs" icon={Repeat}>
    Bicampeão
  </Badge>
)
const newChip = (
  <Badge size="xs" icon={Sparkles} className="border-[var(--hairline)]">
    Novo campeão
  </Badge>
)

const cols = 'grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-center'

/** Tabela prêmio | vencedor A | vencedor B, na ordem dos destaques do dashboard, marcando quem repetiu. */
export function AwardsCompare({ a, b }: { a: Insights; b: Insights }) {
  const n = useNames()
  const rows = pairSlots(awardSlots(a), awardSlots(b)).map((r) => ({
    ...r,
    same: !!r.a && !!r.b && sameWinners(r.a.accounts, r.b.accounts),
  }))
  if (rows.length === 0) return null
  const repeated = rows.filter((r) => r.same).length
  return (
    <ChartCard title="Campeões" aside={`${repeated} de ${rows.length} repetiram`}>
      <div role="table" aria-label="Prêmios comparados" className="-mt-1 flex flex-col">
        <div role="row" className={`${cols} hidden border-b border-[var(--hairline)] pb-3 sm:grid`}>
          <span role="columnheader" className="eyebrow">
            Prêmio
          </span>
          {(['a', 'b'] as const).map((s) => (
            <span key={s} role="columnheader" className="eyebrow flex min-w-0 items-center gap-1.5">
              <SideDot side={s} />
              <span className="truncate">{n[s]}</span>
            </span>
          ))}
        </div>
        {rows.map((r) => {
          const meta = (r.a ?? r.b)!
          return (
            <div role="row" key={meta.id} className={`${cols} border-b border-[var(--hairline)] py-3.5 last:border-b-0 last:pb-0`}>
              <span role="rowheader" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tint)] text-[var(--brand-ink)]">
                  <meta.Icon size={15} strokeWidth={1.75} />
                </span>
                <span className="eyebrow">{meta.title}</span>
              </span>
              {(['a', 'b'] as const).map((s) => (
                <div role="cell" key={s} className="flex min-w-0 items-center gap-2.5 pl-2.5 sm:block sm:pl-0">
                  {/* No celular as colunas não têm cabeçalho: a bolinha diz o lado. */}
                  <SideDot side={s} className="sm:hidden" />
                  {/* Bicampeão também mostra o vencedor completo em B: os valores diferem. */}
                  <Winner item={r[s]} side={s} chip={s === 'a' && r.a ? (r.same ? repeatChip : newChip) : undefined} />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </ChartCard>
  )
}
