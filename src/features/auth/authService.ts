/**
 * Email/password authentication with Firebase Auth.
 *
 * Errors are returned as AuthErrorCode values; the text for each code lives in
 * authMessages.ts so it can be translated.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { doc, getDocFromServer, serverTimestamp, setDoc } from 'firebase/firestore'
import { getLocale } from '../../i18n'
import { getFirebase } from '../../lib/firebase'

export type AuthErrorCode =
  | 'invalid-email'
  | 'missing-password'
  | 'weak-password'
  | 'email-in-use'
  | 'wrong-credentials'
  | 'too-many-requests'
  | 'network'
  | 'not-enabled'
  | 'not-configured'
  | 'unknown'

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode) {
    super(code)
    this.name = 'AuthError'
    this.code = code
  }
}

export const PASSWORD_MIN_LENGTH = 6

function toAuthError(reason: unknown): AuthError {
  if (reason instanceof AuthError) return reason
  const code = typeof reason === 'object' && reason !== null && 'code' in reason ? String(reason.code) : ''
  switch (code) {
    case 'auth/invalid-email':
      return new AuthError('invalid-email')
    case 'auth/missing-password':
      return new AuthError('missing-password')
    case 'auth/weak-password':
      return new AuthError('weak-password')
    case 'auth/email-already-in-use':
      return new AuthError('email-in-use')
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/user-disabled':
      return new AuthError('wrong-credentials')
    case 'auth/too-many-requests':
      return new AuthError('too-many-requests')
    case 'auth/network-request-failed':
      return new AuthError('network')
    case 'auth/operation-not-allowed':
      return new AuthError('not-enabled')
    default:
      return new AuthError('unknown')
  }
}

function services() {
  const firebase = getFirebase()
  if (!firebase) throw new AuthError('not-configured')
  return firebase
}

/** Client-side checks run before calling Firebase, so obvious mistakes get instant feedback. */
export function validateCredentials(email: string, password: string, mode: 'sign-in' | 'register'): AuthErrorCode | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'invalid-email'
  if (!password) return 'missing-password'
  if (mode === 'register' && password.length < PASSWORD_MIN_LENGTH) return 'weak-password'
  return null
}

/** Creates users/{uid} the first time a user is seen. Never overwrites an existing profile. */
export async function ensureUserProfile(user: User): Promise<void> {
  const { db } = services()
  const ref = doc(db, 'users', user.uid)
  const snapshot = await getDocFromServer(ref)
  if (snapshot.exists()) return
  await setDoc(ref, {
    email: user.email ?? '',
    // The language in use when the account is created becomes the saved preference.
    locale: getLocale(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function register(email: string, password: string): Promise<User> {
  const invalid = validateCredentials(email, password, 'register')
  if (invalid) throw new AuthError(invalid)
  try {
    const { user } = await createUserWithEmailAndPassword(services().auth, email.trim(), password)
    await ensureUserProfile(user)
    return user
  } catch (reason) {
    throw toAuthError(reason)
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  const invalid = validateCredentials(email, password, 'sign-in')
  if (invalid) throw new AuthError(invalid)
  try {
    const { user } = await signInWithEmailAndPassword(services().auth, email.trim(), password)
    return user
  } catch (reason) {
    throw toAuthError(reason)
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(services().auth)
  } catch (reason) {
    throw toAuthError(reason)
  }
}
