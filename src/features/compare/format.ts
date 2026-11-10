/** Display formatting for Compare Everyday Choices. English only until i18n is set up. */

const kgFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 2 })
const euroFormatter = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' })
const numberFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 2 })
const factorFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 3 })
const percentFormatter = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 0 })
const dateTimeFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' })
const pluralRules = new Intl.PluralRules('en')

export function formatKg(kg: number): string {
  return `${kgFormatter.format(kg)} kg CO₂e`
}

export function formatEuro(eur: number): string {
  return euroFormatter.format(eur)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** Emission factors need three decimals, e.g. 0.035 kg/km. */
export function formatFactor(value: number): string {
  return factorFormatter.format(value)
}

export function formatPercent(share: number): string {
  return percentFormatter.format(share)
}

/** "45 min", "1 h 5 min". */
export function formatDuration(minutes: number): string {
  const total = Math.round(minutes)
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

export function formatPeople(count: number): string {
  return `${count} ${pluralRules.select(count) === 'one' ? 'person' : 'people'}`
}

function signed(difference: number, format: (value: number) => string, epsilon: number): string {
  if (Math.abs(difference) < epsilon) return 'same'
  return `${difference > 0 ? '+' : '−'}${format(Math.abs(difference))}`
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
  return `${count} ${pluralRules.select(count) === 'one' ? 'comparison' : 'comparisons'}`
}
