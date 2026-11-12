import { Icon } from '../../../components/Icon'
import { useI18n } from '../../../i18n'
import { CATEGORY_ICONS } from '../categoryIcons'
import { CATEGORIES } from '../emissionFactors'
import { categoryLabel } from '../labels'
import type { ActivityCategory } from '../types'
import { Panel } from './TrackingUi'

/** Screen 2 — Add Activity: choose what kind of activity to record. */
export function AddActivity({ onChoose }: { onChoose: (category: ActivityCategory) => void }) {
  const { t } = useI18n()
  return (
    <Panel id="tracking-add-title" title={t('tracking.add.title')} description={t('tracking.add.description')}>
      <ul className="tracking-choices">
        {CATEGORIES.map((category) => (
          <li key={category}>
            <button type="button" className="tracking-choice" onClick={() => onChoose(category)}>
              <span className={`tracking-choice__icon tracking-choice__icon--${category}`}>
                <Icon name={CATEGORY_ICONS[category]} size={24} />
              </span>
              <span className="tracking-choice__text">
                <span className="tracking-choice__title">{categoryLabel(category)}</span>
                <span className="tracking-choice__description">{t(`tracking.add.options.${category}`)}</span>
              </span>
              <Icon name="arrow-right" size={18} className="tracking-choice__arrow" />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
