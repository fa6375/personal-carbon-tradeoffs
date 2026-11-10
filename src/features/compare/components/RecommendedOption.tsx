import { Button } from '../../../components/Button'
import { CRITERIA, priorityLabel } from '../criteria'
import { explainRecommendation, findOption, isBestOn, rankOptions } from '../calculate'
import {
  formatDuration,
  formatDurationDifference,
  formatEuro,
  formatEuroDifference,
  formatKg,
  formatKgDifference,
  formatPercent,
} from '../format'
import { getTransportOption } from '../transportOptions'
import type { ComparisonResult } from '../types'
import { EstimateNotice, ModeName, Panel } from './CompareUi'

interface RecommendedOptionProps {
  result: ComparisonResult
  onScenario: () => void
  onSave: () => void
}

/** Screen 7 — Recommended option, with the reasons it was chosen. */
export function RecommendedOption({ result, onScenario, onSave }: RecommendedOptionProps) {
  const recommended = findOption(result, result.recommended)
  const reasons = explainRecommendation(result)
  const runnerUp = rankOptions(result.options)[1]
  const { priorities } = result.input

  // What the user gives up compared with the best option on each criterion.
  const tradeOffs = CRITERIA.filter(({ id }) => !isBestOn(result, recommended.mode, id)).map((criterion) => {
    const best = findOption(result, result.bestBy[criterion.id])
    const label = getTransportOption(best.mode).label
    switch (criterion.id) {
      case 'emissions':
        return `${formatKgDifference(recommended.emissionsKg - best.emissionsKg)} compared with ${label} (${formatKg(best.emissionsKg)}).`
      case 'cost':
        return `${formatEuroDifference(recommended.costEur - best.costEur)} compared with ${label} (${formatEuro(best.costEur)}).`
      case 'time':
        return `${formatDurationDifference(recommended.timeMinutes - best.timeMinutes)} compared with ${label} (${formatDuration(best.timeMinutes)}).`
    }
  })

  return (
    <div className="compare-recommendation">
      <section className="compare-hero" aria-labelledby="compare-recommended-name">
        <p className="compare-hero__label">Recommended for you</p>
        <h3 id="compare-recommended-name" className="compare-hero__name">
          <ModeName mode={recommended.mode} size={26} />
        </h3>
        <dl className="compare-hero__values">
          <div>
            <dt>CO₂ emissions</dt>
            <dd>{formatKg(recommended.emissionsKg)}</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>{formatEuro(recommended.costEur)}</dd>
          </div>
          <div>
            <dt>Travel time</dt>
            <dd>{formatDuration(recommended.timeMinutes)}</dd>
          </div>
          <div>
            <dt>Match with your priorities</dt>
            <dd>{formatPercent(recommended.overallScore)}</dd>
          </div>
        </dl>
      </section>

      <Panel id="compare-why-title" title="Why this option">
        <ul className="compare-reasons">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <p className="compare-muted">
          Your priorities: {CRITERIA.map((criterion) => `${criterion.label} – ${priorityLabel(priorities[criterion.id]).toLowerCase()}`).join(', ')}.
        </p>
      </Panel>

      <Panel id="compare-tradeoffs-title" title="What you trade off">
        {tradeOffs.length === 0 ? (
          <p>Nothing: this option is the best of the compared options on CO₂, cost and travel time.</p>
        ) : (
          <ul className="compare-reasons compare-reasons--tradeoffs">
            {CRITERIA.filter(({ id }) => !isBestOn(result, recommended.mode, id)).map((criterion, index) => (
              <li key={criterion.id}>
                <strong>{criterion.label}:</strong> {tradeOffs[index]}
              </li>
            ))}
          </ul>
        )}
        {runnerUp && (
          <p className="compare-muted">
            Next best: <strong>{getTransportOption(runnerUp.mode).label}</strong> with a{' '}
            {formatPercent(runnerUp.overallScore)} match.
          </p>
        )}
      </Panel>

      <EstimateNotice />

      <div className="compare-actions">
        <Button variant="secondary" onClick={onScenario}>
          Try another scenario
        </Button>
        <Button icon="bookmark" onClick={onSave}>
          Save comparison
        </Button>
      </div>
    </div>
  )
}
