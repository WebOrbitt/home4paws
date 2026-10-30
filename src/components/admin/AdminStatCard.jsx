export default function AdminStatCard({ label, value, detail }) {
  return (
    <article className="rounded-2xl border border-ink/5 bg-white p-4 shadow-card sm:p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </article>
  )
}
