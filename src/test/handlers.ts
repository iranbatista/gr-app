import { http, HttpResponse } from 'msw'
import type { Workout } from '../api/types'
import { API, challenge, oldChallenge, rankings, stats, syncMeta, workouts } from './fixtures'

export function workoutsHandler(all: Workout[]) {
  return http.get(`${API}/challenges/:id/workouts`, ({ request }) => {
    const url = new URL(request.url)
    const member = url.searchParams.get('member_id')
    const limit = Number(url.searchParams.get('limit') ?? 100)
    const offset = Number(url.searchParams.get('offset') ?? 0)
    const filtered = member ? all.filter((w) => String(w.account.id) === member) : all
    return HttpResponse.json({
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      limit,
      offset,
    })
  })
}

export const handlers = [
  http.get(`${API}/challenges`, () => HttpResponse.json([challenge, oldChallenge])),
  http.get(`${API}/challenges/:id`, ({ params }) =>
    params.id === '1'
      ? HttpResponse.json(challenge)
      : HttpResponse.json({ detail: 'desafio nao encontrado' }, { status: 404 }),
  ),
  http.get(`${API}/challenges/:id/rankings`, () => HttpResponse.json(rankings)),
  http.get(`${API}/challenges/:id/stats`, () => HttpResponse.json(stats)),
  workoutsHandler(workouts),
  http.get(`${API}/meta/sync`, () => HttpResponse.json(syncMeta())),
]
