import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from './test/render'

describe('App shell', () => {
  it('shows last sync time in footer', async () => {
    renderApp('/')
    expect(await screen.findByText('Atualizado há 12 min')).toBeInTheDocument()
  })

  it('warns when API key is missing from build', () => {
    vi.stubEnv('VITE_GYMRATS_KEY', '')
    renderApp('/')
    expect(screen.getByText(/VITE_GYMRATS_KEY não definida no build/)).toBeInTheDocument()
  })

  it('does not warn when key is present', () => {
    renderApp('/')
    expect(screen.queryByText(/VITE_GYMRATS_KEY não definida/)).not.toBeInTheDocument()
  })
})
