import { useState } from 'react'
import { ImagePlus, Star, X } from 'lucide-react'

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`Couldn't preview ${file.name}. Try another image.`))
    reader.readAsDataURL(file)
  })
}

export default function PetImageUpload({ images, onChange, onFileAdded, onFileRemoved, error }) {
  const [uploadError, setUploadError] = useState('')
  const [isReading, setIsReading] = useState(false)

  async function addImages(event) {
    const selectedFiles = [...(event.currentTarget.files || [])]
    const files = selectedFiles.filter((file) => file.type.startsWith('image/'))
    event.currentTarget.value = ''
    if (!files.length) {
      if (selectedFiles.length) setUploadError('Choose image files to preview.')
      return
    }
    setIsReading(true)
    try {
      const previews = await Promise.all(files.map(readImage))
      setUploadError('')
      previews.forEach((preview, index) => onFileAdded?.(preview, files[index]))
      onChange([...images, ...previews])
    } catch (readError) {
      setUploadError(readError.message || 'The selected images could not be previewed.')
    } finally {
      setIsReading(false)
    }
  }

  function makePrimary(index) {
    if (index === 0) return
    const reordered = [...images]
    const [primary] = reordered.splice(index, 1)
    onChange([primary, ...reordered])
  }

  function removeImage(image, index) {
    onFileRemoved?.(image)
    onChange(images.filter((_, imageIndex) => imageIndex !== index))
  }

  return (
    <div>
      <div aria-busy={isReading} className={`rounded-2xl border border-dashed ${error ? 'border-red-500' : 'border-ink/20'} bg-cream/60 p-4 sm:p-5`}>
        <label className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl text-center text-sm font-semibold text-forest hover:bg-white/70 focus-within:outline-none focus-within:ring-2 focus-within:ring-forest ${isReading ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}>
          <ImagePlus aria-hidden="true" className="h-6 w-6" />
          <span aria-live="polite">{isReading ? 'Loading image previews...' : 'Add pet photos'}</span>
          {!isReading && <span className="text-xs font-normal text-muted">Choose one or more images. The first is the primary photo.</span>}
          <input accept="image/*" className="sr-only" disabled={isReading} id="pet-images" multiple onChange={addImages} type="file" />
        </label>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-700" role="alert">{error}</p>}
      {uploadError && <p className="mt-1.5 text-xs font-medium text-red-700" role="alert">{uploadError}</p>}
      {images.length > 0 && <ul aria-label="Uploaded pet photo previews" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <li className="relative overflow-hidden rounded-xl border border-ink/10 bg-white" key={`${index}-${image.slice(0, 48)}`}>
            <img alt={`Pet photo ${index + 1}`} className="aspect-square w-full object-cover" src={image} />
            {index === 0 ? <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-forest"><Star aria-hidden="true" className="h-3 w-3 fill-current" /> Primary Photo</span> : <button aria-label={`Set photo ${index + 1} as primary`} className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-forest hover:bg-white" onClick={() => makePrimary(index)} type="button">Set primary</button>}
            <button aria-label={`Remove photo ${index + 1}`} className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm hover:bg-white" onClick={() => removeImage(image, index)} type="button"><X aria-hidden="true" className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>}
    </div>
  )
}
