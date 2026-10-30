import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import FormField, { fieldControlClass } from '../rescue/FormField.jsx'

export default function PasswordField({ id, label = 'Password', value, onChange, error, autoComplete = 'current-password', hint }) {
  const [visible, setVisible] = useState(false)
  return (
    <FormField error={error} hint={hint} htmlFor={id} label={label} required>
      {(descriptionId) => (
        <div className="relative">
          <input
            aria-describedby={descriptionId}
            aria-invalid={Boolean(error)}
            aria-required="true"
            autoComplete={autoComplete}
            className={`${fieldControlClass} pr-12`}
            id={id}
            maxLength={72}
            name={id}
            onChange={onChange}
            type={visible ? 'text' : 'password'}
            value={value}
          />
          <button
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-xl text-muted transition hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest"
            onClick={() => setVisible((shown) => !shown)}
            type="button"
          >
            {visible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
          </button>
        </div>
      )}
    </FormField>
  )
}
