import { ButtonLink } from '../components/ButtonLink'
import { Icon } from '../components/Icon'
import { InfoCard } from '../components/InfoCard'
import { SectionHeading } from '../components/SectionHeading'
import { FACTORS, STEPS } from '../data/homeContent'
import './HomePage.css'

export function HomePage() {
  return (
    <div className="home">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__text">
          <p className="home-hero__eyebrow">Everyday travel, made clearer</p>
          <h1 id="home-title" className="home-hero__title" tabIndex={-1}>
            Welcome to Carbon Choices
          </h1>
          <p className="home-hero__lead">
            Carbon Choices helps you compare the everyday ways you get around by
            three things that matter: the CO₂ a trip produces, what it costs and
            how long it takes. See the trade-offs clearly, then decide what works
            for you.
          </p>
          <div className="home-hero__actions">
            <ButtonLink href="#/compare" icon="arrow-right">
              Compare a journey
            </ButtonLink>
          </div>
        </div>

        <aside className="home-hero__panel" aria-label="Project status">
          <div className="home-hero__status">
            <span className="home-hero__status-dot" aria-hidden="true" />
            Early preview
          </div>
          <p>
            This is the first version of the Carbon Choices interface. Journey
            comparisons, saved results and settings are being designed and are
            not available yet.
          </p>
        </aside>
      </section>

      <section className="home-section" aria-labelledby="factors-title">
        <SectionHeading
          id="factors-title"
          title="Three ways to look at every trip"
          description="Every journey is a balance. Carbon Choices puts these three factors next to each other so no single number tells the whole story."
        />
        <ul className="home-factors">
          {FACTORS.map((factor) => (
            <li key={factor.id}>
              <InfoCard icon={factor.icon} title={factor.title}>
                <p>{factor.description}</p>
              </InfoCard>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section" aria-labelledby="how-title">
        <SectionHeading
          id="how-title"
          title="How it works"
          description="The planned flow for comparing a journey."
        />
        <ol className="home-steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="home-steps__item">
              <span className="home-steps__number" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3 className="home-steps__title">{step.title}</h3>
                <p className="home-steps__description">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="home-note">
          <Icon name="info" size={16} />
          <span>
            Results shown in Carbon Choices will be estimates. Data sources and
            calculation methods will be documented once they are in place.
          </span>
        </p>
      </section>
    </div>
  )
}
