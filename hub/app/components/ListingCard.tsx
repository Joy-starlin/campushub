'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MapPin, Clock } from 'lucide-react'

interface Listing {
  id: string
  title: string
  price: number
  currency: 'UGX' | 'USD'
  condition: 'New' | 'Good' | 'Fair'
  images: string[]
  seller: {
    id: string
    name: string
    avatar?: string
  }
  location: string
  createdAt: Date
  isSold: boolean
  isSaved: boolean
}

interface ListingCardProps {
  listing: Listing
  onClick: (listing: Listing) => void
  onSave: (listingId: string) => void
  currency: 'UGX' | 'USD'
  exchangeRate?: number
}

const conditionColors = {
  New: 'bg-green-100 text-green-800',
  Good: 'bg-blue-100 text-blue-800',
  Fair: 'bg-yellow-100 text-yellow-800'
}

export default function ListingCard({ 
  listing, 
  onClick, 
  onSave, 
  currency,
  exchangeRate = 3800 
}: ListingCardProps) {
  const [isSaved, setIsSaved] = useState(listing.isSaved)

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsSaved(!isSaved)
    onSave(listing.id)
  }

  const formatPrice = (price: number, fromCurrency: 'UGX' | 'USD') => {
    if (fromCurrency === currency) {
      return currency === 'UGX' 
        ? `UGX ${price.toLocaleString()}`
        : `$${price.toFixed(2)}`
    }
    
    // Convert currency
    const convertedPrice = fromCurrency === 'UGX' 
      ? price / exchangeRate 
      : price * exchangeRate
    
    return currency === 'UGX'
      ? `UGX ${Math.round(convertedPrice).toLocaleString()}`
      : `$${convertedPrice.toFixed(2)}`
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 relative"
      onClick={() => onClick(listing)}
    >
      {/* Sold Badge */}
      {listing.isSold && (
        <div className="absolute top-3 left-3 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          SOLD
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
      >
        <Heart 
          className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
        />
      </button>

      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {listing.title}
        </h3>

        {/* Price and Condition */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-gray-900">
            {formatPrice(listing.price, listing.currency)}
          </div>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${conditionColors[listing.condition]}`}>
            {listing.condition}
          </span>
        </div>

        {/* Seller Info */}
        <div className="flex items-center space-x-2 mb-3">
          {listing.seller.avatar ? (
            <img
              src={listing.seller.avatar}
              alt={listing.seller.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
              {getInitials(listing.seller.name)}
            </div>
          )}
          <span className="text-sm text-gray-700">{listing.seller.name}</span>
        </div>

        {/* Location and Time */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{formatDistanceToNow(listing.createdAt, { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
