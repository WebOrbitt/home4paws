import { ChevronDown, RotateCcw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

const filterFields = [
  {
    key: 'species',
    label: 'Animal type',
    options: [
      ['all', 'All'],
      ['Dog', 'Dogs'],
      ['Cat', 'Cats'],
      ['Bird', 'Birds'],
      ['Rabbit', 'Rabbits'],
      ['Other', 'Other'],
    ],
  },
  {
    key: 'ageGroup',
    label: 'Age',
    options: [
      ['all', 'All ages'],
      ['puppy-kitten', 'Puppy / Kitten'],
      ['young', 'Young'],
      ['adult', 'Adult'],
      ['senior', 'Senior'],
    ],
  },
  {
    key: 'gender',
    label: 'Gender',
    options: [
      ['all', 'All'],
      ['Male', 'Male'],
      ['Female', 'Female'],
      ['Unknown', 'Unknown'],
    ],
  },
  {
    key: 'location',
    label: 'Location',
    options: [
      ['all', 'All locations'],
      ['Mumbai', 'Mumbai'],
      ['Thane', 'Thane'],
      ['Navi Mumbai', 'Navi Mumbai'],
      ['Pune', 'Pune'],
    ],
  },
  {
    key: 'status',
    label: 'Adoption status',
    options: [
      ['all', 'All statuses'],
      ['available', 'Available'],
      ['under-adoption', 'Under Adoption'],
      ['adopted', 'Adopted'],
    ],
  },
]

function SelectField({ field, value, onChange }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold text-ink/75">{field.label}</span>
      <select
        className="h-11 w-full rounded-xl border border-ink/10 bg-white px-3 text-sm text-ink outline-none transition focus:border-forest/50 focus:ring-2 focus:ring-forest/10"
        onChange={(event) => onChange(field.key, event.target.value)}
        value={value}
      >
        {field.options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function PetFilters({ filters, onChange, onClear }) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 768px)')
    const updateForViewport = (event) => setFiltersOpen(event.matches)
    updateForViewport(desktopQuery)
    desktopQuery.addEventListener('change', updateForViewport)
    return () => desktopQuery.removeEventListener('change', updateForViewport)
  }, [])

  return (
    <section
      aria-label="Search and filter pets"
      className="rounded-2xl border border-ink/10 bg-cream p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Search &amp; filters</h2>
        <div className="flex items-center gap-1">
          <button
            aria-controls="more-pet-filters"
            aria-expanded={filtersOpen}
            className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-semibold text-forest transition hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest md:hidden"
            onClick={() => setFiltersOpen((open) => !open)}
            type="button"
          >
            Filters <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>
          <button
            className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-forest transition hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            onClick={onClear}
            type="button"
          >
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
            Clear filters
          </button>
        </div>
      </div>
      <label className="mt-3 block min-w-0">
          <span className="mb-2 block text-xs font-semibold text-ink/75">Search pets</span>
          <span className="relative block">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-ink/10 bg-white pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-muted/75 focus:border-forest/50 focus:ring-2 focus:ring-forest/10"
              onChange={(event) => onChange('search', event.target.value)}
              placeholder="Pet name or breed"
              type="search"
              value={filters.search}
            />
          </span>
      </label>
      <div
        className={`${filtersOpen ? 'grid' : 'hidden'} mt-3 grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid lg:grid-cols-3`}
        id="more-pet-filters"
      >
        {filterFields.map((field) => (
          <SelectField field={field} key={field.key} onChange={onChange} value={filters[field.key]} />
        ))}
      </div>
    </section>
  )
}
