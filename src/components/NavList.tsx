import { NAV_ITEMS } from '../data/navigation'
import type { ResolvedRoute } from '../hooks/useHashRoute'
import { useI18n } from '../i18n'
import { Icon } from './Icon'
import './NavList.css'

interface NavListProps {
  activeRoute: ResolvedRoute
  /** Called after a link is chosen, e.g. to close the mobile menu. */
  onNavigate?: () => void
}

export function NavList({ activeRoute, onNavigate }: NavListProps) {
  const { t } = useI18n()
  return (
    <ul className="nav-list">
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === activeRoute
        return (
          <li key={item.id}>
            <a
              className="nav-list__link"
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              onClick={onNavigate}
            >
              <Icon name={item.icon} size={20} />
              <span>{t(item.labelKey)}</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
