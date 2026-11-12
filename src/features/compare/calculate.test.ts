import { describe, expect, it } from 'vitest'
import { transportFactor } from '../tracking/emissionFactors'
import { calculateComparison, estimateEmissions } from './calculate'

describe('shared emission factors', () => {
  it('Compare uses the same CO₂ factors as Tracking', () => {
    expect(estimateEmissions('train', 10, 1)).toBeCloseTo(10 * transportFactor('train').kgPerUnit)
    expect(estimateEmissions('car', 10, 2)).toBeCloseTo((10 * transportFactor('car-petrol').kgPerUnit) / 2)
    expect(estimateEmissions('electric-car', 10, 1)).toBeCloseTo(10 * transportFactor('car-electric').kgPerUnit)
  })

  it('recommends by weighted priorities', () => {
    const result = calculateComparison({
      modes: ['bus', 'train', 'car'],
      journey: { from: 'Dom', to: 'Fakultet', distanceKm: 18.5, passengers: 2 },
      priorities: { emissions: 3, cost: 2, time: 0 },
    })
    expect(result.recommended).toBe('train')
  })
})
