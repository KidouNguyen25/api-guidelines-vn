import { useEffect, useState } from 'react'

export type Route = { name: 'home' } | { name: 'doc'; id: string; anchor?: string }

export function parseHash(hash: string): Route {
  const match = hash.match(/^#\/doc\/([^/]+)(?:\/(.+))?$/)
  if (!match) return { name: 'home' }
  return { name: 'doc', id: decodeURIComponent(match[1]), anchor: match[2] ? decodeURIComponent(match[2]) : undefined }
}

export const docHref = (id: string, anchor?: string) => `#/doc/${encodeURIComponent(id)}${anchor ? `/${encodeURIComponent(anchor)}` : ''}`

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseHash(location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
