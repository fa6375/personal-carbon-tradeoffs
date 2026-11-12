import { useEffect, useRef, useState } from 'react'
import type { ResolvedRoute } from '../hooks/useHashRoute'
import { useI18n } from '../i18n'
import { Icon } from './Icon'
import { LanguageSelect } from './LanguageSelect'
import { Logo } from './Logo'
import { NavList } from './NavList'
import './MobileHeader.css'

interface MobileHeaderProps {
  activeRoute: ResolvedRoute
}

const MENU_ID = 'mobile-nav-menu'

/** Top bar with a disclosure menu, shown below the desktop breakpoint. */
export function MobileHeader({ activeRoute }: MobileHeaderProps) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Close with Escape and return focus to the toggle button.
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  // Close if the viewport grows to the desktop layout.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 960px)')
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return (
    <header className="mobile-header">
      <div className="mobile-header__bar">
        <Logo />
        <button
          ref={toggleRef}
          type="button"
          className="mobile-header__toggle"
          aria-expanded={isOpen}
          aria-controls={MENU_ID}
          aria-label={isOpen ? t('app.closeMenu') : t('app.openMenu')}
          onClick={() => setIsOpen((open) => !open)}
        >
          <Icon name={isOpen ? 'close' : 'menu'} size={22} />
        </button>
      </div>
      <div id={MENU_ID} className="mobile-header__menu" hidden={!isOpen}>
        <nav aria-label={t('app.mainNav')}>
          <NavList activeRoute={activeRoute} onNavigate={() => setIsOpen(false)} />
        </nav>
        <div className="mobile-header__language">
          <LanguageSelect />
        </div>
      </div>
    </header>
  )
}
