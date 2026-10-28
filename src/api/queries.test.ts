import { describe, expect, it } from 'vitest'
import { honorsUntil, nextOffset, workoutParams } from './queries'

describe('workoutParams', () => {
  it('maps local-day filters to UTC bounds', () => {
    expect(workoutParams({ member: 11, since: '2026-10-01', until: '2026-10-20' }, 30, 60)).toEqual({
      limit: 30,
      offset: 60,
      member_id: 11,
      since: '2026-10-01T03:00:00.000000Z',
      until: '2026-10-21T02:59:59.999999Z',
    })
  })

  it('leaves missing filters undefined', () => {
    expect(workoutParams({}, 30, 0)).toEqual({
      limit: 30,
      offset: 0,
      member_id: undefined,
      since: undefined,
      until: undefined,
    })
  })
})

describe('nextOffset', () => {
  it('returns next offset while there are more items', () => {
    expect(nextOffset({ items: new Array(30), total: 35, limit: 30, offset: 0 })).toBe(30)
  })

  it('returns undefined on last page', () => {
    expect(nextOffset({ items: new Array(5), total: 35, limit: 30, offset: 30 })).toBeUndefined()
  })
})

describe('honorsUntil', () => {
  it('detects whether the API applied the cut-off', () => {
    expect(honorsUntil(undefined, '2026-10-27')).toBeUndefined()
    expect(honorsUntil({}, '2026-10-27')).toBe(false)
    expect(honorsUntil({}, undefined)).toBe(false)
    expect(honorsUntil({ until: null }, undefined)).toBe(true)
    expect(honorsUntil({ until: '2026-10-27' }, '2026-10-27')).toBe(true)
    expect(honorsUntil({ until: null }, '2026-10-27')).toBe(false)
  })
})
