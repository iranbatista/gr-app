export interface Page<T> {
  items: T[]
  /** Página atual (1-based), já limitada ao intervalo válido. */
  page: number
  pages: number
  /** Posições 1-based do primeiro e do último item da página (0 quando vazio). */
  from: number
  to: number
  total: number
}

export function paginate<T>(items: T[], page: number, size: number): Page<T> {
  const total = items.length
  const pages = Math.max(1, Math.ceil(total / size))
  const current = Math.min(Math.max(1, page), pages)
  const start = (current - 1) * size
  const slice = items.slice(start, start + size)
  return {
    items: slice,
    page: current,
    pages,
    from: total === 0 ? 0 : start + 1,
    to: start + slice.length,
    total,
  }
}
