import { useEffect, useRef } from 'react'
import { useHashRoute, type ResolvedRoute } from './hooks/useHashRoute'
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

const PAGE_TITLES: Record<ResolvedRoute, string> = {
  home: 'Home',
  compare: 'Compare journeys',
  saved: 'Saved comparisons',
  goals: 'Carbon goals',
  tracking: 'Carbon tracking',
  account: 'Account',
  settings: 'Settings',
  'not-found': 'Page not found',
}

function renderPage(route: ResolvedRoute) {
  switch (route) {
    case 'home':
      return <HomePage />
    case 'compare':
      return <ComparePage />
    case 'saved':
      return (
        <RequireAuth title="Saved comparisons" reason="Sign in to see the comparisons you have saved.">
          <LocalImportPanel />
          <SavedPage />
        </RequireAuth>
      )
    case 'goals':
      return (
        <RequireAuth title="Carbon reduction goals" reason="Sign in to create your carbon plan and keep it in your account.">
          <GoalsPage />
        </RequireAuth>
      )
    case 'tracking':
      return (
        <RequireAuth title="Personal carbon tracking" reason="Sign in to record your activities and see your emissions.">
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
  const isFirstRender = useRef(true)

  useEffect(() => {
    document.title = `${PAGE_TITLES[route]} · Carbon Choices`

    // After client-side navigation, move focus to the new page's heading so
    // screen reader and keyboard users land at the start of the new content.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    document.querySelector<HTMLElement>('main h1')?.focus()
  }, [route])

  return <AppLayout activeRoute={route}>{renderPage(route)}</AppLayout>
}

export default App
