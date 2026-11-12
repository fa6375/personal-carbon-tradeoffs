/**
 * Display formatting for the Tracking feature, in the current language
 * (src/i18n). Dates are stored as "YYYY-MM-DD" and never translated.
 */
import { format, t } from '../../i18n'
import type { ActivityDetails } from './types'

export function formatKg(kg: number): string {
  return format().kg(kg)
}

export function formatNumber(value: number): string {
  return format().number(value)
}

export function formatPercent(share: number): string {
  return format().percent(share)
}

/** Parses "YYYY-MM-DD" as a local date (not UTC). */
export function parseLocalDate(day: string): Date {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year, month - 1, date)
}

export function formatDay(day: string): string {
  return format().date(parseLocalDate(day))
}

export function formatLongDay(day: string): string {
  return format().longDate(parseLocalDate(day))
}

export function formatDateTime(iso: string): string {
  return format().dateTime(new Date(iso))
}

export function toLocalDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function today(): string {
  return toLocalDay(new Date())
}

/** "1 activity" / "3 activities" (Croatian: aktivnost / aktivnosti) using the locale's plural rules. */
export function formatActivityCount(count: number): string {
  return t('tracking.activityCount', { count })
}

/** The amount part of an activity, e.g. "12 km", "2 servings", "150 kWh". */
export function formatAmount(details: ActivityDetails): string {
  switch (details.category) {
    case 'transport':
      return `${formatNumber(details.distanceKm)} km`
    case 'food':
      return t('tracking.servings', { count: details.servings })
    case 'home':
      return `${formatNumber(details.kwh)} kWh`
  }
}
