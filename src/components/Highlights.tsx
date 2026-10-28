import {
  ArrowLeftRight,
  CalendarCheck,
  Dumbbell,
  Flame,
  Handshake,
  Heart,
  type LucideIcon,
  MessageCircle,
  Moon,
  Sparkles,
  Sunrise,
  Timer,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Account, DuoAward, EmojiCount, Insights, Streak, TopWorkout } from '../api/types'
import { emojiSize, joinNames, streakLeaders } from '../lib/dashboard'
import { shortName } from '../lib/visual'
import { Avatar } from './Avatar'
import { ChartCard } from './ChartCard'
import { Badge } from './ui/Badge'
import { Tooltip } from './ui/Tooltip'
import { CHECKIN_PARAM } from './WorkoutDetail'

const MAX_FACES = 3

interface AwardItem {
  id: string
  title: string
  Icon: LucideIcon
  value: number
  unit: [string, string]
  accounts: Account[]
  /** Valor já formatado, quando não é só o número (ex.: "49 h"). */
  display?: string
  duo?: DuoAward
}

/** Minutos em horas arredondadas; abaixo de 1 h fica em minutos. */
export function formatMinutes(min: number) {
  return min < 60 ? `${min} min` : `${Math.round(min / 60).toLocaleString('pt-BR')} h`
}

/** Prêmios na ordem do layout; os sem vencedor somem. */
function awardItems(ins: Insights): AwardItem[] {
  const longest = streakLeaders(ins.streaks, 'longest')
  const a = ins.awards
  const single = (x: { account: Account; value: number } | null | undefined) =>
    x && x.value > 0 ? { value: x.value, accounts: [x.account] } : null
  const duo = a.dynamic_duo && a.dynamic_duo.value > 0 && a.dynamic_duo.accounts.length === 2 ? a.dynamic_duo : null
  const all: (Omit<AwardItem, 'value' | 'accounts' | 'display' | 'duo'> & {
    win: { value: number; accounts: Account[]; display?: string; duo?: DuoAward } | null
  })[] = [
    { id: 'longest', title: 'Maior sequência', Icon: Flame, unit: ['dia seguido (recorde)', 'dias seguidos (recorde)'], win: longest.accounts.length ? longest : null },
    {
      id: 'marathon',
      title: 'Maratonista',
      Icon: Timer,
      unit: ['treinados no total', 'treinados no total'],
      win: a.marathoner && a.marathoner.value > 0 ? { ...single(a.marathoner)!, display: formatMinutes(a.marathoner.value) } : null,
    },
    { id: 'weekend', title: 'Sem folga', Icon: CalendarCheck, unit: ['treino no fim de semana', 'treinos no fim de semana'], win: single(a.weekend) },
    { id: 'early', title: 'Madrugador', Icon: Sunrise, unit: ['treino antes das 7h', 'treinos antes das 7h'], win: single(a.early_bird) },
    { id: 'night', title: 'Coruja', Icon: Moon, unit: ['treino após 21h', 'treinos após 21h'], win: single(a.night_owl) },
    { id: 'reactions', title: 'Mais reações', Icon: Heart, unit: ['reação recebida', 'reações recebidas'], win: single(a.most_reactions) },
    { id: 'comments', title: 'Mais comentado', Icon: MessageCircle, unit: ['comentário', 'comentários'], win: single(a.most_comments) },
    { id: 'given', title: 'Mais engajado', Icon: Sparkles, unit: ['reação dada', 'reações dadas'], win: single(a.most_reactions_given) },
    {
      id: 'duo',
      title: 'Dupla dinâmica',
      Icon: Handshake,
      unit: ['reação trocada', 'reações trocadas'],
      win: duo ? { value: duo.value, accounts: duo.accounts, duo } : null,
    },
  ]
  return all.flatMap(({ win, ...x }) => (win ? [{ ...x, ...win }] : []))
}

function memberLink(challengeId: number, a: Account) {
  return a.id != null ? `/c/${challengeId}/m/${a.id}` : null
}

