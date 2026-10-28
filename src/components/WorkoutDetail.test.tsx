import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API } from '../test/fixtures'
import { renderApp } from '../test/render'
import { server } from '../test/server'

async function openMusculacao() {
  renderApp('/c/1?tab=feed')
  await userEvent.click(await screen.findByRole('link', { name: 'Musculação' }))
  return screen.findByRole('dialog', { name: 'Musculação' })
}

describe('WorkoutDetail', () => {
  it('opens from the card with description and member link', async () => {
    const dialog = await openMusculacao()
    expect(within(dialog).getByText(/Peito e tríceps/)).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: /Ana Souza/ })).toHaveAttribute('href', '/c/1/m/11')
    expect(within(dialog).getByText('21/10/2026 às 15:00')).toBeInTheDocument()
  })

  it('navigates the gallery with buttons and arrow keys', async () => {
    const dialog = await openMusculacao()
    expect(within(dialog).getByText('1/3')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Mídia anterior' })).toBeDisabled()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Próxima mídia' }))
    expect(within(dialog).getByText('2/3')).toBeInTheDocument()
    await userEvent.keyboard('{ArrowRight}')
    expect(within(dialog).getByText('3/3')).toBeInTheDocument()
    // terceira mídia é vídeo
    const video = dialog.querySelector('video')!
    expect(video).toHaveAttribute('poster', 'https://img.test/w102-c.jpg')
    await userEvent.keyboard('{ArrowLeft}')
    expect(within(dialog).getByText('2/3')).toBeInTheDocument()
  })

  it('groups reactions with counts', async () => {
    const dialog = await openMusculacao()
    const reactions = within(dialog).getByRole('list', { name: 'Reações' })
    expect(within(reactions).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['😂 2', '🔥 1'])
  })

  it('lists comments with their reactions', async () => {
    const dialog = await openMusculacao()
    expect(await within(dialog).findByText(/Amanhã tem mais/)).toBeInTheDocument()
    expect(within(dialog).getByRole('heading', { name: 'Comentários (2)' })).toBeInTheDocument()
    expect(within(dialog).getByText('Bora')).toBeInTheDocument()
    expect(within(dialog).getByText('❤️ 1')).toBeInTheDocument()
  })

  it('keeps the modal usable when comments fail', async () => {
    server.use(http.get(`${API}/workouts/:wid/comments`, () => HttpResponse.json({ detail: 'x' }, { status: 503 })))
    const dialog = await openMusculacao()
    expect(await within(dialog).findByText('Comentários indisponíveis no momento')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
    expect(within(dialog).getByText(/Peito e tríceps/)).toBeInTheDocument()
  })

  it('opens from a deep link and closes removing the param', async () => {
    renderApp('/c/1?tab=feed&checkin=102')
    const dialog = await screen.findByRole('dialog', { name: 'Musculação' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Fechar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    // trocar de aba preserva os params: se o checkin tivesse ficado, o modal voltaria
    await userEvent.click(screen.getByRole('tab', { name: 'Ranking' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Feed' }))
    await screen.findAllByRole('article')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('fetches a check-in that is not in the loaded pages', async () => {
    renderApp('/c/1?tab=feed&checkin=999')
    expect(await screen.findByRole('dialog', { name: 'Treino antigo' })).toBeInTheDocument()
  })

  it('closes when the deep-linked check-in does not exist', async () => {
    renderApp('/c/1?tab=feed&checkin=12345')
    await screen.findAllByRole('article')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('shows reactions and comment count on the card', async () => {
    renderApp('/c/1?tab=feed')
    const card = (await screen.findByRole('link', { name: 'Musculação' })).closest('article')!
    expect(within(card).getByLabelText('2 comentários')).toBeInTheDocument()
    expect(within(card).getByLabelText('3 reações')).toHaveTextContent('😂🔥3')
    expect(within(card).getByLabelText('Mais 2 mídias')).toHaveTextContent('+2')
  })
})
