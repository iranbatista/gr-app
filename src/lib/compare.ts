import type { Account, Challenge, DailyPoint, Insights, Periods, RankingEntry, Stats, WeekdayDuration } from '../api/types'
import { PERIODS, WEEKDAYS, addDays, calendarKey, daysBetween, todayKey } from './dashboard'
import { parseDate } from './format'
import { isActive, shortName } from './visual'

export type CompareMode = 'dia' | 'total'

// ---------- par de desafios ----------

const byStartDesc = (x: Challenge, y: Challenge) =>
  (y.start_date ? parseDate(y.start_date).getTime() : -Infinity) -
  (x.start_date ? parseDate(x.start_date).getTime() : -Infinity)

/** O anterior por start_date; sem anterior, o mais próximo depois dele. null se não há outro. */
export function previousOf(list: Challenge[], id: number): Challenge | null {
  const sorted = [...list].sort(byStartDesc)
  const i = sorted.findIndex((c) => c.id === id)
  if (i < 0) return null
  return sorted[i + 1] ?? sorted[i - 1] ?? null
}

/** A = ativo mais recente (ou o mais recente de todos), B = o anterior a ele. */
export function defaultPair(list: Challenge[], now: Date = new Date()): [number, number] | null {
  const sorted = [...list].sort(byStartDesc)
  const a = sorted.find((c) => isActive(c, now)) ?? sorted[0]
  if (!a) return null
  const b = previousOf(list, a.id)
  return b ? [a.id, b.id] : null
}

/** Nomes curtos para o título: tira o prefixo comum ("Desafio SplitFit - Outubro" → "Outubro"). */
export function shortLabels(a?: string | null, b?: string | null): [string, string] {
  const na = (a ?? '').trim()
  const nb = (b ?? '').trim()
  const wa = na.split(/\s+/)
  const wb = nb.split(/\s+/)
  let k = 0
  while (k < wa.length - 1 && k < wb.length - 1 && wa[k].toLowerCase() === wb[k].toLowerCase()) k++
  if (k === 0) return [na, nb]
  const strip = (w: string[]) => w.slice(k).join(' ').replace(/^[\s\-–—:·|]+/, '').trim()
  const sa = strip(wa)
  const sb = strip(wb)
  return sa && sb && sa !== sb ? [sa, sb] : [na, nb]
}

// ---------- alinhamento ----------

export interface Span {
  /** Primeiro dia local (YYYY-MM-DD); null sem data de início. */
  start: string | null
  /** Duração total em dias; null sem fim. */
  length: number | null
  /** Dias já corridos (0 antes de começar, limitado à duração). */
  elapsed: number
  running: boolean
}

export function challengeSpan(c: Challenge, now: Date = new Date()): Span {
  if (!c.start_date) return { start: null, length: null, elapsed: 0, running: false }
  const start = calendarKey(c.start_date)
  const today = todayKey(now)
  const length = c.end_date ? daysBetween(start, calendarKey(c.end_date)) + 1 : null
  const raw = daysBetween(start, today) + 1
  const elapsed = Math.max(0, length == null ? raw : Math.min(raw, length))
  const running = raw >= 1 && (length == null || raw <= length)
  return { start, length, elapsed, running }
}

/** Dias com dados: até hoje se está em andamento, o desafio inteiro se acabou, 0 se não começou. */
export function availableDays(s: Span): number {
  return s.elapsed
}

export interface Alignment {
  /** Dia de corte comum (modo dia); null quando não dá para alinhar. */
  n: number | null
  defaultMode: CompareMode
}

/**
 * N = dias corridos do desafio em andamento (o menor, se os dois estão), nunca além
 * da duração do outro. Sem nenhum em andamento: o menor número de dias entre os dois.
 */
export function alignment(a: Span, b: Span): Alignment {
  if (!a.start || !b.start) return { n: null, defaultMode: 'total' }
  const n = Math.min(availableDays(a), availableDays(b))
  if (n < 1) return { n: null, defaultMode: 'total' }
  return { n, defaultMode: a.running || b.running ? 'dia' : 'total' }
}

