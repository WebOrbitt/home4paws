import { Check } from 'lucide-react'

const steps = ['Report Submitted', 'Under Review', 'NGO Assigned', 'Rescue Accepted', 'Rescue In Progress', 'Animal Rescued', 'Pet Profile Created', 'Closed']

const statusIndex = {
  'Pending Review': 0,
  Pending: 0,
  'Under Review': 1,
  'NGO Assigned': 2,
  'Rescue Accepted': 3,
  Accepted: 3,
  'Rescue In Progress': 4,
  Rescued: 5,
  'Animal Rescued': 5,
  'Pet Profile Created': 6,
  Closed: 7,
}

export default function RescueStatus({ status = 'Pending Review', className = '' }) {
  const currentIndex = statusIndex[status] ?? 0

  return (
    <ol aria-label="Rescue report progress" className={`grid grid-cols-1 gap-0 sm:grid-cols-4 sm:gap-x-3 ${className}`}>
      {steps.map((step, index) => {
        const complete = index < currentIndex
        const current = index === currentIndex
        const active = index <= currentIndex
        return (
          <li aria-current={current ? 'step' : undefined} className="relative flex min-h-12 items-center gap-3 sm:min-h-16 sm:items-start sm:gap-2" key={step}>
            {index < steps.length - 1 && <span aria-hidden="true" className={`absolute bottom-[-1px] left-[15px] top-[31px] w-px sm:bottom-auto sm:left-4 sm:top-4 sm:h-px sm:w-[calc(100%+12px)] ${index % 4 === 3 ? 'sm:hidden' : ''} ${complete ? 'bg-forest/55' : 'bg-ink/10'}`} />}
            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${active ? 'border-forest bg-forest text-white' : 'border-ink/15 bg-white text-muted'}`}>
              {complete ? <Check aria-hidden="true" className="h-4 w-4" /> : index + 1}
            </span>
            <span className={`pb-2 text-sm sm:pb-0 sm:text-xs ${active ? 'font-semibold text-forest' : 'text-muted'}`}>{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
