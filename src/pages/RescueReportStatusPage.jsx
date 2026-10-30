import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { trackRescueReport } from '../services/rescueService.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import AdminStatusBadge from '../components/admin/AdminStatusBadge.jsx'
import RescueStatus from '../components/rescue/RescueStatus.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

function dateLabel(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function RescueReportStatusPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  useDocumentTitle(report ? `${report.reportNumber || report.id} Status | Home4Paws` : 'Rescue Report Status | Home4Paws')

  useEffect(() => {
    let active = true
    setIsLoading(true)
    if (!token) {
      setReport(null)
      setIsLoading(false)
      return () => { active = false }
    }
    trackRescueReport(id, token)
      .then((data) => { if (active) setReport(data.report) })
      .catch(() => { if (active) setReport(null) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [id, token])

  return <>
    <Navbar />
    <main className="min-h-[62vh] bg-cream px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-3xl">
        {isLoading ? <section className="rounded-3xl border border-ink/5 bg-white p-7 text-center shadow-card"><p className="text-sm text-muted">Loading rescue report...</p></section>
          : report ? <>
            <header className="mb-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Home4Paws · Rescue Support</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Rescue Report</h1>
              <p className="mt-2 font-mono text-sm font-semibold text-muted">{report.reportNumber || report.id}</p>
            </header>
            <section className="rounded-3xl border border-ink/5 bg-white p-5 shadow-card sm:p-8">
              <div className="flex flex-col gap-3 border-b border-ink/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-muted">Current Status</p><div className="mt-2"><AdminStatusBadge status={report.status} /></div></div>
                <p className="text-sm text-muted">Last updated {dateLabel(report.updatedAt)}</p>
              </div>
              <dl className="grid gap-4 py-5 sm:grid-cols-3">
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Animal</dt><dd className="mt-1 text-sm font-medium text-ink">{report.animalType}{report.breed ? ` · ${report.breed}` : ''}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Location</dt><dd className="mt-1 text-sm font-medium text-ink">{[report.address, report.city].filter(Boolean).join(', ')}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Date Found</dt><dd className="mt-1 text-sm font-medium text-ink">{dateLabel(report.dateFound)}</dd></div>
              </dl>
              <div className="border-t border-ink/10 pt-5"><h2 className="mb-5 text-sm font-semibold text-ink">Rescue progress</h2><RescueStatus status={report.status} /></div>
              <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-5 text-muted">Keep this private link to check your report status later.</p>
            </section>
          </> : <section className="rounded-3xl border border-ink/5 bg-white p-7 text-center shadow-card sm:p-10">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Rescue report not found</h1>
            <p className="mt-2 text-sm text-muted">This report link is invalid. Use the private tracking link from your submission.</p>
            <Link className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white" to="/report-rescue">Report a Rescue Pet</Link>
          </section>}
      </div>
    </main>
    <Footer />
  </>
}
