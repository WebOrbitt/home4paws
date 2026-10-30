const statusStyles = {
  Pending: 'bg-amber-100 text-amber-900',
  Submitted: 'bg-amber-100 text-amber-900',
  'Pending Review': 'bg-amber-100 text-amber-900',
  'Under Review': 'bg-blue-100 text-blue-900',
  'Under Adoption': 'bg-blue-100 text-blue-900',
  Approved: 'bg-forest/10 text-forest',
  Verified: 'bg-forest/10 text-forest',
  Active: 'bg-forest/10 text-forest',
  'NGO Assigned': 'bg-violet-100 text-violet-900',
  'Rescue Accepted': 'bg-indigo-100 text-indigo-900',
  Accepted: 'bg-indigo-100 text-indigo-900',
  'Rescue In Progress': 'bg-indigo-100 text-indigo-900',
  Rescued: 'bg-teal-100 text-teal-900',
  'Animal Rescued': 'bg-teal-100 text-teal-900',
  'Pet Profile Created': 'bg-teal-100 text-teal-900',
  Completed: 'bg-teal-100 text-teal-900',
  Rejected: 'bg-red-100 text-red-900',
  Inactive: 'bg-ink/10 text-ink/70',
  Closed: 'bg-ink/10 text-ink/70',
  Available: 'bg-forest/10 text-forest',
  Adopted: 'bg-ink/10 text-ink/70',
}

export default function AdminStatusBadge({ status, label, className = '' }) {
  const text = label || status
  return <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[status] || 'bg-ink/10 text-ink/70'} ${className}`}>{text}</span>
}
