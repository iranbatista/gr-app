import { describe, expect, it } from 'vitest'
import type { Challenge, Insights, RankingEntry, Stats } from '../api/types'
import { insights } from '../test/fixtures'
import {
  alignment,
  availableDays,
  buildSummary,
  challengeSpan,
  compareAthletes,
  cutoffDate,
  dayKeys,
  daysFor,
  defaultPair,
  deltaPct,
  denseRank,
  durationPairs,
  formatDeltaPct,
  formatDeltaPp,
  kpiSide,
  movingAverage,
  paceSeries,
  pairSlots,
  peakHour,
  periodPairs,
  previousOf,
  sameWinners,
  shortLabels,
  sortByDelta,
} from './compare'
import type { AthleteComparison, KpiSide } from './compare'

const now = new Date('2026-10-27T12:00:00')

function ch(id: number, start: string | null, end: string | null, name = `C${id}`): Challenge {
  return { id, name, start_date: start, end_date: end }
}

const out = ch(1, '2026-10-03T00:00:00.000000Z', '2026-10-30T00:00:00.000000Z', 'Desafio SplitFit - Outubro')
const set = ch(2, '2026-09-04T00:00:00.000000Z', '2026-10-02T00:00:00.000000Z', 'Desafio SplitFit - Setembro')
const ago = ch(3, '2026-08-03', '2026-09-03', 'Desafio SplitFit - Agosto')

describe('pair selection', () => {
  it('picks the most recent active challenge and the one before it', () => {
    expect(defaultPair([ago, out, set], now)).toEqual([1, 2])
  })

  it('falls back to the most recent challenge when none is active', () => {
    expect(defaultPair([ago, set], now)).toEqual([2, 3])
  })

  it('returns null with fewer than two challenges', () => {
    expect(defaultPair([out], now)).toBeNull()
    expect(defaultPair([], now)).toBeNull()
  })

  it('previousOf uses start_date, then the next one for the oldest', () => {
    expect(previousOf([ago, out, set], 1)?.id).toBe(2)
    expect(previousOf([ago, out, set], 3)?.id).toBe(2)
    expect(previousOf([out], 1)).toBeNull()
    expect(previousOf([out, set], 99)).toBeNull()
  })
})

describe('shortLabels', () => {
  it('strips the shared prefix and separators', () => {
    expect(shortLabels(out.name, set.name)).toEqual(['Outubro', 'Setembro'])
    expect(shortLabels('Desafio SplitFit -  Julho ', 'Desafio SplitFit - Agosto')).toEqual(['Julho', 'Agosto'])
  })

  it('keeps full names when nothing is shared or the rest would be equal/empty', () => {
    expect(shortLabels('os piorais', 'Ratos 2025')).toEqual(['os piorais', 'Ratos 2025'])
    expect(shortLabels('Desafio', 'Desafio')).toEqual(['Desafio', 'Desafio'])
    expect(shortLabels(null, 'X')).toEqual(['', 'X'])
  })
})

