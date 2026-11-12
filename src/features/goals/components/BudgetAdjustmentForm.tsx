import { useState, type Dispatch, type FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { useI18n, type MessageKey, type MessageParams } from '../../../i18n'
import { getBaselineKg, getBudgetKg, roundKg, shareToKg } from '../budget'
import { formatKg, formatPercentValue } from '../format'
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

/** A translation key with its parameters, so messages follow language changes. */
interface Message {
  key: MessageKey
  params?: MessageParams
}

interface FormErrors {
  to?: Message
  amount?: Message
  reduction?: Message
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/** Screen 6 – Budget adjustment. */
export function BudgetAdjustmentForm({ plan, dispatch, onApplied }: BudgetAdjustmentFormProps) {
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>('reallocate')
  const [from, setFrom] = useState<CategoryId>('transport')
  const [to, setTo] = useState<CategoryId>('food')
  const [amount, setAmount] = useState('5')
  const [reduction, setReduction] = useState(String(plan.reductionPercent))
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState<Message | null>(null)
  const text = (value?: Message) => (value ? t(value.key, value.params) : '')

  const budgetKg = getBudgetKg(plan)
  const available = plan.allocation[from]
  const points = Number(amount)
  const previewKg = Number.isInteger(points) && points > 0 ? roundKg((budgetKg * points) / 100) : 0
  const newReduction = Number(reduction)
  const newBudgetKg =
    Number.isInteger(newReduction) && newReduction >= REDUCTION_LIMITS.min && newReduction <= REDUCTION_LIMITS.max
      ? roundKg(getBaselineKg(plan) * (1 - newReduction / 100))
      : null

  function validate(): FormErrors {
    const result: FormErrors = {}
    if (mode === 'reallocate') {
      if (from === to) result.to = { key: 'goals.adjust.errors.sameCategory' }
      if (amount.trim() === '' || !Number.isInteger(points) || points < 1) {
        result.amount = { key: 'goals.adjust.errors.wholeNumber' }
      } else if (points > available) {
        result.amount = {
          key: 'goals.adjust.errors.tooMuch',
          params: { category: getCategoryLabel(from), percent: formatPercentValue(available) },
        }
      }
    } else if (reduction.trim() === '' || newBudgetKg === null) {
      result.reduction = { key: 'goals.adjust.errors.goalRange', params: REDUCTION_LIMITS }
    } else if (newReduction === plan.reductionPercent) {
      result.reduction = { key: 'goals.adjust.errors.sameGoal', params: { percent: formatPercentValue(plan.reductionPercent) } }
    }
    return result
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setMessage(null)
      const firstInvalid = nextErrors.to ? 'adjust-to' : nextErrors.amount ? 'adjust-amount' : 'adjust-reduction'
      document.getElementById(firstInvalid)?.focus()
      return
    }

    const id = newId()
    const createdAt = new Date().toISOString()
    if (mode === 'reallocate') {
      dispatch({ type: 'reallocate', id, createdAt, from, to, percentPoints: points, reason: reason.trim() })
      setMessage({
        key: 'goals.adjust.moved',
        params: {
          percent: formatPercentValue(points),
          kg: formatKg(previewKg),
          from: getCategoryLabel(from),
          to: getCategoryLabel(to),
        },
      })
    } else {
      dispatch({ type: 'changeGoal', id, createdAt, reductionPercent: newReduction, reason: reason.trim() })
      setMessage({
        key: 'goals.adjust.goalChanged',
        params: {
          before: formatPercentValue(plan.reductionPercent),
          after: formatPercentValue(newReduction),
          kg: formatKg(newBudgetKg ?? budgetKg),
        },
      })
    }
    setReason('')
    onApplied(id)
  }

  function changeMode(next: Mode) {
    setMode(next)
    setErrors({})
    setMessage(null)
    if (next === 'goal') setReduction(String(plan.reductionPercent))
  }

  const categoryOption = (id: CategoryId) =>
    t('goals.adjust.option', { category: getCategoryLabel(id), percent: formatPercentValue(plan.allocation[id]) })

  return (
    <Panel id="goals-adjust-title" title={t('goals.adjust.title')} description={t('goals.adjust.description')}>
      <form className="goals-form" noValidate onSubmit={handleSubmit}>
        <fieldset className="goals-fieldset">
          <legend className="goals-label">{t('goals.adjust.legend')}</legend>
          <div className="goals-choice-group">
            <label className="goals-choice">
              <input
                type="radio"
                name="adjust-mode"
                checked={mode === 'reallocate'}
                onChange={() => changeMode('reallocate')}
              />
              <span>{t('goals.adjust.reallocate')}</span>
            </label>
            <label className="goals-choice">
              <input type="radio" name="adjust-mode" checked={mode === 'goal'} onChange={() => changeMode('goal')} />
              <span>{t('goals.adjust.goal')}</span>
            </label>
          </div>
        </fieldset>

        {mode === 'reallocate' ? (
          <>
            <p className="goals-hint">{t('goals.adjust.totalStays', { kg: formatKg(budgetKg) })}</p>
            <div className="goals-form__row">
              <div className="goals-field">
                <label className="goals-label" htmlFor="adjust-from">
                  {t('goals.adjust.from')}
                </label>
                <select
                  id="adjust-from"
                  className="goals-input"
                  value={from}
                  onChange={(event) => setFrom(event.target.value as CategoryId)}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {categoryOption(category.id)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="goals-field">
                <label className="goals-label" htmlFor="adjust-to">
                  {t('goals.adjust.to')}
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
                      {categoryOption(category.id)}
                    </option>
                  ))}
                </select>
                {errors.to && (
                  <p id="adjust-to-error" className="goals-error">
                    {text(errors.to)}
                  </p>
                )}
              </div>
            </div>

            <div className="goals-field">
              <label className="goals-label" htmlFor="adjust-amount">
                {t('goals.adjust.amount')}
              </label>
              <input
                id="adjust-amount"
                className="goals-input goals-input--short"
                type="number"
                inputMode="numeric"
                min={1}
                max={available}
                step={1}
                required
                value={amount}
                aria-invalid={errors.amount ? true : undefined}
                aria-describedby={`adjust-amount-hint${errors.amount ? ' adjust-amount-error' : ''}`}
                onChange={(event) => setAmount(event.target.value)}
              />
              <p id="adjust-amount-hint" className="goals-hint">
                {previewKg > 0 ? `${t('goals.adjust.amountPreview', { kg: formatKg(previewKg) })} ` : ''}
                {t('goals.adjust.available', {
                  category: getCategoryLabel(from),
                  percent: formatPercentValue(available),
                  kg: formatKg(shareToKg(budgetKg, plan.allocation, from)),
                })}
              </p>
              {errors.amount && (
                <p id="adjust-amount-error" className="goals-error">
                  {text(errors.amount)}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="goals-field">
            <label className="goals-label" htmlFor="adjust-reduction">
              {t('goals.adjust.newGoal')}
            </label>
            <input
              id="adjust-reduction"
              className="goals-input goals-input--short"
              type="number"
              inputMode="numeric"
              min={REDUCTION_LIMITS.min}
              max={REDUCTION_LIMITS.max}
              step={1}
              required
              value={reduction}
              aria-invalid={errors.reduction ? true : undefined}
              aria-describedby={`adjust-reduction-hint${errors.reduction ? ' adjust-reduction-error' : ''}`}
              onChange={(event) => setReduction(event.target.value)}
            />
            <p id="adjust-reduction-hint" className="goals-hint">
              {t('goals.adjust.goalNow', { percent: formatPercentValue(plan.reductionPercent), kg: formatKg(budgetKg) })}
              {newBudgetKg !== null && newReduction !== plan.reductionPercent
                ? ` ${t('goals.adjust.goalPreview', { percent: formatPercentValue(newReduction), kg: formatKg(newBudgetKg) })}`
                : ''}{' '}
              {t('goals.adjust.sharesStay')}
            </p>
            {errors.reduction && (
              <p id="adjust-reduction-error" className="goals-error">
                {text(errors.reduction)}
              </p>
            )}
          </div>
        )}

        <div className="goals-field">
          <label className="goals-label" htmlFor="adjust-reason">
            {t('goals.adjust.reason')} <span className="goals-optional">{t('actions.optional')}</span>
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
          <Button type="submit">{t('goals.adjust.apply')}</Button>
        </div>
        <p className="goals-success" role="status">
          {text(message ?? undefined)}
        </p>
      </form>
    </Panel>
  )
}
