import { useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { AUTH_ERROR_MESSAGES } from './authMessages'
import { AuthError, PASSWORD_MIN_LENGTH, register, signIn, validateCredentials } from './authService'

type Mode = 'sign-in' | 'register'

/** Sign-in and registration form. On success the AuthProvider updates the whole app. */
export function AuthForm({ initialMode = 'sign-in' }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const id = useId()
  const isRegister = mode === 'register'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const invalid = validateCredentials(email, password, mode)
    if (invalid) {
      setError(AUTH_ERROR_MESSAGES[invalid])
      const field = invalid === 'invalid-email' ? 'email' : 'password'
      formRef.current?.querySelector<HTMLInputElement>(`#${CSS.escape(`${id}-${field}`)}`)?.focus()
      return
    }
    setBusy(true)
    setError(null)
    try {
      await (isRegister ? register(email, password) : signIn(email, password))
    } catch (reason) {
      setError(AUTH_ERROR_MESSAGES[reason instanceof AuthError ? reason.code : 'unknown'])
      setBusy(false)
    }
  }

  return (
    <form ref={formRef} className="auth-form" onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="auth-form__title">
        {isRegister ? 'Create an account' : 'Sign in'}
      </h2>
      <p className="auth-form__intro">
        {isRegister
          ? 'An account keeps your activities, goals and saved comparisons safe and available on any device.'
          : 'Sign in to see your activities, goals and saved comparisons.'}
      </p>
      {error && (
        <p className="auth-form__error" role="alert">
          {error}
        </p>
      )}
      <div className="auth-field">
        <label htmlFor={`${id}-email`}>Email</label>
        <input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="auth-field">
        <label htmlFor={`${id}-password`}>Password</label>
        {isRegister && (
          <p id={`${id}-password-hint`} className="auth-field__hint">
            At least {PASSWORD_MIN_LENGTH} characters.
          </p>
        )}
        <input
          id={`${id}-password`}
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          aria-describedby={isRegister ? `${id}-password-hint` : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? (isRegister ? 'Creating account…' : 'Signing in…') : isRegister ? 'Create account' : 'Sign in'}
      </Button>
      <p className="auth-form__switch">
        {isRegister ? 'Already have an account?' : 'New to Carbon Choices?'}{' '}
        <button
          type="button"
          className="auth-link-button"
          onClick={() => {
            setMode(isRegister ? 'sign-in' : 'register')
            setError(null)
          }}
        >
          {isRegister ? 'Sign in' : 'Create an account'}
        </button>
      </p>
    </form>
  )
}
