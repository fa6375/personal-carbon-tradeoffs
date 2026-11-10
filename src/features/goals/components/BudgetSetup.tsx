import { useState, type Dispatch } from 'react'
import { ButtonLink } from '../../../components/ButtonLink'
import { allocationFromAmounts, getBaselineKg, getBudgetKg, splitKg, sumAmounts } from '../budget'
import { formatCount, formatKg, formatMonth, getUpcomingMonths } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import {
  CUSTOM_BASELINE_LIMITS,
  DURATION_OPTIONS,
  REDUCTION_OPTIONS,
  SAMPLE_BASELINE,
} from '../sampleData'
import type { TrackedData } from '../trackedEmissions'
import type { BaselineSource, GoalPlan } from '../types'
import { LoadingLine, Notice, Panel, SampleDataNotice } from './GoalsUi'

interface BudgetSetupProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
  tracked: TrackedData
}

const SAMPLE_TOTAL = sumAmounts(SAMPLE_BASELINE)

function validateCustom(value: string): string | null {
  const { min, max } = CUSTOM_BASELINE_LIMITS
  if (value.trim() === '') return 'Enter your current monthly emissions.'
  const number = Number(value)
  if (!Number.isFinite(number)) return 'Enter a number, for example 450.'
  if (number < min || number > max) {
    return `Enter an amount between ${min} and ${max} kg CO₂e.`
  }
  return null
}

