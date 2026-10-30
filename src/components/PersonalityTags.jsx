export default function PersonalityTags({ traits = [], className = '' }) {
  return (
    <ul aria-label="Personality" className={`flex flex-wrap gap-2 ${className}`}>
      {traits.map((trait) => (
        <li
          className="rounded-full bg-sage px-3 py-1 text-xs font-medium text-forest"
          key={trait}
        >
          {trait}
        </li>
      ))}
    </ul>
  )
}