/** Data de corte do dia N: start + N − 1. */
export function cutoffDate(start: string, n: number): string {
  return addDays(start, n - 1)
}

/** Dias considerados de cada lado no modo escolhido. */
export function daysFor(s: Span, mode: CompareMode, n: number | null): number {
  return mode === 'dia' && n != null ? n : availableDays(s)
}

export function dayKeys(start: string, n: number): string[] {
  return Array.from({ length: Math.max(0, n) }, (_, i) => addDays(start, i))
}

// ---------- variação ----------

/** Variação % de A sobre B; null quando B é 0 e A não (sem base). */
export function deltaPct(a: number, b: number): number | null {
  if (b === 0) return a === 0 ? 0 : null
  return ((a - b) / Math.abs(b)) * 100
}

const signed = new Intl.NumberFormat('pt-BR', { signDisplay: 'exceptZero', maximumFractionDigits: 0 })

/** "+12%", "-19%", "0%"; null vira "novo" (B zerado). */
export function formatDeltaPct(d: number | null): string {
  if (d == null) return 'novo'
  return `${signed.format(Math.round(d) || 0)}%`
}

/** Diferença em pontos percentuais: "+3 p.p.". */
export function formatDeltaPp(d: number): string {
  return `${signed.format(Math.round(d) || 0)} p.p.`
}

export function formatSigned(n: number): string {
  return signed.format(n)
}

// ---------- placar ----------

export interface KpiSide {
  workouts: number
  active: number
  members: number
  /** Média diária de % de membros com check-in. */
  participation: number
  perAthlete: number
  hours: number
  /** Minutos por check-in; null sem check-ins. */
  avgMinutes: number | null
}

const share = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0)

export function kpiSide(ins: Insights, start: string | null, days: number): KpiSide {
  const members = ins.members_total
  const byDay = new Map(ins.daily.map((d) => [d.date, d]))
  const keys = start ? dayKeys(start, days) : []
  const participation =
    keys.length > 0 ? keys.reduce((t, k) => t + share(byDay.get(k)?.athletes ?? 0, members), 0) / keys.length : 0
  const { workouts, minutes, athletes_active } = ins.totals
  return {
    workouts,
    active: athletes_active,
    members,
    participation,
    perAthlete: members > 0 ? workouts / members : 0,
    hours: minutes / 60,
    avgMinutes: workouts > 0 ? minutes / workouts : null,
  }
}

// ---------- ritmo ----------

export interface PacePoint {
  day: number
  /** Check-ins acumulados até o dia (undefined fora do período do lado). */
  aCum?: number
  bCum?: number
  /** Diferença acumulada A − B (só nos dias que existem nos dois). */
  diff?: number
  /** % de membros com check-in no dia. */
  aPct?: number
  bPct?: number
  /** Média móvel de 7 dias da participação. */
  aAvg?: number
  bAvg?: number
}

export const AVG_DAYS = 7

/** Média móvel dos últimos k pontos (menos no começo); buraco continua buraco. */
export function movingAverage(series: (number | undefined)[], k: number): (number | undefined)[] {
  return series.map((v, i) => {
    if (v == null) return undefined
    const win = series.slice(Math.max(0, i - k + 1), i + 1).filter((x): x is number => x != null)
    return win.reduce((t, x) => t + x, 0) / win.length
  })
}

interface PaceSide {
  ins: Insights
  start: string | null
  days: number
}

function sideSeries(s: PaceSide): { cum: number; pct: number }[] {
  if (!s.start) return []
  const byDay = new Map<string, DailyPoint>(s.ins.daily.map((d) => [d.date, d]))
  // Check-ins antes do dia 1 (raro) entram no acumulado do primeiro dia.
  let cum = s.ins.daily.reduce((t, d) => (d.date < s.start! ? t + d.workouts : t), 0)
  return dayKeys(s.start, s.days).map((k) => {
    const p = byDay.get(k)
    cum += p?.workouts ?? 0
    return { cum, pct: share(p?.athletes ?? 0, s.ins.members_total) }
  })
}

