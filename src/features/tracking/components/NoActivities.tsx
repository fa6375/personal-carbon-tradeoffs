import { Button } from '../../../components/Button'
import { Icon } from '../../../components/Icon'
import { useI18n } from '../../../i18n'

interface NoActivitiesProps {
  onAdd: () => void
}

/** Screen 10 — No Activities Recorded. Shown wherever there is nothing to summarise yet. */
export function NoActivities({ onAdd }: NoActivitiesProps) {
  const { t } = useI18n()
  return (
    <section className="tracking-empty" aria-labelledby="tracking-empty-title">
      <span className="tracking-empty__icon">
        <Icon name="activity" size={26} />
      </span>
      <h3 id="tracking-empty-title" className="tracking-empty__title">
        {t('tracking.empty.title')}
      </h3>
      <p className="tracking-empty__body">{t('tracking.empty.body')}</p>
      <ul className="tracking-empty__list">
        <li>
          <Icon name="car" size={18} /> {t('tracking.empty.transport')}
        </li>
        <li>
          <Icon name="utensils" size={18} /> {t('tracking.empty.food')}
        </li>
        <li>
          <Icon name="bolt" size={18} /> {t('tracking.empty.home')}
        </li>
      </ul>
      <Button icon="plus" onClick={onAdd}>
        {t('tracking.empty.add')}
      </Button>
    </section>
  )
}
