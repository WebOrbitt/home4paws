export default function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-forest">
          {eyebrow}
        </p>
      )}
      <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-xl text-base leading-7 text-muted">{description}</p>
      )}
    </div>
  )
}
