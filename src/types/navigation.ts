import type { IconName } from './icons'

/** Every top-level page the app shell knows about. */
export type RouteId = 'home' | 'compare' | 'saved' | 'goals' | 'settings'

export interface NavItem {
  id: RouteId
  label: string
  /** Hash path, e.g. "#/compare". */
  href: string
  icon: IconName
}
