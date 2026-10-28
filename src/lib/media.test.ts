import { describe, expect, it } from 'vitest'
import { makeWorkout } from '../test/fixtures'
import { isVideo, mediaOf } from './media'

describe('mediaOf', () => {
  it('returns valid media entries', () => {
    const w = makeWorkout({
      media: [
        { id: 1, url: 'https://x/a.jpg', medium_type: 'image/jpg' },
        { id: 2 }, // sem url: descartado
        'lixo',
        { id: 3, url: 'https://x/b.mp4', medium_type: 'video/mp4', thumbnail_url: 'https://x/b.jpg' },
      ],
    })
    expect(mediaOf(w).map((m) => m.id)).toEqual([1, 3])
  })

  it('falls back to photo_url when media is empty or missing', () => {
    expect(mediaOf(makeWorkout({ media: [], photo_url: 'https://x/p.jpg' }))).toEqual([
      { id: 0, url: 'https://x/p.jpg' },
    ])
    expect(mediaOf(makeWorkout({ media: null, photo_url: null }))).toEqual([])
  })
})

describe('isVideo', () => {
  it('reads medium_type', () => {
    expect(isVideo({ id: 1, url: 'x', medium_type: 'video/quicktime' })).toBe(true)
    expect(isVideo({ id: 1, url: 'x', medium_type: 'image/jpg' })).toBe(false)
    expect(isVideo({ id: 1, url: 'x' })).toBe(false)
  })
})
