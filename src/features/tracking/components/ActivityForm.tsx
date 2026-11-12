import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '../../../components/Button'
import { RouteDistanceLookup } from '../../routing/RouteDistanceLookup'
import {
  ENERGY_FACTORS,
  FOOD_FACTORS,
  SHARED_VEHICLE_MODES,
  TRANSPORT_FACTORS,
  calculateEmissions,
} from '../emissionFactors'
import { formatKg, today } from '../format'
import type { ActivityInput } from '../types'
import {
  NOTE_MAX,
  previewInput,
  toInput,
  validate,
  type ActivityFormValues,
  type FieldName,
  type FormErrors,
} from '../validation'

interface ActivityFormProps {
  initialValues: ActivityFormValues
  submitLabel: string
  onSubmit: (input: ActivityInput) => Promise<void>
  onCancel: () => void
}

/**
 * Shared form behind screens 3, 4, 5 (Transport, Food and Home Energy entry)
 * and screen 8 (Edit Activity). The category decides which fields appear.
 */
export function ActivityForm({ initialValues, submitLabel, onSubmit, onCancel }: ActivityFormProps) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const idPrefix = useId()
  const id = (name: FieldName) => `${idPrefix}-${name}`

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
    const found = validate(values)
    setErrors(found)
    setSubmitError(null)
    const firstInvalid = Object.keys(found)[0] as FieldName | undefined
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(firstInvalid))}`)?.focus()
      return
    }
    setSaving(true)
    try {
      await onSubmit(toInput(values))
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'The activity could not be saved.')
      setSaving(false)
    }
  }

  const preview = previewInput(values)
  const estimate = preview ? calculateEmissions(preview.details) : null
  const sharedVehicle = values.category === 'transport' && SHARED_VEHICLE_MODES.includes(values.mode)

  const errorCount = Object.keys(errors).length

  return (
    <form ref={formRef} className="tracking-form" onSubmit={handleSubmit} noValidate>
      {errorCount > 0 && (
        <div className="tracking-form__summary" role="alert">
          {errorCount === 1
            ? 'Please correct the highlighted field.'
            : `Please correct the ${errorCount} highlighted fields.`}
        </div>
      )}

      {values.category === 'transport' && (
        <>
          <SelectField
            id={id('mode')}
            label="How did you travel?"
            value={values.mode}
            options={TRANSPORT_FACTORS}
            onChange={(value) => set('mode', value)}
          />
          <NumberField
            id={id('distanceKm')}
            label="Distance"
            unit="km"
            hint="One-way distance. Add a return trip as a second activity or double the distance."
            value={values.distanceKm}
            error={errors.distanceKm}
            onChange={(value) => set('distanceKm', value)}
          />
          <RouteDistanceLookup
            preferred={values.mode === 'walk' ? 'walking' : values.mode === 'bicycle' ? 'cycling' : 'driving'}
            onUse={(km) => set('distanceKm', String(km))}
          />
          {sharedVehicle && (
            <NumberField
              id={id('passengers')}
              label="People in the vehicle, including you"
              value={values.passengers}
              error={errors.passengers}
              inputMode="numeric"
              hint="The vehicle's emissions are shared equally between everyone travelling."
              onChange={(value) => set('passengers', value)}
            />
          )}
        </>
      )}

      {values.category === 'food' && (
        <>
          <SelectField
            id={id('item')}
            label="What did you eat?"
            value={values.item}
            options={FOOD_FACTORS}
            onChange={(value) => set('item', value)}
          />
          <NumberField
            id={id('servings')}
            label="Servings"
            hint="One serving is a typical portion for one person."
            value={values.servings}
            error={errors.servings}
            onChange={(value) => set('servings', value)}
          />
        </>
      )}

      {values.category === 'home' && (
        <>
          <SelectField
            id={id('source')}
            label="Energy source"
            value={values.source}
            options={ENERGY_FACTORS}
            onChange={(value) => set('source', value)}
          />
          <NumberField
            id={id('kwh')}
            label="Energy used"
            unit="kWh"
            hint="You can find this on your meter or energy bill."
            value={values.kwh}
            error={errors.kwh}
            onChange={(value) => set('kwh', value)}
          />
          <NumberField
            id={id('householdSize')}
            label="People in your household"
            hint="Your share is the total divided by the number of people."
            value={values.householdSize}
            error={errors.householdSize}
            inputMode="numeric"
            onChange={(value) => set('householdSize', value)}
          />
        </>
      )}

      <Field id={id('date')} label="Date" error={errors.date}>
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
        label="Note (optional)"
        hint={`For example "Trip to campus". Up to ${NOTE_MAX} characters.`}
        error={errors.note}
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
        <span className="tracking-estimate__label">Estimated emissions</span>
        <span className="tracking-estimate__value">
          {estimate === null ? 'Enter the amount to see an estimate' : formatKg(estimate)}
        </span>
      </div>

      {submitError && (
        <p className="tracking-form__submit-error" role="alert">
          {submitError}
        </p>
      )}

      <div className="tracking-form__actions">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
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
  children: ReactNode
}

function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className={`tracking-field${error ? ' tracking-field--invalid' : ''}`}>
      <label htmlFor={id} className="tracking-field__label">
        {label}
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

function NumberField({
  id,
  label,
  unit,
  hint,
  value,
  error,
  inputMode = 'decimal',
  onChange,
}: NumberFieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  return (
    <Field id={id} label={unit ? `${label} (${unit})` : label} hint={hint} error={error}>
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
      <select
        id={id}
        className="tracking-input"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
