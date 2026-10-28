import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Insights, RankingEntry, Stats } from '../api/types'
import { API, challenge, insights } from '../test/fixtures'
import { renderApp } from '../test/render'
import { server } from '../test/server'

// "Hoje" fixo: Outubro está no dia 25 de 28.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-27T12:00:00') })
})
afterEach(() => {
  vi.useRealTimers()
})

const out = { ...challenge, id: 1, name: 'Desafio Outubro', start_date: '2026-10-03T00:00:00.000000Z', end_date: '2026-10-30T00:00:00.000000Z' }
const set = { ...challenge, id: 2, name: 'Desafio Setembro', start_date: '2026-09-04T00:00:00.000000Z', end_date: '2026-10-02T00:00:00.000000Z' }

// 12 atletas nos dois (Δ de +10 a −12), uma nova em A e um que saiu (só em B).
const shared = Array.from({ length: 12 }, (_, i) => ({
  id: 100 + i,
  full_name: `Atleta ${String.fromCharCode(65 + i)}`,
  profile_picture_url: null,
  a: 20 - i,
  b: 10 + i,
}))
const nova = { id: 200, full_name: 'Nina Nova', profile_picture_url: null }
const saiu = { id: 300, full_name: 'Saulo Saiu', profile_picture_url: null }

const member = (id: number, name: string, workouts: number) => ({
  account_id: id,
  name,
  workouts,
  points: workouts,
  calories: 0,
  distance: 0,
  active_days: workouts,
})

const acc = ({ id, full_name, profile_picture_url }: { id: number; full_name: string; profile_picture_url: null }) => ({
  id,
  full_name,
  profile_picture_url,
})

const data: Record<string, { stats: Stats; insights: Insights; rankings: RankingEntry[] }> = {
  '1': {
    stats: {
      challenge_id: 1,
      total_workouts: 120,
      members: 13,
      by_day: [],
      by_member: [...shared.map((s) => member(s.id, s.full_name, s.a)), member(200, 'Nina Nova', 3)],
    },
    insights: { ...insights, challenge_id: 1, members_total: 10, totals: { workouts: 120, minutes: 5400, athletes_active: 8 } },
    rankings: [...shared.map((s, i) => ({ rank: i + 1, score: s.a, account: acc(s) })), { rank: 13, score: 3, account: nova }],
  },
  '2': {
    stats: {
      challenge_id: 2,
      total_workouts: 100,
      members: 13,
      by_day: [],
      by_member: [...shared.map((s) => member(s.id, s.full_name, s.b)), member(300, 'Saulo Saiu', 5)],
    },
    insights: {
      ...insights,
      challenge_id: 2,
      members_total: 10,
      totals: { workouts: 100, minutes: 6000, athletes_active: 8 },
      daily: [{ date: '2026-09-04', workouts: 4, athletes: 3, minutes: 200 }],
    },
    rankings: [...shared.map((s, i) => ({ rank: 12 - i, score: s.b, account: acc(s) })), { rank: 13, score: 5, account: saiu }],
  },
}

/** Handlers da comparação; `echo: false` simula a API antiga (ignora `until`). Guarda as URLs pedidas. */
function mockCompareApi({ echo = true, list = [out, set] } = {}) {
  const requests: string[] = []
  const withUntil = <T extends object>(body: T, request: Request) => {
    const url = new URL(request.url)
    requests.push(url.pathname + url.search)
    return echo ? { ...body, until: url.searchParams.get('until') } : body
  }
  server.use(
    http.get(`${API}/challenges`, () => HttpResponse.json(list)),
    http.get(`${API}/challenges/:id/stats`, ({ params, request }) =>
      HttpResponse.json(withUntil(data[params.id as string].stats, request)),
    ),
    http.get(`${API}/challenges/:id/insights`, ({ params, request }) =>
      HttpResponse.json(withUntil(data[params.id as string].insights, request)),
    ),
    http.get(`${API}/challenges/:id/rankings`, ({ params }) => HttpResponse.json(data[params.id as string].rankings)),
  )
  return requests
}

const location = () => screen.getByTestId('location').textContent

