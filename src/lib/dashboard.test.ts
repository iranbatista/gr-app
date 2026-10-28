import { describe, expect, it } from 'vitest'
import { ana, bruno, caio, insights } from '../test/fixtures'
import {
  addDays,
  challengeProgress,
  compareText,
  dashboardKpis,
  durationRows,
  durationText,
  emojiSize,
  formatHours,
  joinNames,
  lastDays,
  peakSlot,
  periodRows,
  referenceDay,
  slotLabel,
  streakLeaders,
} from './dashboard'

const at = (s: string) => new Date(`${s}T15:00:00`)

describe('challengeProgress', () => {
  it('counts the current day, percent and days left', () => {
    expect(challengeProgress('2026-10-01', '2026-10-28', at('2026-10-25'))).toEqual({
      state: 'running',
      pct: 89,
      text: 'Dia 25 de 28 · 89% · faltam 3 dias',
    })
  })

  it('handles the last days', () => {
    expect(challengeProgress('2026-10-01', '2026-10-28', at('2026-10-27'))?.text).toBe('Dia 27 de 28 · 96% · falta 1 dia')
    expect(challengeProgress('2026-10-01', '2026-10-28', at('2026-10-28'))?.text).toBe('Dia 28 de 28 · 100% · último dia')
  })

  it('reads midnight-UTC dates as calendar days', () => {
    const p = challengeProgress('2026-10-01T00:00:00.000000Z', '2026-10-28T00:00:00Z', at('2026-10-01'))
    expect(p?.text).toBe('Dia 1 de 28 · 4% · faltam 27 dias')
  })

  it('describes challenges not started yet or already ended', () => {
    expect(challengeProgress('2026-11-01', '2026-11-30', at('2026-10-27'))).toEqual({
      state: 'upcoming',
      pct: 0,
      text: 'Começa em 5 dias',
    })
    expect(challengeProgress('2026-10-28', null, at('2026-10-27'))?.text).toBe('Começa amanhã')
    expect(challengeProgress('2026-09-01', '2026-09-30', at('2026-10-27'))).toEqual({
      state: 'ended',
      pct: 100,
      text: 'Encerrado há 27 dias',
    })
    expect(challengeProgress('2026-09-01', '2026-10-26', at('2026-10-27'))?.text).toBe('Encerrado ontem')
  })

  it('has no percent without an end date and nothing without a start', () => {
    expect(challengeProgress('2026-10-01', null, at('2026-10-27'))).toEqual({ state: 'running', pct: null, text: 'Dia 27' })
    expect(challengeProgress(null, '2026-10-30', at('2026-10-27'))).toBeNull()
  })
})

describe('days', () => {
  it('adds days across month and DST edges', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(lastDays('2026-10-02', 3)).toEqual(['2026-09-30', '2026-10-01', '2026-10-02'])
  })

  it('uses the last day as reference once the challenge ended', () => {
    expect(referenceDay('2099-12-31', at('2026-10-27'))).toEqual({ day: '2026-10-27', isToday: true })
    expect(referenceDay('2026-10-20', at('2026-10-27'))).toEqual({ day: '2026-10-20', isToday: false })
    expect(referenceDay(null, at('2026-10-27'))).toEqual({ day: '2026-10-27', isToday: true })
  })
})

describe('dashboardKpis', () => {
  const k = dashboardKpis(insights, '2026-10-27')

  it('compares today with yesterday', () => {
    expect(k.checkins.value).toBe(10)
    expect(k.checkins.previous).toBe(6)
    expect(k.checkins.series).toHaveLength(14)
    expect(k.checkins.series.at(-1)).toEqual({ date: '2026-10-27', value: 10 })
  })

  it('treats days without data as zero', () => {
    const z = dashboardKpis(insights, '2026-10-29')
    expect(z.checkins.value).toBe(0)
    expect(z.checkins.previous).toBe(0)
    expect(z.checkins.series.at(-1)).toEqual({ date: '2026-10-29', value: 0 })
  })

  it('derives participation today and the 7-day average', () => {
    expect(k.participation).toMatchObject({ athletes: 8, members: 10, pct: 80 })
    // 21–25: 30%; 26: 50%; 27: 80%
    expect(k.participation.avg7).toBeCloseTo((5 * 30 + 50 + 80) / 7)
  })

  it('averages workouts per member with a cumulative series', () => {
    expect(k.perAthlete).toMatchObject({ value: 12, workouts: 120, members: 10 })
    expect(k.perAthlete.active).toBe(8)
    // até 27/10: 25×4 + 6 + 10 = 116 check-ins na série diária
    expect(k.perAthlete.series.at(-1)?.value).toBeCloseTo(11.6)
    expect(k.perAthlete.series[0]).toEqual({ date: '2026-10-14', value: 5.6 })
  })

  it('turns minutes into hours and a per check-in average', () => {
    expect(k.hours.hours).toBe(90)
    expect(k.hours.avgMinutes).toBe(45)
    expect(k.hours.series.at(-1)?.value).toBe(480)
  })

  it('survives a challenge without members or workouts', () => {
    const e = dashboardKpis(
      { ...insights, members_total: 0, totals: { workouts: 0, minutes: 0, athletes_active: 0 }, daily: [] },
      '2026-10-27',
    )
    expect(e.participation.pct).toBe(0)
    expect(e.perAthlete.value).toBe(0)
    expect(e.hours.avgMinutes).toBeNull()
  })
})