/** Séries alinhadas por dia 1..N; dias sem check-in contam 0. */
export function paceSeries(a: PaceSide, b: PaceSide): PacePoint[] {
  const sa = sideSeries(a)
  const sb = sideSeries(b)
  const n = Math.max(sa.length, sb.length)
  const aAvg = movingAverage(sa.map((x) => x.pct), AVG_DAYS)
  const bAvg = movingAverage(sb.map((x) => x.pct), AVG_DAYS)
  return Array.from({ length: n }, (_, i) => ({
    day: i + 1,
    aCum: sa[i]?.cum,
    bCum: sb[i]?.cum,
    diff: sa[i] && sb[i] ? sa[i].cum - sb[i].cum : undefined,
    aPct: sa[i]?.pct,
    bPct: sb[i]?.pct,
    aAvg: aAvg[i],
    bAvg: bAvg[i],
  }))
}

// ---------- quando treina ----------

export interface PeriodPair {
  key: keyof Periods
  label: string
  range: string
  a: number
  b: number
  /** % do total de check-ins de cada lado: compara grupos de tamanhos diferentes. */
  aPct: number
  bPct: number
}

export function periodPairs(a: Periods, b: Periods): PeriodPair[] {
  const ta = PERIODS.reduce((t, x) => t + a[x.key], 0)
  const tb = PERIODS.reduce((t, x) => t + b[x.key], 0)
  return PERIODS.map((x) => ({
    key: x.key,
    label: x.label,
    range: x.range,
    a: a[x.key],
    b: b[x.key],
    aPct: Math.round(share(a[x.key], ta)),
    bPct: Math.round(share(b[x.key], tb)),
  }))
}

/** Hora com mais check-ins somando os dias da semana; null sem check-ins. */
export function peakHour(grid: number[][]): number | null {
  const hours = new Array<number>(24).fill(0)
  for (const row of grid) row.forEach((v, h) => (hours[h] += v))
  const max = Math.max(...hours)
  return max > 0 ? hours.indexOf(max) : null
}

export interface DurationPair {
  label: string
  a: number | null
  b: number | null
}

export function durationPairs(a: WeekdayDuration[], b: WeekdayDuration[]): DurationPair[] {
  const avg = (rows: WeekdayDuration[], w: number) => {
    const v = rows.find((r) => r.weekday === w)?.avg_minutes
    return v == null ? null : Math.round(v)
  }
  return WEEKDAYS.map((label, w) => ({ label, a: avg(a, w), b: avg(b, w) }))
}

// ---------- destaques ----------

/** Junta duas listas de prêmios na mesma ordem; some a linha sem vencedor nos dois lados. */
export function pairSlots<T>(a: (T | null)[], b: (T | null)[]): { index: number; a: T | null; b: T | null }[] {
  return Array.from({ length: Math.max(a.length, b.length) }, (_, index) => ({
    index,
    a: a[index] ?? null,
    b: b[index] ?? null,
  })).filter((r) => r.a || r.b)
}

/** Mesmos vencedores dos dois lados (conjunto de ids, ordem não importa; empate e dupla incluídos). */
export function sameWinners(a: Account[], b: Account[]): boolean {
  if (a.length === 0 || a.length !== b.length) return false
  if (a.some((x) => x.id == null) || b.some((x) => x.id == null)) return false
  const ids = new Set(a.map((x) => x.id))
  return b.every((x) => ids.has(x.id))
}

// ---------- atletas ----------

export type AthleteStatus = 'both' | 'novo' | 'saiu'

export interface AthleteSide {
  workouts: number
  activeDays: number | null
  /** Posição no ranking; null quando não há. */
  position: number | null
}

