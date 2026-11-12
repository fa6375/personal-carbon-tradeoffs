import type { Locale, Messages } from '../types'
import { de } from './de/index'
import { en } from './en/index'
import { hr } from './hr/index'

export const MESSAGES: Record<Locale, Messages> = { en, hr, de }
