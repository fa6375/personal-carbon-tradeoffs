/**
 * The language choice is kept in two places:
 * - this browser (localStorage, src/i18n/localeStore.ts) — works signed out;
 * - the signed-in user's profile, users/{uid}.locale — follows the user to
 *   other devices.
 *
 * On sign-in, a language already saved in the profile is applied (it was the
 * user's own explicit choice). A profile without a language gets the one
 * currently in use, so nothing the user chose is overwritten. While signed
 * in, every change in the selector is saved to the profile too.
 */
import { doc, getDocFromServer, serverTimestamp, updateDoc, type Firestore } from 'firebase/firestore'
import { useEffect } from 'react'
import { getLocale, setLocale } from '../../i18n'
import { isLocale, subscribeLocale } from '../../i18n/localeStore'
import type { Locale } from '../../i18n/types'
import { getFirebase } from '../../lib/firebase'
import { useAuth } from '../auth/authContext'

export interface LocaleDecision {
  /** Language to switch the interface to, if different from the current one. */
  apply: Locale | null
  /** Language to write to the profile, if it has none yet. */
  save: Locale | null
}

/** Pure rule used on sign-in (tested in localePreference.test.ts). */
export function decideLocaleOnSignIn(profileLocale: unknown, currentLocale: Locale): LocaleDecision {
  if (isLocale(profileLocale)) {
    return { apply: profileLocale === currentLocale ? null : profileLocale, save: null }
  }
  return { apply: null, save: currentLocale }
}

export async function readProfileLocale(db: Firestore, uid: string): Promise<Locale | null> {
  const snapshot = await getDocFromServer(doc(db, 'users', uid))
  const value: unknown = snapshot.exists() ? snapshot.data().locale : null
  return isLocale(value) ? value : null
}

export async function saveProfileLocale(db: Firestore, uid: string, locale: Locale): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { locale, updatedAt: serverTimestamp() })
}

/**
 * Keeps the interface language and the signed-in user's profile in sync.
 * Failures are ignored on purpose: the language still works per browser, so a
 * network problem must not interrupt the user.
 */
export function useLocaleProfileSync(): void {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  useEffect(() => {
    const firebase = getFirebase()
    if (!firebase || !uid) return
    const { db } = firebase
    let active = true
    let applying = false

    readProfileLocale(db, uid)
      .then((profileLocale) => {
        if (!active) return
        const decision = decideLocaleOnSignIn(profileLocale, getLocale())
        if (decision.apply) {
          applying = true
          setLocale(decision.apply)
          applying = false
        }
        if (decision.save) return saveProfileLocale(db, uid, decision.save)
      })
      .catch(() => undefined)

    const unsubscribe = subscribeLocale(() => {
      if (!active || applying) return
      saveProfileLocale(db, uid, getLocale()).catch(() => undefined)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [uid])
}

/** Renders nothing; mounts the sync inside the AuthProvider. */
export function LocaleProfileSync() {
  useLocaleProfileSync()
  return null
}
