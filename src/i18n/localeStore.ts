/**
 * The current language, shared by the whole app.
 *
 * - A saved choice (localStorage) wins.
 * - Otherwise the first supported browser language is used.
 * - Otherwise English.
 * Changing the language saves it, updates <html lang> and notifies React.
 */
import type { Locale } from './types'

export const SUPPORTED_LOCALES: Locale[] = ['en', 'hr', 'de']
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_STORAGE_KEY = 'carbon-choices.locale'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as string[]).includes(value)
}

function readSaved(): Locale | null {
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(saved) ? saved : null
  } catch {
    return null
  }
}

/** Maps browser languages such as "hr-HR" or "de-AT" to a supported locale. */
export function matchBrowserLocale(languages: readonly string[]): Locale | null {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0]
    if (isLocale(base)) return base
  }
  return null
}

export function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const browser = typeof navigator !== 'undefined' ? (navigator.languages ?? [navigator.language]) : []
  return readSaved() ?? matchBrowserLocale(browser) ?? DEFAULT_LOCALE
}

let current: Locale = detectInitialLocale()
const listeners = new Set<() => void>()

function applyToDocument(locale: Locale) {
  if (typeof document !== 'undefined') document.documentElement.lang = locale
}

applyToDocument(current)

export function getLocale(): Locale {
  return current
}

export function setLocale(locale: Locale): void {
  if (!isLocale(locale)) return
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Storage blocked (private mode): the choice still applies until reload.
  }
  if (locale === current) return
  current = locale
  applyToDocument(locale)
  listeners.forEach((listener) => listener())
}

export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** For tests: re-read the saved/browser language as on a fresh page load. */
export function resetLocaleForTests(): void {
  current = detectInitialLocale()
  applyToDocument(current)
  listeners.forEach((listener) => listener())
}
