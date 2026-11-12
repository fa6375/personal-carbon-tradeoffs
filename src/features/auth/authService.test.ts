import { describe, expect, it } from 'vitest'
import { validateCredentials } from './authService'

describe('credential validation', () => {
  it('checks the email and password before calling Firebase', () => {
    expect(validateCredentials('not-an-email', 'secret1', 'sign-in')).toBe('invalid-email')
    expect(validateCredentials('ana@example.com', '', 'sign-in')).toBe('missing-password')
    expect(validateCredentials('ana@example.com', '123', 'register')).toBe('weak-password')
    expect(validateCredentials('ana@example.com', '123', 'sign-in')).toBeNull()
    expect(validateCredentials(' marija.horvat@fer.hr ', 'lozinka1', 'register')).toBeNull()
  })
})
