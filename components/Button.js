export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon = null,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-lg'

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }

  const sizeClasses = {
    xs: 'px-3 py-2 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
    xl: 'px-8 py-5 text-lg',
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && (
        <span className="-ml-1 mr-2">...</span>
      )}
      {children}
    </button>
  )
}
