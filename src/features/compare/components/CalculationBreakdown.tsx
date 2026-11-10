import { CRITERIA, priorityLabel } from '../criteria'
import { sharersFor, totalWeight } from '../calculate'
import {
  formatDuration,
  formatEuro,
  formatFactor,
  formatKg,
  formatNumber,
  formatPercent,
  formatPeople,
} from '../format'
import { emissionFactorFor, getTransportOption } from '../transportOptions'
import type { ComparisonResult, Criterion, OptionResult } from '../types'
import { EstimateNotice, ModeName, Panel } from './CompareUi'

const SCORE_NAMES: Record<Criterion, string> = {
  emissions: 'CO₂ score',
  cost: 'cost score',
  time: 'time score',
}

/** Screen 6 — Detailed breakdown. Shows every step of every estimate. */
export function CalculationBreakdown({ result }: { result: ComparisonResult }) {
  const { journey, priorities } = result.input
  const weight = totalWeight(priorities)

  return (
    <div className="compare-breakdown">
      <EstimateNotice />

      <Panel
        id="compare-method-title"
        title="Method"
        description={`All figures are per person for one ${formatNumber(journey.distanceKm)} km trip with ${formatPeople(journey.passengers)}.`}
      >
        <ul className="compare-method">
          <li>
            <strong>CO₂</strong> = distance × emission factor (kg CO₂e per km), divided by the people in
            the car for car and electric car.
          </li>
          <li>
            <strong>Cost</strong> = fixed cost + distance × cost per km. Public transport is one ticket
            each; car fuel or charging and parking are shared by everyone in the car. Buying,
            insuring and maintaining a car are not included.
          </li>
          <li>
            <strong>Travel time</strong> = distance ÷ average speed + time to reach a stop, wait, or
            park.
          </li>
        </ul>
      </Panel>

      {result.options.map((option) => (
        <OptionBreakdown key={option.mode} option={option} distanceKm={journey.distanceKm} passengers={journey.passengers} />
      ))}

      <Panel
        id="compare-scoring-title"
        title="How the recommendation is scored"
        description="Each option scores from 0% (worst of the compared options) to 100% (best) on each criterion. The overall match weights those scores by your priorities."
      >
        <div className="compare-table-wrap">
          <table className="compare-table">
            <caption className="visually-hidden">Scores for each option and criterion</caption>
            <thead>
              <tr>
                <th scope="col">Option</th>
                {CRITERIA.map((criterion) => (
                  <th key={criterion.id} scope="col">
                    {criterion.label}
                    <span className="compare-table__sub">
                      weight {priorities[criterion.id]} · {priorityLabel(priorities[criterion.id]).toLowerCase()}
                    </span>
                  </th>
                ))}
                <th scope="col">Overall match</th>
              </tr>
            </thead>
            <tbody>
              {result.options.map((option) => (
                <tr key={option.mode}>
                  <th scope="row">
                    <ModeName mode={option.mode} size={16} />
                  </th>
                  {CRITERIA.map((criterion) => (
                    <td key={criterion.id}>{formatPercent(option.scores[criterion.id])}</td>
                  ))}
                  <td>
                    <strong>{formatPercent(option.overallScore)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="compare-formula">
          Overall match = ({CRITERIA.map((criterion) => `${priorities[criterion.id]} × ${SCORE_NAMES[criterion.id]}`).join(' + ')}) ÷ {weight}
        </p>
      </Panel>
    </div>
  )
}

function OptionBreakdown({ option, distanceKm, passengers }: { option: OptionResult; distanceKm: number; passengers: number }) {
  const details = getTransportOption(option.mode)
  const factor = emissionFactorFor(option.mode)
  const sharers = sharersFor(option.mode, passengers)
  const shared = sharers > 1 ? ` ÷ ${sharers} people` : ''
  const id = `compare-breakdown-${option.mode}`

  return (
    <section className="compare-panel" aria-labelledby={id}>
      <h3 id={id} className="compare-panel__title">
        <ModeName mode={option.mode} />
      </h3>
      <dl className="compare-calc">
        <div>
          <dt>CO₂ emissions</dt>
          <dd>
            <span className="compare-calc__formula">
              {formatNumber(distanceKm)} km × {formatFactor(factor)} kg/km{shared}
            </span>
            <strong>= {formatKg(option.emissionsKg)}</strong>
          </dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>
            <span className="compare-calc__formula">
              ({formatEuro(details.fixedCostEur)} + {formatNumber(distanceKm)} km × {formatEuro(details.costPerKmEur)}/km){shared}
            </span>
            <strong>= {formatEuro(option.costEur)}</strong>
          </dd>
        </div>
        <div>
          <dt>Travel time</dt>
          <dd>
            <span className="compare-calc__formula">
              {formatNumber(distanceKm)} km ÷ {details.speedKmh} km/h + {details.overheadMinutes} min
            </span>
            <strong>= {formatDuration(option.timeMinutes)}</strong>
          </dd>
        </div>
        <div>
          <dt>Assumptions</dt>
          <dd>{details.assumptions}</dd>
        </div>
      </dl>
    </section>
  )
}
