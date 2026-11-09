import { Button } from '../../../components/Button'
import { Icon } from '../../../components/Icon'

interface NoActivitiesProps {
  onAdd: () => void
}

/** Screen 10 — No Activities Recorded. Shown wherever there is nothing to summarise yet. */
export function NoActivities({ onAdd }: NoActivitiesProps) {
  return (
    <section className="tracking-empty" aria-labelledby="tracking-empty-title">
      <span className="tracking-empty__icon">
        <Icon name="activity" size={26} />
      </span>
      <h3 id="tracking-empty-title" className="tracking-empty__title">
        No activities recorded yet
      </h3>
      <p className="tracking-empty__body">
        Record a trip, a meal or your home energy use to start tracking your emissions. Your
        dashboard, history and breakdown fill in as you add activities.
      </p>
      <ul className="tracking-empty__list">
        <li>
          <Icon name="car" size={18} /> Transport, such as a bus ride or a drive
        </li>
        <li>
          <Icon name="utensils" size={18} /> Food, such as a meal with meat or a vegan lunch
        </li>
        <li>
          <Icon name="bolt" size={18} /> Home energy, such as electricity or gas from a bill
        </li>
      </ul>
      <Button icon="plus" onClick={onAdd}>
        Add your first activity
      </Button>
    </section>
  )
}
