import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API, challenge } from '../test/fixtures'
import { renderApp } from '../test/render'
import { server } from '../test/server'

describe('ChallengesPage', () => {
  it('lists challenges with status, period and member count', async () => {
    renderApp('/')
    const current = (await screen.findByText('Desafio Outubro')).closest('a')!
    expect(current).toHaveAttribute('href', '/c/1')
    expect(within(current).getByText('Ativo')).toBeInTheDocument()
    expect(within(current).getByText('01/10/2026 – 31/12/2099')).toBeInTheDocument()
    expect(within(current).getByText('2 membros')).toBeInTheDocument()

    const old = screen.getByText('Desafio Antigo').closest('a')!
    expect(within(old).getByText('Encerrado')).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    server.use(http.get(`${API}/challenges`, () => HttpResponse.json([])))
    renderApp('/')
    expect(await screen.findByText('Nenhum desafio sincronizado ainda')).toBeInTheDocument()
  })

  it('shows 401 message', async () => {
    server.use(
      http.get(`${API}/challenges`, () => HttpResponse.json({ detail: 'x' }, { status: 401 })),
    )
    renderApp('/')
    expect(await screen.findByText('API key inválida ou ausente no build')).toBeInTheDocument()
  })

  it('retries after server error', async () => {
    let calls = 0
    server.use(
      http.get(`${API}/challenges`, () => {
        calls += 1
        return calls === 1
          ? HttpResponse.json({ detail: 'x' }, { status: 500 })
          : HttpResponse.json([challenge])
      }),
    )
    renderApp('/')
    await userEvent.click(await screen.findByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByText('Desafio Outubro')).toBeInTheDocument()
  })
})
