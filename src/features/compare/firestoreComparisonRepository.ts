/**
 * Cloud Firestore implementation of ComparisonRepository.
 *
 * Saved comparisons are stored at users/{uid}/comparisons/{comparisonId}.
 * A saved comparison is never edited, so there is no update operation; the
 * user saves a new one instead.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocsFromServer,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
} from 'firebase/firestore'
import { toDataError, withTimeout } from '../../lib/dataErrors'
import { toIso } from '../../lib/firestoreValues'
import type { ComparisonRepository } from './comparisonRepository'
import type { SavedComparison } from './types'

function toSaved(snapshot: DocumentSnapshot<DocumentData>): SavedComparison {
  const data = snapshot.data({ serverTimestamps: 'estimate' }) ?? {}
  return {
    id: snapshot.id,
    name: String(data.name),
    savedAt: toIso(data.createdAt),
    input: data.input as SavedComparison['input'],
    options: data.options as SavedComparison['options'],
    recommended: data.recommended as SavedComparison['recommended'],
  }
}

export function comparisonToDocument(comparison: Omit<SavedComparison, 'id' | 'savedAt'>) {
  return {
    name: comparison.name.trim(),
    input: comparison.input,
    options: comparison.options.map(({ mode, emissionsKg, costEur, timeMinutes, overallScore }) => ({
      mode,
      emissionsKg,
      costEur,
      timeMinutes,
      overallScore,
    })),
    recommended: comparison.recommended,
  }
}

export function createFirestoreComparisonRepository(db: Firestore, uid: string): ComparisonRepository {
  const comparisons = collection(db, 'users', uid, 'comparisons')

  return {
    async list() {
      try {
        const snapshot = await withTimeout(getDocsFromServer(query(comparisons, orderBy('createdAt', 'desc'))))
        return snapshot.docs.map(toSaved)
      } catch (reason) {
        throw toDataError(reason)
      }
    },
    async get(id) {
      try {
        const snapshot = await withTimeout(getDocFromServer(doc(comparisons, id)))
        return snapshot.exists() ? toSaved(snapshot) : undefined
      } catch (reason) {
        throw toDataError(reason)
      }
    },
    async create(comparison) {
      try {
        const ref = await withTimeout(
          addDoc(comparisons, {
            ...comparisonToDocument(comparison),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
        )
        return { ...comparison, id: ref.id, savedAt: new Date().toISOString() }
      } catch (reason) {
        throw toDataError(reason)
      }
    },
    async remove(id) {
      try {
        await withTimeout(deleteDoc(doc(comparisons, id)))
      } catch (reason) {
        throw toDataError(reason)
      }
    },
  }
}
