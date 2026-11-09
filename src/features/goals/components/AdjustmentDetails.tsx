import { shareToKg } from '../budget'
import { formatDateTime, formatKg } from '../format'
import { CATEGORIES, getCategoryLabel } from '../sampleData'
import type { BudgetAdjustment, GoalPlan } from '../types'
import { Panel } from './GoalsUi'

interface AdjustmentDetailsProps {
  plan: GoalPlan
  selectedId: string | null
  onSelect: (id: string) => void
}

/** Screen 9 – Budget adjustment details. */
export function AdjustmentDetails({ plan, selectedId, onSelect }: AdjustmentDetailsProps) {
  const selected =
    plan.adjustments.find((adjustment) => adjustment.id === selectedId) ?? plan.adjustments[0]

  return (
    <Panel
      id="goals-adjust-details-title"
      title="Budget adjustment details"
      description="What changed with each adjustment you made."
    >
      {plan.adjustments.length === 0 ? (
        <p className="goals-empty">
          No adjustments yet. When you move budget between categories, the details appear here.
        </p>
      ) : (
        <div className="goals-adjustments">
          <ul className="goals-adjustments__list" aria-label="Adjustments, newest first">
            {plan.adjustments.map((adjustment) => (
              <li key={adjustment.id}>
                <button
                  type="button"
                  className="goals-adjustments__button"
                  aria-current={adjustment.id === selected?.id ? 'true' : undefined}
                  onClick={() => onSelect(adjustment.id)}
                >
                  <span>
                    {getCategoryLabel(adjustment.from)} → {getCategoryLabel(adjustment.to)},{' '}
                    {adjustment.percentPoints}%
                  </span>
                  <span className="goals-hint">{formatDateTime(adjustment.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
          {selected && <AdjustmentDetail adjustment={selected} />}
        </div>
      )}
    </Panel>
  )
}

function AdjustmentDetail({ adjustment }: { adjustment: BudgetAdjustment }) {
  const movedKg = shareToKg(adjustment.budgetKg, adjustment.percentPoints)
  return (
    <div className="goals-adjustment-detail">
      <dl className="goals-detail-list">
        <div>
          <dt>Moved</dt>
          <dd>
            {adjustment.percentPoints}% · {formatKg(movedKg)} a month
          </dd>
        </div>
        <div>
          <dt>From → to</dt>
          <dd>
            {getCategoryLabel(adjustment.from)} → {getCategoryLabel(adjustment.to)}
          </dd>
        </div>
        <div>
          <dt>When</dt>
          <dd>{formatDateTime(adjustment.createdAt)}</dd>
        </div>
        <div>
          <dt>Reason</dt>
          <dd>{adjustment.reason || 'No reason given'}</dd>
        </div>
      </dl>

      <div className="goals-table-wrap">
        <table className="goals-table">
          <caption className="goals-table__caption">Allocation before and after</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Before</th>
              <th scope="col">After</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((category) => {
              const before = adjustment.allocationBefore[category.id]
              const after = adjustment.allocationAfter[category.id]
              const changed = before !== after
              return (
                <tr key={category.id} className={changed ? 'goals-table__row--changed' : undefined}>
                  <th scope="row">{category.label}</th>
                  <td>
                    {before}% · {formatKg(shareToKg(adjustment.budgetKg, before))}
                  </td>
                  <td>
                    {after}% · {formatKg(shareToKg(adjustment.budgetKg, after))}
                    {changed && <span className="visually-hidden"> (changed)</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
