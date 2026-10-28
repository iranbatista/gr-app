import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    expect(screen.getByRole('heading', { name: 'Check-ins por semana' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Check-ins por membro' })).toBeInTheDocument()
    // 2 membros cabem numa página: sem paginação
    expect(screen.queryByRole('button', { name: 'Próxima página' })).not.toBeInTheDocument()
  })

  it('paginates the member chart 10 at a time', async () => {
    const by_member = Array.from({ length: 12 }, (_, i) => ({
      account_id: i + 1,
      name: `Membro ${i + 1}`,
      workouts: 12 - i,
      points: 0,
      calories: 0,
      distance: 0,
    }))
    server.use(http.get(`${API}/challenges/:id/stats`, () => HttpResponse.json({ ...stats, by_member })))
    renderApp('/c/1?tab=stats')
    expect(await screen.findByText('1–10 de 12')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(screen.getByText('11–12 de 12')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled()
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

  it('switches the member chart to active days and back to page 1', async () => {
    const by_member = Array.from({ length: 12 }, (_, i) => ({
      account_id: i + 1,
      name: `Membro ${i + 1}`,
      workouts: 12 - i,
      active_days: i + 1,
      points: 0,
      calories: 0,
      distance: 0,
    }))
    server.use(http.get(`${API}/challenges/:id/stats`, () => HttpResponse.json({ ...stats, by_member })))
    renderApp('/c/1?tab=stats')
    const metric = await screen.findByRole('group', { name: 'Métrica' })
    expect(within(metric).getByRole('button', { name: 'Check-ins' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(screen.getByText('11–12 de 12')).toBeInTheDocument()
    await userEvent.click(within(metric).getByRole('button', { name: 'Dias ativos' }))
    expect(within(metric).getByRole('button', { name: 'Dias ativos' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('1–10 de 12')).toBeInTheDocument()
  })

  it('starts on active days from the URL', async () => {
    renderApp('/c/1?tab=stats&metric=dias')
    const metric = await screen.findByRole('group', { name: 'Métrica' })
    expect(within(metric).getByRole('button', { name: 'Dias ativos' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('disables active days while the API does not send it', async () => {
    const by_member = stats.by_member.map((m) => ({ ...m, active_days: undefined }))
    server.use(http.get(`${API}/challenges/:id/stats`, () => HttpResponse.json({ ...stats, by_member })))
    renderApp('/c/1?tab=stats&metric=dias')
    const metric = await screen.findByRole('group', { name: 'Métrica' })
    expect(within(metric).getByRole('button', { name: 'Dias ativos' })).toBeDisabled()
    // sem o dado, cai para check-ins em vez de mostrar zeros
    expect(within(metric).getByRole('button', { name: 'Check-ins' })).toHaveAttribute('aria-pressed', 'true')
  })
})
