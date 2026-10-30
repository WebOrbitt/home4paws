import { useRef, useState } from 'react'
import { FileText, RotateCcw, Trash2, Upload } from 'lucide-react'
import Button from '../Button.jsx'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function FileUpload({ id, label, value, onChange, error }) {
  const inputRef = useRef(null)
  const [fileError, setFileError] = useState('')

  function chooseFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Choose a document smaller than 10 MB.')
      return
    }
    setFileError('')
    onChange(file)
  }

  function removeFile() {
    onChange(null)
    setFileError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const message = error || fileError
  return (
    <div>
      <p className="mb-2 block text-sm font-semibold text-ink" id={`${id}-label`}>
        {label}<span aria-hidden="true" className="ml-1 text-coral">*</span><span className="sr-only"> (required)</span>
      </p>
      <input accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" className="sr-only" id={id} onChange={chooseFile} ref={inputRef} type="file" />
      {value ? (
        <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-ink/15 bg-white p-2.5">
          <FileText aria-hidden="true" className="h-5 w-5 shrink-0 text-forest" />
          <span className="min-w-0 flex-1 truncate text-sm text-ink" title={value.name}>{value.name}</span>
          <Button aria-label={`Replace ${label.toLowerCase()}`} className="min-h-9 px-3 py-2" onClick={() => inputRef.current?.click()} type="button" variant="text">
            <RotateCcw aria-hidden="true" className="h-4 w-4" /><span className="sr-only sm:not-sr-only">Replace</span>
          </Button>
          <Button aria-label={`Remove ${label.toLowerCase()}`} className="min-h-9 px-3 py-2 text-red-700 hover:bg-red-50" onClick={removeFile} type="button" variant="text">
            <Trash2 aria-hidden="true" className="h-4 w-4" /><span className="sr-only sm:not-sr-only">Remove</span>
          </Button>
        </div>
      ) : (
        <button
          aria-describedby={message ? `${id}-error` : `${id}-hint`}
          aria-invalid={Boolean(message)}
          aria-label={`Choose ${label}`}
          className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-dashed border-ink/20 bg-white px-4 py-3 text-left text-sm text-forest transition hover:border-forest/50 hover:bg-sage/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          id={`${id}-action`}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <Upload aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>Choose document</span>
          <span className="ml-auto text-xs text-muted">PDF or image · up to 10 MB</span>
        </button>
      )}
      {!value && <p className="mt-1.5 text-xs text-muted" id={`${id}-hint`}>PDF, JPG, PNG, or WebP</p>}
      {message && <p className="mt-1.5 text-xs font-medium text-red-700" id={`${id}-error`} role="alert">{message}</p>}
    </div>
  )
}
