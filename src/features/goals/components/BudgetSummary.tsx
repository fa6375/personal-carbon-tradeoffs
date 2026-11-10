import { useState, type Dispatch } from 'react'
import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import {
  getAllocationTotal,
  getBaselineKg,
  getBudgetKg,
  getCategoryGaps,
  getPlanMonth,
  getSavingKg,
  getSavingsByCategory,
  splitKg,
  sumAmounts,
} from '../budget'
import { formatCount, formatKg, formatMonth } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import { CATEGORIES, getPriority, OPPORTUNITIES } from '../sampleData'
import type { BaselineSource, GoalPlan, GoalsStageId } from '../types'
import { Notice, Panel, StatTile } from './GoalsUi'

interface BudgetSummaryProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
  onEdit: (stage: GoalsStageId) => void
  /** The current calendar month, "YYYY-MM". */
  currentMonth: string
}

const SOURCE_TEXT: Record<BaselineSource, string> = {
  sample: 'sample value',
  tracked: 'from Carbon tracking',
  custom: 'your estimate',
}

/** Screen 10 – Carbon budget summary. */
export function BudgetSummary({ plan, dispatch, onEdit, currentMonth }: BudgetSummaryProps) {
  const [confirmingReset, setConfirmingReset] = useState(false)
  const budgetKg = getBudgetKg(plan)
  const finalSplit = splitKg(budgetKg, plan.allocation)
  const planMonth = getPlanMonth(plan, currentMonth)
  const selected = OPPORTUNITIES.filter((o) => plan.selectedOpportunityIds.includes(o.id))
  const selectedSaving = sumAmounts(getSavingsByCategory(selected))
  const gapKg = sumAmounts(getCategoryGaps(plan))
  const allocationTotal = getAllocationTotal(plan.allocation)

  return (
    <Panel
      id="goals-summary-title"
      title="Carbon budget summary"
      description="Everything in your plan on one page."
    >
      <dl className="goals-stats">
        <StatTile
          label="Monthly budget"
          value={formatKg(budgetKg)}
          hint={`By ${formatMonth(plan.startMonth, plan.durationMonths - 1)}`}
          highlight
        />
        <StatTile
          label="Goal"
          value={`${plan.reductionPercent}% less`}
          hint={`From ${formatKg(getBaselineKg(plan))} (${SOURCE_TEXT[plan.baseline.source]})`}
        />
        <StatTile
          label="Timeframe"
          value={formatCount(plan.durationMonths, 'month', 'months')}
          hint={`${formatMonth(plan.startMonth)} – ${formatMonth(plan.startMonth, plan.durationMonths - 1)}`}
        />
        <StatTile
          label={planMonth.timing === 'not-started' ? 'First month target' : 'This month’s target'}
          value={formatKg(planMonth.targetKg)}
          hint={formatMonth(plan.startMonth, planMonth.index)}
        />
      </dl>

      <div className="goals-summary-grid">
        <section aria-labelledby="summary-allocation">
          <div className="goals-summary-grid__head">
            <h4 id="summary-allocation" className="goals-subheading">
              Allocation
            </h4>
            <button type="button" className="goals-link-button" onClick={() => onEdit('allocate')}>
              Edit<span className="visually-hidden"> allocation</span>
            </button>
          </div>
          <ul className="goals-category-list">
            {CATEGORIES.map((category) => (
              <li key={category.id}>
                <span>{category.label}</span>
                <span>
                  {plan.allocation[category.id]}% · {formatKg(finalSplit[category.id])}
                </span>
              </li>
            ))}
          </ul>
          {allocationTotal !== 100 && (
            <p className="goals-error">Allocation adds up to {allocationTotal}%, not 100%.</p>
          )}
        </section>

        <section aria-labelledby="summary-priorities">
          <div className="goals-summary-grid__head">
            <h4 id="summary-priorities" className="goals-subheading">
              Priorities
            </h4>
            <button type="button" className="goals-link-button" onClick={() => onEdit('allocate')}>
              Edit<span className="visually-hidden"> priorities</span>
            </button>
          </div>
          <ol className="goals-summary-list">
            {plan.priorities.map((id) => (
              <li key={id}>{getPriority(id).label}</li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="summary-changes">
          <div className="goals-summary-grid__head">
            <h4 id="summary-changes" className="goals-subheading">
              Planned changes
            </h4>
            <button type="button" className="goals-link-button" onClick={() => onEdit('plan')}>
              Edit<span className="visually-hidden"> planned changes</span>
            </button>
          </div>
          {selected.length === 0 ? (
            <p className="goals-hint">No changes added yet.</p>
          ) : (
            <>
              <ul className="goals-summary-list">
                {selected.map((o) => (
                  <li key={o.id}>
                    {o.title} <span className="goals-hint">(about {formatKg(getSavingKg(o))})</span>
                  </li>
                ))}
              </ul>
              <p className="goals-hint">
                About {formatKg(selectedSaving)} a month in total, of the {formatKg(gapKg)} you need
                to cut. Estimates.
              </p>
            </>
          )}
        </section>

        <section aria-labelledby="summary-adjustments">
          <div className="goals-summary-grid__head">
            <h4 id="summary-adjustments" className="goals-subheading">
              Adjustments
            </h4>
            <button type="button" className="goals-link-button" onClick={() => onEdit('track')}>
              View<span className="visually-hidden"> adjustments</span>
            </button>
          </div>
          <p className="goals-hint">
            {plan.adjustments.length === 0
              ? 'No adjustments made.'
              : `${formatCount(plan.adjustments.length, 'adjustment', 'adjustments')} made.`}
          </p>
        </section>
      </div>

      <div className="goals-next-steps">
        <h4 className="goals-subheading">Keep going</h4>
        <div className="goals-actions">
          <ButtonLink href="#/tracking" icon="arrow-right">
            Record activities
          </ButtonLink>
          <ButtonLink href="#/compare" variant="secondary" icon="arrow-right">
            Compare a journey
          </ButtonLink>
          <Button variant="secondary" onClick={() => onEdit('track')}>
            Check progress
          </Button>
        </div>
      </div>

      <Notice title="Not saved.">
        This plan is kept while the app is open, including when you visit other pages, but it is
        lost when the page is reloaded. Saving plans is not implemented yet.
      </Notice>

      <div className="goals-actions">
        {confirmingReset ? (
          <div className="goals-callout goals-callout--warning goals-callout--action" role="alert">
            <p>Start over? Your goal, allocation, priorities, planned changes and adjustments will be cleared.</p>
            <div className="goals-actions">
              <Button
                onClick={() => {
                  dispatch({ type: 'resetPlan' })
                  setConfirmingReset(false)
                  onEdit('setup')
                }}
              >
                Yes, start over
              </Button>
              <Button variant="secondary" onClick={() => setConfirmingReset(false)}>
                Keep my plan
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setConfirmingReset(true)}>
            Start over
          </Button>
        )}
      </div>
    </Panel>
  )
}
