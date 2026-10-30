import { useEffect, useRef, useState } from 'react'
import { ImagePlus, RotateCcw, Trash2 } from 'lucide-react'
import Button from '../Button.jsx'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function ImageUpload({ value, onChange }) {
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!value) {
      setPreviewUrl('')
      return undefined
    }
    const objectUrl = URL.createObjectURL(value)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [value])

  function handleFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    event.target.value = ''

    if (!allowedTypes.includes(file.type)) {
      onChange(null)
      setError('Choose a JPG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      onChange(null)
      setError('The image must be 5 MB or smaller.')
      return
    }

    setError('')
    onChange(file)
  }

  function removeImage() {
    onChange(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <p className="mb-2 block text-sm font-semibold text-ink" id="rescue-image-label">Photo <span className="font-normal text-muted">(optional)</span></p>
      <input
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        id="rescue-image"
        onChange={handleFile}
        ref={inputRef}
        type="file"
      />
      {value && previewUrl ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-cream/70 p-3 sm:flex-row sm:items-center">
          <img alt={`Preview of ${value.name}`} className="h-36 w-full rounded-xl object-cover sm:w-44" src={previewUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{value.name}</p>
            <p className="mt-1 text-xs text-muted">{(value.size / 1024 / 1024).toFixed(2)} MB</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button className="min-h-10 px-4 py-2" onClick={() => inputRef.current?.click()} type="button" variant="secondary">
                <RotateCcw aria-hidden="true" className="h-4 w-4" /> Change photo
              </Button>
              <Button className="min-h-10 px-4 py-2 text-red-700 hover:bg-red-50" onClick={removeImage} type="button" variant="text">
                <Trash2 aria-hidden="true" className="h-4 w-4" /> Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          aria-describedby={error ? 'rescue-image-error' : 'rescue-image-hint'}
          aria-label="Choose an image to upload"
          className="flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-ink/20 bg-cream/60 px-4 py-5 text-center transition hover:border-forest/50 hover:bg-sage/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-forest">
            <ImagePlus aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="mt-2 text-sm font-semibold text-forest">Choose an image</span>
          <span className="mt-1 text-xs text-muted" id="rescue-image-hint">JPG, PNG, WebP, or GIF · up to 5 MB</span>
        </button>
      )}
      {error && <p className="mt-2 text-xs font-medium text-red-700" id="rescue-image-error" role="alert">{error}</p>}
    </div>
  )
}
