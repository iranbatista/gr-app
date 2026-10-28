import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HeatGrid } from './HeatGrid'
import { TooltipProvider } from './ui/Tooltip'

const cell = (count: number, label: string, highlight = false) => ({ count, level: (count > 0 ? 2 : 0) as 0 | 2, label, highlight })

function renderGrid(current?: 'date' | 'time') {
  const columns = [
    [cell(2, 'Seg 0h · 2 check-ins'), ...Array.from({ length: 6 }, (_, i) => cell(0, `col0-${i + 1}`))],
    [null, cell(5, 'Ter 1h · 5 check-ins', true), ...Array.from({ length: 5 }, (_, i) => cell(0, `col1-${i + 2}`))],
  ]
  return render(
    <TooltipProvider delayDuration={0}>
      <HeatGrid columns={columns} headers={[{ column: 0, label: '0h' }]} current={current} />
    </TooltipProvider>,
  )
}

describe('HeatGrid', () => {
  it('labels rows Seg..Dom, columns from headers, and shows the legend', () => {
    renderGrid()
    for (const d of ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']) expect(screen.getByText(d)).toBeInTheDocument()
    expect(screen.getByText('0h')).toBeInTheDocument()
    expect(screen.getByText('Menos')).toBeInTheDocument()
    expect(screen.getByText('Mais')).toBeInTheDocument()
    // null fica fora da grade: 7 + 6 células
    expect(screen.getAllByRole('img')).toHaveLength(13)
  })

  it('marks the highlighted cell as current and rings it', () => {
    renderGrid('time')
    const now = screen.getByRole('img', { name: 'Ter 1h · 5 check-ins' })
    expect(now).toHaveAttribute('aria-current', 'time')
    expect(now.firstElementChild).toHaveClass('ring-2')
    expect(screen.getByRole('img', { name: 'Seg 0h · 2 check-ins' })).not.toHaveAttribute('aria-current')
  })

  it('shows the cell label in a tooltip', async () => {
    renderGrid()
    await userEvent.hover(screen.getByRole('img', { name: 'Seg 0h · 2 check-ins' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Seg 0h · 2 check-ins')
  })
})
