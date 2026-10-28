import type { components } from './schema'

type Schemas = components['schemas']

export type Account = Schemas['Account']
export type Challenge = Schemas['Challenge']
export type RankingEntry = Schemas['RankingEntry']
export type Workout = Schemas['Workout']
export type WorkoutPage = Schemas['WorkoutPage']
export type Reaction = Schemas['Reaction']
export type Comment = Schemas['Comment']
export type Insights = Schemas['Insights']
export type InsightsTotals = Schemas['InsightsTotals']
export type DailyPoint = Schemas['DailyPoint']
export type Periods = Schemas['Periods']
export type WeekdayDuration = Schemas['WeekdayDuration']
export type Streak = Schemas['Streak']
export type Award = Schemas['Award']
export type Awards = Schemas['Awards']
export type TopWorkout = Schemas['TopWorkout']
export type EmojiCount = Schemas['EmojiCount']

// `media` vem sem schema na API (unknown): formato observado nos check-ins reais.
export interface WorkoutMedium {
  id: number
  url: string
  width?: number | null
  height?: number | null
  /** "image/jpg", "video/mp4"… */
  medium_type?: string | null
  thumbnail_url?: string | null
  aspect_ratio?: number | null
}

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
