'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface StarRatingProps {
  rating: number
  setRating: (rating: number) => void
  max?: number
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
}

export default function StarRating({ 
  rating, 
  setRating, 
  max = 5, 
  size = 'md',
  readOnly = false 
}: StarRatingProps) {
  const [hover, setHover] = useState(0)

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex items-center space-x-1">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1
        const active = starValue <= (hover || rating)
        
        return (
          <motion.button
            key={starValue}
            type="button"
            whileHover={!readOnly ? { scale: 1.1 } : {}}
            whileTap={!readOnly ? { scale: 0.9 } : {}}
            onMouseEnter={() => !readOnly && setHover(starValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && setRating(starValue)}
            className={`transition-colors duration-200 focus:outline-none ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            disabled={readOnly}
          >
            <Star
              className={`${sizeClasses[size]} ${
                active 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-transparent text-gray-300 dark:text-gray-600'
              }`}
            />
          </motion.button>
        )
      })}
    </div>
  )
}
