import { useCallback, useEffect, useState } from 'react'
import { DataError, type DataErrorCode } from '../../lib/dataErrors'
import { dataErrorCode } from '../../lib/errorMessages'
import type { SavedComparison } from './types'
import { useComparisonRepository } from './useComparisonRepository'

export type LoadStatus = 'loading' | 'ready' | 'error'

interface Loaded {
  key: number
  status: 'ready' | 'error'
  comparisons: SavedComparison[]
  /** Error code; shown with dataErrorText() so it follows the language. */
  error: DataErrorCode | null
}

/** Loads the signed-in user's saved comparisons and keeps the list in sync after deletes. */
export function useSavedComparisons() {
  const repository = useComparisonRepository()
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (!repository) return
    let cancelled = false
    repository
      .list()
      .then((comparisons) => {
        if (!cancelled) setLoaded({ key: attempt, status: 'ready', comparisons, error: null })
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setLoaded({ key: attempt, status: 'error', comparisons: [], error: dataErrorCode(reason) })
      })
    return () => {
      cancelled = true
    }
  }, [repository, attempt])

  const reload = useCallback(() => setAttempt((count) => count + 1), [])

  const remove = useCallback(
    async (id: string) => {
      if (!repository) throw new DataError('not-signed-in')
      await repository.remove(id)
      setLoaded((current) =>
        current ? { ...current, comparisons: current.comparisons.filter((comparison) => comparison.id !== id) } : current,
      )
    },
    [repository],
  )

  const current = repository && loaded?.key === attempt ? loaded : null
  const status: LoadStatus = current?.status ?? 'loading'
  return { status, comparisons: current?.comparisons ?? [], error: current?.error ?? null, reload, remove }
}
