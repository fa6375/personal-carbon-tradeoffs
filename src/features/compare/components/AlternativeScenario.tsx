import { useId, useState } from 'react'
import { Button } from '../../../components/Button'
import { ComparisonError, calculateComparison, totalWeight } from '../calculate'
import { NO_PRIORITY_ERROR } from '../criteria'
import {
  formatDuration,
  formatEuro,
  formatKg,
  formatNumber,
  formatPeople,
} from '../format'
import { getTransportOption } from '../transportOptions'
import type { ComparisonInput, ComparisonResult, OptionResult, Priorities, TransportOptionId } from '../types'
import { MAX_DISTANCE_KM, MAX_PASSENGERS, parseDecimal, validateDistance, validatePassengers } from '../validation'
import { Field, ModeName, Panel } from './CompareUi'
import { ModePicker } from './ModePicker'
import { PriorityFields } from './PriorityFields'

interface AlternativeScenarioProps {
  result: ComparisonResult
  onApply: (input: ComparisonInput) => void
  onCancel: () => void
}

/** Screen 8 — Alternative scenario. Changes are recalculated live next to the current result. */
export function AlternativeScenario({ result, onApply, onCancel }: AlternativeScenarioProps) {
  const current = result.input
  const [modes, setModes] = useState<TransportOptionId[]>(current.modes)
  const [distance, setDistance] = useState(String(current.journey.distanceKm))
  const [passengers, setPassengers] = useState(String(current.journey.passengers))
  const [priorities, setPriorities] = useState<Priorities>(current.priorities)
  const prefix = useId()

  const distanceError = validateDistance(distance)
  const passengersError = validatePassengers(passengers)
  const modesError = modes.length < 2 ? 'Choose at least two ways to travel.' : undefined
  const prioritiesError = totalWeight(priorities) === 0 ? NO_PRIORITY_ERROR : undefined
  const hasErrors = Boolean(distanceError || passengersError || modesError || prioritiesError)

  let scenario: ComparisonResult | null = null
  let calculationError: string | null = null
  if (!hasErrors) {
    try {
      scenario = calculateComparison({
        modes,
        journey: { ...current.journey, distanceKm: parseDecimal(distance), passengers: Number(passengers) },
        priorities,
      })
    } catch (reason) {
      calculationError = reason instanceof ComparisonError ? reason.message : 'The scenario could not be calculated.'
    }
  }

  const changed =
    scenario !== null &&
    (modes.join() !== current.modes.join() ||
      scenario.input.journey.distanceKm !== current.journey.distanceKm ||
      scenario.input.journey.passengers !== current.journey.passengers ||
      priorities.emissions !== current.priorities.emissions ||
      priorities.cost !== current.priorities.cost ||
      priorities.time !== current.priorities.time)

  function reset() {
    setModes(current.modes)
    setDistance(String(current.journey.distanceKm))
    setPassengers(String(current.journey.passengers))
    setPriorities(current.priorities)
  }

  const distanceValue = parseDecimal(distance)
  const passengerValue = Number(passengers)

  return (
    <div className="compare-scenario">
      <p className="compare-lead">
        Change the journey, the options or your priorities and see how the result would change. Your
        current comparison stays as it is until you choose <strong>Use this scenario</strong>.
      </p>

      <div className="compare-scenario__layout">
        <Panel id="compare-scenario-inputs" title="Change the scenario">
          <div className="compare-form compare-form--wide">
            <Field
              id={`${prefix}-distance`}
              label={`Distance (one way, current: ${formatNumber(current.journey.distanceKm)} km)`}
              unit="km"
              inputMode="decimal"
              value={distance}
              error={distanceError}
              onChange={setDistance}
            />
            <div className="compare-quick">
              <Button
                variant="secondary"
                disabled={Boolean(distanceError) || distanceValue * 2 > MAX_DISTANCE_KM}
                onClick={() => setDistance(String(Math.round(distanceValue * 2 * 100) / 100))}
              >
                Double the distance
              </Button>
            </div>
            <Field
              id={`${prefix}-passengers`}
              label={`People travelling together (current: ${current.journey.passengers})`}
              inputMode="numeric"
              value={passengers}
              error={passengersError}
              onChange={setPassengers}
            />
            <div className="compare-quick">
              <Button
                variant="secondary"
                disabled={Boolean(passengersError) || passengerValue <= 1}
                onClick={() => setPassengers(String(passengerValue - 1))}
              >
                One person fewer
              </Button>
              <Button
                variant="secondary"
                disabled={Boolean(passengersError) || passengerValue >= MAX_PASSENGERS}
                onClick={() => setPassengers(String(passengerValue + 1))}
              >
                One person more
              </Button>
            </div>
            <ModePicker legend="Ways of travelling" selected={modes} error={modesError} onChange={setModes} compact />
            <div>
              <h4 className="compare-subheading">Priorities</h4>
              <PriorityFields priorities={priorities} error={prioritiesError} onChange={setPriorities} />
            </div>
          </div>
        </Panel>

        <Panel
          id="compare-scenario-result"
          title="Scenario result"
          description={
            scenario
              ? `${formatNumber(scenario.input.journey.distanceKm)} km · ${formatPeople(scenario.input.journey.passengers)} · per person`
              : undefined
          }
          className="compare-scenario__result"
        >
          <div aria-live="polite">
            {hasErrors && (
              <p className="compare-muted">Correct the highlighted fields to see the scenario result.</p>
            )}
            {calculationError && (
              <p className="compare-field__error" role="alert">
                {calculationError}
              </p>
            )}
            {scenario && (
              <>
                <p className="compare-scenario__verdict">
                  {scenario.recommended === result.recommended ? (
                    <>
                      The recommendation stays <strong>{getTransportOption(scenario.recommended).label}</strong>.
                    </>
                  ) : (
                    <>
                      The recommendation changes from{' '}
                      <strong>{getTransportOption(result.recommended).label}</strong> to{' '}
                      <strong>{getTransportOption(scenario.recommended).label}</strong>.
                    </>
                  )}
                </p>
                <ul className="compare-scenario__list">
                  {scenario.options.map((option) => (
                    <ScenarioRow
                      key={option.mode}
                      option={option}
                      before={result.options.find((entry) => entry.mode === option.mode)}
                      recommended={option.mode === scenario.recommended}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="compare-actions">
            <Button variant="secondary" onClick={reset} disabled={!changed}>
              Reset changes
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={!scenario || !changed} onClick={() => scenario && onApply(scenario.input)}>
              Use this scenario
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function ScenarioRow({ option, before, recommended }: { option: OptionResult; before?: OptionResult; recommended: boolean }) {
  const rows = [
    { label: 'CO₂', now: formatKg(option.emissionsKg), was: before && formatKg(before.emissionsKg) },
    { label: 'Cost', now: formatEuro(option.costEur), was: before && formatEuro(before.costEur) },
    { label: 'Time', now: formatDuration(option.timeMinutes), was: before && formatDuration(before.timeMinutes) },
  ]
  return (
    <li className={`compare-scenario__item${recommended ? ' compare-scenario__item--recommended' : ''}`}>
      <div className="compare-scenario__item-header">
        <ModeName mode={option.mode} size={16} />
        {recommended && <span className="compare-badge compare-badge--recommended">★ Recommended</span>}
        {!before && <span className="compare-badge compare-badge--neutral">New option</span>}
      </div>
      <dl className="compare-scenario__values">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>
              {row.now}
              {row.was && row.was !== row.now && <span className="compare-scenario__was">was {row.was}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </li>
  )
}
