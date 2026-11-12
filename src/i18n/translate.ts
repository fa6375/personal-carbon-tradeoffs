/**
 * Pure translation helpers: key lookup, {placeholder} interpolation and
 * plural selection with Intl.PluralRules. No React and no global state, so
 * they are easy to test.
 */
import { MESSAGES } from './locales'
import type { Locale, MessageKey, MessageParams, Messages, PluralMessage } from './types'

type Leaf = string | PluralMessage

const pluralRulesCache = new Map<Locale, Intl.PluralRules>()

function pluralRules(locale: Locale): Intl.PluralRules {
  let rules = pluralRulesCache.get(locale)
  if (!rules) {
    rules = new Intl.PluralRules(locale)
    pluralRulesCache.set(locale, rules)
  }
  return rules
}

/** Called when a key is missing; tests replace it to fail loudly. */
let onMissing: (locale: Locale, key: string) => void = (locale, key) => {
  if (import.meta.env.DEV) console.warn(`[i18n] Missing translation "${key}" for "${locale}"`)
}

export function setMissingTranslationHandler(handler: (locale: Locale, key: string) => void) {
  onMissing = handler
}

export function lookup(messages: Messages, key: string): Leaf | undefined {
  let node: unknown = messages
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = (node as Record<string, unknown>)[part]
  }
  if (typeof node === 'string') return node
  if (typeof node === 'object' && node !== null && 'other' in node) return node as PluralMessage
  return undefined
}

export function isPluralMessage(value: unknown): value is PluralMessage {
  return typeof value === 'object' && value !== null && 'other' in value
}

/** Picks the plural form for `count` in `locale`, falling back to "other". */
export function selectPlural(locale: Locale, message: PluralMessage, count: number): string {
  const category = pluralRules(locale).select(count) as keyof PluralMessage
  return message[category] ?? message.other
}

/** Replaces {name} placeholders. Numbers are formatted for the locale. */
export function interpolate(locale: Locale, text: string, params?: MessageParams): string {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name]
    if (value === undefined) return match
    return typeof value === 'number' ? new Intl.NumberFormat(locale).format(value) : value
  })
}

/**
 * Translates a key. Falls back to English, then to the key itself, so a
 * missing translation never breaks the page (and is reported in development).
 */
export function translate(locale: Locale, key: MessageKey | string, params?: MessageParams): string {
  let leaf = lookup(MESSAGES[locale], key)
  if (leaf === undefined) {
    onMissing(locale, key)
    leaf = lookup(MESSAGES.en, key)
    if (leaf === undefined) return key
  }
  if (isPluralMessage(leaf)) {
    const count = typeof params?.count === 'number' ? params.count : 0
    return interpolate(locale, selectPlural(locale, leaf, count), params)
  }
  return interpolate(locale, leaf, params)
}
