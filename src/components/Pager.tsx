import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Page } from '../lib/paginate'
import { Button } from './ui/Button'

interface Props {
  page: Page<unknown>
  onChange: (page: number) => void
}

/** Pills de anterior/próxima com o intervalo ao lado. Some quando tudo cabe numa página. */
export function Pager({ page, onChange }: Props) {
  if (page.pages <= 1) return null
  return (
    <div className="flex items-center justify-end gap-3">
      <span className="text-[0.8125rem] tabular-nums text-[var(--ink-muted)]">
        {page.from}–{page.to} de {page.total}
      </span>
      <div className="flex gap-1.5">
        <Button
          size="icon"
          icon={ChevronLeft}
          aria-label="Página anterior"
          disabled={page.page <= 1}
          onClick={() => onChange(page.page - 1)}
        />
        <Button
          size="icon"
          icon={ChevronRight}
          aria-label="Próxima página"
          disabled={page.page >= page.pages}
          onClick={() => onChange(page.page + 1)}
        />
      </div>
    </div>
  )
}
