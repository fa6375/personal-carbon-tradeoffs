/** Display formatting for Compare Everyday Choices, in the current language (src/i18n). */
import { format, t } from '../../i18n'

export function formatKg(kg: number): string {
  return `${format().number(kg, 2)} kg CO₂e`
}

export function formatEuro(eur: number): string {
  return format().currency(eur)
}

export function formatNumber(value: number): string {
  return format().number(value, 2)
}

/** Emission factors need three decimals, e.g. 0.035 kg/km. */
export function formatFactor(value: number): string {
  return format().number(value, 3)
}

export function formatPercent(share: number): string {
  return format().percent(share)
}

/** "45 min", "1 h 5 min" (unit names follow the language). */
export function formatDuration(minutes: number): string {
  return format().minutes(minutes)
}

export function formatDateTime(iso: string): string {
  return format().dateTime(new Date(iso))
}

export function formatPeople(count: number): string {
  return t('compare.people', { count })
}

function signed(difference: number, formatValue: (value: number) => string, epsilon: number): string {
  if (Math.abs(difference) < epsilon) return t('compare.same')
  return `${difference > 0 ? '+' : '−'}${formatValue(Math.abs(difference))}`
}

/** Differences such as "+1.2 kg CO₂e", "−€0.80", "+12 min" or "same". */
export function formatKgDifference(difference: number): string {
  return signed(difference, formatKg, 0.005)
}

export function formatEuroDifference(difference: number): string {
  return signed(difference, formatEuro, 0.005)
}

export function formatDurationDifference(difference: number): string {
  return signed(difference, formatDuration, 0.5)
}

export function formatComparisonCount(count: number): string {
  return t('compare.comparisons', { count })
}
