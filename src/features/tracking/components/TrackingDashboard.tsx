import { Button } from '../../../components/Button'
import { CATEGORIES, CATEGORY_LABELS, calculateEmissions, describeActivity } from '../emissionFactors'
import { formatActivityCount, formatAmount, formatDay, formatKg, formatPercent } from '../format'
import {
  daysInPeriod,
  inPeriod,
  largestCategory,
  sortNewestFirst,
  totalKg,
  totalsByCategory,
} from '../stats'
import type { Activity } from '../types'
import { CategoryTag, EstimateNotice, Panel, ShareBar, StatTile } from './TrackingUi'

interface TrackingDashboardProps {
  activities: Activity[]
  onOpen: (id: string) => void
  onHistory: () => void
  onBreakdown: () => void
}

/** Screen 1 — Carbon Tracking Dashboard. */
export function TrackingDashboard({
  activities,
  onOpen,
  onHistory,
  onBreakdown,
}: TrackingDashboardProps) {
  const thisMonth = activities.filter((activity) => inPeriod(activity, 'month'))
  const lastWeek = activities.filter((activity) => inPeriod(activity, '7d'))
  const monthTotal = totalKg(thisMonth)
  const monthByCategory = totalsByCategory(thisMonth)
  const top = largestCategory(monthByCategory)
  const dailyAverage = monthTotal / daysInPeriod('month', thisMonth)
  const recent = sortNewestFirst(activities).slice(0, 5)

  return (
    <div className="tracking-grid">
      <Panel
        id="tracking-overview-title"
        title="This month at a glance"
      >
        <dl className="tracking-stats">
          <StatTile
            label="Emissions this month"
            value={formatKg(monthTotal)}
            hint={formatActivityCount(thisMonth.length)}
          />
          <StatTile label="Daily average" value={formatKg(dailyAverage)} hint="This month so far" />
          <StatTile
            label="Last 7 days"
            value={formatKg(totalKg(lastWeek))}
            hint={formatActivityCount(lastWeek.length)}
          />
          <StatTile
            label="Largest source"
            value={top ? CATEGORY_LABELS[top] : '—'}
            hint={top ? formatPercent(monthByCategory[top] / monthTotal) + ' of this month' : 'Nothing this month yet'}
          />
        </dl>
        <EstimateNotice />
      </Panel>

      <Panel
        id="tracking-month-categories-title"
        title="This month by category"
        actions={
          <Button variant="secondary" icon="chart" onClick={onBreakdown}>
            Full breakdown
          </Button>
        }
      >
        {monthTotal > 0 ? (
          <div className="tracking-bars">
            {CATEGORIES.map((category) => (
              <ShareBar
                key={category}
                category={category}
                label={CATEGORY_LABELS[category]}
                share={monthByCategory[category] / monthTotal}
                valueText={`${formatKg(monthByCategory[category])} (${formatPercent(monthByCategory[category] / monthTotal)})`}
              />
            ))}
          </div>
        ) : (
          <p className="tracking-muted">
            No emissions recorded this month yet. Activities from earlier months are in your
            history.
          </p>
        )}
      </Panel>

      <Panel
        id="tracking-recent-title"
        title="Recent activities"
        actions={
          <Button variant="secondary" icon="list" onClick={onHistory}>
            View history
          </Button>
        }
      >
        <ul className="tracking-list">
          {recent.map((activity) => (
            <li key={activity.id}>
              <button
                type="button"
                className="tracking-row"
                onClick={() => onOpen(activity.id)}
              >
                <span className="tracking-row__main">
                  <span className="tracking-row__title">
                    {describeActivity(activity.details)} · {formatAmount(activity.details)}
                  </span>
                  <span className="tracking-row__meta">
                    <CategoryTag category={activity.details.category} />
                    <span>{formatDay(activity.date)}</span>
                  </span>
                </span>
                <span className="tracking-row__value">
                  {formatKg(calculateEmissions(activity.details))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
