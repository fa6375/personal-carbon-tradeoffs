import './SectionHeading.css'

interface SectionHeadingProps {
  id: string
  title: string
  description?: string
}

/** <h2> plus optional intro text. Pass `id` and point the section's aria-labelledby at it. */
export function SectionHeading({ id, title, description }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <h2 id={id} className="section-heading__title">
        {title}
      </h2>
      {description && <p className="section-heading__description">{description}</p>}
    </div>
  )
}
