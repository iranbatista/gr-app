import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Page } from '../lib/paginate'
import { icon } from '../lib/ui'

const button =
  'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--card)] text-[var(--ink-muted)] transition-colors hover:bg-[var(--tint)] hover:text-[var(--brand-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--card)] disabled:hover:text-[var(--ink-muted)]'

interface Props {
  page: Page<unknown>
  onChange: (page: number) => void
}

/** Pills de anterior/próxima com o intervalo no meio. Some quando tudo cabe numa página. */
export function Pager({ page, onChange }: Props) {
  if (page.pages <= 1) return null
  return (
    <div className="flex items-center justify-end gap-3">
      <span className="text-[0.8125rem] tabular-nums text-[var(--ink-muted)]">
        {page.from}–{page.to} de {page.total}
      </span>
      <div className="flex gap-1.5">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={page.page <= 1}
          onClick={() => onChange(page.page - 1)}
          className={button}
        >
          <ChevronLeft {...icon} />
        </button>
        <button
          type="button"
          aria-label="Próxima página"
          disabled={page.page >= page.pages}
          onClick={() => onChange(page.page + 1)}
          className={button}
        >
          <ChevronRight {...icon} />
        </button>
      </div>
    </div>
  )
}
