import FormField, { fieldControlClass } from '../rescue/FormField.jsx'

export default function HealthFields({ values, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        ['vaccinated', 'Vaccinated'],
        ['sterilized', 'Sterilized'],
      ].map(([key, label]) => <FormField htmlFor={key} key={key} label={label}>{(describedBy) => <select aria-describedby={describedBy} className={fieldControlClass} id={key} onChange={(event) => onChange({ ...values, [key]: event.target.value })} value={values[key]}><option value="Unknown">Unknown</option><option value="Yes">Yes</option><option value="No">No</option></select>}</FormField>)}
      <FormField htmlFor="medicalCondition" label="Medical Condition" className="sm:col-span-2">{(describedBy) => <textarea aria-describedby={describedBy} className={`${fieldControlClass} min-h-24 resize-y`} id="medicalCondition" maxLength={300} onChange={(event) => onChange({ ...values, medicalCondition: event.target.value })} placeholder="Add a known condition, or leave blank" value={values.medicalCondition} />}</FormField>
      <FormField htmlFor="specialNeeds" label="Special Needs" className="sm:col-span-2">{(describedBy) => <textarea aria-describedby={describedBy} className={`${fieldControlClass} min-h-24 resize-y`} id="specialNeeds" maxLength={300} onChange={(event) => onChange({ ...values, specialNeeds: event.target.value })} placeholder="Add any care needs, or leave blank" value={values.specialNeeds} />}</FormField>
    </div>
  )
}
