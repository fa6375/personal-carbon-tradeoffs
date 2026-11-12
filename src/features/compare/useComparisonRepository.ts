import { useMemo } from 'react'
import { getFirebase } from '../../lib/firebase'
import { useAuth } from '../auth/authContext'
import type { ComparisonRepository } from './comparisonRepository'
import { createFirestoreComparisonRepository } from './firestoreComparisonRepository'

/** The signed-in user's saved comparisons, or null when nobody is signed in. */
export function useComparisonRepository(): ComparisonRepository | null {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  return useMemo(() => {
    const firebase = getFirebase()
    return firebase && uid ? createFirestoreComparisonRepository(firebase.db, uid) : null
  }, [uid])
}