export interface AthleteRow {
  id: number
  name: string
  picture: string | null
  status: AthleteStatus
  a: AthleteSide | null
  b: AthleteSide | null
  /** Check-ins A − B, só para quem está nos dois. */
  delta: number | null
  /** Posição melhorou (up), piorou (down) ou ficou (same); null sem as duas posições. */
  trend: 'up' | 'down' | 'same' | null
}

export interface AthleteData {
  stats: Stats
  rankings: RankingEntry[]
}

/** Ranking denso: empate divide a posição e a seguinte não pula (10, 10, 8 → 1, 1, 2). */
export function denseRank(values: Map<number, number>): Map<number, number> {
  const distinct = [...new Set(values.values())].sort((x, y) => y - x)
  const pos = new Map(distinct.map((v, i) => [v, i + 1]))
  return new Map([...values].map(([id, v]) => [id, pos.get(v)!]))
}

interface Person {
  name: string
  picture: string | null
  side: AthleteSide
}

function people(d: AthleteData, mode: CompareMode): Map<number, Person> {
  const out = new Map<number, Person>()
  const stats = new Map(d.stats.by_member.map((m) => [m.account_id, m]))
  const official = new Map<number, number | null>()
  const info = new Map<number, { name: string | null; picture: string | null }>()
  for (const r of d.rankings) {
    if (r.account.id == null) continue
    official.set(r.account.id, r.rank ?? null)
    info.set(r.account.id, { name: r.account.full_name ?? null, picture: r.account.profile_picture_url ?? null })
  }
  // Membros = ranking (todos, mesmo sem check-in) ∪ quem tem check-in no /stats.
  const ids = new Set([...info.keys(), ...stats.keys()])
  const workouts = new Map([...ids].map((id) => [id, stats.get(id)?.workouts ?? 0]))
  const dense = denseRank(workouts)
  for (const id of ids) {
    const m = stats.get(id)
    out.set(id, {
      name: info.get(id)?.name ?? m?.name ?? 'Sem nome',
      picture: info.get(id)?.picture ?? null,
      side: {
        workouts: workouts.get(id)!,
        activeDays: m?.active_days ?? (m ? null : 0),
        position: mode === 'dia' ? dense.get(id)! : (official.get(id) ?? null),
      },
    })
  }
  return out
}

function trendOf(a: AthleteSide | null, b: AthleteSide | null): AthleteRow['trend'] {
  if (a?.position == null || b?.position == null) return null
  return a.position < b.position ? 'up' : a.position > b.position ? 'down' : 'same'
}

export interface AthleteComparison {
  rows: AthleteRow[]
  summary: Record<AthleteStatus, number>
  movers: { up: AthleteRow[]; down: AthleteRow[] }
}

const byName = (x: AthleteRow, y: AthleteRow) => x.name.localeCompare(y.name, 'pt-BR')

/** Casa os atletas por account_id: nos dois, novos (só A) e saíram (só B). */
export function compareAthletes(a: AthleteData, b: AthleteData, mode: CompareMode, moversCount = 3): AthleteComparison {
  const pa = people(a, mode)
  const pb = people(b, mode)
  const rows: AthleteRow[] = []
  for (const id of new Set([...pa.keys(), ...pb.keys()])) {
    const x = pa.get(id)
    const y = pb.get(id)
    const sa = x?.side ?? null
    const sb = y?.side ?? null
    rows.push({
      id,
      name: x?.name ?? y!.name,
      picture: x?.picture ?? y?.picture ?? null,
      status: x && y ? 'both' : x ? 'novo' : 'saiu',
      a: sa,
      b: sb,
      delta: sa && sb ? sa.workouts - sb.workouts : null,
      trend: trendOf(sa, sb),
    })
  }
  const both = rows.filter((r) => r.status === 'both')
  return {
    rows: sortByDelta(rows, 'desc'),
    summary: {
      both: both.length,
      novo: rows.filter((r) => r.status === 'novo').length,
      saiu: rows.filter((r) => r.status === 'saiu').length,
    },
    movers: {
      up: both
        .filter((r) => r.delta! > 0)
        .sort((x, y) => y.delta! - x.delta! || byName(x, y))
        .slice(0, moversCount),
      down: both
        .filter((r) => r.delta! < 0)
        .sort((x, y) => x.delta! - y.delta! || byName(x, y))
        .slice(0, moversCount),
    },
  }
}

