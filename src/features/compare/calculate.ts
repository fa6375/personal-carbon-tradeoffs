/**
 * Comparison calculations for Compare Everyday Choices.
 *
 * 1. Each option gets a per-person CO₂, cost and time estimate
 *    (method and units in transportOptions.ts).
 * 2. For each criterion the options are scored 0–1 relative to each other:
 *      score = (worst − value) ÷ (worst − best)
 *    so the best option scores 1 and the worst 0. If all options are equal on
 *    a criterion, they all score 1.
 * 3. The overall score is the average of the three scores weighted by the
 *    user's priorities (0–3):
 *      overall = Σ(priority × score) ÷ Σ(priority)
 * 4. The recommended option is the one with the highest overall score. Ties
 *    are broken by lower emissions, then shorter time, then input order.
 */
import { CRITERIA } from './criteria'
import { emissionFactorFor, getTransportOption } from './transportOptions'
import type {
  ComparisonInput,
  ComparisonResult,
  Criterion,
  OptionResult,
  Priorities,
  TransportOptionId,
} from './types'
import { MAX_DISTANCE_KM, MAX_PASSENGERS } from './validation'

/** Thrown when a comparison cannot be calculated from the given input. */
export class ComparisonError extends Error {
  readonly kind: 'invalid-input' | 'missing-information' | 'calculation-failed'

  constructor(kind: ComparisonError['kind'], message: string) {
    super(message)
    this.name = 'ComparisonError'
    this.kind = kind
  }
}

/** Number of people the vehicle's emissions and cost are shared between. */
export function sharersFor(mode: TransportOptionId, passengers: number): number {
  return getTransportOption(mode).sharedVehicle ? Math.max(1, passengers) : 1
}

export function estimateEmissions(mode: TransportOptionId, distanceKm: number, passengers: number) {
  return (distanceKm * emissionFactorFor(mode)) / sharersFor(mode, passengers)
}

export function estimateCost(mode: TransportOptionId, distanceKm: number, passengers: number) {
  const option = getTransportOption(mode)
  return (option.fixedCostEur + distanceKm * option.costPerKmEur) / sharersFor(mode, passengers)
}

export function estimateTime(mode: TransportOptionId, distanceKm: number) {
  const option = getTransportOption(mode)
  return (distanceKm / option.speedKmh) * 60 + option.overheadMinutes
}

function relativeScores(values: number[]): number[] {
  const best = Math.min(...values)
  const worst = Math.max(...values)
  if (worst - best < 1e-9) return values.map(() => 1)
  return values.map((value) => (worst - value) / (worst - best))
}

export function totalWeight(priorities: Priorities): number {
  return priorities.emissions + priorities.cost + priorities.time
}

function checkInput(input: ComparisonInput) {
  const { modes, journey, priorities } = input
  if (new Set(modes).size < 2) {
    throw new ComparisonError('missing-information', 'Choose at least two different ways to travel to compare.')
  }
  if (!journey.from.trim() || !journey.to.trim()) {
    throw new ComparisonError('missing-information', 'The starting point or destination is missing.')
  }
  if (!Number.isFinite(journey.distanceKm) || journey.distanceKm <= 0 || journey.distanceKm > MAX_DISTANCE_KM) {
    throw new ComparisonError(
      'invalid-input',
      `The distance must be more than 0 and at most ${MAX_DISTANCE_KM} km.`,
    )
  }
  if (!Number.isInteger(journey.passengers) || journey.passengers < 1 || journey.passengers > MAX_PASSENGERS) {
    throw new ComparisonError(
      'invalid-input',
      `The number of people must be a whole number from 1 to ${MAX_PASSENGERS}.`,
    )
  }
  if (totalWeight(priorities) <= 0) {
    throw new ComparisonError('invalid-input', 'At least one priority must matter to make a recommendation.')
  }
}

