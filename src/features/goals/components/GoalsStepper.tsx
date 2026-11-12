import { useI18n } from '../../../i18n'
import type { GoalsStage } from '../stages'
import type { GoalsStageId } from '../types'

interface GoalsStepperProps {
  stages: GoalsStage[]
  current: GoalsStageId
  onSelect: (id: GoalsStageId) => void
}

/** Step navigation for the Goals feature. Every step can be opened directly. */
export function GoalsStepper({ stages, current, onSelect }: GoalsStepperProps) {
  const { t } = useI18n()
  return (
    <nav className="goals-stepper" aria-label={t('goals.stepsLabel')}>
      <ol className="goals-stepper__list">
        {stages.map((stage, index) => {
          const isCurrent = stage.id === current
          return (
            <li key={stage.id}>
              <button
                type="button"
                className="goals-stepper__button"
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onSelect(stage.id)}
              >
                <span className="goals-stepper__number" aria-hidden="true">
                  {index + 1}
                </span>
                <span>
                  <span className="visually-hidden">{t('goals.stepPrefix', { number: index + 1 })}</span>
                  {stage.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
