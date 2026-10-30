import { useState } from 'react'
import FormField, { fieldControlClass } from '../rescue/FormField.jsx'
import Button from '../Button.jsx'
import PetImageUpload from './PetImageUpload.jsx'
import PersonalitySelector from './PersonalitySelector.jsx'
import BehaviourSelector from './BehaviourSelector.jsx'
import HealthFields from './HealthFields.jsx'

const blankValues = {
  name: '', species: '', breed: '', ageValue: '', ageUnit: 'years', ageMode: 'known', ageUnknown: false, ageApproximate: '',
  gender: '', size: '', images: [], description: '', rescueStory: '', personality: [],
  goodWithChildren: 'Unknown', goodWithDogs: 'Unknown', goodWithCats: 'Unknown', goodWithStrangers: 'Unknown',
  activityLevel: '', vaccinated: 'Unknown', sterilized: 'Unknown', medicalCondition: '', specialNeeds: '',
  address: '', city: '', state: '', pincode: '', adoptionStatus: 'Available', rescueReportId: '',
}

function selectBoolean(value) {
  return value == null ? 'Unknown' : value ? 'Yes' : 'No'
}

function formValuesFromPet(pet) {
  if (!pet) return { ...blankValues }
  const parsedAge = String(pet.age || '').match(/^(\d+)\s*(months?|years?)$/i)
  const approximateAge = pet.ageApproximate || (['Newborn', 'Young', 'Adult', 'Senior'].includes(pet.age) ? pet.age : '')
  return {
    ...blankValues,
    name: pet.name || '',
    species: pet.species || '',
    breed: pet.breed || '',
    ageValue: pet.ageValue || parsedAge?.[1] || '',
    ageUnit: pet.ageUnit || (parsedAge?.[2]?.toLowerCase().startsWith('month') ? 'months' : 'years'),
    ageUnknown: Boolean(pet.ageUnknown || (pet.age === 'Unknown' && !approximateAge)),
    ageMode: Boolean(pet.ageUnknown || (pet.age === 'Unknown' && !approximateAge)) ? 'unknown' : approximateAge ? 'approximate' : 'known',
    ageApproximate: approximateAge,
    gender: pet.gender || '',
    size: pet.size || '',
    images: [...(pet.images?.length ? pet.images : pet.image ? [pet.image] : [])],
    description: pet.description || '',
    rescueStory: pet.rescueStory || '',
    personality: [...(pet.personality || [])],
    goodWithChildren: selectBoolean(pet.goodWithChildren),
    goodWithDogs: selectBoolean(pet.goodWithDogs ?? pet.goodWithPets?.dogs),
    goodWithCats: selectBoolean(pet.goodWithCats ?? pet.goodWithPets?.cats),
    goodWithStrangers: selectBoolean(pet.goodWithStrangers),
    activityLevel: pet.activityLevel || '',
    vaccinated: selectBoolean(pet.vaccinated),
    sterilized: selectBoolean(pet.sterilized),
    medicalCondition: pet.medicalCondition === 'None known' ? '' : pet.medicalCondition || '',
    specialNeeds: pet.specialNeeds === 'None' ? '' : pet.specialNeeds || '',
    address: pet.address || '',
    city: pet.city || pet.location || '',
    state: pet.state || '',
    pincode: pet.pincode || '',
    adoptionStatus: pet.adoptionStatus || (pet.status === 'adopted' ? 'Adopted' : pet.status === 'under-adoption' ? 'Under Adoption' : 'Available'),
    rescueReportId: pet.rescueReportId || '',
  }
}

function booleanValue(value) {
  return value === 'Yes' ? true : value === 'No' ? false : null
}

function Group({ title, children, description }) {
  return <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
    <h2 className="text-base font-semibold text-ink">{title}</h2>
    {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    <div className="mt-4">{children}</div>
  </section>
}

function TextField({ id, label, value, onChange, placeholder, error, required = false, type = 'text', maxLength, inputMode }) {
  return <FormField error={error} htmlFor={id} label={label} required={required}>
    {(describedBy) => <input aria-describedby={describedBy} aria-invalid={Boolean(error)} className={fieldControlClass} id={id} inputMode={inputMode} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} />}
  </FormField>
}

