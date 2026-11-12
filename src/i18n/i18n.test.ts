import { describe, expect, it } from 'vitest'
import { createFormatters } from './format'
import { matchBrowserLocale } from './localeStore'
import { MESSAGES } from './locales'
import { isPluralMessage, setMissingTranslationHandler, translate } from './translate'
import type { Locale, PluralMessage } from './types'

type Tree = { [key: string]: string | PluralMessage | Tree }

/** Every leaf as [key, value]. */
function leaves(tree: Tree, prefix = ''): [string, string | PluralMessage][] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string' || isPluralMessage(value)) return [[path, value] as [string, string | PluralMessage]]
    return leaves(value as Tree, path)
  })
}

function placeholders(value: string | PluralMessage): string[] {
  const texts = typeof value === 'string' ? [value] : Object.values(value).filter((v): v is string => typeof v === 'string')
  const names = new Set<string>()
  for (const text of texts) for (const match of text.matchAll(/\{(\w+)\}/g)) names.add(match[1])
  return [...names].sort()
}

const english = new Map(leaves(MESSAGES.en as unknown as Tree))

describe.each(['hr', 'de'] as Locale[])('%s translations', (locale) => {
  const translated = new Map(leaves(MESSAGES[locale] as unknown as Tree))

  it('has exactly the same keys as English', () => {
    expect([...translated.keys()].sort()).toEqual([...english.keys()].sort())
  })

  it('has no empty texts', () => {
    const empty = [...translated].filter(([, value]) =>
      typeof value === 'string' ? value.trim() === '' : Object.values(value).some((text) => !text?.trim()),
    )
    expect(empty.map(([key]) => key)).toEqual([])
  })

  it('uses the same {placeholders} as English', () => {
    const mismatched = [...english]
      .filter(([key, value]) => {
        const other = translated.get(key)
        if (!other) return false
        // A plural form may leave out {count} (e.g. "one" written as a word); compare the rest.
        const strip = (names: string[]) => names.filter((name) => name !== 'count')
        return strip(placeholders(value)).join() !== strip(placeholders(other)).join()
      })
      .map(([key]) => key)
    expect(mismatched).toEqual([])
  })

  it('uses plural messages exactly where English does', () => {
    const wrongShape = [...english]
      .filter(([key, value]) => isPluralMessage(value) !== isPluralMessage(translated.get(key)))
      .map(([key]) => key)
    expect(wrongShape).toEqual([])
  })
})

describe('plural forms', () => {
  const plurals = (locale: Locale) =>
    leaves(MESSAGES[locale] as unknown as Tree).filter((entry): entry is [string, PluralMessage] => isPluralMessage(entry[1]))

  it('Croatian has one, few and other for every plural message', () => {
    const incomplete = plurals('hr').filter(([, value]) => !value.one || !value.few || !value.other)
    expect(incomplete.map(([key]) => key)).toEqual([])
  })

  it('English and German have one and other for every plural message', () => {
    for (const locale of ['en', 'de'] as Locale[]) {
      const incomplete = plurals(locale).filter(([, value]) => !value.one || !value.other)
      expect(incomplete.map(([key]) => key)).toEqual([])
    }
  })

  it('selects the three Croatian plural categories correctly', () => {
    const count = (n: number) => translate('hr', 'tracking.activityCount', { count: n })
    expect(count(1)).toBe('1 aktivnost')
    expect(count(21)).toBe('21 aktivnost')
    expect(count(2)).toBe('2 aktivnosti')
    expect(count(5)).toBe('5 aktivnosti')

    const saved = (n: number) => translate('hr', 'import.savedComparisons', { count: n })
    expect(saved(1)).toBe('1 spremljena usporedba') // one
    expect(saved(3)).toBe('3 spremljene usporedbe') // few
    expect(saved(24)).toBe('24 spremljene usporedbe') // few
    expect(saved(5)).toBe('5 spremljenih usporedbi') // other
    expect(saved(12)).toBe('12 spremljenih usporedbi') // other (11–14 are not "few")
    expect(saved(0)).toBe('0 spremljenih usporedbi') // other

    const months = (n: number) => translate('hr', 'goals.setup.months', { count: n })
    expect([months(1), months(3), months(6), months(12)]).toEqual(['1 mjesec', '3 mjeseca', '6 mjeseci', '12 mjeseci'])
  })

  it('selects English and German forms correctly', () => {
    expect(translate('en', 'compare.people', { count: 1 })).toBe('1 person')
    expect(translate('en', 'compare.people', { count: 3 })).toBe('3 people')
    expect(translate('de', 'compare.people', { count: 1 })).toBe('1 Person')
    expect(translate('de', 'compare.people', { count: 3 })).toBe('3 Personen')
  })
})

describe('translate', () => {
  it('fills in placeholders and formats numbers for the language', () => {
    expect(translate('en', 'goals.adjust.errors.goalRange', { min: 1, max: 1000 })).toBe('Enter a whole number from 1 to 1,000.')
    expect(translate('de', 'goals.adjust.errors.goalRange', { min: 1, max: 1000 })).toBe(
      'Geben Sie eine ganze Zahl von 1 bis 1.000 ein.',
    )
  })

  it('reports a missing key and falls back to the key', () => {
    const missing: string[] = []
    setMissingTranslationHandler((locale, key) => missing.push(`${locale}:${key}`))
    expect(translate('hr', 'does.not.exist' as never)).toBe('does.not.exist')
    expect(missing).toEqual(['hr:does.not.exist'])
    setMissingTranslationHandler(() => undefined)
  })
})

describe('browser language', () => {
  it('picks the first supported language', () => {
    expect(matchBrowserLocale(['hr-HR', 'en-US'])).toBe('hr')
    expect(matchBrowserLocale(['de-AT'])).toBe('de')
    expect(matchBrowserLocale(['fr-FR', 'de-DE'])).toBe('de')
    expect(matchBrowserLocale(['fr-FR', 'it'])).toBeNull()
  })
})

describe('formatting with Intl', () => {
  it('formats currency, numbers, dates and durations per language', () => {
    const en = createFormatters('en')
    const hr = createFormatters('hr')
    const de = createFormatters('de')
    const nbsp = (text: string) => text.replace(/\s/g, ' ')

    expect(en.currency(3.2)).toBe('€3.20')
    expect(nbsp(de.currency(3.2))).toBe('3,20 €')
    expect(nbsp(hr.currency(3.2))).toBe('3,20 €')
    expect(en.kg(12.5)).toBe('12.5 kg CO₂e')
    expect(de.kg(12.5)).toBe('12,5 kg CO₂e')
    expect(nbsp(de.percent(0.46))).toBe('46 %')
    expect(en.percent(0.46)).toBe('46%')

    const date = new Date(2026, 10, 12)
    expect(en.month(date)).toBe('November 2026')
    expect(de.month(date)).toBe('November 2026')
    expect(hr.month(date)).toMatch(/^studen(i|og) 2026\.$/)
    expect(nbsp(en.minutes(65))).toBe('1 hr 5 min')
    expect(nbsp(de.minutes(45))).toBe('45 Min.')
  })
})
