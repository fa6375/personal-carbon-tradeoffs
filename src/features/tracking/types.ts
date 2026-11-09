/** Types for the Personal Carbon Tracking feature. */

export type ActivityCategory = 'transport' | 'food' | 'home'

export type TransportMode =
  | 'car-petrol'
  | 'car-diesel'
  | 'car-electric'
  | 'motorbike'
  | 'bus'
  | 'tram'
  | 'train'
  | 'flight'
  | 'bicycle'
  | 'walk'

export type FoodItem =
  | 'beef'
  | 'lamb'
  | 'pork'
  | 'chicken'
  | 'fish'
  | 'cheese'
  | 'eggs'
  | 'vegetarian'
  | 'vegan'

export type EnergySource = 'electricity' | 'natural-gas' | 'heating-oil' | 'lpg' | 'district-heating'

export interface TransportDetails {
  category: 'transport'
  mode: TransportMode
  /** Distance travelled, in kilometres. */
  distanceKm: number
  /** People sharing the vehicle (cars and motorbikes only). Minimum 1. */
  passengers: number
}

export interface FoodDetails {
  category: 'food'
  item: FoodItem
  /** Number of servings eaten. */
  servings: number
}

export interface HomeEnergyDetails {
  category: 'home'
  source: EnergySource
  /** Energy used, in kilowatt-hours. */
  kwh: number
  /** People in the household; the result is the user's share. Minimum 1. */
  householdSize: number
}

export type ActivityDetails = TransportDetails | FoodDetails | HomeEnergyDetails

export interface Activity {
  id: string
  /** Day the activity happened, "YYYY-MM-DD" in the user's local time. */
  date: string
  /** Optional free-text note, e.g. "Trip to campus". */
  note: string
  details: ActivityDetails
  /** ISO timestamps (UTC). */
  createdAt: string
  updatedAt: string
}

/** Data the user enters; the repository adds id and timestamps. */
export type ActivityInput = Pick<Activity, 'date' | 'note' | 'details'>

/** The screens inside the tracking page. */
export type TrackingView =
  | { name: 'dashboard' }
  | { name: 'add' }
  | { name: 'entry'; category: ActivityCategory }
  | { name: 'history' }
  | { name: 'details'; id: string }
  | { name: 'edit'; id: string }
  | { name: 'breakdown' }

export type PeriodId = '7d' | '30d' | 'month' | 'all'
