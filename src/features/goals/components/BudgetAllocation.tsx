import type { Dispatch } from 'react'
import { Button } from '../../../components/Button'
import { getAllocationTotal, getBudgetKg, shareToKg } from '../budget'
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
  const total = getAllocationTotal(plan.allocation)
  const remaining = 100 - total

  return (
    <Panel
      id="goals-allocation-title"
      title="Budget allocation by category"
      description={`Share your ${formatKg(budgetKg)} monthly budget between the parts of your life that produce emissions.`}
    >
      <ul className="goals-allocation">
        {CATEGORIES.map((category) => {
          const inputId = `allocation-${category.id}`
          const percent = plan.allocation[category.id]
          return (
            <li key={category.id} className="goals-allocation__item">
              <div className="goals-allocation__label">
                <label htmlFor={inputId} className="goals-label">
                  {category.label}
                </label>
                <span className="goals-allocation__value">
                  {percent}% · {formatKg(shareToKg(budgetKg, percent))}
                </span>
              </div>
              <p className="goals-hint">{category.description}</p>
              <input
                id={inputId}
                className="goals-range"
                type="range"
                min={0}
                max={100}
                step={1}
                value={percent}
                aria-valuetext={`${percent}%, ${formatKg(shareToKg(budgetKg, percent))}`}
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
        {remaining === 0 && <>Your whole budget is allocated.</>}
        {remaining > 0 && (
          <>
            <strong>{remaining}%</strong> of your budget is not allocated yet.
          </>
        )}
        {remaining < 0 && (
          <>
            You have allocated <strong>{-remaining}%</strong> more than your budget. Lower a
            category to reach 100%.
          </>
        )}
      </div>

      <div className="goals-actions">
        <Button variant="secondary" onClick={() => dispatch({ type: 'resetAllocation' })}>
          Reset to current split
        </Button>
      </div>
    </Panel>
  )
}
