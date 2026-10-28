import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

// jsdom não tem matchMedia: sem a API, trata como "sem animação".
const snapshot = () => (typeof window === 'undefined' || !window.matchMedia ? true : window.matchMedia(QUERY).matches)

/** true quando o sistema pede menos movimento: desliga a animação de entrada do Recharts. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => true)
}