/** Um vencedor: avatar + nome. Empate: rostos empilhados (até 3, depois "+N") e nomes juntos. */
function Winners({ accounts, challengeId }: { accounts: Account[]; challengeId: number }) {
  if (accounts.length === 1) {
    const a = accounts[0]
    const to = memberLink(challengeId, a)
    const body = (
      <>
        <Avatar url={a.profile_picture_url} name={a.full_name} size="sm" ring />
        <span className="line-clamp-2 min-w-0 text-sm font-medium leading-tight text-[var(--ink)]">
          {shortName(a.full_name ?? 'Sem nome')}
        </span>
      </>
    )
    return to ? (
      <Link to={to} className="-ml-1 flex min-w-0 items-center gap-2 self-start rounded-full py-0.5 pl-0.5 pr-2.5 transition-colors hover:bg-[var(--wash)]">
        {body}
      </Link>
    ) : (
      <div className="flex min-w-0 items-center gap-2">{body}</div>
    )
  }
  const extra = accounts.length - MAX_FACES
  // Card estreito (celular): rostos em cima, nomes embaixo; lado a lado eles quebrariam palavra por palavra.
  return (
    <div className="flex min-w-0 flex-col items-start gap-2 lg:flex-row lg:items-center">
      <ul className="flex shrink-0 -space-x-2.5">
        {accounts.slice(0, MAX_FACES).map((a, i) => {
          const to = memberLink(challengeId, a)
          const face = <Avatar url={a.profile_picture_url} name={a.full_name} size="sm" ring />
          return (
            <li key={a.id ?? i} className="relative transition-transform hover:z-10 hover:-translate-y-0.5">
              {to ? (
                <Link to={to} aria-label={a.full_name ?? 'Sem nome'} className="block rounded-full">
                  {face}
                </Link>
              ) : (
                face
              )}
            </li>
          )
        })}
        {extra > 0 && (
          <li className="relative flex h-[2.25rem] w-[2.25rem] items-center justify-center rounded-full border-2 border-[var(--card)] bg-[var(--wash)] text-[0.6875rem] font-semibold text-[var(--ink-muted)]">
            +{extra}
          </li>
        )}
      </ul>
      <span className="min-w-0 text-[0.8125rem] font-medium leading-snug text-[var(--ink)]">
        {joinNames(accounts.map((a) => a.full_name))}
      </span>
    </div>
  )
}

const firstName = (a: Account) => (a.full_name ?? 'Sem nome').trim().split(/\s+/)[0]

/** Dupla: dois rostos sobrepostos, cada um levando ao perfil, e os primeiros nomes. */
function DuoWinners({ duo, challengeId }: { duo: DuoAward; challengeId: number }) {
  const [a, b] = duo.accounts
  const name = (x: Account) => {
    const to = memberLink(challengeId, x)
    return to ? (
      <Link to={to} className="rounded-sm hover:underline">
        {firstName(x)}
      </Link>
    ) : (
      firstName(x)
    )
  }
  return (
    <div className="flex min-w-0 flex-col items-start gap-2 lg:flex-row lg:items-center">
      <ul className="flex shrink-0 -space-x-2.5">
        {duo.accounts.map((x, i) => {
          const to = memberLink(challengeId, x)
          const face = <Avatar url={x.profile_picture_url} name={x.full_name} size="sm" ring />
          return (
            <li key={x.id ?? i} className="relative transition-transform hover:z-10 hover:-translate-y-0.5">
              {to ? (
                <Link to={to} aria-label={x.full_name ?? 'Sem nome'} className="block rounded-full">
                  {face}
                </Link>
              ) : (
                face
              )}
            </li>
          )
        })}
      </ul>
      <span className="min-w-0 text-[0.8125rem] font-medium leading-snug text-[var(--ink)]">
        {name(a)} e {name(b)}
      </span>
    </div>
  )
}

function DuoDirections({ duo }: { duo: DuoAward }) {
  const [a, b] = duo.accounts
  const label = `${firstName(a)} → ${firstName(b)}: ${duo.a_to_b} · ${firstName(b)} → ${firstName(a)}: ${duo.b_to_a}`
  return (
    <Tooltip content={label}>
      <span
        tabIndex={0}
        aria-label={label}
        className="inline-flex items-center gap-1.5 self-start rounded-full text-xs font-medium tabular-nums text-[var(--ink-muted)]"
      >
        <span aria-hidden>{duo.a_to_b}</span>
        <ArrowLeftRight aria-hidden size={12} strokeWidth={2} />
        <span aria-hidden>{duo.b_to_a}</span>
      </span>
    </Tooltip>
  )
}

