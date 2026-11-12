import { Button } from '../../../components/Button'
import { useI18n } from '../../../i18n'
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
  const { t } = useI18n()
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
        return t('compare.recommendation.tradeOff', {
          difference: formatKgDifference(recommended.emissionsKg - best.emissionsKg),
          option: label,
          value: formatKg(best.emissionsKg),
        })
      case 'cost':
        return t('compare.recommendation.tradeOff', {
          difference: formatEuroDifference(recommended.costEur - best.costEur),
          option: label,
          value: formatEuro(best.costEur),
        })
      case 'time':
        return t('compare.recommendation.tradeOff', {
          difference: formatDurationDifference(recommended.timeMinutes - best.timeMinutes),
          option: label,
          value: formatDuration(best.timeMinutes),
        })
    }
  })

  return (
    <div className="compare-recommendation">
      <section className="compare-hero" aria-labelledby="compare-recommended-name">
        <p className="compare-hero__label">{t('compare.recommendation.label')}</p>
        <h3 id="compare-recommended-name" className="compare-hero__name">
          <ModeName mode={recommended.mode} size={26} />
        </h3>
        <dl className="compare-hero__values">
          <div>
            <dt>{t('compare.criteria.emissions.label')}</dt>
            <dd>{formatKg(recommended.emissionsKg)}</dd>
          </div>
          <div>
            <dt>{t('compare.criteria.cost.label')}</dt>
            <dd>{formatEuro(recommended.costEur)}</dd>
          </div>
          <div>
            <dt>{t('compare.criteria.time.label')}</dt>
            <dd>{formatDuration(recommended.timeMinutes)}</dd>
          </div>
          <div>
            <dt>{t('compare.recommendation.matchLabel')}</dt>
            <dd>{formatPercent(recommended.overallScore)}</dd>
          </div>
        </dl>
      </section>

      <Panel id="compare-why-title" title={t('compare.recommendation.why')}>
        <ul className="compare-reasons">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <p className="compare-muted">
          {t('compare.recommendation.yourPriorities', {
            list: CRITERIA.map((criterion) =>
              t('compare.recommendation.priorityItem', {
                criterion: criterion.label,
                level: priorityLabel(priorities[criterion.id]),
              }),
            ).join(', '),
          })}
        </p>
      </Panel>

      <Panel id="compare-tradeoffs-title" title={t('compare.recommendation.tradeOffs')}>
        {tradeOffs.length === 0 ? (
          <p>{t('compare.recommendation.noTradeOffs')}</p>
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
            {t('compare.recommendation.nextBest', {
              option: getTransportOption(runnerUp.mode).label,
              percent: formatPercent(runnerUp.overallScore),
            })}
          </p>
        )}
      </Panel>

      <EstimateNotice />

      <div className="compare-actions">
        <Button variant="secondary" onClick={onScenario}>
          {t('compare.recommendation.tryScenario')}
        </Button>
        <Button icon="bookmark" onClick={onSave}>
          {t('compare.recommendation.save')}
        </Button>
      </div>
    </div>
  )
}
