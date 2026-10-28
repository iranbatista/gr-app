// Miniaturas redimensionadas pela API (GET /img). Só URLs do CDN sem query são aceitas.
const WIDTHS = [64, 128, 256, 512, 1024] as const
const CDN = /^https:\/\/cdn\.gymrats\.app\/[^?#]+$/

function apiBase(): string {
  return import.meta.env.VITE_API_URL ?? ''
}

/** Menor largura permitida >= cssPx * 2 (retina), limitada a 1024. */
export function thumbWidth(cssPx: number): number {
  const target = cssPx * 2
  return WIDTHS.find((w) => w >= target) ?? WIDTHS[WIDTHS.length - 1]
}

export function thumbUrl(url: string | null | undefined, cssPx: number): string | undefined {
  if (!url) return undefined
  if (!CDN.test(url)) return url
  return `${apiBase().replace(/\/$/, '')}/img?u=${encodeURIComponent(url)}&w=${thumbWidth(cssPx)}`
}
