import { KeyRound } from 'lucide-react'
import { icon } from '../lib/ui'
import { apiKey } from '../api/client'

export function KeyBanner() {
  if (apiKey()) return null
  return (
    <div
      role="alert"
      className="flex items-center justify-center gap-2 border-b border-[var(--danger-hairline)] bg-[var(--danger-tint)] px-6 py-2.5 text-center text-sm font-medium text-[var(--danger)]"
    >
      <KeyRound {...icon} className="shrink-0" />
      VITE_GYMRATS_KEY não definida no build: as chamadas à API vão falhar com 401.
    </div>
  )
}
