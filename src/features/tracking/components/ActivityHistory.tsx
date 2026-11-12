import { useId, useMemo, useState } from 'react'
import { Icon } from '../../../components/Icon'
import { useI18n } from '../../../i18n'
import { CATEGORIES, calculateEmissions, describeActivity } from '../emissionFactors'
import { formatActivityCount, formatAmount, formatDay, formatKg } from '../format'
import { categoryLabel, describeActivityLocalized } from '../labels'
import { PERIODS, inPeriod, sortNewestFirst, totalKg } from '../stats'
import type { Activity, ActivityCategory, PeriodId } from '../types'
import { CategoryTag, Panel } from './TrackingUi'

interface ActivityHistoryProps {
  activities: Activity[]
  onOpen: (id: string) => void
}

/** Screen 6 — Activity History, with search and filters. */
export function ActivityHistory({ activities, onOpen }: ActivityHistoryProps) {
  const { t, locale } = useI18n()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ActivityCategory | 'all'>('all')
  const [period, setPeriod] = useState<PeriodId>('all')
  const idPrefix = useId()

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale)
    return sortNewestFirst(activities).filter((activity) => {
      if (category !== 'all' && activity.details.category !== category) return false
      if (!inPeriod(activity, period)) return false
      if (!needle) return true
      // Search the translated names and the English ones, so both work.
      const haystack = [
        activity.note,
        describeActivityLocalized(activity.details),
        describeActivity(activity.details),
        categoryLabel(activity.details.category),
      ]
        .join(' ')
        .toLocaleLowerCase(locale)
      return haystack.includes(needle)
    })
  }, [activities, query, category, period, locale])

  const filtered = query.trim() !== '' || category !== 'all' || period !== 'all'

  return (
    <Panel id="tracking-history-title" title={t('tracking.history.title')}>
      <div className="tracking-filters" role="search" aria-label={t('tracking.history.filtersLabel')}>
        <div className="tracking-field tracking-filters__search">
          <label htmlFor={`${idPrefix}-q`} className="tracking-field__label">
            {t('tracking.history.search')}
          </label>
          <div className="tracking-search">
            <Icon name="search" size={18} />
            <input
              id={`${idPrefix}-q`}
              type="search"
              className="tracking-input"
              placeholder={t('tracking.history.searchPlaceholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="tracking-field">
          <label htmlFor={`${idPrefix}-c`} className="tracking-field__label">
            {t('tracking.history.category')}
          </label>
          <select
            id={`${idPrefix}-c`}
            className="tracking-input"
            value={category}
            onChange={(event) => setCategory(event.target.value as ActivityCategory | 'all')}
          >
            <option value="all">{t('tracking.history.allCategories')}</option>
            {CATEGORIES.map((id) => (
              <option key={id} value={id}>
                {categoryLabel(id)}
              </option>
            ))}
          </select>
        </div>
        <div className="tracking-field">
          <label htmlFor={`${idPrefix}-p`} className="tracking-field__label">
            {t('tracking.history.period')}
          </label>
          <select
            id={`${idPrefix}-p`}
            className="tracking-input"
            value={period}
            onChange={(event) => setPeriod(event.target.value as PeriodId)}
          >
            {PERIODS.map((option) => (
              <option key={option.id} value={option.id}>
                {t(`tracking.periods.${option.id}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="tracking-results" role="status" aria-live="polite">
        {formatActivityCount(results.length)} · {formatKg(totalKg(results))}
        {filtered && results.length !== activities.length && ` ${t('tracking.history.ofTotal', { total: activities.length })}`}
      </p>

      {results.length === 0 ? (
        <div className="tracking-no-results">
          <p>{t('tracking.history.noResults')}</p>
          <button
            type="button"
            className="tracking-link-button"
            onClick={() => {
              setQuery('')
              setCategory('all')
              setPeriod('all')
            }}
          >
            {t('tracking.history.clearFilters')}
          </button>
        </div>
      ) : (
        <ul className="tracking-list">
          {results.map((activity) => (
            <li key={activity.id}>
              <button type="button" className="tracking-row" onClick={() => onOpen(activity.id)}>
                <span className="tracking-row__main">
                  <span className="tracking-row__title">
                    {describeActivityLocalized(activity.details)} · {formatAmount(activity.details)}
                  </span>
                  {activity.note && <span className="tracking-row__note">{activity.note}</span>}
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
      )}
    </Panel>
  )
}
