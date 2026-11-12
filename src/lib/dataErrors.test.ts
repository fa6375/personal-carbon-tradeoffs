import { describe, expect, it } from 'vitest'
import { DataError, toDataError, withTimeout } from './dataErrors'

describe('data errors', () => {
  it('maps Firestore error codes to stable codes', () => {
    expect(toDataError({ code: 'permission-denied' }).code).toBe('permission-denied')
    expect(toDataError({ code: 'unavailable' }).code).toBe('unavailable')
    expect(toDataError({ code: 'resource-exhausted' }).code).toBe('quota-exceeded')
    expect(toDataError(new Error('odd')).code).toBe('unknown')
    const original = new DataError('not-found')
    expect(toDataError(original)).toBe(original)
  })

  it('times out slow operations with a timeout error', async () => {
    await expect(withTimeout(new Promise(() => undefined), 20)).rejects.toMatchObject({ code: 'timeout' })
    await expect(withTimeout(Promise.resolve(5), 20)).resolves.toBe(5)
  })

  it('has a message for every code', () => {
    expect(new DataError('not-configured').message).toMatch(/\.env\.local/)
  })
})
