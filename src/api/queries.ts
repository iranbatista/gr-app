import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { apiGet } from './client'
import type { Challenge, RankingEntry, Stats, SyncMeta, WorkoutPage } from './types'

export const PAGE_SIZE = 30
const MAX_LIMIT = 1000

export interface WorkoutFilters {
  member?: number
  since?: string
  until?: string
}

// occurred_on é guardado como "2026-10-27T21:50:54.000000Z" (UTC) e comparado por string;
// converte o dia de calendário local em limites UTC no mesmo formato (fração de 6 dígitos).
export function localDayBound(day: string, end: boolean): string {
  const d = new Date(end ? `${day}T23:59:59.999` : `${day}T00:00:00`)
  return d.toISOString().replace('Z', end ? '999Z' : '000Z')
}

export function workoutParams(f: WorkoutFilters, limit: number, offset: number) {
  return {
    limit,
    offset,
    member_id: f.member,
    since: f.since ? localDayBound(f.since, false) : undefined,
    until: f.until ? localDayBound(f.until, true) : undefined,
  }
}

export function nextOffset(page: WorkoutPage): number | undefined {
  const next = page.offset + page.items.length
  return next < page.total ? next : undefined
}

export function useChallenges() {
  return useQuery({
    queryKey: ['challenges'],
    queryFn: () => apiGet<Challenge[]>('/challenges'),
  })
}

export function useChallenge(id: number) {
  return useQuery({
    queryKey: ['challenge', id],
    queryFn: () => apiGet<Challenge>(`/challenges/${id}`),
  })
}

export function useRankings(id: number) {
  return useQuery({
    queryKey: ['rankings', id],
    queryFn: () => apiGet<RankingEntry[]>(`/challenges/${id}/rankings`),
  })
}

export function useStats(id: number) {
  return useQuery({
    queryKey: ['stats', id],
    queryFn: () => apiGet<Stats>(`/challenges/${id}/stats`),
  })
}

export function useWorkouts(id: number, filters: WorkoutFilters) {
  return useInfiniteQuery({
    queryKey: ['workouts', id, filters],
    queryFn: ({ pageParam }) =>
      apiGet<WorkoutPage>(`/challenges/${id}/workouts`, workoutParams(filters, PAGE_SIZE, pageParam)),
    initialPageParam: 0,
    getNextPageParam: nextOffset,
  })
}

// Todos os check-ins de um membro (até o máximo da API) para o gráfico por dia.
export function useMemberWorkoutsAll(id: number, member: number) {
  return useQuery({
    queryKey: ['workouts', id, { member, all: true }],
    queryFn: () =>
      apiGet<WorkoutPage>(`/challenges/${id}/workouts`, workoutParams({ member }, MAX_LIMIT, 0)),
  })
}

export function useSync() {
  return useQuery({
    queryKey: ['sync'],
    queryFn: () => apiGet<SyncMeta>('/meta/sync'),
  })
}
