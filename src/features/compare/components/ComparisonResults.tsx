import { Button } from '../../../components/Button'
import { useI18n } from '../../../i18n'
import { RichText } from '../../../i18n/RichText'
import { CRITERIA } from '../criteria'
import {
  formatDuration,
  formatDurationDifference,
  formatEuro,
  formatEuroDifference,
  formatKg,
  formatKgDifference,
  formatPercent,
  formatPeople,
} from '../format'
import { findOption, isBestOn, rankOptions } from '../calculate'
import { getTransportOption } from '../transportOptions'
import type { ComparisonResult, Criterion, OptionResult } from '../types'
import { Badge, EstimateNotice, ModeName, Panel } from './CompareUi'

interface ComparisonResultsProps {
  result: ComparisonResult
  onRecommendation: () => void
  onBreakdown: () => void
  onScenario: () => void
}

const VALUE: Record<Criterion, (option: OptionResult) => number> = {
  emissions: (option) => option.emissionsKg,
  cost: (option) => option.costEur,
  time: (option) => option.timeMinutes,
}

const FORMAT: Record<Criterion, (value: number) => string> = {
  emissions: formatKg,
  cost: formatEuro,
  time: formatDuration,
}

const FORMAT_DIFFERENCE: Record<Criterion, (value: number) => string> = {
  emissions: formatKgDifference,
  cost: formatEuroDifference,
  time: formatDurationDifference,
}

/** Screen 5 — Comparison results. */
export function ComparisonResults({ result, onRecommendation, onBreakdown, onScenario }: ComparisonResultsProps) {
  const { t } = useI18n()
  const { journey } = result.input
  const ranked = rankOptions(result.options)
  const recommended = findOption(result, result.recommended)

  return (
    <div className="compare-results">
      <p className="compare-summary">
        <strong>
          {journey.from} → {journey.to}
        </strong>
        <span>
          {t('compare.results.summary', { distance: journey.distanceKm, people: formatPeople(journey.passengers) })}
        </span>
      </p>

      <ul className="compare-cards" aria-label={t('compare.results.optionsLabel')}>
        {ranked.map((option) => {
          const isRecommended = option.mode === result.recommended
          const bestOn = CRITERIA.filter(({ id }) => isBestOn(result, option.mode, id))
          return (
            <li key={option.mode}>
              <article
                className={`compare-card${isRecommended ? ' compare-card--recommended' : ''}`}
                aria-label={
                  isRecommended
                    ? t('compare.results.recommendedLabel', { option: getTransportOption(option.mode).label })
                    : getTransportOption(option.mode).label
                }
              >
                <div className="compare-card__header">
                  <h3 className="compare-card__title">
                    <ModeName mode={option.mode} />
                  </h3>
                  <span className="compare-card__match">{t('compare.results.match', { percent: formatPercent(option.overallScore) })}</span>
                </div>
                {(isRecommended || bestOn.length > 0) && (
                  <p className="compare-card__badges">
                    {isRecommended && <Badge tone="recommended">{t('compare.results.recommended')}</Badge>}
                    {bestOn.map(({ id }) => (
                      <Badge key={id} tone="best">
                        ✓ {t(`compare.results.best.${id}`)}
                      </Badge>
                    ))}
                  </p>
                )}
                <dl className="compare-card__values">
                  {CRITERIA.map((criterion) => (
                    <div key={criterion.id}>
                      <dt>{criterion.label}</dt>
                      <dd>{FORMAT[criterion.id](VALUE[criterion.id](option))}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </li>
          )
        })}
      </ul>

      <Panel
        id="compare-bars-title"
        title={t('compare.results.sideBySide')}
        description={t('compare.results.sideBySideDescription')}
      >
        <div className="compare-bar-groups">
          {CRITERIA.map((criterion) => {
            const max = Math.max(...result.options.map(VALUE[criterion.id]))
            return (
              <div key={criterion.id} className="compare-bar-group">
                <h4 className="compare-bar-group__title">{criterion.label}</h4>
                {result.options.map((option) => {
                  const value = VALUE[criterion.id](option)
                  const share = max > 0 ? value / max : 0
                  const text = FORMAT[criterion.id](value)
                  const isBest = isBestOn(result, option.mode, criterion.id)
                  return (
                    <div key={option.mode} className="compare-bar">
                      <div className="compare-bar__label">
                        <ModeName mode={option.mode} size={14} />
                        <span className="compare-bar__value">
                          {text}
                          {isBest && <span className="compare-bar__best">{t('compare.results.bestSuffix')}</span>}
                        </span>
                      </div>
                      <div
                        className="compare-bar__track"
                        role="img"
                        aria-label={t(isBest ? 'compare.results.barLabelBest' : 'compare.results.barLabel', {
                          criterion: criterion.label,
                          option: getTransportOption(option.mode).label,
                          value: text,
                        })}
                      >
                        <div
                          className={`compare-bar__fill compare-bar__fill--${criterion.id}`}
                          style={{ width: `${Math.max(share * 100, value > 0 ? 2 : 0)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel
        id="compare-table-title"
        title={t('compare.results.differences')}
        description={
          <RichText
            text={t('compare.results.differencesDescription')}
            values={{ option: <strong>{getTransportOption(recommended.mode).label}</strong> }}
          />
        }
      >
        <div className="compare-table-wrap">
          <table className="compare-table">
            <caption className="visually-hidden">{t('compare.results.tableCaption')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('compare.results.option')}</th>
                {CRITERIA.map((criterion) => (
                  <th key={criterion.id} scope="col">
                    {criterion.label}
                  </th>
                ))}
                <th scope="col">{t('compare.results.matchColumn')}</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((option) => (
                <tr key={option.mode}>
                  <th scope="row">
                    <ModeName mode={option.mode} size={16} />
                  </th>
                  {CRITERIA.map((criterion) => {
                    const value = VALUE[criterion.id](option)
                    const difference = value - VALUE[criterion.id](recommended)
                    return (
                      <td key={criterion.id}>
                        <span className="compare-table__value">{FORMAT[criterion.id](value)}</span>
                        {option.mode !== recommended.mode && (
                          <span className="compare-table__difference">
                            {FORMAT_DIFFERENCE[criterion.id](difference)}
                          </span>
                        )}
                      </td>
                    )
                  })}
                  <td>{formatPercent(option.overallScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <EstimateNotice />

      <div className="compare-actions">
        <Button variant="secondary" onClick={onBreakdown}>
          {t('compare.results.howCalculated')}
        </Button>
        <Button variant="secondary" onClick={onScenario}>
          {t('compare.results.tryScenario')}
        </Button>
        <Button icon="star" onClick={onRecommendation}>
          {t('compare.results.seeRecommendation')}
        </Button>
      </div>
    </div>
  )
}
