'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { MapPin, Clock, MessageCircle, Camera, Check } from 'lucide-react'

interface LostFoundItem {
  id: string
  type: 'lost' | 'found'
  itemName: string
  description: string
  category: 'Electronics' | 'Clothing' | 'Documents' | 'Keys' | 'Wallet' | 'Other'
  image?: string
  location: string
  datePosted: Date
  dateOccurred: Date
  contactMethod: 'email' | 'phone'
  contactInfo: string
  isAnonymous: boolean
  postedBy: {
    name: string
    avatar?: string
  }
  isResolved: boolean
}

interface LostFoundCardProps {
  item: LostFoundItem
  onContact: (item: LostFoundItem) => void
  onResolve: (itemId: string) => void
}

const categoryColors = {
  Electronics: 'bg-blue-100 text-blue-800',
  Clothing: 'bg-purple-100 text-purple-800',
  Documents: 'bg-yellow-100 text-yellow-800',
  Keys: 'bg-orange-100 text-orange-800',
  Wallet: 'bg-green-100 text-green-800',
  Other: 'bg-gray-100 text-gray-800'
}

export default function LostFoundCard({ item, onContact, onResolve }: LostFoundCardProps) {
  const [isResolved, setIsResolved] = useState(item.isResolved)

  const handleResolve = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResolved(true)
    onResolve(item.id)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 relative"
    >
      {/* Resolved Overlay */}
      {isResolved && (
        <div className="absolute inset-0 bg-green-600 bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center">
            <Check className="w-16 h-16 text-white mx-auto mb-2" />
            <div className="text-white text-xl font-bold">Returned ✓</div>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
          item.type === 'lost' 
            ? 'bg-red-600 text-white' 
            : 'bg-green-600 text-white'
        }`}>
          {item.type === 'lost' ? 'LOST' : 'FOUND'}
        </span>
      </div>

      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {item.image ? (
          <img
            src={item.image}
            alt={item.itemName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <Camera className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Item Name and Category */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {item.itemName}
          </h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${categoryColors[item.category]}`}>
            {item.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="truncate">
            {item.type === 'lost' ? 'Last seen:' : 'Found at:'} {item.location}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="w-4 h-4 mr-2" />
          <span>
            {item.type === 'lost' ? 'Lost' : 'Found'} {formatDistanceToNow(item.dateOccurred, { addSuffix: true })}
          </span>
        </div>

        {/* Posted By */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {item.isAnonymous ? (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
                ?
              </div>
            ) : (
              <>
                {item.postedBy.avatar ? (
                  <img
                    src={item.postedBy.avatar}
                    alt={item.postedBy.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
                    {getInitials(item.postedBy.name)}
                  </div>
                )}
                <span className="text-sm text-gray-700">
                  {item.isAnonymous ? 'Anonymous' : item.postedBy.name}
                </span>
              </>
            )}
          </div>
          <span className="text-xs text-gray-500">
            Posted {formatDistanceToNow(item.datePosted, { addSuffix: true })}
          </span>
        </div>

        {/* Contact Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onContact(item)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            item.type === 'lost'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <div className="flex items-center justify-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact {item.type === 'lost' ? 'Finder' : 'Owner'}
          </div>
        </motion.button>

        {/* Resolve Button (for item owner) */}
        {!isResolved && (
          <button
            onClick={handleResolve}
            className="w-full mt-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Mark as Returned
          </button>
        )}
      </div>
    </motion.div>
  )
}
