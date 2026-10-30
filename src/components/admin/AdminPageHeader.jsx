export default function AdminPageHeader({ title, subtitle, action }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
