/**
 * End-to-end tests of the app's real data code (auth service and Firestore
 * repositories) against the Auth and Firestore emulators, with the real
 * security rules loaded.
 */
import { initializeApp, deleteApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth'
import { connectFirestoreEmulator, doc, getDoc, getFirestore, type Firestore } from 'firebase/firestore'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { importLocalData } from '../../src/features/account/localImport'
import { readProfileLocale, saveProfileLocale } from '../../src/features/account/localePreference'
import { AuthError, register, signIn, signOut } from '../../src/features/auth/authService'
import { createFirestoreComparisonRepository } from '../../src/features/compare/firestoreComparisonRepository'
import { calculateComparison } from '../../src/features/compare/calculate'
import { createFirestoreGoalPlanRepository } from '../../src/features/goals/goalPlanRepository'
import { createInitialPlan } from '../../src/features/goals/goalPlanReducer'
import { createFirestoreActivityRepository } from '../../src/features/tracking/firestoreActivityRepository'
import type { Activity, ActivityInput } from '../../src/features/tracking/types'
import { getFirebase } from '../../src/lib/firebase'
import { DataError } from '../../src/lib/dataErrors'

const PROJECT = 'demo-carbon-choices'
const extraApps: FirebaseApp[] = []

/** A second, independent client, like another browser or device. */
async function otherClient(email: string, password: string): Promise<{ db: Firestore; uid: string }> {
  const app = initializeApp({ apiKey: 'demo-api-key', projectId: PROJECT }, `client-${extraApps.length}`)
  extraApps.push(app)
  const auth = getAuth(app)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  const db = getFirestore(app)
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return { db, uid: user.uid }
}

async function resetEmulators() {
  await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' })
  await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' })
}

const bus: ActivityInput = {
  date: '2026-11-10',
  note: 'Tramvaj do Trga bana Jelačića',
  details: { category: 'transport', mode: 'bus', distanceKm: 12, passengers: 1 },
}

beforeEach(async () => {
  const firebase = getFirebase()
  if (firebase?.auth.currentUser) await signOut()
  await resetEmulators()
})

afterAll(async () => {
  for (const app of extraApps) {
    await fbSignOut(getAuth(app)).catch(() => undefined)
    await deleteApp(app)
  }
})

describe('authentication', () => {
  it('registers, creates the profile, signs out and signs in again', async () => {
    const firebase = getFirebase()!
    const user = await register('ana.kovac@example.com', 'lozinka123')
    expect(firebase.auth.currentUser?.uid).toBe(user.uid)
    const profile = await getDoc(doc(firebase.db, 'users', user.uid))
    expect(profile.data()?.email).toBe('ana.kovac@example.com')

    await signOut()
    expect(firebase.auth.currentUser).toBeNull()

    await expect(signIn('ana.kovac@example.com', 'wrong-password')).rejects.toMatchObject({ code: 'wrong-credentials' })
    await expect(register('ana.kovac@example.com', 'lozinka123')).rejects.toMatchObject({ code: 'email-in-use' })
    await expect(register('ana@example.com', '123')).rejects.toBeInstanceOf(AuthError)

    const again = await signIn('ana.kovac@example.com', 'lozinka123')
    expect(again.uid).toBe(user.uid)
  })
})

describe('tracking activities', () => {
  it('creates, reads, updates, lists and deletes, and the data persists for another client', async () => {
    const user = await register('ivan@example.com', 'lozinka123')
    const repo = createFirestoreActivityRepository(getFirebase()!.db, user.uid)

    const created = await repo.create(bus)
    const food = await repo.create({ date: '2026-11-11', note: '', details: { category: 'food', item: 'beef', servings: 1 } })
    expect((await repo.get(created.id))?.note).toBe('Tramvaj do Trga bana Jelačića')

    const list = await repo.list()
    expect(list.map((a) => a.id)).toEqual([food.id, created.id]) // newest date first

    const updated = await repo.update(created.id, { ...bus, details: { ...bus.details, distanceKm: 20 } as Activity['details'] })
    expect(updated.createdAt).toBe((await repo.get(created.id))?.createdAt)

    // Like reloading the app, or opening it on another device.
    const other = await otherClient('ivan@example.com', 'lozinka123')
    const fromOther = await createFirestoreActivityRepository(other.db, other.uid).get(created.id)
    expect(fromOther?.details).toEqual({ category: 'transport', mode: 'bus', distanceKm: 20, passengers: 1 })
    expect(fromOther?.createdAt).toMatch(/Z$/) // ISO in UTC

    await repo.remove(food.id)
    expect((await repo.list()).map((a) => a.id)).toEqual([created.id])
    await expect(repo.update(food.id, bus)).rejects.toMatchObject({ code: 'not-found' })
  })

  it('delivers live updates through subscribe', async () => {
    const user = await register('live@example.com', 'lozinka123')
    const repo = createFirestoreActivityRepository(getFirebase()!.db, user.uid)
    const seen: number[] = []
    await new Promise<void>((resolve, reject) => {
      const stop = repo.subscribe(
        (activities) => {
          seen.push(activities.length)
          // First answer: nothing yet. Then add an activity and wait for it to arrive.
          if (seen.length === 1) void repo.create(bus)
          if (activities.length === 1) {
            stop()
            resolve()
          }
        },
        reject,
      )
    })
    expect(seen[0]).toBe(0)
    expect(seen.at(-1)).toBe(1)
  })

  it('refuses to read or write another user’s activities', async () => {
    await register('owner@example.com', 'lozinka123')
    const ownerUid = getFirebase()!.auth.currentUser!.uid
    await createFirestoreActivityRepository(getFirebase()!.db, ownerUid).create(bus)
    await signOut()
    await register('intruder@example.com', 'lozinka123')
    const intruderView = createFirestoreActivityRepository(getFirebase()!.db, ownerUid)
    await expect(intruderView.list()).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(intruderView.create(bus)).rejects.toBeInstanceOf(DataError)
  })
})

describe('saved comparisons', () => {
  it('saves, lists, gets and deletes a comparison', async () => {
    const user = await register('marija@example.com', 'lozinka123')
    const repo = createFirestoreComparisonRepository(getFirebase()!.db, user.uid)
    const result = calculateComparison({
      modes: ['bus', 'train', 'car'],
      journey: { from: 'Dom', to: 'Fakultet elektrotehnike', distanceKm: 18.5, passengers: 2 },
      priorities: { emissions: 3, cost: 2, time: 0 },
    })
    const saved = await repo.create({ name: 'Put na faks', input: result.input, options: result.options, recommended: result.recommended })
    const list = await repo.list()
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ id: saved.id, name: 'Put na faks', recommended: 'train' })
    expect((await repo.get(saved.id))?.input.journey.to).toBe('Fakultet elektrotehnike')
    await repo.remove(saved.id)
    expect(await repo.get(saved.id)).toBeUndefined()
  })
})

