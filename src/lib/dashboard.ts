import type { Account, DailyPoint, Insights, Periods, Streak, WeekdayDuration } from '../api/types'
import { localDayKey, parseDate } from './format'
import { shortName } from './visual'

const DAY = 86_400_000
const LOCALE = 'pt-BR'

/** Rótulos curtos, 0 = segunda (como a API). */
export const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

// Chaves "YYYY-MM-DD" como dias inteiros: diferença e soma sem tropeçar em fuso/horário de verão.
function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / DAY)
}

export function addDays(key: string, n: number): string {
  return new Date((dayNumber(key) + n) * DAY).toISOString().slice(0, 10)
}

export function daysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from)
}

export function todayKey(now: Date = new Date()): string {
  return localDayKey(now.toISOString())
}

// Datas do desafio chegam como dia de calendário (com ou sem meia-noite UTC).
function calendarKey(iso: string): string {
  return localDayKey(parseDate(iso).toISOString())
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export interface Progress {
  state: 'upcoming' | 'running' | 'ended'
  /** 0–100; null quando o desafio não tem fim. */
  pct: number | null
  text: string
}

/** Barra de progresso do desafio, em dias de calendário locais. */
export function challengeProgress(
  start?: string | null,
  end?: string | null,
  now: Date = new Date(),
): Progress | null {
  if (!start) return null
  const today = todayKey(now)
  const first = calendarKey(start)
  const last = end ? calendarKey(end) : null

  const until = daysBetween(today, first)
  if (until > 0) {
    return { state: 'upcoming', pct: 0, text: until === 1 ? 'Começa amanhã' : `Começa em ${until} dias` }
  }
  if (last && today > last) {
    const since = daysBetween(last, today)
    return { state: 'ended', pct: 100, text: since === 1 ? 'Encerrado ontem' : `Encerrado há ${since} dias` }
  }
  const day = daysBetween(first, today) + 1
  if (!last) return { state: 'running', pct: null, text: `Dia ${day}` }
  const total = daysBetween(first, last) + 1
  const left = total - day
  const pct = Math.round((day / total) * 100)
  const tail = left === 0 ? 'último dia' : left === 1 ? 'falta 1 dia' : `faltam ${left} dias`
  return { state: 'running', pct, text: `Dia ${day} de ${total} · ${pct}% · ${tail}` }
}

/** Dia de referência dos KPIs: hoje, ou o último dia se o desafio já acabou. */
export function referenceDay(end?: string | null, now: Date = new Date()): { day: string; isToday: boolean } {
  const today = todayKey(now)
  const last = end ? calendarKey(end) : null
  return last && today > last ? { day: last, isToday: false } : { day: today, isToday: true }
}

/** Os n dias que terminam em `ref` (inclusive), do mais antigo ao mais novo. */
export function lastDays(ref: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(ref, i - n + 1))
}

export interface SparkPoint {
  date: string
  value: number
}

export interface Kpis {
  checkins: { value: number; delta: number; series: SparkPoint[] }
  participation: { pct: number; avg7: number; series: SparkPoint[] }
  perAthlete: { value: number; active: number; series: SparkPoint[] }
  hours: { hours: number; avgMinutes: number | null; series: SparkPoint[] }
}

export const SPARK_DAYS = 14

const pct = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0)

/** KPIs do topo e suas sparklines (últimos 14 dias até `ref`, buracos = 0). */
export function dashboardKpis(ins: Insights, ref: string): Kpis {
  const byDay = new Map<string, DailyPoint>(ins.daily.map((d) => [d.date, d]))
  const at = (key: string) => byDay.get(key)
  const members = ins.members_total
  const window = lastDays(ref, SPARK_DAYS)

  const today = at(ref)?.workouts ?? 0
  const yesterday = at(addDays(ref, -1))?.workouts ?? 0
  const week = lastDays(ref, 7).map((k) => pct(at(k)?.athletes ?? 0, members))

  // Média acumulada por atleta: soma tudo até o dia, inclusive antes da janela.
  const sorted = [...ins.daily].sort((a, b) => a.date.localeCompare(b.date))
  const cumulative = window.map((date) => {
    const total = sorted.reduce((t, d) => (d.date <= date ? t + d.workouts : t), 0)
    return { date, value: members > 0 ? total / members : 0 }
  })

  return {
    checkins: {
      value: today,
      delta: today - yesterday,
      series: window.map((date) => ({ date, value: at(date)?.workouts ?? 0 })),
    },
    participation: {
      pct: pct(at(ref)?.athletes ?? 0, members),
      avg7: week.reduce((t, v) => t + v, 0) / week.length,
      series: window.map((date) => ({ date, value: pct(at(date)?.athletes ?? 0, members) })),
    },
    perAthlete: {
      value: members > 0 ? ins.totals.workouts / members : 0,
      active: ins.totals.athletes_active,
      series: cumulative,
    },
    hours: {
      hours: ins.totals.minutes / 60,
      // Por check-in (inclui os sem duração): a API não diz quantos têm duração.
      avgMinutes: ins.totals.workouts > 0 ? ins.totals.minutes / ins.totals.workouts : null,
      series: window.map((date) => ({ date, value: at(date)?.minutes ?? 0 })),
    },
  }
}

