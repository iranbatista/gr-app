import { describe, expect, it } from 'vitest'
import { gradientFor, initials, isActive } from './visual'

describe('initials', () => {
  it('uses first and last name', () => {
    expect(initials('Ana Maria Souza')).toBe('AS')
    expect(initials('ana')).toBe('A')
    expect(initials(null)).toBe('?')
    expect(initials('  ')).toBe('?')
  })
})

describe('gradientFor', () => {
  it('is deterministic and differs by seed', () => {
    expect(gradientFor('Desafio')).toBe(gradientFor('Desafio'))
    expect(gradientFor('Desafio')).not.toBe(gradientFor('Outro'))
    expect(gradientFor('x')).toMatch(/^linear-gradient/)
  })
})

describe('isActive', () => {
  const today = new Date('2026-10-27T15:00:00')
  it('is active when end_date is today or later', () => {
    expect(isActive({ end_date: '2026-10-27' }, today)).toBe(true)
    expect(isActive({ end_date: '2026-11-01' }, today)).toBe(true)
    expect(isActive({ end_date: '2026-10-27T00:00:00.000000Z' }, today)).toBe(true)
  })
  it('is inactive when end_date passed', () => {
    expect(isActive({ end_date: '2026-10-26' }, today)).toBe(false)
  })
  it('is active without end_date', () => {
    expect(isActive({ end_date: null }, today)).toBe(true)
  })
})
