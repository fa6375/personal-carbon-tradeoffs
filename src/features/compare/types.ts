/** Types for Compare Everyday Choices (Faraj Aliyev). */
import type { MessageKey, MessageParams } from '../../i18n'

/** The transport alternatives a journey can be compared across. */
export type TransportOptionId = 'walk' | 'bicycle' | 'bus' | 'train' | 'car' | 'electric-car'

/** The three criteria every option is compared on. */
export type Criterion = 'emissions' | 'cost' | 'time'

/** 0 = does not matter, 3 = matters most. */
export type PriorityLevel = 0 | 1 | 2 | 3

export type Priorities = Record<Criterion, PriorityLevel>

/** What the user tells us about the trip. */
export interface Journey {
  from: string
  to: string
  /** One-way distance entered by the user. There is no route service, so it is never calculated. */
  distanceKm: number
  /** People travelling together, including the user. */
  passengers: number
}

/** Everything needed to calculate a comparison. */
export interface ComparisonInput {
  modes: TransportOptionId[]
  journey: Journey
  priorities: Priorities
}

/** Per-person result for one transport option. */
export interface OptionResult {
  mode: TransportOptionId
  /** kg CO₂e per person. */
  emissionsKg: number
  /** Euros per person. */
  costEur: number
  /** Door-to-door minutes. */
  timeMinutes: number
  /** 0–1 per criterion: 1 = best of the compared options, 0 = worst. */
  scores: Record<Criterion, number>
  /** 0–1 weighted by the user's priorities. */
  overallScore: number
}

export interface ComparisonResult {
  input: ComparisonInput
  /** Same order as input.modes. */
  options: OptionResult[]
  /** Best option for each criterion (ties go to the first in input order). */
  bestBy: Record<Criterion, TransportOptionId>
  recommended: TransportOptionId
}

/** A comparison stored by the user. */
export interface SavedComparison {
  id: string
  name: string
  /** ISO timestamp. */
  savedAt: string
  input: ComparisonInput
  /** Snapshot of the results at the time of saving. */
  options: Pick<OptionResult, 'mode' | 'emissionsKg' | 'costEur' | 'timeMinutes' | 'overallScore'>[]
  recommended: TransportOptionId
}

/** The screens inside the Compare page. */
export type CompareView =
  | { name: 'start' }
  | { name: 'transport' }
  | { name: 'journey' }
  | { name: 'priorities' }
  | { name: 'results' }
  | { name: 'breakdown' }
  | { name: 'recommendation' }
  | { name: 'scenario' }
  | { name: 'save' }
  | { name: 'error'; problem: CompareProblem }

/** Why the error screen is shown. */
export interface CompareProblem {
  kind: 'invalid-input' | 'missing-information' | 'calculation-failed' | 'not-found' | 'storage'
  /** English fallback text. */
  message: string
  /** Translation key and parameters for the text shown to people. */
  messageKey?: MessageKey
  messageParams?: MessageParams
}
