/**
 * Journey distances from OpenStreetMap services.
 *
 * - Geocoding (place name → coordinates): Nominatim
 *   https://nominatim.org/release-docs/latest/api/Search/
 * - Routing (driving, cycling and walking distance): OSRM, by default the
 *   FOSSGIS servers at routing.openstreetmap.de, which run one OSRM instance
 *   per profile (routed-car, routed-bike, routed-foot).
 *
 * Both public services are free, need no API key and have NO uptime
 * guarantee. Their usage policies are respected here:
 * - at most one request per second to each host (throttle below);
 * - no search-as-you-type: a lookup only runs when the user presses a button;
 * - results are cached (in memory and in localStorage for 7 days), so the
 *   same journey is not requested again;
 * - the browser sends a Referer that identifies the app; an optional contact
 *   email can be added with VITE_NOMINATIM_EMAIL;
 * - the interface shows the required "© OpenStreetMap contributors" credit.
 *
 * Providers are configurable with VITE_GEOCODER_URL and VITE_ROUTER_URL, so a
 * self-hosted or commercial instance can replace the public ones.
 *
 * Every failure is a RouteError with a stable code; the text for each code is
 * in routeMessages.ts.
 */

export type RouteErrorCode =
  | 'invalid-input'
  | 'timeout'
  | 'network'
  | 'rate-limited'
  | 'server-error'
  | 'unauthorized'
  | 'bad-request'
  | 'not-found'
  | 'no-route'
  | 'malformed'

export class RouteError extends Error {
  readonly code: RouteErrorCode
  /** Which place could not be found (for 'not-found'). */
  readonly place?: 'from' | 'to'

  constructor(code: RouteErrorCode, place?: 'from' | 'to') {
    super(code)
    this.name = 'RouteError'
    this.code = code
    this.place = place
  }
}

export type RouteProfile = 'driving' | 'cycling' | 'walking'

export interface Place {
  query: string
  name: string
  lat: number
  lon: number
}

export interface RouteDistance {
  km: number
  minutes: number
}

export interface JourneyRoutes {
  from: Place
  to: Place
  /** A profile is missing when the router has no route for it; at least one is present. */
  distances: Partial<Record<RouteProfile, RouteDistance>>
}

export interface RouteServiceOptions {
  geocoderUrl?: string
  routerUrl?: string
  email?: string
  fetch?: typeof fetch
  timeoutMs?: number
  /** Minimum gap between requests to the same host. */
  minIntervalMs?: number
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null
  now?: () => number
  sleep?: (ms: number) => Promise<void>
}

const PROFILE_PATHS: Record<RouteProfile, string> = {
  driving: 'routed-car',
  cycling: 'routed-bike',
  walking: 'routed-foot',
}

