import { describe, expect, it } from 'vitest'
import { toDocumentId } from './localImport'

describe('local import ids', () => {
  it('keeps UUIDs and makes other ids safe for Firestore', () => {
    expect(toDocumentId('8cb25f2f-55d9-4e38-8f79-b12beaebee48')).toBe('8cb25f2f-55d9-4e38-8f79-b12beaebee48')
    expect(toDocumentId('1700000000-ab/cd')).toBe('1700000000-ab_cd')
    expect(toDocumentId('')).toBe('imported')
  })
})
