/**
 * One-time import of data saved in this browser (localStorage) before the
 * app used Cloud Firestore.
 *
 * - Only the user's explicit action starts an import.
 * - Each local record keeps its id as the Firestore document id, and records
 *   that already exist in the account are skipped, so importing twice never
 *   creates duplicates.
 * - Local data is never deleted or changed. A marker per user remembers that
 *   the import was done, so the offer is not shown again.
 */
import { collection, doc, getDocsFromServer, writeBatch, type Firestore } from 'firebase/firestore'
import { DataError, toDataError, withTimeout } from '../../lib/dataErrors'
import { fromIso } from '../../lib/firestoreValues'
import { readLocalComparisons } from '../compare/comparisonRepository'
import { comparisonToDocument } from '../compare/firestoreComparisonRepository'
import type { SavedComparison } from '../compare/types'
import { readLocalActivities } from '../tracking/activityRepository'
import { inputToDocument } from '../tracking/firestoreActivityRepository'
import type { Activity } from '../tracking/types'

export interface LocalData {
  activities: Activity[]
  comparisons: SavedComparison[]
  /** Set when one of the local lists could not be read. */
  problem: 'local-storage-unavailable' | 'local-data-damaged' | null
}

export interface ImportResult {
  activitiesImported: number
  activitiesSkipped: number
  comparisonsImported: number
  comparisonsSkipped: number
  importedAt: string
}

const MARKER_PREFIX = 'carbon-choices.import.v1:'
/** Firestore allows at most 500 writes per batch. */
const BATCH_LIMIT = 450

function readSafely<T>(read: () => T[]): { items: T[]; problem: LocalData['problem'] } {
  try {
    return { items: read(), problem: null }
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : ''
    return {
      items: [],
      problem: message.includes('not available') ? 'local-storage-unavailable' : 'local-data-damaged',
    }
  }
}

export function readLocalData(): LocalData {
  const activities = readSafely(readLocalActivities)
  const comparisons = readSafely(readLocalComparisons)
  return {
    activities: activities.items,
    comparisons: comparisons.items,
    problem: activities.problem ?? comparisons.problem,
  }
}

export function getImportMarker(uid: string): ImportResult | null {
  try {
    const raw = window.localStorage.getItem(MARKER_PREFIX + uid)
    return raw ? (JSON.parse(raw) as ImportResult) : null
  } catch {
    return null
  }
}

function setImportMarker(uid: string, result: ImportResult) {
  try {
    window.localStorage.setItem(MARKER_PREFIX + uid, JSON.stringify(result))
  } catch {
    // The import itself succeeded; without the marker the offer is shown again,
    // and a second import skips everything that already exists.
  }
}

/** Local ids are UUIDs; anything else is made safe for use as a document id. */
export function toDocumentId(id: string): string {
  const safe = id.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 120)
  return safe || 'imported'
}

export async function importLocalData(db: Firestore, uid: string, data: LocalData): Promise<ImportResult> {
  if (!uid) throw new DataError('not-signed-in')
  const activities = collection(db, 'users', uid, 'activities')
  const comparisons = collection(db, 'users', uid, 'comparisons')

  try {
    const [existingActivities, existingComparisons] = await Promise.all([
      withTimeout(getDocsFromServer(activities)),
      withTimeout(getDocsFromServer(comparisons)),
    ])
    const activityIds = new Set(existingActivities.docs.map((snapshot) => snapshot.id))
    const comparisonIds = new Set(existingComparisons.docs.map((snapshot) => snapshot.id))

    const writes: { ref: ReturnType<typeof doc>; value: Record<string, unknown> }[] = []
    let activitiesSkipped = 0
    let comparisonsSkipped = 0

    for (const activity of data.activities) {
      const id = toDocumentId(activity.id)
      if (activityIds.has(id)) {
        activitiesSkipped++
        continue
      }
      activityIds.add(id)
      writes.push({
        ref: doc(activities, id),
        value: {
          ...inputToDocument(activity),
          createdAt: fromIso(activity.createdAt),
          updatedAt: fromIso(activity.updatedAt),
          importedFrom: 'localStorage',
        },
      })
    }

    for (const comparison of data.comparisons) {
      const id = toDocumentId(comparison.id)
      if (comparisonIds.has(id)) {
        comparisonsSkipped++
        continue
      }
      comparisonIds.add(id)
      writes.push({
        ref: doc(comparisons, id),
        value: {
          ...comparisonToDocument(comparison),
          createdAt: fromIso(comparison.savedAt),
          updatedAt: fromIso(comparison.savedAt),
          importedFrom: 'localStorage',
        },
      })
    }

    for (let start = 0; start < writes.length; start += BATCH_LIMIT) {
      const batch = writeBatch(db)
      for (const write of writes.slice(start, start + BATCH_LIMIT)) batch.set(write.ref, write.value)
      await withTimeout(batch.commit(), 30000)
    }

    const result: ImportResult = {
      activitiesImported: data.activities.length - activitiesSkipped,
      activitiesSkipped,
      comparisonsImported: data.comparisons.length - comparisonsSkipped,
      comparisonsSkipped,
      importedAt: new Date().toISOString(),
    }
    setImportMarker(uid, result)
    return result
  } catch (reason) {
    throw toDataError(reason)
  }
}
