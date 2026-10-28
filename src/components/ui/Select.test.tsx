import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

const options = [
  { value: '', label: 'Todos' },
  { value: '11', label: 'Ana Souza' },
  { value: '12', label: 'Bruno Lima' },
]

describe('Select', () => {
  it('is named by its label and reports the picked value', async () => {
    const onValueChange = vi.fn()
    render(<Select label="Membro" value="" onValueChange={onValueChange} options={options} />)
    const trigger = screen.getByRole('combobox', { name: 'Membro' })
    expect(trigger).toHaveTextContent('Todos')
    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole('option', { name: 'Bruno Lima' }))
    expect(onValueChange).toHaveBeenCalledWith('12')
  })

  it('maps the empty option back to an empty string', async () => {
    const onValueChange = vi.fn()
    render(<Select label="Membro" value="12" onValueChange={onValueChange} options={options} />)
    await userEvent.click(screen.getByRole('combobox', { name: 'Membro' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Todos' }))
    expect(onValueChange).toHaveBeenCalledWith('')
  })
})
