import type { Challenge, Comment, RankingEntry, Stats, SyncMeta, Workout } from '../api/types'

export const API = 'http://api.test'

export const ana = { id: 11, full_name: 'Ana Souza', profile_picture_url: null }
export const bruno = { id: 12, full_name: 'Bruno Lima', profile_picture_url: null }

export const challenge: Challenge = {
  id: 1,
  name: 'Desafio Outubro',
  description: 'Treinar todo dia',
  code: 'ABC',
  start_date: '2026-10-01',
  end_date: '2099-12-31',
  group_type: null,
  score_by: 'workouts',
  teams_enabled: false,
  profile_picture_url: 'https://img.test/c1.jpg',
  member_count: 2,
  synced_at: '2026-10-27T12:00:00Z',
}

export const oldChallenge: Challenge = {
  ...challenge,
  id: 2,
  name: 'Desafio Antigo',
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  profile_picture_url: null,
}

export const rankings: RankingEntry[] = [
  { rank: 1, score: 10, account: ana },
  { rank: 2, score: 7, account: bruno },
]

export function makeWorkout(over: Partial<Workout> = {}): Workout {
  return {
    id: 100,
    challenge_id: 1,
    account: ana,
    occurred_at: '2026-10-20T10:00:00Z',
    created_at: '2026-10-20T10:05:00Z',
    title: 'Corrida',
    activity_type: 'running',
    duration: 80,
    distance: 5.2,
    calories: 400,
    points: 1,
    steps: null,
    description: null,
    photo_url: null,
    media: null,
    reactions: [],
    comment_count: null,
    ...over,
  }
}

export const workouts: Workout[] = [
  // mais recente primeiro, como a API devolve
  makeWorkout({
    id: 102,
    title: 'Musculação',
    occurred_at: '2026-10-21T18:00:00Z',
    distance: null,
    description: 'Peito e tríceps\nsérie pesada',
    photo_url: 'https://img.test/w102-a.jpg',
    media: [
      { id: 1, url: 'https://img.test/w102-a.jpg', medium_type: 'image/jpg', width: 1080, height: 1920, aspect_ratio: 0.5625 },
      { id: 2, url: 'https://img.test/w102-b.jpg', medium_type: 'image/jpg', width: 1080, height: 1080, aspect_ratio: 1 },
      { id: 3, url: 'https://img.test/w102-c.mp4', medium_type: 'video/mp4', thumbnail_url: 'https://img.test/w102-c.jpg' },
    ],
    reactions: [
      { reaction: '😂', account: bruno },
      { reaction: '😂', account: { id: 13, full_name: 'Caio Prado Neto', profile_picture_url: null } },
      { reaction: '🔥', account: bruno },
    ],
    comment_count: 2,
  }),
  makeWorkout({ id: 101, title: 'Corrida' }),
  makeWorkout({ id: 103, title: 'Bike', account: bruno }),
]

// Só existe no endpoint de check-in único (fora da primeira página do feed).
export const loneWorkout = makeWorkout({ id: 999, title: 'Treino antigo', occurred_at: '2026-09-01T10:00:00Z' })

export const comments: Comment[] = [
  {
    id: 1,
    workout_id: 102,
    content: 'Monstro!\nAmanhã tem mais',
    created_at: '2026-10-21T19:00:00Z',
    account: bruno,
    reactions: [{ reaction: '❤️', account: ana }],
  },
  { id: 2, workout_id: 102, content: 'Bora', created_at: '2026-10-21T20:00:00Z', account: ana, reactions: [] },
]

export const stats: Stats = {
  challenge_id: 1,
  total_workouts: 3,
  members: 2,
  by_day: [
    { date: '2026-10-20', count: 2 },
    { date: '2026-10-21', count: 1 },
  ],
  by_member: [
    { account_id: 11, name: 'Ana Souza', workouts: 2, points: 2, calories: 800, distance: 5.2, active_days: 2 },
    { account_id: 12, name: 'Bruno Lima', workouts: 1, points: 1, calories: 400, distance: 5.2, active_days: 1 },
  ],
}

export function syncMeta(minutesAgo = 12): SyncMeta {
  return {
    last_synced_at: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    per_challenge: [],
  }
}
