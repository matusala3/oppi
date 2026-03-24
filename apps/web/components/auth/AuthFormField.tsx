'use client'

import { Eye, EyeOff } from 'lucide-react'
import styles from './AuthFormField.module.css'

interface AuthFormFieldProps {
  id: string
  label: string
  type: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  autoComplete?: string
  /** Rendered flush-right of the label — e.g. "Forgot password?" */
  labelAddon?: React.ReactNode
  /** Only relevant when type === 'password' */
  showPassword?: boolean
  onTogglePassword?: () => void
}

export function AuthFormField({
  id,
  label,
  type,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  labelAddon,
  showPassword,
  onTogglePassword,
}: AuthFormFieldProps) {
  const resolvedType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {labelAddon}
      </div>
      <div className={`${styles.inputWrap} ${error ? styles.inputWrapError : ''}`}>
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={styles.input}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? true : undefined}
        />
        {type === 'password' && onTogglePassword && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword
              ? <EyeOff size={18} aria-hidden="true" />
              : <Eye size={18} aria-hidden="true" />
            }
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