describe('alignment', () => {
  it('reads challenge dates as local calendar days', () => {
    expect(challengeSpan(out, now)).toEqual({ start: '2026-10-03', length: 28, elapsed: 25, running: true })
    expect(challengeSpan(set, now)).toEqual({ start: '2026-09-04', length: 29, elapsed: 29, running: false })
  })

  it('handles upcoming, open-ended and dateless challenges', () => {
    expect(challengeSpan(ch(9, '2026-11-01', '2026-11-30'), now)).toMatchObject({ elapsed: 0, running: false })
    expect(challengeSpan(ch(9, '2026-10-20', null), now)).toEqual({ start: '2026-10-20', length: null, elapsed: 8, running: true })
    expect(challengeSpan(ch(9, null, null), now).start).toBeNull()
  })

  it('aligns on the elapsed days of the running challenge (dia by default)', () => {
    const a = challengeSpan(out, now)
    const b = challengeSpan(set, now)
    expect(alignment(a, b)).toEqual({ n: 25, defaultMode: 'dia' })
    expect(cutoffDate(a.start!, 25)).toBe('2026-10-27')
    expect(cutoffDate(b.start!, 25)).toBe('2026-09-28')
  })

  it('uses the smaller N when both are running, never beyond a shorter challenge', () => {
    const a = challengeSpan(ch(1, '2026-10-03', '2026-10-30'), now) // dia 25
    const b = challengeSpan(ch(2, '2026-10-10', '2026-11-30'), now) // dia 18
    expect(alignment(a, b).n).toBe(18)
    const short = challengeSpan(ch(3, '2026-08-01', '2026-08-10'), now) // 10 dias
    expect(alignment(a, short)).toEqual({ n: 10, defaultMode: 'dia' })
  })

  it('defaults to total when none is running, dia using the shorter length', () => {
    expect(alignment(challengeSpan(set, now), challengeSpan(ago, now))).toEqual({ n: 29, defaultMode: 'total' })
  })

  it('cannot align without a start or before day 1', () => {
    const a = challengeSpan(out, now)
    expect(alignment(a, challengeSpan(ch(9, null, null), now)).n).toBeNull()
    expect(alignment(a, challengeSpan(ch(9, '2026-11-01', '2026-11-30'), now))).toEqual({ n: null, defaultMode: 'total' })
  })

  it('counts days per side by mode', () => {
    const a = challengeSpan(out, now)
    const b = challengeSpan(set, now)
    expect(availableDays(a)).toBe(25)
    expect(availableDays(b)).toBe(29)
    expect(daysFor(b, 'dia', 25)).toBe(25)
    expect(daysFor(b, 'total', 25)).toBe(29)
    expect(dayKeys('2026-10-30', 3)).toEqual(['2026-10-30', '2026-10-31', '2026-11-01'])
  })
})

describe('deltas', () => {
  it('computes signed percentages and handles a zero base', () => {
    expect(deltaPct(570, 700)).toBeCloseTo(-18.57, 1)
    expect(deltaPct(12, 10)).toBe(20)
    expect(deltaPct(0, 0)).toBe(0)
    expect(deltaPct(5, 0)).toBeNull()
    expect(formatDeltaPct(-18.57)).toBe('-19%')
    expect(formatDeltaPct(20)).toBe('+20%')
    expect(formatDeltaPct(0.2)).toBe('0%')
    expect(formatDeltaPct(null)).toBe('novo')
    expect(formatDeltaPp(3.4)).toBe('+3 p.p.')
    expect(formatDeltaPp(-0.3)).toBe('0 p.p.')
  })
})

const ins = (over: Partial<Insights>): Insights => ({ ...insights, ...over })

describe('kpiSide', () => {
  it('averages daily participation over the compared days, missing days as 0', () => {
    const k = kpiSide(
      ins({
        members_total: 10,
        totals: { workouts: 30, minutes: 900, athletes_active: 6 },
        daily: [
          { date: '2026-10-01', workouts: 10, athletes: 5, minutes: 300 },
          { date: '2026-10-03', workouts: 20, athletes: 3, minutes: 600 },
        ],
      }),
      '2026-10-01',
      4,
    )
    expect(k).toEqual({ workouts: 30, active: 6, members: 10, participation: 20, perAthlete: 3, hours: 15, avgMinutes: 30 })
  })

  it('has no average duration without check-ins', () => {
    const k = kpiSide(ins({ members_total: 0, totals: { workouts: 0, minutes: 0, athletes_active: 0 }, daily: [] }), null, 0)
    expect(k.avgMinutes).toBeNull()
    expect(k.perAthlete).toBe(0)
    expect(k.participation).toBe(0)
  })
})

