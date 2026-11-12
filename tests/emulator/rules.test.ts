/**
 * Firestore Security Rules tests (firestore.rules), run against the emulator.
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { deleteDoc, doc, getDoc, getDocs, collection, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

let env: RulesTestEnvironment

const activity = () => ({
  date: '2026-11-12',
  note: 'Vožnja do faksa — čćžšđ',
  details: { category: 'transport', mode: 'bus', distanceKm: 12.5, passengers: 1 },
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

const comparison = () => ({
  name: 'Dom to Fakultet',
  input: {
    modes: ['bus', 'train'],
    journey: { from: 'Dom', to: 'Fakultet', distanceKm: 18.5, passengers: 2 },
    priorities: { emissions: 3, cost: 2, time: 0 },
  },
  options: [
    { mode: 'bus', emissionsKg: 1.85, costEur: 2.43, timeMinutes: 66, overallScore: 0.1 },
    { mode: 'train', emissionsKg: 0.65, costEur: 2.48, timeMinutes: 39, overallScore: 0.6 },
  ],
  recommended: 'train',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

const plan = () => ({
  baseline: { source: 'sample', amounts: { transport: 120, food: 150, home: 130 } },
  reductionPercent: 20,
  durationMonths: 6,
  startMonth: '2026-11',
  allocation: { transport: 30, food: 38, home: 32 },
  priorities: ['impact', 'cost', 'time', 'comfort'],
  selectedOpportunityIds: [],
  adjustments: [],
  schemaVersion: 1,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-carbon-choices',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})

afterAll(async () => {
  await env?.cleanup()
})

beforeEach(async () => {
  await env.clearFirestore()
})

const alice = () => env.authenticatedContext('alice').firestore()
const bob = () => env.authenticatedContext('bob').firestore()
const guest = () => env.unauthenticatedContext().firestore()

describe('ownership', () => {
  it('lets a user create, read, update and delete their own activity', async () => {
    const ref = doc(alice(), 'users/alice/activities/a1')
    await assertSucceeds(setDoc(ref, activity()))
    await assertSucceeds(getDoc(ref))
    await assertSucceeds(updateDoc(ref, { note: 'Changed', updatedAt: serverTimestamp() }))
    await assertSucceeds(deleteDoc(ref))
  })

  it('blocks other users from reading, listing, writing or deleting', async () => {
    await assertSucceeds(setDoc(doc(alice(), 'users/alice/activities/a1'), activity()))
    await assertFails(getDoc(doc(bob(), 'users/alice/activities/a1')))
    await assertFails(getDocs(collection(bob(), 'users/alice/activities')))
    await assertFails(setDoc(doc(bob(), 'users/alice/activities/b1'), activity()))
    await assertFails(updateDoc(doc(bob(), 'users/alice/activities/a1'), { note: 'x', updatedAt: serverTimestamp() }))
    await assertFails(deleteDoc(doc(bob(), 'users/alice/activities/a1')))
  })

  it('blocks signed-out visitors from all private data', async () => {
    await assertFails(getDoc(doc(guest(), 'users/alice')))
    await assertFails(getDocs(collection(guest(), 'users/alice/activities')))
    await assertFails(getDocs(collection(guest(), 'users/alice/comparisons')))
    await assertFails(getDoc(doc(guest(), 'users/alice/goalPlans/current')))
    await assertFails(setDoc(doc(guest(), 'users/alice/activities/a1'), activity()))
  })

  it('denies anything outside users/{uid}', async () => {
    await assertFails(setDoc(doc(alice(), 'activities/a1'), activity()))
    await assertFails(getDocs(collection(alice(), 'users')))
  })
})

describe('validation', () => {
  it('rejects invalid activities', async () => {
    const db = alice()
    const bad = (details: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
      setDoc(doc(db, 'users/alice/activities/x'), { ...activity(), details, ...extra })
    await assertFails(bad({ category: 'transport', mode: 'bus', distanceKm: -5, passengers: 1 }))
    await assertFails(bad({ category: 'transport', mode: 'rocket', distanceKm: 5, passengers: 1 }))
    await assertFails(bad({ category: 'food', item: 'beef', servings: 5, secret: true }))
    await assertFails(bad({ category: 'home', source: 'electricity', kwh: 10, householdSize: 0 }))
    await assertFails(bad({ category: 'transport', mode: 'bus', distanceKm: 5, passengers: 1 }, { note: 'x'.repeat(121) }))
    await assertFails(bad({ category: 'transport', mode: 'bus', distanceKm: 5, passengers: 1 }, { date: '12.11.2026' }))
    await assertFails(bad({ category: 'transport', mode: 'bus', distanceKm: 5, passengers: 1 }, { isAdmin: true }))
  })

  it('keeps createdAt fixed and requires a server updatedAt on update', async () => {
    const ref = doc(alice(), 'users/alice/activities/a1')
    await assertSucceeds(setDoc(ref, activity()))
    await assertFails(updateDoc(ref, { createdAt: Timestamp.fromDate(new Date('2020-01-01')), updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref, { note: 'no timestamp' }))
  })

  it('accepts imported activities with earlier dates but not future ones', async () => {
    const db = alice()
    const past = Timestamp.fromDate(new Date('2026-01-01T10:00:00Z'))
    await assertSucceeds(
      setDoc(doc(db, 'users/alice/activities/imp1'), { ...activity(), createdAt: past, updatedAt: past, importedFrom: 'localStorage' }),
    )
    const future = Timestamp.fromDate(new Date(Date.now() + 86400000))
    await assertFails(setDoc(doc(db, 'users/alice/activities/imp2'), { ...activity(), createdAt: future, updatedAt: future }))
    await assertFails(setDoc(doc(db, 'users/alice/activities/imp3'), { ...activity(), importedFrom: 'somewhere-else' }))
  })

  it('validates comparisons and does not allow editing them', async () => {
    const db = alice()
    const ref = doc(db, 'users/alice/comparisons/c1')
    await assertSucceeds(setDoc(ref, comparison()))
    await assertFails(updateDoc(ref, { name: 'Renamed', updatedAt: serverTimestamp() }))
    const noPriorities = comparison()
    noPriorities.input.priorities = { emissions: 0, cost: 0, time: 0 }
    await assertFails(setDoc(doc(db, 'users/alice/comparisons/c2'), noPriorities))
    const oneMode = comparison()
    oneMode.input.modes = ['bus']
    await assertFails(setDoc(doc(db, 'users/alice/comparisons/c3'), oneMode))
    await assertFails(setDoc(doc(db, 'users/alice/comparisons/c4'), { ...comparison(), name: '' }))
    await assertSucceeds(deleteDoc(ref))
  })

  it('allows only users/{uid}/goalPlans/current with a valid plan', async () => {
    const db = alice()
    const ref = doc(db, 'users/alice/goalPlans/current')
    await assertSucceeds(setDoc(ref, plan()))
    await assertSucceeds(updateDoc(ref, { reductionPercent: 25, updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref, { reductionPercent: 250, updatedAt: serverTimestamp() }))
    await assertFails(setDoc(doc(db, 'users/alice/goalPlans/other'), plan()))
    await assertFails(setDoc(doc(db, 'users/alice/goalPlans/current'), { ...plan(), schemaVersion: 2 }))
    await assertFails(getDoc(doc(bob(), 'users/alice/goalPlans/current')))
    await assertSucceeds(deleteDoc(ref))
  })

  it('validates the user profile document', async () => {
    const db = alice()
    await assertSucceeds(setDoc(doc(db, 'users/alice'), { email: 'ana@example.com', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }))
    await assertFails(setDoc(doc(bob(), 'users/alice'), { email: 'x@y.z', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }))
    await assertFails(
      updateDoc(doc(db, 'users/alice'), { role: 'admin', updatedAt: serverTimestamp() }),
    )
  })
})
