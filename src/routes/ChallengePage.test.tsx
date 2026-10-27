import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API } from '../test/fixtures'
import { renderApp } from '../test/render'
import { server } from '../test/server'

describe('ChallengePage', () => {
  it('shows header and ranking tab by default', async () => {
    renderApp('/c/1')
    expect(await screen.findByRole('heading', { name: 'Desafio Outubro' })).toBeInTheDocument()
    expect(screen.getByText('Treinar todo dia')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Ranking' })).toHaveAttribute('aria-selected', 'true')

    const ana = await screen.findByRole('link', { name: /Ana Souza/ })
    expect(ana).toHaveAttribute('href', '/c/1/m/11')
    expect(ana).toHaveTextContent('1º')
    expect(ana).toHaveTextContent('10')
  })

  it('shows not found for unknown challenge', async () => {
    renderApp('/c/999')
    expect(await screen.findByText('Desafio não encontrado')).toBeInTheDocument()
  })

  it('shows not found for non-numeric id without calling the API', async () => {
    let called = false
    server.use(
      http.get(`${API}/challenges/:id`, () => {
        called = true
        return HttpResponse.json({})
      }),
    )
    renderApp('/c/abc')
    expect(await screen.findByText('Desafio não encontrado')).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('shows empty ranking', async () => {
    server.use(http.get(`${API}/challenges/:id/rankings`, () => HttpResponse.json([])))
    renderApp('/c/1')
    expect(await screen.findByText('Ranking vazio')).toBeInTheDocument()
  })

  it('switches tabs via the tab bar', async () => {
    renderApp('/c/1')
    await userEvent.click(await screen.findByRole('tab', { name: 'Gráficos' }))
    expect(screen.getByRole('tab', { name: 'Gráficos' })).toHaveAttribute('aria-selected', 'true')
  })
})
