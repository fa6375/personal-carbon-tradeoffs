/**
 * Journey form values and validation (screen 3 and the scenario screen).
 * Errors are translation keys with parameters, so they follow the language.
 */
import type { MessageKey, MessageParams } from '../../i18n'
import type { Journey } from './types'

export const MAX_DISTANCE_KM = 1000
export const MAX_PASSENGERS = 9
export const PLACE_MAX = 80

export interface JourneyFormValues {
  from: string
  to: string
  distanceKm: string
  passengers: string
}

export type JourneyField = keyof JourneyFormValues
export interface FieldMessage {
  key: MessageKey
  params?: MessageParams
}
export type JourneyErrors = Partial<Record<JourneyField, FieldMessage>>

export const EMPTY_JOURNEY: JourneyFormValues = { from: '', to: '', distanceKm: '', passengers: '1' }

/** Accepts "12.5" and "12,5". Returns NaN for anything that is not a plain number. */
export function parseDecimal(text: string): number {
  const normalised = text.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(normalised)) return Number.NaN
  return Number(normalised)
}

export function validateDistance(text: string): FieldMessage | undefined {
  if (!text.trim()) return { key: 'compare.validation.distanceRequired' }
  const value = parseDecimal(text)
  if (Number.isNaN(value)) return { key: 'compare.validation.distanceNumber' }
  if (value <= 0) return { key: 'compare.validation.distancePositive' }
  if (value > MAX_DISTANCE_KM) return { key: 'compare.validation.distanceMax', params: { max: MAX_DISTANCE_KM } }
  return undefined
}

export function validatePassengers(text: string): FieldMessage | undefined {
  if (!text.trim()) return { key: 'compare.validation.passengersRequired' }
  if (!/^\d+$/.test(text.trim())) return { key: 'compare.validation.passengersWhole' }
  const value = Number(text.trim())
  if (value < 1) return { key: 'compare.validation.passengersMin' }
  if (value > MAX_PASSENGERS) return { key: 'compare.validation.passengersMax', params: { max: MAX_PASSENGERS } }
  return undefined
}

function validatePlace(text: string, requiredKey: MessageKey): FieldMessage | undefined {
  if (!text.trim()) return { key: requiredKey }
  if (text.trim().length > PLACE_MAX) return { key: 'compare.validation.placeTooLong', params: { max: PLACE_MAX } }
  return undefined
}

export function validateJourney(values: JourneyFormValues): JourneyErrors {
  const errors: JourneyErrors = {}
  const from = validatePlace(values.from, 'compare.validation.fromRequired')
  const to = validatePlace(values.to, 'compare.validation.toRequired')
  const distance = validateDistance(values.distanceKm)
  const passengers = validatePassengers(values.passengers)
  if (from) errors.from = from
  if (to) errors.to = to
  if (!from && !to && values.from.trim().toLowerCase() === values.to.trim().toLowerCase()) {
    errors.to = { key: 'compare.validation.samePlace' }
  }
  if (distance) errors.distanceKm = distance
  if (passengers) errors.passengers = passengers
  return errors
}

export function toJourney(values: JourneyFormValues): Journey {
  return {
    from: values.from.trim(),
    to: values.to.trim(),
    distanceKm: parseDecimal(values.distanceKm),
    passengers: Number(values.passengers.trim()),
  }
}

export function toFormValues(journey: Journey): JourneyFormValues {
  return {
    from: journey.from,
    to: journey.to,
    distanceKm: String(journey.distanceKm),
    passengers: String(journey.passengers),
  }
}
