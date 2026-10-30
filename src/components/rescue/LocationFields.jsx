import FormField, { fieldControlClass } from './FormField.jsx'

export default function LocationFields({ values, errors, onChange }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Where did you find the animal?</p>
      <FormField label="Address / Area" htmlFor="address" required error={errors.address}>
        {(descriptionId) => (
          <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.address)} aria-required="true" autoComplete="street-address" className={fieldControlClass} id="address" name="address" onChange={(event) => onChange('address', event.target.value)} placeholder="Street, neighbourhood, or nearby landmark" value={values.address} />
        )}
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="City" htmlFor="city" required error={errors.city}>
          {(descriptionId) => (
            <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.city)} aria-required="true" autoComplete="address-level2" className={fieldControlClass} id="city" name="city" onChange={(event) => onChange('city', event.target.value)} placeholder="Enter city" value={values.city} />
          )}
        </FormField>
        <FormField label="State" htmlFor="state" required error={errors.state}>
          {(descriptionId) => (
            <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.state)} aria-required="true" autoComplete="address-level1" className={fieldControlClass} id="state" name="state" onChange={(event) => onChange('state', event.target.value)} placeholder="Enter state" value={values.state} />
          )}
        </FormField>
        <FormField label="Pincode" htmlFor="pincode" required error={errors.pincode}>
          {(descriptionId) => (
            <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.pincode)} aria-required="true" autoComplete="postal-code" className={fieldControlClass} id="pincode" inputMode="numeric" maxLength={6} name="pincode" onChange={(event) => onChange('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit pincode" value={values.pincode} />
          )}
        </FormField>
      </div>
    </div>
  )
}
