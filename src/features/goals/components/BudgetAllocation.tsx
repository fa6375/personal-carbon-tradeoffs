import type { Dispatch } from 'react'
import { Button } from '../../../components/Button'
import { useI18n } from '../../../i18n'
import { getAllocationTotal, getBudgetKg, roundKg, splitKg, sumAmounts } from '../budget'
import { formatKg, formatPercentValue } from '../format'
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
  const { t } = useI18n()
  const budgetKg = getBudgetKg(plan)
  const split = splitKg(budgetKg, plan.allocation)
  const total = getAllocationTotal(plan.allocation)
  const remaining = 100 - total

  return (
    <Panel
      id="goals-allocation-title"
      title={t('goals.allocation.title')}
      description={t('goals.allocation.description', { budget: formatKg(budgetKg) })}
    >
      <ul className="goals-allocation">
        {CATEGORIES.map((category) => {
          const inputId = `allocation-${category.id}`
          const hintId = `${inputId}-hint`
          const percent = plan.allocation[category.id]
          const nowKg = plan.baseline.amounts[category.id]
          const change = split[category.id] - nowKg
          const changeText =
            change < 0
              ? ` · ${t('goals.allocation.cut', { kg: formatKg(-change) })}`
              : change > 0
                ? ` · ${t('goals.allocation.room', { kg: formatKg(change) })}`
                : ''
          return (
            <li key={category.id} className="goals-allocation__item">
              <div className="goals-allocation__label">
                <label htmlFor={inputId} className="goals-label">
                  {category.label}
                </label>
                <span className="goals-allocation__value">
                  {formatPercentValue(percent)} · {formatKg(split[category.id])}
                </span>
              </div>
              <p id={hintId} className="goals-hint">
                {t('goals.allocation.now', { kg: formatKg(nowKg) })}
                {changeText}
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
                aria-valuetext={`${formatPercentValue(percent)}, ${formatKg(split[category.id])}`}
                onChange={(event) =>
                  dispatch({ type: 'setAllocation', category: category.id, percent: Number(event.target.value) })
                }
              />
            </li>
          )
        })}
      </ul>

      <div className={`goals-callout${remaining === 0 ? '' : ' goals-callout--warning'}`} role="status">
        {remaining === 0 && t('goals.allocation.complete')}
        {remaining > 0 &&
          t('goals.allocation.remaining', {
            percent: formatPercentValue(remaining),
            kg: formatKg(roundKg(budgetKg - sumAmounts(split))),
          })}
        {remaining < 0 &&
          t('goals.allocation.over', { total: formatPercentValue(total), over: formatPercentValue(-remaining) })}
      </div>

      <div className="goals-actions">
        <Button variant="secondary" onClick={() => dispatch({ type: 'resetAllocation' })}>
          {t('goals.allocation.matchCurrent')}
        </Button>
      </div>
    </Panel>
  )
}