describe('ComparePage', () => {
  it('opens the default pair (active vs previous) and writes it to the URL', async () => {
    mockCompareApi()
    renderApp('/comparar')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Outubro × Setembro')
    await waitFor(() => expect(location()).toBe('/comparar?a=1&b=2'))
    expect(screen.getByRole('combobox', { name: 'Desafio A' })).toHaveTextContent('Desafio Outubro')
    expect(screen.getByRole('combobox', { name: 'Desafio B' })).toHaveTextContent('Desafio Setembro')
  })

  it('swaps the challenges in the URL', async () => {
    mockCompareApi()
    renderApp('/comparar?a=1&b=2')
    await userEvent.click(await screen.findByRole('button', { name: 'Inverter desafios' }))
    expect(location()).toBe('/comparar?a=2&b=1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Setembro × Outubro')
  })

  it('cuts both challenges at day N in dia mode and drops the cut-off in total mode', async () => {
    const requests = mockCompareApi()
    renderApp('/comparar?a=1&b=2')
    const mode = await screen.findByRole('group', { name: 'Alinhamento' })
    expect(within(mode).getByRole('button', { name: 'Até o dia 25' })).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByText(/03\/10 – 27\/10 e 04\/09 – 28\/09/)).toBeInTheDocument()
    await screen.findByRole('list', { name: 'Placar' })
    expect(requests).toEqual(
      expect.arrayContaining([
        '/challenges/1/insights?until=2026-10-27',
        '/challenges/2/insights?until=2026-09-28',
        '/challenges/1/stats?until=2026-10-27',
        '/challenges/2/stats?until=2026-09-28',
      ]),
    )

    await userEvent.click(within(mode).getByRole('button', { name: 'Desafio inteiro' }))
    expect(location()).toBe('/comparar?a=1&b=2&modo=total')
    await screen.findByText(/Desafios inteiros/)
    await screen.findByRole('list', { name: 'Placar' })
    expect(requests).toEqual(expect.arrayContaining(['/challenges/1/insights', '/challenges/2/stats']))
  })

  it('disables dia mode when the API does not echo the cut-off', async () => {
    mockCompareApi({ echo: false })
    renderApp('/comparar?a=1&b=2&modo=dia')
    const mode = await screen.findByRole('group', { name: 'Alinhamento' })
    // Ganha o tooltip ao desabilitar (o botão remonta): busca de novo a cada tentativa.
    await waitFor(() => expect(within(mode).getByRole('button', { name: 'Até o dia 25' })).toBeDisabled())
    const dia = within(mode).getByRole('button', { name: 'Até o dia 25' })
    expect(within(mode).getByRole('button', { name: 'Desafio inteiro' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.hover(dia.parentElement!)
    expect((await screen.findAllByText('Disponível após atualizar a API')).length).toBeGreaterThan(0)
    // Os números chegam mesmo assim, no desafio inteiro.
    expect(await screen.findByRole('listitem', { name: /^Check-ins:/ })).toBeInTheDocument()
  })

  it('shows the scoreboard with A × B and the delta', async () => {
    mockCompareApi()
    renderApp('/comparar?a=1&b=2')
    expect(await screen.findByRole('listitem', { name: 'Check-ins: Outubro 120, Setembro 100, +20%' })).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'Horas treinadas: Outubro 90 h, Setembro 100 h, -10%' })).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: /^Atletas ativos: Outubro 8\/10, Setembro 8\/10, 0%/ })).toBeInTheDocument()
  })

  it('opens with a verdict summary', async () => {
    mockCompareApi()
    renderApp('/comparar?a=1&b=2')
    const list = await screen.findByRole('list', { name: 'Resumo' })
    await waitFor(() => expect(within(list).getAllByRole('listitem')).toHaveLength(4))
    const items = within(list).getAllByRole('listitem').map((li) => li.textContent)
    expect(items).toEqual([
      'Outubro está 20% à frente de Setembro no mesmo ponto (120 × 100 check-ins até o dia 25)',
      expect.stringMatching(/^Participação diária /),
      '1 atleta novo e 1 saiu; 12 estão nos dois',
      'Atleta A foi quem mais evoluiu (+10 check-ins)',
    ])
    expect(within(list).getByText('20% à frente').tagName).toBe('STRONG')
  })

  it('charts the cumulative difference and the smoothed participation', async () => {
    mockCompareApi()
    renderApp('/comparar?a=1&b=2')
    // A: 8 check-ins antes do dia 1 + 25 dias até 27/10 = 116; B: 4 no dia 1.
    expect(await screen.findByRole('img', { name: /^Diferença acumulada de check-ins:/ })).toHaveAccessibleName(
      'Diferença acumulada de check-ins: +112 no dia 25 · Outubro à frente',
    )
    expect(screen.getByText('+112 no dia 25 · Outubro à frente')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /^Participação diária, média móvel de 7 dias:/ })).toBeInTheDocument()
  })

  it('hides periods empty on both sides', async () => {
    mockCompareApi()
    renderApp('/comparar?a=1&b=2')
    const chart = await screen.findByRole('img', { name: /^Períodos do dia:/ })
    expect(chart.getAttribute('aria-label')).not.toMatch(/Madrugada/)
    expect(chart.getAttribute('aria-label')).toMatch(/Noite/)
  })

  it('compares athletes: summary, movers, filters and pagination', async () => {
    mockCompareApi()
    renderApp('/comparar?a=1&b=2')
    const summary = await screen.findByLabelText('Resumo dos atletas')
    expect(summary).toHaveTextContent('12 nos dois')
    expect(summary).toHaveTextContent('1 novo')
    expect(summary).toHaveTextContent('1 saiu')

    const up = screen.getByRole('list', { name: 'Mais evoluíram' })
    expect(within(up).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      expect.stringContaining('Atleta A'),
      expect.stringContaining('Atleta B'),
      expect.stringContaining('Atleta C'),
    ])
    const down = screen.getByRole('list', { name: 'Mais caíram' })
    expect(within(down).getAllByRole('listitem')[0]).toHaveTextContent('Atleta L')

    const table = screen.getByRole('table', { name: 'Atletas comparados' })
    expect(screen.getByText('1–10 de 12')).toBeInTheDocument()
    const first = within(table).getAllByRole('row')[1]
    expect(first).toHaveTextContent('Atleta A')
    expect(within(first).getByRole('link', { name: /Atleta A/ })).toHaveAttribute('href', '/c/1/m/100')
    expect(within(first).getByLabelText('variação +10')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(screen.getByText('11–12 de 12')).toBeInTheDocument()

    // Ordenação invertida volta para a página 1 com o maior tombo primeiro.
    await userEvent.click(screen.getByRole('button', { name: /Ordenar por variação/ }))
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Atleta L')

    const filter = screen.getByRole('group', { name: 'Filtrar atletas' })
    await userEvent.click(within(filter).getByRole('button', { name: /Novos/ }))
    expect(within(table).getAllByRole('row')).toHaveLength(2)
    expect(within(table).getByRole('link', { name: /Nina Nova/ })).toHaveAttribute('href', '/c/1/m/200')
    await userEvent.click(within(filter).getByRole('button', { name: /Saíram/ }))
    expect(within(table).getByRole('link', { name: /Saulo Saiu/ })).toHaveAttribute('href', '/c/2/m/300')
  })

  it('asks for two different challenges when A equals B', async () => {
    mockCompareApi()
    renderApp('/comparar?a=1&b=1')
    expect(await screen.findByText('Escolha dois desafios diferentes')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Placar' })).not.toBeInTheDocument()
  })

  it('shows not found for unknown ids', async () => {
    mockCompareApi()
    renderApp('/comparar?a=1&b=999')
    expect(await screen.findByText('Desafio não encontrado')).toBeInTheDocument()
  })

  it('shows a per-section error with retry', async () => {
    mockCompareApi()
    server.use(http.get(`${API}/challenges/:id/stats`, () => HttpResponse.json({ detail: 'x' }, { status: 500 })))
    renderApp('/comparar?a=1&b=2')
    const atletas = await screen.findByRole('region', { name: 'Atletas' })
    expect(await within(atletas).findByRole('alert')).toHaveTextContent('Erro da API (500)')
    expect(within(atletas).getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
    // O resto da página continua de pé.
    expect(await screen.findByRole('list', { name: 'Placar' })).toBeInTheDocument()
  })
})
