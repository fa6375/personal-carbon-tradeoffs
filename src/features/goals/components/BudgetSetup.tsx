import { useState, type Dispatch } from 'react'
import { ButtonLink } from '../../../components/ButtonLink'
import { useI18n, type MessageKey } from '../../../i18n'
import { allocationFromAmounts, getBaselineKg, getBudgetKg, splitKg, sumAmounts } from '../budget'
import { formatKg, formatMonth, formatMonthGenitive, formatPercentValue, getUpcomingMonths } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import { CUSTOM_BASELINE_LIMITS, DURATION_OPTIONS, REDUCTION_OPTIONS, SAMPLE_BASELINE } from '../sampleData'
import type { TrackedData } from '../trackedEmissions'
import type { BaselineSource, GoalPlan } from '../types'
import { LoadingLine, Notice, Panel, SampleDataNotice } from './GoalsUi'

interface BudgetSetupProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
  tracked: TrackedData
}

const SAMPLE_TOTAL = sumAmounts(SAMPLE_BASELINE)

/** Accepts "450", "450.5" and "450,5". */
function parseAmount(value: string): number {
  const normalised = value.trim().replace(',', '.')
  return /^\d+(\.\d+)?$/.test(normalised) ? Number(normalised) : Number.NaN
}

/** Returns the translation key of the problem, or null if the value is valid. */
function validateCustom(value: string): MessageKey | null {
  const { min, max } = CUSTOM_BASELINE_LIMITS
  if (value.trim() === '') return 'goals.setup.customRequired'
  const number = parseAmount(value)
  if (!Number.isFinite(number)) return 'goals.setup.customNotNumber'
  if (number < min || number > max) return 'goals.setup.customRange'
  return null
}

/** Screen 1 – Carbon budget setup. */
export function BudgetSetup({ plan, dispatch, tracked }: BudgetSetupProps) {
  const { t } = useI18n()
  const [monthOptions] = useState(() => {
    const upcoming = getUpcomingMonths(6)
    return upcoming.includes(plan.startMonth) ? upcoming : [plan.startMonth, ...upcoming]
  })
  const [source, setSource] = useState<BaselineSource>(plan.baseline.source)
  const [customValue, setCustomValue] = useState(
    plan.baseline.source === 'custom' ? String(getBaselineKg(plan)) : '',
  )
  const [customError, setCustomError] = useState<MessageKey | null>(null)

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
      baseline: { source: 'tracked', amounts: { ...tracked.last30Days.amounts }, takenAt: new Date().toISOString() },
    })
  }

  function applyCustom(value: string) {
    const error = validateCustom(value)
    setCustomError(error)
    if (error) return
    // Split the total across categories in the same proportions as the sample.
    const amounts = splitKg(parseAmount(value), allocationFromAmounts(SAMPLE_BASELINE))
    dispatch({ type: 'setBaseline', baseline: { source: 'custom', amounts } })
  }

  function chooseCustom() {
    setSource('custom')
    if (customValue !== '') applyCustom(customValue)
  }

  return (
    <Panel id="goals-setup-title" title={t('goals.setup.title')} description={t('goals.setup.description')}>
      <form className="goals-form" noValidate onSubmit={(event) => event.preventDefault()}>
        <fieldset className="goals-fieldset">
          <legend className="goals-label">{t('goals.setup.baselineLegend')}</legend>
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
                <span className="goals-radio__title">{t('goals.setup.fromTracking')}</span>
                <span id="baseline-tracked-hint" className="goals-hint">
                  {tracked.status === 'loading' && t('goals.setup.trackingChecking')}
                  {tracked.status === 'error' && t('goals.setup.trackingError')}
                  {tracked.status === 'ready' &&
                    (trackedAvailable
                      ? t('goals.setup.trackingSummary', {
                          kg: formatKg(trackedKg),
                          activities: t('tracking.activityCount', { count: tracked.last30Days.count }),
                        })
                      : t('goals.setup.trackingNone'))}
                </span>
              </span>
            </label>

            <label className="goals-radio">
              <input type="radio" name="baseline-source" checked={source === 'custom'} onChange={chooseCustom} />
              <span>
                <span className="goals-radio__title">{t('goals.setup.ownEstimate')}</span>
                <span className="goals-hint">{t('goals.setup.ownEstimateHint')}</span>
              </span>
            </label>

            <label className="goals-radio">
              <input type="radio" name="baseline-source" checked={source === 'sample'} onChange={chooseSample} />
              <span>
                <span className="goals-radio__title">{t('goals.setup.sample')}</span>
                <span className="goals-hint">{t('goals.setup.sampleHint', { kg: formatKg(SAMPLE_TOTAL) })}</span>
              </span>
            </label>
          </div>

          {tracked.status === 'loading' && <LoadingLine>{t('goals.setup.loadingTracking')}</LoadingLine>}
          {tracked.status === 'ready' && !trackedAvailable && (
            <div className="goals-inline-action">
              <ButtonLink href="#/tracking" variant="secondary" icon="arrow-right">
                {t('goals.setup.recordActivities')}
              </ButtonLink>
            </div>
          )}

          {source === 'custom' && (
            <div className="goals-field goals-field--nested">
              <label className="goals-label" htmlFor="goals-custom-baseline">
                {t('goals.setup.customLabel')}
              </label>
              <input
                id="goals-custom-baseline"
                className="goals-input goals-input--short"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                required
                value={customValue}
                aria-invalid={customError ? true : undefined}
                aria-describedby={`goals-custom-hint${customError ? ' goals-custom-error' : ''}`}
                onChange={(event) => {
                  setCustomValue(event.target.value)
                  applyCustom(event.target.value)
                }}
              />
              <p id="goals-custom-hint" className="goals-hint">
                {t('goals.setup.customHint', CUSTOM_BASELINE_LIMITS)}
              </p>
              {customError && (
                <p id="goals-custom-error" className="goals-error">
                  {t(customError, CUSTOM_BASELINE_LIMITS)}
                </p>
              )}
            </div>
          )}
        </fieldset>

        <fieldset className="goals-fieldset">
          <legend className="goals-label">{t('goals.setup.reductionLegend')}</legend>
          <p className="goals-hint" id="reduction-hint">
            {t('goals.setup.reductionHint')}
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
                <span>{formatPercentValue(percent)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="goals-form__row">
          <fieldset className="goals-fieldset">
            <legend className="goals-label">{t('goals.setup.durationLegend')}</legend>
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
                  <span>{t('goals.setup.months', { count: months })}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="goals-field">
            <label className="goals-label" htmlFor="goals-start-month">
              {t('goals.setup.startMonth')}
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
        {t('goals.setup.result', {
          percent: formatPercentValue(plan.reductionPercent),
          baseline: formatKg(getBaselineKg(plan)),
          budget: formatKg(budgetKg),
          month: formatMonthGenitive(plan.startMonth, plan.durationMonths - 1),
        })}
      </div>

      {plan.baseline.source === 'sample' && <SampleDataNotice>{t('goals.setup.sampleNotice')}</SampleDataNotice>}
      {plan.baseline.source === 'tracked' && (
        <Notice title={t('goals.ui.fromTrackingTitle')}>{t('goals.setup.trackedNotice')}</Notice>
      )}
    </Panel>
  )
}
