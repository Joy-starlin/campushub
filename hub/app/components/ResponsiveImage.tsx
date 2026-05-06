'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto'
  sizes?: string
  fallback?: string
}

/**
 * Responsive image component using Next.js Image with proper sizing
 * Mobile-first approach with automatic optimization
 */
export default function ResponsiveImage({
  src,
  alt,
  width = 400,
  height = 300,
  priority = false,
  className = '',
  aspectRatio = 'auto',
  sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
  fallback
}: ResponsiveImageProps) {
  const [imageError, setImageError] = useState(false)

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: ''
  }

  const handleImageError = () => {
    setImageError(true)
  }

  if (imageError && fallback) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${aspectRatioClasses[aspectRatio]} ${className}`}>
        <span className="text-gray-500 text-sm">{fallback}</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        onError={handleImageError}
        style={{
          objectFit: 'cover'
        }}
      />
    </div>
  )
}
