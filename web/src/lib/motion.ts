import { useLayoutEffect, type DependencyList, type RefObject } from 'react'
import { createScope, type Scope } from 'animejs'

/**
 * Runs `build` inside an anime.js scope bound to `ref`. Everything created in `build` is reverted
 * on cleanup. Skipped entirely when the user asks for reduced motion, so content shows in its final state.
 */
export function useMotion(ref: RefObject<HTMLElement | null>, build: (scope: Scope) => void | (() => void), deps: DependencyList) {
  useLayoutEffect(() => {
    if (!ref.current) return
    const scope = createScope({ root: ref.current, mediaQueries: { reduced: '(prefers-reduced-motion: reduce)' } })
    scope.add((self) => {
      if (self?.matches.reduced) return
      return build(self as Scope)
    })
    return () => scope.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Resolves when web fonts are ready (or after `timeout` ms), so text splitting measures final line breaks. */
export function fontsReady(timeout = 1200) {
  return Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((resolve) => setTimeout(resolve, timeout))])
}
