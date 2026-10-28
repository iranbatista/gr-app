import type { CSSProperties, ReactNode } from 'react'

interface Props {
  className?: string
  style?: CSSProperties
}

/** Linha de texto ou pill: bege arredondado. */
export function Bar({ className = '', style }: Props) {
  return <div aria-hidden style={style} className={`rounded-full bg-[var(--wash)] ${className}`} />
}

/** Bloco de mídia ou gráfico. */
export function Block({ className = '', style }: Props) {
  return <div aria-hidden style={style} className={`rounded-[1rem] bg-[var(--wash)] ${className}`} />
}

/** Avatar. */
export function Circle({ className = '', style }: Props) {
  return <div aria-hidden style={style} className={`shrink-0 rounded-full bg-[var(--wash)] ${className}`} />
}

/** Contêiner anunciado ao leitor de tela; pulsa só sem prefers-reduced-motion. */
export function SkeletonGroup({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-label={label} className={`motion-safe:animate-pulse ${className}`}>
      {children}
    </div>
  )
}
