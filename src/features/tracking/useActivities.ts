import { useCallback, useEffect, useState } from 'react'
import { activityRepository } from './activityRepository'
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

/** Loads activities through the repository and keeps the list in sync after changes. */
export function useActivities(): ActivitiesState {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [activities, setActivities] = useState<Activity[]>([])
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    activityRepository
      .list()
      .then((list) => {
        if (cancelled) return
        setActivities(list)
        setStatus('ready')
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(reason instanceof Error ? reason.message : 'Activities could not be loaded.')
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const reload = useCallback(() => {
    setStatus('loading')
    setError(null)
    setAttempt((count) => count + 1)
  }, [])

  const create = useCallback(async (input: ActivityInput) => {
    const created = await activityRepository.create(input)
    setActivities((list) => [...list, created])
    return created
  }, [])

  const update = useCallback(async (id: string, input: ActivityInput) => {
    const updated = await activityRepository.update(id, input)
    setActivities((list) => list.map((activity) => (activity.id === id ? updated : activity)))
    return updated
  }, [])

  const remove = useCallback(async (id: string) => {
    await activityRepository.remove(id)
    setActivities((list) => list.filter((activity) => activity.id !== id))
  }, [])

  return { status, activities, error, reload, create, update, remove }
}
