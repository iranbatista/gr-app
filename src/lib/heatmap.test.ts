import { describe, expect, it } from 'vitest'
import { buildHeatmap, monthLabels, weeklyTotals } from './heatmap'

describe('buildHeatmap', () => {
  it('returns no weeks for empty data', () => {
    expect(buildHeatmap([])).toEqual([])
  })

  it('aligns whole Monday-start weeks and fills gaps with zero', () => {
    // 2026-10-21 é quarta; 2026-10-27 é terça
    const weeks = buildHeatmap([
      { date: '2026-10-21', count: 2 },
      { date: '2026-10-27', count: 1 },
    ])
    expect(weeks).toHaveLength(2)
    expect(weeks.every((w) => w.length === 7)).toBe(true)
    expect(weeks[0][0].date).toBe('2026-10-19') // segunda
    expect(weeks[1][6].date).toBe('2026-11-01') // domingo
    expect(weeks[0][2]).toEqual({ date: '2026-10-21', count: 2, level: 4, inRange: true })
    expect(weeks[0][3]).toEqual({ date: '2026-10-22', count: 0, level: 0, inRange: true })
    // antes do primeiro dia e depois do último: completam a semana, fora do intervalo
    expect(weeks[0][1].inRange).toBe(false)
    expect(weeks[1][2].inRange).toBe(false)
    expect(weeks[1][1]).toMatchObject({ date: '2026-10-27', count: 1, inRange: true })
  })

  it('scales levels 1–4 against the max', () => {
    const weeks = buildHeatmap([
      { date: '2026-10-19', count: 1 },
      { date: '2026-10-20', count: 4 },
      { date: '2026-10-21', count: 6 },
      { date: '2026-10-22', count: 8 },
    ])
    expect(weeks[0].slice(0, 4).map((c) => c.level)).toEqual([1, 2, 3, 4])
  })
})

describe('monthLabels', () => {
  it('labels the first week and each week where a month starts', () => {
    const weeks = buildHeatmap([
      { date: '2026-10-21', count: 1 },
      { date: '2026-11-10', count: 1 },
    ])
    expect(monthLabels(weeks)).toEqual([
      { week: 0, label: 'out' },
      { week: 2, label: 'nov' }, // 2026-11-01 é domingo da semana 1; a semana 2 começa em 02/11
    ])
  })
})

describe('weeklyTotals', () => {
  it('sums by Monday-start week and fills empty weeks', () => {
    expect(
      weeklyTotals([
        { date: '2026-10-14', count: 2 },
        { date: '2026-10-18', count: 1 }, // domingo, mesma semana
        { date: '2026-10-19', count: 4 },
        { date: '2026-11-03', count: 1 },
      ]),
    ).toEqual([
      { weekStart: '2026-10-12', count: 3 },
      { weekStart: '2026-10-19', count: 4 },
      { weekStart: '2026-10-26', count: 0 },
      { weekStart: '2026-11-02', count: 1 },
    ])
  })

  it('is empty for empty data', () => {
    expect(weeklyTotals([])).toEqual([])
  })
})
