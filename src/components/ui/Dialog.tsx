import { X } from 'lucide-react'
import { Dialog as D } from 'radix-ui'
import type { ReactNode } from 'react'

const SIZES = {
  md: 'sm:max-w-lg',
  xl: 'sm:max-w-4xl',
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  /** Linha pequena acima do título, no estilo eyebrow. */
  eyebrow?: ReactNode
  children: ReactNode
  /** Rodapé fixo (ações). */
  footer?: ReactNode
  size?: keyof typeof SIZES
}

/**
 * Bottom sheet no celular (sobe da borda, largura total) e painel central no
 * desktop. As animações somem com prefers-reduced-motion.
 */
export function Dialog({ open, onOpenChange, title, eyebrow, children, footer, size = 'md' }: Props) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-40 bg-[rgba(20,18,17,0.38)] backdrop-blur-[3px] data-[state=open]:animate-[fade-in_180ms_ease-out] motion-reduce:animate-none" />
        <D.Content
          aria-describedby={undefined}
          // Foco vai para o painel, não para o X: sem anel laranja no botão ao abrir.
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            ;(e.currentTarget as HTMLElement).focus()
          }}
          className={`surface fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-b-none outline-none data-[state=open]:animate-[sheet-up_240ms_cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:animate-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[88vh] sm:w-[calc(100%-3rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-b-[1.75rem] sm:data-[state=open]:animate-[pop-in_180ms_ease-out] ${SIZES[size]}`}
        >
          {/* Alça do bottom sheet: só no celular. */}
          <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-[var(--hairline)] sm:hidden" />
          <header className="flex shrink-0 items-start justify-between gap-4 px-6 pb-2 pt-4 sm:pt-6">
            <div className="flex min-w-0 flex-col gap-1">
              {eyebrow && <div className="eyebrow">{eyebrow}</div>}
              <D.Title className="font-heading text-xl font-semibold leading-tight tracking-tight text-[var(--ink)]">
                {title}
              </D.Title>
            </div>
            <D.Close
              aria-label="Fechar"
              className="-mr-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--ink-muted)] transition-colors hover:bg-[var(--wash)] hover:text-[var(--ink)]"
            >
              <X size={18} strokeWidth={1.75} />
            </D.Close>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">{children}</div>
          {footer && (
            <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--hairline)] px-6 py-4">
              {footer}
            </footer>
          )}
        </D.Content>
      </D.Portal>
    </D.Root>
  )
}
