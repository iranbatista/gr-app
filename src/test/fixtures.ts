import type { Challenge, Comment, Insights, RankingEntry, Stats, SyncMeta, Workout } from '../api/types'

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

export const caio = { id: 13, full_name: 'Caio Prado Neto', profile_picture_url: null }

// Espelha o /insights real; "hoje" nos testes é 27/10/2026.
const punchcard = Array.from({ length: 7 }, () => new Array<number>(24).fill(0))
punchcard[1][18] = 23 // pico: terça 18h
punchcard[0][6] = 4
punchcard[3][12] = 2

export const insights: Insights = {
  challenge_id: 1,
  tz: 'America/Sao_Paulo',
  members_total: 10,
  totals: { workouts: 120, minutes: 5400, athletes_active: 8 },
  daily: [
    ...Array.from({ length: 25 }, (_, i) => ({
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      workouts: 4,
      athletes: 3,
      minutes: 200,
    })),
    { date: '2026-10-26', workouts: 6, athletes: 5, minutes: 300 },
    { date: '2026-10-27', workouts: 10, athletes: 8, minutes: 480 },
  ],
  punchcard,
  periods: { madrugada: 0, manha: 30, tarde: 30, noite: 60 },
  duration_by_weekday: [
    { weekday: 0, workouts: 20, avg_minutes: 41.4 },
    { weekday: 1, workouts: 25, avg_minutes: 38 },
    { weekday: 2, workouts: 87, avg_minutes: 52.2 },
    { weekday: 3, workouts: 18, avg_minutes: 45 },
    { weekday: 4, workouts: 3, avg_minutes: null },
    { weekday: 5, workouts: 9, avg_minutes: 70 },
    { weekday: 6, workouts: 6, avg_minutes: 30 },
  ],
  streaks: [
    { account: ana, longest: 12, current: 12 },
    { account: bruno, longest: 12, current: 3 },
    { account: caio, longest: 5, current: 0 },
  ],
  awards: {
    early_bird: { account: ana, value: 9 },
    night_owl: null,
    most_reactions: { account: bruno, value: 381 },
    most_comments: { account: ana, value: 14 },
    most_reactions_given: { account: bruno, value: 77 },
    marathoner: { account: caio, value: 2941 },
    weekend: { account: ana, value: 11 },
    dynamic_duo: { accounts: [ana, bruno], value: 23, a_to_b: 11, b_to_a: 12 },
  },
  top_workouts: [
    {
      id: 102,
      title: 'Musculação',
      photo_url: 'https://img.test/w102-a.jpg',
      account: ana,
      occurred_at: '2026-10-21T18:00:00Z',
      reactions_count: 3,
      comment_count: 2,
    },
    { id: 999, title: 'Treino antigo', photo_url: null, account: bruno, occurred_at: null, reactions_count: 2, comment_count: 0 },
  ],
  emojis: [
    { emoji: '🔥', count: 42 },
    { emoji: '💪', count: 30 },
    { emoji: '👏', count: 5 },
  ],
}
