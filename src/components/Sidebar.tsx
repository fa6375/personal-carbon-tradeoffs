import type { ResolvedRoute } from '../hooks/useHashRoute'
import { Logo } from './Logo'
import { NavList } from './NavList'
import './Sidebar.css'

interface SidebarProps {
  activeRoute: ResolvedRoute
}

/** Desktop navigation. Hidden below the tablet breakpoint (see MobileHeader). */
export function Sidebar({ activeRoute }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Logo />
      </div>
      <nav className="sidebar__nav" aria-label="Main">
        <NavList activeRoute={activeRoute} />
      </nav>
      <p className="sidebar__note">
        Early preview. Comparison features are still in development.
      </p>
    </aside>
  )
}
