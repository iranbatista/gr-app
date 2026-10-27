import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../test/render'

describe('MemberPage', () => {
  it('shows member header, totals and history', async () => {
    renderApp('/c/1/m/11')
    expect(await screen.findByRole('heading', { name: 'Ana Souza' })).toBeInTheDocument()
    expect(await screen.findByLabelText('Check-ins: 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Pontos: 10')).toBeInTheDocument()
    expect(screen.getByLabelText('Calorias: 800 kcal')).toBeInTheDocument()
    expect(screen.getByLabelText('Distância: 5,2 km')).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Desafio' })).toHaveAttribute('href', '/c/1')
    expect(screen.getByRole('heading', { name: 'Check-ins por dia' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Check-ins por semana' })).toBeInTheDocument()
  })

  it('shows not found for non-numeric member id', async () => {
    renderApp('/c/1/m/abc')
    expect(await screen.findByText('Membro não encontrado')).toBeInTheDocument()
  })

  it('shows not found for unknown member', async () => {
    renderApp('/c/1/m/999')
    expect(await screen.findByText('Membro não encontrado')).toBeInTheDocument()
  })
})
