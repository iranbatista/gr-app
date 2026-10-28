import { describe, expect, it } from 'vitest'
import { buildHeatmap, heatmapSummary, monthLabels, weeklyTotals } from './heatmap'

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

  it('levels non-zero days by quantile', () => {
    const weeks = buildHeatmap([
      { date: '2026-10-19', count: 1 },
      { date: '2026-10-20', count: 4 },
      { date: '2026-10-21', count: 6 },
      { date: '2026-10-22', count: 8 },
    ])
    expect(weeks[0].slice(0, 4).map((c) => c.level)).toEqual([1, 2, 3, 4])
  })

  it('keeps contrast when a few days are outliers', () => {
    // com escala pelo máximo, 1–3 cairiam todos no nível 1 por causa do 100
    const days = [1, 1, 2, 2, 3, 3, 100].map((count, i) => ({ date: `2026-10-${19 + i}`, count }))
    expect(buildHeatmap(days)[0].map((c) => c.level)).toEqual([1, 1, 2, 2, 3, 3, 4])
  })

  it('uses level 0 only for zero days', () => {
    const weeks = buildHeatmap([
      { date: '2026-10-19', count: 0 },
      { date: '2026-10-20', count: 1 },
    ])
    expect(weeks[0][0].level).toBe(0)
    expect(weeks[0][1].level).toBeGreaterThan(0)
  })
})

describe('monthLabels', () => {
  it('places each month over the week containing its day 1', () => {
    // semanas: 0 = 19/10, 1 = 26/10 (contém 01/11), 2 = 02/11, 3 = 09/11
    const weeks = buildHeatmap([
      { date: '2026-10-21', count: 1 },
      { date: '2026-11-10', count: 1 },
    ])
    // 'Out' (coluna 0) fica a 1 coluna de 'Nov': o anterior some
    expect(monthLabels(weeks)).toEqual([{ week: 1, label: 'Nov' }])
  })

  it('keeps the first month when the next one is far enough', () => {
    // 01/10/2026 é quinta: semana 0 começa 28/09 (contém 01/10); 01/11 cai na semana 4
    const weeks = buildHeatmap([
      { date: '2026-09-30', count: 1 },
      { date: '2026-11-03', count: 1 },
    ])
    expect(monthLabels(weeks)).toEqual([
      { week: 0, label: 'Out' },
      { week: 4, label: 'Nov' },
    ])
  })

  it('labels the first column with the first month when day 1 is not visible', () => {
    const weeks = buildHeatmap([
      { date: '2026-10-14', count: 1 },
      { date: '2026-10-30', count: 1 },
    ])
    expect(monthLabels(weeks)).toEqual([{ week: 0, label: 'Out' }])
  })
})

describe('heatmapSummary', () => {
  it('totals, active days and the peak day', () => {
    expect(
      heatmapSummary([
        { date: '2026-10-12', count: 3 },
        { date: '2026-10-13', count: 31 },
        { date: '2026-10-14', count: 0 },
        { date: '2026-10-15', count: 31 },
      ]),
    ).toEqual({ total: 65, activeDays: 3, peak: { date: '2026-10-13', count: 31 } })
  })

  it('has no peak without data', () => {
    expect(heatmapSummary([])).toEqual({ total: 0, activeDays: 0, peak: null })
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
