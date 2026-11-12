import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import { Icon } from '../../../components/Icon'
import { useI18n } from '../../../i18n'
import type { CompareProblem } from '../types'

interface CompareErrorProps {
  problem: CompareProblem
  /** Main way out, for example "Fix the journey" or "Try again". */
  primary?: { label: string; onClick: () => void }
  onStartOver: () => void
}


/** Screen 10 — Error. Explains what went wrong and how to continue. */
export function CompareError({ problem, primary, onStartOver }: CompareErrorProps) {
  const { t } = useI18n()
  return (
    <div className="compare-error" role="alert">
      <span className="compare-error__icon">
        <Icon name="info" size={24} />
      </span>
      <div className="compare-error__body">
        <p className="compare-error__title">{t(`compare.error.titles.${problem.kind}`)}</p>
        <p>{problem.messageKey ? t(problem.messageKey, problem.messageParams) : problem.message}</p>
        <p className="compare-muted">{t(`compare.error.advice.${problem.kind}`)}</p>
        <div className="compare-actions compare-actions--start">
          {primary && <Button onClick={primary.onClick}>{primary.label}</Button>}
          {problem.kind === 'not-found' || problem.kind === 'storage' ? (
            <ButtonLink href="#/saved" variant="secondary">
              {t('compare.error.saved')}
            </ButtonLink>
          ) : null}
          <Button variant="secondary" onClick={onStartOver}>
            {t('compare.error.startOver')}
          </Button>
        </div>
      </div>
    </div>
  )
}
