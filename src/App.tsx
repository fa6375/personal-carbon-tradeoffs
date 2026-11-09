import { useEffect, useRef } from 'react'
import { useHashRoute, type ResolvedRoute } from './hooks/useHashRoute'
import { AppLayout } from './layouts/AppLayout'
import { ComparePage } from './pages/ComparePage'
import { GoalsPage } from './pages/GoalsPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SavedPage } from './pages/SavedPage'
import { SettingsPage } from './pages/SettingsPage'

const PAGE_TITLES: Record<ResolvedRoute, string> = {
  home: 'Home',
  compare: 'Compare journeys',
  saved: 'Saved comparisons',
  goals: 'Carbon goals',
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
      return <SavedPage />
    case 'goals':
      return <GoalsPage />
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
