// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const KEY = 'carbon-choices.locale'

function setBrowserLanguages(languages: string[]) {
  Object.defineProperty(window.navigator, 'languages', { value: languages, configurable: true })
  Object.defineProperty(window.navigator, 'language', { value: languages[0] ?? 'en', configurable: true })
}

/** Imports the store fresh, as on a new page load. */
async function loadStore() {
  vi.resetModules()
  return import('./localeStore')
}

describe('language preference', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.lang = 'en'
  })

  afterEach(() => setBrowserLanguages(['en-US']))

  it('uses the browser language when nothing is saved', async () => {
    setBrowserLanguages(['de-DE', 'en'])
    const store = await loadStore()
    expect(store.getLocale()).toBe('de')
    expect(document.documentElement.lang).toBe('de')
  })

  it('falls back to English for unsupported browser languages', async () => {
    setBrowserLanguages(['fr-FR'])
    const store = await loadStore()
    expect(store.getLocale()).toBe('en')
  })

  it('saves the choice, updates <html lang> and notifies listeners', async () => {
    setBrowserLanguages(['en-GB'])
    const store = await loadStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribeLocale(listener)

    store.setLocale('hr')

    expect(store.getLocale()).toBe('hr')
    expect(window.localStorage.getItem(KEY)).toBe('hr')
    expect(document.documentElement.lang).toBe('hr')
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('keeps the saved choice after a reload, even if the browser language differs', async () => {
    setBrowserLanguages(['de-DE'])
    const first = await loadStore()
    first.setLocale('hr')

    // Simulate a page reload: the module is loaded again from scratch.
    const reloaded = await loadStore()
    expect(reloaded.getLocale()).toBe('hr')
    expect(document.documentElement.lang).toBe('hr')
  })

  it('ignores an invalid saved value', async () => {
    window.localStorage.setItem(KEY, 'xx')
    setBrowserLanguages(['hr'])
    const store = await loadStore()
    expect(store.getLocale()).toBe('hr')
  })
})
