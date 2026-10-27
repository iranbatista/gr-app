import { QueryClient } from '@tanstack/react-query'
import { shouldRetry } from './client'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60_000, // sync roda a cada 60 min; não precisa refetch agressivo
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
    },
  })
}
