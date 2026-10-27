export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div aria-label={`${label}: ${value}`} className="rounded-lg border bg-white p-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}
