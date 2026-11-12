import { useState } from 'react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { LocalImportPanel } from '../features/account/LocalImportPanel'
import '../features/account/account.css'
import { useAuth } from '../features/auth/authContext'
import { authErrorText } from '../features/auth/authMessages'
import { AuthError, signOut, type AuthErrorCode } from '../features/auth/authService'
import '../features/auth/auth.css'
import { AuthGate } from '../features/auth/RequireAuth'
import { useI18n } from '../i18n'
import { RichText } from '../i18n/RichText'

/** Sign in, create an account, sign out and import data saved in this browser. */
export function AccountPage() {
  const { t } = useI18n()
  const { status, user } = useAuth()
  const [error, setError] = useState<AuthErrorCode | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSignOut() {
    setBusy(true)
    setError(null)
    try {
      await signOut()
    } catch (reason) {
      setError(reason instanceof AuthError ? reason.code : 'unknown')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="account-page">
      <PageHeader eyebrow={t('account.eyebrow')} title={t('account.title')} description={t('account.description')} />

      {status !== 'signed-in' && <AuthGate status={status} />}

      {status === 'signed-in' && user && (
        <>
          <section className="account-card" aria-labelledby="account-signed-in">
            <h2 id="account-signed-in" className="account-card__title">
              {t('account.signedInTitle')}
            </h2>
            <p>
              <RichText text={t('account.signedInAs')} values={{ email: <strong>{user.email}</strong> }} />
            </p>
            {error && (
              <p className="account-error" role="alert">
                {authErrorText(error)}
              </p>
            )}
            <div>
              <Button variant="secondary" onClick={handleSignOut} disabled={busy}>
                {busy ? t('account.signingOut') : t('account.signOut')}
              </Button>
            </div>
          </section>
          <LocalImportPanel alwaysShow />
        </>
      )}
    </div>
  )
}