/** Δ para ordenar: quem só está de um lado conta o outro como 0. */
export function sortDelta(r: AthleteRow): number {
  return r.delta ?? (r.a?.workouts ?? 0) - (r.b?.workouts ?? 0)
}

export function sortByDelta(rows: AthleteRow[], dir: 'asc' | 'desc'): AthleteRow[] {
  const sign = dir === 'desc' ? -1 : 1
  return [...rows].sort((x, y) => sign * (sortDelta(x) - sortDelta(y)) || byName(x, y))
}

// ---------- resumo ----------

export interface SummaryPart {
  text: string
  strong?: boolean
}

export interface SummaryItem {
  id: 'pace' | 'participation' | 'roster' | 'mover'
  /** Direção da frase para o ícone: A melhor, pior ou igual. */
  tone: 'up' | 'down' | 'same' | 'info'
  parts: SummaryPart[]
}

interface SummaryInput {
  names: { a: string; b: string }
  mode: CompareMode
  n: number | null
  kpis: { a: KpiSide; b: KpiSide } | null
  athletes: AthleteComparison | null
}

/** Abaixo disso a diferença de check-ins conta como empate. */
const TIE_PCT = 2

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Veredito em frases curtas; cada frase some quando falta o dado dela. */
export function buildSummary({ names, mode, n, kpis, athletes }: SummaryInput): SummaryItem[] {
  const out: SummaryItem[] = []
  if (kpis) {
    const { a, b } = kpis
    const d = deltaPct(a.workouts, b.workouts)
    if (d != null) {
      const where =
        mode === 'dia' && n != null
          ? `no mesmo ponto (${a.workouts} × ${b.workouts} check-ins até o dia ${n})`
          : `no desafio inteiro (${a.workouts} × ${b.workouts} check-ins)`
      const tied = Math.abs(d) < TIE_PCT
      const pct = `${Math.round(Math.abs(d))}%`
      out.push({
        id: 'pace',
        tone: tied ? 'same' : d > 0 ? 'up' : 'down',
        parts: tied
          ? [{ text: `${names.a} está ` }, { text: 'empatado', strong: true }, { text: ` com ${names.b} ${where}` }]
          : [
              { text: `${names.a} está ` },
              { text: `${pct} ${d > 0 ? 'à frente' : 'atrás'}`, strong: true },
              { text: ` de ${names.b} ${where}` },
            ],
      })
    }
    const pa = Math.round(a.participation)
    const pb = Math.round(b.participation)
    const pp = Math.round(a.participation - b.participation)
    out.push({
      id: 'participation',
      tone: pp === 0 ? 'same' : pp > 0 ? 'up' : 'down',
      parts: [
        { text: 'Participação diária ' },
        { text: pp === 0 ? 'igual' : `${Math.abs(pp)} p.p. ${pp > 0 ? 'maior' : 'menor'}`, strong: true },
        { text: ` (${pa}% × ${pb}%)` },
      ],
    })
  }
  if (athletes) {
    const { both, novo, saiu } = athletes.summary
    out.push({
      id: 'roster',
      tone: 'info',
      parts: [
        { text: novo === 0 ? 'Nenhum atleta novo' : count(novo, 'atleta novo', 'atletas novos'), strong: true },
        { text: ` e ${count(saiu, 'saiu', 'saíram')}; ${count(both, 'está nos dois', 'estão nos dois')}` },
      ],
    })
    const top = athletes.movers.up[0]
    if (top) {
      out.push({
        id: 'mover',
        tone: 'up',
        parts: [
          { text: shortName(top.name), strong: true },
          { text: ` foi quem mais evoluiu (${formatSigned(top.delta!)} check-ins)` },
        ],
      })
    }
  }
  return out
}