describe('goal plan', () => {
  it('creates, updates, loads and deletes the plan, keeping createdAt', async () => {
    const user = await register('luka@example.com', 'lozinka123')
    const repo = createFirestoreGoalPlanRepository(getFirebase()!.db, user.uid)
    expect(await repo.load()).toBeNull()

    const plan = createInitialPlan()
    await repo.save(plan, false)
    const first = await repo.load()
    expect(first?.plan.reductionPercent).toBe(20)

    await repo.save({ ...plan, reductionPercent: 30, allocation: { transport: 50, food: 30, home: 20 } }, true)
    const second = await repo.load()
    expect(second?.plan.reductionPercent).toBe(30)
    expect(second?.plan.allocation).toEqual({ transport: 50, food: 30, home: 20 })
    expect(second?.createdAt).toBe(first?.createdAt)

    await repo.remove()
    expect(await repo.load()).toBeNull()
  })
})

describe('import of browser data', () => {
  it('imports once and skips duplicates on a second run', async () => {
    const user = await register('petra@example.com', 'lozinka123')
    const db = getFirebase()!.db
    const local: Activity[] = [
      { ...bus, id: '0b9c2f0e-1111-4c1e-9a55-000000000001', createdAt: '2026-11-01T08:00:00.000Z', updatedAt: '2026-11-01T08:00:00.000Z' },
      { ...bus, id: '0b9c2f0e-1111-4c1e-9a55-000000000002', createdAt: '2026-11-02T08:00:00.000Z', updatedAt: '2026-11-02T08:00:00.000Z' },
    ]
    const first = await importLocalData(db, user.uid, { activities: local, comparisons: [], problem: null })
    expect(first).toMatchObject({ activitiesImported: 2, activitiesSkipped: 0 })

    const second = await importLocalData(db, user.uid, { activities: local, comparisons: [], problem: null })
    expect(second).toMatchObject({ activitiesImported: 0, activitiesSkipped: 2 })

    const list = await createFirestoreActivityRepository(db, user.uid).list()
    expect(list).toHaveLength(2)
    expect(list.find((a) => a.id === local[0].id)?.createdAt).toBe('2026-11-01T08:00:00.000Z')
  })
})

describe('text in other scripts (UTF-8)', () => {
  it('stores and reads back Croatian, Cyrillic and Arabic text', async () => {
    const user = await register('script@example.com', 'lozinka123')
    const db = getFirebase()!.db
    const activities = createFirestoreActivityRepository(db, user.uid)
    const notes = ['Čađavi šešir — Đakovo, Žminj', 'Поездка на трамвае в Москве', 'رحلة بالحافلة إلى الجامعة']
    for (const note of notes) {
      await activities.create({ ...bus, note })
    }
    // Read back through a second client, i.e. from the database, not a local cache.
    const other = await otherClient('script@example.com', 'lozinka123')
    const stored = (await createFirestoreActivityRepository(other.db, other.uid).list()).map((a) => a.note).sort()
    expect(stored).toEqual([...notes].sort())

    const comparisons = createFirestoreComparisonRepository(db, user.uid)
    const result = calculateComparison({
      modes: ['bus', 'train'],
      journey: { from: 'Москва', to: 'دبي', distanceKm: 12, passengers: 1 },
      priorities: { emissions: 3, cost: 1, time: 1 },
    })
    const saved = await comparisons.create({ name: 'Путь — طريق', input: result.input, options: result.options, recommended: result.recommended })
    const reread = await createFirestoreComparisonRepository(other.db, other.uid).get(saved.id)
    expect(reread?.name).toBe('Путь — طريق')
    expect(reread?.input.journey).toMatchObject({ from: 'Москва', to: 'دبي' })
  })
})

describe('locale preference in the profile', () => {
  it('saves the language with the profile and reads it back', async () => {
    const user = await register('jezik@example.com', 'lozinka123')
    const db = getFirebase()!.db
    // New profiles get the language in use at registration (English in tests).
    expect(await readProfileLocale(db, user.uid)).toBe('en')
    await saveProfileLocale(db, user.uid, 'hr')
    const other = await otherClient('jezik@example.com', 'lozinka123')
    expect(await readProfileLocale(other.db, other.uid)).toBe('hr')
  })
})
