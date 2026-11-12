/** English text for RouteError codes (translate here). */
import type { RouteError } from './routeService'

export function routeErrorMessage(error: RouteError): string {
  const place = error.place === 'from' ? 'starting point' : 'destination'
  switch (error.code) {
    case 'invalid-input':
      return error.place === 'to'
        ? 'The starting point and destination are the same place. Enter two different places.'
        : `Enter a ${place} to look up (up to 200 characters).`
    case 'not-found':
      return `The ${place} could not be found on the map. Try adding the town or country, for example "Ilica 10, Zagreb".`
    case 'no-route':
      return 'No road, cycling or walking route was found between these places. Enter the distance yourself.'
    case 'timeout':
      return 'The map service took too long to answer. Try again, or enter the distance yourself.'
    case 'network':
      return 'The map service could not be reached. Check your internet connection, or enter the distance yourself.'
    case 'rate-limited':
      return 'The free map service is busy (too many requests). Wait a minute and try again, or enter the distance yourself.'
    case 'server-error':
      return 'The map service is having problems right now. Try again later, or enter the distance yourself.'
    case 'unauthorized':
      return 'The map service refused the request. The service settings may be wrong (see README).'
    case 'bad-request':
      return 'The map service could not handle this request. Check the places, or enter the distance yourself.'
    case 'malformed':
      return 'The map service sent an answer the app could not understand. Enter the distance yourself.'
  }
}
