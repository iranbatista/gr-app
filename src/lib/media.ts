import type { Workout, WorkoutMedium } from '../api/types'

function isMedium(m: unknown): m is WorkoutMedium {
  return typeof m === 'object' && m !== null && typeof (m as WorkoutMedium).url === 'string' && (m as WorkoutMedium).url !== ''
}

/** Mídias válidas do check-in; sem `media`, cai na foto principal. */
export function mediaOf(w: Workout): WorkoutMedium[] {
  const list = Array.isArray(w.media) ? w.media.filter(isMedium) : []
  if (list.length > 0) return list
  return w.photo_url ? [{ id: 0, url: w.photo_url }] : []
}

export function isVideo(m: WorkoutMedium): boolean {
  return (m.medium_type ?? '').startsWith('video/')
}
