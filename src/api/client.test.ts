import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API } from '../test/fixtures'
import { server } from '../test/server'
import { ApiError, apiGet, shouldRetry } from './client'

describe('apiGet', () => {
  it('sends X-API-Key and returns JSON', async () => {
    let key: string | null = null
    server.use(
      http.get(`${API}/ping`, ({ request }) => {
        key = request.headers.get('X-API-Key')
        return HttpResponse.json({ ok: true })
      }),
    )
    await expect(apiGet('/ping')).resolves.toEqual({ ok: true })
    expect(key).toBe('test-key')
  })

  it('omits empty params', async () => {
    let search = ''
    server.use(
      http.get(`${API}/ping`, ({ request }) => {
        search = new URL(request.url).search
        return HttpResponse.json({})
      }),
    )
    await apiGet('/ping', { a: 1, b: undefined, c: '', d: null, e: 'x' })
    expect(search).toBe('?a=1&e=x')
  })

  it('throws ApiError with FastAPI detail', async () => {
    server.use(
      http.get(`${API}/ping`, () =>
        HttpResponse.json({ detail: 'X-API-Key ausente ou invalida' }, { status: 401 }),
      ),
    )
    await expect(apiGet('/ping')).rejects.toMatchObject({
      status: 401,
      detail: 'X-API-Key ausente ou invalida',
    })
  })

  it('falls back to statusText when body is not JSON', async () => {
    server.use(
      http.get(`${API}/ping`, () =>
        new HttpResponse('boom', { status: 500, statusText: 'Internal Server Error' }),
      ),
    )
    await expect(apiGet('/ping')).rejects.toMatchObject({
      status: 500,
      detail: 'Internal Server Error',
    })
  })

  it('maps network failure to status 0', async () => {
    server.use(http.get(`${API}/ping`, () => HttpResponse.error()))
    const err = await apiGet('/ping').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(0)
  })
})

describe('shouldRetry', () => {
  it('retries once on network and 5xx errors', () => {
    expect(shouldRetry(0, new ApiError(0, 'x'))).toBe(true)
    expect(shouldRetry(0, new ApiError(503, 'x'))).toBe(true)
    expect(shouldRetry(1, new ApiError(503, 'x'))).toBe(false)
  })

  it('never retries 4xx', () => {
    expect(shouldRetry(0, new ApiError(401, 'x'))).toBe(false)
    expect(shouldRetry(0, new ApiError(404, 'x'))).toBe(false)
  })
})
