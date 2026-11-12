/** Locale-aware formatting with Intl, shared by every feature. */
import type { Locale } from './types'

export interface Formatters {
  /** Plain number, e.g. 1,234.5 / 1.234,5 */
  number: (value: number, maximumFractionDigits?: number) => string
  /** kg CO₂e with one decimal at most, e.g. "12.5 kg CO₂e" / "12,5 kg CO₂e". */
  kg: (kg: number) => string
  /** Share 0–1 as a percentage, e.g. "46%" / "46 %". */
  percent: (share: number) => string
  /** Euros, e.g. "€3.20" / "3,20 €". */
  currency: (eur: number) => string
  /** Date only, e.g. "Nov 12, 2026" / "12. 11. 2026." */
  date: (value: Date) => string
  /** Long date, e.g. "Thursday, November 12, 2026". */
  longDate: (value: Date) => string
  /** Date and time. */
  dateTime: (value: Date) => string
  /** Month and year, e.g. "November 2026" / "studeni 2026.". */
  month: (value: Date) => string
  /** Duration in minutes, e.g. "1 h 5 min". */
  minutes: (minutes: number) => string
}

export function createFormatters(locale: Locale): Formatters {
  const numberFormats = new Map<number, Intl.NumberFormat>()
  const numberWith = (digits: number) => {
    let formatter = numberFormats.get(digits)
    if (!formatter) {
      formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: digits })
      numberFormats.set(digits, formatter)
    }
    return formatter
  }
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })
  const currency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' })
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
  const longDate = new Intl.DateTimeFormat(locale, { dateStyle: 'full' })
  const dateTime = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })
  const month = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
  const hourUnit = new Intl.NumberFormat(locale, { style: 'unit', unit: 'hour', unitDisplay: 'short' })
  const minuteUnit = new Intl.NumberFormat(locale, { style: 'unit', unit: 'minute', unitDisplay: 'short' })

  return {
    number: (value, digits = 1) => numberWith(digits).format(value),
    kg: (kg) => `${numberWith(1).format(kg)} kg CO₂e`,
    percent: (share) => percent.format(share),
    currency: (eur) => currency.format(eur),
    date: (value) => date.format(value),
    longDate: (value) => longDate.format(value),
    dateTime: (value) => dateTime.format(value),
    month: (value) => month.format(value),
    minutes: (total) => {
      const rounded = Math.round(total)
      const hours = Math.floor(rounded / 60)
      const rest = rounded % 60
      if (hours === 0) return minuteUnit.format(rest)
      return rest === 0 ? hourUnit.format(hours) : `${hourUnit.format(hours)} ${minuteUnit.format(rest)}`
    },
  }
}
