/**
 * Localization entry point.
 *
 * In components:   const { t, locale, format } = useI18n()
 *                  t('nav.home'), t('tracking.activityCount', { count: 3 })
 * Outside React:   t('errors.data.unavailable') uses the current language.
 *
 * Components that call useI18n re-render when the language changes. App
 * itself calls useI18n, so the whole tree re-renders without losing state.
 */
import { useSyncExternalStore } from 'react'
import { createFormatters, type Formatters } from './format'
import { getLocale, setLocale, subscribeLocale } from './localeStore'
import { translate } from './translate'
import type { Locale, MessageKey, MessageParams } from './types'

export type { Locale, MessageKey, MessageParams } from './types'
export { SUPPORTED_LOCALES, getLocale, setLocale } from './localeStore'
export type { Formatters } from './format'

/** Translates with the current language (for code outside components). */
export function t(key: MessageKey, params?: MessageParams): string {
  return translate(getLocale(), key, params)
}

/** Formatters for the current language (for code outside components). */
export function format(): Formatters {
  return createFormatters(getLocale())
}

export interface I18n {
  locale: Locale
  t: (key: MessageKey, params?: MessageParams) => string
  format: Formatters
  setLocale: (locale: Locale) => void
}

const cache = new Map<Locale, I18n>()

function i18nFor(locale: Locale): I18n {
  let value = cache.get(locale)
  if (!value) {
    value = {
      locale,
      t: (key, params) => translate(locale, key, params),
      format: createFormatters(locale),
      setLocale,
    }
    cache.set(locale, value)
  }
  return value
}

export function useI18n(): I18n {
  const locale = useSyncExternalStore(subscribeLocale, getLocale, getLocale)
  return i18nFor(locale)
}
