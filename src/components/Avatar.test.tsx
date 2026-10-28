import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Avatar } from './Avatar'

const CDN = 'https://cdn.gymrats.app/p/ana.jpg'

afterEach(() => vi.unstubAllEnvs())

describe('Avatar', () => {
  it('usa a miniatura, cai para a original e por fim nas iniciais', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.test')
    const { container } = render(<Avatar url={CDN} name="Ana Souza" size="md" />)
    const img = () => container.querySelector('img')
    expect(img()?.getAttribute('src')).toBe(`https://api.test/img?u=${encodeURIComponent(CDN)}&w=128`)
    expect(img()?.getAttribute('width')).toBe('40')
    fireEvent.error(img()!)
    expect(img()?.getAttribute('src')).toBe(CDN)
    fireEvent.error(img()!)
    expect(img()).toBeNull()
    expect(screen.getByText('AS')).toBeTruthy()
  })

  it('reinicia a cadeia quando a url muda', () => {
    const { container, rerender } = render(<Avatar url="https://img.test/a.jpg" name="Ana Souza" />)
    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('img')).toBeNull()
    rerender(<Avatar url="https://img.test/b.jpg" name="Ana Souza" />)
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://img.test/b.jpg')
  })
})
