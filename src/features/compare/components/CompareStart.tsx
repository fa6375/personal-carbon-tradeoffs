import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import { Icon } from '../../../components/Icon'
import { CRITERIA } from '../criteria'

interface CompareStartProps {
  hasCurrent: boolean
  onStart: () => void
  onContinue: () => void
}

const STEPS = [
  { title: 'Choose how you could travel', text: 'Pick at least two options, such as bus, train or car.' },
  { title: 'Describe the journey', text: 'Where you start, where you go, how far it is and how many of you travel.' },
  { title: 'Say what matters to you', text: 'Weigh CO₂, cost and travel time to get a recommendation that fits you.' },
]

/** Screen 1 — Start. */
export function CompareStart({ hasCurrent, onStart, onContinue }: CompareStartProps) {
  return (
    <div className="compare-start">
      <div className="compare-start__intro compare-panel">
        <p>
          Compare different ways of making the same trip side by side. Carbon Choices estimates the
          CO₂ emissions, cost and travel time of each option and recommends the one that best
          matches your priorities.
        </p>
        <ul className="compare-start__criteria" aria-label="What is compared">
          {CRITERIA.map((criterion) => (
            <li key={criterion.id}>
              <Icon name={criterion.icon} size={18} />
              {criterion.label}
            </li>
          ))}
        </ul>
        <div className="compare-actions compare-actions--start">
          <Button icon="arrow-right" onClick={onStart}>
            {hasCurrent ? 'Start a new comparison' : 'Start comparison'}
          </Button>
          {hasCurrent && (
            <Button variant="secondary" onClick={onContinue}>
              Continue current comparison
            </Button>
          )}
          <ButtonLink href="#/saved" variant="secondary" icon="bookmark">
            Saved comparisons
          </ButtonLink>
        </div>
      </div>

      <ol className="compare-start__steps" aria-label="How it works">
        {STEPS.map((step, index) => (
          <li key={step.title} className="compare-start__step">
            <span className="compare-start__number" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h3 className="compare-start__step-title">{step.title}</h3>
              <p className="compare-start__step-text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
