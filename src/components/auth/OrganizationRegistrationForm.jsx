import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { isValidEmail, isValidIndianMobile } from '../../auth/validation.js'
import Button from '../Button.jsx'
import FormField, { fieldControlClass } from '../rescue/FormField.jsx'
import FileUpload from './FileUpload.jsx'
import StepIndicator from './StepIndicator.jsx'
import PasswordField from './PasswordField.jsx'

const initialValues = {
  organizationName: '', organizationType: '', registrationNumber: '', yearEstablished: '', organizationDescription: '',
  contactPersonName: '', designation: '', officialEmail: '', mobile: '', password: '', confirmPassword: '',
  fullAddress: '', city: '', state: '', pincode: '',
}

const documentFields = [
  ['registrationCertificate', 'NGO/Shelter Registration Certificate'],
  ['authorizedPersonId', 'Authorized Person ID'],
  ['addressProof', 'Address Proof'],
]

const stepFields = [
  ['organizationName', 'organizationType', 'registrationNumber', 'yearEstablished', 'organizationDescription'],
  ['contactPersonName', 'designation', 'officialEmail', 'mobile', 'password', 'confirmPassword'],
  ['fullAddress', 'city', 'state', 'pincode'],
  documentFields.map(([key]) => key),
]

export default function OrganizationRegistrationForm({ onSubmit }) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(initialValues)
  const [files, setFiles] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function updateFile(name, file) {
    setFiles((current) => ({ ...current, [name]: file }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function validateCurrentStep() {
    const nextErrors = {}
    if (step === 0) {
      if (!values.organizationName.trim()) nextErrors.organizationName = 'Enter the organization name.'
      if (!values.organizationType) nextErrors.organizationType = 'Choose the organization type.'
      if (!values.registrationNumber.trim()) nextErrors.registrationNumber = 'Enter the registration number.'
      const year = Number(values.yearEstablished)
      if (!values.yearEstablished) nextErrors.yearEstablished = 'Enter the year established.'
      else if (!/^\d{4}$/.test(values.yearEstablished) || year < 1800 || year > new Date().getFullYear()) nextErrors.yearEstablished = 'Enter a valid year.'
      if (!values.organizationDescription.trim()) nextErrors.organizationDescription = 'Add a short organization description.'
    }
    if (step === 1) {
      if (!values.contactPersonName.trim()) nextErrors.contactPersonName = 'Enter the contact person’s name.'
      if (!values.designation.trim()) nextErrors.designation = 'Enter the contact person’s designation.'
      if (!values.officialEmail.trim()) nextErrors.officialEmail = 'Enter the official email.'
      else if (!isValidEmail(values.officialEmail)) nextErrors.officialEmail = 'Enter a valid email address.'
      if (!values.mobile.trim()) nextErrors.mobile = 'Enter a mobile number.'
      else if (!isValidIndianMobile(values.mobile)) nextErrors.mobile = 'Enter a valid Indian mobile number.'
      if (values.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
      if (!values.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.'
      else if (values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    }
    if (step === 2) {
      if (!values.fullAddress.trim()) nextErrors.fullAddress = 'Enter the full address.'
      if (!values.city.trim()) nextErrors.city = 'Enter the city.'
      if (!values.state.trim()) nextErrors.state = 'Enter the state.'
      if (!values.pincode.trim()) nextErrors.pincode = 'Enter the pincode.'
      else if (!/^\d{6}$/.test(values.pincode)) nextErrors.pincode = 'Enter a valid 6-digit pincode.'
    }
    if (step === 3) {
      for (const [key, label] of documentFields) {
        if (!files[key]) nextErrors[key] = `Select ${label.toLowerCase()}.`
      }
    }

    setErrors(nextErrors)
    return nextErrors
  }

  async function next() {
    if (isSubmitting) return
    const stepErrors = validateCurrentStep()
    const firstError = stepFields[step].find((field) => stepErrors[field])
    if (firstError) {
      const fieldIds = { mobile: 'organizationMobile', city: 'organizationCity', state: 'organizationState', pincode: 'organizationPincode' }
      document.getElementById(`${firstError}-action`)?.focus()
      document.getElementById(fieldIds[firstError] || firstError)?.focus()
      return
    }
    if (step < 3) setStep((current) => current + 1)
    else {
      setIsSubmitting(true)
      setSubmitError('')
      try { await onSubmit({ ...values, documents: files }) }
      catch (error) { setSubmitError(error.message || 'Registration could not be submitted. Try again.') }
      finally { setIsSubmitting(false) }
    }
  }

  function back() {
    setErrors({})
    setStep((current) => Math.max(0, current - 1))
  }

  return (
    <section aria-labelledby="organization-form-heading" className="rounded-3xl border border-ink/5 bg-white p-5 shadow-card sm:p-8">
      <StepIndicator currentStep={step} />
      <h2 className="text-xl font-semibold tracking-tight text-ink" id="organization-form-heading">
        {['Organization Details', 'Contact Details', 'Address', 'Documents'][step]}
      </h2>
      <p className="mt-1 text-sm text-muted">Step {step + 1} of 4</p>

      <div className="mt-6 space-y-5">
        {step === 0 && (
          <>
            <FormField error={errors.organizationName} htmlFor="organizationName" label="Organization Name" required>
              {(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.organizationName)} aria-required="true" autoComplete="organization" className={fieldControlClass} id="organizationName" onChange={(event) => update('organizationName', event.target.value)} placeholder="Enter organization name" value={values.organizationName} />}
            </FormField>
            <FormField error={errors.organizationType} htmlFor="organizationType" label="Organization Type" required>
              {(descriptionId) => (
                <select aria-describedby={descriptionId} aria-invalid={Boolean(errors.organizationType)} aria-required="true" className={fieldControlClass} id="organizationType" onChange={(event) => update('organizationType', event.target.value)} value={values.organizationType}>
                  <option value="">Select type</option>
                  <option value="NGO">NGO</option>
                  <option value="SHELTER">Animal Shelter</option>
                </select>
              )}
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField error={errors.registrationNumber} htmlFor="registrationNumber" label="Registration Number" required>
                {(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.registrationNumber)} aria-required="true" className={fieldControlClass} id="registrationNumber" onChange={(event) => update('registrationNumber', event.target.value)} placeholder="Enter registration number" value={values.registrationNumber} />}
              </FormField>
              <FormField error={errors.yearEstablished} htmlFor="yearEstablished" label="Year Established" required>
                {(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.yearEstablished)} aria-required="true" className={fieldControlClass} id="yearEstablished" inputMode="numeric" maxLength={4} onChange={(event) => update('yearEstablished', event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="e.g. 2012" value={values.yearEstablished} />}
              </FormField>
            </div>
            <FormField error={errors.organizationDescription} htmlFor="organizationDescription" label="Organization Description" required>
              {(descriptionId) => <textarea aria-describedby={descriptionId} aria-invalid={Boolean(errors.organizationDescription)} aria-required="true" className={`${fieldControlClass} min-h-28 resize-y`} id="organizationDescription" onChange={(event) => update('organizationDescription', event.target.value)} placeholder="Briefly describe your organization and its work" rows="4" value={values.organizationDescription} />}
            </FormField>
          </>
        )}

        {step === 1 && (
          <>
            <FormField error={errors.contactPersonName} htmlFor="contactPersonName" label="Contact Person Name" required>
              {(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.contactPersonName)} aria-required="true" autoComplete="name" className={fieldControlClass} id="contactPersonName" onChange={(event) => update('contactPersonName', event.target.value)} placeholder="Enter contact person’s name" value={values.contactPersonName} />}
            </FormField>
            <FormField error={errors.designation} htmlFor="designation" label="Designation" required>
              {(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.designation)} aria-required="true" className={fieldControlClass} id="designation" onChange={(event) => update('designation', event.target.value)} placeholder="e.g. Founder or Coordinator" value={values.designation} />}
            </FormField>
            <FormField error={errors.officialEmail} htmlFor="officialEmail" label="Official Email" required>
              {(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.officialEmail)} aria-required="true" autoComplete="email" className={fieldControlClass} id="officialEmail" onChange={(event) => update('officialEmail', event.target.value)} placeholder="name@organization.org" type="email" value={values.officialEmail} />}
            </FormField>
            <FormField error={errors.mobile} htmlFor="organizationMobile" label="Mobile Number" required>
              {(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.mobile)} aria-required="true" autoComplete="tel" className={fieldControlClass} id="organizationMobile" inputMode="tel" onChange={(event) => update('mobile', event.target.value)} placeholder="10-digit Indian mobile number" type="tel" value={values.mobile} />}
            </FormField>
            <PasswordField autoComplete="new-password" error={errors.password} hint="Use at least 8 characters." id="organizationPassword" label="Password" onChange={(event) => update('password', event.target.value)} value={values.password} />
            <PasswordField autoComplete="new-password" error={errors.confirmPassword} id="organizationConfirmPassword" label="Confirm Password" onChange={(event) => update('confirmPassword', event.target.value)} value={values.confirmPassword} />
          </>
        )}

        {step === 2 && (
          <>
            <FormField error={errors.fullAddress} htmlFor="fullAddress" label="Full Address" required>
              {(descriptionId) => <textarea aria-describedby={descriptionId} aria-invalid={Boolean(errors.fullAddress)} aria-required="true" autoComplete="street-address" className={`${fieldControlClass} min-h-24 resize-y`} id="fullAddress" onChange={(event) => update('fullAddress', event.target.value)} placeholder="Building, street, and area" rows="3" value={values.fullAddress} />}
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField error={errors.city} htmlFor="organizationCity" label="City" required>
                {(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.city)} aria-required="true" autoComplete="address-level2" className={fieldControlClass} id="organizationCity" onChange={(event) => update('city', event.target.value)} placeholder="Enter city" value={values.city} />}
              </FormField>
              <FormField error={errors.state} htmlFor="organizationState" label="State" required>
                {(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.state)} aria-required="true" autoComplete="address-level1" className={fieldControlClass} id="organizationState" onChange={(event) => update('state', event.target.value)} placeholder="Enter state" value={values.state} />}
              </FormField>
              <FormField error={errors.pincode} htmlFor="organizationPincode" label="Pincode" required>
                {(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.pincode)} aria-required="true" autoComplete="postal-code" className={fieldControlClass} id="organizationPincode" inputMode="numeric" maxLength={6} onChange={(event) => update('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit pincode" value={values.pincode} />}
              </FormField>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="rounded-xl bg-cream px-4 py-3 text-xs leading-5 text-muted">Choose the requested documents. They will be sent securely for admin verification.</p>
            {documentFields.map(([key, label]) => (
              <FileUpload error={errors[key]} id={key} key={key} label={label} onChange={(file) => updateFile(key, file)} value={files[key]} />
            ))}
          </>
        )}
      </div>

      {submitError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{submitError}</p>}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {step === 0 ? (
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-forest hover:bg-sage" to="/register"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back</Link>
        ) : (
          <Button onClick={back} type="button" variant="secondary"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back</Button>
        )}
        <Button aria-busy={isSubmitting} className="w-full sm:w-auto" disabled={isSubmitting} onClick={next} type="button">
          {step === 3 ? isSubmitting ? 'Submitting...' : 'Submit Registration' : <>Next <ArrowRight aria-hidden="true" className="h-4 w-4" /></>}
        </Button>
      </div>
    </section>
  )
}
