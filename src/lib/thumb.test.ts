import { afterEach, describe, expect, it, vi } from 'vitest'
import { thumbUrl, thumbWidth } from './thumb'

const CDN = 'https://cdn.gymrats.app/a/b c.jpg'

afterEach(() => vi.unstubAllEnvs())

describe('thumbWidth', () => {
  it('escolhe a menor largura >= 2x', () => {
    expect(thumbWidth(24)).toBe(64)
    expect(thumbWidth(32)).toBe(64)
    expect(thumbWidth(40)).toBe(128)
    expect(thumbWidth(96)).toBe(256)
    expect(thumbWidth(256)).toBe(512)
    expect(thumbWidth(400)).toBe(1024)
  })
  it('limita em 1024', () => expect(thumbWidth(5000)).toBe(1024))
})

describe('thumbUrl', () => {
  it('monta a URL da API com u codificado', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.test')
    expect(thumbUrl(CDN, 40)).toBe(`https://api.test/img?u=${encodeURIComponent(CDN)}&w=128`)
  })
  it('não toca URLs fora do CDN ou com query', () => {
    expect(thumbUrl('https://img.test/x.jpg', 40)).toBe('https://img.test/x.jpg')
    expect(thumbUrl('https://cdn.gymrats.app/x.jpg?v=1', 40)).toBe('https://cdn.gymrats.app/x.jpg?v=1')
    expect(thumbUrl('http://cdn.gymrats.app/x.jpg', 40)).toBe('http://cdn.gymrats.app/x.jpg')
  })
  it('null/undefined/vazio -> undefined', () => {
    expect(thumbUrl(null, 40)).toBeUndefined()
    expect(thumbUrl(undefined, 40)).toBeUndefined()
    expect(thumbUrl('', 40)).toBeUndefined()
  })
})
