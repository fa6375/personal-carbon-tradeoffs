import type { Dispatch } from 'react'
import { Button } from '../../../components/Button'
import { getAllocationTotal, getBudgetKg, roundKg, splitKg, sumAmounts } from '../budget'
import { formatKg } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import { CATEGORIES } from '../sampleData'
import type { GoalPlan } from '../types'
import { Panel } from './GoalsUi'

interface BudgetAllocationProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
}

/** Screen 3 – Budget allocation by category. */
export function BudgetAllocation({ plan, dispatch }: BudgetAllocationProps) {
  const budgetKg = getBudgetKg(plan)
  const split = splitKg(budgetKg, plan.allocation)
  const total = getAllocationTotal(plan.allocation)
  const remaining = 100 - total

  return (
    <Panel
      id="goals-allocation-title"
      title="Budget allocation by category"
      description={`Share your ${formatKg(budgetKg)} monthly budget between the parts of your life that produce emissions. The same categories are used in Carbon tracking.`}
    >
      <ul className="goals-allocation">
        {CATEGORIES.map((category) => {
          const inputId = `allocation-${category.id}`
          const hintId = `${inputId}-hint`
          const percent = plan.allocation[category.id]
          const nowKg = plan.baseline.amounts[category.id]
          const change = split[category.id] - nowKg
          return (
            <li key={category.id} className="goals-allocation__item">
              <div className="goals-allocation__label">
                <label htmlFor={inputId} className="goals-label">
                  {category.label}
                </label>
                <span className="goals-allocation__value">
                  {percent}% · {formatKg(split[category.id])}
                </span>
              </div>
              <p id={hintId} className="goals-hint">
                Now {formatKg(nowKg)}
                {change < 0
                  ? ` · cut ${formatKg(-change)}`
                  : change > 0
                    ? ` · ${formatKg(change)} more room than now`
                    : ''}
              </p>
              <input
                id={inputId}
                className="goals-range"
                type="range"
                min={0}
                max={100}
                step={1}
                value={percent}
                aria-describedby={hintId}
                aria-valuetext={`${percent}%, ${formatKg(split[category.id])}`}
                onChange={(event) =>
                  dispatch({
                    type: 'setAllocation',
                    category: category.id,
                    percent: Number(event.target.value),
                  })
                }
              />
            </li>
          )
        })}
      </ul>

      <div
        className={`goals-callout${remaining === 0 ? '' : ' goals-callout--warning'}`}
        role="status"
      >
        {remaining === 0 && <>All 100% of your budget is allocated.</>}
        {remaining > 0 && (
          <>
            <strong>{remaining}%</strong> ({formatKg(roundKg(budgetKg - sumAmounts(split)))}) of
            your budget is not allocated yet. Raise a category until the total is 100%.
          </>
        )}
        {remaining < 0 && (
          <>
            You have allocated <strong>{total}%</strong>, which is {-remaining}% more than your
            budget. Lower a category until the total is 100%.
          </>
        )}
      </div>

      <div className="goals-actions">
        <Button variant="secondary" onClick={() => dispatch({ type: 'resetAllocation' })}>
          Match my current split
        </Button>
      </div>
    </Panel>
  )
}
