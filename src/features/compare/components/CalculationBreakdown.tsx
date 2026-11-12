import { t } from '../../../i18n'
import { RichText } from '../../../i18n/RichText'
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
import type { ComparisonResult, OptionResult } from '../types'
import { EstimateNotice, ModeName, Panel } from './CompareUi'

/** Screen 6 — Detailed breakdown. Shows every step of every estimate. */
export function CalculationBreakdown({ result }: { result: ComparisonResult }) {
  const { journey, priorities } = result.input
  const weight = totalWeight(priorities)

  return (
    <div className="compare-breakdown">
      <EstimateNotice />

      <Panel
        id="compare-method-title"
        title={t('compare.breakdown.method')}
        description={t('compare.breakdown.methodDescription', {
          distance: formatNumber(journey.distanceKm),
          people: formatPeople(journey.passengers),
        })}
      >
        <ul className="compare-method">
          <li>
            <RichText text={t('compare.breakdown.co2Formula')} values={{ label: <strong>{t('compare.breakdown.co2')}</strong> }} />
          </li>
          <li>
            <RichText text={t('compare.breakdown.costFormula')} values={{ label: <strong>{t('compare.breakdown.cost')}</strong> }} />
          </li>
          <li>
            <RichText text={t('compare.breakdown.timeFormula')} values={{ label: <strong>{t('compare.breakdown.time')}</strong> }} />
          </li>
        </ul>
      </Panel>

      {result.options.map((option) => (
        <OptionBreakdown key={option.mode} option={option} distanceKm={journey.distanceKm} passengers={journey.passengers} />
      ))}

      <Panel
        id="compare-scoring-title"
        title={t('compare.breakdown.scoring')}
        description={t('compare.breakdown.scoringDescription')}
      >
        <div className="compare-table-wrap">
          <table className="compare-table">
            <caption className="visually-hidden">{t('compare.breakdown.scoresCaption')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('compare.results.option')}</th>
                {CRITERIA.map((criterion) => (
                  <th key={criterion.id} scope="col">
                    {criterion.label}
                    <span className="compare-table__sub">
                      {t('compare.breakdown.weight', {
                        weight: priorities[criterion.id],
                        level: priorityLabel(priorities[criterion.id]),
                      })}
                    </span>
                  </th>
                ))}
                <th scope="col">{t('compare.breakdown.overall')}</th>
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
          {t('compare.breakdown.formula', {
            terms: CRITERIA.map(
              (criterion) => `${priorities[criterion.id]} × ${t(`compare.breakdown.scoreNames.${criterion.id}`)}`,
            ).join(' + '),
            weight,
          })}
        </p>
      </Panel>
    </div>
  )
}

function OptionBreakdown({ option, distanceKm, passengers }: { option: OptionResult; distanceKm: number; passengers: number }) {
  const details = getTransportOption(option.mode)
  const factor = emissionFactorFor(option.mode)
  const sharers = sharersFor(option.mode, passengers)
  const shared = sharers > 1 ? ` ${t('compare.breakdown.sharedBy', { people: formatPeople(sharers) })}` : ''
  const id = `compare-breakdown-${option.mode}`

  return (
    <section className="compare-panel" aria-labelledby={id}>
      <h3 id={id} className="compare-panel__title">
        <ModeName mode={option.mode} />
      </h3>
      <dl className="compare-calc">
        <div>
          <dt>{t('compare.criteria.emissions.label')}</dt>
          <dd>
            <span className="compare-calc__formula">
              {formatNumber(distanceKm)} km × {formatFactor(factor)} kg/km{shared}
            </span>
            <strong>= {formatKg(option.emissionsKg)}</strong>
          </dd>
        </div>
        <div>
          <dt>{t('compare.criteria.cost.label')}</dt>
          <dd>
            <span className="compare-calc__formula">
              ({formatEuro(details.fixedCostEur)} + {formatNumber(distanceKm)} km × {formatEuro(details.costPerKmEur)}/km){shared}
            </span>
            <strong>= {formatEuro(option.costEur)}</strong>
          </dd>
        </div>
        <div>
          <dt>{t('compare.criteria.time.label')}</dt>
          <dd>
            <span className="compare-calc__formula">
              {formatNumber(distanceKm)} km ÷ {details.speedKmh} km/h + {formatDuration(details.overheadMinutes)}
            </span>
            <strong>= {formatDuration(option.timeMinutes)}</strong>
          </dd>
        </div>
        <div>
          <dt>{t('compare.breakdown.assumptions')}</dt>
          <dd>{details.assumptions}</dd>
        </div>
      </dl>
    </section>
  )
}
