'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { 
  Heart, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Star, 
  Shield, 
  Send,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Listing {
  id: string
  title: string
  price: number
  currency: 'UGX' | 'USD'
  condition: 'New' | 'Good' | 'Fair'
  images: string[]
  description: string
  seller: {
    id: string
    name: string
    avatar?: string
    rating: number
    joinDate: Date
    totalSales: number
  }
  location: string
  createdAt: Date
  isSold: boolean
  isSaved: boolean
}

interface ListingDetailPageProps {
  listing: Listing
  onSave: (listingId: string) => void
  onMessageSeller: (sellerId: string) => void
  onMakeOffer: (listingId: string, offerAmount: number) => void
  currency: 'UGX' | 'USD'
  exchangeRate?: number
}

const conditionColors = {
  New: 'bg-green-100 text-green-800',
  Good: 'bg-blue-100 text-blue-800',
  Fair: 'bg-yellow-100 text-yellow-800'
}

export default function ListingDetailPage({ 
  listing, 
  onSave, 
  onMessageSeller, 
  onMakeOffer,
  currency,
  exchangeRate = 3800 
}: ListingDetailPageProps) {
  const [isSaved, setIsSaved] = useState(listing.isSaved)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave(listing.id)
  }

  const handleMessageSeller = () => {
    onMessageSeller(listing.seller.id)
  }

  const handleMakeOffer = () => {
    setShowOfferModal(true)
  }

  const submitOffer = () => {
    const amount = parseFloat(offerAmount)
    if (amount && amount > 0) {
      onMakeOffer(listing.id, amount)
      setShowOfferModal(false)
      setOfferAmount('')
    }
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
  }

  const relatedListings = [
    { id: '1', title: 'Related Item 1', price: 50000, currency: 'UGX' as const, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop' },
    { id: '2', title: 'Related Item 2', price: 75000, currency: 'UGX' as const, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop' },
    { id: '3', title: 'Related Item 3', price: 120, currency: 'USD' as const, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop' },
    { id: '4', title: 'Related Item 4', price: 80000, currency: 'UGX' as const, image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                {/* Main Image */}
                <div className="aspect-square bg-gray-200">
                  {listing.images.length > 0 ? (
                    <img
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full shadow-lg hover:bg-opacity-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full shadow-lg hover:bg-opacity-100 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                {listing.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {listing.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>

                {/* Sold Badge */}
                {listing.isSold && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    SOLD
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {listing.images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${listing.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(listing.price, listing.currency)}
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${conditionColors[listing.condition]}`}>
                      {listing.condition}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>

              {/* Location and Time */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Posted {formatDistanceToNow(listing.createdAt, { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Safety Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Meet in a public place</li>
                    <li>• Never pay before seeing the item</li>
                    <li>• Check the item carefully before buying</li>
                    <li>• Use the in-app chat for communication</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Profile */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
              <div className="flex items-center space-x-3 mb-4">
                {listing.seller.avatar ? (
                  <img
                    src={listing.seller.avatar}
                    alt={listing.seller.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                    {getInitials(listing.seller.name)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{listing.seller.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1">{listing.seller.rating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span>{listing.seller.totalSales} sales</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Member since {formatDistanceToNow(listing.seller.joinDate, { addSuffix: true })}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleMessageSeller}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Message Seller</span>
              </button>
              
              {!listing.isSold && (
                <button
                  onClick={handleMakeOffer}
                  className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Make Offer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related Listings */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Related Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedListings.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">{item.title}</h4>
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(item.price, item.currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      <AnimatePresence>
        {showOfferModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setShowOfferModal(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-xl shadow-xl max-w-md w-full"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">Make an Offer</h3>
                  <button
                    onClick={() => setShowOfferModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Offer ({currency})
                    </label>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder={currency === 'UGX' ? '50000' : '50'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-6">
                    Current price: {formatPrice(listing.price, listing.currency)}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowOfferModal(false)}
                      className="flex-1 py-2 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitOffer}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send Offer
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
