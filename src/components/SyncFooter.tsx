import { useSync } from '../api/queries'
import { formatRelative } from '../lib/format'

export function SyncFooter() {
  const { data } = useSync()
  return (
    <footer className="py-6 text-center text-xs text-gray-400">
      {data ? `Sincronizado ${formatRelative(data.last_synced_at)}` : ' '}
    </footer>
  )
}
