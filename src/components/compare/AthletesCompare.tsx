import { ArrowDown, ArrowDownWideNarrow, ArrowUp, ArrowUpNarrowWide, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  type AthleteComparison,
  type AthleteRow,
  type AthleteSide,
  type AthleteStatus,
  formatSigned,
  sortByDelta,
} from '../../lib/compare'
import { paginate } from '../../lib/paginate'
import { shortName } from '../../lib/visual'
import { Avatar } from '../Avatar'
import { ChartCard } from '../ChartCard'
import { Pager } from '../Pager'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { SegmentedControl } from '../ui/SegmentedControl'
import { SideDot, useNames } from './shared'

const PAGE_SIZE = 10

const FILTERS = [
  { value: 'both', label: 'Nos dois' },
  { value: 'novo', label: 'Novos' },
  { value: 'saiu', label: 'Saíram' },
] as const satisfies readonly { value: AthleteStatus; label: string }[]

/** Link para o atleta no desafio onde ele está (A primeiro). */
function athleteLink(r: AthleteRow, ids: { a: number; b: number }) {
  return `/c/${r.a ? ids.a : ids.b}/m/${r.id}`
}

function DeltaPill({ value }: { value: number | null }) {
  if (value == null) return <span className="text-sm text-[var(--ink-muted)]">—</span>
  const tone = value > 0 ? 'positive' : value < 0 ? 'danger' : 'wash'
  return (
    <Badge tone={tone} size="xs" aria-label={`variação ${formatSigned(value)}`} className="min-w-9 justify-center">
      {formatSigned(value)}
    </Badge>
  )
}

const TREND = {
  up: { Icon: ArrowUp, cls: 'text-[var(--positive)]', text: 'subiu' },
  down: { Icon: ArrowDown, cls: 'text-[var(--danger)]', text: 'caiu' },
  same: { Icon: Minus, cls: 'text-[var(--ink-muted)]', text: 'manteve' },
}

const pos = (s: AthleteSide | null) => (s?.position == null ? '—' : `${s.position}º`)
const num = (v: number | null | undefined) => (v == null ? '—' : String(v))

function Position({ r }: { r: AthleteRow }) {
  const t = r.trend ? TREND[r.trend] : null
  return (
    <span
      className="inline-flex items-center justify-end gap-1 tabular-nums"
      aria-label={`posição ${pos(r.a)} em A, ${pos(r.b)} em B${t ? `, ${t.text}` : ''}`}
    >
      {t && <t.Icon size={13} strokeWidth={2} className={t.cls} />}
      <span className="font-semibold text-[var(--ink)]">{pos(r.a)}</span>
      <span className="text-[var(--ink-muted)]">/ {pos(r.b)}</span>
    </span>
  )
}

function Who({ r, size = 'sm' }: { r: AthleteRow; size?: 'sm' | 'md' }) {
  const { ids } = useNames()
  return (
    <Link
      to={athleteLink(r, ids)}
      className="flex min-w-0 items-center gap-2.5 self-start rounded-full py-0.5 pr-2 transition-colors hover:bg-[var(--wash)]"
    >
      <Avatar url={r.picture} name={r.name} size={size} />
      <span className="truncate text-sm font-medium text-[var(--ink)]">{shortName(r.name)}</span>
    </Link>
  )
}

/** Top 3 que mais subiram (ou caíram) em check-ins entre quem está nos dois. */
function MoversCard({ title, rows, up }: { title: string; rows: AthleteRow[]; up: boolean }) {
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <ChartCard title={title} aside="check-ins, entre quem está nos dois" className="flex-1">
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">Ninguém {up ? 'subiu' : 'caiu'}.</p>
      ) : (
        <ol aria-label={title} className="flex flex-col divide-y divide-[var(--hairline)]">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <Who r={r} size="md" />
              <span className="ml-auto flex shrink-0 items-center gap-2.5 text-[0.8125rem] tabular-nums text-[var(--ink-muted)]">
                <span aria-label={`${r.b!.workouts} para ${r.a!.workouts}`}>
                  {r.b!.workouts} → <span className="font-semibold text-[var(--ink)]">{r.a!.workouts}</span>
                </span>
                <Icon size={14} strokeWidth={2} className={up ? 'text-[var(--positive)]' : 'text-[var(--danger)]'} />
                <DeltaPill value={r.delta} />
              </span>
            </li>
          ))}
        </ol>
      )}
    </ChartCard>
  )
}

// Tabela no desktop; no celular cada linha vira um bloco com nome em cima e números embaixo.
const cols =
  'grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 sm:grid-cols-[minmax(0,1fr)_6.5rem_6.5rem_4rem_6rem_6.5rem] sm:items-center sm:gap-3'

