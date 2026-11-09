import { getBudgetKg, SAMPLE_BASELINE_TOTAL } from '../budget'
import { formatKg, formatMonth } from '../format'
import { CATEGORIES, SAMPLE_BASELINE } from '../sampleData'
import type { GoalPlan } from '../types'
import { Panel, ProgressBar, SampleDataNotice, StatTile } from './GoalsUi'

/** Screen 2 – Personal carbon budget. */
export function PersonalBudget({ plan }: { plan: GoalPlan }) {
  const budgetKg = getBudgetKg(plan)
  const reductionKg = SAMPLE_BASELINE_TOTAL - budgetKg

  return (
    <Panel
      id="goals-budget-title"
      title="Your personal carbon budget"
      description="The monthly amount of emissions you are aiming to stay within."
    >
      <dl className="goals-stats">
        <StatTile label="Monthly budget" value={formatKg(budgetKg)} highlight />
        <StatTile
          label="Current monthly emissions"
          value={formatKg(SAMPLE_BASELINE_TOTAL)}
          hint="Sample value"
        />
        <StatTile
          label="Reduction"
          value={formatKg(reductionKg)}
          hint={`${plan.reductionPercent}% less each month`}
        />
        <StatTile
          label="Goal date"
          value={formatMonth(plan.startMonth, plan.durationMonths - 1)}
          hint={`${plan.durationMonths}-month plan`}
        />
      </dl>

      <div className="goals-compare">
        <div className="goals-compare__row">
          <span>Now</span>
          <ProgressBar
            label="Current monthly emissions"
            value={SAMPLE_BASELINE_TOTAL}
            max={SAMPLE_BASELINE_TOTAL}
            valueText={formatKg(SAMPLE_BASELINE_TOTAL)}
            tone="muted"
          />
          <span>{formatKg(SAMPLE_BASELINE_TOTAL)}</span>
        </div>
        <div className="goals-compare__row">
          <span>Goal</span>
          <ProgressBar
            label="Monthly budget"
            value={budgetKg}
            max={SAMPLE_BASELINE_TOTAL}
            valueText={formatKg(budgetKg)}
          />
          <span>{formatKg(budgetKg)}</span>
        </div>
      </div>

      <h4 className="goals-subheading">Where your emissions come from now</h4>
      <ul className="goals-category-list">
        {CATEGORIES.map((category) => (
          <li key={category.id}>
            <span>{category.label}</span>
            <span>{formatKg(SAMPLE_BASELINE[category.id])}</span>
          </li>
        ))}
      </ul>

      <SampleDataNotice>
        The category amounts are placeholders, not measurements.
      </SampleDataNotice>
    </Panel>
  )
}
