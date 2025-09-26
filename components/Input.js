export default function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  size = 'md',
  leftIcon = null,
  rightIcon = null,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base',
  }

  const iconClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className={iconClasses[size]}>{leftIcon}</span>
          </div>
        )}
        <input
          id={inputId}
          className={`input-field ${sizeClasses[size]} ${
            leftIcon ? 'pl-12' : ''
          } ${
            rightIcon ? 'pr-12' : ''
          } ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
          }`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className={iconClasses[size]}>{rightIcon}</span>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
}
