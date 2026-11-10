import { useState } from 'react'
import { Button } from '../../../components/Button'
import type { TransportOptionId } from '../types'
import { ModePicker } from './ModePicker'

interface ChooseTransportProps {
  initial: TransportOptionId[]
  onContinue: (modes: TransportOptionId[]) => void
  onBack: () => void
}

/** Screen 2 — Choose transport. */
export function ChooseTransport({ initial, onContinue, onBack }: ChooseTransportProps) {
  const [modes, setModes] = useState(initial)
  const [error, setError] = useState<string>()

  function handleContinue() {
    if (modes.length < 2) {
      setError(
        modes.length === 0
          ? 'Choose at least two ways to travel to compare.'
          : 'Choose at least one more way to travel. A comparison needs two or more options.',
      )
      document.querySelector<HTMLInputElement>('.compare-mode-card__input')?.focus()
      return
    }
    onContinue(modes)
  }

  return (
    <div className="compare-step">
      <ModePicker
        legend="Which ways of travelling do you want to compare? Choose at least two."
        selected={modes}
        error={error}
        onChange={(next) => {
          setModes(next)
          if (next.length >= 2) setError(undefined)
        }}
      />
      <div className="compare-actions">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button icon="arrow-right" onClick={handleContinue}>
          Continue to journey
        </Button>
      </div>
    </div>
  )
}
