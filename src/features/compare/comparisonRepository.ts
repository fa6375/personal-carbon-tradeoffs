/**
 * Data-access layer for saved comparisons.
 *
 * Screens only talk to the ComparisonRepository interface. The app uses the
 * Cloud Firestore implementation (firestoreComparisonRepository.ts), obtained
 * with useComparisonRepository().
 *
 * The localStorage implementation below is what the app used before the
 * database existed. It is kept so comparisons saved that way can be read and
 * imported into the user's account. Nothing writes to it any more.
 */
import { isPriorityLevel } from './criteria'
import { isTransportOptionId } from './transportOptions'
import type { SavedComparison } from './types'

export interface ComparisonRepository {
  list(): Promise<SavedComparison[]>
  get(id: string): Promise<SavedComparison | undefined>
  create(comparison: Omit<SavedComparison, 'id' | 'savedAt'>): Promise<SavedComparison>
  remove(id: string): Promise<void>
}

export const STORAGE_KEY = 'carbon-choices.compare.comparisons.v1'

/** Short artificial delay so loading states are visible and the API is async like a real backend. */
const LATENCY_MS = 150

function wait() {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isSavedComparison(value: unknown): value is SavedComparison {
  if (!isRecord(value) || !isRecord(value.input)) return false
  const { input } = value
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.savedAt === 'string' &&
    isTransportOptionId(value.recommended) &&
    Array.isArray(value.options) &&
    Array.isArray(input.modes) &&
    input.modes.every(isTransportOptionId) &&
    isRecord(input.journey) &&
    typeof input.journey.distanceKm === 'number' &&
    typeof input.journey.passengers === 'number' &&
    isRecord(input.priorities) &&
    isPriorityLevel(input.priorities.emissions) &&
    isPriorityLevel(input.priorities.cost) &&
    isPriorityLevel(input.priorities.time)
  )
}

/** Comparisons saved in this browser before the database existed (used by the import). */
export function readLocalComparisons(): SavedComparison[] {
  return read()
}

function read(): SavedComparison[] {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    throw new Error('Browser storage is not available.')
  }
  if (!raw) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = null
  }
  if (!Array.isArray(parsed) || !parsed.every(isSavedComparison)) {
    throw new Error('Your saved comparisons could not be read. They may be damaged.')
  }
  return parsed
}

function write(comparisons: SavedComparison[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisons))
  } catch {
    throw new Error('The comparison could not be saved in this browser.')
  }
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const localComparisonRepository: ComparisonRepository = {
  async list() {
    await wait()
    return read().sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  },
  async get(id) {
    await wait()
    return read().find((comparison) => comparison.id === id)
  },
  async create(comparison) {
    await wait()
    const saved: SavedComparison = { ...comparison, id: newId(), savedAt: new Date().toISOString() }
    write([...read(), saved])
    return saved
  },
  async remove(id) {
    await wait()
    write(read().filter((comparison) => comparison.id !== id))
  },
}

/** Hash link that opens a saved comparison on the Compare page. */
export function savedComparisonHref(id: string): string {
  return `#/compare?saved=${encodeURIComponent(id)}`
}
