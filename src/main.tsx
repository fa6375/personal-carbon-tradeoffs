import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth/AuthProvider'
import { LocaleProfileSync } from './features/account/localePreference'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LocaleProfileSync />
      <App />
    </AuthProvider>
  </StrictMode>,
)
