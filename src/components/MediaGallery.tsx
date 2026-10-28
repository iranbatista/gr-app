import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { WorkoutMedium } from '../api/types'
import { isVideo } from '../lib/media'
import { thumbUrl } from '../lib/thumb'
import { useImgFallback } from '../lib/useImgFallback'
import { Button } from './ui/Button'

/** Visor principal + miniaturas. Setas do teclado navegam enquanto está na tela. */
export function MediaGallery({ media }: { media: WorkoutMedium[] }) {
  // Mídia que falhou ao carregar sai da lista (URL expirada, arquivo apagado).
  const [failed, setFailed] = useState<Set<number>>(new Set())
  const [index, setIndex] = useState(0)
  const items = media.filter((m) => !failed.has(m.id))
  const current = Math.min(index, Math.max(0, items.length - 1))

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, items.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items.length])

  if (items.length === 0) return null
  const m = items[current]
  const fail = (id: number) => setFailed((s) => new Set(s).add(id))
  // Proporção real da mídia evita pulo de layout enquanto carrega.
  const ratio = m.aspect_ratio ?? (m.width && m.height ? m.width / m.height : undefined)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex items-center justify-center overflow-hidden rounded-[1.25rem] bg-[var(--wash)]">
        {isVideo(m) ? (
          <video
            key={m.id}
            src={m.url}
            poster={m.thumbnail_url ?? undefined}
            controls
            playsInline
            preload="metadata"
            onError={() => fail(m.id)}
            className="max-h-[70vh] w-full object-contain md:max-h-[calc(88vh-15rem)]"
            style={{ aspectRatio: ratio }}
          />
        ) : (
          <img
            key={m.id}
            src={m.url}
            alt=""
            loading="lazy"
            onError={() => fail(m.id)}
            className="max-h-[70vh] w-full object-contain md:max-h-[calc(88vh-15rem)]"
            style={{ aspectRatio: ratio }}
          />
        )}
        {items.length > 1 && (
          <>
            <span className="absolute right-3 top-3 rounded-full bg-[rgba(20,18,17,0.55)] px-2.5 py-0.5 text-xs font-medium tabular-nums text-white backdrop-blur">
              {current + 1}/{items.length}
            </span>
            <Button
              size="icon"
              icon={ChevronLeft}
              aria-label="Mídia anterior"
              disabled={current === 0}
              onClick={() => setIndex(current - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 shadow-sm"
            />
            <Button
              size="icon"
              icon={ChevronRight}
              aria-label="Próxima mídia"
              disabled={current === items.length - 1}
              onClick={() => setIndex(current + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 shadow-sm"
            />
          </>
        )}
      </div>
      {items.length > 1 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {items.map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-label={`Mídia ${i + 1}`}
              aria-current={i === current}
              onClick={() => setIndex(i)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity ${
                i === current ? 'border-[var(--brand-from)]' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <StripThumb src={isVideo(t) ? t.thumbnail_url : t.url} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Miniatura da tira (56px css -> 128): API primeiro, original se falhar.
function StripThumb({ src }: { src?: string | null }) {
  const img = useImgFallback([thumbUrl(src, 56), src])
  return (
    <img
      src={img.src}
      alt=""
      width={56}
      height={56}
      loading="lazy"
      decoding="async"
      onError={img.onError}
      className="h-full w-full bg-[var(--wash)] object-cover"
    />
  )
}
