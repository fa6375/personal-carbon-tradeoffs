import { Button } from '../../../components/Button'
import { ButtonLink } from '../../../components/ButtonLink'
import { Icon } from '../../../components/Icon'
import type { CompareProblem } from '../types'

interface CompareErrorProps {
  problem: CompareProblem
  /** Main way out, for example "Fix the journey" or "Try again". */
  primary?: { label: string; onClick: () => void }
  onStartOver: () => void
}

const TITLES: Record<CompareProblem['kind'], string> = {
  'invalid-input': 'Some details are not valid',
  'missing-information': 'Some information is missing',
  'calculation-failed': 'The comparison could not be calculated',
  'not-found': 'This saved comparison could not be found',
  storage: 'Saved comparisons could not be loaded',
}

const ADVICE: Record<CompareProblem['kind'], string> = {
  'invalid-input': 'Check the value mentioned above and try again. Nothing has been lost.',
  'missing-information': 'Go back to the step that is missing information. What you already entered is kept.',
  'calculation-failed': 'Try again. If it keeps happening, start a new comparison with different details.',
  'not-found': 'It may have been deleted, or it was saved in a different browser.',
  storage: 'Your browser may be blocking site storage, or the saved data is damaged. Try again, or start a new comparison.',
}

/** Screen 10 — Error. Explains what went wrong and how to continue. */
export function CompareError({ problem, primary, onStartOver }: CompareErrorProps) {
  return (
    <div className="compare-error" role="alert">
      <span className="compare-error__icon">
        <Icon name="info" size={24} />
      </span>
      <div className="compare-error__body">
        <p className="compare-error__title">{TITLES[problem.kind]}</p>
        <p>{problem.message}</p>
        <p className="compare-muted">{ADVICE[problem.kind]}</p>
        <div className="compare-actions compare-actions--start">
          {primary && <Button onClick={primary.onClick}>{primary.label}</Button>}
          {problem.kind === 'not-found' || problem.kind === 'storage' ? (
            <ButtonLink href="#/saved" variant="secondary">
              Saved comparisons
            </ButtonLink>
          ) : null}
          <Button variant="secondary" onClick={onStartOver}>
            Start a new comparison
          </Button>
        </div>
      </div>
    </div>
  )
}
