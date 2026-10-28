import { ArrowLeft, RotateCw, TriangleAlert } from 'lucide-react'
import { icon } from '../lib/ui'
import { Button, buttonClass } from './ui/Button'
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
    <div
      role="alert"
      className="surface flex flex-col items-start gap-5 border-[var(--danger-hairline)] bg-[var(--danger-tint)] p-8"
    >
      <div className="space-y-1.5">
        <p className="eyebrow flex items-center gap-1.5 text-[var(--danger)]">
          <TriangleAlert size={14} strokeWidth={1.75} />
          Algo deu errado
        </p>
        <p className="font-heading text-base font-medium tracking-tight text-[var(--ink)]">
          {message(error, notFound)}
        </p>
      </div>
      {status === 404 && (
        <Link to="/" className={buttonClass('secondary')}>
          <ArrowLeft {...icon} />
          Voltar aos desafios
        </Link>
      )}
      {retryable && onRetry && (
        <Button variant="primary" icon={RotateCw} onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  )
}
