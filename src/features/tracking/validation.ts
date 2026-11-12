/**
 * Form state and validation for the activity entry and edit screens.
 * Errors are translation keys with parameters (not text), so the form shows
 * them in the current language even after the language changes.
 */
import type { MessageKey, MessageParams } from '../../i18n'
import { today } from './format'
import type {
  Activity,
  ActivityCategory,
  ActivityInput,
  EnergySource,
  FoodItem,
  TransportMode,
} from './types'

/** Raw form values. Numbers are kept as strings while the user types. */
export interface ActivityFormValues {
  category: ActivityCategory
  date: string
  note: string
  mode: TransportMode
  distanceKm: string
  passengers: string
  item: FoodItem
  servings: string
  source: EnergySource
  kwh: string
  householdSize: string
}

export type FieldName = keyof ActivityFormValues
export interface FieldError {
  key: MessageKey
  params?: MessageParams
}
export type FormErrors = Partial<Record<FieldName, FieldError>>

type NumberField = 'distanceKm' | 'passengers' | 'servings' | 'kwh' | 'householdSize'

export const NOTE_MAX = 120

export function emptyForm(category: ActivityCategory): ActivityFormValues {
  return {
    category,
    date: today(),
    note: '',
    mode: 'bus',
    distanceKm: '',
    passengers: '1',
    item: 'vegetarian',
    servings: '1',
    source: 'electricity',
    kwh: '',
    householdSize: '1',
  }
}

export function formFromActivity(activity: Activity): ActivityFormValues {
  const form = emptyForm(activity.details.category)
  form.date = activity.date
  form.note = activity.note
  const details = activity.details
  if (details.category === 'transport') {
    form.mode = details.mode
    form.distanceKm = String(details.distanceKm)
    form.passengers = String(details.passengers)
  } else if (details.category === 'food') {
    form.item = details.item
    form.servings = String(details.servings)
  } else {
    form.source = details.source
    form.kwh = String(details.kwh)
    form.householdSize = String(details.householdSize)
  }
  return form
}

/** Accepts "12", "12.5" and "12,5" (comma decimal, common in Croatia). */
export function parseDecimal(value: string): number {
  const normalised = value.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(normalised)) return Number.NaN
  return Number(normalised)
}

function checkNumber(
  value: string,
  field: NumberField,
  { min, max, integer = false }: { min: number; max: number; integer?: boolean },
): FieldError | undefined {
  if (value.trim() === '') return { key: `tracking.validation.required.${field}` }
  const number = parseDecimal(value)
  if (Number.isNaN(number)) return { key: 'tracking.validation.notNumber', params: { example: integer ? 2 : 12.5 } }
  if (integer && !Number.isInteger(number)) return { key: 'tracking.validation.notWhole' }
  if (number < min || number > max) return { key: 'tracking.validation.outOfRange', params: { min, max } }
  return undefined
}

export function validate(values: ActivityFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) {
    errors.date = { key: 'tracking.validation.dateRequired' }
  } else if (values.date > today()) {
    errors.date = { key: 'tracking.validation.dateFuture' }
  }
  if (values.note.length > NOTE_MAX) {
    errors.note = { key: 'tracking.validation.noteTooLong', params: { max: NOTE_MAX } }
  }
  if (values.category === 'transport') {
    errors.distanceKm = checkNumber(values.distanceKm, 'distanceKm', { min: 0.1, max: 20000 })
    errors.passengers = checkNumber(values.passengers, 'passengers', {
      min: 1,
      max: 9,
      integer: true,
    })
  } else if (values.category === 'food') {
    errors.servings = checkNumber(values.servings, 'servings', { min: 0.5, max: 20 })
  } else {
    errors.kwh = checkNumber(values.kwh, 'kwh', { min: 0.1, max: 100000 })
    errors.householdSize = checkNumber(values.householdSize, 'householdSize', {
      min: 1,
      max: 20,
      integer: true,
    })
  }
  for (const key of Object.keys(errors) as FieldName[]) {
    if (!errors[key]) delete errors[key]
  }
  return errors
}

/** Converts valid form values into repository input. Call only after validate() passes. */
export function toInput(values: ActivityFormValues): ActivityInput {
  const base = { date: values.date, note: values.note.trim() }
  switch (values.category) {
    case 'transport':
      return {
        ...base,
        details: {
          category: 'transport',
          mode: values.mode,
          distanceKm: parseDecimal(values.distanceKm),
          passengers: parseDecimal(values.passengers),
        },
      }
    case 'food':
      return {
        ...base,
        details: { category: 'food', item: values.item, servings: parseDecimal(values.servings) },
      }
    case 'home':
      return {
        ...base,
        details: {
          category: 'home',
          source: values.source,
          kwh: parseDecimal(values.kwh),
          householdSize: parseDecimal(values.householdSize),
        },
      }
  }
}

/** Live estimate while typing, or null if the numbers are not valid yet. */
export function previewInput(values: ActivityFormValues): ActivityInput | null {
  const errors = validate({ ...values, date: today(), note: '' })
  return Object.keys(errors).length === 0 ? toInput(values) : null
}
