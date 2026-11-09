import { useState, type Dispatch } from 'react'
import { getBudgetKg, SAMPLE_BASELINE_TOTAL } from '../budget'
import { formatKg, formatMonth, getUpcomingMonths } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import { DURATION_OPTIONS, REDUCTION_OPTIONS } from '../sampleData'
import type { GoalPlan } from '../types'
import { Panel, SampleDataNotice } from './GoalsUi'

interface BudgetSetupProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
}

/** Screen 1 – Carbon budget setup. */
export function BudgetSetup({ plan, dispatch }: BudgetSetupProps) {
  const [monthOptions] = useState(() => {
    const upcoming = getUpcomingMonths(6)
    return upcoming.includes(plan.startMonth) ? upcoming : [plan.startMonth, ...upcoming]
  })
  const budgetKg = getBudgetKg(plan)

  return (
    <Panel
      id="goals-setup-title"
      title="Carbon budget setup"
      description="Choose how much you want to cut your monthly emissions and how long you want to take to get there."
    >
      <form className="goals-form" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="goals-fieldset">
          <legend className="goals-label">Reduction goal</legend>
          <p className="goals-hint" id="reduction-hint">
            Compared with your current monthly emissions.
          </p>
          <div className="goals-choice-group">
            {REDUCTION_OPTIONS.map((percent) => (
              <label key={percent} className="goals-choice">
                <input
                  type="radio"
                  name="reduction"
                  value={percent}
                  checked={plan.reductionPercent === percent}
                  aria-describedby="reduction-hint"
                  onChange={() => dispatch({ type: 'setReduction', percent })}
                />
                <span>{percent}%</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="goals-fieldset">
          <legend className="goals-label">Time to reach the goal</legend>
          <div className="goals-choice-group">
            {DURATION_OPTIONS.map((months) => (
              <label key={months} className="goals-choice">
                <input
                  type="radio"
                  name="duration"
                  value={months}
                  checked={plan.durationMonths === months}
                  onChange={() => dispatch({ type: 'setDuration', months })}
                />
                <span>{months} months</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="goals-field">
          <label className="goals-label" htmlFor="goals-start-month">
            Start month
          </label>
          <select
            id="goals-start-month"
            className="goals-input"
            value={plan.startMonth}
            onChange={(event) => dispatch({ type: 'setStartMonth', month: event.target.value })}
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="goals-callout" aria-live="polite">
        Cutting <strong>{plan.reductionPercent}%</strong> from{' '}
        {formatKg(SAMPLE_BASELINE_TOTAL)} gives a monthly budget of{' '}
        <strong>{formatKg(budgetKg)}</strong> by{' '}
        {formatMonth(plan.startMonth, plan.durationMonths - 1)}.
      </div>

      <SampleDataNotice>
        Your current monthly emissions are a placeholder until Personal Carbon Tracking
        is connected.
      </SampleDataNotice>
    </Panel>
  )
}
