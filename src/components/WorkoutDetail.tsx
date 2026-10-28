import { Activity, Flame, Footprints, MessageCircle, RotateCw, Route, Star, Timer } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useWorkout, useWorkoutComments } from '../api/queries'
import type { Workout } from '../api/types'
import {
  formatCalories,
  formatCommentTime,
  formatDateTime,
  formatDistance,
  formatDuration,
  formatPoints,
} from '../lib/format'
import { mediaOf } from '../lib/media'
import { Avatar } from './Avatar'
import { MediaGallery } from './MediaGallery'
import { ReactionPills } from './ReactionPills'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Dialog } from './ui/Dialog'
import { Bar, Circle, SkeletonGroup } from './ui/Skeleton'

export const CHECKIN_PARAM = 'checkin'

function Metrics({ w }: { w: Workout }) {
  const items = [
    w.duration != null && { icon: Timer, text: formatDuration(w.duration) },
    w.distance != null && { icon: Route, text: formatDistance(w.distance) },
    w.calories != null && { icon: Flame, text: formatCalories(w.calories) },
    w.points != null && { icon: Star, text: `${formatPoints(w.points)} pts` },
    w.steps != null && { icon: Footprints, text: `${w.steps.toLocaleString('pt-BR')} passos` },
    w.activity_type && { icon: Activity, text: w.activity_type },
  ].filter((x): x is { icon: typeof Timer; text: string } => !!x)
  if (items.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((m) => (
        <li key={m.text}>
          <Badge icon={m.icon}>{m.text}</Badge>
        </li>
      ))}
    </ul>
  )
}

function CommentsSkeleton() {
  return (
    <SkeletonGroup label="Carregando comentários" className="flex flex-col gap-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex gap-3">
          <Circle className="h-8 w-8" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <Bar className="h-3 w-32" />
            <Bar className="h-3.5 w-4/5" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  )
}