const CACHE_PREFIX = 'carbon-choices.routes.v1:'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MAX_QUERY_LENGTH = 200

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function createRouteService(options: RouteServiceOptions = {}) {
  const env = import.meta.env
  const geocoderUrl = (options.geocoderUrl ?? env.VITE_GEOCODER_URL ?? 'https://nominatim.openstreetmap.org').replace(/\/$/, '')
  const routerUrl = (options.routerUrl ?? env.VITE_ROUTER_URL ?? 'https://routing.openstreetmap.de').replace(/\/$/, '')
  const email = options.email ?? env.VITE_NOMINATIM_EMAIL
  const doFetch = options.fetch ?? ((input: RequestInfo | URL, init?: RequestInit) => fetch(input, init))
  const timeoutMs = options.timeoutMs ?? 10000
  const minIntervalMs = options.minIntervalMs ?? 1100
  const now = options.now ?? (() => Date.now())
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  const storage =
    options.storage !== undefined ? options.storage : typeof window !== 'undefined' ? safeLocalStorage() : null

  const memory = new Map<string, unknown>()
  /** Per host: when the next request may start (a promise chain keeps them in order). */
  const queues = new Map<string, Promise<void>>()
  const lastRequest = new Map<string, number>()

  function readCache<T>(key: string): T | undefined {
    if (memory.has(key)) return memory.get(key) as T
    try {
      const raw = storage?.getItem(CACHE_PREFIX + key)
      if (!raw) return undefined
      const entry = JSON.parse(raw) as { at: number; value: T }
      if (now() - entry.at > CACHE_TTL_MS) return undefined
      memory.set(key, entry.value)
      return entry.value
    } catch {
      return undefined
    }
  }

  function writeCache(key: string, value: unknown) {
    memory.set(key, value)
    try {
      storage?.setItem(CACHE_PREFIX + key, JSON.stringify({ at: now(), value }))
    } catch {
      // A full or blocked storage only means the next lookup is not cached.
    }
  }

  /** Waits so that requests to one host are at least minIntervalMs apart. */
  function throttle(host: string): Promise<void> {
    const previous = queues.get(host) ?? Promise.resolve()
    const next = previous.then(async () => {
      const wait = (lastRequest.get(host) ?? -Infinity) + minIntervalMs - now()
      if (wait > 0) await sleep(wait)
      lastRequest.set(host, now())
    })
    queues.set(host, next.catch(() => undefined))
    return next
  }

  /** Fetches JSON. Throws RouteError for everything except 200 and 400 (OSRM uses 400 for "no route"). */
  async function getJson(url: string): Promise<{ status: number; body: unknown }> {
    await throttle(new URL(url).host)
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    let timer: ReturnType<typeof setTimeout> | undefined
    // The timer also covers fetch implementations that ignore the abort signal.
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new RouteError('timeout'))
        controller?.abort()
      }, timeoutMs)
    })
    let response: Response
    try {
      response = await Promise.race([
        doFetch(url, { headers: { Accept: 'application/json' }, signal: controller?.signal }),
        timeout,
      ])
    } catch (reason) {
      if (reason instanceof RouteError) throw reason
      throw new RouteError('network')
    } finally {
      clearTimeout(timer)
    }

    if (response.status === 429) throw new RouteError('rate-limited')
    if (response.status === 401 || response.status === 403) throw new RouteError('unauthorized')
    if (response.status >= 500) throw new RouteError('server-error')
    if (response.status === 400) {
      try {
        return { status: 400, body: await response.json() }
      } catch {
        throw new RouteError('bad-request')
      }
    }
    if (!response.ok) throw new RouteError('bad-request')
    try {
      return { status: response.status, body: await response.json() }
    } catch {
      throw new RouteError('malformed')
    }
  }

  async function geocode(query: string, place: 'from' | 'to'): Promise<Place> {
    const text = query.trim().replace(/\s+/g, ' ')
    if (!text || text.length > MAX_QUERY_LENGTH) throw new RouteError('invalid-input', place)
    const key = `geo:${text.toLowerCase()}`
    const cached = readCache<Place>(key)
    if (cached) return { ...cached, query: text }

    const params = new URLSearchParams({ q: text, format: 'jsonv2', limit: '1', addressdetails: '0' })
    if (email) params.set('email', email)
    const { status, body: data } = await getJson(`${geocoderUrl}/search?${params}`)
    if (status === 400) throw new RouteError('bad-request')
    if (!Array.isArray(data)) throw new RouteError('malformed')
    if (data.length === 0) throw new RouteError('not-found', place)
    const first = data[0] as Record<string, unknown>
    const lat = Number(first?.lat)
    const lon = Number(first?.lon)
    const name = first?.display_name
    if (!isFiniteNumber(lat) || !isFiniteNumber(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || typeof name !== 'string') {
      throw new RouteError('malformed')
    }
    const result: Place = { query: text, name, lat, lon }
    writeCache(key, result)
    return result
  }

  async function route(profile: RouteProfile, from: Place, to: Place): Promise<RouteDistance | null> {
    const coords = `${from.lon.toFixed(6)},${from.lat.toFixed(6)};${to.lon.toFixed(6)},${to.lat.toFixed(6)}`
    const key = `route:${profile}:${coords}`
    const cached = readCache<RouteDistance | null>(key)
    if (cached !== undefined) return cached

    const { status, body } = await getJson(
      `${routerUrl}/${PROFILE_PATHS[profile]}/route/v1/driving/${coords}?overview=false&alternatives=false&steps=false`,
    )
    const data = body as Record<string, unknown> | null
    if (!data || typeof data !== 'object' || typeof data.code !== 'string') {
      throw new RouteError(status === 400 ? 'bad-request' : 'malformed')
    }
    if (data.code === 'NoRoute' || data.code === 'NoSegment') {
      writeCache(key, null)
      return null
    }
    if (data.code !== 'Ok') throw new RouteError(status === 400 ? 'bad-request' : 'malformed')
    const first = Array.isArray(data.routes) ? (data.routes[0] as Record<string, unknown> | undefined) : undefined
    if (!first || !isFiniteNumber(first.distance) || !isFiniteNumber(first.duration) || first.distance < 0) {
      throw new RouteError('malformed')
    }
    const result: RouteDistance = {
      km: Math.round((first.distance / 1000) * 10) / 10,
      minutes: Math.round(first.duration / 60),
    }
    writeCache(key, result)
    return result
  }

  /** Finds both places and the driving, cycling and walking distance between them. */
  async function findJourney(fromText: string, toText: string): Promise<JourneyRoutes> {
    const from = await geocode(fromText, 'from')
    const to = await geocode(toText, 'to')
    if (Math.abs(from.lat - to.lat) < 1e-6 && Math.abs(from.lon - to.lon) < 1e-6) {
      throw new RouteError('invalid-input', 'to')
    }
    const distances: JourneyRoutes['distances'] = {}
    for (const profile of ['driving', 'cycling', 'walking'] as RouteProfile[]) {
      const result = await route(profile, from, to)
      if (result) distances[profile] = result
    }
    if (Object.keys(distances).length === 0) throw new RouteError('no-route')
    return { from, to, distances }
  }

  return { geocode, route, findJourney }
}

function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export type RouteService = ReturnType<typeof createRouteService>

let shared: RouteService | null = null

/** One service for the whole app, so the throttle and cache are shared. */
export function getRouteService(): RouteService {
  shared ??= createRouteService()
  return shared
}
