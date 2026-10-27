import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API, makeWorkout } from '../test/fixtures'
import { workoutsHandler } from '../test/handlers'
import { renderApp } from '../test/render'
import { server } from '../test/server'

describe('FeedTab', () => {
  it('lists workouts with member and metrics', async () => {
    renderApp('/c/1?tab=feed')
    const cards = await screen.findAllByRole('article')
    expect(cards).toHaveLength(3)
    const first = cards[0]
    expect(within(first).getByText('Corrida')).toBeInTheDocument()
    expect(within(first).getByText('Ana Souza')).toBeInTheDocument()
    expect(within(first).getByText('1h 20min · 5,2 km · 400 kcal · 1 pts')).toBeInTheDocument()
  })

  it('filters by member from the URL', async () => {
    renderApp('/c/1?tab=feed&member=12')
    await screen.findByText('Bike')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByLabelText('Membro')).toHaveValue('12')
  })

  it('changes member filter via select', async () => {
    renderApp('/c/1?tab=feed')
    await screen.findAllByRole('article')
    await screen.findByRole('option', { name: 'Bruno Lima' })
    await userEvent.selectOptions(screen.getByLabelText('Membro'), '12')
    expect(await screen.findByText('Bike')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(1)
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
})
