import { fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeWorkout } from '../test/fixtures'
import { WorkoutCard } from './WorkoutCard'

const PHOTO = 'https://cdn.gymrats.app/w/1.jpg'

afterEach(() => vi.unstubAllEnvs())

describe('WorkoutCard photo', () => {
  it('usa miniatura w=512, cai para a original e depois esconde a foto', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.test')
    const { container } = render(
      <MemoryRouter>
        <WorkoutCard workout={makeWorkout({ photo_url: PHOTO })} />
      </MemoryRouter>,
    )
    const photo = () => container.querySelector('img[loading="lazy"]') as HTMLImageElement | null
    expect(photo()?.getAttribute('src')).toBe(`https://api.test/img?u=${encodeURIComponent(PHOTO)}&w=512`)
    fireEvent.error(photo()!)
    expect(photo()?.getAttribute('src')).toBe(PHOTO)
    fireEvent.error(photo()!)
    expect(photo()).toBeNull()
  })
})
