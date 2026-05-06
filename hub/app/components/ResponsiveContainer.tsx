'use client'

import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

/**
 * Responsive container that provides consistent max-widths and centering
 * Mobile-first approach with proper breakpoints:
 * - Base: 100% width (mobile)
 * - sm (640px): 100% width
 * - md (768px): 100% width  
 * - lg (1024px): max-width container
 * - xl (1280px): max-width container with extra whitespace
 */
export default function ResponsiveContainer({ 
  children, 
  className = '', 
  maxWidth = 'xl' 
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: '',
    md: '',
    lg: 'lg:max-w-6xl',
    xl: 'xl:max-w-7xl',
    '2xl': 'xl:max-w-7xl 2xl:max-w-screen-2xl',
    full: ''
  }

  return (
    <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}
