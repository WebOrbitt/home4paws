import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, PawPrint } from 'lucide-react'
import { useAdminData } from '../admin/AdminDataContext.jsx'
import { AuthRole, useAuth } from '../auth/AuthContext.jsx'
import { isValidEmail, isValidIndianMobile } from '../auth/validation.js'
import { applicationPetStatus } from '../adoption/adoptionUtils.js'
import Button from '../components/Button.jsx'
import Footer from '../components/Footer.jsx'
import FormField, { fieldControlClass } from '../components/rescue/FormField.jsx'
import Navbar from '../components/Navbar.jsx'
import Photo from '../components/Photo.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

const initialForm = {
  applicantName: '', email: '', mobile: '', address: '', city: '', pincode: '', reason: '',
  housingType: '', petExperience: '', hasOtherPets: '', otherPetsDetails: '', primaryCaregiver: '', additionalInformation: '',
}

function PageFrame({ children }) {
  return <><Navbar /><main className="min-h-[58vh] bg-cream px-4 py-8 sm:px-6 sm:py-12"><div className="mx-auto max-w-5xl">{children}</div></main><Footer /></>
}

function MessageState({ title, children, pet, actions }) {
  return <PageFrame><section className="rounded-3xl border border-ink/5 bg-white p-6 text-center shadow-card sm:p-10">
    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage text-forest"><PawPrint aria-hidden="true" className="h-7 w-7" /></span>
    <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
    <div className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">{children}</div>
    {pet && <p className="mt-3 text-sm font-semibold text-ink">{pet.name} · {pet.organizationName}</p>}
    <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">{actions}</div>
  </section></PageFrame>
}

function PetSummary({ pet, organizationName }) {
  return <section aria-label="Selected pet" className="flex gap-4 rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
    <Photo alt={pet.imageAlt || `${pet.name}, ${pet.species}`} className="h-24 w-24 shrink-0 rounded-xl object-cover" fallbackClassName="h-24 w-24 shrink-0 rounded-xl" src={pet.image || pet.images?.[0]} />
    <div className="min-w-0 self-center"><p className="text-xs font-bold uppercase tracking-wide text-forest">Applying to adopt</p><h2 className="mt-1 truncate text-lg font-semibold text-ink">{pet.name}</h2><p className="mt-0.5 text-sm text-muted">{[pet.breed, pet.age, pet.gender].filter(Boolean).join(' · ')}</p><p className="mt-1 text-xs text-muted">With {organizationName}</p></div>
  </section>
}

