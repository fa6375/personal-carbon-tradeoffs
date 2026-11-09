/** Display formatting for the Tracking feature. English only until i18n is set up. */
import type { ActivityDetails } from './types'

const kgFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 1 })
const numberFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 1 })
const percentFormatter = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 0 })
const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })
const longDateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'full' })
const dateTimeFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' })
const pluralRules = new Intl.PluralRules('en')

export function formatKg(kg: number): string {
  return `${kgFormatter.format(kg)} kg CO₂e`
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatPercent(share: number): string {
  return percentFormatter.format(share)
}

/** Parses "YYYY-MM-DD" as a local date (not UTC). */
export function parseLocalDate(day: string): Date {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year, month - 1, date)
}

export function formatDay(day: string): string {
  return dateFormatter.format(parseLocalDate(day))
}

export function formatLongDay(day: string): string {
  return longDateFormatter.format(parseLocalDate(day))
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

export function toLocalDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function today(): string {
  return toLocalDay(new Date())
}

/** "1 activity" / "3 activities", using the locale's plural rules. */
export function formatActivityCount(count: number): string {
  return `${count} ${pluralRules.select(count) === 'one' ? 'activity' : 'activities'}`
}

/** The amount part of an activity, e.g. "12 km", "2 servings", "150 kWh". */
export function formatAmount(details: ActivityDetails): string {
  switch (details.category) {
    case 'transport':
      return `${formatNumber(details.distanceKm)} km`
    case 'food':
      return `${formatNumber(details.servings)} ${pluralRules.select(details.servings) === 'one' ? 'serving' : 'servings'}`
    case 'home':
      return `${formatNumber(details.kwh)} kWh`
  }
}
