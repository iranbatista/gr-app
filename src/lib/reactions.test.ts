import { describe, expect, it } from 'vitest'
import { groupReactions } from './reactions'

const acc = (id: number, full_name: string) => ({ id, full_name, profile_picture_url: null })

describe('groupReactions', () => {
  it('groups by emoji, most used first, keeping who reacted', () => {
    expect(
      groupReactions([
        { reaction: '🔥', account: acc(1, 'Ana Souza') },
        { reaction: '😂', account: acc(2, 'Bruno Lima') },
        { reaction: '😂', account: acc(3, 'Caio Prado Neto') },
        { reaction: null, account: acc(4, 'Sem Emoji') },
      ]),
    ).toEqual([
      { emoji: '😂', count: 2, names: ['Bruno Lima', 'Caio Prado'] },
      { emoji: '🔥', count: 1, names: ['Ana Souza'] },
    ])
  })
})