describe('paceSeries', () => {
  it('aligns cumulative check-ins and daily participation by day index', () => {
    const a = ins({
      members_total: 4,
      daily: [
        { date: '2026-10-03', workouts: 3, athletes: 2, minutes: 0 },
        { date: '2026-10-05', workouts: 1, athletes: 1, minutes: 0 },
      ],
    })
    const b = ins({ members_total: 2, daily: [{ date: '2026-09-04', workouts: 2, athletes: 2, minutes: 0 }] })
    const rows = paceSeries({ ins: a, start: '2026-10-03', days: 3 }, { ins: b, start: '2026-09-04', days: 2 })
    expect(rows).toEqual([
      { day: 1, aCum: 3, bCum: 2, diff: 1, aPct: 50, bPct: 100, aAvg: 50, bAvg: 100 },
      { day: 2, aCum: 3, bCum: 2, diff: 1, aPct: 0, bPct: 0, aAvg: 25, bAvg: 50 },
      { day: 3, aCum: 4, bCum: undefined, diff: undefined, aPct: 25, bPct: undefined, aAvg: 25, bAvg: undefined },
    ])
  })
})

describe('when the group trains', () => {
  it('pairs periods with each side share', () => {
    const rows = periodPairs({ madrugada: 0, manha: 10, tarde: 10, noite: 20 }, { madrugada: 1, manha: 1, tarde: 0, noite: 2 })
    expect(rows.map((r) => [r.key, r.a, r.b, r.aPct, r.bPct])).toEqual([
      ['madrugada', 0, 1, 0, 25],
      ['manha', 10, 1, 25, 25],
      ['tarde', 10, 0, 25, 0],
      ['noite', 20, 2, 50, 50],
    ])
  })

  it('finds the peak hour across weekdays', () => {
    expect(peakHour(insights.punchcard)).toBe(18)
    expect(peakHour([new Array(24).fill(0)])).toBeNull()
  })

  it('pairs weekday durations, null when missing', () => {
    const rows = durationPairs(
      [{ weekday: 0, workouts: 2, avg_minutes: 41.6 }],
      [{ weekday: 0, workouts: 1, avg_minutes: null }, { weekday: 6, workouts: 1, avg_minutes: 30 }],
    )
    expect(rows[0]).toEqual({ label: 'Seg', a: 42, b: null })
    expect(rows[6]).toEqual({ label: 'Dom', a: null, b: 30 })
  })
})

describe('pairSlots', () => {
  it('keeps the order and drops rows empty on both sides', () => {
    expect(pairSlots(['x', null, null], [null, null, 'z'])).toEqual([
      { index: 0, a: 'x', b: null },
      { index: 2, a: null, b: 'z' },
    ])
  })
})

