import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API, stats } from '../test/fixtures'
import { renderApp } from '../test/render'
import { server } from '../test/server'

describe('StatsTab', () => {
  it('shows totals and chart sections', async () => {
    renderApp('/c/1?tab=stats')
    expect(await screen.findByLabelText('Check-ins: 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Membros ativos: 2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Check-ins por dia' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Check-ins por membro' })).toBeInTheDocument()
  })

  it('shows empty state when there are no workouts', async () => {
    server.use(
      http.get(`${API}/challenges/:id/stats`, () =>
        HttpResponse.json({ ...stats, total_workouts: 0, members: 0, by_day: [], by_member: [] }),
      ),
    )
    renderApp('/c/1?tab=stats')
    expect(await screen.findByText('Nenhum check-in ainda')).toBeInTheDocument()
  })
})
