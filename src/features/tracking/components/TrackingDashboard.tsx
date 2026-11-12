import { Button } from '../../../components/Button'
import { useI18n } from '../../../i18n'
import { CATEGORIES, calculateEmissions } from '../emissionFactors'
import { formatActivityCount, formatAmount, formatDay, formatKg, formatPercent } from '../format'
import { categoryLabel, describeActivityLocalized } from '../labels'
import { daysInPeriod, inPeriod, largestCategory, sortNewestFirst, totalKg, totalsByCategory } from '../stats'
import type { Activity } from '../types'
import { CategoryTag, EstimateNotice, Panel, ShareBar, StatTile } from './TrackingUi'

interface TrackingDashboardProps {
  activities: Activity[]
  onOpen: (id: string) => void
  onHistory: () => void
  onBreakdown: () => void
}

/** Screen 1 — Carbon Tracking Dashboard. */
export function TrackingDashboard({ activities, onOpen, onHistory, onBreakdown }: TrackingDashboardProps) {
  const { t } = useI18n()
  const thisMonth = activities.filter((activity) => inPeriod(activity, 'month'))
  const lastWeek = activities.filter((activity) => inPeriod(activity, '7d'))
  const monthTotal = totalKg(thisMonth)
  const monthByCategory = totalsByCategory(thisMonth)
  const top = largestCategory(monthByCategory)
  const dailyAverage = monthTotal / daysInPeriod('month', thisMonth)
  const recent = sortNewestFirst(activities).slice(0, 5)

  return (
    <div className="tracking-grid">
      <Panel id="tracking-overview-title" title={t('tracking.dashboard.overviewTitle')}>
        <dl className="tracking-stats">
          <StatTile
            label={t('tracking.dashboard.monthTotal')}
            value={formatKg(monthTotal)}
            hint={formatActivityCount(thisMonth.length)}
          />
          <StatTile
            label={t('tracking.dashboard.dailyAverage')}
            value={formatKg(dailyAverage)}
            hint={t('tracking.dashboard.soFar')}
          />
          <StatTile
            label={t('tracking.dashboard.lastWeek')}
            value={formatKg(totalKg(lastWeek))}
            hint={formatActivityCount(lastWeek.length)}
          />
          <StatTile
            label={t('tracking.dashboard.largest')}
            value={top ? categoryLabel(top) : '—'}
            hint={
              top
                ? t('tracking.dashboard.ofMonth', { percent: formatPercent(monthByCategory[top] / monthTotal) })
                : t('tracking.dashboard.nothingYet')
            }
          />
        </dl>
        <EstimateNotice />
      </Panel>

      <Panel
        id="tracking-month-categories-title"
        title={t('tracking.dashboard.byCategory')}
        actions={
          <Button variant="secondary" icon="chart" onClick={onBreakdown}>
            {t('tracking.dashboard.fullBreakdown')}
          </Button>
        }
      >
        {monthTotal > 0 ? (
          <div className="tracking-bars">
            {CATEGORIES.map((category) => (
              <ShareBar
                key={category}
                category={category}
                label={categoryLabel(category)}
                share={monthByCategory[category] / monthTotal}
                valueText={`${formatKg(monthByCategory[category])} (${formatPercent(monthByCategory[category] / monthTotal)})`}
              />
            ))}
          </div>
        ) : (
          <p className="tracking-muted">{t('tracking.dashboard.noneThisMonth')}</p>
        )}
      </Panel>

      <Panel
        id="tracking-recent-title"
        title={t('tracking.dashboard.recent')}
        actions={
          <Button variant="secondary" icon="list" onClick={onHistory}>
            {t('tracking.dashboard.viewHistory')}
          </Button>
        }
      >
        <ul className="tracking-list">
          {recent.map((activity) => (
            <li key={activity.id}>
              <button type="button" className="tracking-row" onClick={() => onOpen(activity.id)}>
                <span className="tracking-row__main">
                  <span className="tracking-row__title">
                    {describeActivityLocalized(activity.details)} · {formatAmount(activity.details)}
                  </span>
                  <span className="tracking-row__meta">
                    <CategoryTag category={activity.details.category} />
                    <span>{formatDay(activity.date)}</span>
                  </span>
                </span>
                <span className="tracking-row__value">{formatKg(calculateEmissions(activity.details))}</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
