import { gradientFor } from '../lib/visual'
import { thumbUrl } from '../lib/thumb'
import { useImgFallback } from '../lib/useImgFallback'

interface Props {
  url?: string | null
  name?: string | null
  className?: string
  /** Largura CSS aproximada, para escolher a miniatura (card ~400, banner ~1000). */
  cssPx?: number
}

export function Cover({ url, name, className = '', cssPx = 400 }: Props) {
  const { src, onError } = useImgFallback([thumbUrl(url, cssPx), url])
  if (src) {
    return <img src={src} alt="" decoding="async" onError={onError} className={`bg-[var(--wash)] object-cover ${className}`} />
  }
  return <div aria-hidden className={className} style={{ background: gradientFor(name ?? '') }} />
}
