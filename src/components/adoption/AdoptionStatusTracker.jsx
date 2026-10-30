import { Check } from 'lucide-react'

const normalSteps = ['Application Submitted', 'Under Review', 'Approved', 'Adoption Completed']
const rejectedSteps = ['Application Submitted', 'Under Review', 'Rejected']

export default function AdoptionStatusTracker({ status = 'Submitted' }) {
  const steps = status === 'Rejected' ? rejectedSteps : normalSteps
  const currentIndex = status === 'Submitted' ? 0
    : ['Pending', 'Under Review'].includes(status) ? 1
      : status === 'Approved' ? 2
        : status === 'Completed' ? 3
          : status === 'Rejected' ? 2 : 0

  return <ol aria-label="Adoption application progress" className={`grid grid-cols-1 gap-0 ${steps.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'}`}>
    {steps.map((step, index) => {
      const complete = index < currentIndex
      const active = index <= currentIndex
      const current = index === currentIndex
      return <li aria-current={current ? 'step' : undefined} className="relative flex min-h-12 items-center gap-3 sm:min-h-16 sm:flex-col sm:items-start sm:gap-2" key={step}>
        {index < steps.length - 1 && <span aria-hidden="true" className={`absolute bottom-[-1px] left-[15px] top-[31px] w-px sm:bottom-auto sm:left-4 sm:top-4 sm:h-px sm:w-[calc(100%+12px)] ${complete ? 'bg-forest/55' : 'bg-ink/10'}`} />}
        <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${active ? 'border-forest bg-forest text-white' : 'border-ink/15 bg-white text-muted'}`}>
          {complete ? <Check aria-hidden="true" className="h-4 w-4" /> : index + 1}
        </span>
        <span className={`pb-2 text-sm sm:pb-0 sm:text-xs ${active ? 'font-semibold text-forest' : 'text-muted'}`}>{step}</span>
      </li>
    })}
  </ol>
}
