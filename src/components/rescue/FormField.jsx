export const fieldControlClass =
  'min-h-12 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-forest focus:ring-2 focus:ring-forest/15 disabled:cursor-not-allowed disabled:bg-cream'

export default function FormField({ label, htmlFor, required = false, error, hint, children, className = '' }) {
  const descriptionId = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-ink" htmlFor={htmlFor}>
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-coral">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children(descriptionId)}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-700" id={`${htmlFor}-error`} role="alert">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted" id={`${htmlFor}-hint`}>{hint}</p>
      ) : null}
    </div>
  )
}
