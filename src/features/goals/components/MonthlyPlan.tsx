import { getBaselineKg, getMonthlyTargets, getPlanMonth, splitKg } from '../budget'
import { formatKg, formatMonth } from '../format'
import { CATEGORIES } from '../sampleData'
import type { GoalPlan } from '../types'
import { Panel, ProgressBar } from './GoalsUi'

interface MonthlyPlanProps {
  plan: GoalPlan
  /** The current calendar month, "YYYY-MM". */
  currentMonth: string
}

/** Screen 5 – Monthly carbon plan. */
export function MonthlyPlan({ plan, currentMonth }: MonthlyPlanProps) {
  const targets = getMonthlyTargets(plan)
  const baselineKg = getBaselineKg(plan)
  const planMonth = getPlanMonth(plan, currentMonth)

  return (
    <Panel
      id="goals-monthly-title"
      title="Monthly carbon plan"
      description={`Your budget steps down by the same amount each month, from ${formatKg(baselineKg)} now to ${formatKg(targets[targets.length - 1].targetKg)} in ${formatMonth(plan.startMonth, plan.durationMonths - 1)}, so the change stays manageable.`}
    >
      {planMonth.timing === 'not-started' && (
        <p className="goals-callout">
          Your plan starts in {formatMonth(plan.startMonth)}. Until then, progress is measured
          against the first month’s target.
        </p>
      )}
      {planMonth.timing === 'finished' && (
        <p className="goals-callout">
          This plan ended in {formatMonth(plan.startMonth, plan.durationMonths - 1)}. Your final
          budget stays in place; start a new plan in step 1 to keep going.
        </p>
      )}

      <div className="goals-table-wrap">
        <table className="goals-table">
          <caption className="visually-hidden">
            Monthly budget targets from {formatMonth(plan.startMonth)} to{' '}
            {formatMonth(plan.startMonth, plan.durationMonths - 1)}, with each category’s share
          </caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Budget</th>
              {CATEGORIES.map((category) => (
                <th key={category.id} scope="col" className="goals-table__wide">
                  {category.label}
                </th>
              ))}
              <th scope="col">Less than now</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => {
              const isCurrent = planMonth.timing === 'active' && planMonth.index === target.index
              const split = splitKg(target.targetKg, plan.allocation)
              const label = formatMonth(plan.startMonth, target.index)
              return (
                <tr
                  key={target.index}
                  className={isCurrent ? 'goals-table__row--current' : undefined}
                  aria-current={isCurrent ? 'date' : undefined}
                >
                  <th scope="row">
                    {label}
                    {isCurrent && <span className="goals-tag goals-tag--inline">This month</span>}
                  </th>
                  <td>
                    <span className="goals-table__value">{formatKg(target.targetKg)}</span>
                    <ProgressBar
                      label={`Budget for ${label}`}
                      value={target.targetKg}
                      max={baselineKg}
                      valueText={`${formatKg(target.targetKg)} of ${formatKg(baselineKg)} now`}
                    />
                  </td>
                  {CATEGORIES.map((category) => (
                    <td key={category.id} className="goals-table__wide">
                      {formatKg(split[category.id])}
                    </td>
                  ))}
                  <td>{formatKg(target.reductionKg)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <h4 className="goals-subheading">
        Category budgets for {formatMonth(plan.startMonth, planMonth.index)}
      </h4>
      <ul className="goals-category-list">
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <span>
              {category.label} ({plan.allocation[category.id]}%)
            </span>
            <span>{formatKg(splitKg(planMonth.targetKg, plan.allocation)[category.id])}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
