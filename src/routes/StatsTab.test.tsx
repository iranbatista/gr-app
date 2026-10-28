import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API, bruno, challenge, insights, stats } from '../test/fixtures'
import { renderApp } from '../test/render'
import { server } from '../test/server'

// "Hoje" fixo: o fixture de insights termina em 27/10/2026.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-27T12:00:00') })
})
afterEach(() => {
  vi.useRealTimers()
})

function insightsReturns(status: number, body: unknown) {
  server.use(http.get(`${API}/challenges/:id/insights`, () => HttpResponse.json(body as object, { status })))
}

describe('StatsTab', () => {
  it('shows chart sections from /stats', async () => {
    renderApp('/c/1?tab=stats')
    expect(await screen.findByRole('heading', { name: 'Check-ins por dia' })).toBeInTheDocument()
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

describe('Dashboard (insights)', () => {
  it('shows KPIs as sentences: number plus context in words', async () => {
    renderApp('/c/1?tab=stats')
    const today = await screen.findByRole('group', { name: 'Check-ins hoje: 10' })
    expect(today).toHaveTextContent('4 a mais que ontem')
    expect(today).not.toHaveTextContent('(6)')
    expect(screen.getByRole('group', { name: 'Atletas hoje: 8/10' })).toHaveTextContent('80% do grupo')
    expect(screen.getByRole('group', { name: 'Check-ins/atleta: 12,0' })).toHaveTextContent('média do grupo')
    expect(screen.getByRole('group', { name: 'Horas treinadas: 90 h' })).toHaveTextContent('45 min por check-in')
    expect(screen.queryByText(/últimos 14 dias/)).not.toBeInTheDocument()
    // KPIs substituem os tiles antigos
    expect(screen.queryByLabelText('Check-ins: 3')).not.toBeInTheDocument()
  })

  it('orders the sections from overview to highlights', async () => {
    renderApp('/c/1?tab=stats')
    await screen.findByRole('heading', { name: 'Destaques' })
    const sections = screen.getAllByRole('heading', { level: 2 }).filter((h) => h.id.startsWith('sec-'))
    expect(sections.map((h) => h.textContent)).toEqual([
      'Visão geral',
      'Ritmo do desafio',
      'Atletas',
      'Quando o grupo treina',
      'Destaques',
    ])
  })

  it('uses the last day once the challenge ended', async () => {
    server.use(
      http.get(`${API}/challenges/:id`, () =>
        HttpResponse.json({ ...challenge, start_date: '2026-09-29', end_date: '2026-10-26' }),
      ),
    )
    renderApp('/c/1?tab=stats')
    const day = await screen.findByRole('group', { name: 'Check-ins, último dia: 6' })
    expect(day).toHaveTextContent('2 a mais que o dia anterior')
    expect(screen.getByText('Encerrado ontem')).toBeInTheDocument()
  })

  it('shows the challenge progress', async () => {
    server.use(
      http.get(`${API}/challenges/:id`, () =>
        HttpResponse.json({ ...challenge, start_date: '2026-10-01', end_date: '2026-10-28' }),
      ),
    )
    renderApp('/c/1?tab=stats')
    const bar = await screen.findByRole('progressbar', { name: 'Andamento do desafio' })
    expect(bar).toHaveAttribute('aria-valuenow', '96')
    expect(screen.getByText('Dia 27 de 28 · 96% · falta 1 dia')).toBeInTheDocument()
  })

  it('labels punch card cells and the peak hour', async () => {
    renderApp('/c/1?tab=stats')
    const peak = await screen.findByRole('img', { name: 'Ter 18h · 23 check-ins' })
    expect(screen.getByText('pico: Ter 18h · 23 check-ins')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Dom 3h · Nenhum check-in' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /^(Seg|Ter|Qua|Qui|Sex|Sáb|Dom) \d+h · / })).toHaveLength(7 * 24)
    await userEvent.hover(peak)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Ter 18h · 23 check-ins')
  })

  it('shows every period with its share, including empty ones', async () => {
    renderApp('/c/1?tab=stats')
    expect(await screen.findByLabelText('Madrugada, 0h–5h: nenhum check-in (0%)')).toBeInTheDocument()
    expect(screen.getByLabelText('Manhã, 5h–12h: 30 check-ins (25%)')).toBeInTheDocument()
    expect(screen.getByLabelText('Tarde, 12h–18h: 30 check-ins (25%)')).toBeInTheDocument()
    expect(screen.getByLabelText('Noite, 18h–24h: 60 check-ins (50%)')).toBeInTheDocument()
  })

  it('renders awards, ties and hides the ones without a winner', async () => {
    renderApp('/c/1?tab=stats')
    const awards = await screen.findByRole('list', { name: 'Prêmios' })
    const items = within(awards).getAllByRole('listitem', { name: /:/ })
    expect(items.map((i) => i.getAttribute('aria-label'))).toEqual([
      'Maior sequência: 12 dias seguidos (recorde)',
      'Maratonista: 49 h treinados no total',
      'Sem folga: 11 treinos no fim de semana',
      'Madrugador: 9 treinos antes das 7h',
      'Mais reações: 381 reações recebidas',
      'Mais comentado: 14 comentários',
      'Mais engajado: 77 reações dadas',
      'Dupla dinâmica: 23 reações trocadas',
    ])
    // empate em 12: os dois rostos, cada um levando ao perfil
    const longest = items[0]
    expect(longest).toHaveTextContent('Ana e Bruno')
    expect(within(longest).getByRole('link', { name: 'Bruno Lima' })).toHaveAttribute('href', '/c/1/m/12')
    expect(within(items[4]).getByRole('link', { name: /Bruno Lima/ })).toHaveAttribute('href', '/c/1/m/12')
    const duo = items[7]
    expect(duo).toHaveTextContent('Ana e Bruno')
    expect(within(duo).getByRole('link', { name: 'Ana' })).toHaveAttribute('href', '/c/1/m/11')
    expect(within(duo).getByRole('link', { name: 'Bruno' })).toHaveAttribute('href', '/c/1/m/12')
    const dirs = 'Ana → Bruno: 11 · Bruno → Ana: 12'
    expect(within(duo).getByLabelText(dirs)).toBeInTheDocument()
    await userEvent.hover(within(duo).getByLabelText(dirs))
    expect(await screen.findByRole('tooltip')).toHaveTextContent(dirs)
    expect(within(awards).queryByText('Coruja')).not.toBeInTheDocument()
    expect(within(awards).queryByText('Sequência atual')).not.toBeInTheDocument()
  })

  it('hides the new awards when null and shows short marathons in minutes', async () => {
    const awards = { ...insights.awards, marathoner: null, weekend: null, dynamic_duo: null }
    insightsReturns(200, { ...insights, awards })
    renderApp('/c/1?tab=stats')
    const list = await screen.findByRole('list', { name: 'Prêmios' })
    expect(within(list).queryByText('Maratonista')).not.toBeInTheDocument()
    expect(within(list).queryByText('Sem folga')).not.toBeInTheDocument()
    expect(within(list).queryByText('Dupla dinâmica')).not.toBeInTheDocument()
  })

  it('formats marathon minutes', async () => {
    insightsReturns(200, { ...insights, awards: { ...insights.awards, marathoner: { account: bruno, value: 45 } } })
    renderApp('/c/1?tab=stats')
    expect(await screen.findByRole('listitem', { name: 'Maratonista: 45 min treinados no total' })).toBeInTheDocument()
  })

  it('lists streaks in explicit record and now columns', async () => {
    renderApp('/c/1?tab=stats')
    const table = await screen.findByRole('table', { name: 'Sequências' })
    expect(within(table).getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Atleta', 'Recorde', 'Agora'])
    const [, ana, bruno, caio] = within(table).getAllByRole('row')
    // atual = recorde: "em andamento" em vez de repetir o número
    expect(ana).toHaveTextContent('12 dias')
    expect(within(ana).getByLabelText('em andamento: 12 dias')).toHaveTextContent('em andamento')
    expect(bruno).toHaveTextContent('3 dias')
    expect(within(caio).getByLabelText('sem sequência agora')).toHaveTextContent('—')
    expect(screen.getByText('dias seguidos com pelo menos um check-in')).toBeInTheDocument()
  })

  it('draws the average duration per weekday', async () => {
    renderApp('/c/1?tab=stats')
    expect(
      await screen.findByRole('img', {
        name: 'Duração média por dia: Seg 41 min, Ter 38 min, Qua 52 min, Qui 45 min, Sex sem duração, Sáb 70 min, Dom 30 min',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('treinos mais longos: sáb')).toBeInTheDocument()
  })

  it('opens a top check-in in the detail dialog', async () => {
    renderApp('/c/1?tab=stats')
    await userEvent.click(await screen.findByRole('link', { name: 'Treino antigo, de Bruno Lima' }))
    // fora de qualquer lista carregada: o modal busca o check-in sozinho
    expect(await screen.findByRole('dialog', { name: 'Treino antigo' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('link', { name: 'Musculação, de Ana Souza' }))
    const dialog = await screen.findByRole('dialog', { name: 'Musculação' })
    expect(within(dialog).getByText(/Peito e tríceps/)).toBeInTheDocument()
  })

  it('opens the dialog straight from the URL', async () => {
    renderApp('/c/1?tab=stats&checkin=102')
    expect(await screen.findByRole('dialog', { name: 'Musculação' })).toBeInTheDocument()
  })

  it('shows the most used emojis', async () => {
    renderApp('/c/1?tab=stats')
    expect(await screen.findByLabelText('🔥 42')).toBeInTheDocument()
    expect(screen.getByLabelText('💪 30')).toBeInTheDocument()
    expect(screen.getByText('77 reações')).toBeInTheDocument()
  })

  it('falls back to /stats with a notice while the API has no /insights', async () => {
    insightsReturns(404, { detail: 'Not Found' })
    renderApp('/c/1?tab=stats')
    expect(await screen.findByText('Mais análises disponíveis após atualizar a API')).toBeInTheDocument()
    expect(screen.getByLabelText('Check-ins: 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Membros ativos: 2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Check-ins por dia' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Check-ins por membro' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Destaques' })).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a retryable error only for the insights sections', async () => {
    insightsReturns(500, { detail: 'boom' })
    renderApp('/c/1?tab=stats')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Erro da API (500)')
    // /stats segue de pé
    expect(screen.getByRole('heading', { name: 'Check-ins por dia' })).toBeInTheDocument()
    insightsReturns(200, insights)
    await userEvent.click(within(alert).getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByRole('heading', { name: 'Destaques' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows skeletons while insights load', async () => {
    server.use(http.get(`${API}/challenges/:id/insights`, () => new Promise<never>(() => {})))
    renderApp('/c/1?tab=stats')
    expect(await screen.findByRole('status', { name: 'Carregando indicadores' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Carregando horários' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Carregando destaques' })).toBeInTheDocument()
  })
})
