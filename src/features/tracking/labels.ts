/**
 * Translated names for Tracking categories, modes, foods and energy sources.
 * The emission factors themselves stay in emissionFactors.ts; only the names
 * shown to people are translated here.
 */
import { t } from '../../i18n'
import type { ActivityCategory, ActivityDetails, EnergySource, FoodItem, TransportMode } from './types'

export function categoryLabel(category: ActivityCategory): string {
  return t(`tracking.categories.${category}`)
}

/** Lower-case category for use inside a sentence ("Edit food activity"). */
export function categoryLabelLower(category: ActivityCategory): string {
  return t(`tracking.categoriesLower.${category}`)
}

export function modeLabel(mode: TransportMode): string {
  return t(`tracking.modes.${mode}`)
}

export function foodLabel(item: FoodItem): string {
  return t(`tracking.foods.${item}`)
}

export function energyLabel(source: EnergySource): string {
  return t(`tracking.energy.${source}`)
}

/** Translated name of a source id from stats.totalsBySource (a mode, food or energy source). */
export function sourceLabel(category: ActivityCategory, source: string): string {
  if (category === 'transport') return modeLabel(source as TransportMode)
  if (category === 'food') return foodLabel(source as FoodItem)
  return energyLabel(source as EnergySource)
}

/** Translated short name of what was done, e.g. "Bus" or "Vegan meal". */
export function describeActivityLocalized(details: ActivityDetails): string {
  switch (details.category) {
    case 'transport':
      return modeLabel(details.mode)
    case 'food':
      return foodLabel(details.item)
    case 'home':
      return energyLabel(details.source)
  }
}
