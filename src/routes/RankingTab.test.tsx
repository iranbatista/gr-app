import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API } from '../test/fixtures'
import { renderApp } from '../test/render'
import { server } from '../test/server'

const twelve = Array.from({ length: 12 }, (_, i) => ({
  rank: i + 1,
  score: 100 - i,
  account: { id: 100 + i, full_name: `Atleta ${i + 1}`, profile_picture_url: null },
}))

describe('RankingTab', () => {
  it('paginates 10 rows per page keeping the API rank', async () => {
    server.use(http.get(`${API}/challenges/:id/rankings`, () => HttpResponse.json(twelve)))
    renderApp('/c/1')
    expect(await screen.findByText('1–10 de 12')).toBeInTheDocument()
    const list = screen.getByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(10)

    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(screen.getByText('11–12 de 12')).toBeInTheDocument()
    const rows = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('11º')
    expect(rows[0]).toHaveTextContent('Atleta 11')
  })

  it('hides the pager when everything fits in one page', async () => {
    renderApp('/c/1')
    await screen.findByRole('link', { name: /Ana Souza/ })
    expect(screen.queryByRole('button', { name: 'Próxima página' })).not.toBeInTheDocument()
  })
})
