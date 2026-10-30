import { ArrowLeft, Check, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../Button.jsx'
import RescueStatus from './RescueStatus.jsx'

export default function RescueSuccessState({ report, onReportAnother }) {
  return (
    <section aria-labelledby="success-heading" className="mx-auto w-full max-w-3xl rounded-3xl border border-ink/5 bg-white p-5 shadow-card sm:p-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-forest">
          <Check aria-hidden="true" className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-forest">Report received</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl" id="success-heading">Rescue Report Submitted</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          Thank you for sharing these details. Your report has been saved and is ready for review by the Home4Paws team.
        </p>
        <p className="mt-2 max-w-xl text-xs leading-5 text-muted">You can use your private tracking link to check its status.</p>
      </div>

      <div className="mt-7 rounded-2xl bg-cream px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Rescue Report ID</p>
          <p className="mt-1 font-mono text-lg font-bold text-ink">{report.id}</p>
        </div>
        <span className="mt-3 inline-flex w-fit items-center rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 sm:mt-0">{report.status}</span>
      </div>

      <dl className="mt-4 grid gap-3 rounded-2xl border border-ink/5 px-4 py-4 sm:grid-cols-3 sm:px-5">
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Animal</dt><dd className="mt-1 text-sm font-medium text-ink">{report.animalType}{report.breed ? ` · ${report.breed}` : ''}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Location</dt><dd className="mt-1 text-sm font-medium text-ink">{[report.address, report.city].filter(Boolean).join(', ')}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Date Found</dt><dd className="mt-1 text-sm font-medium text-ink">{report.dateFound}</dd></div>
      </dl>

      <div className="mt-7 border-t border-ink/10 pt-6">
        <h3 className="mb-5 text-sm font-semibold text-ink">Report status</h3>
        <RescueStatus status={report.status} />
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:justify-end">
        <Button onClick={onReportAnother} type="button" variant="secondary">
          <RotateCcw aria-hidden="true" className="h-4 w-4" /> Report Another Pet
        </Button>
        <Button to={`/rescue-report/${report.id}?token=${encodeURIComponent(report.trackingToken || '')}`} variant="secondary">Track Report</Button>
        <Button to="/">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to Home
        </Button>
      </div>
      <Link className="sr-only" to="/">Home4Paws home</Link>
    </section>
  )
}
