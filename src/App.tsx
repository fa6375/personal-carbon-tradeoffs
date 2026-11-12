import { useEffect, useRef } from 'react'
import { useHashRoute, type ResolvedRoute } from './hooks/useHashRoute'
import { useI18n, type MessageKey } from './i18n'
import { AppLayout } from './layouts/AppLayout'
import { LocalImportPanel } from './features/account/LocalImportPanel'
import { RequireAuth } from './features/auth/RequireAuth'
import { AccountPage } from './pages/AccountPage'
import { ComparePage } from './pages/ComparePage'
import { GoalsPage } from './pages/GoalsPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SavedPage } from './pages/SavedPage'
import { SettingsPage } from './pages/SettingsPage'
import { TrackingPage } from './pages/TrackingPage'

const PAGE_TITLES: Record<ResolvedRoute, MessageKey> = {
  home: 'nav.home',
  compare: 'nav.compare',
  saved: 'nav.saved',
  goals: 'nav.goals',
  tracking: 'nav.tracking',
  account: 'nav.account',
  settings: 'nav.settings',
  'not-found': 'nav.notFound',
}

function renderPage(route: ResolvedRoute, t: ReturnType<typeof useI18n>['t']) {
  switch (route) {
    case 'home':
      return <HomePage />
    case 'compare':
      return <ComparePage />
    case 'saved':
      return (
        <RequireAuth title={t('auth.gate.savedTitle')} reason={t('auth.gate.savedReason')}>
          <LocalImportPanel />
          <SavedPage />
        </RequireAuth>
      )
    case 'goals':
      return (
        <RequireAuth title={t('auth.gate.goalsTitle')} reason={t('auth.gate.goalsReason')}>
          <GoalsPage />
        </RequireAuth>
      )
    case 'tracking':
      return (
        <RequireAuth title={t('auth.gate.trackingTitle')} reason={t('auth.gate.trackingReason')}>
          <LocalImportPanel />
          <TrackingPage />
        </RequireAuth>
      )
    case 'account':
      return <AccountPage />
    case 'settings':
      return <SettingsPage />
    default:
      return <NotFoundPage />
  }
}

function App() {
  const route = useHashRoute()
  // App reads the language, so the whole tree re-renders (keeping its state) when it changes.
  const { t } = useI18n()
  const isFirstRender = useRef(true)

  useEffect(() => {
    document.title = `${t(PAGE_TITLES[route])} · ${t('app.titleSuffix')}`
  }, [route, t])

  useEffect(() => {
    // After client-side navigation, move focus to the new page's heading so
    // screen reader and keyboard users land at the start of the new content.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    document.querySelector<HTMLElement>('main h1')?.focus()
  }, [route])

  return <AppLayout activeRoute={route}>{renderPage(route, t)}</AppLayout>
}

export default App
