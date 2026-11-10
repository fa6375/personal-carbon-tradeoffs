/**
 * Transport options and their ILLUSTRATIVE factors for Compare Everyday Choices.
 *
 * Nothing here is real-time or route-specific. There is no route, fare or
 * traffic service connected, so every figure is a rounded, typical value
 * chosen to make the trade-offs visible. They must be replaced when the team
 * connects an emission-factor or transport API.
 *
 * Units and method (all results are PER PERSON):
 *
 *   CO₂ (kg CO₂e)  = distance (km) × emission factor (kg CO₂e/km)
 *                    ÷ people sharing the vehicle (car and electric car only)
 *     The emission factors are NOT defined here: they are read from the
 *     Personal Carbon Tracking feature (src/features/tracking/emissionFactors.ts)
 *     so both features give the same answer for the same trip.
 *
 *   Cost (EUR)     = fixed cost + distance × cost per km
 *                    ÷ people sharing the vehicle (car and electric car only)
 *     Public transport: one ticket each (fixed fare plus a distance-based part).
 *     Cars: energy cost only (fuel or charging), plus parking. Purchase,
 *     insurance and wear are left out, which makes cars look cheaper than
 *     their full cost; this is explained in the interface.
 *
 *   Time (minutes) = distance ÷ average speed × 60 + fixed overhead
 *     The overhead covers walking to a stop and waiting (public transport),
 *     unlocking and locking a bike, or finding a parking space.
 */
import type { IconName } from '../../types/icons'
import { transportFactor } from '../tracking/emissionFactors'
import type { TransportMode } from '../tracking/types'
import type { TransportOptionId } from './types'

export interface TransportOption {
  id: TransportOptionId
  label: string
  icon: IconName
  description: string
  /** The matching mode in the Tracking feature, used for its emission factor. */
  trackingMode: TransportMode
  /** Whether emissions and cost are shared between the people travelling together. */
  sharedVehicle: boolean
  /** EUR per trip (per ticket for public transport, per vehicle for parking). */
  fixedCostEur: number
  /** EUR per km (per ticket for public transport, per vehicle for cars). */
  costPerKmEur: number
  /** Average moving speed, km/h. */
  speedKmh: number
  /** Minutes added to every trip. */
  overheadMinutes: number
  /** Distances above this are flagged as unrealistic for the mode (still calculated). */
  practicalMaxKm?: number
  /** Plain-language assumptions shown on the breakdown screen. */
  assumptions: string
}

export const TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: 'walk',
    label: 'Walking',
    icon: 'walk',
    description: 'No emissions or cost, but the slowest.',
    trackingMode: 'walk',
    sharedVehicle: false,
    fixedCostEur: 0,
    costPerKmEur: 0,
    speedKmh: 5,
    overheadMinutes: 0,
    practicalMaxKm: 8,
    assumptions: 'Walking at 5 km/h. No direct emissions and no cost.',
  },
  {
    id: 'bicycle',
    label: 'Cycling',
    icon: 'bicycle',
    description: 'No emissions, quick for short trips.',
    trackingMode: 'bicycle',
    sharedVehicle: false,
    fixedCostEur: 0,
    costPerKmEur: 0,
    speedKmh: 15,
    overheadMinutes: 3,
    practicalMaxKm: 25,
    assumptions:
      'Cycling at 15 km/h plus 3 minutes to unlock and lock the bike. Own bike, so no cost per trip.',
  },
  {
    id: 'bus',
    label: 'Bus',
    icon: 'bus',
    description: 'Shared transport with a fixed fare.',
    trackingMode: 'bus',
    sharedVehicle: false,
    fixedCostEur: 1.5,
    costPerKmEur: 0.05,
    speedKmh: 20,
    overheadMinutes: 10,
    assumptions:
      'Average 20 km/h including stops, plus 10 minutes to walk to the stop and wait. Ticket: €1.50 plus €0.05 per km, for each person.',
  },
  {
    id: 'train',
    label: 'Train',
    icon: 'train',
    description: 'Low emissions, best over longer distances.',
    trackingMode: 'train',
    sharedVehicle: false,
    fixedCostEur: 1,
    costPerKmEur: 0.08,
    speedKmh: 60,
    overheadMinutes: 20,
    assumptions:
      'Average 60 km/h including stops, plus 20 minutes to reach the station and wait. Ticket: €1.00 plus €0.08 per km, for each person.',
  },
  {
    id: 'car',
    label: 'Car',
    icon: 'car',
    description: 'Petrol car. Emissions and cost are shared by everyone in it.',
    trackingMode: 'car-petrol',
    sharedVehicle: true,
    fixedCostEur: 2,
    costPerKmEur: 0.12,
    speedKmh: 40,
    overheadMinutes: 5,
    assumptions:
      'Average 40 km/h including traffic, plus 5 minutes to park. Fuel: €0.12 per km, parking: €2.00 per trip, shared by everyone in the car.',
  },
  {
    id: 'electric-car',
    label: 'Electric car',
    icon: 'bolt',
    description: 'Lower emissions than petrol, shared by everyone in it.',
    trackingMode: 'car-electric',
    sharedVehicle: true,
    fixedCostEur: 2,
    costPerKmEur: 0.05,
    speedKmh: 40,
    overheadMinutes: 5,
    assumptions:
      'Average 40 km/h including traffic, plus 5 minutes to park. Charging: €0.05 per km, parking: €2.00 per trip, shared by everyone in the car. Emissions depend on how the electricity is produced.',
  },
]

export const TRANSPORT_OPTION_IDS: TransportOptionId[] = TRANSPORT_OPTIONS.map((option) => option.id)

export function getTransportOption(id: TransportOptionId): TransportOption {
  const option = TRANSPORT_OPTIONS.find((entry) => entry.id === id)
  if (!option) throw new Error(`Unknown transport option: ${id}`)
  return option
}

/** kg CO₂e per km for the option (per vehicle for cars, per passenger otherwise). */
export function emissionFactorFor(id: TransportOptionId): number {
  return transportFactor(getTransportOption(id).trackingMode).kgPerUnit
}

export function isTransportOptionId(value: unknown): value is TransportOptionId {
  return typeof value === 'string' && (TRANSPORT_OPTION_IDS as string[]).includes(value)
}
