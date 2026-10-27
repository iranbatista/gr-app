import { describe, expect, it } from 'vitest'
import { paginate } from './paginate'

const items = Array.from({ length: 12 }, (_, i) => i + 1)

describe('paginate', () => {
  it('slices a page and reports the range', () => {
    expect(paginate(items, 1, 10)).toEqual({ items: items.slice(0, 10), page: 1, pages: 2, from: 1, to: 10, total: 12 })
    expect(paginate(items, 2, 10)).toEqual({ items: [11, 12], page: 2, pages: 2, from: 11, to: 12, total: 12 })
  })

  it('clamps out-of-range pages', () => {
    expect(paginate(items, 9, 10).page).toBe(2)
    expect(paginate(items, 0, 10).page).toBe(1)
  })

  it('handles empty lists', () => {
    expect(paginate([], 1, 10)).toEqual({ items: [], page: 1, pages: 1, from: 0, to: 0, total: 0 })
  })
})
