import type { NavItem, RouteId } from '../types/navigation'

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '#/', icon: 'home' },
  { id: 'compare', label: 'Compare journeys', href: '#/compare', icon: 'compare' },
  { id: 'saved', label: 'Saved comparisons', href: '#/saved', icon: 'bookmark' },
  { id: 'settings', label: 'Settings', href: '#/settings', icon: 'settings' },
]

/** Maps the part of the hash after "#/" to a route. */
export const ROUTE_BY_PATH: Record<string, RouteId> = {
  '': 'home',
  compare: 'compare',
  saved: 'saved',
  settings: 'settings',
}
