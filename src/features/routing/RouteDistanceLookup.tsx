import { useId, useState } from 'react'
import { Button } from '../../components/Button'
import { isOffline } from '../../hooks/useOnlineStatus'
import { useI18n } from '../../i18n'
import { RichText } from '../../i18n/RichText'
import { routeErrorMessage } from './routeMessages'
import { getRouteService, RouteError, type JourneyRoutes, type RouteProfile } from './routeService'
import './routing.css'

interface RouteDistanceLookupProps {
  /** Places typed elsewhere in the form (Compare). Leave out to show this component's own fields (Tracking). */
  from?: string
  to?: string
  /** The route to suggest first, e.g. cycling for a bike trip. */
  preferred?: RouteProfile
  onUse: (km: number, profile: RouteProfile) => void
}

type LookupError = { kind: 'missing' } | { kind: 'route'; code: RouteError['code']; place?: RouteError['place'] }

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; routes: JourneyRoutes }
  | { status: 'error'; error: LookupError }

/**
 * Optional helper that looks up the distance between two places with
 * OpenStreetMap (Nominatim + OSRM). It never replaces manual entry: the user
 * chooses which distance to use, and can always type one instead.
 */
export function RouteDistanceLookup({ from, to, preferred = 'driving', onUse }: RouteDistanceLookupProps) {
  const { t, format } = useI18n()
  const standalone = from === undefined || to === undefined
  const [ownFrom, setOwnFrom] = useState('')
  const [ownTo, setOwnTo] = useState('')
  const [state, setState] = useState<State>({ status: 'idle' })
  const [used, setUsed] = useState<RouteProfile | null>(null)
  const id = useId()
  const fromText = standalone ? ownFrom : from
  const toText = standalone ? ownTo : to

  async function lookUp() {
    if (state.status === 'loading') return
    if (!fromText.trim() || !toText.trim()) {
      setState({ status: 'error', error: { kind: 'missing' } })
      return
    }
    if (isOffline()) {
      setState({ status: 'error', error: { kind: 'route', code: 'network' } })
      return
    }
    setState({ status: 'loading' })
    setUsed(null)
    try {
      setState({ status: 'done', routes: await getRouteService().findJourney(fromText, toText) })
    } catch (reason) {
      const error = reason instanceof RouteError ? reason : new RouteError('network')
      setState({ status: 'error', error: { kind: 'route', code: error.code, place: error.place } })
    }
  }

  const profiles: RouteProfile[] = [
    preferred,
    ...(['driving', 'cycling', 'walking'] as RouteProfile[]).filter((p) => p !== preferred),
  ]
  const externalLink = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noreferrer">
      {label}
      <span className="visually-hidden"> {t('routing.newTab')}</span>
    </a>
  )

  return (
    <div className="route-lookup" role="group" aria-labelledby={`${id}-title`}>
      <p id={`${id}-title`} className="route-lookup__title">
        {t('routing.title')} <span className="route-lookup__optional">{t('actions.optional')}</span>
      </p>
      {standalone && (
        <div className="route-lookup__fields">
          <label className="route-lookup__field">
            <span>{t('routing.from')}</span>
            <input value={ownFrom} maxLength={200} autoComplete="off" onChange={(event) => setOwnFrom(event.target.value)} />
          </label>
          <label className="route-lookup__field">
            <span>{t('routing.to')}</span>
            <input value={ownTo} maxLength={200} autoComplete="off" onChange={(event) => setOwnTo(event.target.value)} />
          </label>
        </div>
      )}
      <div>
        <Button variant="secondary" onClick={lookUp} disabled={state.status === 'loading'}>
          {state.status === 'loading' ? t('routing.lookingUp') : t('routing.lookUp')}
        </Button>
      </div>

      <div aria-live="polite">
        {state.status === 'loading' && <p className="route-lookup__muted">{t('routing.loading')}</p>}
        {state.status === 'error' && (
          <p className="route-lookup__error" role="alert">
            {state.error.kind === 'missing' ? t('routing.enterBoth') : routeErrorMessage(state.error)}
          </p>
        )}
        {state.status === 'done' && (
          <div className="route-lookup__result">
            <p className="route-lookup__muted">
              <RichText
                text={t('routing.result')}
                values={{
                  from: <strong>{state.routes.from.name}</strong>,
                  to: <strong>{state.routes.to.name}</strong>,
                }}
              />
            </p>
            <ul className="route-lookup__list">
              {profiles.map((profile) => {
                const distance = state.routes.distances[profile]
                const km = distance ? format.number(distance.km) : ''
                return (
                  <li key={profile}>
                    <span>
                      {t(`routing.profiles.${profile}`)}:{' '}
                      {distance ? (
                        <strong>{t('routing.distance', { km, duration: format.minutes(distance.minutes) })}</strong>
                      ) : (
                        t('routing.noRoute')
                      )}
                    </span>
                    {distance && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          onUse(distance.km, profile)
                          setUsed(profile)
                        }}
                      >
                        {used === profile ? t('routing.used') : t('routing.use', { km })}
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
            <p className="route-lookup__muted">{t('routing.timesNote')}</p>
          </div>
        )}
      </div>

      <p className="route-lookup__credit">
        <RichText
          text={t('routing.credit')}
          values={{
            osm: externalLink('https://www.openstreetmap.org/copyright', t('routing.osm')),
            nominatim: externalLink('https://nominatim.org/', 'Nominatim'),
            osrm: externalLink('https://project-osrm.org/', 'OSRM'),
          }}
        />
      </p>
    </div>
  )
}