function Comments({ w }: { w: Workout }) {
  const q = useWorkoutComments(w.id)
  const count = q.data?.length ?? w.comment_count ?? 0
  return (
    // No desktop a seção ocupa o resto da coluna e só a lista rola (ver Detail).
    <section className="flex flex-col gap-4 border-t border-[var(--hairline)] pt-5 md:min-h-48 md:flex-1">
      <h3 className="flex shrink-0 items-center gap-2 font-heading text-base font-medium tracking-tight text-[var(--ink)]">
        <MessageCircle size={16} strokeWidth={1.75} className="text-[var(--ink-muted)]" />
        {`Comentários (${count})`}
      </h3>
      {q.isPending ? (
        <CommentsSkeleton />
      ) : q.isError ? (
        // Proxy do GymRats pode cair (502/503): o resto do modal continua de pé.
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--wash)] px-4 py-3">
          <p className="text-sm text-[var(--ink-muted)]">Comentários indisponíveis no momento</p>
          <Button size="sm" icon={RotateCw} onClick={() => q.refetch()}>
            Tentar de novo
          </Button>
        </div>
      ) : q.data.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">Nenhum comentário ainda</p>
      ) : (
        <ul className="flex flex-col gap-4 md:min-h-0 md:flex-1 md:overflow-y-auto md:overflow-x-hidden md:pr-2">
          {q.data.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar url={c.account.profile_picture_url} name={c.account.full_name} size="sm" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium text-[var(--ink)]">{c.account.full_name ?? 'Sem nome'}</span>
                  <time className="text-xs text-[var(--ink-muted)]">{formatCommentTime(c.created_at)}</time>
                </div>
                {c.content && (
                  <p className="whitespace-pre-line break-words text-sm leading-relaxed text-[var(--ink)]">{c.content}</p>
                )}
                <ReactionPills reactions={c.reactions} size="sm" label="Reações ao comentário" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Detail({ w, challengeId }: { w: Workout; challengeId: number }) {
  const media = mediaOf(w)
  return (
    <div className={`grid gap-6 ${media.length > 0 ? 'md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]' : ''}`}>
      {media.length > 0 && <MediaGallery media={media} />}
      {/* Com galeria, a coluna fica absoluta no desktop: a altura da linha vem só
          da foto, e comentários longos rolam dentro da coluna em vez de esticar
          o modal inteiro. */}
      <div className={`min-w-0 ${media.length > 0 ? 'md:relative' : ''}`}>
        <div
          className={`flex min-w-0 flex-col gap-5 ${media.length > 0 ? 'md:absolute md:inset-0 md:overflow-y-auto md:overflow-x-hidden' : ''}`}
        >
          {w.account.id != null ? (
            <Link
              to={`/c/${challengeId}/m/${w.account.id}`}
              className="flex items-center gap-3 self-start rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-[var(--wash)]"
            >
              <Avatar url={w.account.profile_picture_url} name={w.account.full_name} size="md" />
              <span className="font-medium text-[var(--ink)]">{w.account.full_name ?? 'Sem nome'}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar url={w.account.profile_picture_url} name={w.account.full_name} size="md" />
              <span className="font-medium text-[var(--ink)]">{w.account.full_name ?? 'Sem nome'}</span>
            </div>
          )}
          {w.description && (
            <p className="whitespace-pre-line break-words text-[15px] leading-relaxed text-[var(--ink)]">{w.description}</p>
          )}
          <Metrics w={w} />
          <ReactionPills reactions={w.reactions} />
          <Comments w={w} />
        </div>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <SkeletonGroup label="Carregando check-in" className="grid gap-6 md:grid-cols-2">
      <div aria-hidden className="aspect-[4/5] rounded-[1.25rem] bg-[var(--wash)]" />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Circle className="h-10 w-10" />
          <Bar className="h-4 w-32" />
        </div>
        <Bar className="h-3.5 w-full" />
        <Bar className="h-3.5 w-3/4" />
      </div>
    </SkeletonGroup>
  )
}

/**
 * Modal de detalhe guiado por ?checkin=<id>. Usa o item já carregado no feed;
 * se não estiver nas páginas, busca o check-in sozinho.
 */
interface DialogProps {
  items: Workout[]
  /** false enquanto a primeira página carrega: evita buscar sozinho um item que já vem nela. */
  ready: boolean
  challengeId: number
}

export function WorkoutDetailDialog({ items, ready, challengeId }: DialogProps) {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const raw = params.get(CHECKIN_PARAM)
  const id = raw && /^\d+$/.test(raw) ? Number(raw) : null
  const loaded = id != null ? items.find((w) => w.id === id) : undefined
  const single = useWorkout(id ?? 0, { enabled: ready && id != null && !loaded })
  const workout = loaded ?? single.data

  function close() {
    // Aberto pelo card: voltar no histórico fecha e mantém o botão voltar coerente.
    if ((location.state as { checkin?: boolean } | null)?.checkin) navigate(-1)
    else
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete(CHECKIN_PARAM)
          return next
        },
        { replace: true },
      )
  }

  const missing = raw != null && (id == null || (single.error instanceof ApiError && single.error.status === 404))
  useEffect(() => {
    if (missing) close()
    // close muda a cada render; só a transição para "inexistente" importa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missing])

  if (id == null || missing || (!ready && !loaded)) return null

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && close()}
      size="xl"
      eyebrow={workout ? formatDateTime(workout.occurred_at) : undefined}
      title={workout ? workout.title || workout.activity_type || 'Check-in' : 'Carregando check-in…'}
    >
      {workout ? (
        <Detail w={workout} challengeId={challengeId} />
      ) : single.isError ? (
        <p className="text-sm text-[var(--ink-muted)]">Não foi possível carregar este check-in.</p>
      ) : (
        <DetailSkeleton />
      )}
    </Dialog>
  )
}
