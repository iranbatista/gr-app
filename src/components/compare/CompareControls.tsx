import { ArrowLeftRight } from 'lucide-react'
import type { Challenge } from '../../api/types'
import type { CompareMode } from '../../lib/compare'
import { formatPeriod } from '../../lib/format'
import { Cover } from '../Cover'
import { Button } from '../ui/Button'
import { SegmentedControl } from '../ui/SegmentedControl'
import { Select, type SelectOption } from '../ui/Select'
import { COLOR, Legend, type Side } from './shared'

const UNTIL_HINT = 'Disponível após atualizar a API'

/** Capa em miniatura com um aro fino na cor do lado. */
function Thumb({ c, side }: { c: Challenge; side: Side }) {
  return (
    <span className="shrink-0 rounded-[0.5rem] p-[1.5px]" style={{ backgroundColor: COLOR[side] }}>
      <Cover url={c.profile_picture_url} name={c.name} cssPx={28} className="block h-6 w-6 rounded-[0.4rem]" />
    </span>
  )
}

function options(list: Challenge[], side: Side): SelectOption[] {
  return list.map((c) => ({
    value: String(c.id),
    label: c.name?.trim() || `Desafio #${c.id}`,
    hint: formatPeriod(c.start_date, c.end_date),
    icon: <Thumb c={c} side={side} />,
  }))
}

interface Props {
  challenges: Challenge[]
  a: number
  b: number
  onPick: (side: Side, id: number) => void
  onSwap: () => void
  mode: CompareMode
  onMode: (m: CompareMode) => void
  /** Dia de corte comum; null quando não dá para alinhar. */
  n: number | null
  /** A API ignora `until`: o modo dia fica desabilitado. */
  noUntil: boolean
}

export function CompareControls({ challenges, a, b, onPick, onSwap, mode, onMode, n, noUntil }: Props) {
  const diaDisabled = noUntil || n == null
  return (
    <div className="surface flex flex-col gap-5 p-4 sm:p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Select
          label="Desafio A"
          value={String(a)}
          onValueChange={(v) => onPick('a', Number(v))}
          options={options(challenges, 'a')}
          iconInTrigger
        />
        <Button
          size="icon"
          icon={ArrowLeftRight}
          aria-label="Inverter desafios"
          onClick={onSwap}
          className="row-span-2 self-center sm:row-span-1 sm:mb-0.5 sm:self-end"
        />
        <Select
          label="Desafio B"
          value={String(b)}
          onValueChange={(v) => onPick('b', Number(v))}
          options={options(challenges, 'b')}
          iconInTrigger
        />
      </div>
      <div className="flex flex-col gap-3 border-t border-[var(--hairline)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Alinhamento"
          value={mode}
          onChange={onMode}
          options={[
            {
              value: 'dia',
              label: n == null ? 'Até o mesmo dia' : `Até o dia ${n}`,
              disabled: diaDisabled,
              hint: noUntil ? UNTIL_HINT : undefined,
            },
            { value: 'total', label: 'Desafio inteiro' },
          ]}
        />
        <Legend />
      </div>
    </div>
  )
}
