/** Display formatting for the Goals feature. English only until i18n is set up. */

const kgFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 0 })
const monthFormatter = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatKg(kg: number): string {
  return `${kgFormatter.format(kg)} kg CO₂e`
}

/** Formats a "YYYY-MM" month, optionally shifted by a number of months. */
export function formatMonth(yearMonth: string, offset = 0): string {
  const [year, month] = yearMonth.split('-').map(Number)
  return monthFormatter.format(new Date(year, month - 1 + offset, 1))
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
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
