import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import { Icon } from '../../../components/Icon'
import { useI18n } from '../../../i18n'
import { CRITERIA } from '../criteria'

interface CompareStartProps {
  hasCurrent: boolean
  onStart: () => void
  onContinue: () => void
}

const STEPS = ['choose', 'describe', 'priorities'] as const

/** Screen 1 — Start. */
export function CompareStart({ hasCurrent, onStart, onContinue }: CompareStartProps) {
  const { t } = useI18n()
  return (
    <div className="compare-start">
      <div className="compare-start__intro compare-panel">
        <p>{t('compare.start.intro')}</p>
        <ul className="compare-start__criteria" aria-label={t('compare.start.criteriaLabel')}>
          {CRITERIA.map((criterion) => (
            <li key={criterion.id}>
              <Icon name={criterion.icon} size={18} />
              {criterion.label}
            </li>
          ))}
        </ul>
        <div className="compare-actions compare-actions--start">
          <Button icon="arrow-right" onClick={onStart}>
            {hasCurrent ? t('compare.start.startNew') : t('compare.start.start')}
          </Button>
          {hasCurrent && (
            <Button variant="secondary" onClick={onContinue}>
              {t('compare.start.continue')}
            </Button>
          )}
          <ButtonLink href="#/saved" variant="secondary" icon="bookmark">
            {t('compare.start.saved')}
          </ButtonLink>
        </div>
      </div>

      <ol className="compare-start__steps" aria-label={t('compare.start.howLabel')}>
        {STEPS.map((step, index) => (
          <li key={step} className="compare-start__step">
            <span className="compare-start__number" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h3 className="compare-start__step-title">{t(`compare.start.steps.${step}.title`)}</h3>
              <p className="compare-start__step-text">{t(`compare.start.steps.${step}.text`)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
