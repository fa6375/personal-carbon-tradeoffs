import { describe, expect, it } from 'vitest'
import { decideLocaleOnSignIn } from './localePreference'

describe('locale preference on sign-in', () => {
  it('applies the language saved in the profile', () => {
    expect(decideLocaleOnSignIn('hr', 'en')).toEqual({ apply: 'hr', save: null })
  })

  it('does nothing when the profile already matches', () => {
    expect(decideLocaleOnSignIn('de', 'de')).toEqual({ apply: null, save: null })
  })

  it('saves the current language when the profile has none, without changing the interface', () => {
    expect(decideLocaleOnSignIn(undefined, 'hr')).toEqual({ apply: null, save: 'hr' })
    expect(decideLocaleOnSignIn(null, 'en')).toEqual({ apply: null, save: 'en' })
  })

  it('ignores an unknown saved value', () => {
    expect(decideLocaleOnSignIn('fr', 'de')).toEqual({ apply: null, save: 'de' })
  })
})
