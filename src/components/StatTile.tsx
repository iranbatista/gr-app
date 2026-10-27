export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div aria-label={`${label}: ${value}`} className="surface flex flex-col gap-2 p-5">
      <div className="eyebrow">{label}</div>
      <div className="font-heading text-[1.75rem] font-semibold leading-none tracking-tight text-[var(--ink)] tabular-nums">
        {value}
      </div>
    </div>
  )
}
