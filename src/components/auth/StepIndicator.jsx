const steps = ['Organization', 'Contact', 'Address', 'Documents']

export default function StepIndicator({ currentStep }) {
  return (
    <ol aria-label="Organization registration steps" className="mb-6 grid grid-cols-2 gap-x-3 gap-y-4 rounded-2xl bg-cream p-4 sm:grid-cols-4 sm:gap-2 sm:p-5">
      {steps.map((step, index) => {
        const active = index === currentStep
        const complete = index < currentStep
        return (
          <li aria-current={active ? 'step' : undefined} className="flex items-center gap-2" key={step}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-forest text-white' : complete ? 'bg-forest/15 text-forest' : 'bg-white text-muted'}`}>
              {complete ? '✓' : index + 1}
            </span>
            <span className={`text-xs sm:text-sm ${active ? 'font-semibold text-forest' : complete ? 'font-medium text-ink' : 'text-muted'}`}>{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
