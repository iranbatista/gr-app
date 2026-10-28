import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API, challenge, oldChallenge } from '../test/fixtures'
import { renderApp } from '../test/render'
import { server } from '../test/server'

describe('hidden challenges', () => {
  it('leaves hidden challenges out of the list', async () => {
    server.use(
      http.get(`${API}/challenges`, () =>
        HttpResponse.json([challenge, { ...challenge, id: 1725433, name: 'os piorais ' }]),
      ),
    )
    renderApp('/')
    expect(await screen.findByText('Desafio Outubro')).toBeInTheDocument()
    expect(screen.queryByText(/os piorais/)).not.toBeInTheDocument()
  })

  it('treats a hidden challenge link as not found', async () => {
    server.use(
      http.get(`${API}/challenges/:id`, () => HttpResponse.json({ ...challenge, id: 681232, name: 'Ratos 2025' })),
    )
    renderApp('/c/681232')
    expect(await screen.findByText('Desafio não encontrado')).toBeInTheDocument()
    expect(screen.queryByText('Ratos 2025')).not.toBeInTheDocument()
  })
})

describe('ChallengesPage', () => {
  it('lists challenges with status, period and member count', async () => {
    renderApp('/')
    const current = (await screen.findByText('Desafio Outubro')).closest('a')!
    expect(current).toHaveAttribute('href', '/c/1')
    expect(within(current).getByText('Ativo')).toBeInTheDocument()
    expect(within(current).getByText('01/10/2026 – 31/12/2099')).toBeInTheDocument()
    expect(within(current).getByText('2 membros')).toBeInTheDocument()

    // a lista abre em "Ativos": o encerrado só aparece no outro filtro
    expect(screen.queryByText('Desafio Antigo')).not.toBeInTheDocument()
  })

  it('filters by status with counts, defaulting to active', async () => {
    renderApp('/')
    const group = await screen.findByRole('group', { name: 'Status dos desafios' })
    const ativos = within(group).getByRole('button', { name: /Ativos/ })
    const encerrados = within(group).getByRole('button', { name: /Encerrados/ })
    await screen.findByText('Desafio Outubro')
    expect(ativos).toHaveAttribute('aria-pressed', 'true')
    expect(ativos).toHaveTextContent('1')
    expect(encerrados).toHaveTextContent('1')

    await userEvent.click(encerrados)
    expect(encerrados).toHaveAttribute('aria-pressed', 'true')
    const old = (await screen.findByText('Desafio Antigo')).closest('a')!
    expect(within(old).getByText('Encerrado')).toBeInTheDocument()
    expect(screen.queryByText('Desafio Outubro')).not.toBeInTheDocument()
  })

  it('starts on ended challenges from the URL', async () => {
    renderApp('/?status=encerrados')
    expect(await screen.findByText('Desafio Antigo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Encerrados/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('Desafio Outubro')).not.toBeInTheDocument()
  })

  it('shows empty message when no challenge is active', async () => {
    server.use(http.get(`${API}/challenges`, () => HttpResponse.json([oldChallenge])))
    renderApp('/')
    expect(await screen.findByText('Nenhum desafio ativo no momento')).toBeInTheDocument()
  })

  it('shows empty message when no challenge has ended', async () => {
    server.use(http.get(`${API}/challenges`, () => HttpResponse.json([challenge])))
    renderApp('/?status=encerrados')
    expect(await screen.findByText('Nenhum desafio encerrado ainda')).toBeInTheDocument()
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

  it('links to the comparison page', async () => {
    renderApp('/')
    expect(await screen.findByRole('link', { name: 'Comparar' })).toHaveAttribute('href', '/comparar')
  })
})
