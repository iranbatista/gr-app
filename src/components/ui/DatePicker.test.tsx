import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DatePicker } from './DatePicker'

describe('DatePicker', () => {
  it('is named by its label and shows the value as dd/mm/aaaa', () => {
    render(<DatePicker label="Desde" value="2026-10-01" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Desde' })).toHaveTextContent('01/10/2026')
  })

  it('picks a day as YYYY-MM-DD', async () => {
    const onChange = vi.fn()
    render(<DatePicker label="Desde" value="2026-10-01" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Desde' }))
    const grid = await screen.findByRole('grid')
    await userEvent.click(within(grid).getByRole('button', { name: /15/ }))
    expect(onChange).toHaveBeenCalledWith('2026-10-15')
  })

  it('clears with Limpar', async () => {
    const onChange = vi.fn()
    render(<DatePicker label="Até" value="2026-10-01" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Até' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Limpar' }))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('disables days before min', async () => {
    render(<DatePicker label="Até" value="2026-10-20" min="2026-10-10" onChange={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Até' }))
    const grid = await screen.findByRole('grid')
    expect(within(grid).getByRole('button', { name: /\b5\b/ })).toBeDisabled()
  })
})
