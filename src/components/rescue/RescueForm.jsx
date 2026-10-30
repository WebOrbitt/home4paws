import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import Button from '../Button.jsx'
import ConditionSelector from './ConditionSelector.jsx'
import FormField, { fieldControlClass } from './FormField.jsx'
import ImageUpload from './ImageUpload.jsx'
import LocationFields from './LocationFields.jsx'

const initialValues = {
  animalType: '', breed: '', age: 'Unknown', gender: 'Unknown', condition: '', description: '',
  address: '', city: '', state: '', pincode: '', dateFound: '', reporterName: '', mobile: '',
  email: '', additionalInformation: '',
}

const ageOptions = ['Newborn', 'Young', 'Adult', 'Senior', 'Unknown']
const genderOptions = ['Male', 'Female', 'Unknown']
const localToday = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

export default function RescueForm({ onSubmit, isSubmitting = false }) {
  const [values, setValues] = useState(initialValues)
  const [photo, setPhoto] = useState(null)
  const [errors, setErrors] = useState({})

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function validate() {
    const nextErrors = {}
    const requiredFields = [
      ['animalType', 'Choose an animal type.'],
      ['condition', 'Choose the animal’s current condition.'],
      ['address', 'Enter the address or area where the animal was found.'],
      ['city', 'Enter the city.'],
      ['state', 'Enter the state.'],
      ['dateFound', 'Choose the date the animal was found.'],
      ['reporterName', 'Enter your name.'],
      ['mobile', 'Enter a mobile number.'],
    ]
    for (const [field, message] of requiredFields) {
      if (!values[field].trim()) nextErrors[field] = message
    }
    if (!values.pincode.trim()) nextErrors.pincode = 'Enter the pincode.'
    else if (!/^\d{6}$/.test(values.pincode)) nextErrors.pincode = 'Enter a valid 6-digit pincode.'

    const phoneDigits = values.mobile.replace(/\D/g, '')
    if (values.mobile.trim() && (phoneDigits.length < 10 || phoneDigits.length > 15)) {
      nextErrors.mobile = 'Enter a valid mobile number.'
    }
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (values.dateFound) {
      const selectedDate = new Date(`${values.dateFound}T00:00:00`)
      const today = new Date(`${localToday()}T23:59:59`)
      if (selectedDate > today) nextErrors.dateFound = 'The date found cannot be in the future.'
    }

    setErrors(nextErrors)
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      const requiredOrder = ['animalType', 'condition', 'address', 'city', 'state', 'pincode', 'dateFound', 'reporterName', 'mobile']
      const firstError = requiredOrder.find((field) => validationErrors[field]) || Object.keys(validationErrors)[0]
      document.getElementById(firstError)?.focus()
      return
    }

    await onSubmit({ ...values, photo })
  }

  return (
    <form className="overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-card" noValidate onSubmit={handleSubmit}>
      <section aria-labelledby="pet-information-heading" className="p-5 sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">01</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink" id="pet-information-heading">Pet Information</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Animal Type" htmlFor="animalType" required error={errors.animalType}>
            {(descriptionId) => (
              <select aria-describedby={descriptionId} aria-invalid={Boolean(errors.animalType)} aria-required="true" className={fieldControlClass} id="animalType" name="animalType" onChange={(event) => updateField('animalType', event.target.value)} value={values.animalType}>
                <option value="">Select animal type</option>
                {['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            )}
          </FormField>
          <FormField label="Breed" htmlFor="breed" hint="Optional">
            {(descriptionId) => (
              <input aria-describedby={descriptionId} className={fieldControlClass} id="breed" name="breed" onChange={(event) => updateField('breed', event.target.value)} placeholder="Enter breed if known" value={values.breed} />
            )}
          </FormField>
          <FormField label="Approximate Age" htmlFor="age">
            {(descriptionId) => (
              <select aria-describedby={descriptionId} className={fieldControlClass} id="age" name="age" onChange={(event) => updateField('age', event.target.value)} value={values.age}>
                {ageOptions.map((age) => <option key={age} value={age}>{age}</option>)}
              </select>
            )}
          </FormField>
          <FormField label="Gender" htmlFor="gender">
            {(descriptionId) => (
              <select aria-describedby={descriptionId} className={fieldControlClass} id="gender" name="gender" onChange={(event) => updateField('gender', event.target.value)} value={values.gender}>
                {genderOptions.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
              </select>
            )}
          </FormField>
        </div>
      </section>

      <section aria-labelledby="rescue-condition-heading" className="border-t border-ink/10 p-5 sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">02</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink" id="rescue-condition-heading">Rescue Condition</h2>
        </div>
        <div className="space-y-5">
          <ConditionSelector error={errors.condition} onChange={(value) => updateField('condition', value)} value={values.condition} />
          <FormField label="Description" htmlFor="description" hint="Share any visible signs, behaviour, or immediate concerns.">
            {(descriptionId) => (
              <textarea aria-describedby={descriptionId} className={`${fieldControlClass} min-h-28 resize-y`} id="description" name="description" onChange={(event) => updateField('description', event.target.value)} placeholder="Tell us what you observed about the animal..." rows="4" value={values.description} />
            )}
          </FormField>
          <ImageUpload onChange={setPhoto} value={photo} />
        </div>
      </section>

      <section aria-labelledby="location-reporter-heading" className="border-t border-ink/10 p-5 sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">03</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink" id="location-reporter-heading">Location &amp; Reporter</h2>
        </div>
        <LocationFields errors={errors} onChange={updateField} values={values} />
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField label="Date Found" htmlFor="dateFound" required error={errors.dateFound}>
            {(descriptionId) => (
              <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.dateFound)} aria-required="true" className={fieldControlClass} id="dateFound" max={localToday()} name="dateFound" onInput={(event) => updateField('dateFound', event.currentTarget.value)} type="date" value={values.dateFound} />
            )}
          </FormField>
          <div className="hidden sm:block" />
          <FormField label="Reporter Name" htmlFor="reporterName" required error={errors.reporterName}>
            {(descriptionId) => (
              <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.reporterName)} aria-required="true" autoComplete="name" className={fieldControlClass} id="reporterName" name="reporterName" onChange={(event) => updateField('reporterName', event.target.value)} placeholder="Enter your name" value={values.reporterName} />
            )}
          </FormField>
          <FormField label="Mobile Number" htmlFor="mobile" required error={errors.mobile}>
            {(descriptionId) => (
              <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.mobile)} aria-required="true" autoComplete="tel" className={fieldControlClass} id="mobile" inputMode="tel" name="mobile" onChange={(event) => updateField('mobile', event.target.value)} placeholder="Enter your mobile number" type="tel" value={values.mobile} />
            )}
          </FormField>
          <FormField label="Email" htmlFor="email" hint="Optional">
            {(descriptionId) => (
              <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.email)} className={fieldControlClass} id="email" name="email" onChange={(event) => updateField('email', event.target.value)} placeholder="you@example.com" type="email" value={values.email} />
            )}
          </FormField>
          <div className="hidden sm:block" />
          <FormField className="sm:col-span-2" label="Additional Information" htmlFor="additionalInformation" hint="Optional">
            {(descriptionId) => (
              <textarea aria-describedby={descriptionId} className={`${fieldControlClass} min-h-24 resize-y`} id="additionalInformation" name="additionalInformation" onChange={(event) => updateField('additionalInformation', event.target.value)} placeholder="Anything else that may help the rescue team?" rows="3" value={values.additionalInformation} />
            )}
          </FormField>
        </div>
      </section>

      <div className="border-t border-ink/10 bg-cream/60 p-5 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-8">
        <p className="mb-4 text-xs leading-5 text-muted sm:mb-0">Your rescue report is saved so you can check its progress using the private tracking link.</p>
        <Button aria-busy={isSubmitting} className="w-full sm:w-auto" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Submitting...' : 'Submit Rescue Report'} {!isSubmitting && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  )
}
