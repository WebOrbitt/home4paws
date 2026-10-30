import FormField, { fieldControlClass } from './FormField.jsx'

const conditions = ['Healthy', 'Injured', 'Sick', 'Abandoned', 'Lost', 'In Danger', 'Unknown']

export default function ConditionSelector({ value, onChange, error }) {
  return (
    <FormField label="Current Condition" htmlFor="condition" required error={error}>
      {(descriptionId) => (
        <select
          aria-describedby={descriptionId}
          aria-invalid={Boolean(error)}
          aria-required="true"
          className={fieldControlClass}
          id="condition"
          name="condition"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">Select current condition</option>
          {conditions.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
        </select>
      )}
    </FormField>
  )
}
