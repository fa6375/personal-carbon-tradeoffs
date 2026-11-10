import type { IconName } from '../types/icons'

export interface Factor {
  id: string
  icon: IconName
  title: string
  description: string
}

/** The three factors Carbon Choices compares. Descriptive only, no figures. */
export const FACTORS: Factor[] = [
  {
    id: 'co2',
    icon: 'cloud',
    title: 'CO₂ emissions',
    description:
      'The carbon dioxide produced by a trip. Walking and cycling produce almost none while you travel, and motorised options vary by vehicle, fuel and how many people share the ride.',
  },
  {
    id: 'cost',
    icon: 'wallet',
    title: 'Cost',
    description:
      'What a trip costs you. That can mean a ticket or fare, fuel and parking, or the share of running a vehicle, so options can be compared on a like-for-like basis.',
  },
  {
    id: 'time',
    icon: 'clock',
    title: 'Travel time',
    description:
      'How long a trip takes from door to door, including walking to a stop, waiting and transfers, not only the time spent moving.',
  },
]

export interface Step {
  title: string
  description: string
}

/** The journey comparison flow, implemented at #/compare. */
export const STEPS: Step[] = [
  {
    title: 'Describe your journey',
    description: 'Tell Carbon Choices where you are starting from and where you want to go.',
  },
  {
    title: 'See your options side by side',
    description:
      'Each way of travelling is shown with its CO₂ emissions, cost and travel time in one view.',
  },
  {
    title: 'Choose what fits you',
    description:
      'Weigh the trade-offs that matter to you today and keep the comparisons you want to return to.',
  },
]
