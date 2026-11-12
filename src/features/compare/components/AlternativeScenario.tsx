import { useId, useState } from 'react'
import { Button } from '../../../components/Button'
import { useI18n } from '../../../i18n'
import { RichText } from '../../../i18n/RichText'
import { ComparisonError, calculateComparison, totalWeight } from '../calculate'
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
  const { t } = useI18n()
  const current = result.input
  const [modes, setModes] = useState<TransportOptionId[]>(current.modes)
  const [distance, setDistance] = useState(String(current.journey.distanceKm))
  const [passengers, setPassengers] = useState(String(current.journey.passengers))
  const [priorities, setPriorities] = useState<Priorities>(current.priorities)
  const prefix = useId()

  const distanceMessage = validateDistance(distance)
  const passengersMessage = validatePassengers(passengers)
  const distanceError = distanceMessage && t(distanceMessage.key, distanceMessage.params)
  const passengersError = passengersMessage && t(passengersMessage.key, passengersMessage.params)
  const modesError = modes.length < 2 ? t('compare.scenario.modesError') : undefined
  const prioritiesError = totalWeight(priorities) === 0 ? t('compare.noPriority') : undefined
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
      calculationError =
        reason instanceof ComparisonError && reason.messageKey
          ? t(reason.messageKey, reason.messageParams)
          : t('compare.calcErrors.scenarioFailed')
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
        <RichText text={t('compare.scenario.lead')} values={{ use: <strong>{t('compare.scenario.use')}</strong> }} />
      </p>

      <div className="compare-scenario__layout">
        <Panel id="compare-scenario-inputs" title={t('compare.scenario.change')}>
          <div className="compare-form compare-form--wide">
            <Field
              id={`${prefix}-distance`}
              label={t('compare.scenario.distance', { km: formatNumber(current.journey.distanceKm) })}
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
                {t('compare.scenario.double')}
              </Button>
            </div>
            <Field
              id={`${prefix}-passengers`}
              label={t('compare.scenario.passengers', { count: current.journey.passengers })}
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
                {t('compare.scenario.fewer')}
              </Button>
              <Button
                variant="secondary"
                disabled={Boolean(passengersError) || passengerValue >= MAX_PASSENGERS}
                onClick={() => setPassengers(String(passengerValue + 1))}
              >
                {t('compare.scenario.more')}
              </Button>
            </div>
            <ModePicker legend={t('compare.scenario.modes')} selected={modes} error={modesError} onChange={setModes} compact />
            <div>
              <h4 className="compare-subheading">{t('compare.scenario.priorities')}</h4>
              <PriorityFields priorities={priorities} error={prioritiesError} onChange={setPriorities} />
            </div>
          </div>
        </Panel>

        <Panel
          id="compare-scenario-result"
          title={t('compare.scenario.result')}
          description={
            scenario
              ? t('compare.scenario.resultDescription', {
                  distance: formatNumber(scenario.input.journey.distanceKm),
                  people: formatPeople(scenario.input.journey.passengers),
                })
              : undefined
          }
          className="compare-scenario__result"
        >
          <div aria-live="polite">
            {hasErrors && (
              <p className="compare-muted">{t('compare.scenario.fixFields')}</p>
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
                    <RichText
                      text={t('compare.scenario.stays')}
                      values={{ option: <strong>{getTransportOption(scenario.recommended).label}</strong> }}
                    />
                  ) : (
                    <RichText
                      text={t('compare.scenario.changes')}
                      values={{
                        from: <strong>{getTransportOption(result.recommended).label}</strong>,
                        to: <strong>{getTransportOption(scenario.recommended).label}</strong>,
                      }}
                    />
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
              {t('compare.scenario.reset')}
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              {t('compare.scenario.cancel')}
            </Button>
            <Button disabled={!scenario || !changed} onClick={() => scenario && onApply(scenario.input)}>
              {t('compare.scenario.use')}
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function ScenarioRow({ option, before, recommended }: { option: OptionResult; before?: OptionResult; recommended: boolean }) {
  const { t } = useI18n()
  const rows = [
    { label: t('compare.scenario.co2'), now: formatKg(option.emissionsKg), was: before && formatKg(before.emissionsKg) },
    { label: t('compare.scenario.cost'), now: formatEuro(option.costEur), was: before && formatEuro(before.costEur) },
    { label: t('compare.scenario.time'), now: formatDuration(option.timeMinutes), was: before && formatDuration(before.timeMinutes) },
  ]
  return (
    <li className={`compare-scenario__item${recommended ? ' compare-scenario__item--recommended' : ''}`}>
      <div className="compare-scenario__item-header">
        <ModeName mode={option.mode} size={16} />
        {recommended && <span className="compare-badge compare-badge--recommended">{t('compare.results.recommended')}</span>}
        {!before && <span className="compare-badge compare-badge--neutral">{t('compare.scenario.newOption')}</span>}
      </div>
      <dl className="compare-scenario__values">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>
              {row.now}
              {row.was && row.was !== row.now && <span className="compare-scenario__was">{t('compare.scenario.was', { value: row.was })}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </li>
  )
}
