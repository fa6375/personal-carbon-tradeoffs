import { useState, type Dispatch, type FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { getBudgetKg, shareToKg } from '../budget'
import { formatKg } from '../format'
import type { GoalPlanAction } from '../goalPlanReducer'
import { CATEGORIES, getCategoryLabel } from '../sampleData'
import type { CategoryId, GoalPlan } from '../types'
import { Panel } from './GoalsUi'

interface BudgetAdjustmentFormProps {
  plan: GoalPlan
  dispatch: Dispatch<GoalPlanAction>
  /** Called with the new adjustment's id after it is applied. */
  onApplied: (id: string) => void
}

interface FormErrors {
  to?: string
  amount?: string
}

/** Screen 6 – Budget adjustment. Moves part of the budget between categories. */
export function BudgetAdjustmentForm({ plan, dispatch, onApplied }: BudgetAdjustmentFormProps) {
  const [from, setFrom] = useState<CategoryId>('transport')
  const [to, setTo] = useState<CategoryId>('food')
  const [amount, setAmount] = useState('5')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState('')

  const budgetKg = getBudgetKg(plan)
  const available = plan.allocation[from]
  const points = Number(amount)
  const previewKg = Number.isFinite(points) && points > 0 ? shareToKg(budgetKg, points) : 0

  function validate(): FormErrors {
    const result: FormErrors = {}
    if (from === to) result.to = 'Choose a different category to move budget to.'
    if (!Number.isInteger(points) || points < 1) {
      result.amount = 'Enter a whole number of 1 or more.'
    } else if (points > available) {
      result.amount = `${getCategoryLabel(from)} only has ${available}% to give.`
    }
    return result
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setMessage('')
      const firstInvalid = nextErrors.to ? 'adjust-to' : 'adjust-amount'
      document.getElementById(firstInvalid)?.focus()
      return
    }

    const id = crypto.randomUUID()
    dispatch({
      type: 'applyAdjustment',
      id,
      createdAt: new Date().toISOString(),
      from,
      to,
      percentPoints: points,
      reason: reason.trim(),
    })
    setMessage(
      `Moved ${points}% (${formatKg(previewKg)}) from ${getCategoryLabel(from)} to ${getCategoryLabel(to)}.`,
    )
    setReason('')
    onApplied(id)
  }

  return (
    <Panel
      id="goals-adjust-title"
      title="Budget adjustment"
      description="Running over in one area? Move part of your budget from a category where you have room. Your total budget stays the same."
    >
      <form className="goals-form" noValidate onSubmit={handleSubmit}>
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
            {previewKg > 0 ? `About ${formatKg(previewKg)} a month. ` : ''}
            {getCategoryLabel(from)} has {available}% available.
          </p>
          {errors.amount && (
            <p id="adjust-amount-error" className="goals-error">
              {errors.amount}
            </p>
          )}
        </div>

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
