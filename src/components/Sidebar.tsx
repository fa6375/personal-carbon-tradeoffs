import type { ResolvedRoute } from '../hooks/useHashRoute'
import { useI18n } from '../i18n'
import { LanguageSelect } from './LanguageSelect'
import { Logo } from './Logo'
import { NavList } from './NavList'
import './Sidebar.css'

interface SidebarProps {
  activeRoute: ResolvedRoute
}

/** Desktop navigation. Hidden below the tablet breakpoint (see MobileHeader). */
export function Sidebar({ activeRoute }: SidebarProps) {
  const { t } = useI18n()
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Logo />
      </div>
      <nav className="sidebar__nav" aria-label={t('app.mainNav')}>
        <NavList activeRoute={activeRoute} />
      </nav>
      <div className="sidebar__language">
        <LanguageSelect />
      </div>
      <p className="sidebar__note">{t('app.previewNote')}</p>
    </aside>
  )
}
