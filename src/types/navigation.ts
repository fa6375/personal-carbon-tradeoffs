import type { MessageKey } from '../i18n/types'
import type { IconName } from './icons'

/** Every top-level page the app shell knows about. */
export type RouteId = 'home' | 'compare' | 'saved' | 'goals' | 'tracking' | 'account' | 'settings'

export interface NavItem {
  id: RouteId
  /** Translation key of the link text, e.g. "nav.compare". */
  labelKey: MessageKey
  /** Hash path, e.g. "#/compare". */
  href: string
  icon: IconName
}
