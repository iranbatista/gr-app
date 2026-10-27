import type { CSSProperties } from 'react'

// Recharts recebe cor por prop: os tokens entram como var() direto no SVG.
export const tick = { fill: 'var(--ink-muted)', fontSize: 12 }

export const tooltipStyle: CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--hairline)',
  borderRadius: '0.875rem',
  boxShadow: '0 12px 32px -20px rgba(36, 36, 36, 0.35)',
  color: 'var(--ink)',
  fontSize: 13,
  padding: '0.5rem 0.75rem',
}

export const tooltipLabelStyle: CSSProperties = { color: 'var(--ink-muted)', marginBottom: 2 }
export const tooltipItemStyle: CSSProperties = { color: 'var(--brand-ink)', fontWeight: 600, padding: 0 }
export const cursorFill = { fill: 'var(--wash)' }
