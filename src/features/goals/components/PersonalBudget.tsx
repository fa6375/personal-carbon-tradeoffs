import { getBaselineKg, getBudgetKg, getMonthlyTargets, roundKg } from '../budget'
import { formatDateTime, formatKg, formatMonth } from '../format'
import { CATEGORIES } from '../sampleData'
import type { BaselineSource, GoalPlan } from '../types'
import { Panel, ProgressBar, StatTile } from './GoalsUi'

const SOURCE_LABEL: Record<BaselineSource, string> = {
  sample: 'Sample value',
  tracked: 'From Carbon tracking',
  custom: 'Your estimate',
}

/** Screen 2 – Personal carbon budget. */
export function PersonalBudget({ plan }: { plan: GoalPlan }) {
  const baselineKg = getBaselineKg(plan)
  const budgetKg = getBudgetKg(plan)
  const firstMonthKg = getMonthlyTargets(plan)[0].targetKg

  return (
    <Panel
      id="goals-budget-title"
      title="Your personal carbon budget"
      description="The monthly amount of emissions you are aiming to stay within by the end of your plan."
    >
      <dl className="goals-stats">
        <StatTile
          label="Monthly budget"
          value={formatKg(budgetKg)}
          hint={`From ${formatMonth(plan.startMonth, plan.durationMonths - 1)}`}
          highlight
        />
        <StatTile
          label="Current monthly emissions"
          value={formatKg(baselineKg)}
          hint={
            plan.baseline.source === 'tracked' && plan.baseline.takenAt
              ? `${SOURCE_LABEL.tracked}, ${formatDateTime(plan.baseline.takenAt)}`
              : SOURCE_LABEL[plan.baseline.source]
          }
        />
        <StatTile
          label="Reduction"
          value={formatKg(roundKg(baselineKg - budgetKg))}
          hint={`${plan.reductionPercent}% less than now`}
        />
        <StatTile
          label="First month target"
          value={formatKg(firstMonthKg)}
          hint={`${formatMonth(plan.startMonth)}, step 1 of ${plan.durationMonths}`}
        />
      </dl>

      <div className="goals-compare">
        <div className="goals-compare__row">
          <span>Now</span>
          <ProgressBar
            label="Current monthly emissions"
            value={baselineKg}
            max={baselineKg}
            valueText={formatKg(baselineKg)}
            tone="muted"
          />
          <span>{formatKg(baselineKg)}</span>
        </div>
        <div className="goals-compare__row">
          <span>Goal</span>
          <ProgressBar
            label="Monthly budget"
            value={budgetKg}
            max={baselineKg}
            valueText={`${formatKg(budgetKg)}, ${100 - plan.reductionPercent}% of now`}
          />
          <span>{formatKg(budgetKg)}</span>
        </div>
      </div>

      <h4 className="goals-subheading">Where your emissions come from now</h4>
      <ul className="goals-category-list">
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <span>{category.label}</span>
            <span>{formatKg(plan.baseline.amounts[category.id])}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
