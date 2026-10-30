import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-forest text-white hover:bg-forest-dark focus-visible:ring-forest',
  secondary:
    'border border-ink/15 bg-white/75 text-ink hover:border-forest/35 hover:bg-white focus-visible:ring-forest',
  light:
    'bg-white text-forest hover:bg-sage focus-visible:ring-white',
  text: 'bg-transparent text-forest hover:bg-forest/5 focus-visible:ring-forest',
}

export default function Button({
  children,
  to,
  variant = 'primary',
  className = '',
  ...props
}) {
  const classes = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
