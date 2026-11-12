/** Small helpers shared by the Firestore repositories. */
import { Timestamp } from 'firebase/firestore'

/** Firestore Timestamp (or a pending server timestamp) to an ISO string in UTC. */
export function toIso(value: unknown, fallback = new Date()): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return fallback.toISOString()
}

/** ISO string to a Firestore Timestamp, used when importing records that already have dates. */
export function fromIso(iso: string | undefined): Timestamp {
  const date = iso ? new Date(iso) : new Date()
  return Timestamp.fromDate(Number.isNaN(date.getTime()) ? new Date() : date)
}

/** Firestore rejects `undefined`, so copy only defined fields. */
export function withoutUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T
}