describe('athletes', () => {
  const acc = (id: number, name: string) => ({ id, full_name: name, profile_picture_url: `https://p/${id}` })
  const member = (id: number, name: string, workouts: number, active_days = workouts) => ({
    account_id: id,
    name,
    workouts,
    points: workouts,
    calories: 0,
    distance: 0,
    active_days,
  })
  const statsOf = (by_member: ReturnType<typeof member>[]): Stats => ({
    challenge_id: 0,
    total_workouts: by_member.reduce((t, m) => t + m.workouts, 0),
    members: by_member.length,
    by_day: [],
    by_member,
  })

  // A: Ana 10, Bia 10, Caio 4, Duda 0 (nova). B: Ana 6, Bia 12, Caio 4, Edu 3 (saiu).
  const A = {
    stats: statsOf([member(1, 'Ana', 10), member(2, 'Bia', 10), member(3, 'Caio', 4)]),
    rankings: [
      { rank: 1, score: 10, account: acc(1, 'Ana') },
      { rank: 1, score: 10, account: acc(2, 'Bia') },
      { rank: 3, score: 4, account: acc(3, 'Caio') },
      { rank: 4, score: 0, account: acc(4, 'Duda') },
    ] as RankingEntry[],
  }
  const B = {
    stats: statsOf([member(1, 'Ana', 6), member(2, 'Bia', 12), member(3, 'Caio', 4), member(5, 'Edu', 3)]),
    rankings: [
      { rank: 1, score: 12, account: acc(2, 'Bia') },
      { rank: 2, score: 6, account: acc(1, 'Ana') },
      { rank: 3, score: 4, account: acc(3, 'Caio') },
      { rank: 4, score: 3, account: acc(5, 'Edu') },
    ] as RankingEntry[],
  }

  it('dense-ranks ties into the same position', () => {
    expect([...denseRank(new Map([[1, 10], [2, 10], [3, 4], [4, 0]]))]).toEqual([[1, 1], [2, 1], [3, 2], [4, 3]])
  })

  it('joins by account id with status, delta and summary', () => {
    const c = compareAthletes(A, B, 'total')
    expect(c.summary).toEqual({ both: 3, novo: 1, saiu: 1 })
    const ana = c.rows.find((r) => r.id === 1)!
    expect(ana).toMatchObject({ status: 'both', delta: 4, picture: 'https://p/1', trend: 'up' })
    expect(ana.a).toEqual({ workouts: 10, activeDays: 10, position: 1 })
    expect(ana.b).toEqual({ workouts: 6, activeDays: 6, position: 2 })
    expect(c.rows.find((r) => r.id === 4)).toMatchObject({ status: 'novo', b: null, delta: null, trend: null })
    expect(c.rows.find((r) => r.id === 4)!.a).toEqual({ workouts: 0, activeDays: 0, position: 4 })
    expect(c.rows.find((r) => r.id === 5)).toMatchObject({ status: 'saiu', a: null, delta: null })
  })

  it('uses dense positions by check-ins in dia mode', () => {
    const c = compareAthletes(A, B, 'dia')
    const pos = (id: number) => c.rows.find((r) => r.id === id)!
    expect(pos(1).a?.position).toBe(1)
    expect(pos(2).a?.position).toBe(1)
    expect(pos(3).a?.position).toBe(2)
    expect(pos(4).a?.position).toBe(3)
    expect(pos(3).b?.position).toBe(3)
    expect(pos(3).trend).toBe('up')
    expect(pos(2).trend).toBe('same')
  })

  it('lists the top movers up and down among athletes in both', () => {
    const c = compareAthletes(A, B, 'total')
    expect(c.movers.up.map((r) => r.name)).toEqual(['Ana'])
    expect(c.movers.down.map((r) => r.name)).toEqual(['Bia'])
  })

  it('sorts by delta, one-sided rows counting the missing side as 0', () => {
    const c = compareAthletes(A, B, 'total')
    expect(c.rows.map((r) => r.name)).toEqual(['Ana', 'Caio', 'Duda', 'Bia', 'Edu'])
    expect(sortByDelta(c.rows, 'asc').map((r) => r.name)).toEqual(['Edu', 'Bia', 'Caio', 'Duda', 'Ana'])
  })

  it('falls back to /stats names and keeps unknown active days as null', () => {
    const noDays = { ...member(7, 'Gil', 2), active_days: undefined }
    const c = compareAthletes({ stats: statsOf([noDays as never]), rankings: [] }, { stats: statsOf([]), rankings: [] }, 'dia')
    expect(c.rows[0]).toMatchObject({ name: 'Gil', picture: null, status: 'novo' })
    expect(c.rows[0].a).toEqual({ workouts: 2, activeDays: null, position: 1 })
  })
})

describe('movingAverage', () => {
  it('averages the trailing window, using the available days at the start', () => {
    expect(movingAverage([10, 20, 30, 40], 3)).toEqual([10, 15, 20, 30])
    expect(movingAverage([7, 7, 7, 7, 7, 7, 7, 14], 7)).toEqual([7, 7, 7, 7, 7, 7, 7, 8])
  })

  it('keeps gaps (undefined) as gaps and skips them in the window', () => {
    expect(movingAverage([10, undefined, 30], 2)).toEqual([10, undefined, 30])
    expect(movingAverage([10, 20, undefined, undefined], 7)).toEqual([10, 15, undefined, undefined])
    expect(movingAverage([], 7)).toEqual([])
  })
})

describe('sameWinners', () => {
  const acc = (id: number | null) => ({ id, full_name: 'X', profile_picture_url: null })
  it('compares winner sets regardless of order', () => {
    expect(sameWinners([acc(1)], [acc(1)])).toBe(true)
    expect(sameWinners([acc(1), acc(2)], [acc(2), acc(1)])).toBe(true)
    expect(sameWinners([acc(1)], [acc(2)])).toBe(false)
    expect(sameWinners([acc(1), acc(2)], [acc(1)])).toBe(false)
  })

  it('never matches accounts without id', () => {
    expect(sameWinners([acc(null)], [acc(null)])).toBe(false)
    expect(sameWinners([], [])).toBe(false)
  })
})

