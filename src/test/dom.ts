/**
 * Helpers for component tests that run in jsdom. jsdom does not implement a
 * few browser APIs the app uses, so minimal stand-ins are installed here.
 */
import axe from 'axe-core'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { setLocale } from '../i18n'
import { setMissingTranslationHandler } from '../i18n/translate'

export function installDomStubs() {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList
  }
  const dialog = window.HTMLDialogElement?.prototype
  if (dialog && !dialog.showModal) {
    dialog.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
    dialog.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open')
    }
  }
  if (typeof globalThis.CSS === 'undefined' || !globalThis.CSS.escape) {
    // Enough for the ids React generates with useId (letters, digits, "_", "-", ":").
    const escape = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`)
    Object.defineProperty(globalThis, 'CSS', { value: { escape }, configurable: true })
  }
  // axe-core probes canvas support; jsdom has no canvas, so report "unsupported" quietly.
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext
  window.scrollTo = () => undefined
  Element.prototype.scrollIntoView = () => undefined
}

export function setOnline(online: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { value: online, configurable: true })
  window.dispatchEvent(new Event(online ? 'online' : 'offline'))
}

/** Registers the usual per-test setup: English, online, no leftover DOM. */
export function setupTestEnvironment() {
  installDomStubs()
  beforeEach(() => {
    window.localStorage.clear()
    setOnline(true)
    setLocale('en')
  })
  afterEach(() => {
    cleanup()
    setMissingTranslationHandler(() => undefined)
  })
}

/** Fails the test if any translation key is missing while rendering. */
export function failOnMissingTranslations(): string[] {
  const missing: string[] = []
  setMissingTranslationHandler((locale, key) => missing.push(`${locale}:${key}`))
  return missing
}

/**
 * Runs axe-core on the element. Colour contrast cannot be computed in jsdom
 * (no layout or computed colours), so it is checked separately from the
 * design tokens in styles.test.ts.
 */
export async function axeViolations(element: Element, { page = false } = {}) {
  const result = await axe.run(element, {
    rules: {
      'color-contrast': { enabled: false },
      // Single components are not wrapped in page landmarks in these tests.
      region: { enabled: page },
    },
  })
  return result.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`)
}
