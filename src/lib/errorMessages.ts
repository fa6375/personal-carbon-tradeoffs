/**
 * English defaults for DataError codes (used as Error.message for logs and
 * tests). The interface shows the translated text from src/i18n via
 * dataErrorText(); English, Croatian and German live in src/i18n/locales.
 * Services never build user-facing text themselves.
 */
import { t } from '../i18n'
import type { DataErrorCode } from './dataErrors'

export const DEFAULT_ERROR_MESSAGES: Record<DataErrorCode, string> = {
  'not-configured':
    'The database is not configured for this copy of the app. Add the Firebase settings to .env.local (see README).',
  'not-signed-in': 'Sign in to see and save your data.',
  'permission-denied': 'You do not have permission to access this data. Try signing in again.',
  unavailable: 'The database cannot be reached. Check your internet connection and try again.',
  timeout: 'The database took too long to answer. Check your connection and try again.',
  'not-found': 'This item could not be found. It may have been deleted.',
  'invalid-data': 'The data was rejected because it is not valid.',
  'quota-exceeded': 'The database is temporarily over its usage limit. Try again later.',
  'local-storage-unavailable': 'This browser does not allow the app to read its local data.',
  'local-data-damaged': 'Data saved earlier in this browser could not be read. It may be damaged.',
  unknown: 'Something went wrong while talking to the database. Try again.',
}

/**
 * Translated text for a DataError (or anything thrown by a service), in the
 * current language. Use this in components instead of `error.message`, and
 * prefer storing the code in state so the text follows language changes.
 */
export function dataErrorText(reason: unknown): string {
  return t(`errors.data.${dataErrorCode(reason)}`)
}

/** The DataErrorCode for anything thrown by a service ('unknown' if it is not a DataError). */
export function dataErrorCode(reason: unknown): DataErrorCode {
  if (typeof reason === 'string' && reason in DEFAULT_ERROR_MESSAGES) return reason as DataErrorCode
  if (typeof reason === 'object' && reason !== null && 'code' in reason) {
    const code = String((reason as { code: unknown }).code)
    if (code in DEFAULT_ERROR_MESSAGES) return code as DataErrorCode
  }
  return 'unknown'
}
