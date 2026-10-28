import { Dumbbell, Flame, Heart, type LucideIcon, MessageCircle, Moon, Sparkles, Sunrise, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Account, EmojiCount, Insights, Streak, TopWorkout } from '../api/types'
import { emojiSize, joinNames, streakLeaders } from '../lib/dashboard'
import { shortName } from '../lib/visual'
import { Avatar } from './Avatar'
import { ChartCard } from './ChartCard'
import { Badge } from './ui/Badge'
import { CHECKIN_PARAM } from './WorkoutDetail'

const MAX_FACES = 3

interface AwardItem {
  id: string
  title: string
  Icon: LucideIcon
  value: number
  unit: [string, string]
  accounts: Account[]
}

/** Prêmios na ordem do layout; os sem vencedor somem. */
export function awardItems(ins: Insights): AwardItem[] {
  const longest = streakLeaders(ins.streaks, 'longest')
  const current = streakLeaders(ins.streaks, 'current')
  const a = ins.awards
  const single = (x: { account: Account; value: number } | null | undefined) =>
    x && x.value > 0 ? { value: x.value, accounts: [x.account] } : null
  const all: (Omit<AwardItem, 'value' | 'accounts'> & { win: { value: number; accounts: Account[] } | null })[] = [
    { id: 'longest', title: 'Maior sequência', Icon: Flame, unit: ['dia seguido', 'dias seguidos'], win: longest.accounts.length ? longest : null },
    { id: 'current', title: 'Sequência atual', Icon: Zap, unit: ['dia', 'dias'], win: current.accounts.length ? current : null },
    { id: 'early', title: 'Madrugador', Icon: Sunrise, unit: ['treino antes das 7h', 'treinos antes das 7h'], win: single(a.early_bird) },
    { id: 'night', title: 'Coruja', Icon: Moon, unit: ['treino após 21h', 'treinos após 21h'], win: single(a.night_owl) },
    { id: 'reactions', title: 'Mais reações', Icon: Heart, unit: ['reação recebida', 'reações recebidas'], win: single(a.most_reactions) },
    { id: 'comments', title: 'Mais comentado', Icon: MessageCircle, unit: ['comentário', 'comentários'], win: single(a.most_comments) },
    { id: 'given', title: 'Mais engajado', Icon: Sparkles, unit: ['reação dada', 'reações dadas'], win: single(a.most_reactions_given) },
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
        <span className="truncate text-sm font-medium text-[var(--ink)]">{shortName(a.full_name ?? 'Sem nome')}</span>
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
  return (
    <div className="flex min-w-0 items-center gap-2">
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

function AwardCard({ item, featured, challengeId }: { item: AwardItem; featured: boolean; challengeId: number }) {
  const unit = item.value === 1 ? item.unit[0] : item.unit[1]
  return (
    <li
      aria-label={`${item.title}: ${item.value} ${unit}`}
      className={`surface flex min-w-0 flex-col gap-4 p-4 sm:p-5 ${featured ? 'col-span-2' : ''}`}
    >
      <div className={`flex gap-3 ${featured ? 'items-center' : 'flex-col items-start'}`}>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${featured ? 'brand-gradient text-white' : 'bg-[var(--tint)] text-[var(--brand-ink)]'}`}
        >
          <item.Icon size={16} strokeWidth={1.75} />
        </span>
        <p className="eyebrow">{item.title}</p>
      </div>
      <div className="flex flex-col gap-1">
        <span
          className={`font-heading font-semibold leading-none tracking-tight tabular-nums ${featured ? 'brand-text text-[2.75rem]' : 'text-[2rem] text-[var(--ink)]'}`}
        >
          {item.value.toLocaleString('pt-BR')}
        </span>
        <span className="text-[0.8125rem] leading-snug text-[var(--ink-muted)]">{unit}</span>
      </div>
      <div className="mt-auto">
        <Winners accounts={item.accounts} challengeId={challengeId} />
      </div>
    </li>
  )
}

/** Grade de prêmios: com número ímpar, o primeiro ocupa duas colunas e fecha as linhas. */
export function AwardsGrid({ insights, challengeId }: { insights: Insights; challengeId: number }) {
  const items = awardItems(insights)
  if (items.length === 0) return null
  const featureFirst = items.length % 2 === 1
  return (
    <ul aria-label="Prêmios" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item, i) => (
        <AwardCard key={item.id} item={item} featured={featureFirst && i === 0} challengeId={challengeId} />
      ))}
    </ul>
  )
}

/** Top 5 sequências: maior sequência em barra relativa ao líder, atual com chama. */
export function StreakList({ streaks, challengeId }: { streaks: Streak[]; challengeId: number }) {
  if (streaks.length === 0) return null
  const top = streaks.slice(0, 5)
  const max = Math.max(1, ...top.map((s) => s.longest))
  return (
    <ChartCard title="Sequências" aside="dias seguidos com check-in">
      <ol className="flex flex-col gap-1">
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
            <li
              key={s.account.id ?? i}
              className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl py-1.5 sm:grid-cols-[1.25rem_minmax(0,11rem)_minmax(0,1fr)_auto]"
            >
              <span className="text-right text-xs font-semibold tabular-nums text-[var(--ink-muted)]">{i + 1}</span>
              {to ? (
                <Link to={to} className="flex min-w-0 items-center gap-2.5 rounded-full py-0.5 pr-2 transition-colors hover:bg-[var(--wash)]">
                  {who}
                </Link>
              ) : (
                <div className="flex min-w-0 items-center gap-2.5">{who}</div>
              )}
              <div aria-hidden className="hidden h-2 overflow-hidden rounded-full bg-[var(--wash)] sm:block">
                <div className="brand-gradient h-full rounded-full" style={{ width: `${(s.longest / max) * 100}%` }} />
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-semibold tabular-nums text-[var(--ink)]">
                  {s.longest} <span className="font-normal text-[var(--ink-muted)]">{s.longest === 1 ? 'dia' : 'dias'}</span>
                </span>
                {s.current > 0 ? (
                  <Badge tone="tint" size="xs" icon={Flame} aria-label={`sequência atual de ${s.current} ${s.current === 1 ? 'dia' : 'dias'}`} className="min-w-[3.25rem] justify-center">
                    {s.current}
                  </Badge>
                ) : (
                  <span aria-label="sem sequência atual" className="min-w-[3.25rem] text-center text-xs text-[var(--ink-muted)]">
                    —
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
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
    <ChartCard title="Emojis mais usados" className="flex-1" aside={`${total.toLocaleString('pt-BR')} reações`}>
      <ul className="flex flex-1 flex-wrap content-center items-center gap-2.5">
        {top.map((e, i) => (
          <li
            key={e.emoji}
            aria-label={`${e.emoji} ${e.count}`}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 ${i === 0 ? 'border-[var(--brand-from)]/35 bg-[var(--tint)]' : 'border-[var(--hairline)] bg-[var(--wash)]'}`}
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
