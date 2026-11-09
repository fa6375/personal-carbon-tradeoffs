import { Icon } from '../../../components/Icon'
import type { ActivityCategory } from '../types'
import { CATEGORY_ICONS } from '../categoryIcons'
import { Panel } from './TrackingUi'

const OPTIONS: { category: ActivityCategory; title: string; description: string }[] = [
  {
    category: 'transport',
    title: 'Transport',
    description: 'A journey by car, bus, tram, train, bike, on foot or by plane.',
  },
  {
    category: 'food',
    title: 'Food',
    description: 'A meal or food item, such as beef, chicken or a vegetarian dish.',
  },
  {
    category: 'home',
    title: 'Home energy',
    description: 'Electricity, gas or heating use, for example from a meter reading or bill.',
  },
]

/** Screen 2 — Add Activity: choose what kind of activity to record. */
export function AddActivity({ onChoose }: { onChoose: (category: ActivityCategory) => void }) {
  return (
    <Panel
      id="tracking-add-title"
      title="What would you like to record?"
      description="Choose a category. You can add the details on the next screen."
    >
      <ul className="tracking-choices">
        {OPTIONS.map((option) => (
          <li key={option.category}>
            <button
              type="button"
              className="tracking-choice"
              onClick={() => onChoose(option.category)}
            >
              <span className={`tracking-choice__icon tracking-choice__icon--${option.category}`}>
                <Icon name={CATEGORY_ICONS[option.category]} size={24} />
              </span>
              <span className="tracking-choice__text">
                <span className="tracking-choice__title">{option.title}</span>
                <span className="tracking-choice__description">{option.description}</span>
              </span>
              <Icon name="arrow-right" size={18} className="tracking-choice__arrow" />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
