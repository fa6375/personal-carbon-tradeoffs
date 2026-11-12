import { useCallback, useEffect, useMemo, useState } from 'react'
import { DataError } from '../../lib/dataErrors'
import { getFirebase } from '../../lib/firebase'
import { useAuth } from '../auth/authContext'
import { createFirestoreActivityRepository } from './firestoreActivityRepository'
import type { Activity, ActivityInput } from './types'

export type LoadStatus = 'loading' | 'ready' | 'error'

export interface ActivitiesState {
  status: LoadStatus
  activities: Activity[]
  error: string | null
  reload: () => void
  create: (input: ActivityInput) => Promise<Activity>
  update: (id: string, input: ActivityInput) => Promise<Activity>
  remove: (id: string) => Promise<void>
}

/** How long to wait for the first answer from the database before showing an error. */
const FIRST_LOAD_TIMEOUT_MS = 15000

interface Loaded {
  /** Which user and attempt this result belongs to. */
  key: string
  status: 'ready' | 'error'
  activities: Activity[]
  error: string | null
}

/**
 * Loads the signed-in user's activities from Cloud Firestore and keeps them
 * up to date. The live listener also picks up changes made in other tabs or
 * on other devices (this replaces the earlier localStorage "storage" event).
 */
export function useActivities(): ActivitiesState {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const key = `${uid}:${attempt}`

  const repository = useMemo(() => {
    const firebase = getFirebase()
    return firebase && uid ? createFirestoreActivityRepository(firebase.db, uid) : null
  }, [uid])

  useEffect(() => {
    if (!repository) return
    // Until the server has answered once, a cached (possibly empty) list could
    // wrongly say "no activities", so it is not shown.
    let confirmed = false
    const timer = setTimeout(() => {
      if (!confirmed) setLoaded({ key, status: 'error', activities: [], error: new DataError('unavailable').message })
    }, FIRST_LOAD_TIMEOUT_MS)
    const unsubscribe = repository.subscribe(
      (activities, fromServer) => {
        if (fromServer) confirmed = true
        // Once confirmed, keep showing the list while offline (the cache is up to date).
        if (confirmed) setLoaded({ key, status: 'ready', activities, error: null })
      },
      (error) => {
        confirmed = true
        // Keep what was already shown; just report the problem.
        setLoaded((previous) => ({
          key,
          status: 'error',
          activities: previous?.key === key ? previous.activities : [],
          error: error.message,
        }))
      },
    )
    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [repository, key])

  const reload = useCallback(() => setAttempt((count) => count + 1), [])

  const requireRepository = useCallback(() => {
    if (!repository) throw new DataError(getFirebase() ? 'not-signed-in' : 'not-configured')
    return repository
  }, [repository])

  const create = useCallback((input: ActivityInput) => requireRepository().create(input), [requireRepository])
  const update = useCallback(
    (id: string, input: ActivityInput) => requireRepository().update(id, input),
    [requireRepository],
  )
  const remove = useCallback((id: string) => requireRepository().remove(id), [requireRepository])

  if (!repository) {
    const code = getFirebase() ? 'not-signed-in' : 'not-configured'
    return { status: 'error', activities: [], error: new DataError(code).message, reload, create, update, remove }
  }

  const current = loaded?.key === key ? loaded : null
  return {
    status: current?.status ?? 'loading',
    activities: current?.activities ?? [],
    error: current?.error ?? null,
    reload,
    create,
    update,
    remove,
  }
}
