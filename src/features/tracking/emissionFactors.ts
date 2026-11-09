/**
 * ILLUSTRATIVE emission factors for Personal Carbon Tracking.
 *
 * These are rounded, typical values of the kind published in public
 * emission-factor tables (for example national greenhouse-gas reporting
 * factors). They are NOT taken from a verified dataset for Croatia or any
 * specific provider and must be replaced when the team connects an
 * emission-factor API or dataset. The interface labels every result as an
 * estimate based on illustrative factors.
 *
 * Method (the same everywhere in the feature):
 *   transport:   distanceKm × factor(mode) ÷ passengers   (passengers only for car/motorbike)
 *   food:        servings × factor(item)
 *   home energy: kWh × factor(source) ÷ householdSize
 */
import type {
  ActivityCategory,
  ActivityDetails,
  EnergySource,
  FoodItem,
  TransportMode,
} from './types'

interface Factor<T extends string> {
  id: T
  label: string
  /** kg CO₂e per unit. */
  kgPerUnit: number
}

/** kg CO₂e per kilometre, per vehicle for cars/motorbikes, per passenger otherwise. */
export const TRANSPORT_FACTORS: Factor<TransportMode>[] = [
  { id: 'car-petrol', label: 'Car (petrol)', kgPerUnit: 0.17 },
  { id: 'car-diesel', label: 'Car (diesel)', kgPerUnit: 0.17 },
  { id: 'car-electric', label: 'Car (electric)', kgPerUnit: 0.05 },
  { id: 'motorbike', label: 'Motorbike', kgPerUnit: 0.11 },
  { id: 'bus', label: 'Bus', kgPerUnit: 0.1 },
  { id: 'tram', label: 'Tram', kgPerUnit: 0.03 },
  { id: 'train', label: 'Train', kgPerUnit: 0.035 },
  { id: 'flight', label: 'Flight (short haul)', kgPerUnit: 0.25 },
  { id: 'bicycle', label: 'Bicycle', kgPerUnit: 0 },
  { id: 'walk', label: 'Walking', kgPerUnit: 0 },
]

/** kg CO₂e per serving. */
export const FOOD_FACTORS: Factor<FoodItem>[] = [
  { id: 'beef', label: 'Beef', kgPerUnit: 7 },
  { id: 'lamb', label: 'Lamb', kgPerUnit: 5 },
  { id: 'pork', label: 'Pork', kgPerUnit: 1.7 },
  { id: 'chicken', label: 'Chicken', kgPerUnit: 1.4 },
  { id: 'fish', label: 'Fish', kgPerUnit: 1.3 },
  { id: 'cheese', label: 'Cheese', kgPerUnit: 1 },
  { id: 'eggs', label: 'Eggs', kgPerUnit: 0.5 },
  { id: 'vegetarian', label: 'Vegetarian meal', kgPerUnit: 0.6 },
  { id: 'vegan', label: 'Vegan meal', kgPerUnit: 0.4 },
]

/** kg CO₂e per kWh. */
export const ENERGY_FACTORS: Factor<EnergySource>[] = [
  { id: 'electricity', label: 'Electricity', kgPerUnit: 0.25 },
  { id: 'natural-gas', label: 'Natural gas', kgPerUnit: 0.18 },
  { id: 'heating-oil', label: 'Heating oil', kgPerUnit: 0.25 },
  { id: 'lpg', label: 'LPG', kgPerUnit: 0.21 },
  { id: 'district-heating', label: 'District heating', kgPerUnit: 0.17 },
]

/** Modes where the vehicle's emissions are shared between passengers. */
export const SHARED_VEHICLE_MODES: TransportMode[] = [
  'car-petrol',
  'car-diesel',
  'car-electric',
  'motorbike',
]

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  transport: 'Transport',
  food: 'Food',
  home: 'Home energy',
}

export const CATEGORIES: ActivityCategory[] = ['transport', 'food', 'home']

function find<T extends string>(list: Factor<T>[], id: T): Factor<T> {
  const factor = list.find((entry) => entry.id === id)
  if (!factor) throw new Error(`Unknown emission factor: ${id}`)
  return factor
}

export function transportFactor(mode: TransportMode) {
  return find(TRANSPORT_FACTORS, mode)
}
export function foodFactor(item: FoodItem) {
  return find(FOOD_FACTORS, item)
}
export function energyFactor(source: EnergySource) {
  return find(ENERGY_FACTORS, source)
}

/** Estimated emissions of one activity, in kg CO₂e. */
export function calculateEmissions(details: ActivityDetails): number {
  switch (details.category) {
    case 'transport': {
      const sharers = SHARED_VEHICLE_MODES.includes(details.mode)
        ? Math.max(1, details.passengers)
        : 1
      return (details.distanceKm * transportFactor(details.mode).kgPerUnit) / sharers
    }
    case 'food':
      return details.servings * foodFactor(details.item).kgPerUnit
    case 'home':
      return (
        (details.kwh * energyFactor(details.source).kgPerUnit) /
        Math.max(1, details.householdSize)
      )
  }
}

/** Short human-readable name of what was done, e.g. "Bus · 12 km". */
export function describeActivity(details: ActivityDetails): string {
  switch (details.category) {
    case 'transport':
      return transportFactor(details.mode).label
    case 'food':
      return foodFactor(details.item).label
    case 'home':
      return energyFactor(details.source).label
  }
}
