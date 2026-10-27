export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Ativo</span>
  ) : (
    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">Encerrado</span>
  )
}
