/** English text for AuthErrorCode values (translate here). */
import { PASSWORD_MIN_LENGTH, type AuthErrorCode } from './authService'

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  'invalid-email': 'Enter a valid email address, for example name@example.com.',
  'missing-password': 'Enter your password.',
  'weak-password': `Use a password with at least ${PASSWORD_MIN_LENGTH} characters.`,
  'email-in-use': 'An account with this email already exists. Sign in instead.',
  'wrong-credentials': 'The email or password is not correct.',
  'too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
  network: 'Could not reach the sign-in service. Check your internet connection.',
  'not-enabled': 'Email and password sign-in is not enabled for this Firebase project.',
  'not-configured': 'Sign-in is not available because Firebase is not configured (see README).',
  unknown: 'Sign-in failed. Try again.',
}
