import { useState } from 'react'
import { initials } from '../lib/visual'

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-20 w-20 text-2xl',
}

interface Props {
  url?: string | null
  name?: string | null
  size?: keyof typeof SIZES
}

export function Avatar({ url, name, size = 'md' }: Props) {
  const [failed, setFailed] = useState(false)
  const base = `${SIZES[size]} shrink-0 rounded-full`
  if (url && !failed) {
    return <img src={url} alt="" onError={() => setFailed(true)} className={`${base} object-cover`} />
  }
  return (
    <div aria-hidden className={`${base} flex items-center justify-center bg-gray-300 font-semibold text-gray-700`}>
      {initials(name)}
    </div>
  )
}
