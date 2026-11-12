import { useState } from 'react'
import { Button } from '../../../components/Button'
import { useI18n, type MessageKey } from '../../../i18n'
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
  const { t } = useI18n()
  const [error, setError] = useState<MessageKey>()

  function handleContinue() {
    if (modes.length < 2) {
      setError(modes.length === 0 ? 'compare.transport.noneChosen' : 'compare.transport.oneMore')
      document.querySelector<HTMLInputElement>('.compare-mode-card__input')?.focus()
      return
    }
    onContinue(modes)
  }

  return (
    <div className="compare-step">
      <ModePicker
        legend={t('compare.transport.legend')}
        selected={modes}
        error={error ? t(error) : undefined}
        onChange={(next) => {
          setModes(next)
          if (next.length >= 2) setError(undefined)
        }}
      />
      <div className="compare-actions">
        <Button variant="secondary" onClick={onBack}>
          {t('compare.transport.back')}
        </Button>
        <Button icon="arrow-right" onClick={handleContinue}>
          {t('compare.transport.continue')}
        </Button>
      </div>
    </div>
  )
}
