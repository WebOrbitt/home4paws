export default function FeedbackMessage({ children, tone = 'success', role, className = '' }) {
  const styles = tone === 'error'
    ? 'border-red-200 bg-red-50 text-red-900'
    : tone === 'info'
      ? 'border-ink/10 bg-cream text-ink/80'
      : 'border-forest/15 bg-sage/50 text-forest'

  return <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles} ${className}`} role={role || (tone === 'error' ? 'alert' : 'status')}>{children}</p>
}