describe('buildSummary', () => {
  const side = (over: Partial<KpiSide>): KpiSide => ({
    workouts: 100,
    active: 40,
    members: 48,
    participation: 45,
    perAthlete: 2,
    hours: 10,
    avgMinutes: 40,
    ...over,
  })
  const vitor = {
    id: 1,
    name: 'Vitor Rett da Silva',
    picture: null,
    status: 'both' as const,
    a: { workouts: 23, activeDays: 13, position: 4 },
    b: { workouts: 9, activeDays: 9, position: 15 },
    delta: 14,
    trend: 'up' as const,
  }
  const athletes: AthleteComparison = {
    rows: [vitor],
    summary: { both: 40, novo: 8, saiu: 7 },
    movers: { up: [vitor], down: [] },
  }
  const base = { names: { a: 'Outubro', b: 'Setembro' }, mode: 'dia' as const, n: 25 }
  const text = (s: ReturnType<typeof buildSummary>) => s.map((x) => x.parts.map((p) => p.text).join(''))
  const strong = (s: ReturnType<typeof buildSummary>) => s.map((x) => x.parts.filter((p) => p.strong).map((p) => p.text))

  it('writes pace, participation, roster and top mover sentences', () => {
    const s = buildSummary({
      ...base,
      kpis: { a: side({ workouts: 571, participation: 45.2 }), b: side({ workouts: 606, participation: 48.1 }) },
      athletes,
    })
    expect(s.map((x) => x.id)).toEqual(['pace', 'participation', 'roster', 'mover'])
    expect(text(s)).toEqual([
      'Outubro está 6% atrás de Setembro no mesmo ponto (571 × 606 check-ins até o dia 25)',
      'Participação diária 3 p.p. menor (45% × 48%)',
      '8 atletas novos e 7 saíram; 40 estão nos dois',
      'Vitor Rett foi quem mais evoluiu (+14 check-ins)',
    ])
    expect(strong(s)).toEqual([['6% atrás'], ['3 p.p. menor'], ['8 atletas novos'], ['Vitor Rett']])
  })

  it('says ahead, tied and the whole challenge in total mode', () => {
    const ahead = buildSummary({ ...base, mode: 'total', kpis: { a: side({ workouts: 700 }), b: side({ workouts: 571 }) }, athletes: null })
    expect(text(ahead)[0]).toBe('Outubro está 23% à frente de Setembro no desafio inteiro (700 × 571 check-ins)')
    const tied = buildSummary({ ...base, kpis: { a: side({ workouts: 101 }), b: side({ workouts: 100 }) }, athletes: null })
    expect(text(tied)[0]).toBe('Outubro está empatado com Setembro no mesmo ponto (101 × 100 check-ins até o dia 25)')
    expect(text(tied)[1]).toBe('Participação diária igual (45% × 45%)')
  })

  it('uses singulars and skips what is missing', () => {
    const one: AthleteComparison = { rows: [], summary: { both: 1, novo: 1, saiu: 1 }, movers: { up: [], down: [] } }
    const s = buildSummary({ ...base, kpis: null, athletes: one })
    expect(text(s)).toEqual(['1 atleta novo e 1 saiu; 1 está nos dois'])
    const none: AthleteComparison = { rows: [], summary: { both: 3, novo: 0, saiu: 2 }, movers: { up: [], down: [] } }
    expect(text(buildSummary({ ...base, kpis: null, athletes: none }))).toEqual(['Nenhum atleta novo e 2 saíram; 3 estão nos dois'])
    expect(buildSummary({ ...base, kpis: null, athletes: null })).toEqual([])
    // Sem base (B zerado): sem frase de ritmo.
    const zero = buildSummary({ ...base, kpis: { a: side({ workouts: 5 }), b: side({ workouts: 0 }) }, athletes: null })
    expect(zero.map((x) => x.id)).toEqual(['participation'])
  })
})