function AwardCard({ item, challengeId }: { item: AwardItem; challengeId: number }) {
  const unit = item.value === 1 ? item.unit[0] : item.unit[1]
  return (
    <li aria-label={`${item.title}: ${item.display ?? item.value} ${unit}`} className="surface flex min-w-0 flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tint)] text-[var(--brand-ink)]">
          <item.Icon size={16} strokeWidth={1.75} />
        </span>
        <p className="eyebrow">{item.title}</p>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-heading text-[2rem] font-semibold leading-none tracking-tight text-[var(--ink)] tabular-nums">
          {item.display ?? item.value.toLocaleString('pt-BR')}
        </span>
        <span className="text-[0.8125rem] leading-snug text-[var(--ink-muted)]">{unit}</span>
        {item.duo && <DuoDirections duo={item.duo} />}
      </div>
      <div className="mt-auto">
        {item.duo ? (
          <DuoWinners duo={item.duo} challengeId={challengeId} />
        ) : (
          <Winners accounts={item.accounts} challengeId={challengeId} />
        )}
      </div>
    </li>
  )
}

/** Grade uniforme de prêmios: 2 colunas no celular, 3 no desktop. */
export function AwardsGrid({ insights, challengeId }: { insights: Insights; challengeId: number }) {
  const items = awardItems(insights)
  if (items.length === 0) return null
  return (
    <ul aria-label="Prêmios" className="grid auto-rows-fr grid-cols-2 gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <AwardCard key={item.id} item={item} challengeId={challengeId} />
      ))}
    </ul>
  )
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Coluna "Agora": em andamento quando a atual é o próprio recorde; senão os dias atuais ou "—". */
function Now({ s }: { s: Streak }) {
  if (s.current > 0 && s.current === s.longest) {
    return (
      <Badge tone="tint" size="xs" icon={Flame} aria-label={`em andamento: ${plural(s.current, 'dia', 'dias')}`}>
        <span className="hidden sm:inline">em andamento</span>
      </Badge>
    )
  }
  if (s.current > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium tabular-nums text-[var(--ink)]">
        <Flame size={12} strokeWidth={2} className="text-[var(--brand-ink)]" />
        {plural(s.current, 'dia', 'dias')}
      </span>
    )
  }
  return (
    <span aria-label="sem sequência agora" className="text-sm text-[var(--ink-muted)]">
      —
    </span>
  )
}

// Colunas fixas (cabeçalho e linhas são grids separados): no celular "Agora" vira só a chama.
const streakCols =
  'grid grid-cols-[0.75rem_minmax(0,1fr)_3.75rem_3.75rem] items-center gap-2.5 sm:grid-cols-[1.25rem_minmax(0,1fr)_4.25rem_6.5rem] sm:gap-3'

/** Top 5 sequências em colunas explícitas: atleta, recorde e sequência de agora. */
export function StreakList({ streaks, challengeId }: { streaks: Streak[]; challengeId: number }) {
  if (streaks.length === 0) return null
  const top = streaks.slice(0, 5)
  const max = Math.max(1, ...top.map((s) => s.longest))
  return (
    <ChartCard title="Sequências" className="h-full" aside="dias seguidos com pelo menos um check-in">
      <div role="table" aria-label="Sequências" className="flex flex-1 flex-col">
        <div role="row" className={`${streakCols} border-b border-[var(--hairline)] pb-2`}>
          <span role="columnheader" className="eyebrow col-span-2">
            Atleta
          </span>
          <span role="columnheader" className="eyebrow text-right">
            Recorde
          </span>
          <span role="columnheader" className="eyebrow text-right">
            Agora
          </span>
        </div>
        {top.map((s, i) => {
          const name = s.account.full_name ?? 'Sem nome'
          const to = memberLink(challengeId, s.account)
          const who = (
            <>
              <Avatar url={s.account.profile_picture_url} name={name} size="sm" />
              <span className="truncate text-sm font-medium text-[var(--ink)]">{shortName(name)}</span>
            </>
          )
          return (
            // Linhas dividem a altura do card: a lista acompanha o gráfico ao lado.
            <div
              role="row"
              key={s.account.id ?? i}
              className={`${streakCols} min-h-14 flex-1 border-b border-[var(--hairline)] last:border-b-0`}
            >
              <span role="cell" className="text-right text-xs font-semibold tabular-nums text-[var(--ink-muted)]">
                {i + 1}
              </span>
              <div role="cell" className="flex min-w-0 flex-col gap-1.5">
                {to ? (
                  <Link
                    to={to}
                    className="flex min-w-0 max-w-full items-center gap-2.5 self-start rounded-full py-0.5 pr-2 transition-colors hover:bg-[var(--wash)]"
                  >
                    {who}
                  </Link>
                ) : (
                  <div className="flex min-w-0 items-center gap-2.5">{who}</div>
                )}
                {/* Recorde relativo ao líder, sob o nome. */}
                <div aria-hidden className="ml-[2.375rem] h-1.5 overflow-hidden rounded-full bg-[var(--wash)]">
                  <div className="brand-gradient h-full rounded-full" style={{ width: `${(s.longest / max) * 100}%` }} />
                </div>
              </div>
              <span role="cell" className="text-right text-sm font-semibold tabular-nums text-[var(--ink)]">
                {s.longest} <span className="font-normal text-[var(--ink-muted)]">{s.longest === 1 ? 'dia' : 'dias'}</span>
              </span>
              <span role="cell" className="flex justify-end">
                <Now s={s} />
              </span>
            </div>
          )
        })}
      </div>
    </ChartCard>
  )
}

