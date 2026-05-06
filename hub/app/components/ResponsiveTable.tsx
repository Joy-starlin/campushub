'use client'

import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface ResponsiveTableProps {
  children: ReactNode
  className?: string
  showScrollButtons?: boolean
}

/**
 * Responsive table wrapper with horizontal scroll on mobile
 * Mobile-first approach with touch-friendly scroll indicators
 */
export default function ResponsiveTable({ 
  children, 
  className = '',
  showScrollButtons = true 
}: ResponsiveTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    )
  }

  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: -200, behavior: 'smooth' })
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: 200, behavior: 'smooth' })
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', checkScroll)
    checkScroll()

    return () => {
      container.removeEventListener('scroll', checkScroll)
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Table Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>

      {/* Scroll Buttons - Desktop only */}
      {showScrollButtons && (
        <>
          {/* Left scroll button */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 hidden md:block hover:bg-gray-100 transition-colors z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Right scroll button */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 hidden md:block hover:bg-gray-100 transition-colors z-10"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Mobile scroll indicator */}
          <div className="md:hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: scrollContainerRef.current 
                    ? `${(scrollContainerRef.current.scrollLeft / (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth)) * 100}%`
                    : '0%'
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Responsive table cell that adapts to screen size
 */
export function ResponsiveTableCell({ 
  children, 
  className = '',
  hideOnMobile = false 
}: { 
  children: ReactNode
  className?: string
  hideOnMobile?: boolean 
}) {
  return (
    <td className={`px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base ${hideOnMobile ? 'hidden md:table-cell' : ''} ${className}`}>
      {children}
    </td>
  )
}

/**
 * Responsive table header that adapts to screen size
 */
export function ResponsiveTableHeader({ 
  children, 
  className = '',
  hideOnMobile = false 
}: { 
  children: ReactNode
  className?: string
  hideOnMobile?: boolean 
}) {
  return (
    <th className={`px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider text-left ${hideOnMobile ? 'hidden md:table-cell' : ''} ${className}`}>
      {children}
    </th>
  )
}
