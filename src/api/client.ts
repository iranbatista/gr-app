export type Params = Record<string, string | number | null | undefined>

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(`${status}: ${detail}`)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

// Lido em tempo de chamada (não no import) para que testes possam usar vi.stubEnv.
export function apiKey(): string {
  return import.meta.env.VITE_GYMRATS_KEY ?? ''
}

function baseUrl(): string {
  return import.meta.env.VITE_API_URL ?? ''
}

export async function apiGet<T>(path: string, params: Params = {}): Promise<T> {
  const url = new URL(path, baseUrl())
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  let res: Response
  try {
    res = await fetch(url, { headers: { 'X-API-Key': apiKey() } })
  } catch (e) {
    throw new ApiError(0, e instanceof Error ? e.message : 'falha de rede')
  }

  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      if (typeof body?.detail === 'string') detail = body.detail
    } catch {
      // corpo não é JSON: mantém statusText
    }
    throw new ApiError(res.status, detail)
  }
  return (await res.json()) as T
}

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (!(error instanceof ApiError)) return false
  const transient = error.status === 0 || error.status >= 500
  return transient && failureCount < 1
}