describe('formatters', () => {
  it('formats hours, deltas and slots', () => {
    expect(formatHours(312.4)).toBe('312 h')
    expect(formatHours(1234)).toBe('1.234 h')
    expect(formatHours(2.25)).toBe('2,3 h')
    expect(formatHours(0)).toBe('0 h')
    expect(slotLabel(1, 18)).toBe('Ter 18h')
  })
})

describe('compareText', () => {
  it('compares with yesterday in words', () => {
    expect(compareText(22, 24)).toBe('2 a menos que ontem (24)')
    expect(compareText(22, 19)).toBe('3 a mais que ontem (19)')
    expect(compareText(5, 5)).toBe('igual a ontem')
    expect(compareText(6, 4, false)).toBe('2 a mais que o dia anterior (4)')
    expect(compareText(4, 4, false)).toBe('igual ao dia anterior')
  })
})

describe('peakSlot', () => {
  it('finds the busiest weekday and hour (first on ties)', () => {
    expect(peakSlot(insights.punchcard)).toEqual({ weekday: 1, hour: 18, count: 23 })
    const tie = Array.from({ length: 7 }, () => new Array(24).fill(0))
    tie[4][7] = 3
    tie[2][20] = 3
    expect(peakSlot(tie)).toEqual({ weekday: 2, hour: 20, count: 3 })
    expect(peakSlot(Array.from({ length: 7 }, () => new Array(24).fill(0)))).toBeNull()
  })
})

describe('periodRows', () => {
  it('keeps empty periods with 0%', () => {
    expect(periodRows(insights.periods).map((p) => [p.label, p.range, p.count, p.pct])).toEqual([
      ['Madrugada', '0h–5h', 0, 0],
      ['Manhã', '5h–12h', 30, 25],
      ['Tarde', '12h–18h', 30, 25],
      ['Noite', '18h–24h', 60, 50],
    ])
  })

  it('is all zero without check-ins', () => {
    expect(periodRows({ madrugada: 0, manha: 0, tarde: 0, noite: 0 }).every((p) => p.pct === 0 && p.count === 0)).toBe(true)
  })
})

describe('durationRows', () => {
  it('labels weekdays from Monday and empties null averages', () => {
    const rows = durationRows([...insights.duration_by_weekday].reverse())
    expect(rows.map((r) => r.label)).toEqual(['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'])
    expect(rows[2]).toEqual({ label: 'Qua', avg: 52.2, value: 52, workouts: 87 })
    expect(rows[4]).toEqual({ label: 'Sex', avg: null, value: 0, workouts: 3 })
    expect(durationText(rows[2])).toBe('Qua · média 52 min · 87 treinos')
    expect(durationText(rows[4])).toBe('Sex · sem duração registrada')
  })
})

describe('streakLeaders', () => {
  it('returns everyone tied at the top', () => {
    expect(streakLeaders(insights.streaks, 'longest')).toEqual({ value: 12, accounts: [ana, bruno] })
    expect(streakLeaders(insights.streaks, 'current')).toEqual({ value: 12, accounts: [ana] })
  })

  it('is empty when nobody has a current streak', () => {
    const s = insights.streaks.map((x) => ({ ...x, current: 0 }))
    expect(streakLeaders(s, 'current')).toEqual({ value: 0, accounts: [] })
    expect(streakLeaders([], 'longest')).toEqual({ value: 0, accounts: [] })
  })
})

describe('joinNames', () => {
  it('shortens and joins tied names', () => {
    expect(joinNames([caio.full_name])).toBe('Caio Prado')
    expect(joinNames([ana.full_name, bruno.full_name])).toBe('Ana e Bruno')
    expect(joinNames(['Ana Souza', 'Bruno Lima', 'Caio Prado'])).toBe('Ana, Bruno e Caio')
    expect(joinNames(['A', 'B', 'C', 'D'])).toBe('A, B e mais 2')
    expect(joinNames([null])).toBe('Sem nome')
  })
})

describe('emojiSize', () => {
  it('scales between 1 and 1.5 rem', () => {
    expect(emojiSize(42, 42)).toBe(1.5)
    expect(emojiSize(0, 42)).toBe(1)
    expect(emojiSize(10, 40)).toBe(1.25)
    expect(emojiSize(1, 0)).toBe(1)
  })
})