function Row({ r }: { r: AthleteRow }) {
  const n = useNames()
  return (
    <div role="row" className={`${cols} border-b border-[var(--hairline)] py-3 last:border-b-0`}>
      <div role="cell" className="flex min-w-0">
        <Who r={r} />
      </div>
      <div role="cell" className="flex justify-end sm:order-4">
        <DeltaPill value={r.delta} />
      </div>
      {/* Celular: três mini-colunas sob o nome. */}
      <div className="col-span-2 grid grid-cols-3 gap-2 text-[0.8125rem] tabular-nums sm:contents">
        <div role="cell" className="flex flex-col sm:order-2 sm:block sm:text-right">
          <span className="text-[0.6875rem] text-[var(--ink-muted)] sm:hidden">Check-ins</span>
          <span>
            <span className="font-semibold text-[var(--ink)]" aria-label={`${n.a}: ${num(r.a?.workouts)}`}>
              {num(r.a?.workouts)}
            </span>
            <span className="text-[var(--ink-muted)] sm:hidden"> / {num(r.b?.workouts)}</span>
          </span>
        </div>
        <div role="cell" className="hidden sm:order-3 sm:block sm:text-right">
          <span className="text-[var(--ink-muted)]" aria-label={`${n.b}: ${num(r.b?.workouts)}`}>
            {num(r.b?.workouts)}
          </span>
        </div>
        <div role="cell" className="flex flex-col sm:order-5 sm:block sm:text-right">
          <span className="text-[0.6875rem] text-[var(--ink-muted)] sm:hidden">Dias ativos</span>
          <span>
            <span className="font-semibold text-[var(--ink)]">{num(r.a?.activeDays)}</span>
            <span className="text-[var(--ink-muted)]"> / {num(r.b?.activeDays)}</span>
          </span>
        </div>
        <div role="cell" className="flex flex-col items-end sm:order-6 sm:block sm:text-right">
          <span className="text-[0.6875rem] text-[var(--ink-muted)] sm:hidden">Posição</span>
          <Position r={r} />
        </div>
      </div>
    </div>
  )
}

export function AthletesCompare({ data }: { data: AthleteComparison }) {
  const n = useNames()
  const [filter, setFilter] = useState<AthleteStatus>('both')
  const [dir, setDir] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(1)
  const { summary, movers } = data
  const shown = sortByDelta(
    data.rows.filter((r) => r.status === filter),
    dir,
  )
  const current = paginate(shown, page, PAGE_SIZE)

  return (
    <div className="flex flex-col gap-5">
      <p className="flex flex-wrap items-center gap-2" aria-label="Resumo dos atletas">
        <Badge tone="tint" size="md">
          {summary.both} nos dois
        </Badge>
        <Badge size="md" className="border-[var(--hairline)]">
          {summary.novo} {summary.novo === 1 ? 'novo' : 'novos'}
        </Badge>
        <Badge size="md" className="border-[var(--hairline)]">
          {summary.saiu} {summary.saiu === 1 ? 'saiu' : 'saíram'}
        </Badge>
      </p>

      {summary.both > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          <MoversCard title="Mais evoluíram" rows={movers.up} up />
          <MoversCard title="Mais caíram" rows={movers.down} up={false} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          label="Filtrar atletas"
          value={filter}
          onChange={(v) => {
            setFilter(v)
            setPage(1)
          }}
          options={FILTERS.map((f) => ({ ...f, count: summary[f.value] }))}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div role="table" aria-label="Atletas comparados" className="surface flex flex-col px-5 py-2">
          <div role="row" className={`${cols} border-b border-[var(--hairline)] py-3`}>
            <span role="columnheader" className="eyebrow">
              Atleta
            </span>
            <span role="columnheader" aria-sort={dir === 'desc' ? 'descending' : 'ascending'} className="flex justify-end sm:order-4">
              <Button
                variant="ghost"
                size="sm"
                icon={dir === 'desc' ? ArrowDownWideNarrow : ArrowUpNarrowWide}
                aria-label={`Ordenar por variação, ${dir === 'desc' ? 'maior primeiro' : 'menor primeiro'}`}
                onClick={() => {
                  setDir(dir === 'desc' ? 'asc' : 'desc')
                  setPage(1)
                }}
                className="-mr-2 h-7 px-2 text-[0.6875rem] font-medium uppercase tracking-[0.16em]"
              >
                Δ
              </Button>
            </span>
            <span role="columnheader" className="eyebrow hidden min-w-0 items-center justify-end gap-1.5 tracking-[0.1em] sm:order-2 sm:flex">
              <SideDot side="a" />
              <span className="truncate">{n.a}</span>
            </span>
            <span role="columnheader" className="eyebrow hidden min-w-0 items-center justify-end gap-1.5 tracking-[0.1em] sm:order-3 sm:flex">
              <SideDot side="b" />
              <span className="truncate">{n.b}</span>
            </span>
            <span role="columnheader" className="eyebrow hidden text-right sm:order-5 sm:block">
              Dias A / B
            </span>
            <span role="columnheader" className="eyebrow hidden text-right sm:order-6 sm:block">
              Posição
            </span>
          </div>
          {current.items.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--ink-muted)]">Ninguém nesse grupo.</p>
          ) : (
            current.items.map((r) => <Row key={r.id} r={r} />)
          )}
        </div>
        <Pager page={current} onChange={setPage} />
      </div>
    </div>
  )
}
