import { roundKg, splitKg } from '../budget'
import { formatDateTime, formatKg } from '../format'
import { CATEGORIES, getCategoryLabel } from '../sampleData'
import type { BudgetAdjustment, GoalPlan } from '../types'
import { Panel } from './GoalsUi'

interface AdjustmentDetailsProps {
  plan: GoalPlan
  selectedId: string | null
  onSelect: (id: string) => void
}

function summary(adjustment: BudgetAdjustment): string {
  return adjustment.kind === 'reallocate'
    ? `${getCategoryLabel(adjustment.from)} → ${getCategoryLabel(adjustment.to)}, ${adjustment.percentPoints}%`
    : `Goal ${adjustment.reductionBefore}% → ${adjustment.reductionAfter}%`
}

/** Screen 9 – Budget adjustment details. */
export function AdjustmentDetails({ plan, selectedId, onSelect }: AdjustmentDetailsProps) {
  const selected =
    plan.adjustments.find((adjustment) => adjustment.id === selectedId) ?? plan.adjustments[0]

  return (
    <Panel
      id="goals-adjust-details-title"
      title="Budget adjustment details"
      description="What changed with each adjustment, with the values before and after."
    >
      {plan.adjustments.length === 0 ? (
        <p className="goals-empty">
          No adjustments yet. When you move budget between categories or change your goal, the
          details appear here.
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
                  <span>{summary(adjustment)}</span>
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
  const before = splitKg(adjustment.budgetBefore, adjustment.allocationBefore)
  const after = splitKg(adjustment.budgetAfter, adjustment.allocationAfter)
  const budgetChange = roundKg(adjustment.budgetAfter - adjustment.budgetBefore)

  return (
    <div className="goals-adjustment-detail">
      <h4 className="goals-subheading">{summary(adjustment)}</h4>
      <dl className="goals-detail-list">
        {adjustment.kind === 'reallocate' ? (
          <>
            <div>
              <dt>Moved</dt>
              <dd>
                {adjustment.percentPoints}% · {formatKg(roundKg(after[adjustment.to] - before[adjustment.to]))}{' '}
                a month
              </dd>
            </div>
            <div>
              <dt>From → to</dt>
              <dd>
                {getCategoryLabel(adjustment.from)} → {getCategoryLabel(adjustment.to)}
              </dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt>Reduction goal</dt>
              <dd>
                {adjustment.reductionBefore}% → {adjustment.reductionAfter}%
              </dd>
            </div>
            <div>
              <dt>Monthly budget</dt>
              <dd>
                {formatKg(adjustment.budgetBefore)} → {formatKg(adjustment.budgetAfter)} (
                {budgetChange > 0 ? '+' : ''}
                {formatKg(budgetChange)})
              </dd>
            </div>
          </>
        )}
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
          <caption className="goals-table__caption">Final monthly budget by category</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Before</th>
              <th scope="col">After</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((category) => {
              const percentBefore = adjustment.allocationBefore[category.id]
              const percentAfter = adjustment.allocationAfter[category.id]
              const changed = before[category.id] !== after[category.id]
              return (
                <tr key={category.id} className={changed ? 'goals-table__row--changed' : undefined}>
                  <th scope="row">{category.label}</th>
                  <td>
                    {percentBefore}% · {formatKg(before[category.id])}
                  </td>
                  <td>
                    {percentAfter}% · {formatKg(after[category.id])}
                    {changed && <span className="visually-hidden"> (changed)</span>}
                  </td>
                </tr>
              )
            })}
            <tr className="goals-table__total">
              <th scope="row">Total</th>
              <td>{formatKg(adjustment.budgetBefore)}</td>
              <td>{formatKg(adjustment.budgetAfter)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
