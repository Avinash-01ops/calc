export default function Card({
  children,
  className = '',
  padding = 'lg',
  shadow = 'lg',
  rounded = 'lg',
  ...props
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  }

  const shadowClasses = {
    none: '',
    xs: 'shadow-xs',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  }

  const roundedClasses = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
  }

  const classes = `card ${paddingClasses[padding]} ${shadowClasses[shadow]} ${roundedClasses[rounded]} ${className}`

  return (
    <div
      className={classes}
      {...props}
    >
      {children}
    </div>
  )
}
