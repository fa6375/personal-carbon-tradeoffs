/**
 * Demo data for reviewers. Runs ONLY against the Firebase emulators
 * (npm run demo); it refuses to touch a real project.
 *
 * Creates one demo account with realistic data for all three features, using
 * the app's own repositories and calculations, so the data matches exactly
 * what the app writes and what firestore.rules allow.
 */
import { register } from '../src/features/auth/authService'
import { calculateComparison } from '../src/features/compare/calculate'
import { createFirestoreComparisonRepository } from '../src/features/compare/firestoreComparisonRepository'
import { allocationFromAmounts } from '../src/features/goals/budget'
import { createInitialPlan, goalPlanReducer } from '../src/features/goals/goalPlanReducer'
import { createFirestoreGoalPlanRepository } from '../src/features/goals/goalPlanRepository'
import { createFirestoreActivityRepository } from '../src/features/tracking/firestoreActivityRepository'
import type { Activity, ActivityInput } from '../src/features/tracking/types'
import { getFirebase } from '../src/lib/firebase'

export const DEMO_EMAIL = 'demo@carbon-choices.test'

function day(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() - offset)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function yearMonth(offsetMonths = 0): string {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() + offsetMonths)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** A month of a student's life in Zagreb (fictional; no real person). */
function demoActivities(): ActivityInput[] {
  const list: ActivityInput[] = []
  for (const offset of [1, 2, 3, 4, 7, 8, 9, 10, 11, 14, 15, 16, 21, 22]) {
    list.push({
      date: day(offset),
      note: offset % 2 ? 'Tramvaj do fakulteta' : 'Bus to campus',
      details: { category: 'transport', mode: offset % 2 ? 'tram' : 'bus', distanceKm: 7.5, passengers: 1 },
    })
  }
  list.push(
    { date: day(5), note: 'Vikend u Rijeci', details: { category: 'transport', mode: 'train', distanceKm: 165, passengers: 1 } },
    { date: day(6), note: 'Shopping trip with friends', details: { category: 'transport', mode: 'car-petrol', distanceKm: 24, passengers: 3 } },
    { date: day(12), note: 'Posjet obitelji u Samoboru', details: { category: 'transport', mode: 'car-petrol', distanceKm: 51, passengers: 2 } },
    { date: day(2), note: 'Ćevapi s prijateljima', details: { category: 'food', item: 'beef', servings: 1 } },
    { date: day(4), note: 'Lunch at the student canteen', details: { category: 'food', item: 'chicken', servings: 1 } },
    { date: day(6), note: 'Grah i povrće', details: { category: 'food', item: 'vegan', servings: 2 } },
    { date: day(9), note: 'Pizza night', details: { category: 'food', item: 'cheese', servings: 2 } },
    { date: day(13), note: 'Riba petkom', details: { category: 'food', item: 'fish', servings: 1 } },
    { date: day(18), note: 'Vegetarian lasagne', details: { category: 'food', item: 'vegetarian', servings: 2 } },
    { date: day(20), note: 'Electricity bill (shared flat)', details: { category: 'home', source: 'electricity', kwh: 260, householdSize: 3 } },
    { date: day(20), note: 'Plin za grijanje — studeni', details: { category: 'home', source: 'natural-gas', kwh: 900, householdSize: 3 } },
  )
  return list
}

export async function seedDemo(password: string): Promise<{ email: string; activities: number; comparisons: number }> {
  const firebase = getFirebase()
  if (!firebase || !firebase.auth.emulatorConfig || !firebase.app.options.projectId?.startsWith('demo-')) {
    throw new Error('Refusing to seed: this script only runs against the Firebase emulators (npm run demo).')
  }
  const user = await register(DEMO_EMAIL, password)
  const db = firebase.db

  const activitiesRepo = createFirestoreActivityRepository(db, user.uid)
  const created: Activity[] = []
  for (const input of demoActivities()) created.push(await activitiesRepo.create(input))

  const comparisons = createFirestoreComparisonRepository(db, user.uid)
  const journeys = [
    {
      name: 'Studentski dom → FER',
      input: {
        modes: ['walk', 'bicycle', 'bus', 'car'] as const,
        journey: { from: 'Studentski dom Cvjetno naselje', to: 'FER, Unska 3, Zagreb', distanceKm: 3.4, passengers: 1 },
        priorities: { emissions: 3, cost: 2, time: 2 } as const,
      },
    },
    {
      name: 'Weekend in Rijeka',
      input: {
        modes: ['bus', 'train', 'car', 'electric-car'] as const,
        journey: { from: 'Zagreb Glavni kolodvor', to: 'Rijeka', distanceKm: 165, passengers: 2 },
        priorities: { emissions: 2, cost: 3, time: 1 } as const,
      },
    },
  ]
  for (const entry of journeys) {
    const result = calculateComparison({
      modes: [...entry.input.modes],
      journey: entry.input.journey,
      priorities: { ...entry.input.priorities },
    })
    await comparisons.create({ name: entry.name, input: result.input, options: result.options, recommended: result.recommended })
  }

  // A carbon plan with a 25% goal over six months, two chosen ideas and one recorded adjustment.
  const baselineAmounts = { transport: 160, food: 140, home: 120 }
  let plan = createInitialPlan()
  plan = goalPlanReducer(plan, { type: 'setBaseline', baseline: { source: 'custom', amounts: baselineAmounts } })
  plan = { ...plan, allocation: allocationFromAmounts(baselineAmounts), startMonth: yearMonth(0) }
  plan = goalPlanReducer(plan, { type: 'setReduction', percent: 25 })
  plan = goalPlanReducer(plan, { type: 'setDuration', months: 6 })
  plan = goalPlanReducer(plan, { type: 'toggleOpportunity', id: 'bus-commute' })
  plan = goalPlanReducer(plan, { type: 'toggleOpportunity', id: 'plant-meals' })
  plan = goalPlanReducer(plan, {
    type: 'reallocate',
    id: 'demo-adjustment-1',
    createdAt: new Date().toISOString(),
    from: 'home',
    to: 'transport',
    percentPoints: 3,
    reason: 'Više putovanja vlakom ovaj mjesec / more train trips this month',
  })
  await createFirestoreGoalPlanRepository(db, user.uid).save(plan, false)

  return { email: DEMO_EMAIL, activities: created.length, comparisons: journeys.length }
}
