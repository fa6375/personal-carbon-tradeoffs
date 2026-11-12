/**
 * Cloud Firestore implementation of ActivityRepository.
 *
 * Activities are stored at users/{uid}/activities/{activityId}. Only the
 * owner can read or write them (see firestore.rules). Timestamps are
 * Firestore server timestamps (UTC) and are returned to the screens as ISO
 * strings, so the screens and calculations are unchanged.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocsFromServer,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type Firestore,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { DataError, toDataError, withTimeout } from '../../lib/dataErrors'
import { toIso, withoutUndefined } from '../../lib/firestoreValues'
import type { ActivityRepository } from './activityRepository'
import type { Activity, ActivityDetails, ActivityInput } from './types'

export interface LiveActivityRepository extends ActivityRepository {
  /**
   * Calls onChange with the full list now and after every change (also from
   * other tabs and devices). `fromServer` is false while the list only comes
   * from the local cache, e.g. when offline.
   */
  subscribe(
    onChange: (activities: Activity[], fromServer: boolean) => void,
    onError: (error: DataError) => void,
  ): () => void
}

function activitiesPath(uid: string) {
  return ['users', uid, 'activities'] as const
}

function cleanDetails(details: ActivityDetails): ActivityDetails {
  // Store only the fields that belong to the category.
  switch (details.category) {
    case 'transport':
      return { category: 'transport', mode: details.mode, distanceKm: details.distanceKm, passengers: details.passengers }
    case 'food':
      return { category: 'food', item: details.item, servings: details.servings }
    case 'home':
      return { category: 'home', source: details.source, kwh: details.kwh, householdSize: details.householdSize }
  }
}

function toActivity(snapshot: DocumentSnapshot<DocumentData>): Activity {
  const data = snapshot.data({ serverTimestamps: 'estimate' }) ?? {}
  return {
    id: snapshot.id,
    date: String(data.date),
    note: typeof data.note === 'string' ? data.note : '',
    details: data.details as ActivityDetails,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  }
}

export function inputToDocument(input: ActivityInput) {
  return withoutUndefined({
    date: input.date,
    note: input.note.trim(),
    details: cleanDetails(input.details),
  })
}

export function createFirestoreActivityRepository(db: Firestore, uid: string): LiveActivityRepository {
  const activities = collection(db, ...activitiesPath(uid))
  const ordered = query(activities, orderBy('date', 'desc'))

  return {
    async list() {
      try {
        const snapshot = await withTimeout(getDocsFromServer(ordered))
        return snapshot.docs.map(toActivity)
      } catch (reason) {
        throw toDataError(reason)
      }
    },

    async get(id) {
      try {
        const snapshot = await withTimeout(getDocFromServer(doc(activities, id)))
        return snapshot.exists() ? toActivity(snapshot) : undefined
      } catch (reason) {
        throw toDataError(reason)
      }
    },

    async create(input) {
      try {
        const ref = await withTimeout(
          addDoc(activities, { ...inputToDocument(input), createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
        )
        const now = new Date().toISOString()
        return { ...input, id: ref.id, createdAt: now, updatedAt: now }
      } catch (reason) {
        throw toDataError(reason)
      }
    },

    async update(id, input) {
      const ref = doc(activities, id)
      try {
        const existing = await withTimeout(getDocFromServer(ref))
        if (!existing.exists()) throw new DataError('not-found')
        await withTimeout(updateDoc(ref, { ...inputToDocument(input), updatedAt: serverTimestamp() }))
        const createdAt = toIso(existing.data().createdAt)
        return { ...input, id, createdAt, updatedAt: new Date().toISOString() }
      } catch (reason) {
        throw toDataError(reason)
      }
    },

    async remove(id) {
      try {
        await withTimeout(deleteDoc(doc(activities, id)))
      } catch (reason) {
        throw toDataError(reason)
      }
    },

    subscribe(onChange, onError) {
      return onSnapshot(
        ordered,
        { includeMetadataChanges: true },
        (snapshot) => onChange(snapshot.docs.map(toActivity), !snapshot.metadata.fromCache),
        (reason) => onError(toDataError(reason)),
      )
    },
  }
}
