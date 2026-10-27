import { apiKey } from '../api/client'

export function KeyBanner() {
  if (apiKey()) return null
  return (
    <div role="alert" className="bg-red-600 px-4 py-2 text-center text-sm text-white">
      VITE_GYMRATS_KEY não definida no build: as chamadas à API vão falhar com 401.
    </div>
  )
}