function SelectField({ id, label, value, onChange, options, error, required = false, disabled = false, hint }) {
  return <FormField error={error} hint={hint} htmlFor={id} label={label} required={required}>
    {(describedBy) => <select aria-describedby={describedBy} aria-invalid={Boolean(error)} className={fieldControlClass} disabled={disabled} id={id} onChange={(event) => onChange(event.target.value)} value={value}>
      <option value="">Select</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>}
  </FormField>
}

function TextAreaField({ id, label, value, onChange, placeholder, maxLength = 500, hint }) {
  return <FormField hint={hint} htmlFor={id} label={label}>
    {(describedBy) => <textarea aria-describedby={describedBy} className={`${fieldControlClass} min-h-28 resize-y`} id={id} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} />}
  </FormField>
}

export default function PetForm({ initialPet, prefill, organization, onSubmit, submitLabel, cancelTo, statusLocked = false }) {
  const [values, setValues] = useState(() => formValuesFromPet(prefill || initialPet))
  const [imageFilesByPreview, setImageFilesByPreview] = useState({})
  const [errors, setErrors] = useState({})
  const [confirmAdopted, setConfirmAdopted] = useState(initialPet?.adoptionStatus === 'Adopted')
  const set = (key, value) => setValues((current) => ({ ...current, [key]: value }))
  const setHealth = (updates) => setValues((current) => ({ ...current, ...updates }))

  function validate() {
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Enter the pet name.'
    if (!values.species) nextErrors.species = 'Choose an animal type.'
    if (values.ageMode === 'known' && (!values.ageValue.trim() || Number(values.ageValue) < 0)) nextErrors.ageValue = 'Enter an age or choose Unknown.'
    if (values.ageMode === 'approximate' && !values.ageApproximate) nextErrors.ageApproximate = 'Choose an approximate age group.'
    if (!values.gender) nextErrors.gender = 'Choose a gender.'
    if (!values.images.length) nextErrors.images = 'Add at least one pet photo.'
    if (values.adoptionStatus === 'Adopted' && !confirmAdopted) nextErrors.adoptionStatus = 'Confirm that this pet has already been adopted.'
    setErrors(nextErrors)
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) document.getElementById(firstError === 'images' ? 'pet-images' : firstError === 'ageApproximate' ? 'ageApproximate' : firstError)?.focus()
    return Object.keys(nextErrors).length === 0
  }

  function submit(event) {
    event.preventDefault()
    if (!validate()) return
    const ageCount = Number(values.ageValue)
    const ageUnitLabel = values.ageUnit.slice(0, -1) + (ageCount === 1 ? '' : 's')
    const age = values.ageUnknown ? 'Unknown' : values.ageApproximate || `${values.ageValue.trim()} ${ageUnitLabel}`
    const goodWithChildren = booleanValue(values.goodWithChildren)
    const goodWithDogs = booleanValue(values.goodWithDogs)
    const goodWithCats = booleanValue(values.goodWithCats)
    const goodWithStrangers = booleanValue(values.goodWithStrangers)
    const ageNumber = Number(values.ageValue)
    const ageGroup = values.ageUnknown ? 'unknown' : values.ageApproximate
      ? (values.ageApproximate === 'Senior' ? 'senior' : values.ageApproximate === 'Adult' ? 'adult' : 'puppy-kitten')
      : values.ageUnit === 'months' || ageNumber < 1 ? 'puppy-kitten' : ageNumber >= 7 ? 'senior' : ageNumber >= 2 ? 'adult' : 'young'
    const pet = {
      ...(initialPet || {}),
      organizationId: initialPet?.organizationId || organization?.id,
      organization: organization?.name || initialPet?.organization,
      organizationName: organization?.name || initialPet?.organizationName,
      rescueReportId: values.rescueReportId.trim(),
      name: values.name.trim(),
      species: values.species,
      breed: values.breed.trim(),
      age,
      ageValue: values.ageUnknown ? '' : values.ageValue.trim(),
      ageUnit: values.ageUnit,
      ageUnknown: values.ageUnknown,
      ageApproximate: values.ageApproximate,
      ageGroup,
      gender: values.gender,
      size: values.size,
      images: [...values.images],
      image: values.images[0],
      imageAlt: `${values.name.trim()}, ${values.species.toLowerCase()}`,
      description: values.description.trim(),
      rescueStory: values.rescueStory.trim(),
      currentSituation: values.description.trim() || 'Currently receiving care through the organization.',
      personality: [...values.personality],
      goodWithChildren,
      goodWithDogs,
      goodWithCats,
      goodWithStrangers,
      goodWithPets: { dogs: goodWithDogs, cats: goodWithCats },
      activityLevel: values.activityLevel,
      vaccinated: booleanValue(values.vaccinated),
      sterilized: booleanValue(values.sterilized),
      medicalCondition: values.medicalCondition.trim(),
      specialNeeds: values.specialNeeds.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      pincode: values.pincode.trim(),
      location: values.city.trim() || values.state.trim() || values.address.trim(),
      adoptionStatus: values.adoptionStatus,
      status: values.adoptionStatus === 'Adopted' ? 'adopted' : values.adoptionStatus === 'Under Adoption' ? 'under-adoption' : 'available',
      isActive: true,
    }
      onSubmit(pet, imageFilesByPreview)
  }

  return (
    <form className="space-y-4" noValidate onSubmit={submit}>
      <Group title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField error={errors.name} id="name" label="Pet Name" onChange={(value) => set('name', value)} placeholder="Enter pet name" required value={values.name} />
          <SelectField error={errors.species} id="species" label="Animal Type" onChange={(value) => set('species', value)} options={['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']} required value={values.species} />
          <TextField id="breed" label="Breed" onChange={(value) => set('breed', value)} placeholder="e.g. Indie or Labrador mix" value={values.breed} />
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="ageMode">Age <span aria-hidden="true" className="text-coral">*</span><span className="sr-only"> (required)</span></label>
            <select aria-label="Age estimate type" className={fieldControlClass} id="ageMode" onChange={(event) => setValues((current) => ({ ...current, ageMode: event.target.value, ageUnknown: event.target.value === 'unknown', ageApproximate: event.target.value === 'approximate' ? current.ageApproximate : '' }))} value={values.ageMode}>
              <option value="known">Exact age if known</option><option value="approximate">Approximate age group</option><option value="unknown">Unknown</option>
            </select>
            {values.ageMode === 'approximate' && <div className="mt-2">
              <select aria-describedby={errors.ageApproximate ? 'ageApproximate-error' : undefined} aria-invalid={Boolean(errors.ageApproximate)} aria-label="Approximate age group" className={fieldControlClass} id="ageApproximate" onChange={(event) => { set('ageApproximate', event.target.value); setErrors((current) => ({ ...current, ageApproximate: '' })) }} value={values.ageApproximate}>
                <option value="">Select approximate age</option>{['Newborn', 'Young', 'Adult', 'Senior'].map((item) => <option key={item}>{item}</option>)}
              </select>
              {errors.ageApproximate && <p className="mt-1.5 text-xs font-medium text-red-700" id="ageApproximate-error" role="alert">{errors.ageApproximate}</p>}
            </div>}
            {values.ageMode === 'known' && <div className="mt-2 grid grid-cols-[1fr_8rem] gap-2">
              <input aria-describedby={errors.ageValue ? 'ageValue-error' : undefined} aria-invalid={Boolean(errors.ageValue)} className={fieldControlClass} id="ageValue" min="0" onChange={(event) => set('ageValue', event.target.value)} placeholder="Age" type="number" value={values.ageValue} />
              <select aria-label="Age unit" className={fieldControlClass} onChange={(event) => set('ageUnit', event.target.value)} value={values.ageUnit}><option value="months">Months</option><option value="years">Years</option></select>
            </div>}
            {errors.ageValue && <p className="mt-1.5 text-xs font-medium text-red-700" id="ageValue-error" role="alert">{errors.ageValue}</p>}
          </div>
          <SelectField error={errors.gender} id="gender" label="Gender" onChange={(value) => set('gender', value)} options={['Male', 'Female', 'Unknown']} required value={values.gender} />
          <SelectField id="size" label="Size" onChange={(value) => set('size', value)} options={['Small', 'Medium', 'Large']} value={values.size} />
          <TextField id="rescueReportId" label="Rescue Report ID (optional)" onChange={(value) => set('rescueReportId', value)} placeholder="e.g. RR-2026-001" value={values.rescueReportId} />
        </div>
      </Group>

      <Group description="Photos stay in temporary browser state and are not uploaded." title="Pet Photos">
      <PetImageUpload
        error={errors.images}
        images={values.images}
        onChange={(images) => set('images', images)}
        onFileAdded={(preview, file) => setImageFilesByPreview((current) => ({ ...current, [preview]: file }))}
        onFileRemoved={(preview) => setImageFilesByPreview((current) => { const next = { ...current }; delete next[preview]; return next })}
      />
      </Group>

      <Group title="About the Pet">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextAreaField id="description" label="Description" maxLength={500} onChange={(value) => set('description', value)} placeholder="Tell potential adopters about this pet..." value={values.description} />
          <TextAreaField id="rescueStory" label="Rescue Story" maxLength={400} onChange={(value) => set('rescueStory', value)} placeholder="Explain how the animal was rescued and any relevant background." value={values.rescueStory} />
        </div>
      </Group>

      <Group title="Personality"><PersonalitySelector onChange={(personality) => set('personality', personality)} value={values.personality} /></Group>

      <Group title="Behaviour">
        <BehaviourSelector onChange={(behaviour) => setValues((current) => ({ ...current, ...behaviour }))} value={values} />
        <div className="mt-4 max-w-sm"><SelectField id="activityLevel" label="Activity Level" onChange={(value) => set('activityLevel', value)} options={['Low', 'Moderate', 'High']} value={values.activityLevel} /></div>
      </Group>

      <Group title="Health Information"><HealthFields onChange={setHealth} values={values} /></Group>

      <Group title="Current Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="address" label="Address / Area" onChange={(value) => set('address', value)} placeholder="Street or neighbourhood" value={values.address} />
          <TextField id="city" label="City" onChange={(value) => set('city', value)} placeholder="Enter city" value={values.city} />
          <TextField id="state" label="State" onChange={(value) => set('state', value)} placeholder="Enter state" value={values.state} />
          <TextField id="pincode" inputMode="numeric" label="Pincode" maxLength={6} onChange={(value) => set('pincode', value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit pincode" value={values.pincode} />
        </div>
      </Group>

      <Group title="Adoption Status">
        <div className="max-w-sm">
          <SelectField disabled={statusLocked} error={errors.adoptionStatus} hint={statusLocked ? 'An approved or completed adoption application controls this pet’s status.' : undefined} id="adoptionStatus" label="Status" onChange={(value) => set('adoptionStatus', value)} options={['Available', 'Under Adoption', 'Adopted']} value={values.adoptionStatus} />
          {values.adoptionStatus === 'Adopted' && <label className="mt-3 flex items-start gap-2 text-sm leading-5 text-muted"><input checked={confirmAdopted} className="mt-1 h-4 w-4 accent-forest" onChange={(event) => setConfirmAdopted(event.target.checked)} type="checkbox" />I confirm this pet has already been adopted.</label>}
        </div>
      </Group>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button className="w-full sm:w-auto" to={cancelTo} variant="secondary">Cancel</Button>
        <Button className="w-full sm:w-auto" type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
