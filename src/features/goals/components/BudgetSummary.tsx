import type { Dispatch } from 'react'
import { Button } from '../../../components/Button'
import {
  getAllocationTotal,
  getBudgetKg,
  getPaceStatus,
  SAMPLE_BASELINE_TOTAL,
  shareToKg,
  sumAmounts,
} from '../budget'
import { formatKg, formatMonth } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import {
  CATEGORIES,
  getPriority,
  SAMPLE_CURRENT_USAGE,
  SAMPLE_DAY,
  SAMPLE_OPPORTUNITIES,
} from '../sampleData'
import type { GoalPlan, GoalsStageId } from '../types'
import { Panel, SampleDataNotice, StatTile, StatusBadge } from './GoalsUi'

interface BudgetSummaryProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
  onEdit: (stage: GoalsStageId) => void
}

/** Screen 10 – Carbon budget summary. */
export function BudgetSummary({ plan, dispatch, onEdit }: BudgetSummaryProps) {
  const budgetKg = getBudgetKg(plan)
  const selected = SAMPLE_OPPORTUNITIES.filter((o) => plan.selectedOpportunityIds.includes(o.id))
  const selectedSavingKg = selected.reduce((total, o) => total + o.sampleSavingKg, 0)
  const allocationTotal = getAllocationTotal(plan.allocation)
  const status = getPaceStatus(
    sumAmounts(SAMPLE_CURRENT_USAGE),
    budgetKg,
    SAMPLE_DAY.current / SAMPLE_DAY.total,
  )

  return (
    <Panel
      id="goals-summary-title"
      title="Carbon budget summary"
      description="Everything in your plan on one page."
    >
      <dl className="goals-stats">
        <StatTile label="Monthly budget" value={formatKg(budgetKg)} highlight />
        <StatTile
          label="Goal"
          value={`${plan.reductionPercent}% less`}
          hint={`From ${formatKg(SAMPLE_BASELINE_TOTAL)} (sample)`}
        />
        <StatTile
          label="Timeframe"
          value={`${plan.durationMonths} months`}
          hint={`${formatMonth(plan.startMonth)} – ${formatMonth(plan.startMonth, plan.durationMonths - 1)}`}
        />
        <StatTile
          label="This month"
          value={<StatusBadge status={status} />}
          hint={`Day ${SAMPLE_DAY.current} of ${SAMPLE_DAY.total} (sample)`}
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
                  {plan.allocation[category.id]}% ·{' '}
                  {formatKg(shareToKg(budgetKg, plan.allocation[category.id]))}
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
                  <li key={o.id}>{o.title}</li>
                ))}
              </ul>
              <p className="goals-hint">
                About {formatKg(selectedSavingKg)} a month in total (sample values).
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
              : `${plan.adjustments.length} ${plan.adjustments.length === 1 ? 'adjustment' : 'adjustments'} made.`}
          </p>
        </section>
      </div>

      <SampleDataNotice>
        This plan is kept only while this page is open. Saving plans is not implemented yet.
      </SampleDataNotice>

      <div className="goals-actions">
        <Button variant="secondary" onClick={() => dispatch({ type: 'resetPlan' })}>
          Start over
        </Button>
      </div>
    </Panel>
  )
}
