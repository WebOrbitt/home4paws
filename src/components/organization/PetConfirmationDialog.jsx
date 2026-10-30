import { useEffect } from 'react'
import Button from '../Button.jsx'

export default function PetConfirmationDialog({ title, description, children, confirmLabel = 'Confirm', confirmDisabled = false, onClose, onConfirm }) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section aria-labelledby="pet-confirm-title" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft sm:p-7" role="dialog">
        <h2 className="text-xl font-semibold tracking-tight text-ink" id="pet-confirm-title">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-muted">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onClose} type="button" variant="secondary">Cancel</Button>
          <Button disabled={confirmDisabled} onClick={onConfirm} type="button">{confirmLabel}</Button>
        </div>
      </section>
    </div>
  )
}
