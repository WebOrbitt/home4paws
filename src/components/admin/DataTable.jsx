export default function DataTable({ columns, rows, rowKey = 'id', emptyMessage = 'No matching records found.' }) {
  return (
    <div className="overflow-x-auto overscroll-x-contain rounded-2xl border border-ink/10 bg-white">
      <table className="min-w-[700px] w-full border-collapse text-left text-sm">
        <thead className="bg-cream text-xs uppercase tracking-wide text-muted">
          <tr>{columns.map((column) => <th className="whitespace-nowrap px-4 py-3 font-semibold" key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {rows.length ? rows.map((row) => (
            <tr className="align-middle" key={row[rowKey]}>
              {columns.map((column) => <td className="px-4 py-3.5 text-ink/85" key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          )) : (
            <tr><td className="px-4 py-9 text-center text-sm text-muted" colSpan={columns.length}>{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
