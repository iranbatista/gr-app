import { useEffect, useState } from 'react'

/**
 * Cadeia de fontes para <img>: no erro avança para a próxima; ao esgotar,
 * `src` fica undefined (quem chama mostra iniciais/gradiente/esconde a foto).
 * Reinicia quando a lista de fontes muda.
 */
export function useImgFallback(sources: (string | null | undefined)[]) {
  const list = sources.filter((s, i, a): s is string => !!s && a.indexOf(s) === i)
  const key = list.join('\n')
  const [state, setState] = useState({ key, index: 0 })
  useEffect(() => {
    setState((s) => (s.key === key ? s : { key, index: 0 }))
  }, [key])
  const index = state.key === key ? state.index : 0
  return {
    src: list[index] as string | undefined,
    onError: () => setState({ key, index: index + 1 }),
  }
}

/** Fontes padrão: miniatura da API e, se falhar, a original. */
export function thumbSources(thumb: string | undefined, original: string | null | undefined) {
  return [thumb, original]
}
