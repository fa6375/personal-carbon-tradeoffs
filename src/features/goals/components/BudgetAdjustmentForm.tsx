import { useState, type Dispatch, type FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { getBaselineKg, getBudgetKg, roundKg, shareToKg } from '../budget'
import { formatKg } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import { CATEGORIES, getCategoryLabel, REDUCTION_LIMITS } from '../sampleData'
import type { CategoryId, GoalPlan } from '../types'
import { Panel } from './GoalsUi'

interface BudgetAdjustmentFormProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
  /** Called with the new adjustment's id after it is applied. */
  onApplied: (id: string) => void
}

type Mode = 'reallocate' | 'goal'

interface FormErrors {
  to?: string
  amount?: string
  reduction?: string
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/** Screen 6 – Budget adjustment. */
export function BudgetAdjustmentForm({ plan, dispatch, onApplied }: BudgetAdjustmentFormProps) {
  const [mode, setMode] = useState<Mode>('reallocate')
  const [from, setFrom] = useState<CategoryId>('transport')
  const [to, setTo] = useState<CategoryId>('food')
  const [amount, setAmount] = useState('5')
  const [reduction, setReduction] = useState(String(plan.reductionPercent))
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState('')

  const budgetKg = getBudgetKg(plan)
  const available = plan.allocation[from]
  const points = Number(amount)
  const previewKg =
    Number.isInteger(points) && points > 0
      ? roundKg((budgetKg * points) / 100)
      : 0
  const newReduction = Number(reduction)
  const newBudgetKg =
    Number.isInteger(newReduction) &&
    newReduction >= REDUCTION_LIMITS.min &&
    newReduction <= REDUCTION_LIMITS.max
      ? roundKg(getBaselineKg(plan) * (1 - newReduction / 100))
      : null

  function validate(): FormErrors {
    const result: FormErrors = {}
    if (mode === 'reallocate') {
      if (from === to) result.to = 'Choose a different category to move budget to.'
      if (amount.trim() === '' || !Number.isInteger(points) || points < 1) {
        result.amount = 'Enter a whole number of 1 or more.'
      } else if (points > available) {
        result.amount = `${getCategoryLabel(from)} only has ${available}% to give.`
      }
    } else if (reduction.trim() === '' || newBudgetKg === null) {
      result.reduction = `Enter a whole number from ${REDUCTION_LIMITS.min} to ${REDUCTION_LIMITS.max}.`
    } else if (newReduction === plan.reductionPercent) {
      result.reduction = `Your goal is already ${plan.reductionPercent}%. Enter a different value.`
    }
    return result
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setMessage('')
      const firstInvalid = nextErrors.to
        ? 'adjust-to'
        : nextErrors.amount
          ? 'adjust-amount'
          : 'adjust-reduction'
      document.getElementById(firstInvalid)?.focus()
      return
    }

    const id = newId()
    const createdAt = new Date().toISOString()
    if (mode === 'reallocate') {
      dispatch({
        type: 'reallocate',
        id,
        createdAt,
        from,
        to,
        percentPoints: points,
        reason: reason.trim(),
      })
      setMessage(
        `Moved ${points}% (${formatKg(previewKg)}) from ${getCategoryLabel(from)} to ${getCategoryLabel(to)}.`,
      )
    } else {
      dispatch({ type: 'changeGoal', id, createdAt, reductionPercent: newReduction, reason: reason.trim() })
      setMessage(
        `Goal changed from ${plan.reductionPercent}% to ${newReduction}%. Your monthly budget is now ${formatKg(newBudgetKg ?? budgetKg)}.`,
      )
    }
    setReason('')
    onApplied(id)
  }

  function changeMode(next: Mode) {
    setMode(next)
    setErrors({})
    setMessage('')
    if (next === 'goal') setReduction(String(plan.reductionPercent))
  }