export default function AdoptionApplicationPage() {
  const { petId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pets, organizations, adoptionRequests, hasActiveAdoptionApplication, addAdoptionRequest } = useAdminData()
  const pet = pets.find((item) => item.id === petId && item.isActive !== false)
  const organization = organizations.find((item) => item.id === pet?.organizationId)
  const organizationName = organization?.name || pet?.organizationName || 'Organization'
  const status = applicationPetStatus(pet)
  const existingRequest = useMemo(() => adoptionRequests.find((item) => item.adopterId === user?.id && item.petId === petId && ['Submitted', 'Pending', 'Under Review', 'Approved'].includes(item.status)), [adoptionRequests, petId, user?.id])
  const [values, setValues] = useState(() => ({ ...initialForm, applicantName: user?.name || '', email: user?.email || '', mobile: user?.mobile || '' }))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submittedApplication, setSubmittedApplication] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  useDocumentTitle(pet ? `Adoption Application for ${pet.name} | Home4Paws` : 'Adoption Application | Home4Paws')

  if (!pet) return <MessageState title="Pet Not Found">This pet profile may have been removed or the link may be incorrect.</MessageState>
  if (submittedApplication) return <MessageState title="Application Submitted">
    Your adoption application has been submitted successfully. The organization will review it and update your application status.
    <div className="mx-auto mt-5 grid max-w-md gap-2 rounded-2xl bg-cream p-4 text-left text-sm sm:grid-cols-2"><span className="text-muted">Application ID</span><strong className="text-ink">{submittedApplication.id}</strong><span className="text-muted">Status</span><strong className="text-ink">{submittedApplication.status || 'Submitted'}</strong><span className="text-muted">Pet</span><strong className="text-ink">{pet.name}</strong><span className="text-muted">Organization</span><strong className="text-ink">{organizationName}</strong></div>
    <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row"><Button to={`/adopter/applications/${submittedApplication.id}`}>View Application</Button><Button to="/pets" variant="secondary">Back to Find Pets</Button></div>
  </MessageState>
  if (user?.role !== AuthRole.USER) return <MessageState actions={<><Button to="/login">Login</Button><Button to="/register" variant="secondary">Create Account</Button></>} title="Login Required">Please login or create an account to apply for adoption.</MessageState>
  if (existingRequest || hasActiveAdoptionApplication(user.id, pet.id)) return <MessageState actions={<><Button to={`/adopter/applications/${existingRequest?.id || ''}`}>View Application</Button><Button to="/pets" variant="secondary">Back to Find Pets</Button></>} pet={pet} title="Application Already Submitted">You already have an active application for this pet. You can follow its progress from My Applications.</MessageState>
  if (status === 'Under Adoption') return <MessageState actions={<Button to="/pets" variant="secondary">Back to Find Pets</Button>} pet={pet} title="Application Unavailable">This pet is currently under adoption and is no longer accepting applications.</MessageState>
  if (status === 'Adopted') return <MessageState actions={<Button to="/pets" variant="secondary">Back to Find Pets</Button>} pet={pet} title="Adoption Closed">This pet has already been adopted and is no longer accepting applications.</MessageState>

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setSubmitError('')
  }

  function validate() {
    const next = {}
    const required = ['applicantName', 'email', 'mobile', 'address', 'city', 'pincode', 'reason', 'housingType', 'petExperience', 'hasOtherPets', 'primaryCaregiver']
    required.forEach((field) => { if (!values[field].trim()) next[field] = 'This field is required.' })
    if (values.email.trim() && !isValidEmail(values.email)) next.email = 'Enter a valid email address.'
    if (values.mobile.trim() && !isValidIndianMobile(values.mobile)) next.mobile = 'Enter a valid Indian mobile number.'
    if (values.pincode.trim() && !/^[1-9]\d{5}$/.test(values.pincode.trim())) next.pincode = 'Enter a valid 6-digit Indian pincode.'
    if (values.hasOtherPets === 'Yes' && !values.otherPetsDetails.trim()) next.otherPetsDetails = 'Please tell us about your other pets.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function submit(event) {
    event.preventDefault()
    if (isSubmitting || !validate()) return
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const result = await addAdoptionRequest({
        petId: pet.id,
        applicantName: values.applicantName.trim(), email: values.email.trim(), mobile: values.mobile.trim(),
        address: values.address.trim(), city: values.city.trim(), pincode: values.pincode.trim(), reason: values.reason.trim(),
        housingType: values.housingType, petExperience: values.petExperience, hasOtherPets: values.hasOtherPets === 'Yes',
        otherPetsDetails: values.hasOtherPets === 'Yes' ? values.otherPetsDetails.trim() : '',
        primaryCaregiver: values.primaryCaregiver, additionalInformation: values.additionalInformation.trim(),
      })
      if (result.error === 'duplicate') {
        setSubmitError('You already have an active application for this pet.')
        return
      }
      if (result.error === 'unavailable') {
        setSubmitError('This pet is no longer accepting applications. Please return to Find Pets to explore other pets.')
        return
      }
      setSubmittedApplication(result.application)
    } catch (error) {
      setSubmitError(error.message || 'Your application could not be submitted.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const input = (name, props = {}) => (descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors[name])} aria-required="true" className={fieldControlClass} id={name} name={name} onChange={(event) => update(name, event.target.value)} value={values[name]} {...props} />
  const select = (name, options) => (descriptionId) => <select aria-describedby={descriptionId} aria-invalid={Boolean(errors[name])} aria-required="true" className={fieldControlClass} id={name} onChange={(event) => update(name, event.target.value)} value={values[name]}><option value="">Choose an option</option>{options.map((item) => <option key={item}>{item}</option>)}</select>

  return <PageFrame>
    <Link className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline" to={`/pets/${pet.id}`}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to Pet Details</Link>
    <div className="mt-4 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div>
        <header className="mb-5"><p className="text-sm font-semibold text-forest">Find your new companion</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Adoption Application</h1><p className="mt-2 text-sm leading-6 text-muted">Tell {organizationName} a little about your home and the care you can offer.</p></header>
        <form className="space-y-5" noValidate onSubmit={submit}>
          <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6"><h2 className="text-lg font-semibold text-ink">Your Information</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField error={errors.applicantName} htmlFor="applicantName" label="Full Name" required>{input('applicantName', { autoComplete: 'name', placeholder: 'Enter your full name' })}</FormField>
            <FormField error={errors.email} htmlFor="email" label="Email" required>{input('email', { autoComplete: 'email', placeholder: 'you@example.com', type: 'email' })}</FormField>
            <FormField error={errors.mobile} htmlFor="mobile" label="Mobile" required>{input('mobile', { autoComplete: 'tel', inputMode: 'tel', placeholder: '10-digit Indian mobile number', type: 'tel' })}</FormField>
            <FormField error={errors.address} htmlFor="address" label="Address" required>{input('address', { autoComplete: 'street-address', placeholder: 'Street and area' })}</FormField>
            <FormField error={errors.city} htmlFor="city" label="City" required>{input('city', { autoComplete: 'address-level2', placeholder: 'Enter your city' })}</FormField>
            <FormField error={errors.pincode} htmlFor="pincode" label="Pincode" required>{input('pincode', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6, onChange: (event) => update('pincode', event.target.value.replace(/\D/g, '').slice(0, 6)), placeholder: '6-digit pincode' })}</FormField>
          </div></section>
          <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6"><h2 className="text-lg font-semibold text-ink">About Your Home</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField className="sm:col-span-2" error={errors.reason} htmlFor="reason" label="Why would you like to adopt this pet?" required>{(descriptionId) => <textarea aria-describedby={descriptionId} aria-invalid={Boolean(errors.reason)} aria-required="true" className={`${fieldControlClass} min-h-24 resize-y`} id="reason" onChange={(event) => update('reason', event.target.value)} placeholder="Tell us what makes you interested in adopting this pet." rows="3" value={values.reason} />}</FormField>
            <FormField error={errors.housingType} htmlFor="housingType" label="Housing Type" required>{select('housingType', ['Apartment', 'Independent House', 'Other'])}</FormField>
            <FormField error={errors.petExperience} htmlFor="petExperience" label="Have you cared for a pet before?" required>{select('petExperience', ['Yes', 'No'])}</FormField>
            <FormField error={errors.hasOtherPets} htmlFor="hasOtherPets" label="Do you currently have other pets?" required>{select('hasOtherPets', ['Yes', 'No'])}</FormField>
            {values.hasOtherPets === 'Yes' && <FormField className="sm:col-span-2" error={errors.otherPetsDetails} htmlFor="otherPetsDetails" label="Tell us about your other pets" required>{(descriptionId) => <textarea aria-describedby={descriptionId} aria-invalid={Boolean(errors.otherPetsDetails)} aria-required="true" className={`${fieldControlClass} min-h-20 resize-y`} id="otherPetsDetails" onChange={(event) => update('otherPetsDetails', event.target.value)} placeholder="Type of pet, age, and how they get along with other animals" rows="2" value={values.otherPetsDetails} />}</FormField>}
            <FormField error={errors.primaryCaregiver} htmlFor="primaryCaregiver" label="Primary Caregiver" required>{select('primaryCaregiver', ['Myself', 'Family Member', 'Shared Family Responsibility', 'Other'])}</FormField>
            <FormField className="sm:col-span-2" htmlFor="additionalInformation" label="Additional Information">{(descriptionId) => <textarea aria-describedby={descriptionId} className={`${fieldControlClass} min-h-24 resize-y`} id="additionalInformation" maxLength={1000} onChange={(event) => update('additionalInformation', event.target.value)} placeholder="Any other details you would like the organization to know" rows="3" value={values.additionalInformation} />}</FormField>
          </div></section>
          <section className="rounded-2xl border border-forest/10 bg-sage/40 p-5 sm:p-6"><h2 className="text-lg font-semibold text-ink">Review Your Application</h2><p className="mt-1 text-sm text-muted">Check your details before sending this application to the organization.</p><dl className="mt-4 grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-muted">Pet</dt><dd className="mt-0.5 font-semibold text-ink">{pet.name} · {pet.breed}</dd></div><div><dt className="text-xs text-muted">Organization</dt><dd className="mt-0.5 font-semibold text-ink">{organizationName}</dd></div><div><dt className="text-xs text-muted">Applicant</dt><dd className="mt-0.5 font-semibold text-ink">{values.applicantName || 'Your name'}</dd></div><div><dt className="text-xs text-muted">Housing</dt><dd className="mt-0.5 font-semibold text-ink">{values.housingType || 'Not selected'}</dd></div><div><dt className="text-xs text-muted">Pet experience</dt><dd className="mt-0.5 font-semibold text-ink">{values.petExperience || 'Not selected'}</dd></div><div><dt className="text-xs text-muted">Other pets</dt><dd className="mt-0.5 font-semibold text-ink">{values.hasOtherPets || 'Not selected'}{values.hasOtherPets === 'Yes' && values.otherPetsDetails ? ` · ${values.otherPetsDetails}` : ''}</dd></div></dl></section>
          {submitError && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" role="alert">{submitError}</p>}
          {Object.keys(errors).length > 0 && <p className="text-sm font-medium text-red-700" role="alert">Please correct the highlighted fields before submitting.</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Button to={`/pets/${pet.id}`} variant="secondary">Back</Button><Button aria-busy={isSubmitting} disabled={isSubmitting} type="submit"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />{isSubmitting ? 'Submitting...' : 'Submit Application'}</Button></div>
        </form>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-5"><PetSummary pet={pet} organizationName={organizationName} /><section className="rounded-2xl border border-ink/5 bg-white p-4 shadow-card"><p className="text-sm font-semibold text-ink">What happens next?</p><p className="mt-2 text-sm leading-6 text-muted">The organization will review your application. You can follow updates in My Applications.</p><p className="mt-3 text-xs leading-5 text-muted">Your application is for {organizationName}. Home4Paws does not guarantee approval.</p></section></aside>
    </div>
  </PageFrame>
}
