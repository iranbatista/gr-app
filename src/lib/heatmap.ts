import type { DayCount } from '../api/types'

export type HeatLevel = 0 | 1 | 2 | 3 | 4

export interface HeatCell {
  date: string
  count: number
  level: HeatLevel
  /** false nos dias que só completam a primeira/última semana. */
  inRange: boolean
}

const DAY = 86_400_000
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// Chaves "YYYY-MM-DD" viram meia-noite UTC: soma de dias sem tropeçar em fuso.
function toTime(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function toKey(t: number): string {
  return new Date(t).toISOString().slice(0, 10)
}

// Segunda-feira da semana do dia.
function mondayOf(t: number): number {
  return t - ((new Date(t).getUTCDay() + 6) % 7) * DAY
}

function level(count: number, max: number): HeatLevel {
  if (count <= 0 || max <= 0) return 0
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4))) as HeatLevel
}

/** Semanas (segunda a domingo) × 7 dias, do primeiro ao último dia com dado. */
export function buildHeatmap(days: DayCount[]): HeatCell[][] {
  if (days.length === 0) return []
  const counts = new Map(days.map((d) => [d.date, d.count]))
  const times = days.map((d) => toTime(d.date))
  const first = Math.min(...times)
  const last = Math.max(...times)
  const max = Math.max(...days.map((d) => d.count))

  const weeks: HeatCell[][] = []
  for (let start = mondayOf(first); start <= last; start += 7 * DAY) {
    const week: HeatCell[] = []
    for (let i = 0; i < 7; i++) {
      const t = start + i * DAY
      const date = toKey(t)
      const count = counts.get(date) ?? 0
      week.push({ date, count, level: level(count, max), inRange: t >= first && t <= last })
    }
    weeks.push(week)
  }
  return weeks
}

/** Rótulo de mês na primeira semana e onde a segunda-feira troca de mês. */
export function monthLabels(weeks: HeatCell[][]): { week: number; label: string }[] {
  const out: { week: number; label: string }[] = []
  let prev = -1
  weeks.forEach((w, i) => {
    const month = Number(w[0].date.slice(5, 7)) - 1
    if (month !== prev) out.push({ week: i, label: MONTHS[month] })
    prev = month
  })
  return out
}

/** Total por semana (segunda-feira), sem buracos entre a primeira e a última. */
export function weeklyTotals(days: DayCount[]): { weekStart: string; count: number }[] {
  if (days.length === 0) return []
  const sums = new Map<number, number>()
  for (const d of days) {
    const monday = mondayOf(toTime(d.date))
    sums.set(monday, (sums.get(monday) ?? 0) + d.count)
  }
  const keys = [...sums.keys()]
  const out: { weekStart: string; count: number }[] = []
  for (let t = Math.min(...keys); t <= Math.max(...keys); t += 7 * DAY) {
    out.push({ weekStart: toKey(t), count: sums.get(t) ?? 0 })
  }
  return out
}
