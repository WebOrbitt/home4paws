import { useState } from 'react'
import { useAdminData } from '../admin/AdminDataContext.jsx'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import RescueForm from '../components/rescue/RescueForm.jsx'
import RescueSuccessState from '../components/rescue/RescueSuccessState.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import FeedbackMessage from '../components/FeedbackMessage.jsx'

export default function ReportRescuePage() {
  useDocumentTitle('Report a Rescue Pet | Home4Paws')
  const { addRescueReport } = useAdminData()
  const [report, setReport] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function submitReport(formData) {
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const { photo, ...reportData } = formData
      const created = await addRescueReport({ ...reportData, photoFile: photo })
      setReport({ ...created, ...reportData, photo: created.photo || '' })
    } catch (error) {
      setSubmitError(error.message || 'The rescue report could not be submitted.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[62vh] bg-cream px-4 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8 text-center sm:mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Home4Paws · Rescue Support</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Report a Rescue Pet</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              Found an animal that needs help? Share the details and help connect them with an animal welfare organization.
            </p>
          </header>
          {report ? (
            <RescueSuccessState onReportAnother={() => setReport(null)} report={report} />
          ) : (
            <>
              {submitError && <FeedbackMessage className="mb-4" tone="error">{submitError}</FeedbackMessage>}
            <RescueForm isSubmitting={isSubmitting} onSubmit={submitReport} />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
