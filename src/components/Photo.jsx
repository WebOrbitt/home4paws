import { useState } from 'react'
import { PawPrint } from 'lucide-react'

export default function Photo({ src, alt, className = '', fallbackClassName = '' }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={`flex items-center justify-center bg-sage text-forest/55 ${fallbackClassName || className}`}
      >
        <PawPrint aria-hidden="true" className="h-10 w-10" strokeWidth={1.4} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
