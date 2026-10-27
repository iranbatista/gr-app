import { RefreshCw } from 'lucide-react'
import { useSync } from '../api/queries'
import { formatRelative } from '../lib/format'

export function SyncFooter() {
  const { data } = useSync()
  return (
    <footer className="flex min-h-16 items-center justify-center gap-1.5 px-6 pb-10 pt-6 text-xs text-[var(--ink-muted)]">
      {data && <RefreshCw size={12} strokeWidth={1.75} />}
      {data ? `Atualizado ${formatRelative(data.last_synced_at)}` : ' '}
    </footer>
  )
}
