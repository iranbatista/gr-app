// Moldura comum das páginas: mesma largura do header, respiro generoso.
export const pageClass = 'mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14'

// Link de volta: pill discreta no topo da página.
export const backLinkClass =
  'inline-flex items-center gap-1 rounded-full border border-[var(--hairline)] bg-[var(--card)] px-3.5 py-1.5 text-[0.8125rem] font-medium text-[var(--ink-muted)] transition-colors hover:bg-[var(--tint)] hover:text-[var(--brand-ink)]'

// Ícones lucide: traço fino, decorativos (aria-hidden é o padrão da lib).
export const icon = { size: 15, strokeWidth: 1.75 } as const
