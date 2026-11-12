import type { MouseEvent, ReactNode } from 'react'
import { Footer } from '../components/Footer'
import { MobileHeader } from '../components/MobileHeader'
import { OfflineBanner } from '../components/OfflineBanner'
import { Sidebar } from '../components/Sidebar'
import type { ResolvedRoute } from '../hooks/useHashRoute'
import { useI18n } from '../i18n'
import './AppLayout.css'

interface AppLayoutProps {
  activeRoute: ResolvedRoute
  children: ReactNode
}

const MAIN_CONTENT_ID = 'main-content'

/** Shared app shell: navigation, connection notice, main content area and footer. */
export function AppLayout({ activeRoute, children }: AppLayoutProps) {
  const { t } = useI18n()
  return (
    <div className="app-layout">
      <a className="skip-link" href={`#${MAIN_CONTENT_ID}`} onClick={skipToMain}>
        {t('app.skipToMain')}
      </a>
      <Sidebar activeRoute={activeRoute} />
      <div className="app-layout__column">
        <MobileHeader activeRoute={activeRoute} />
        <main id={MAIN_CONTENT_ID} className="app-layout__main" tabIndex={-1}>
          <div className="app-layout__content">
            <OfflineBanner />
            {children}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  )
}

// A plain "#main-content" href would change the hash and confuse the hash router,
// so move focus manually instead.
function skipToMain(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
  document.getElementById(MAIN_CONTENT_ID)?.focus()
}
