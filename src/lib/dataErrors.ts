/**
 * Structured errors for everything that talks to Firebase or an external API.
 *
 * Services throw DataError with a stable `code`. User-facing text is looked up
 * from that code in errorMessages.ts, so it can be translated in one place
 * (English, Croatian and the third project language) without changing the
 * services.
 */
import { DEFAULT_ERROR_MESSAGES } from './errorMessages'

export type DataErrorCode =
  | 'not-configured'
  | 'not-signed-in'
  | 'permission-denied'
  | 'unavailable'
  | 'timeout'
  | 'not-found'
  | 'invalid-data'
  | 'quota-exceeded'
  | 'local-storage-unavailable'
  | 'local-data-damaged'
  | 'unknown'

export class DataError extends Error {
  readonly code: DataErrorCode

  constructor(code: DataErrorCode, message: string = DEFAULT_ERROR_MESSAGES[code]) {
    super(message)
    this.name = 'DataError'
    this.code = code
  }
}

/** Maps Firebase/Firestore error codes (e.g. "permission-denied") to DataError. */
export function toDataError(reason: unknown): DataError {
  if (reason instanceof DataError) return reason
  const code = typeof reason === 'object' && reason !== null && 'code' in reason ? String(reason.code) : ''
  switch (code.replace(/^firestore\//, '')) {
    case 'permission-denied':
    case 'unauthenticated':
      return new DataError('permission-denied')
    case 'unavailable':
    case 'failed-precondition':
      return new DataError('unavailable')
    case 'deadline-exceeded':
      return new DataError('timeout')
    case 'not-found':
      return new DataError('not-found')
    case 'invalid-argument':
      return new DataError('invalid-data')
    case 'resource-exhausted':
      return new DataError('quota-exceeded')
    default:
      return new DataError('unknown')
  }
}

/** Fails with a "timeout" DataError if the promise has not settled in time. */
export function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new DataError('timeout')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (reason: unknown) => {
        clearTimeout(timer)
        reject(toDataError(reason))
      },
    )
  })
}
