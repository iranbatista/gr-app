import type { components } from './schema'

type Schemas = components['schemas']

export type Account = Schemas['Account']
export type Challenge = Schemas['Challenge']
export type RankingEntry = Schemas['RankingEntry']
export type Workout = Schemas['Workout']
export type WorkoutPage = Schemas['WorkoutPage']

// /stats e /meta/sync não têm response_model na API: tipos espelham api.py.
export interface DayCount {
  date: string
  count: number
}

export interface MemberStats {
  account_id: number
  name: string | null
  workouts: number
  points: number
  calories: number
  distance: number
  /** Dias distintos com check-in. Opcional até a API nova estar no ar. */
  active_days?: number
}

export interface Stats {
  challenge_id: number
  total_workouts: number
  members: number
  by_day: DayCount[]
  by_member: MemberStats[]
}

export interface SyncMeta {
  last_synced_at: string | null
  per_challenge: { challenge_id: number; last_date: string | null }[]
}