export function formatHours(h: number): string {
  const digits = h < 10 && h > 0 ? 1 : 0
  return `${h.toLocaleString(LOCALE, { maximumFractionDigits: digits, minimumFractionDigits: 0 })} h`
}

export function formatDecimal(n: number): string {
  return n.toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function formatDelta(n: number): string {
  // Sinal de menos tipográfico, não hífen.
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0'
}

export function hourLabel(h: number): string {
  return `${h}h`
}

/** Célula de pico do punch card (a primeira, em empate); null sem check-ins. */
export function peakSlot(grid: number[][]): { weekday: number; hour: number; count: number } | null {
  let peak: { weekday: number; hour: number; count: number } | null = null
  for (let weekday = 0; weekday < grid.length; weekday++) {
    for (let hour = 0; hour < grid[weekday].length; hour++) {
      const count = grid[weekday][hour]
      if (count > 0 && (!peak || count > peak.count)) peak = { weekday, hour, count }
    }
  }
  return peak
}

export function slotLabel(weekday: number, hour: number): string {
  return `${WEEKDAYS[weekday]} ${hourLabel(hour)}`
}

export const checkinsText = (n: number) => (n === 0 ? 'nenhum check-in' : plural(n, 'check-in', 'check-ins'))

// Faixas da API: madrugada 0–4h, manhã 5–11h, tarde 12–17h, noite 18–23h (intervalos semiabertos).
export const PERIODS = [
  { key: 'madrugada', label: 'Madrugada', range: '0h–5h' },
  { key: 'manha', label: 'Manhã', range: '5h–12h' },
  { key: 'tarde', label: 'Tarde', range: '12h–18h' },
  { key: 'noite', label: 'Noite', range: '18h–24h' },
] as const satisfies readonly { key: keyof Periods; label: string; range: string }[]

export type PeriodKey = (typeof PERIODS)[number]['key']

/** Períodos com contagem e % do total (períodos zerados ficam, com 0%). */
export function periodRows(p: Periods) {
  const total = PERIODS.reduce((t, x) => t + p[x.key], 0)
  return PERIODS.map((x) => {
    const count = p[x.key]
    return { ...x, count, pct: Math.round(pct(count, total)) }
  })
}

/** Barras de duração média: null vira barra vazia (valor 0, sem duração registrada). */
export function durationRows(rows: WeekdayDuration[]) {
  return [...rows]
    .sort((a, b) => a.weekday - b.weekday)
    .map((r) => ({
      label: WEEKDAYS[r.weekday],
      avg: r.avg_minutes ?? null,
      value: r.avg_minutes == null ? 0 : Math.round(r.avg_minutes),
      workouts: r.workouts,
    }))
}

export function durationText(r: { label: string; avg: number | null; workouts: number }): string {
  if (r.avg == null) return `${r.label} · sem duração registrada`
  return `${r.label} · média ${Math.round(r.avg)} min · ${plural(r.workouts, 'treino', 'treinos')}`
}

/** Quem divide o topo de uma métrica de sequência (vazio se o máximo é 0). */
export function streakLeaders(streaks: Streak[], key: 'longest' | 'current'): { value: number; accounts: Account[] } {
  const max = Math.max(0, ...streaks.map((s) => s[key]))
  if (max === 0) return { value: 0, accounts: [] }
  return { value: max, accounts: streaks.filter((s) => s[key] === max).map((s) => s.account) }
}

/** "Ana", "Ana e Bia", "Ana, Bia e Caio", "Ana, Bia e mais 2". Só o primeiro nome em empate. */
export function joinNames(names: (string | null | undefined)[]): string {
  const clean = names.map((n) => (n ?? '').trim() || 'Sem nome')
  if (clean.length === 1) return shortName(clean[0])
  const first = clean.map((n) => n.split(/\s+/)[0])
  if (first.length <= 3) return `${first.slice(0, -1).join(', ')} e ${first[first.length - 1]}`
  return `${first.slice(0, 2).join(', ')} e mais ${first.length - 2}`
}

/** Escala sutil das pills de emoji: 1rem a 1.5rem pela raiz da proporção. */
export function emojiSize(count: number, max: number): number {
  if (max <= 0) return 1
  return Math.round((1 + 0.5 * Math.sqrt(count / max)) * 100) / 100
}
