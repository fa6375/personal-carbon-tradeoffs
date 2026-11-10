import { useCallback, useEffect, useState } from 'react'
import { comparisonRepository } from './comparisonRepository'
import type { SavedComparison } from './types'

export type LoadStatus = 'loading' | 'ready' | 'error'

/** Loads saved comparisons through the repository and keeps the list in sync after deletes. */
export function useSavedComparisons() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [comparisons, setComparisons] = useState<SavedComparison[]>([])
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    comparisonRepository
      .list()
      .then((list) => {
        if (cancelled) return
        setComparisons(list)
        setStatus('ready')
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(reason instanceof Error ? reason.message : 'Saved comparisons could not be loaded.')
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

  const remove = useCallback(async (id: string) => {
    await comparisonRepository.remove(id)
    setComparisons((list) => list.filter((comparison) => comparison.id !== id))
  }, [])

  return { status, comparisons, error, reload, remove }
}
