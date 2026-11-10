import { useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import { getTransportOption } from '../transportOptions'
import type { TransportOptionId } from '../types'
import {
  MAX_PASSENGERS,
  PLACE_MAX,
  parseDecimal,
  validateJourney,
  type JourneyErrors,
  type JourneyField,
  type JourneyFormValues,
} from '../validation'
import { Field } from './CompareUi'

interface JourneyDetailsProps {
  initial: JourneyFormValues
  modes: TransportOptionId[]
  onContinue: (values: JourneyFormValues) => void
  onBack: (values: JourneyFormValues) => void
}

const FIELD_ORDER: JourneyField[] = ['from', 'to', 'distanceKm', 'passengers']

/** Screen 3 — Enter journey. */
export function JourneyDetails({ initial, modes, onContinue, onBack }: JourneyDetailsProps) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<JourneyErrors>({})
  const formRef = useRef<HTMLFormElement>(null)
  const prefix = useId()
  const id = (name: JourneyField) => `${prefix}-${name}`

  function set(name: JourneyField, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validateJourney(values)
    setErrors(found)
    const firstInvalid = FIELD_ORDER.find((name) => found[name])
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(firstInvalid))}`)?.focus()
      return
    }
    onContinue(values)
  }

  const errorCount = Object.keys(errors).length
  const distance = parseDecimal(values.distanceKm)
  const tooFar = modes
    .map(getTransportOption)
    .filter((option) => option.practicalMaxKm !== undefined && distance > option.practicalMaxKm)
  const hasSharedVehicle = modes.some((mode) => getTransportOption(mode).sharedVehicle)

  return (
    <form ref={formRef} className="compare-form" onSubmit={handleSubmit} noValidate>
      {errorCount > 0 && (
        <div className="compare-form__summary" role="alert">
          {errorCount === 1
            ? 'Please correct the highlighted field.'
            : `Please correct the ${errorCount} highlighted fields.`}
        </div>
      )}

      <div className="compare-form__row">
        <Field
          id={id('from')}
          label="Starting point"
          hint="For example: Home, or Ilica 10, Zagreb"
          value={values.from}
          error={errors.from}
          maxLength={PLACE_MAX}
          onChange={(value) => set('from', value)}
        />
        <Field
          id={id('to')}
          label="Destination"
          hint="For example: University campus"
          value={values.to}
          error={errors.to}
          maxLength={PLACE_MAX}
          onChange={(value) => set('to', value)}
        />
      </div>

      <Field
        id={id('distanceKm')}
        label="Distance (one way)"
        unit="km"
        inputMode="decimal"
        hint="Enter the distance yourself, for example from a map app. Carbon Choices does not calculate routes."
        value={values.distanceKm}
        error={errors.distanceKm}
        onChange={(value) => set('distanceKm', value)}
      />

      <Field
        id={id('passengers')}
        label="People travelling together, including you"
        inputMode="numeric"
        hint={
          hasSharedVehicle
            ? `In a car, emissions and costs are shared between everyone in it (1–${MAX_PASSENGERS}). Results are per person.`
            : `1–${MAX_PASSENGERS}. Results are shown per person.`
        }
        value={values.passengers}
        error={errors.passengers}
        onChange={(value) => set('passengers', value)}
      />

      {tooFar.length > 0 && !errors.distanceKm && (
        <p className="compare-notice compare-notice--warning" role="status">
          <Icon name="info" size={16} />
          <span>
            {tooFar.map((option) => option.label).join(' and ')}{' '}
            {tooFar.length === 1 ? 'is' : 'are'} not practical for most people over this distance. It
            is still calculated so you can see the trade-off.
          </span>
        </p>
      )}

      <div className="compare-actions">
        <Button variant="secondary" onClick={() => onBack(values)}>
          Back
        </Button>
        <Button type="submit" icon="arrow-right">
          Continue to priorities
        </Button>
      </div>
    </form>
  )
}
