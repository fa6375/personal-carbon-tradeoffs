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
import { CATEGORIES as TRACKING_CATEGORIES, CATEGORY_LABELS } from '../tracking/emissionFactors'
import type { CategoryAmounts, CategoryId, Opportunity, Priority, PriorityId } from './types'

export interface Category {
  id: CategoryId
  label: string
  description: string
}

const CATEGORY_DESCRIPTIONS: Record<CategoryId, string> = {
  transport: 'Commuting, errands and longer trips.',
  food: 'Meals at home and eating out.',
  home: 'Heating, electricity and hot water.',
}

/** Same categories and labels as Personal Carbon Tracking. */
export const CATEGORIES: Category[] = TRACKING_CATEGORIES.map((id) => ({
  id,
  label: CATEGORY_LABELS[id],
  description: CATEGORY_DESCRIPTIONS[id],
}))

export const CATEGORY_IDS: CategoryId[] = [...TRACKING_CATEGORIES]

export function getCategoryLabel(id: CategoryId): string {
  return CATEGORY_LABELS[id]
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

export const PRIORITIES: Priority[] = [
  {
    id: 'impact',
    label: 'Cut the most emissions',
    description: 'Prefer changes with the biggest CO₂ saving.',
  },
  {
    id: 'cost',
    label: 'Keep costs low',
    description: 'Prefer changes that save money or cost nothing.',
  },
  {
    id: 'time',
    label: 'Save time',
    description: 'Avoid changes that make everyday tasks take longer.',
  },
  {
    id: 'comfort',
    label: 'Stay comfortable',
    description: 'Avoid changes that feel like giving something up.',
  },
]

export const DEFAULT_PRIORITIES: PriorityId[] = PRIORITIES.map((priority) => priority.id)

export function getPriority(id: PriorityId): Priority {
  return PRIORITIES.find((priority) => priority.id === id) ?? PRIORITIES[0]
}

/** Example recommendations. Savings are calculated from `before` and `after`. */
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'car-share',
    categoryId: 'transport',
    title: 'Share the car on your commute',
    description: 'Drive to university or work with someone going the same way.',
    assumption: 'About 340 km of commuting a month, shared by two people instead of driving alone.',
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
    title: 'Cycle trips under 3 km',
    description: 'Short errands are often as quick by bike as by car.',
    assumption: 'About 75 km a month of short petrol-car trips made by bicycle instead.',
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
    title: 'Take the bus for two commutes a week',
    description: 'Swap some car journeys to university or work for public transport.',
    assumption: 'About 170 km a month driven alone in a petrol car made by bus instead.',
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
    title: 'Swap beef for plant-based meals twice a week',
    description: 'Replace beef in two meals a week with a vegan dish.',
    assumption: 'About 8 beef servings a month replaced by vegan meals.',
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
    title: 'Choose vegetarian instead of chicken twice a week',
    description: 'A smaller change for people who rarely eat red meat.',
    assumption: 'About 8 chicken servings a month replaced by vegetarian meals.',
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
    title: 'Lower the heating by 1 °C',
    description: 'A small change to the thermostat that is easy to keep.',
    assumption: 'About 60 kWh less natural gas a month for your share of the household.',
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
    title: 'Wash laundry at 30 °C',
    description: 'Most everyday loads come out just as clean at a lower temperature.',
    assumption: 'About 15 kWh less electricity a month.',
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
    title: 'Switch devices off at the wall',
    description: 'Turn off chargers, consoles and TVs instead of leaving them on standby.',
    assumption: 'About 10 kWh less electricity a month.',
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
