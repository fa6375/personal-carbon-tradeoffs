import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { AlternativeScenario } from '../features/compare/components/AlternativeScenario'
import { CalculationBreakdown } from '../features/compare/components/CalculationBreakdown'
import { ChooseTransport } from '../features/compare/components/ChooseTransport'
import { CompareError } from '../features/compare/components/CompareError'
import { CompareStart } from '../features/compare/components/CompareStart'
import { BackButton, LoadingState } from '../features/compare/components/CompareUi'
import { ComparisonResults } from '../features/compare/components/ComparisonResults'
import { JourneyDetails } from '../features/compare/components/JourneyDetails'
import { RecommendedOption } from '../features/compare/components/RecommendedOption'
import { SaveComparison } from '../features/compare/components/SaveComparison'
import { SetPriorities } from '../features/compare/components/SetPriorities'
import { ComparisonError, calculateComparison, totalWeight } from '../features/compare/calculate'
import { useComparisonRepository } from '../features/compare/useComparisonRepository'
import { useAuth } from '../features/auth/authContext'
import { DataError } from '../lib/dataErrors'
import { dataErrorCode } from '../lib/errorMessages'
import { t as translate, useI18n, type MessageKey } from '../i18n'
import { DEFAULT_PRIORITIES, NO_PRIORITY_ERROR } from '../features/compare/criteria'
import type {
  CompareProblem,
  CompareView,
  ComparisonInput,
  ComparisonResult,
  Priorities,
  SavedComparison,
  TransportOptionId,
} from '../features/compare/types'
import {
  EMPTY_JOURNEY,
  toFormValues,
  toJourney,
  validateJourney,
  type JourneyFormValues,
} from '../features/compare/validation'
import '../features/compare/compare.css'

type ViewName = CompareView['name']

const SETUP_STEPS: { name: ViewName; labelKey: MessageKey }[] = [
  { name: 'transport', labelKey: 'compare.steps.transport' },
  { name: 'journey', labelKey: 'compare.steps.journey' },
  { name: 'priorities', labelKey: 'compare.steps.priorities' },
  { name: 'results', labelKey: 'compare.steps.results' },
]

const RESULT_TABS: { name: ViewName; labelKey: MessageKey }[] = [
  { name: 'results', labelKey: 'compare.tabs.results' },
  { name: 'breakdown', labelKey: 'compare.tabs.breakdown' },
  { name: 'recommendation', labelKey: 'compare.tabs.recommendation' },
  { name: 'scenario', labelKey: 'compare.tabs.scenario' },
  { name: 'save', labelKey: 'compare.tabs.save' },
]

/** Reads the id from "#/compare?saved=<id>", the link used by Saved comparisons. */
function savedIdFromHash(): string | null {
  const match = /^#\/compare\/?\?saved=([^&]+)/.exec(window.location.hash)
  return match ? decodeURIComponent(match[1]) : null
}

function toProblem(reason: unknown): CompareProblem {
  if (reason instanceof ComparisonError) {
    return { kind: reason.kind, message: reason.message, messageKey: reason.messageKey, messageParams: reason.messageParams }
  }
  return {
    kind: 'calculation-failed',
    message: 'An unexpected error happened while calculating.',
    messageKey: 'compare.calcErrors.unexpected',
  }
}

