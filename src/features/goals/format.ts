/** Display formatting for the Goals feature, in the current language (src/i18n). */
import { format } from '../../i18n'

/** Same precision as Personal Carbon Tracking, so the two features show the same figures. */
export function formatKg(kg: number): string {
  return format().kg(kg)
}

/** A whole percentage given as a number, e.g. 20 → "20%" / "20 %". */
export function formatPercentValue(percent: number): string {
  return format().percent(percent / 100)
}

/** Formats a "YYYY-MM" month, optionally shifted by a number of months. */
export function formatMonth(yearMonth: string, offset = 0): string {
  const [year, month] = yearMonth.split('-').map(Number)
  return format().month(new Date(year, month - 1 + offset, 1))
}

export function formatDateTime(iso: string): string {
  return format().dateTime(new Date(iso))
}

export function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** The current month and the following months as "YYYY-MM" values. */
export function getUpcomingMonths(count: number, from = new Date()): string[] {
  return Array.from({ length: count }, (_, offset) =>
    toYearMonth(new Date(from.getFullYear(), from.getMonth() + offset, 1)),
  )
}

/** Day of the month and number of days in it, for the given date. */
export function getMonthProgress(date = new Date()): { current: number; total: number } {
  return {
    current: date.getDate(),
    total: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
  }
}
