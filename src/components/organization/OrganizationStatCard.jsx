export default function OrganizationStatCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-ink/5 bg-white p-4 shadow-card sm:p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{value}</p>
    </article>
  )
}
