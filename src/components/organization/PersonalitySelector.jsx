const traits = ['Friendly', 'Playful', 'Calm', 'Affectionate', 'Energetic', 'Shy', 'Independent', 'Gentle']

export default function PersonalitySelector({ value, onChange }) {
  function toggle(trait) {
    onChange(value.includes(trait) ? value.filter((item) => item !== trait) : [...value, trait])
  }

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">Personality</legend>
      <p className="mt-1 text-xs text-muted">Choose any traits that fit this pet.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {traits.map((trait) => {
          const selected = value.includes(trait)
          return <label className={`cursor-pointer rounded-full border px-3 py-2 text-sm font-medium transition ${selected ? 'border-forest bg-sage text-forest' : 'border-ink/15 bg-white text-muted hover:border-forest/40'}`} key={trait}>
            <input checked={selected} className="sr-only" onChange={() => toggle(trait)} type="checkbox" value={trait} />
            {trait}
          </label>
        })}
      </div>
    </fieldset>
  )
}
