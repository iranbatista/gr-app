import type { MemberStats } from '../api/types'
import { parseDate } from './format'

export function initials(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function gradientFor(seed: string): string {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  const hue = hash % 360
  return `linear-gradient(135deg, hsl(${hue} 70% 50%), hsl(${(hue + 40) % 360} 70% 35%))`
}

export function isActive(c: { end_date?: string | null }, today: Date = new Date()): boolean {
  if (!c.end_date) return true
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return parseDate(c.end_date) >= startOfToday
}

// Rótulo curto para eixo de gráfico: no máximo os dois primeiros nomes.
export function shortName(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).join(' ')
}

export type MemberMetric = 'checkins' | 'dias'

export function metricValue(m: MemberStats, metric: MemberMetric): number {
  return metric === 'dias' ? (m.active_days ?? 0) : m.workouts
}

/** Ordena pela métrica escolhida (maior primeiro); empate pelo nome. */
export function rankMembers(data: MemberStats[], metric: MemberMetric): MemberStats[] {
  return [...data].sort(
    (a, b) => metricValue(b, metric) - metricValue(a, metric) || (a.name ?? '').localeCompare(b.name ?? '', 'pt-BR'),
  )
}
