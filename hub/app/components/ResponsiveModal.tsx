'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ResponsiveModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

/**
 * Responsive modal component
 * - Mobile: Full screen (100vw 100vh)
 * - Desktop: Centered popup with proper sizing
 * Mobile-first approach with touch-friendly interactions
 */
export default function ResponsiveModal({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  closeOnBackdropClick = true,
  size = 'md'
}: ResponsiveModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 md:bg-opacity-50 dark:bg-opacity-75"
            onClick={handleBackdropClick}
          />

          {/* Modal Container */}
          <div className="relative h-full w-full md:flex md:items-center md:justify-center md:min-h-screen md:p-4">
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.95,
                y: 20
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95,
                y: 20
              }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300 
              }}
              className={`
                relative w-full h-full md:h-auto md:w-full md:rounded-xl bg-white dark:bg-gray-800 shadow-xl
                ${sizeClasses[size]}
                flex flex-col
                max-h-[100vh] md:max-h-[90vh]
                overflow-hidden
              `}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
                  {title && (
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white pr-4">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain bg-white dark:bg-gray-800">
                <div className="p-4 sm:p-6">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

/**
 * Responsive modal footer with proper button sizing
 */
export function ResponsiveModalFooter({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <div className={`p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 shrink-0 ${className}`}>
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end sm:items-center">
        {children}
      </div>
    </div>
  )
}
