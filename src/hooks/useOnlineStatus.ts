import { useSyncExternalStore } from 'react'

function subscribe(listener: () => void) {
  window.addEventListener('online', listener)
  window.addEventListener('offline', listener)
  return () => {
    window.removeEventListener('online', listener)
    window.removeEventListener('offline', listener)
  }
}

/** True when the browser has no network connection at all. */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

/**
 * Whether the browser reports a network connection. `navigator.onLine` can be
 * true while a service is still unreachable, so data screens also handle
 * "unavailable"/"timeout" errors from the services.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !isOffline(),
    () => true,
  )
}
