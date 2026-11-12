import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '../../../components/Button'
import { isOffline } from '../../../hooks/useOnlineStatus'
import { useI18n } from '../../../i18n'
import type { DataErrorCode } from '../../../lib/dataErrors'
import { dataErrorCode, dataErrorText } from '../../../lib/errorMessages'
import { RouteDistanceLookup } from '../../routing/RouteDistanceLookup'
import {
  ENERGY_FACTORS,
  FOOD_FACTORS,
  SHARED_VEHICLE_MODES,
  TRANSPORT_FACTORS,
  calculateEmissions,
} from '../emissionFactors'
import { formatKg, today } from '../format'
import { energyLabel, foodLabel, modeLabel } from '../labels'
import type { ActivityInput } from '../types'
import {
  NOTE_MAX,
  previewInput,
  toInput,
  validate,
  type ActivityFormValues,
  type FieldError,
  type FieldName,
  type FormErrors,
} from '../validation'

interface ActivityFormProps {
  initialValues: ActivityFormValues
  submitLabel: string
  onSubmit: (input: ActivityInput) => Promise<void>
  onCancel: () => void
}

/** Why saving failed: offline before trying, or the service's error code. */
type SubmitProblem = { kind: 'offline' } | { kind: 'data'; code: DataErrorCode }

/**
 * Shared form behind screens 3, 4, 5 (Transport, Food and Home Energy entry)
 * and screen 8 (Edit Activity). The category decides which fields appear.
 * The values stay in the form when saving fails, so nothing has to be retyped.
 */
