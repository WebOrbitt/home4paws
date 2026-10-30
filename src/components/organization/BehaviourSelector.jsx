import { fieldControlClass } from '../rescue/FormField.jsx'

const questions = [
  ['goodWithChildren', 'Children'],
  ['goodWithDogs', 'Other dogs'],
  ['goodWithCats', 'Cats'],
  ['goodWithStrangers', 'Strangers'],
]

export default function BehaviourSelector({ value, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {questions.map(([key, label]) => <div key={key}>
        <label className="mb-2 block text-sm font-semibold text-ink" htmlFor={key}>{label}</label>
        <select className={fieldControlClass} id={key} onChange={(event) => onChange({ ...value, [key]: event.target.value })} value={value[key]}>
          <option value="Unknown">Unknown</option><option value="Yes">Yes</option><option value="No">No</option>
        </select>
      </div>)}
    </div>
  )
}
