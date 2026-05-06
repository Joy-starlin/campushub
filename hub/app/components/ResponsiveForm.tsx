'use client'

import { ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface ResponsiveFormProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Responsive form wrapper
 * - Mobile: Full width inputs
 * - Desktop: Max-width 480px centered
 * Mobile-first approach with proper touch targets
 */
export default function ResponsiveForm({ 
  children, 
  className = '', 
  maxWidth = 'md' 
}: ResponsiveFormProps) {
  const maxWidthClasses = {
    sm: 'md:max-w-sm',
    md: 'md:max-w-md',
    lg: 'md:max-w-lg',
    xl: 'md:max-w-xl'
  }

  return (
    <form className={`w-full ${maxWidthClasses[maxWidth]} md:mx-auto ${className}`}>
      {children}
    </form>
  )
}

/**
 * Responsive form input with proper sizing and touch targets
 */
interface ResponsiveInputProps {
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  autoComplete?: string
}

export function ResponsiveInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  autoComplete
}: ResponsiveInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, '-')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="space-y-2">
      <label 
        htmlFor={inputId}
        className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className={`
            w-full px-3 sm:px-4 py-3 sm:py-4
            text-base sm:text-base
            border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:text-gray-500
            placeholder-gray-400
            min-h-[44px]
            ${error ? 'border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400' : ''}
            ${className}
          `}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 min-w-11 min-h-11 flex items-center justify-center"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-sm sm:text-base text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Responsive textarea with proper sizing
 */
interface ResponsiveTextareaProps {
  label: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  className?: string
  id?: string
  name?: string
}

export function ResponsiveTextarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  id,
  name
}: ResponsiveTextareaProps) {
  const textareaId = id || name || label.toLowerCase().replace(/\s+/g, '-')

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className="space-y-2">
      <label 
        htmlFor={textareaId}
        className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`
          w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 min-h-11
          resize-none
          ${error ? 'border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400' : ''}
          ${className}
        `}
      />
      
      {error && (
        <p className="text-sm sm:text-base text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Responsive select dropdown
 */
interface ResponsiveSelectProps {
  label: string
  options: { value: string; label: string }[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  placeholder?: string
}

export function ResponsiveSelect({
  label,
  options,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  placeholder
}: ResponsiveSelectProps) {
  const selectId = id || name || label.toLowerCase().replace(/\s+/g, '-')

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className="space-y-2">
      <label 
        htmlFor={selectId}
        className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        required={required}
        className={`
          w-full px-3 sm:px-4 py-3 sm:py-4
          text-base sm:text-base
          border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:text-gray-500
          bg-white
          min-h-[44px]
          ${error ? 'border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400' : ''}
          ${className}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm sm:text-base text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Responsive button with proper touch targets
 */
interface ResponsiveButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
  fullWidth?: boolean
}

export function ResponsiveButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  fullWidth = false
}: ResponsiveButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus:ring-blue-400 dark:disabled:bg-gray-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus:ring-gray-400 dark:disabled:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-300 dark:bg-red-600 dark:hover:bg-red-500 dark:focus:ring-red-400 dark:disabled:bg-gray-600',
    ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 disabled:text-gray-400 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:focus:ring-gray-400 dark:disabled:text-gray-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}
