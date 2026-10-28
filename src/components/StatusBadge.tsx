import { Badge } from './ui/Badge'

export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge tone="tint">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--brand-from)]" />
      Ativo
    </Badge>
  ) : (
    <Badge tone="wash" className="border-[var(--hairline)]">
      Encerrado
    </Badge>
  )
}