/** Screen 1 – Carbon budget setup. */
export function BudgetSetup({ plan, dispatch, tracked }: BudgetSetupProps) {
  const [monthOptions] = useState(() => {
    const upcoming = getUpcomingMonths(6)
    return upcoming.includes(plan.startMonth) ? upcoming : [plan.startMonth, ...upcoming]
  })
  const [source, setSource] = useState<BaselineSource>(plan.baseline.source)
  const [customValue, setCustomValue] = useState(
    plan.baseline.source === 'custom' ? String(getBaselineKg(plan)) : '',
  )
  const [customError, setCustomError] = useState<string | null>(null)

  const trackedKg = sumAmounts(tracked.last30Days.amounts)
  const trackedAvailable = tracked.status === 'ready' && trackedKg > 0
  const budgetKg = getBudgetKg(plan)
  const reductionOptions: number[] = REDUCTION_OPTIONS.includes(
    plan.reductionPercent as (typeof REDUCTION_OPTIONS)[number],
  )
    ? [...REDUCTION_OPTIONS]
    : [...REDUCTION_OPTIONS, plan.reductionPercent].sort((a, b) => a - b)

  function chooseSample() {
    setSource('sample')
    setCustomError(null)
    dispatch({ type: 'setBaseline', baseline: { source: 'sample', amounts: { ...SAMPLE_BASELINE } } })
  }

  function chooseTracked() {
    setSource('tracked')
    setCustomError(null)
    dispatch({
      type: 'setBaseline',
      baseline: {
        source: 'tracked',
        amounts: { ...tracked.last30Days.amounts },
        takenAt: new Date().toISOString(),
      },
    })
  }

  function applyCustom(value: string) {
    const error = validateCustom(value)
    setCustomError(error)
    if (error) return
    // Split the total across categories in the same proportions as the sample.
    const amounts = splitKg(Number(value), allocationFromAmounts(SAMPLE_BASELINE))
    dispatch({ type: 'setBaseline', baseline: { source: 'custom', amounts } })
  }

  function chooseCustom() {
    setSource('custom')
    if (customValue !== '') applyCustom(customValue)
  }

  return (
    <Panel
      id="goals-setup-title"
      title="Carbon budget setup"
      description="Your carbon budget is the amount of greenhouse gas, in kilograms of CO₂-equivalent (kg CO₂e), you aim to stay within each month. Start from what you emit now, then choose how much to cut and how quickly."
    >
      <form className="goals-form" noValidate onSubmit={(event) => event.preventDefault()}>
        <fieldset className="goals-fieldset">
          <legend className="goals-label">Your current monthly emissions</legend>
          <div className="goals-radio-list">
            <label className="goals-radio">
              <input
                type="radio"
                name="baseline-source"
                checked={source === 'tracked'}
                disabled={!trackedAvailable}
                aria-describedby="baseline-tracked-hint"
                onChange={chooseTracked}
              />
              <span>
                <span className="goals-radio__title">From Carbon tracking</span>
                <span id="baseline-tracked-hint" className="goals-hint">
                  {tracked.status === 'loading' && 'Checking your tracked activities…'}
                  {tracked.status === 'error' && 'Your tracked activities could not be read.'}
                  {tracked.status === 'ready' &&
                    (trackedAvailable
                      ? `${formatKg(trackedKg)} from ${formatCount(tracked.last30Days.count, 'activity', 'activities')} in the last 30 days.`
                      : 'No activities recorded in the last 30 days yet.')}
                </span>
              </span>
            </label>

            <label className="goals-radio">
              <input
                type="radio"
                name="baseline-source"
                checked={source === 'custom'}
                onChange={chooseCustom}
              />
              <span>
                <span className="goals-radio__title">Enter my own estimate</span>
                <span className="goals-hint">For example from a carbon calculator you used.</span>
              </span>
            </label>

            <label className="goals-radio">
              <input
                type="radio"
                name="baseline-source"
                checked={source === 'sample'}
                onChange={chooseSample}
              />
              <span>
                <span className="goals-radio__title">Use the sample value</span>
                <span className="goals-hint">{formatKg(SAMPLE_TOTAL)} a month, for trying the feature out.</span>
              </span>
            </label>
          </div>

          {tracked.status === 'loading' && <LoadingLine>Loading Carbon tracking…</LoadingLine>}
          {tracked.status === 'ready' && !trackedAvailable && (
            <div className="goals-inline-action">
              <ButtonLink href="#/tracking" variant="secondary" icon="arrow-right">
                Record activities in Carbon tracking
              </ButtonLink>
            </div>
          )}

          {source === 'custom' && (
            <div className="goals-field goals-field--nested">
              <label className="goals-label" htmlFor="goals-custom-baseline">
                Monthly emissions (kg CO₂e)
              </label>
              <input
                id="goals-custom-baseline"
                className="goals-input goals-input--short"
                type="number"
                inputMode="decimal"
                min={CUSTOM_BASELINE_LIMITS.min}
                max={CUSTOM_BASELINE_LIMITS.max}
                step="any"
                value={customValue}
                aria-invalid={customError ? true : undefined}
                aria-describedby={`goals-custom-hint${customError ? ' goals-custom-error' : ''}`}
                onChange={(event) => {
                  setCustomValue(event.target.value)
                  applyCustom(event.target.value)
                }}
              />
              <p id="goals-custom-hint" className="goals-hint">
                Between {CUSTOM_BASELINE_LIMITS.min} and {CUSTOM_BASELINE_LIMITS.max} kg. It is split
                across categories in the same proportions as the sample.
              </p>
              {customError && (
                <p id="goals-custom-error" className="goals-error">
                  {customError}
                </p>
              )}
            </div>
          )}
        </fieldset>

        <fieldset className="goals-fieldset">
          <legend className="goals-label">Reduction goal</legend>
          <p className="goals-hint" id="reduction-hint">
            How much lower than your current monthly emissions your budget should be.
          </p>
          <div className="goals-choice-group">
            {reductionOptions.map((percent) => (
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

        <div className="goals-form__row">
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
        </div>
      </form>

      <div className="goals-callout" aria-live="polite">
        Cutting <strong>{plan.reductionPercent}%</strong> from {formatKg(getBaselineKg(plan))} gives
        a monthly budget of <strong>{formatKg(budgetKg)}</strong> by{' '}
        {formatMonth(plan.startMonth, plan.durationMonths - 1)}.
      </div>

      {plan.baseline.source === 'sample' && (
        <SampleDataNotice>
          The starting point is a placeholder. Choose “From Carbon tracking” once you have recorded
          activities.
        </SampleDataNotice>
      )}
      {plan.baseline.source === 'tracked' && (
        <Notice title="From Carbon tracking.">
          Based on activities recorded in the last 30 days, using the illustrative emission factors
          from Carbon tracking.
        </Notice>
      )}
    </Panel>
  )
}
