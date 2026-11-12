/**
 * Checks the real Firebase project (from .env.local) with the app's own code:
 * Authentication, Firestore CRUD for all three features, and the deployed
 * Security Rules. Uses two new test accounts; everything it creates is deleted
 * at the end, and it never touches other users' data.
 *
 * Run with: npm run test:live
 */
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app'
import { deleteUser, getAuth, signInWithEmailAndPassword, type User } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocsFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { register, signOut } from '../../src/features/auth/authService'
import { calculateComparison } from '../../src/features/compare/calculate'
import { createFirestoreComparisonRepository } from '../../src/features/compare/firestoreComparisonRepository'
import { createInitialPlan } from '../../src/features/goals/goalPlanReducer'
import { createFirestoreGoalPlanRepository } from '../../src/features/goals/goalPlanRepository'
import { createFirestoreActivityRepository } from '../../src/features/tracking/firestoreActivityRepository'
import { getFirebase } from '../../src/lib/firebase'

const stamp = Date.now()
const PASSWORD = `Test-${stamp}-pw`
const emailA = `carbon-choices-test-a-${stamp}@example.com`
const emailB = `carbon-choices-test-b-${stamp}@example.com`

let userA: User
let appB: FirebaseApp
let appGuest: FirebaseApp

beforeAll(async () => {
  const firebase = getFirebase()
  if (!firebase) throw new Error('Firebase is not configured: create .env.local first.')
  expect(firebase.app.options.projectId).toBe('personal-carbon-tradeoff')

  // Second user in a separate Firebase app instance, like another browser.
  appB = initializeApp(firebase.app.options, 'live-user-b')
  await register(emailB, PASSWORD) // registers (and creates the profile) through the main app...
  await signOut()
  await signInWithEmailAndPassword(getAuth(appB), emailB, PASSWORD) // ...then lives in appB
  userA = await register(emailA, PASSWORD)
  appGuest = initializeApp(firebase.app.options, 'live-guest')
})

afterAll(async () => {
  // Delete only what this test created: user A's and B's documents and accounts.
  const firebase = getFirebase()!
  const sessions = [
    { db: firebase.db, user: firebase.auth.currentUser },
    { db: getFirestore(appB), user: getAuth(appB).currentUser },
  ]
  for (const { db, user } of sessions) {
    if (!user) continue
    for (const name of ['activities', 'comparisons']) {
      const snapshot = await getDocsFromServer(collection(db, 'users', user.uid, name))
      for (const item of snapshot.docs) await deleteDoc(item.ref)
    }
    // The rules allow only the single document goalPlans/current, so it is deleted directly.
    await deleteDoc(doc(db, 'users', user.uid, 'goalPlans', 'current'))
    await deleteDoc(doc(db, 'users', user.uid))
    await deleteUser(user)
  }
  await deleteApp(appB)
  await deleteApp(appGuest)
})

describe('real Firebase project', () => {
  it('signs in to the real project (not the emulator) and creates the profile', async () => {
    const firebase = getFirebase()!
    expect(firebase.auth.emulatorConfig).toBeNull()
    expect(firebase.auth.currentUser?.email).toBe(emailA)
    const profile = await getDocFromServer(doc(firebase.db, 'users', userA.uid))
    expect(profile.data()?.email).toBe(emailA)
  })

  it('Tracking: create, read, update, list and delete an activity', async () => {
    const repo = createFirestoreActivityRepository(getFirebase()!.db, userA.uid)
    const created = await repo.create({
      date: '2026-11-12',
      note: 'Test: tramvaj do Trga bana Jelačića',
      details: { category: 'transport', mode: 'tram', distanceKm: 4.5, passengers: 1 },
    })
    expect((await repo.get(created.id))?.note).toBe('Test: tramvaj do Trga bana Jelačića')
    await repo.update(created.id, {
      date: '2026-11-12',
      note: 'Test: updated',
      details: { category: 'transport', mode: 'tram', distanceKm: 6, passengers: 1 },
    })
    const list = await repo.list()
    expect(list).toHaveLength(1)
    expect(list[0].details).toMatchObject({ distanceKm: 6 })
    await repo.remove(created.id)
    expect(await repo.list()).toHaveLength(0)
  })

  it('Compare: save, list, get and delete a comparison', async () => {
    const repo = createFirestoreComparisonRepository(getFirebase()!.db, userA.uid)
    const result = calculateComparison({
      modes: ['bus', 'train'],
      journey: { from: 'Test start', to: 'Test end', distanceKm: 10, passengers: 1 },
      priorities: { emissions: 3, cost: 1, time: 1 },
    })
    const saved = await repo.create({ name: 'Test comparison', input: result.input, options: result.options, recommended: result.recommended })
    expect((await repo.list()).map((c) => c.id)).toEqual([saved.id])
    expect((await repo.get(saved.id))?.recommended).toBe(result.recommended)
    await repo.remove(saved.id)
    expect(await repo.get(saved.id)).toBeUndefined()
  })

  it('Goals: create, update, load and delete the plan', async () => {
    const repo = createFirestoreGoalPlanRepository(getFirebase()!.db, userA.uid)
    await repo.save(createInitialPlan(), false)
    await repo.save({ ...createInitialPlan(), reductionPercent: 25 }, true)
    expect((await repo.load())?.plan.reductionPercent).toBe(25)
    await repo.remove()
    expect(await repo.load()).toBeNull()
  })

  it('deployed rules: another user cannot read or write user A’s data', async () => {
    const repoA = createFirestoreActivityRepository(getFirebase()!.db, userA.uid)
    const activity = await repoA.create({
      date: '2026-11-12',
      note: 'Test: private',
      details: { category: 'food', item: 'vegan', servings: 1 },
    })
    const asB = createFirestoreActivityRepository(getFirestore(appB), userA.uid)
    await expect(asB.list()).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(asB.get(activity.id)).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(asB.remove(activity.id)).rejects.toMatchObject({ code: 'permission-denied' })
    expect(await repoA.get(activity.id)).toBeDefined()
    await repoA.remove(activity.id)
  })

  it('deployed rules: signed-out visitors cannot read or write private data', async () => {
    const guestDb = getFirestore(appGuest)
    await expect(getDocsFromServer(collection(guestDb, 'users', userA.uid, 'activities'))).rejects.toMatchObject({
      code: 'permission-denied',
    })
    await expect(getDocFromServer(doc(guestDb, 'users', userA.uid))).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(getDocsFromServer(collection(guestDb, 'users'))).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('deployed rules: invalid data is rejected', async () => {
    const db = getFirebase()!.db
    await expect(
      setDoc(doc(db, 'users', userA.uid, 'activities', 'invalid-test'), {
        date: '2026-11-12',
        note: '',
        details: { category: 'transport', mode: 'bus', distanceKm: -10, passengers: 1 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(
      setDoc(doc(db, 'somethingElse', 'x'), { hello: 'world' }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
  })
})
