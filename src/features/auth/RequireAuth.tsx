import type { ReactNode } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { DEFAULT_ERROR_MESSAGES } from '../../lib/errorMessages'
import { AuthForm } from './AuthForm'
import { useAuth } from './authContext'
import './auth.css'

interface RequireAuthProps {
  /** Page title shown while the page itself is hidden, so the page always has its <h1>. */
  title: string
  /** Short reason shown above the sign-in form, e.g. "Sign in to track your activities." */
  reason: string
  children: ReactNode
}

/** Shows its children only to a signed-in user; otherwise a sign-in form in the same place. */
export function RequireAuth({ title, reason, children }: RequireAuthProps) {
  const { status } = useAuth()
  if (status === 'signed-in') return <>{children}</>
  return (
    <div className="auth-page">
      <PageHeader title={title} />
      <Gate status={status} reason={reason} />
    </div>
  )
}

function Gate({ status, reason }: { status: ReturnType<typeof useAuth>['status']; reason: string }) {
  if (status === 'loading') {
    return (
      <div className="auth-status" role="status">
        <span className="auth-status__spinner" aria-hidden="true" />
        Checking your sign-in…
      </div>
    )
  }

  if (status === 'not-configured') {
    return (
      <div className="auth-panel auth-panel--warning" role="alert">
        <p className="auth-panel__title">Database not configured</p>
        <p>{DEFAULT_ERROR_MESSAGES['not-configured']}</p>
      </div>
    )
  }

  if (status === 'signed-out') {
    return (
      <div className="auth-gate">
        <p className="auth-gate__reason">{reason}</p>
        <AuthForm />
      </div>
    )
  }

  return null
}
