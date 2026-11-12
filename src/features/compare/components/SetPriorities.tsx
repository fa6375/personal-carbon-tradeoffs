import { useState } from 'react'
import { Button } from '../../../components/Button'
import { useI18n } from '../../../i18n'
import { totalWeight } from '../calculate'
import type { Priorities } from '../types'
import { PriorityFields } from './PriorityFields'

interface SetPrioritiesProps {
  initial: Priorities
  onCompare: (priorities: Priorities) => void
  onBack: (priorities: Priorities) => void
}



/** Screen 4 — Set priorities. */
export function SetPriorities({ initial, onCompare, onBack }: SetPrioritiesProps) {
  const [priorities, setPriorities] = useState(initial)
  const { t } = useI18n()
  const [error, setError] = useState(false)

  function handleCompare() {
    if (totalWeight(priorities) === 0) {
      setError(true)
      return
    }
    onCompare(priorities)
  }

  return (
    <div className="compare-step">
      <p className="compare-lead">{t('compare.priorities.lead')}</p>
      <PriorityFields
        priorities={priorities}
        error={error ? t('compare.noPriority') : undefined}
        onChange={(next) => {
          setPriorities(next)
          if (totalWeight(next) > 0) setError(false)
        }}
      />
      <div className="compare-actions">
        <Button variant="secondary" onClick={() => onBack(priorities)}>
          {t('compare.priorities.back')}
        </Button>
        <Button icon="arrow-right" onClick={handleCompare}>
          {t('compare.priorities.compare')}
        </Button>
      </div>
    </div>
  )
}
