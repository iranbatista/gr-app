import { Tooltip as T } from 'radix-ui'
import type { ReactNode } from 'react'

export const TooltipProvider = T.Provider

/** Balão no estilo do card. O filho precisa aceitar ref (elemento DOM). */
export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content
          sideOffset={6}
          className="z-50 rounded-xl border border-[var(--hairline)] bg-[var(--card)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] shadow-[0_12px_32px_-16px_rgba(36,36,36,0.35)] data-[state=delayed-open]:animate-[fade-in_120ms_ease-out] motion-reduce:animate-none"
        >
          {content}
        </T.Content>
      </T.Portal>
    </T.Root>
  )
}