/** Calculates the full comparison. Throws ComparisonError if the input cannot be compared. */
export function calculateComparison(input: ComparisonInput): ComparisonResult {
  checkInput(input)
  const modes = [...new Set(input.modes)]
  const { distanceKm, passengers } = input.journey

  const raw = modes.map((mode) => ({
    mode,
    emissionsKg: estimateEmissions(mode, distanceKm, passengers),
    costEur: estimateCost(mode, distanceKm, passengers),
    timeMinutes: estimateTime(mode, distanceKm),
  }))

  const valueOf: Record<Criterion, (entry: (typeof raw)[number]) => number> = {
    emissions: (entry) => entry.emissionsKg,
    cost: (entry) => entry.costEur,
    time: (entry) => entry.timeMinutes,
  }

  const scoresBy = Object.fromEntries(
    CRITERIA.map(({ id }) => [id, relativeScores(raw.map(valueOf[id]))]),
  ) as Record<Criterion, number[]>

  const weight = totalWeight(input.priorities)
  const options: OptionResult[] = raw.map((entry, index) => {
    const scores = {
      emissions: scoresBy.emissions[index],
      cost: scoresBy.cost[index],
      time: scoresBy.time[index],
    }
    const overallScore =
      (input.priorities.emissions * scores.emissions +
        input.priorities.cost * scores.cost +
        input.priorities.time * scores.time) /
      weight
    return { ...entry, scores, overallScore }
  })

  if (options.some((option) => ![option.emissionsKg, option.costEur, option.timeMinutes, option.overallScore].every(Number.isFinite))) {
    throw new ComparisonError('calculation-failed', 'One of the estimates could not be calculated.')
  }

  const bestBy = Object.fromEntries(
    CRITERIA.map(({ id }) => {
      const best = options.reduce((winner, option) =>
        valueOf[id](option) < valueOf[id](winner) - 1e-9 ? option : winner,
      )
      return [id, best.mode]
    }),
  ) as Record<Criterion, TransportOptionId>

  const ranked = rankOptions(options)
  return { input: { ...input, modes }, options, bestBy, recommended: ranked[0].mode }
}

/** Options from best to worst overall. */
export function rankOptions(options: OptionResult[]): OptionResult[] {
  return options
    .map((option, index) => ({ option, index }))
    .sort(
      (a, b) =>
        b.option.overallScore - a.option.overallScore ||
        a.option.emissionsKg - b.option.emissionsKg ||
        a.option.timeMinutes - b.option.timeMinutes ||
        a.index - b.index,
    )
    .map(({ option }) => option)
}

export function findOption(result: ComparisonResult, mode: TransportOptionId): OptionResult {
  const option = result.options.find((entry) => entry.mode === mode)
  if (!option) throw new ComparisonError('calculation-failed', 'The option is not part of this comparison.')
  return option
}

const CRITERION_VALUE: Record<Criterion, (option: OptionResult) => number> = {
  emissions: (option) => option.emissionsKg,
  cost: (option) => option.costEur,
  time: (option) => option.timeMinutes,
}

/** True if the option is best on the criterion, including ties (e.g. walking and cycling both emit 0 kg). */
export function isBestOn(result: ComparisonResult, mode: TransportOptionId, criterion: Criterion): boolean {
  const value = CRITERION_VALUE[criterion]
  const best = value(findOption(result, result.bestBy[criterion]))
  return value(findOption(result, mode)) <= best + 1e-9
}

/** Plain-language reasons the recommended option was chosen. */
export function explainRecommendation(result: ComparisonResult): string[] {
  const recommended = findOption(result, result.recommended)
  const { priorities } = result.input
  const reasons: string[] = []

  const winsOn = CRITERIA.filter(({ id }) => isBestOn(result, recommended.mode, id))
  const topPriority = Math.max(priorities.emissions, priorities.cost, priorities.time)
  const mostImportant = CRITERIA.filter(({ id }) => priorities[id] === topPriority && topPriority > 0)

  for (const criterion of winsOn) {
    if (priorities[criterion.id] === 0) continue
    const tied = result.options.filter(
      (option) => option.mode !== recommended.mode && isBestOn(result, option.mode, criterion.id),
    )
    reasons.push(
      tied.length > 0
        ? `It has the ${criterion.better} of the options you compared (equal with ${listModes(tied.map((option) => option.mode))}).`
        : `It has the ${criterion.better} of the options you compared.`,
    )
  }

  for (const criterion of mostImportant) {
    if (winsOn.some(({ id }) => id === criterion.id)) continue
    const best = findOption(result, result.bestBy[criterion.id])
    reasons.push(
      `${criterion.label} matters most to you. ${getTransportOption(best.mode).label} is better on that alone, but it does worse on your other priorities.`,
    )
  }

  if (winsOn.filter(({ id }) => priorities[id] > 0).length < 2) {
    reasons.push('It gives the best overall balance between the things you said matter to you.')
  }
  return reasons
}

/** Option labels joined for headings, e.g. "Bus, Train and Car". */
export function listModes(modes: TransportOptionId[]): string {
  const labels = modes.map((mode) => getTransportOption(mode).label)
  if (labels.length <= 1) return labels.join('')
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}
