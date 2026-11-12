import { describe, expect, it, vi } from 'vitest'
import { createRouteService, RouteError, type RouteServiceOptions } from './routeService'

const PLACE_A = [{ lat: '45.8150', lon: '15.9819', display_name: 'Zagreb, Croatia' }]
const PLACE_B = [{ lat: '45.8011', lon: '15.7106', display_name: 'Samobor, Croatia' }]
const OSRM_OK = (meters: number, seconds: number) => ({ code: 'Ok', routes: [{ distance: meters, duration: seconds }] })

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

/** Answers geocoding with A then B, and every route with the given body. */
function happyFetch(routeBody: (url: string) => Response = () => json(OSRM_OK(24300, 1800))) {
  let geocodes = 0
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('/search?')) return json(geocodes++ === 0 ? PLACE_A : PLACE_B)
    return routeBody(url)
  })
}

function service(fetchImpl: RouteServiceOptions['fetch'], extra: Partial<RouteServiceOptions> = {}) {
  return createRouteService({
    geocoderUrl: 'https://geo.test',
    routerUrl: 'https://route.test',
    fetch: fetchImpl,
    storage: null,
    minIntervalMs: 0,
    timeoutMs: 200,
    ...extra,
  })
}

async function expectCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toBeInstanceOf(RouteError)
  await promise.catch((error: RouteError) => expect(error.code).toBe(code))
}

describe('route service', () => {
  it('geocodes both places and returns driving, cycling and walking distances', async () => {
    const fetchMock = happyFetch((url) =>
      json(url.includes('routed-car') ? OSRM_OK(24300, 1800) : url.includes('routed-bike') ? OSRM_OK(22000, 4800) : OSRM_OK(21000, 15000)),
    )
    const result = await service(fetchMock).findJourney('Zagreb', 'Samobor')
    expect(result.from.name).toBe('Zagreb, Croatia')
    expect(result.distances).toEqual({
      driving: { km: 24.3, minutes: 30 },
      cycling: { km: 22, minutes: 80 },
      walking: { km: 21, minutes: 250 },
    })
    const urls = fetchMock.mock.calls.map(([url]) => String(url))
    expect(urls[0]).toContain('https://geo.test/search?q=Zagreb&format=jsonv2&limit=1')
    expect(urls[2]).toBe(
      'https://route.test/routed-car/route/v1/driving/15.981900,45.815000;15.710600,45.801100?overview=false&alternatives=false&steps=false',
    )
  })

  it('reports an empty geocoding result as not-found for the right place', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) =>
      String(input).includes('q=Nowhere') ? json([]) : json(PLACE_A),
    )
    const promise = service(fetchMock).findJourney('Zagreb', 'Nowhere')
    await expectCode(promise, 'not-found')
    await promise.catch((error: RouteError) => expect(error.place).toBe('to'))
  })

  it('rejects malformed geocoding and routing responses', async () => {
    await expectCode(service(vi.fn(async () => json({ not: 'a list' }))).geocode('Zagreb', 'from'), 'malformed')
    await expectCode(service(vi.fn(async () => json([{ lat: 'x', lon: '1', display_name: 'X' }]))).geocode('Zagreb', 'from'), 'malformed')
    await expectCode(service(vi.fn(async () => new Response('<html>', { status: 200 }))).geocode('Zagreb', 'from'), 'malformed')
    await expectCode(service(happyFetch(() => json({ code: 'Ok', routes: [] }))).findJourney('A', 'B'), 'malformed')
  })

  it('maps HTTP 429, 5xx, 401 and 400 to error codes', async () => {
    await expectCode(service(vi.fn(async () => json({}, 429))).geocode('Zagreb', 'from'), 'rate-limited')
    await expectCode(service(vi.fn(async () => json({}, 503))).geocode('Zagreb', 'from'), 'server-error')
    await expectCode(service(vi.fn(async () => json({}, 401))).geocode('Zagreb', 'from'), 'unauthorized')
    await expectCode(service(vi.fn(async () => new Response('bad', { status: 400 }))).geocode('Zagreb', 'from'), 'bad-request')
  })

  it('reports network failures and timeouts', async () => {
    await expectCode(service(vi.fn(async () => Promise.reject(new TypeError('Failed to fetch')))).geocode('Zagreb', 'from'), 'network')
    const never = vi.fn(() => new Promise<Response>(() => undefined))
    await expectCode(service(never, { timeoutMs: 30 }).geocode('Zagreb', 'from'), 'timeout')
  })

  it('treats OSRM NoRoute as a missing profile, and no profile at all as no-route', async () => {
    const someRoutes = happyFetch((url) => (url.includes('routed-car') ? json(OSRM_OK(5000, 600)) : json({ code: 'NoRoute', routes: [] }, 400)))
    const result = await service(someRoutes).findJourney('A', 'B')
    expect(Object.keys(result.distances)).toEqual(['driving'])

    const noRoutes = happyFetch(() => json({ code: 'NoRoute' }, 400))
    await expectCode(service(noRoutes).findJourney('A', 'B'), 'no-route')
  })

  it('rejects empty input and identical places without calling the network', async () => {
    const fetchMock = vi.fn(async () => json(PLACE_A))
    await expectCode(service(fetchMock).geocode('   ', 'from'), 'invalid-input')
    expect(fetchMock).not.toHaveBeenCalled()
    await expectCode(service(fetchMock).findJourney('Zagreb', 'Zagreb centre'), 'invalid-input')
  })

  it('caches results so the same journey is not requested twice', async () => {
    const fetchMock = happyFetch()
    const routes = service(fetchMock)
    await routes.findJourney('Zagreb', 'Samobor')
    const calls = fetchMock.mock.calls.length
    expect(calls).toBe(5) // 2 geocodes + 3 routes
    await routes.findJourney('zagreb', 'Samobor ')
    expect(fetchMock.mock.calls.length).toBe(calls)
  })

  it('stores the cache in storage with an expiry', async () => {
    const store = new Map<string, string>()
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) }
    let time = 0
    await service(happyFetch(), { storage, now: () => time }).geocode('Zagreb', 'from')
    expect([...store.keys()]).toEqual(['carbon-choices.routes.v1:geo:zagreb'])

    const second = vi.fn(async () => json(PLACE_A))
    await service(second, { storage, now: () => time }).geocode('Zagreb', 'from')
    expect(second).not.toHaveBeenCalled()

    time = 8 * 24 * 60 * 60 * 1000 // older than 7 days
    await service(second, { storage, now: () => time }).geocode('Zagreb', 'from')
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('waits at least the minimum interval between requests to one host', async () => {
    let time = 1000
    const waits: number[] = []
    const routes = service(happyFetch(), {
      minIntervalMs: 1100,
      now: () => time,
      sleep: async (ms) => {
        waits.push(ms)
        time += ms
      },
    })
    await routes.findJourney('Zagreb', 'Samobor')
    // Second geocode waits for the first; routes 2 and 3 wait for the previous route.
    expect(waits).toEqual([1100, 1100, 1100])
  })
})