  return (
    <Panel
      id="goals-adjust-title"
      title="Budget adjustment"
      description="Plans change. Move budget to a category where you need more room, or change how much you want to cut overall."
    >
      <form className="goals-form" noValidate onSubmit={handleSubmit}>
        <fieldset className="goals-fieldset">
          <legend className="goals-label">What do you want to change?</legend>
          <div className="goals-choice-group">
            <label className="goals-choice">
              <input
                type="radio"
                name="adjust-mode"
                checked={mode === 'reallocate'}
                onChange={() => changeMode('reallocate')}
              />
              <span>Move between categories</span>
            </label>
            <label className="goals-choice">
              <input
                type="radio"
                name="adjust-mode"
                checked={mode === 'goal'}
                onChange={() => changeMode('goal')}
              />
              <span>Change my reduction goal</span>
            </label>
          </div>
        </fieldset>

        {mode === 'reallocate' ? (
          <>
            <p className="goals-hint">Your total monthly budget stays at {formatKg(budgetKg)}.</p>
            <div className="goals-form__row">
              <div className="goals-field">
                <label className="goals-label" htmlFor="adjust-from">
                  Move from
                </label>
                <select
                  id="adjust-from"
                  className="goals-input"
                  value={from}
                  onChange={(event) => setFrom(event.target.value as CategoryId)}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label} ({plan.allocation[category.id]}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="goals-field">
                <label className="goals-label" htmlFor="adjust-to">
                  Move to
                </label>
                <select
                  id="adjust-to"
                  className="goals-input"
                  value={to}
                  aria-invalid={errors.to ? true : undefined}
                  aria-describedby={errors.to ? 'adjust-to-error' : undefined}
                  onChange={(event) => setTo(event.target.value as CategoryId)}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label} ({plan.allocation[category.id]}%)
                    </option>
                  ))}
                </select>
                {errors.to && (
                  <p id="adjust-to-error" className="goals-error">
                    {errors.to}
                  </p>
                )}
              </div>
            </div>

            <div className="goals-field">
              <label className="goals-label" htmlFor="adjust-amount">
                Amount to move (percentage points)
              </label>
              <input
                id="adjust-amount"
                className="goals-input goals-input--short"
                type="number"
                inputMode="numeric"
                min={1}
                max={available}
                step={1}
                value={amount}
                aria-invalid={errors.amount ? true : undefined}
                aria-describedby={`adjust-amount-hint${errors.amount ? ' adjust-amount-error' : ''}`}
                onChange={(event) => setAmount(event.target.value)}
              />
              <p id="adjust-amount-hint" className="goals-hint">
                {previewKg > 0 ? `About ${formatKg(previewKg)} a month at your final budget. ` : ''}
                {getCategoryLabel(from)} has {available}% (
                {formatKg(shareToKg(budgetKg, plan.allocation, from))}) available.
              </p>
              {errors.amount && (
                <p id="adjust-amount-error" className="goals-error">
                  {errors.amount}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="goals-field">
            <label className="goals-label" htmlFor="adjust-reduction">
              New reduction goal (%)
            </label>
            <input
              id="adjust-reduction"
              className="goals-input goals-input--short"
              type="number"
              inputMode="numeric"
              min={REDUCTION_LIMITS.min}
              max={REDUCTION_LIMITS.max}
              step={1}
              value={reduction}
              aria-invalid={errors.reduction ? true : undefined}
              aria-describedby={`adjust-reduction-hint${errors.reduction ? ' adjust-reduction-error' : ''}`}
              onChange={(event) => setReduction(event.target.value)}
            />
            <p id="adjust-reduction-hint" className="goals-hint">
              Now {plan.reductionPercent}% ({formatKg(budgetKg)} a month).
              {newBudgetKg !== null && newReduction !== plan.reductionPercent
                ? ` At ${newReduction}% your budget would be ${formatKg(newBudgetKg)} a month.`
                : ''}{' '}
              Category shares stay the same.
            </p>
            {errors.reduction && (
              <p id="adjust-reduction-error" className="goals-error">
                {errors.reduction}
              </p>
            )}
          </div>
        )}

        <div className="goals-field">
          <label className="goals-label" htmlFor="adjust-reason">
            Reason <span className="goals-optional">(optional)</span>
          </label>
          <textarea
            id="adjust-reason"
            className="goals-input"
            rows={2}
            maxLength={200}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>

        <div className="goals-actions">
          <Button type="submit">Apply adjustment</Button>
        </div>
        <p className="goals-success" role="status">
          {message}
        </p>
      </form>
    </Panel>
  )
}
