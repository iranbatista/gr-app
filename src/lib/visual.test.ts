import { describe, expect, it } from 'vitest'
import { gradientFor, initials, isActive, rankMembers, shortName } from './visual'

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

describe('shortName', () => {
  it('keeps at most the first two names', () => {
    expect(shortName('Ana Maria Souza')).toBe('Ana Maria')
    expect(shortName('Lucas Barcelos')).toBe('Lucas Barcelos')
    expect(shortName('Kayo')).toBe('Kayo')
    expect(shortName('  Fellipe   Gonçalves Vasconcelos ')).toBe('Fellipe Gonçalves')
  })
})

describe('rankMembers', () => {
  const m = (account_id: number, name: string, workouts: number, active_days?: number) => ({
    account_id, name, workouts, active_days, points: 0, calories: 0, distance: 0,
  })
  it('sorts by the chosen metric desc, ties by name', () => {
    const data = [m(1, 'Caio', 5, 2), m(2, 'Ana', 3, 3), m(3, 'Bia', 5, 3)]
    expect(rankMembers(data, 'checkins').map((x) => x.name)).toEqual(['Bia', 'Caio', 'Ana'])
    expect(rankMembers(data, 'dias').map((x) => x.name)).toEqual(['Ana', 'Bia', 'Caio'])
  })
})
