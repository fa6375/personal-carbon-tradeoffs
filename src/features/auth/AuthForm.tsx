import { useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { isOffline } from '../../hooks/useOnlineStatus'
import { useI18n } from '../../i18n'
import { authErrorText } from './authMessages'
import { AuthError, PASSWORD_MIN_LENGTH, register, signIn, validateCredentials, type AuthErrorCode } from './authService'

type Mode = 'sign-in' | 'register'

/** Which field an error belongs to, so it can be linked to that input. */
function fieldFor(code: AuthErrorCode): 'email' | 'password' | null {
  if (code === 'invalid-email' || code === 'email-in-use') return 'email'
  if (code === 'missing-password' || code === 'weak-password') return 'password'
  return null
}

/** Sign-in and registration form. On success the AuthProvider updates the whole app. */
export function AuthForm({ initialMode = 'sign-in' }: { initialMode?: Mode }) {
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // The code, not the text, so the message follows language changes.
  const [error, setError] = useState<AuthErrorCode | null>(null)
  const [busy, setBusy] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const id = useId()
  const isRegister = mode === 'register'
  const errorField = error ? fieldFor(error) : null
  const errorId = `${id}-error`

  function focusField(field: 'email' | 'password') {
    formRef.current?.querySelector<HTMLInputElement>(`#${CSS.escape(`${id}-${field}`)}`)?.focus()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    const invalid = validateCredentials(email, password, mode)
    if (invalid) {
      setError(invalid)
      focusField(invalid === 'invalid-email' ? 'email' : 'password')
      return
    }
    if (isOffline()) {
      setError('network')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await (isRegister ? register(email, password) : signIn(email, password))
    } catch (reason) {
      const code = reason instanceof AuthError ? reason.code : 'unknown'
      setError(code)
      setBusy(false)
      const field = fieldFor(code)
      if (field) focusField(field)
    }
  }

  const describedBy = (field: 'email' | 'password', hint?: string) =>
    [hint, errorField === field ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <form
      ref={formRef}
      className="auth-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={`${id}-title`}
      aria-busy={busy || undefined}
    >
      <h2 id={`${id}-title`} className="auth-form__title">
        {isRegister ? t('auth.registerTitle') : t('auth.signInTitle')}
      </h2>
      <p className="auth-form__intro">{isRegister ? t('auth.registerIntro') : t('auth.signInIntro')}</p>
      {error && (
        <p id={errorId} className="auth-form__error" role="alert">
          {authErrorText(error)}
        </p>
      )}
      <div className="auth-field">
        <label htmlFor={`${id}-email`}>
          {t('auth.email')} <span className="auth-field__required">{t('actions.required')}</span>
        </label>
        <input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          required
          aria-invalid={errorField === 'email' || undefined}
          aria-describedby={describedBy('email')}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="auth-field">
        <label htmlFor={`${id}-password`}>
          {t('auth.password')} <span className="auth-field__required">{t('actions.required')}</span>
        </label>
        {isRegister && (
          <p id={`${id}-password-hint`} className="auth-field__hint">
            {t('auth.passwordHint', { min: PASSWORD_MIN_LENGTH })}
          </p>
        )}
        <input
          id={`${id}-password`}
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          required
          aria-invalid={errorField === 'password' || undefined}
          aria-describedby={describedBy('password', isRegister ? `${id}-password-hint` : undefined)}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={busy}>
        {busy
          ? isRegister
            ? t('auth.creatingAccount')
            : t('auth.signingIn')
          : isRegister
            ? t('auth.createAccount')
            : t('auth.signIn')}
      </Button>
      <p className="auth-form__switch">
        {isRegister ? t('auth.haveAccount') : t('auth.newHere')}{' '}
        <button
          type="button"
          className="auth-link-button"
          onClick={() => {
            setMode(isRegister ? 'sign-in' : 'register')
            setError(null)
          }}
        >
          {isRegister ? t('auth.switchToSignIn') : t('auth.switchToRegister')}
        </button>
      </p>
    </form>
  )
}
