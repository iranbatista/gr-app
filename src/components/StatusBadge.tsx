export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--brand-from)]/35 bg-[var(--tint)] px-3 py-0.5 text-xs font-semibold text-[var(--brand-ink)]">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--brand-from)]" />
      Ativo
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center rounded-full border border-[var(--hairline)] bg-[var(--wash)] px-3 py-0.5 text-xs font-medium text-[var(--ink-muted)]">
      Encerrado
    </span>
  )
}
