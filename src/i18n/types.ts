/** Types for the localization system (see src/i18n/README section in the project README). */
import type { en } from './locales/en'

export type Locale = 'en' | 'hr' | 'de'

/**
 * A message that depends on a number. Keys are Intl.PluralRules categories:
 * English and German use one/other, Croatian uses one/few/other.
 */
export interface PluralMessage {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

/** Same shape as the English messages, with every leaf widened to string or PluralMessage. */
export type MessageShape<T> = T extends string
  ? string
  : T extends { other: string }
    ? PluralMessage
    : { [K in keyof T]: MessageShape<T[K]> }

export type Messages = MessageShape<typeof en>

/** Every translation key, e.g. "nav.home" or "tracking.activityCount". */
export type MessageKey = Leaves<typeof en>

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string | { other: string }
    ? `${Prefix}${K}`
    : Leaves<T[K], `${Prefix}${K}.`>
}[keyof T & string]

export type MessageParams = Record<string, string | number>
