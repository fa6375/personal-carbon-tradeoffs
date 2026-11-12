import { useState } from 'react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { LocalImportPanel } from '../features/account/LocalImportPanel'
import '../features/account/account.css'
import { AuthForm } from '../features/auth/AuthForm'
import { useAuth } from '../features/auth/authContext'
import { AUTH_ERROR_MESSAGES } from '../features/auth/authMessages'
import { AuthError, signOut } from '../features/auth/authService'
import '../features/auth/auth.css'
import { DEFAULT_ERROR_MESSAGES } from '../lib/errorMessages'

/** Sign in, create an account, sign out and import data saved in this browser. */
export function AccountPage() {
  const { status, user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSignOut() {
    setBusy(true)
    setError(null)
    try {
      await signOut()
    } catch (reason) {
      setError(AUTH_ERROR_MESSAGES[reason instanceof AuthError ? reason.code : 'unknown'])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="account-page">
      <PageHeader
        eyebrow="Account"
        title="Your account"
        description="Your activities, carbon plan and saved comparisons are stored in your account, so they are kept after a reload and available on any device."
      />

      {status === 'loading' && (
        <div className="auth-status" role="status">
          <span className="auth-status__spinner" aria-hidden="true" />
          Checking your sign-in…
        </div>
      )}

      {status === 'not-configured' && (
        <div className="auth-panel auth-panel--warning" role="alert">
          <p className="auth-panel__title">Database not configured</p>
          <p>{DEFAULT_ERROR_MESSAGES['not-configured']}</p>
        </div>
      )}

      {status === 'signed-out' && <AuthForm />}

      {status === 'signed-in' && user && (
        <>
          <section className="account-card" aria-labelledby="account-signed-in">
            <h2 id="account-signed-in" className="account-card__title">
              Signed in
            </h2>
            <p>
              You are signed in as <strong>{user.email}</strong>.
            </p>
            {error && (
              <p className="account-error" role="alert">
                {error}
              </p>
            )}
            <div>
              <Button variant="secondary" onClick={handleSignOut} disabled={busy}>
                {busy ? 'Signing out…' : 'Sign out'}
              </Button>
            </div>
          </section>
          <LocalImportPanel alwaysShow />
        </>
      )}
    </div>
  )
}
