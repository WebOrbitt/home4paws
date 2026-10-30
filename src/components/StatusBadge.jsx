export default function StatusBadge({ status, className = '' }) {
  const adopted = status === 'adopted' || status === 'Adopted'
  const underAdoption = status === 'under-adoption' || status === 'Under Adoption'
  const label = adopted ? 'Adopted' : underAdoption ? 'Currently Under Adoption' : 'Available'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${adopted ? 'bg-ink/10 text-ink/70' : underAdoption ? 'bg-blue-100 text-blue-900' : 'bg-forest/10 text-forest'} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${adopted ? 'bg-ink/40' : underAdoption ? 'bg-blue-700' : 'bg-forest'}`}
      />
      {label}
    </span>
  )
}
