import type { IconName } from '../types/icons'

/** The three factors Carbon Choices compares. Text is in home.factors.<id> (src/i18n). */
export const FACTORS: { id: 'co2' | 'cost' | 'time'; icon: IconName }[] = [
  { id: 'co2', icon: 'cloud' },
  { id: 'cost', icon: 'wallet' },
  { id: 'time', icon: 'clock' },
]

/** The journey comparison flow, implemented at #/compare. Text is in home.steps.<id>. */
export const STEPS: ('describe' | 'compare' | 'choose')[] = ['describe', 'compare', 'choose']
