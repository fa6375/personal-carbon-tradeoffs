/*
 * Content and TEMPORARY SAMPLE DATA for the Carbon Reduction Goals feature.
 *
 * SAMPLE_BASELINE and SAMPLE_CURRENT_USAGE are illustrative placeholders used
 * only when the user has not recorded activities in Personal Carbon Tracking
 * (or chooses the sample value). They are not measured.
 *
 * Recommendation savings are NOT hard-coded: each opportunity describes an
 * example month as Tracking activities, and the saving is calculated with the
 * illustrative emission factors in src/features/tracking/emissionFactors.ts,
 * the same factors Tracking and Compare use. The example amounts (km, servings,
 * kWh) are assumptions shown to the user.
 */
import { t } from '../../i18n'
import { CATEGORIES as TRACKING_CATEGORIES } from '../tracking/emissionFactors'
import { categoryLabel } from '../tracking/labels'
import type { CategoryAmounts, CategoryId, Opportunity, Priority, PriorityId } from './types'

export interface Category {
  id: CategoryId
  label: string
  description: string
}

/**
 * Same categories and labels as Personal Carbon Tracking. Label and
 * description are getters, so they are read in the current language.
 */
export const CATEGORIES: Category[] = TRACKING_CATEGORIES.map((id) => ({
  id,
  get label() {
    return categoryLabel(id)
  },
  get description() {
    return t(`goals.categories.${id}`)
  },
}))

export const CATEGORY_IDS: CategoryId[] = [...TRACKING_CATEGORIES]

export function getCategoryLabel(id: CategoryId): string {
  return categoryLabel(id)
}

/** Sample monthly emissions in kg CO₂e per category. Placeholder, not measured. */
export const SAMPLE_BASELINE: CategoryAmounts = {
  transport: 220,
  food: 180,
  home: 150,
}

/** Sample emissions "used so far" this month, in kg CO₂e. Placeholder, not measured. */
export const SAMPLE_CURRENT_USAGE: CategoryAmounts = {
  transport: 128,
  food: 96,
  home: 74,
}

/** Day of the sample month that SAMPLE_CURRENT_USAGE represents. */
export const SAMPLE_DAY = { current: 18, total: 30 }

/** Accepted range for "current monthly emissions" entered by the user, in kg CO₂e. */
export const CUSTOM_BASELINE_LIMITS = { min: 10, max: 5000 }

/** Accepted range for the reduction goal, in percent. */
export const REDUCTION_LIMITS = { min: 1, max: 90 }

/** Label and description are translated (goals.priorities.<id>). */
export const PRIORITIES: Priority[] = (['impact', 'cost', 'time', 'comfort'] as PriorityId[]).map((id) => ({
  id,
  get label() {
    return t(`goals.priorities.${id}.label`)
  },
  get description() {
    return t(`goals.priorities.${id}.description`)
  },
}))

export const DEFAULT_PRIORITIES: PriorityId[] = PRIORITIES.map((priority) => priority.id)

export function getPriority(id: PriorityId): Priority {
  return PRIORITIES.find((priority) => priority.id === id) ?? PRIORITIES[0]
}

