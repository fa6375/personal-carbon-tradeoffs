import { useId, useMemo, useState } from 'react'
import { Icon } from '../../../components/Icon'
import { CATEGORIES, CATEGORY_LABELS, calculateEmissions, describeActivity } from '../emissionFactors'
import { formatActivityCount, formatAmount, formatDay, formatKg } from '../format'
import { PERIODS, inPeriod, sortNewestFirst, totalKg } from '../stats'
import type { Activity, ActivityCategory, PeriodId } from '../types'
import { CategoryTag, Panel } from './TrackingUi'

interface ActivityHistoryProps {
  activities: Activity[]
  onOpen: (id: string) => void
}

/** Screen 6 — Activity History, with search and filters. */
export function ActivityHistory({ activities, onOpen }: ActivityHistoryProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ActivityCategory | 'all'>('all')
  const [period, setPeriod] = useState<PeriodId>('all')
  const idPrefix = useId()

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('en')
    return sortNewestFirst(activities).filter((activity) => {
      if (category !== 'all' && activity.details.category !== category) return false
      if (!inPeriod(activity, period)) return false
      if (!needle) return true
      const haystack = [
        activity.note,
        describeActivity(activity.details),
        CATEGORY_LABELS[activity.details.category],
      ]
        .join(' ')
        .toLocaleLowerCase('en')
      return haystack.includes(needle)
    })
  }, [activities, query, category, period])

  const filtered = query.trim() !== '' || category !== 'all' || period !== 'all'

  return (
    <Panel id="tracking-history-title" title="All activities">
      <div className="tracking-filters" role="search" aria-label="Filter activities">
        <div className="tracking-field tracking-filters__search">
          <label htmlFor={`${idPrefix}-q`} className="tracking-field__label">
            Search
          </label>
          <div className="tracking-search">
            <Icon name="search" size={18} />
            <input
              id={`${idPrefix}-q`}
              type="search"
              className="tracking-input"
              placeholder="Note, type or category"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="tracking-field">
          <label htmlFor={`${idPrefix}-c`} className="tracking-field__label">
            Category
          </label>
          <select
            id={`${idPrefix}-c`}
            className="tracking-input"
            value={category}
            onChange={(event) => setCategory(event.target.value as ActivityCategory | 'all')}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((id) => (
              <option key={id} value={id}>
                {CATEGORY_LABELS[id]}
              </option>
            ))}
          </select>
        </div>
        <div className="tracking-field">
          <label htmlFor={`${idPrefix}-p`} className="tracking-field__label">
            Period
          </label>
          <select
            id={`${idPrefix}-p`}
            className="tracking-input"
            value={period}
            onChange={(event) => setPeriod(event.target.value as PeriodId)}
          >
            {PERIODS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="tracking-results" role="status" aria-live="polite">
        {formatActivityCount(results.length)} · {formatKg(totalKg(results))}
        {filtered && results.length !== activities.length && ` (of ${activities.length} in total)`}
      </p>

      {results.length === 0 ? (
        <div className="tracking-no-results">
          <p>No activities match these filters.</p>
          <button
            type="button"
            className="tracking-link-button"
            onClick={() => {
              setQuery('')
              setCategory('all')
              setPeriod('all')
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="tracking-list">
          {results.map((activity) => (
            <li key={activity.id}>
              <button type="button" className="tracking-row" onClick={() => onOpen(activity.id)}>
                <span className="tracking-row__main">
                  <span className="tracking-row__title">
                    {describeActivity(activity.details)} · {formatAmount(activity.details)}
                  </span>
                  {activity.note && <span className="tracking-row__note">{activity.note}</span>}
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
      )}
    </Panel>
  )
}