function TopCard({ w, rank }: { w: TopWorkout; rank: number }) {
  const [params] = useSearchParams()
  const [failed, setFailed] = useState(false)
  const title = w.title || 'Check-in'
  // Mesmo contrato do feed: ?checkin=<id> abre o modal, voltar fecha.
  const search = new URLSearchParams(params)
  search.set(CHECKIN_PARAM, String(w.id))
  return (
    <li className={rank === 1 ? 'col-span-2 sm:col-span-1' : ''}>
      <Link
        to={{ search: `?${search}` }}
        state={{ checkin: true }}
        preventScrollReset
        aria-label={`${title}, de ${w.account.full_name ?? 'Sem nome'}`}
        className="group relative block aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[var(--wash)]"
      >
        {w.photo_url && !failed ? (
          <img
            src={w.photo_url}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="brand-gradient flex h-full w-full items-center justify-center text-white/85">
            <Dumbbell size={32} strokeWidth={1.5} />
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-[rgba(20,18,17,0.55)] px-2 py-0.5 text-[0.6875rem] font-semibold text-white backdrop-blur">
          {rank}º
        </span>
        {/* Degradê no rodapé para o texto branco ler sobre qualquer foto. */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-3 pt-12">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="truncate text-xs text-white/80">{shortName(w.account.full_name ?? 'Sem nome')}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5 text-xs font-medium tabular-nums text-white">
            <span className="flex items-center gap-1" aria-label={`${w.reactions_count} reações`}>
              <Heart size={13} strokeWidth={2} />
              {w.reactions_count}
            </span>
            <span className="flex items-center gap-1" aria-label={`${w.comment_count} comentários`}>
              <MessageCircle size={13} strokeWidth={2} />
              {w.comment_count}
            </span>
          </div>
        </div>
      </Link>
    </li>
  )
}

export function TopCheckins({ items }: { items: TopWorkout[] }) {
  if (items.length === 0) return null
  return (
    <ChartCard title="Check-ins em destaque" aside="mais reações e comentários">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {items.slice(0, 3).map((w, i) => (
          <TopCard key={w.id} w={w} rank={i + 1} />
        ))}
      </ol>
    </ChartCard>
  )
}

export function EmojiCloud({ emojis }: { emojis: EmojiCount[] }) {
  if (emojis.length === 0) return null
  const top = emojis.slice(0, 8)
  const max = Math.max(...top.map((e) => e.count))
  const total = top.reduce((t, e) => t + e.count, 0)
  return (
    <ChartCard title="Emojis mais usados" aside={`${total.toLocaleString('pt-BR')} reações`}>
      {/* Faixa de uma linha no desktop; quebra no celular. */}
      <ul className="flex flex-wrap items-center gap-2.5">
        {top.map((e, i) => (
          <li
            key={e.emoji}
            aria-label={`${e.emoji} ${e.count}`}
            className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 ${i === 0 ? 'border-[var(--brand-from)]/35 bg-[var(--tint)]' : 'border-[var(--hairline)] bg-[var(--wash)]'}`}
          >
            <span aria-hidden className="leading-none" style={{ fontSize: `${emojiSize(e.count, max)}rem` }}>
              {e.emoji}
            </span>
            <span
              aria-hidden
              className={`text-sm font-semibold tabular-nums ${i === 0 ? 'text-[var(--brand-ink)]' : 'text-[var(--ink-muted)]'}`}
            >
              {e.count.toLocaleString('pt-BR')}
            </span>
          </li>
        ))}
      </ul>
    </ChartCard>
  )
}
