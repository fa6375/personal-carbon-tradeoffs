/*
 * TEMPORARY SAMPLE DATA for the Carbon Reduction Goals feature.
 *
 * Every number in this file is an illustrative placeholder chosen by the team
 * so the screens can be designed and tested. None of it is measured, calculated
 * from emission factors or loaded from a database or API.
 *
 * Replace it when Personal Carbon Tracking (real recorded emissions), the
 * database and the external emissions API are available.
 */
import type {
  Category,
  CategoryAmounts,
  CategoryId,
  Opportunity,
  Priority,
  PriorityId,
} from './types'

export const CATEGORIES: Category[] = [
  {
    id: 'transport',
    label: 'Transport',
    description: 'Commuting, errands and longer trips.',
  },
  {
    id: 'food',
    label: 'Food',
    description: 'Groceries, meals out and food waste.',
  },
  {
    id: 'home',
    label: 'Home energy',
    description: 'Heating, electricity and hot water.',
  },
  {
    id: 'goods',
    label: 'Goods & shopping',
    description: 'Clothes, electronics and other purchases.',
  },
]

export const CATEGORY_IDS: CategoryId[] = CATEGORIES.map((category) => category.id)

export function getCategoryLabel(id: CategoryId): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id
}

/**
 * Sample monthly baseline in kg CO₂e per category.
 * Stands in for the user's tracked emissions until Personal Carbon Tracking exists.
 */
export const SAMPLE_BASELINE: CategoryAmounts = {
  transport: 220,
  food: 180,
  home: 150,
  goods: 100,
}

/**
 * Sample emissions "used so far" in the current month, in kg CO₂e.
 * Stands in for data that will come from Personal Carbon Tracking.
 */
export const SAMPLE_CURRENT_USAGE: CategoryAmounts = {
  transport: 128,
  food: 96,
  home: 74,
  goods: 61,
}

/** Day of the sample month that SAMPLE_CURRENT_USAGE represents. */
export const SAMPLE_DAY = { current: 18, total: 30 }

export const PRIORITIES: Priority[] = [
  {
    id: 'impact',
    label: 'Cut the most emissions',
    description: 'Prefer changes with the biggest carbon saving.',
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

/** Sample recommendations. Savings are illustrative, not calculated. */
export const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'bus-commute',
    categoryId: 'transport',
    title: 'Take the bus for two commutes a week',
    description: 'Swap two car journeys to university or work for public transport.',
    sampleSavingKg: 25,
    cost: 'better',
    time: 'worse',
    comfort: 'same',
    effort: 'low',
  },
  {
    id: 'cycle-short-trips',
    categoryId: 'transport',
    title: 'Walk or cycle trips under 3 km',
    description: 'Short errands are often as quick on foot or by bike.',
    sampleSavingKg: 15,
    cost: 'better',
    time: 'same',
    comfort: 'worse',
    effort: 'medium',
  },
  {
    id: 'plant-meals',
    categoryId: 'food',
    title: 'Two plant-based dinners a week',
    description: 'Replace red meat in two evening meals with plant-based dishes.',
    sampleSavingKg: 20,
    cost: 'better',
    time: 'same',
    comfort: 'same',
    effort: 'low',
  },
  {
    id: 'meal-planning',
    categoryId: 'food',
    title: 'Plan meals to cut food waste',
    description: 'Write a weekly shopping list and use up leftovers first.',
    sampleSavingKg: 10,
    cost: 'better',
    time: 'worse',
    comfort: 'same',
    effort: 'low',
  },
  {
    id: 'lower-heating',
    categoryId: 'home',
    title: 'Lower the heating by 1 °C',
    description: 'A small change to the thermostat that is easy to keep.',
    sampleSavingKg: 15,
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
    sampleSavingKg: 5,
    cost: 'better',
    time: 'same',
    comfort: 'same',
    effort: 'low',
  },
  {
    id: 'second-hand',
    categoryId: 'goods',
    title: 'Repair or buy second-hand first',
    description: 'Check repair options and second-hand shops before buying new.',
    sampleSavingKg: 15,
    cost: 'better',
    time: 'worse',
    comfort: 'same',
    effort: 'medium',
  },
  {
    id: 'pause-orders',
    categoryId: 'goods',
    title: 'Pause non-essential online orders',
    description: 'Try one month without impulse purchases and fast delivery.',
    sampleSavingKg: 10,
    cost: 'better',
    time: 'same',
    comfort: 'worse',
    effort: 'medium',
  },
]

export const REDUCTION_OPTIONS = [10, 15, 20, 25, 30] as const
export const DURATION_OPTIONS = [3, 6, 12] as const
