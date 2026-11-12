import { useId, useState } from 'react'
import { useI18n } from '../../../i18n'
import { CATEGORIES } from '../emissionFactors'
import { formatActivityCount, formatKg, formatPercent } from '../format'
import { categoryLabel, sourceLabel } from '../labels'
import { PERIODS, inPeriod, totalKg, totalsByCategory, totalsBySource } from '../stats'
import type { Activity, PeriodId } from '../types'
import { CategoryTag, EstimateNotice, Panel, ShareBar } from './TrackingUi'

/** Screen 9 — Carbon Emissions Breakdown. */
export function EmissionsBreakdown({ activities }: { activities: Activity[] }) {
  const { t, locale } = useI18n()
  const [period, setPeriod] = useState<PeriodId>('30d')
  const selectId = useId()

  const selected = activities.filter((activity) => inPeriod(activity, period))
  const total = totalKg(selected)
  const byCategory = totalsByCategory(selected)
  // Largest first; equal amounts are ordered by their translated name with the
  // language's own collation (so Č, Ć and Š sort correctly in Croatian).
  const collator = new Intl.Collator(locale)
  const bySource = totalsBySource(selected).sort(
    (a, b) =>
      b.kg - a.kg || collator.compare(sourceLabel(a.category, a.source), sourceLabel(b.category, b.source)),
  )

  return (
    <div className="tracking-grid">
      <Panel
        id="tracking-breakdown-title"
        title={t('tracking.breakdown.title')}
        description={t('tracking.breakdown.summary', {
          activities: formatActivityCount(selected.length),
          kg: formatKg(total),
          period: t(`tracking.breakdown.periodPhrase.${period}`),
        })}
        actions={
          <div className="tracking-field tracking-field--inline">
            <label htmlFor={selectId} className="tracking-field__label">
              {t('tracking.breakdown.period')}
            </label>
            <select
              id={selectId}
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
        }
      >
        {total > 0 ? (
          <div className="tracking-bars">
            {CATEGORIES.map((category) => (
              <ShareBar
                key={category}
                category={category}
                label={categoryLabel(category)}
                share={byCategory[category] / total}
                valueText={`${formatKg(byCategory[category])} (${formatPercent(byCategory[category] / total)})`}
              />
            ))}
          </div>
        ) : (
          <p className="tracking-muted" role="status">
            {selected.length > 0 ? t('tracking.breakdown.zero') : t('tracking.breakdown.none')}
          </p>
        )}
      </Panel>

      <Panel
        id="tracking-sources-title"
        title={t('tracking.breakdown.sourcesTitle')}
        description={t('tracking.breakdown.sourcesDescription')}
      >
        {bySource.length > 0 ? (
          <div className="tracking-table-wrap">
            <table className="tracking-table">
              <caption className="visually-hidden">{t('tracking.breakdown.caption')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('tracking.breakdown.source')}</th>
                  <th scope="col" className="tracking-table__num">
                    {t('tracking.breakdown.activities')}
                  </th>
                  <th scope="col" className="tracking-table__num">
                    {t('tracking.breakdown.emissions')}
                  </th>
                  <th scope="col" className="tracking-table__num">
                    {t('tracking.breakdown.share')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {bySource.map((row) => (
                  <tr key={`${row.category}-${row.source}`}>
                    <th scope="row">
                      <span className="tracking-table__source">
                        {sourceLabel(row.category, row.source)}
                        <CategoryTag category={row.category} />
                      </span>
                    </th>
                    <td className="tracking-table__num">{row.count}</td>
                    <td className="tracking-table__num">{formatKg(row.kg)}</td>
                    <td className="tracking-table__num">{total > 0 ? formatPercent(row.kg / total) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="tracking-muted">{t('tracking.breakdown.nothing')}</p>
        )}
        <EstimateNotice />
      </Panel>
    </div>
  )
}
