import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ApiError } from '../api/client'
import { ErrorState } from './ErrorState'

function renderError(error: unknown, notFound?: string) {
  return render(
    <MemoryRouter>
      <ErrorState error={error} onRetry={() => {}} notFound={notFound} />
    </MemoryRouter>,
  )
}

describe('ErrorState', () => {
  it('401 explains the key problem, no retry', () => {
    renderError(new ApiError(401, 'x'))
    expect(screen.getByText('API key inválida ou ausente no build')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
  })

  it('404 shows custom message and link home', () => {
    renderError(new ApiError(404, 'x'), 'Desafio não encontrado')
    expect(screen.getByText('Desafio não encontrado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar aos desafios' })).toHaveAttribute('href', '/')
  })

  it('5xx and network errors offer retry', () => {
    renderError(new ApiError(503, 'x'))
    expect(screen.getByText('Erro da API (503)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
  })

  it('network error message', () => {
    renderError(new ApiError(0, 'x'))
    expect(screen.getByText('Sem conexão com a API')).toBeInTheDocument()
  })
})
