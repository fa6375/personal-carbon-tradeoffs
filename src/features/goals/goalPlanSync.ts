/**
 * Keeps the Goals plan (goalPlanStore.ts) in sync with Cloud Firestore.
 *
 * - When a user signs in, their plan is loaded from users/{uid}/goalPlans/current.
 *   A user without a saved plan starts from the default plan, which is saved
 *   as soon as they change something.
 * - Every change is saved automatically shortly after it is made.
 * - If loading fails, the screens show an error instead of a plan, so the user
 *   never mistakes an unsaved default plan for their own.
 *
 * - While the browser is offline nothing is sent; the change is kept in memory,
 *   the bar says it is not saved yet, and saving starts again automatically
 *   when the connection returns (or with "Try saving again").
 *
 * This runs outside React so a save that is still waiting is not lost when the
 * user leaves the Goals page.
 */
import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useSyncExternalStore } from 'react'
import { DataError, toDataError, type DataErrorCode } from '../../lib/dataErrors'
import { getFirebase } from '../../lib/firebase'
import { createInitialPlan } from './goalPlanReducer'
import { createFirestoreGoalPlanRepository, type GoalPlanRepository } from './goalPlanRepository'
import { getGoalsSession, replaceGoalPlan, subscribeGoalsSession } from './goalPlanStore'
import type { GoalPlan } from './types'

export type GoalSyncLoad = 'idle' | 'loading' | 'ready' | 'error'
/** new = not saved yet, pending = waiting to save, saving, saved, offline = waiting for the connection, error. */
export type GoalSyncSave = 'new' | 'pending' | 'saving' | 'saved' | 'offline' | 'error'

export interface GoalSyncState {
  load: GoalSyncLoad
  save: GoalSyncSave
  /** Error code; shown with dataErrorText() so it follows the language. */
  error: DataErrorCode | null
  /** ISO timestamp of the last successful save in this session. */
  savedAt: string | null
  createdAt: string | null
}

const SAVE_DELAY_MS = 800

let state: GoalSyncState = { load: 'idle', save: 'new', error: null, savedAt: null, createdAt: null }
let uid: string | null = null
let repository: GoalPlanRepository | null = null
let exists = false
let lastSaved: GoalPlan | null = null
let timer: ReturnType<typeof setTimeout> | null = null
let generation = 0
const listeners = new Set<() => void>()

function setState(next: Partial<GoalSyncState>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

async function saveNow() {
  timer = null
  if (!repository || state.load !== 'ready') return
  const plan = getGoalsSession().plan
  if (plan === lastSaved) return
  if (isBrowserOffline()) {
    setState({ save: 'offline', error: null })
    return
  }
  const run = generation
  setState({ save: 'saving', error: null })
  try {
    await repository.save(plan, exists)
    if (run !== generation) return
    exists = true
    lastSaved = plan
    setState({ save: 'saved', savedAt: new Date().toISOString(), createdAt: state.createdAt ?? new Date().toISOString() })
    // The plan may have changed while saving.
    if (getGoalsSession().plan !== lastSaved) scheduleSave()
  } catch (reason) {
    if (run !== generation) return
    setState({ save: isBrowserOffline() ? 'offline' : 'error', error: toDataError(reason).code })
  }
}

function scheduleSave() {
  if (timer) clearTimeout(timer)
  setState({ save: 'pending' })
  timer = setTimeout(() => void saveNow(), SAVE_DELAY_MS)
}

function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

// Save what is waiting as soon as the connection returns.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (state.load === 'ready' && (state.save === 'offline' || state.save === 'error')) void saveNow()
    else if (state.load === 'error') void load()
  })
}

// Save whenever the plan in the store changes after it was loaded.
subscribeGoalsSession(() => {
  if (state.load === 'ready' && getGoalsSession().plan !== lastSaved) scheduleSave()
})

async function load() {
  if (!repository) return
  const run = ++generation
  setState({ load: 'loading', error: null })
  try {
    const stored = await repository.load()
    if (run !== generation) return
    const plan = stored?.plan ?? createInitialPlan()
    exists = stored !== null
    lastSaved = plan
    replaceGoalPlan(plan, true)
    setState({ load: 'ready', save: exists ? 'saved' : 'new', createdAt: stored?.createdAt ?? null, savedAt: null })
  } catch (reason) {
    if (run !== generation) return
    setState({ load: 'error', error: toDataError(reason).code })
  }
}

/** Starts syncing for this user (or stops when uid is null). */
function startSync(nextUid: string | null) {
  if (nextUid === uid) return
  if (timer) clearTimeout(timer)
  timer = null
  generation++
  uid = nextUid
  const firebase = getFirebase()
  repository = firebase && uid ? createFirestoreGoalPlanRepository(firebase.db, uid) : null
  exists = false
  // Never show one user's plan to the next person who signs in on this device.
  lastSaved = createInitialPlan()
  replaceGoalPlan(lastSaved, true)
  state = { load: 'idle', save: 'new', error: null, savedAt: null, createdAt: null }
  if (repository) void load()
  else setState({})
}

export function retryGoalPlanLoad() {
  void load()
}

export function retryGoalPlanSave() {
  void saveNow()
}

/** Deletes the saved plan and starts again from the default plan. */
export async function deleteSavedGoalPlan(): Promise<void> {
  if (!repository) throw new DataError('not-signed-in')
  if (timer) clearTimeout(timer)
  timer = null
  const run = ++generation
  await repository.remove()
  if (run !== generation) return
  exists = false
  lastSaved = createInitialPlan()
  replaceGoalPlan(lastSaved, true)
  setState({ save: 'new', error: null, savedAt: null, createdAt: null })
}

// Stop syncing (and clear the plan from memory) as soon as the user signs out or changes.
const firebaseServices = getFirebase()
if (firebaseServices) {
  onAuthStateChanged(firebaseServices.auth, (user) => {
    if (uid && user?.uid !== uid) startSync(null)
  })
}

/** Connects the Goals page to the signed-in user's saved plan. */
export function useGoalPlanSync(currentUid: string | null): GoalSyncState {
  useEffect(() => {
    startSync(currentUid)
  }, [currentUid])
  return useSyncExternalStore(subscribe, () => state)
}
