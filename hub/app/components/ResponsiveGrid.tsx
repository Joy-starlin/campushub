'use client'

import { ReactNode } from 'react'

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

/**
 * Responsive grid component with mobile-first approach
 * Breakpoints:
 * - Base (375px+): 1 column
 * - sm (640px+): 2 columns
 * - md (768px+): 2-3 columns
 * - lg (1024px+): 3-4 columns
 * - xl (1280px+): 4+ columns
 */
export default function ResponsiveGrid({
  children,
  className = '',
  cols = { base: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  gap = { base: 4, sm: 6, md: 6, lg: 8, xl: 8 }
}: ResponsiveGridProps) {
  const gridColsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  const gapClasses = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    7: 'gap-7',
    8: 'gap-8'
  }

  const buildGridClasses = () => {
    const classes = ['grid']
    
    // Base columns
    if (cols.base) {
      classes.push(gridColsClasses[cols.base as keyof typeof gridColsClasses])
    }
    
    // sm breakpoint
    if (cols.sm) {
      classes.push(`sm:${gridColsClasses[cols.sm as keyof typeof gridColsClasses]}`)
    }
    
    // md breakpoint
    if (cols.md) {
      classes.push(`md:${gridColsClasses[cols.md as keyof typeof gridColsClasses]}`)
    }
    
    // lg breakpoint
    if (cols.lg) {
      classes.push(`lg:${gridColsClasses[cols.lg as keyof typeof gridColsClasses]}`)
    }
    
    // xl breakpoint
    if (cols.xl) {
      classes.push(`xl:${gridColsClasses[cols.xl as keyof typeof gridColsClasses]}`)
    }
    
    return classes.join(' ')
  }

  const buildGapClasses = () => {
    const classes = []
    
    // Base gap
    if (gap.base) {
      classes.push(gapClasses[gap.base as keyof typeof gapClasses])
    }
    
    // sm breakpoint
    if (gap.sm) {
      classes.push(`sm:${gapClasses[gap.sm as keyof typeof gapClasses]}`)
    }
    
    // md breakpoint
    if (gap.md) {
      classes.push(`md:${gapClasses[gap.md as keyof typeof gapClasses]}`)
    }
    
    // lg breakpoint
    if (gap.lg) {
      classes.push(`lg:${gapClasses[gap.lg as keyof typeof gapClasses]}`)
    }
    
    // xl breakpoint
    if (gap.xl) {
      classes.push(`xl:${gapClasses[gap.xl as keyof typeof gapClasses]}`)
    }
    
    return classes.join(' ')
  }

  return (
    <div className={`${buildGridClasses()} ${buildGapClasses()} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Responsive grid item with proper sizing
 */
export function ResponsiveGridItem({ 
  children, 
  className = '',
  span = { base: 1, sm: 1, md: 1, lg: 1, xl: 1 }
}: { 
  children: ReactNode
  className?: string
  span?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}) {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    'full': 'col-span-full'
  }

  const buildSpanClasses = () => {
    const classes = []
    
    // Base span
    if (span.base) {
      classes.push(spanClasses[span.base as keyof typeof spanClasses])
    }
    
    // sm breakpoint
    if (span.sm) {
      classes.push(`sm:${spanClasses[span.sm as keyof typeof spanClasses]}`)
    }
    
    // md breakpoint
    if (span.md) {
      classes.push(`md:${spanClasses[span.md as keyof typeof spanClasses]}`)
    }
    
    // lg breakpoint
    if (span.lg) {
      classes.push(`lg:${spanClasses[span.lg as keyof typeof spanClasses]}`)
    }
    
    // xl breakpoint
    if (span.xl) {
      classes.push(`xl:${spanClasses[span.xl as keyof typeof spanClasses]}`)
    }
    
    return classes.join(' ')
  }

  return (
    <div className={`${buildSpanClasses()} ${className}`}>
      {children}
    </div>
  )
}
