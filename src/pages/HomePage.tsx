import { ButtonLink } from '../components/ButtonLink'
import { Icon } from '../components/Icon'
import { InfoCard } from '../components/InfoCard'
import { SectionHeading } from '../components/SectionHeading'
import { FACTORS, STEPS } from '../data/homeContent'
import { useI18n } from '../i18n'
import './HomePage.css'

export function HomePage() {
  const { t } = useI18n()
  return (
    <div className="home">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__text">
          <p className="home-hero__eyebrow">{t('home.eyebrow')}</p>
          <h1 id="home-title" className="home-hero__title" tabIndex={-1}>
            {t('home.title')}
          </h1>
          <p className="home-hero__lead">{t('home.lead')}</p>
          <div className="home-hero__actions">
            <ButtonLink href="#/compare" icon="arrow-right">
              {t('home.cta')}
            </ButtonLink>
          </div>
        </div>

        <aside className="home-hero__panel" aria-label={t('home.statusLabel')}>
          <div className="home-hero__status">
            <span className="home-hero__status-dot" aria-hidden="true" />
            {t('home.status')}
          </div>
          <p>{t('home.statusText')}</p>
        </aside>
      </section>

      <section className="home-section" aria-labelledby="factors-title">
        <SectionHeading id="factors-title" title={t('home.factorsTitle')} description={t('home.factorsDescription')} />
        <ul className="home-factors">
          {FACTORS.map((factor) => (
            <li key={factor.id}>
              <InfoCard icon={factor.icon} title={t(`home.factors.${factor.id}.title`)}>
                <p>{t(`home.factors.${factor.id}.description`)}</p>
              </InfoCard>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section" aria-labelledby="how-title">
        <SectionHeading id="how-title" title={t('home.howTitle')} description={t('home.howDescription')} />
        <ol className="home-steps">
          {STEPS.map((step, index) => (
            <li key={step} className="home-steps__item">
              <span className="home-steps__number" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3 className="home-steps__title">{t(`home.steps.${step}.title`)}</h3>
                <p className="home-steps__description">{t(`home.steps.${step}.description`)}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="home-note">
          <Icon name="info" size={16} />
          <span>{t('home.note')}</span>
        </p>
      </section>
    </div>
  )
}
