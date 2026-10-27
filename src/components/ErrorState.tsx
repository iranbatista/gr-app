import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'

function message(error: unknown, notFound: string): string {
  if (!(error instanceof ApiError)) return 'Erro inesperado'
  if (error.status === 401) return 'API key inválida ou ausente no build'
  if (error.status === 404) return notFound
  if (error.status === 0) return 'Sem conexão com a API'
  return `Erro da API (${error.status})`
}

interface Props {
  error: unknown
  onRetry?: () => void
  notFound?: string
}

export function ErrorState({ error, onRetry, notFound = 'Não encontrado' }: Props) {
  const status = error instanceof ApiError ? error.status : -1
  const retryable = status === -1 || status === 0 || status >= 500
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <p>{message(error, notFound)}</p>
      {status === 404 && (
        <Link to="/" className="mt-2 inline-block underline">
          Voltar aos desafios
        </Link>
      )}
      {retryable && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
        >
          Tentar de novo
        </button>
      )}
    </div>
  )
}