export function ActivityForm({ initialValues, submitLabel, onSubmit, onCancel }: ActivityFormProps) {
  const { t } = useI18n()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitProblem, setSubmitProblem] = useState<SubmitProblem | null>(null)
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const idPrefix = useId()
  const id = (name: FieldName) => `${idPrefix}-${name}`
  const errorText = (error?: FieldError) => (error ? t(error.key, error.params) : undefined)

  function set<K extends FieldName>(name: K, value: ActivityFormValues[K]) {
    setValues((current) => ({ ...current, [name]: value }))
    // Clear a field's error once the user changes it.
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    // Ignore repeated clicks while a save is running.
    if (saving) return
    const found = validate(values)
    setErrors(found)
    setSubmitProblem(null)
    const firstInvalid = Object.keys(found)[0] as FieldName | undefined
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(firstInvalid))}`)?.focus()
      return
    }
    if (isOffline()) {
      setSubmitProblem({ kind: 'offline' })
      return
    }
    setSaving(true)
    try {
      await onSubmit(toInput(values))
    } catch (reason) {
      setSubmitProblem({ kind: 'data', code: dataErrorCode(reason) })
      setSaving(false)
    }
  }

  const preview = previewInput(values)
  const estimate = preview ? calculateEmissions(preview.details) : null
  const sharedVehicle = values.category === 'transport' && SHARED_VEHICLE_MODES.includes(values.mode)

  const errorCount = Object.keys(errors).length

  return (
    <form ref={formRef} className="tracking-form" onSubmit={handleSubmit} noValidate aria-busy={saving || undefined}>
      {errorCount > 0 && (
        <div className="tracking-form__summary" role="alert">
          {t('tracking.form.errorSummary', { count: errorCount })}
        </div>
      )}

      {values.category === 'transport' && (
        <>
          <SelectField
            id={id('mode')}
            label={t('tracking.form.mode')}
            value={values.mode}
            options={TRANSPORT_FACTORS.map((factor) => ({ id: factor.id, label: modeLabel(factor.id) }))}
            onChange={(value) => set('mode', value)}
          />
          <NumberField
            id={id('distanceKm')}
            label={t('tracking.form.distance')}
            unit="km"
            hint={t('tracking.form.distanceHint')}
            value={values.distanceKm}
            error={errorText(errors.distanceKm)}
            onChange={(value) => set('distanceKm', value)}
          />
          <RouteDistanceLookup
            preferred={values.mode === 'walk' ? 'walking' : values.mode === 'bicycle' ? 'cycling' : 'driving'}
            onUse={(km) => set('distanceKm', String(km))}
          />
          {sharedVehicle && (
            <NumberField
              id={id('passengers')}
              label={t('tracking.form.passengers')}
              value={values.passengers}
              error={errorText(errors.passengers)}
              inputMode="numeric"
              hint={t('tracking.form.passengersHint')}
              onChange={(value) => set('passengers', value)}
            />
          )}
        </>
      )}

      {values.category === 'food' && (
        <>
          <SelectField
            id={id('item')}
            label={t('tracking.form.item')}
            value={values.item}
            options={FOOD_FACTORS.map((factor) => ({ id: factor.id, label: foodLabel(factor.id) }))}
            onChange={(value) => set('item', value)}
          />
          <NumberField
            id={id('servings')}
            label={t('tracking.form.servings')}
            hint={t('tracking.form.servingsHint')}
            value={values.servings}
            error={errorText(errors.servings)}
            onChange={(value) => set('servings', value)}
          />
        </>
      )}

      {values.category === 'home' && (
        <>
          <SelectField
            id={id('source')}
            label={t('tracking.form.source')}
            value={values.source}
            options={ENERGY_FACTORS.map((factor) => ({ id: factor.id, label: energyLabel(factor.id) }))}
            onChange={(value) => set('source', value)}
          />
          <NumberField
            id={id('kwh')}
            label={t('tracking.form.kwh')}
            unit="kWh"
            hint={t('tracking.form.kwhHint')}
            value={values.kwh}
            error={errorText(errors.kwh)}
            onChange={(value) => set('kwh', value)}
          />
          <NumberField
            id={id('householdSize')}
            label={t('tracking.form.householdSize')}
            hint={t('tracking.form.householdSizeHint')}
            value={values.householdSize}
            error={errorText(errors.householdSize)}
            inputMode="numeric"
            onChange={(value) => set('householdSize', value)}
          />
        </>
      )}

      <Field id={id('date')} label={t('tracking.form.date')} required error={errorText(errors.date)}>
        <input
          id={id('date')}
          type="date"
          className="tracking-input"
          value={values.date}
          max={today()}
          required
          aria-invalid={errors.date ? true : undefined}
          aria-describedby={errors.date ? `${id('date')}-error` : undefined}
          onChange={(event) => set('date', event.target.value)}
        />
      </Field>

      <Field
        id={id('note')}
        label={t('tracking.form.note')}
        optional
        hint={t('tracking.form.noteHint', { max: NOTE_MAX })}
        error={errorText(errors.note)}
      >
        <input
          id={id('note')}
          type="text"
          className="tracking-input"
          value={values.note}
          maxLength={NOTE_MAX + 20}
          autoComplete="off"
          aria-invalid={errors.note ? true : undefined}
          aria-describedby={`${id('note')}-hint${errors.note ? ` ${id('note')}-error` : ''}`}
          onChange={(event) => set('note', event.target.value)}
        />
      </Field>

      <div className="tracking-estimate" role="status" aria-live="polite">
        <span className="tracking-estimate__label">{t('tracking.form.estimate')}</span>
        <span className="tracking-estimate__value">
          {estimate === null ? t('tracking.form.estimatePending') : formatKg(estimate)}
        </span>
      </div>

      {submitProblem && (
        <p className="tracking-form__submit-error" role="alert">
          {submitProblem.kind === 'offline'
            ? t('offline.saveBlocked')
            : `${t('tracking.form.saveFailed')} ${dataErrorText(submitProblem.code)}`}
        </p>
      )}

      <div className="tracking-form__actions">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          {t('actions.cancel')}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? t('actions.saving') : submitLabel}
        </Button>
      </div>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  /** Shows "(required)" after the label. */
  required?: boolean
  /** Shows "(optional)" after the label. */
  optional?: boolean
  children: ReactNode
}

function Field({ id, label, hint, error, required, optional, children }: FieldProps) {
  const { t } = useI18n()
  return (
    <div className={`tracking-field${error ? ' tracking-field--invalid' : ''}`}>
      <label htmlFor={id} className="tracking-field__label">
        {label}
        {required && <span className="tracking-field__marker"> {t('actions.required')}</span>}
        {optional && <span className="tracking-field__marker"> {t('actions.optional')}</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="tracking-field__hint">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="tracking-field__error">
          <span aria-hidden="true">! </span>
          {error}
        </p>
      )}
    </div>
  )
}

interface NumberFieldProps {
  id: string
  label: string
  unit?: string
  hint?: string
  value: string
  error?: string
  inputMode?: 'decimal' | 'numeric'
  onChange: (value: string) => void
}

function NumberField({ id, label, unit, hint, value, error, inputMode = 'decimal', onChange }: NumberFieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  return (
    <Field id={id} label={unit ? `${label} (${unit})` : label} hint={hint} error={error} required>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        className="tracking-input tracking-input--number"
        value={value}
        autoComplete="off"
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}

interface SelectFieldProps<T extends string> {
  id: string
  label: string
  value: T
  options: { id: T; label: string }[]
  onChange: (value: T) => void
}

function SelectField<T extends string>({ id, label, value, options, onChange }: SelectFieldProps<T>) {
  return (
    <Field id={id} label={label}>
      <select id={id} className="tracking-input" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
