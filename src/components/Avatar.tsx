import { useState } from 'react'
import { initials } from '../lib/visual'

const SIZES = {
  xs: 'h-6 w-6 text-[0.625rem]',
  sm: 'h-7 w-7 text-[0.6875rem]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-24 w-24 text-[1.75rem]',
}

interface Props {
  url?: string | null
  name?: string | null
  size?: keyof typeof SIZES
  /** Aro de marca de 2px em volta da foto (pódio, perfil). */
  ring?: boolean
}

export function Avatar({ url, name, size = 'md', ring = false }: Props) {
  const [failed, setFailed] = useState(false)
  const base = `${SIZES[size]} shrink-0 rounded-full`
  const inner =
    url && !failed ? (
      <img src={url} alt="" onError={() => setFailed(true)} className={`${base} bg-[var(--wash)] object-cover`} />
    ) : (
      // Sem foto: iniciais em tinta de marca sobre o bege.
      <div
        aria-hidden
        className={`${base} flex items-center justify-center bg-[var(--tint)] font-semibold tracking-tight text-[var(--brand-ink)]`}
      >
        {initials(name)}
      </div>
    )
  if (!ring) return inner
  return (
    <div className="brand-ring shrink-0">
      {/* Fresta da cor do card entre o aro e a foto. */}
      <div className="rounded-full bg-[var(--card)] p-[2px]">{inner}</div>
    </div>
  )
}