/** Compare Everyday Choices (Faraj Aliyev). Hosts the ten screens of the feature. */
export function ComparePage() {
  const { t } = useI18n()
  const [view, setView] = useState<CompareView>({ name: 'start' })
  const [modes, setModes] = useState<TransportOptionId[]>([])
  const [journeyValues, setJourneyValues] = useState<JourneyFormValues>(EMPTY_JOURNEY)
  const [priorities, setPriorities] = useState<Priorities>(DEFAULT_PRIORITIES)
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [saved, setSaved] = useState<SavedComparison | null>(null)
  const [pendingSavedId, setPendingSavedId] = useState<string | null>(savedIdFromHash)
  const [lastSavedId, setLastSavedId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const viewRef = useRef<HTMLElement>(null)
  const repository = useComparisonRepository()
  const { status: authStatus } = useAuth()

  function go(next: CompareView, announce: string | null = null) {
    setView(next)
    setMessage(announce)
    // Move focus to the new screen so keyboard and screen reader users start there.
    requestAnimationFrame(() => {
      viewRef.current?.focus()
      viewRef.current?.scrollIntoView({ block: 'start' })
    })
  }

  // Open a saved comparison when the page is reached through "#/compare?saved=<id>".
  useEffect(() => {
    const onHashChange = () => {
      const id = savedIdFromHash()
      if (id) setPendingSavedId(id)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!pendingSavedId) return
    // Wait until Firebase has said whether someone is signed in.
    if (!repository && authStatus === 'loading') return
    let cancelled = false
    const id = pendingSavedId
    const request = repository
      ? repository.get(id)
      : Promise.reject(new DataError(authStatus === 'not-configured' ? 'not-configured' : 'not-signed-in'))
    request
      .then((found) => {
        if (cancelled) return
        if (!found) {
          go({
            name: 'error',
            problem: {
              kind: 'not-found',
              message: 'There is no saved comparison with this link.',
              messageKey: 'compare.calcErrors.notFoundLink',
            },
          })
          return
        }
        setModes(found.input.modes)
        setJourneyValues(toFormValues(found.input.journey))
        setPriorities(found.input.priorities)
        try {
          setResult(calculateComparison(found.input))
          setSaved(found)
          go({ name: 'results' }, translate('compare.announce.opened', { name: found.name }))
        } catch (reason) {
          setResult(null)
          go({ name: 'error', problem: toProblem(reason) })
        }
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        go({
          name: 'error',
          problem: {
            kind: 'storage',
            message: reason instanceof Error ? reason.message : 'Saved comparisons could not be read.',
            messageKey: `errors.data.${dataErrorCode(reason)}`,
          },
        })
      })
      .finally(() => {
        if (cancelled) return
        setLastSavedId(id)
        setPendingSavedId(null)
        // Keep the address at #/compare so a reload does not reopen the saved comparison.
        window.history.replaceState(null, '', '#/compare')
      })
    return () => {
      cancelled = true
    }
  }, [pendingSavedId, repository, authStatus])

  /** Validates the draft and calculates; shows the error screen if that is not possible. */
  function compare(input?: ComparisonInput) {
    try {
      let next = input
      if (!next) {
        if (modes.length < 2) {
          throw new ComparisonError(
            'missing-information',
            'Choose at least two ways to travel to compare.',
            'compare.transport.noneChosen',
          )
        }
        const errors = validateJourney(journeyValues)
        const first = Object.values(errors)[0]
        if (first) {
          const empty = !journeyValues.from.trim() || !journeyValues.to.trim() || !journeyValues.distanceKm.trim()
          throw new ComparisonError(
            empty ? 'missing-information' : 'invalid-input',
            `Journey details: ${first.key}`,
            'compare.validation.journeyPrefix',
            { error: translate(first.key, first.params) },
          )
        }
        if (totalWeight(priorities) === 0) {
          throw new ComparisonError('invalid-input', NO_PRIORITY_ERROR, 'compare.noPriority')
        }
        next = { modes, journey: toJourney(journeyValues), priorities }
      }
      const calculated = calculateComparison(next)
      setResult(calculated)
      setSaved(null)
      return calculated
    } catch (reason) {
      go({ name: 'error', problem: toProblem(reason) })
      return null
    }
  }

  /** The first setup step that still needs attention. */
  function firstIncompleteStep(): CompareView {
    if (modes.length < 2) return { name: 'transport' }
    if (Object.keys(validateJourney(journeyValues)).length > 0) return { name: 'journey' }
    return { name: 'priorities' }
  }

  function startNew() {
    setModes([])
    setJourneyValues(EMPTY_JOURNEY)
    setPriorities(DEFAULT_PRIORITIES)
    setResult(null)
    setSaved(null)
    go({ name: 'transport' })
  }

  function openStep(name: ViewName) {
    if (name === 'results') {
      if (compare()) go({ name: 'results' })
      return
    }
    go({ name } as CompareView)
  }

  const inSetup = view.name === 'transport' || view.name === 'journey' || view.name === 'priorities'
  const inResults = result !== null && RESULT_TABS.some((tab) => tab.name === view.name)

  const back: { label: string; to: CompareView } | null =
    view.name === 'transport' || view.name === 'error'
      ? { label: t('compare.backToStart'), to: { name: 'start' } }
      : null

  function renderView() {
    if (pendingSavedId) return <LoadingState label={t('compare.openingSaved')} />

    switch (view.name) {
      case 'start':
        return (
          <CompareStart
            hasCurrent={result !== null}
            onStart={startNew}
            onContinue={() => go({ name: 'results' })}
          />
        )
      case 'transport':
        return (
          <ChooseTransport
            initial={modes}
            onBack={() => go({ name: 'start' })}
            onContinue={(next) => {
              setModes(next)
              go({ name: 'journey' })
            }}
          />
        )
      case 'journey':
        return (
          <JourneyDetails
            initial={journeyValues}
            modes={modes}
            onBack={(values) => {
              setJourneyValues(values)
              go({ name: 'transport' })
            }}
            onContinue={(values) => {
              setJourneyValues(values)
              go({ name: 'priorities' })
            }}
          />
        )
      case 'priorities':
        return (
          <SetPriorities
            initial={priorities}
            onBack={(next) => {
              setPriorities(next)
              go({ name: 'journey' })
            }}
            onCompare={(next) => {
              setPriorities(next)
              if (modes.length < 2 || Object.keys(validateJourney(journeyValues)).length > 0) {
                compare()
                return
              }
              if (compare({ modes, journey: toJourney(journeyValues), priorities: next })) {
                go({ name: 'results' }, t('compare.announce.ready'))
              }
            }}
          />
        )
      case 'error': {
        const { problem } = view
        const primary =
          problem.kind === 'calculation-failed'
            ? {
                label: t('compare.error.tryAgain'),
                onClick: () => {
                  if (compare(result?.input)) go({ name: 'results' })
                },
              }
            : problem.kind === 'storage' && lastSavedId
              ? { label: t('compare.error.tryAgain'), onClick: () => setPendingSavedId(lastSavedId) }
              : problem.kind === 'invalid-input' || problem.kind === 'missing-information'
                ? { label: t('compare.error.checkDetails'), onClick: () => go(firstIncompleteStep()) }
                : undefined
        return <CompareError problem={problem} primary={primary} onStartOver={startNew} />
      }
    }

    // Result screens need a calculated comparison.
    if (!result) {
      return (
        <CompareError
          problem={{
            kind: 'missing-information',
            message: 'There is no comparison yet. Choose your options and journey first.',
            messageKey: 'compare.calcErrors.noComparison',
          }}
          primary={{ label: t('compare.error.checkDetails'), onClick: () => go(firstIncompleteStep()) }}
          onStartOver={startNew}
        />
      )
    }

    switch (view.name) {
      case 'results':
        return (
          <ComparisonResults
            result={result}
            onBreakdown={() => go({ name: 'breakdown' })}
            onRecommendation={() => go({ name: 'recommendation' })}
            onScenario={() => go({ name: 'scenario' })}
          />
        )
      case 'breakdown':
        return <CalculationBreakdown result={result} />
      case 'recommendation':
        return (
          <RecommendedOption
            result={result}
            onScenario={() => go({ name: 'scenario' })}
            onSave={() => go({ name: 'save' })}
          />
        )
      case 'scenario':
        return (
          <AlternativeScenario
            result={result}
            onCancel={() => go({ name: 'results' })}
            onApply={(input) => {
              setModes(input.modes)
              setJourneyValues(toFormValues(input.journey))
              setPriorities(input.priorities)
              if (compare(input)) go({ name: 'results' }, t('compare.announce.scenarioApplied'))
            }}
          />
        )
      case 'save':
        return (
          <SaveComparison
            result={result}
            saved={saved}
            onBack={() => go({ name: 'results' })}
            onSaved={(created) => {
              // SaveComparison shows and announces its own confirmation.
              setSaved(created)
              setMessage(null)
            }}
          />
        )
    }
  }

  return (
    <div className="compare-page">
      <PageHeader
        eyebrow={t('compare.eyebrow')}
        title={t('compare.title')}
        description={t('compare.description')}
      />

      {inSetup && (
        <nav className="compare-steps" aria-label={t('compare.stepsLabel')}>
          <ol className="compare-steps__list">
            {SETUP_STEPS.map((step, index) => (
              <li key={step.name}>
                <button
                  type="button"
                  className="compare-steps__button"
                  aria-current={view.name === step.name ? 'step' : undefined}
                  onClick={() => openStep(step.name)}
                >
                  <span className="compare-steps__number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>
                    <span className="visually-hidden">{t('compare.stepPrefix', { number: index + 1 })}</span>
                    {t(step.labelKey)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {inResults && (
        <div className="compare-toolbar">
          <nav aria-label={t('compare.sectionsLabel')}>
            <ul className="compare-tabs">
              {RESULT_TABS.map((tab) => (
                <li key={tab.name}>
                  <button
                    type="button"
                    className="compare-tabs__button"
                    aria-current={view.name === tab.name ? 'page' : undefined}
                    onClick={() => go({ name: tab.name } as CompareView)}
                  >
                    {t(tab.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="compare-toolbar__actions">
            <button type="button" className="compare-link-button" onClick={() => go({ name: 'transport' })}>
              {t('compare.editChoices')}
            </button>
            <button type="button" className="compare-link-button" onClick={startNew}>
              {t('compare.newComparison')}
            </button>
          </div>
        </div>
      )}

      <div className="visually-hidden" role="status" aria-live="polite">
        {message}
      </div>

      <section ref={viewRef} className="compare-view" aria-labelledby="compare-view-title" tabIndex={-1}>
        {back && !pendingSavedId && <BackButton label={back.label} onClick={() => go(back.to)} />}
        <h2 id="compare-view-title" className="compare-view__title">
          {pendingSavedId ? t('compare.views.savedLoading') : t(`compare.views.${view.name}`)}
        </h2>
        {message && !pendingSavedId && (
          <p className="compare-flash" aria-hidden="true">
            {message}
          </p>
        )}
        {saved && inResults && view.name !== 'save' && (
          <p className="compare-muted">
            {t('compare.savedAs', { name: saved.name })}
          </p>
        )}
        {renderView()}
      </section>
    </div>
  )
}
