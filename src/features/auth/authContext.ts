import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'

export type AuthStatus = 'loading' | 'signed-in' | 'signed-out' | 'not-configured'

export interface AuthState {
  status: AuthStatus
  user: User | null
}

export const AuthContext = createContext<AuthState>({ status: 'loading', user: null })

/** The current Firebase user. Use `user.uid` as the owner of all private data. */
export function useAuth(): AuthState {
  return useContext(AuthContext)
}
