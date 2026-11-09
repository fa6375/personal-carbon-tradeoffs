import { useId, useState } from 'react'
import { CATEGORIES, CATEGORY_LABELS } from '../emissionFactors'
import { formatActivityCount, formatKg, formatPercent } from '../format'
import { PERIODS, inPeriod, totalKg, totalsByCategory, totalsBySource } from '../stats'
import type { Activity, PeriodId } from '../types'
import { CategoryTag, EstimateNotice, Panel, ShareBar } from './TrackingUi'

/** Screen 9 — Carbon Emissions Breakdown. */
export function EmissionsBreakdown({ activities }: { activities: Activity[] }) {
  const [period, setPeriod] = useState<PeriodId>('30d')
  const selectId = useId()

  const selected = activities.filter((activity) => inPeriod(activity, period))
  const total = totalKg(selected)
  const byCategory = totalsByCategory(selected)
  const bySource = totalsBySource(selected)
  const periodLabel = PERIODS.find((option) => option.id === period)!.label.toLowerCase()

  return (
    <div className="tracking-grid">
      <Panel
        id="tracking-breakdown-title"
        title="Emissions by category"
        description={`${formatActivityCount(selected.length)} · ${formatKg(total)} in ${periodLabel === 'all time' ? 'total' : `the ${periodLabel}`}`}
        actions={
          <div className="tracking-field tracking-field--inline">
            <label htmlFor={selectId} className="tracking-field__label">
              Period
            </label>
            <select
              id={selectId}
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
        }
      >
        {total > 0 ? (
          <div className="tracking-bars">
            {CATEGORIES.map((category) => (
              <ShareBar
                key={category}
                category={category}
                label={CATEGORY_LABELS[category]}
                share={byCategory[category] / total}
                valueText={`${formatKg(byCategory[category])} (${formatPercent(byCategory[category] / total)})`}
              />
            ))}
          </div>
        ) : (
          <p className="tracking-muted" role="status">
            {selected.length > 0
              ? 'The activities in this period have zero estimated emissions, for example walking or cycling.'
              : 'No activities in this period. Choose a longer period to see your breakdown.'}
          </p>
        )}
      </Panel>

      <Panel id="tracking-sources-title" title="Largest sources" description="What contributed most in this period.">
        {bySource.length > 0 ? (
          <div className="tracking-table-wrap">
            <table className="tracking-table">
              <caption className="visually-hidden">Emissions by source, largest first</caption>
              <thead>
                <tr>
                  <th scope="col">Source</th>
                  <th scope="col" className="tracking-table__num">
                    Activities
                  </th>
                  <th scope="col" className="tracking-table__num">
                    Emissions
                  </th>
                  <th scope="col" className="tracking-table__num">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {bySource.map((row) => (
                  <tr key={`${row.category}-${row.label}`}>
                    <th scope="row">
                      <span className="tracking-table__source">
                        {row.label}
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
          <p className="tracking-muted">Nothing recorded in this period.</p>
        )}
        <EstimateNotice />
      </Panel>
    </div>
  )
}
