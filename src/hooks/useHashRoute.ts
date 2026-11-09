import { useEffect, useState } from 'react'
import { ROUTE_BY_PATH } from '../data/navigation'
import type { RouteId } from '../types/navigation'

export type ResolvedRoute = RouteId | 'not-found'

function resolveHash(hash: string): ResolvedRoute {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '')
  return ROUTE_BY_PATH[path] ?? 'not-found'
}

/**
 * Minimal hash-based routing so the shell works without adding a router
 * dependency. If the team later adopts React Router, replace this hook.
 */
export function useHashRoute(): ResolvedRoute {
  const [route, setRoute] = useState<ResolvedRoute>(() =>
    resolveHash(window.location.hash),
  )

  useEffect(() => {
    const onHashChange = () => setRoute(resolveHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
