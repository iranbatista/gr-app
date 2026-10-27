import { describe, expect, it } from 'vitest'
import {
  formatCalories,
  formatDate,
  formatDistance,
  formatDuration,
  formatPeriod,
  formatPoints,
  formatRelative,
  formatShortDate,
} from './format'

describe('format', () => {
  it('formatDuration', () => {
    expect(formatDuration(45)).toBe('45min')
    expect(formatDuration(80)).toBe('1h 20min')
    expect(formatDuration(120)).toBe('2h')
    expect(formatDuration(null)).toBe('—')
  })

  it('formatDistance', () => {
    expect(formatDistance(5.24)).toBe('5,2 km')
    expect(formatDistance(10)).toBe('10,0 km')
  })

  it('formatCalories', () => {
    expect(formatCalories(1234.6)).toBe('1.235 kcal')
  })

  it('formatPoints', () => {
    expect(formatPoints(10)).toBe('10')
    expect(formatPoints(7.25)).toBe('7,3')
  })

  it('formatDate keeps date-only strings on the same calendar day', () => {
    expect(formatDate('2026-10-01')).toBe('01/10/2026')
    expect(formatDate(null)).toBe('—')
  })

  it('formatShortDate', () => {
    expect(formatShortDate('2026-10-20')).toBe('20/10')
  })

  it('formatPeriod', () => {
    expect(formatPeriod('2026-10-01', '2026-10-31')).toBe('01/10/2026 – 31/10/2026')
    expect(formatPeriod('2026-10-01', null)).toBe('desde 01/10/2026')
  })

  it('formatRelative', () => {
    const now = new Date('2026-10-27T12:00:00Z')
    expect(formatRelative('2026-10-27T11:59:30Z', now)).toBe('agora')
    expect(formatRelative('2026-10-27T11:48:00Z', now)).toBe('há 12 min')
    expect(formatRelative('2026-10-27T09:00:00Z', now)).toBe('há 3 h')
    expect(formatRelative('2026-10-26T12:00:00Z', now)).toBe('há 1 dia')
    expect(formatRelative('2026-10-24T12:00:00Z', now)).toBe('há 3 dias')
    expect(formatRelative(null, now)).toBe('nunca')
  })
})
