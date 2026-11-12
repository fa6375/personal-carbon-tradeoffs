/** Text for RouteError codes, translated through src/i18n (routing.errors.*). */
import { t } from '../../i18n'
import type { RouteError } from './routeService'

export function routeErrorMessage(error: Pick<RouteError, 'code' | 'place'>): string {
  const place = t(error.place === 'to' ? 'routing.places.to' : 'routing.places.from')
  // 'invalid-input' for the destination means both places are the same.
  if (error.code === 'invalid-input' && error.place === 'to') return t('routing.errors.same-place')
  return t(`routing.errors.${error.code}`, { place })
}
