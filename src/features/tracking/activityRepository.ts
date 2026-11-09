/**
 * Data-access layer for tracked activities.
 *
 * Screens only talk to the ActivityRepository interface. The current
 * implementation is TEMPORARY: it keeps activities in this browser's
 * localStorage, so data survives a page reload on the same device but is not
 * stored in the project database required by Deliverable 2 (the project has
 * no database yet). When the shared backend exists, add an API-backed
 * implementation of this interface and swap it in `activityRepository` below;
 * the screens do not need to change.
 */
import type { Activity, ActivityInput } from './types'

export interface ActivityRepository {
  list(): Promise<Activity[]>
  get(id: string): Promise<Activity | undefined>
  create(input: ActivityInput): Promise<Activity>
  update(id: string, input: ActivityInput): Promise<Activity>
  remove(id: string): Promise<void>
}

const STORAGE_KEY = 'carbon-choices.tracking.activities.v1'

/** Short artificial delay so loading states are visible and the API is async like a real backend. */
const LATENCY_MS = 150

function wait() {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
}

function isActivity(value: unknown): value is Activity {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<Activity>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.details === 'object' &&
    candidate.details !== null &&
    ['transport', 'food', 'home'].includes(candidate.details.category)
  )
}

function read(): Activity[] {
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
  if (!Array.isArray(parsed) || !parsed.every(isActivity)) {
    throw new Error('Your saved activities could not be read. They may be damaged.')
  }
  return parsed
}

function write(activities: Activity[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activities))
  } catch {
    throw new Error('Activities could not be saved in this browser.')
  }
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const localActivityRepository: ActivityRepository = {
  async list() {
    await wait()
    return read()
  },
  async get(id) {
    await wait()
    return read().find((activity) => activity.id === id)
  },
  async create(input) {
    await wait()
    const now = new Date().toISOString()
    const activity: Activity = { ...input, id: newId(), createdAt: now, updatedAt: now }
    write([...read(), activity])
    return activity
  },
  async update(id, input) {
    await wait()
    const activities = read()
    const existing = activities.find((activity) => activity.id === id)
    if (!existing) throw new Error('This activity no longer exists.')
    const updated: Activity = { ...existing, ...input, updatedAt: new Date().toISOString() }
    write(activities.map((activity) => (activity.id === id ? updated : activity)))
    return updated
  },
  async remove(id) {
    await wait()
    write(read().filter((activity) => activity.id !== id))
  },
}

/** The repository the feature uses. Replace with an API implementation later. */
export const activityRepository: ActivityRepository = localActivityRepository
