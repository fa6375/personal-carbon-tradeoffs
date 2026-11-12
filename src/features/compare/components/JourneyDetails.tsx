import { useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import { useI18n } from '../../../i18n'
import { listModes } from '../calculate'
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
import { RouteDistanceLookup } from '../../routing/RouteDistanceLookup'

interface JourneyDetailsProps {
  initial: JourneyFormValues
  modes: TransportOptionId[]
  onContinue: (values: JourneyFormValues) => void
  onBack: (values: JourneyFormValues) => void
}

const FIELD_ORDER: JourneyField[] = ['from', 'to', 'distanceKm', 'passengers']

/** Screen 3 — Enter journey. */
export function JourneyDetails({ initial, modes, onContinue, onBack }: JourneyDetailsProps) {
  const { t } = useI18n()
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
          {t('compare.journey.errorSummary', { count: errorCount })}
        </div>
      )}

      <div className="compare-form__row">
        <Field
          id={id('from')}
          label={t('compare.journey.from')}
          hint={t('compare.journey.fromHint')}
          value={values.from}
          error={errors.from && t(errors.from.key, errors.from.params)}
          maxLength={PLACE_MAX}
          onChange={(value) => set('from', value)}
        />
        <Field
          id={id('to')}
          label={t('compare.journey.to')}
          hint={t('compare.journey.toHint')}
          value={values.to}
          error={errors.to && t(errors.to.key, errors.to.params)}
          maxLength={PLACE_MAX}
          onChange={(value) => set('to', value)}
        />
      </div>

      <Field
        id={id('distanceKm')}
        label={t('compare.journey.distance')}
        unit="km"
        inputMode="decimal"
        hint={t('compare.journey.distanceHint')}
        value={values.distanceKm}
        error={errors.distanceKm && t(errors.distanceKm.key, errors.distanceKm.params)}
        onChange={(value) => set('distanceKm', value)}
      />

      <RouteDistanceLookup
        from={values.from}
        to={values.to}
        preferred={
          modes.some((mode) => mode === 'car' || mode === 'electric-car' || mode === 'bus')
            ? 'driving'
            : modes.includes('bicycle')
              ? 'cycling'
              : 'walking'
        }
        onUse={(km) => set('distanceKm', String(km))}
      />

      <Field
        id={id('passengers')}
        label={t('compare.journey.passengers')}
        inputMode="numeric"
        hint={
          hasSharedVehicle
            ? t('compare.journey.passengersShared', { max: MAX_PASSENGERS })
            : t('compare.journey.passengersHint', { max: MAX_PASSENGERS })
        }
        value={values.passengers}
        error={errors.passengers && t(errors.passengers.key, errors.passengers.params)}
        onChange={(value) => set('passengers', value)}
      />

      {tooFar.length > 0 && !errors.distanceKm && (
        <p className="compare-notice compare-notice--warning" role="status">
          <Icon name="info" size={16} />
          <span>
            {t('compare.journey.tooFar', { count: tooFar.length, options: listModes(tooFar.map((option) => option.id)) })}
          </span>
        </p>
      )}

      <div className="compare-actions">
        <Button variant="secondary" onClick={() => onBack(values)}>
          {t('compare.journey.back')}
        </Button>
        <Button type="submit" icon="arrow-right">
          {t('compare.journey.continue')}
        </Button>
      </div>
    </form>
  )
}
