import type { NavItem, RouteId } from '../types/navigation'

/** Labels are translation keys (nav.*), translated where they are shown. */
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', labelKey: 'nav.home', href: '#/', icon: 'home' },
  { id: 'compare', labelKey: 'nav.compare', href: '#/compare', icon: 'compare' },
  { id: 'saved', labelKey: 'nav.saved', href: '#/saved', icon: 'bookmark' },
  { id: 'goals', labelKey: 'nav.goals', href: '#/goals', icon: 'target' },
  { id: 'tracking', labelKey: 'nav.tracking', href: '#/tracking', icon: 'activity' },
  { id: 'account', labelKey: 'nav.account', href: '#/account', icon: 'user' },
  { id: 'settings', labelKey: 'nav.settings', href: '#/settings', icon: 'settings' },
]

/** Maps the part of the hash after "#/" to a route. */
export const ROUTE_BY_PATH: Record<string, RouteId> = {
  '': 'home',
  compare: 'compare',
  saved: 'saved',
  goals: 'goals',
  tracking: 'tracking',
  account: 'account',
  settings: 'settings',
}
