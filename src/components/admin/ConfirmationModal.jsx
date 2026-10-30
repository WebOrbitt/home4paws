import { useEffect, useState } from 'react'
import Button from '../Button.jsx'

export default function ConfirmationModal({ title, description, onClose, onConfirm, confirmLabel = 'Confirm', children }) {
  const [error, setError] = useState('')

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  function confirm(event) {
    event.preventDefault()
    const reason = event.currentTarget.querySelector('textarea')?.value?.trim()
    if (!reason) {
      setError('Enter a rejection reason.')
      event.currentTarget.querySelector('textarea')?.focus()
      return
    }
    onConfirm(reason)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section aria-labelledby="confirmation-title" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-soft sm:p-7" role="dialog">
        <h2 className="text-xl font-semibold tracking-tight text-ink" id="confirmation-title">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-muted">{description}</p>}
        <form className="mt-5" noValidate onSubmit={confirm}>
          {children({ error, setError })}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={onClose} type="button" variant="secondary">Cancel</Button>
            <Button type="submit">{confirmLabel}</Button>
          </div>
        </form>
      </section>
    </div>
  )
}
