/**
 * English text for DataError codes. This is the one place to translate
 * backend and API errors; services never build user-facing text themselves.
 */
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