/** Example recommendations. Texts are translated (goals.opportunities.<id>); savings are calculated from `before` and `after`. */
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'car-share',
    categoryId: 'transport',
    get title() {
      return t('goals.opportunities.car-share.title')
    },
    get description() {
      return t('goals.opportunities.car-share.description')
    },
    get assumption() {
      return t('goals.opportunities.car-share.assumption')
    },
    before: { category: 'transport', mode: 'car-petrol', distanceKm: 340, passengers: 1 },
    after: { category: 'transport', mode: 'car-petrol', distanceKm: 340, passengers: 2 },
    cost: 'better',
    time: 'same',
    comfort: 'same',
    effort: 'medium',
  },
  {
    id: 'cycle-short-trips',
    categoryId: 'transport',
    get title() {
      return t('goals.opportunities.cycle-short-trips.title')
    },
    get description() {
      return t('goals.opportunities.cycle-short-trips.description')
    },
    get assumption() {
      return t('goals.opportunities.cycle-short-trips.assumption')
    },
    before: { category: 'transport', mode: 'car-petrol', distanceKm: 75, passengers: 1 },
    after: { category: 'transport', mode: 'bicycle', distanceKm: 75, passengers: 1 },
    cost: 'better',
    time: 'same',
    comfort: 'worse',
    effort: 'medium',
  },
  {
    id: 'bus-commute',
    categoryId: 'transport',
    get title() {
      return t('goals.opportunities.bus-commute.title')
    },
    get description() {
      return t('goals.opportunities.bus-commute.description')
    },
    get assumption() {
      return t('goals.opportunities.bus-commute.assumption')
    },
    before: { category: 'transport', mode: 'car-petrol', distanceKm: 170, passengers: 1 },
    after: { category: 'transport', mode: 'bus', distanceKm: 170, passengers: 1 },
    cost: 'better',
    time: 'worse',
    comfort: 'same',
    effort: 'low',
  },
  {
    id: 'plant-meals',
    categoryId: 'food',
    get title() {
      return t('goals.opportunities.plant-meals.title')
    },
    get description() {
      return t('goals.opportunities.plant-meals.description')
    },
    get assumption() {
      return t('goals.opportunities.plant-meals.assumption')
    },
    before: { category: 'food', item: 'beef', servings: 8 },
    after: { category: 'food', item: 'vegan', servings: 8 },
    cost: 'better',
    time: 'same',
    comfort: 'same',
    effort: 'low',
  },
  {
    id: 'vegetarian-chicken',
    categoryId: 'food',
    get title() {
      return t('goals.opportunities.vegetarian-chicken.title')
    },
    get description() {
      return t('goals.opportunities.vegetarian-chicken.description')
    },
    get assumption() {
      return t('goals.opportunities.vegetarian-chicken.assumption')
    },
    before: { category: 'food', item: 'chicken', servings: 8 },
    after: { category: 'food', item: 'vegetarian', servings: 8 },
    cost: 'better',
    time: 'same',
    comfort: 'same',
    effort: 'low',
  },
  {
    id: 'lower-heating',
    categoryId: 'home',
    get title() {
      return t('goals.opportunities.lower-heating.title')
    },
    get description() {
      return t('goals.opportunities.lower-heating.description')
    },
    get assumption() {
      return t('goals.opportunities.lower-heating.assumption')
    },
    before: { category: 'home', source: 'natural-gas', kwh: 60, householdSize: 1 },
    after: { category: 'home', source: 'natural-gas', kwh: 0, householdSize: 1 },
    cost: 'better',
    time: 'same',
    comfort: 'worse',
    effort: 'low',
  },
  {
    id: 'cool-wash',
    categoryId: 'home',
    get title() {
      return t('goals.opportunities.cool-wash.title')
    },
    get description() {
      return t('goals.opportunities.cool-wash.description')
    },
    get assumption() {
      return t('goals.opportunities.cool-wash.assumption')
    },
    before: { category: 'home', source: 'electricity', kwh: 15, householdSize: 1 },
    after: { category: 'home', source: 'electricity', kwh: 0, householdSize: 1 },
    cost: 'better',
    time: 'same',
    comfort: 'same',
    effort: 'low',
  },
  {
    id: 'standby',
    categoryId: 'home',
    get title() {
      return t('goals.opportunities.standby.title')
    },
    get description() {
      return t('goals.opportunities.standby.description')
    },
    get assumption() {
      return t('goals.opportunities.standby.assumption')
    },
    before: { category: 'home', source: 'electricity', kwh: 10, householdSize: 1 },
    after: { category: 'home', source: 'electricity', kwh: 0, householdSize: 1 },
    cost: 'better',
    time: 'same',
    comfort: 'same',
    effort: 'low',
  },
]

export const REDUCTION_OPTIONS = [10, 15, 20, 25, 30] as const
export const DURATION_OPTIONS = [3, 6, 12] as const
