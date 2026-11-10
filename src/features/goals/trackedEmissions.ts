/*
 * Read-only bridge from Personal Carbon Tracking to Goals.
 *
 * Goals does not store or calculate activities itself. It reads the user's
 * recorded activities through Tracking's useActivities hook and summarises
 * them with Tracking's own helpers, so both features always show the same
 * totals.
 */
import { inPeriod, totalsByCategory } from '../tracking/stats'
import type { LoadStatus } from '../tracking/useActivities'
import type { Activity } from '../tracking/types'
import { roundKg } from './budget'
import { CATEGORY_IDS } from './sampleData'
import type { CategoryAmounts } from './types'

export interface TrackedTotals {
  /** Number of activities in the period. */
  count: number
  amounts: CategoryAmounts
}

export interface TrackedData {
  status: LoadStatus
  error: string | null
  reload: () => void
  /** Last 30 days, used as a baseline. */
  last30Days: TrackedTotals
  /** Calendar month so far, used for goal progress. */
  thisMonth: TrackedTotals
}

function summarise(activities: Activity[], period: '30d' | 'month', now: Date): TrackedTotals {
  const inRange = activities.filter((activity) => inPeriod(activity, period, now))
  const totals = totalsByCategory(inRange)
  return {
    count: inRange.length,
    amounts: Object.fromEntries(CATEGORY_IDS.map((id) => [id, roundKg(totals[id])])) as CategoryAmounts,
  }
}

export function summariseTracked(
  status: LoadStatus,
  activities: Activity[],
  error: string | null,
  reload: () => void,
  now = new Date(),
): TrackedData {
  return {
    status,
    error,
    reload,
    last30Days: summarise(activities, '30d', now),
    thisMonth: summarise(activities, 'month', now),
  }
}
