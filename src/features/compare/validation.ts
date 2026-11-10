/** Journey form values and validation (screen 3 and the scenario screen). */
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
export type JourneyErrors = Partial<Record<JourneyField, string>>

export const EMPTY_JOURNEY: JourneyFormValues = { from: '', to: '', distanceKm: '', passengers: '1' }

/** Accepts "12.5" and "12,5". Returns NaN for anything that is not a plain number. */
export function parseDecimal(text: string): number {
  const normalised = text.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(normalised)) return Number.NaN
  return Number(normalised)
}

export function validateDistance(text: string): string | undefined {
  if (!text.trim()) return 'Enter the distance in kilometres.'
  const value = parseDecimal(text)
  if (Number.isNaN(value)) return 'Enter the distance as a number, for example 12 or 12.5.'
  if (value <= 0) return 'The distance must be more than 0 km.'
  if (value > MAX_DISTANCE_KM) return `Enter a distance of at most ${MAX_DISTANCE_KM} km.`
  return undefined
}

export function validatePassengers(text: string): string | undefined {
  if (!text.trim()) return 'Enter how many people are travelling.'
  if (!/^\d+$/.test(text.trim())) return 'Enter a whole number, for example 1 or 3.'
  const value = Number(text.trim())
  if (value < 1) return 'At least 1 person must travel.'
  if (value > MAX_PASSENGERS) return `Enter at most ${MAX_PASSENGERS} people.`
  return undefined
}

function validatePlace(text: string, label: string): string | undefined {
  if (!text.trim()) return `Enter the ${label}.`
  if (text.trim().length > PLACE_MAX) return `Use at most ${PLACE_MAX} characters.`
  return undefined
}

export function validateJourney(values: JourneyFormValues): JourneyErrors {
  const errors: JourneyErrors = {}
  const from = validatePlace(values.from, 'starting point')
  const to = validatePlace(values.to, 'destination')
  const distance = validateDistance(values.distanceKm)
  const passengers = validatePassengers(values.passengers)
  if (from) errors.from = from
  if (to) errors.to = to
  if (!from && !to && values.from.trim().toLowerCase() === values.to.trim().toLowerCase()) {
    errors.to = 'The destination must be different from the starting point.'
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
