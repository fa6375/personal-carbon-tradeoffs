import { useId, useState } from 'react'
import { Button } from '../../components/Button'
import { routeErrorMessage } from './routeMessages'
import { getRouteService, RouteError, type JourneyRoutes, type RouteProfile } from './routeService'
import './routing.css'

const PROFILE_LABELS: Record<RouteProfile, string> = {
  driving: 'By car',
  cycling: 'By bike',
  walking: 'On foot',
}

const number = new Intl.NumberFormat('en', { maximumFractionDigits: 1 })

function duration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${minutes} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

interface RouteDistanceLookupProps {
  /** Places typed elsewhere in the form (Compare). Leave out to show this component's own fields (Tracking). */
  from?: string
  to?: string
  /** The route to suggest first, e.g. cycling for a bike trip. */
  preferred?: RouteProfile
  onUse: (km: number, profile: RouteProfile) => void
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; routes: JourneyRoutes }
  | { status: 'error'; message: string }

/**
 * Optional helper that looks up the distance between two places with
 * OpenStreetMap (Nominatim + OSRM). It never replaces manual entry: the user
 * chooses which distance to use, and can always type one instead.
 */
export function RouteDistanceLookup({ from, to, preferred = 'driving', onUse }: RouteDistanceLookupProps) {
  const standalone = from === undefined || to === undefined
  const [ownFrom, setOwnFrom] = useState('')
  const [ownTo, setOwnTo] = useState('')
  const [state, setState] = useState<State>({ status: 'idle' })
  const [used, setUsed] = useState<RouteProfile | null>(null)
  const id = useId()
  const fromText = standalone ? ownFrom : from
  const toText = standalone ? ownTo : to

  async function lookUp() {
    if (!fromText.trim() || !toText.trim()) {
      setState({ status: 'error', message: 'Enter both a starting point and a destination first.' })
      return
    }
    setState({ status: 'loading' })
    setUsed(null)
    try {
      setState({ status: 'done', routes: await getRouteService().findJourney(fromText, toText) })
    } catch (reason) {
      setState({
        status: 'error',
        message: reason instanceof RouteError ? routeErrorMessage(reason) : routeErrorMessage(new RouteError('network')),
      })
    }
  }

  const profiles: RouteProfile[] = [preferred, ...(['driving', 'cycling', 'walking'] as RouteProfile[]).filter((p) => p !== preferred)]

  return (
    <div className="route-lookup" role="group" aria-labelledby={`${id}-title`}>
      <p id={`${id}-title`} className="route-lookup__title">
        Find the distance on a map <span className="route-lookup__optional">(optional)</span>
      </p>
      {standalone && (
        <div className="route-lookup__fields">
          <label className="route-lookup__field">
            <span>From</span>
            <input value={ownFrom} maxLength={200} onChange={(event) => setOwnFrom(event.target.value)} />
          </label>
          <label className="route-lookup__field">
            <span>To</span>
            <input value={ownTo} maxLength={200} onChange={(event) => setOwnTo(event.target.value)} />
          </label>
        </div>
      )}
      <div>
        <Button variant="secondary" onClick={lookUp} disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Looking up…' : 'Look up distance'}
        </Button>
      </div>

      <div aria-live="polite">
        {state.status === 'loading' && <p className="route-lookup__muted">Finding the places and routes. This takes a few seconds.</p>}
        {state.status === 'error' && (
          <p className="route-lookup__error" role="alert">
            {state.message}
          </p>
        )}
        {state.status === 'done' && (
          <div className="route-lookup__result">
            <p className="route-lookup__muted">
              From <strong>{state.routes.from.name}</strong> to <strong>{state.routes.to.name}</strong>. Check these are
              the places you meant.
            </p>
            <ul className="route-lookup__list">
              {profiles.map((profile) => {
                const distance = state.routes.distances[profile]
                return (
                  <li key={profile}>
                    <span>
                      {PROFILE_LABELS[profile]}:{' '}
                      {distance ? (
                        <strong>
                          {number.format(distance.km)} km (about {duration(distance.minutes)})
                        </strong>
                      ) : (
                        'no route found'
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
                        {used === profile ? 'Used ✓' : `Use ${number.format(distance.km)} km`}
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
            <p className="route-lookup__muted">Route times are the map service's estimates and are not used in the results.</p>
          </div>
        )}
      </div>

      <p className="route-lookup__credit">
        Places and routes ©{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          OpenStreetMap contributors
        </a>
        , found with{' '}
        <a href="https://nominatim.org/" target="_blank" rel="noreferrer">
          Nominatim
        </a>{' '}
        and{' '}
        <a href="https://project-osrm.org/" target="_blank" rel="noreferrer">
          OSRM
        </a>
        . Free public services without guaranteed availability.
      </p>
    </div>
  )
}
