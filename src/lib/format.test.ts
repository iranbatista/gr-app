import { describe, expect, it } from 'vitest'
import {
  dayLabel,
  formatCalories,
  formatDate,
  formatDistance,
  formatDuration,
  formatPeriod,
  formatPoints,
  formatRelative,
  formatShortDate,
  localDayKey,
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

  it('formatDate treats UTC-midnight timestamps as calendar dates', () => {
    expect(formatDate('2026-10-30T00:00:00.000000Z')).toBe('30/10/2026')
    expect(formatDate('2026-10-30T00:00:00Z')).toBe('30/10/2026')
  })

  it('formatDate shows real timestamps in local time', () => {
    // 01:00 UTC = 22:00 do dia anterior em São Paulo
    expect(formatDate('2026-10-30T01:00:00Z')).toBe('29/10/2026')
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

  it('localDayKey uses the local calendar day', () => {
    expect(localDayKey('2026-10-28T01:30:00Z')).toBe('2026-10-27')
    expect(localDayKey('2026-10-28T12:00:00Z')).toBe('2026-10-28')
  })

  it('dayLabel', () => {
    const now = new Date('2026-10-27T15:00:00')
    expect(dayLabel('2026-10-27', now)).toBe('Hoje')
    expect(dayLabel('2026-10-26', now)).toBe('Ontem')
    expect(dayLabel('2026-10-25', now)).toBe('25/10')
    expect(dayLabel('2025-10-25', now)).toBe('25/10/2025')
    // virada de mês e de ano
    expect(dayLabel('2026-09-30', new Date('2026-10-01T08:00:00'))).toBe('Ontem')
    expect(dayLabel('2025-12-31', new Date('2026-01-01T00:30:00'))).toBe('Ontem')
  })
})
