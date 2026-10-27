import { useState } from 'react'
import { gradientFor } from '../lib/visual'

interface Props {
  url?: string | null
  name?: string | null
  className?: string
}

export function Cover({ url, name, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  if (url && !failed) {
    return <img src={url} alt="" onError={() => setFailed(true)} className={`bg-[var(--wash)] object-cover ${className}`} />
  }
  return <div aria-hidden className={className} style={{ background: gradientFor(name ?? '') }} />
}
