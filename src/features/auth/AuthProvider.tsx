import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState, type ReactNode } from 'react'
import { getFirebase } from '../../lib/firebase'
import { AuthContext, type AuthState } from './authContext'
import { ensureUserProfile } from './authService'

/**
 * Keeps track of the signed-in user. Firebase Auth stores the session in the
 * browser (IndexedDB), so users stay signed in after a reload.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() =>
    getFirebase() ? { status: 'loading', user: null } : { status: 'not-configured', user: null },
  )

  useEffect(() => {
    const firebase = getFirebase()
    if (!firebase) return
    return onAuthStateChanged(firebase.auth, (user) => {
      setState(user ? { status: 'signed-in', user } : { status: 'signed-out', user: null })
      // Older accounts may not have a profile document yet; it is not needed to use the app.
      if (user) ensureUserProfile(user).catch(() => undefined)
    })
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
