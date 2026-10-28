import type { Reaction } from '../api/types'
import { shortName } from './visual'

export interface ReactionGroup {
  emoji: string
  count: number
  /** Nomes curtos de quem reagiu, na ordem da API. */
  names: string[]
}

/** Agrupa por emoji, mais usado primeiro (empate: ordem de aparição). */
export function groupReactions(reactions: Reaction[]): ReactionGroup[] {
  const groups = new Map<string, ReactionGroup>()
  for (const r of reactions) {
    if (!r.reaction) continue
    const g = groups.get(r.reaction) ?? { emoji: r.reaction, count: 0, names: [] }
    g.count++
    g.names.push(shortName(r.account.full_name ?? 'Sem nome'))
    groups.set(r.reaction, g)
  }
  return [...groups.values()].sort((a, b) => b.count - a.count)
}
