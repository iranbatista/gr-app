import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { API, makeWorkout } from '../test/fixtures'
import { workoutsHandler } from '../test/handlers'
import { renderApp } from '../test/render'
import { server } from '../test/server'

describe('FeedTab', () => {
  it('lists workouts with member and metrics', async () => {
    renderApp('/c/1?tab=feed')
    const cards = await screen.findAllByRole('article')
    expect(cards).toHaveLength(3)
    const first = screen.getByText('Corrida').closest('article')!
    expect(within(first).getByText('Ana Souza')).toBeInTheDocument()
    const metrics = within(first).getAllByRole('listitem').map((li) => li.textContent)
    expect(metrics).toEqual(['1h 20min', '5,2 km', '400 kcal', '1 pts'])
  })

  it('filters by member from the URL', async () => {
    renderApp('/c/1?tab=feed&member=12')
    await screen.findByText('Bike')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(await screen.findByRole('combobox', { name: 'Membro' })).toHaveTextContent('Bruno Lima')
  })

  it('changes member filter via the select', async () => {
    renderApp('/c/1?tab=feed')
    await screen.findAllByRole('article')
    await userEvent.click(screen.getByRole('combobox', { name: 'Membro' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Bruno Lima' }))
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(screen.getByText('Bike')).toBeInTheDocument()
  })

  it('applies a date as soon as it is picked', async () => {
    renderApp('/c/1?tab=feed')
    await screen.findAllByRole('article')
    expect(screen.queryByRole('button', { name: 'Limpar' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Desde' }))
    await userEvent.click(within(await screen.findByRole('grid')).getByRole('button', { name: /\b20\b/ }))
    expect(screen.getByRole('button', { name: 'Desde' })).toHaveTextContent(/^20\/\d{2}\/\d{4}$/)
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument()
  })

  it('clears every filter with Limpar', async () => {
    renderApp('/c/1?tab=feed&member=12&since=2026-10-01')
    await screen.findByText('Bike')
    await userEvent.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(await screen.findAllByRole('article')).toHaveLength(3)
    expect(screen.getByRole('combobox', { name: 'Membro' })).toHaveTextContent('Todos')
    expect(screen.getByRole('button', { name: 'Desde' })).toHaveTextContent('dd/mm/aaaa')
    expect(screen.queryByRole('button', { name: 'Limpar' })).not.toBeInTheDocument()
  })

  it('loads more pages', async () => {
    const many = Array.from({ length: 35 }, (_, i) => makeWorkout({ id: 1000 + i, title: `Treino ${i}` }))
    server.use(workoutsHandler(many))
    renderApp('/c/1?tab=feed')
    expect(await screen.findAllByRole('article')).toHaveLength(30)
    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
    expect(await screen.findByText('Treino 34')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(35)
    expect(screen.queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument()
  })

  it('dedupes workouts repeated across pages', async () => {
    const mk = (ids: number[]) => ids.map((id) => makeWorkout({ id, title: `Treino ${id}` }))
    server.use(
      http.get(`${API}/challenges/:id/workouts`, ({ request }) => {
        const offset = Number(new URL(request.url).searchParams.get('offset') ?? 0)
        const items = offset === 0 ? mk([1, 2, 3]) : mk([3, 4])
        return HttpResponse.json({ items, total: 5, limit: 3, offset })
      }),
    )
    renderApp('/c/1?tab=feed')
    await screen.findAllByRole('article')
    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
    expect(await screen.findByText('Treino 4')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })

  it('shows empty state', async () => {
    server.use(workoutsHandler([]))
    renderApp('/c/1?tab=feed')
    expect(await screen.findByText('Nenhum check-in ainda')).toBeInTheDocument()
  })

  it('shows a filter-specific empty state', async () => {
    server.use(workoutsHandler([]))
    renderApp('/c/1?tab=feed&since=2026-10-01')
    expect(await screen.findByText('Nenhum check-in para esses filtros')).toBeInTheDocument()
  })

  it('ignores a non-numeric member param', async () => {
    renderApp('/c/1?tab=feed&member=abc')
    expect(await screen.findAllByRole('article')).toHaveLength(3)
  })

  afterEach(() => vi.useRealTimers())

  it('groups workouts by day, newest first', async () => {
    // só o Date é falso: MSW e react-query seguem com timers reais
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-27T12:00:00') })
    renderApp('/c/1?tab=feed')
    await screen.findAllByRole('article')
    const headings = screen.getAllByRole('heading', { level: 3, name: /^(\d{2}\/\d{2}|Hoje|Ontem|Sem data)$/ })
    expect(headings.map((h) => h.textContent)).toEqual(['21/10', '20/10'])
    const day20 = headings[1].closest('section')!
    expect(within(day20).getAllByRole('article')).toHaveLength(2)
  })

  it('puts workouts without date in a final group', async () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-27T12:00:00') })
    server.use(
      workoutsHandler([makeWorkout({ id: 1, title: 'Sem hora', occurred_at: null }), makeWorkout({ id: 2, title: 'Corrida' })]),
    )
    renderApp('/c/1?tab=feed')
    await screen.findByText('Sem hora')
    const headings = screen.getAllByRole('heading', { level: 3, name: /^(\d{2}\/\d{2}|Hoje|Ontem|Sem data)$/ })
    expect(headings.map((h) => h.textContent)).toEqual(['20/10', 'Sem data'])
  })
})
