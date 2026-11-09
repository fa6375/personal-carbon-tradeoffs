/** Aggregations used by the dashboard, history and breakdown screens. */
import { CATEGORIES, calculateEmissions, describeActivity } from './emissionFactors'
import { parseLocalDate, toLocalDay } from './format'
import type { Activity, ActivityCategory, PeriodId } from './types'

export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'month', label: 'This month' },
  { id: 'all', label: 'All time' },
]

/** First day included in a period, as "YYYY-MM-DD", or null for all time. */
export function periodStart(period: PeriodId, now = new Date()): string | null {
  switch (period) {
    case '7d':
      return toLocalDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6))
    case '30d':
      return toLocalDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29))
    case 'month':
      return toLocalDay(new Date(now.getFullYear(), now.getMonth(), 1))
    case 'all':
      return null
  }
}

export function inPeriod(activity: Activity, period: PeriodId, now = new Date()): boolean {
  const start = periodStart(period, now)
  return start === null || activity.date >= start
}

/** Newest first; same-day activities by most recently created. */
export function sortNewestFirst(activities: Activity[]): Activity[] {
  return [...activities].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  )
}

export function totalKg(activities: Activity[]): number {
  return activities.reduce((sum, activity) => sum + calculateEmissions(activity.details), 0)
}

export function totalsByCategory(activities: Activity[]): Record<ActivityCategory, number> {
  const totals: Record<ActivityCategory, number> = { transport: 0, food: 0, home: 0 }
  for (const activity of activities) {
    totals[activity.details.category] += calculateEmissions(activity.details)
  }
  return totals
}

export interface SourceTotal {
  category: ActivityCategory
  label: string
  kg: number
  count: number
}

/** Emissions grouped by what was done (e.g. "Bus", "Beef"), largest first. */
export function totalsBySource(activities: Activity[]): SourceTotal[] {
  const map = new Map<string, SourceTotal>()
  for (const activity of activities) {
    const label = describeActivity(activity.details)
    const key = `${activity.details.category}:${label}`
    const entry = map.get(key) ?? { category: activity.details.category, label, kg: 0, count: 0 }
    entry.kg += calculateEmissions(activity.details)
    entry.count += 1
    map.set(key, entry)
  }
  return [...map.values()].sort((a, b) => b.kg - a.kg)
}

/** Number of calendar days in a period that have already happened. */
export function daysInPeriod(period: PeriodId, activities: Activity[], now = new Date()): number {
  const start = periodStart(period, now)
  const first =
    start ?? (activities.length ? sortNewestFirst(activities).at(-1)!.date : toLocalDay(now))
  const from = parseLocalDate(first)
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1)
}

export function largestCategory(
  totals: Record<ActivityCategory, number>,
): ActivityCategory | null {
  const best = CATEGORIES.reduce<ActivityCategory | null>(
    (top, category) => (top === null || totals[category] > totals[top] ? category : top),
    null,
  )
  return best && totals[best] > 0 ? best : null
}
