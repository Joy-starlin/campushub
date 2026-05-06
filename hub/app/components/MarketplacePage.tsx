'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, X } from 'lucide-react'
import ListingCard from './ListingCard'
import MarketplaceFilters from './MarketplaceFilters'
import PostListingModal from './PostListingModal'

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

// Mock data
const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Introduction to Computer Science - 9th Edition',
    price: 45000,
    currency: 'UGX',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'],
    seller: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop'
    },
    location: 'Main Campus',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isSold: false,
    isSaved: false
  },
  {
    id: '2',
    title: 'MacBook Pro 2020 - M1 Chip',
    price: 1200000,
    currency: 'UGX',
    condition: 'New',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop'],
    seller: {
      id: '2',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    location: 'Off Campus Housing',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isSold: false,
    isSaved: true
  },
  {
    id: '3',
    title: 'Nike Air Max 270 - Size 10',
    price: 150,
    currency: 'USD',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop'],
    seller: {
      id: '3',
      name: 'Emily Davis'
    },
    location: 'Student Center',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isSold: false,
    isSaved: false
  },
  {
    id: '4',
    title: 'Calculus Textbook - Early Transcendentals',
    price: 35000,
    currency: 'UGX',
    condition: 'Fair',
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop'],
    seller: {
      id: '4',
      name: 'Alex Kim'
    },
    location: 'Library',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isSold: true,
    isSaved: false
  },
  {
    id: '5',
    title: 'Room for Rent - Near Campus',
    price: 300000,
    currency: 'UGX',
    condition: 'New',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'],
    seller: {
      id: '5',
      name: 'Jordan Lee'
    },
    location: 'East Campus Housing',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isSold: false,
    isSaved: true
  },
  {
    id: '6',
    title: 'iPhone 12 - 128GB',
    price: 800,
    currency: 'USD',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'],
    seller: {
      id: '6',
      name: 'Chris Taylor'
    },
    location: 'Main Campus',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isSold: false,
    isSaved: false
  },
  {
    id: '7',
    title: 'Study Notes - Biology 101',
    price: 15000,
    currency: 'UGX',
    condition: 'New',
    images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop'],
    seller: {
      id: '7',
      name: 'Pat Morgan'
    },
    location: 'Science Building',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    isSold: false,
    isSaved: false
  },
  {
    id: '8',
    title: 'Bicycle - Mountain Bike',
    price: 200000,
    currency: 'UGX',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
    seller: {
      id: '8',
      name: 'Taylor Swift'
    },
    location: 'Sports Complex',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    isSold: false,
    isSaved: true
  }
]

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>(mockListings)
  const [currency, setCurrency] = useState<'UGX' | 'USD'>('UGX')
  const [showFilters, setShowFilters] = useState(false)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    let filtered = listings.filter(listing => {
      // Category filter
      if (selectedCategory && !listing.title.toLowerCase().includes(selectedCategory.toLowerCase())) {
        return false
      }

      // Price filter (convert to UGX for comparison)
      const listingPriceUGX = listing.currency === 'USD' 
        ? listing.price * 3800 
        : listing.price
      if (listingPriceUGX < priceRange[0] || listingPriceUGX > priceRange[1]) {
        return false
      }

      // Condition filter
      if (selectedConditions.length > 0 && !selectedConditions.includes(listing.condition)) {
        return false
      }

      return true
    })

    // Sort listings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          const priceA = a.currency === 'USD' ? a.price * 3800 : a.price
          const priceB = b.currency === 'USD' ? b.price * 3800 : b.price
          return priceA - priceB
        case 'price-high':
          const priceA2 = a.currency === 'USD' ? a.price * 3800 : a.price
          const priceB2 = b.currency === 'USD' ? b.price * 3800 : b.price
          return priceB2 - priceA2
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

    return filtered
  }, [listings, selectedCategory, priceRange, selectedConditions, sortBy])

  const handleListingClick = (listing: Listing) => {
    // Navigate to listing detail page
    console.log('Navigate to listing:', listing.id)
  }

  const handleSave = (listingId: string) => {
    console.log('Save listing:', listingId)
  }

  const handlePostListing = async (data: any) => {
    console.log('Posting listing:', data)
    // Here you would normally send the data to your API
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            
            <div className="flex items-center space-x-3">
              {/* Currency Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrency('UGX')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currency === 'UGX' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  UGX
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currency === 'USD' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  USD
                </button>
              </div>

              {/* Post Listing Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPostModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post Listing</span>
              </motion.button>

              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-80 shrink-0">
            <MarketplaceFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              selectedConditions={selectedConditions}
              onConditionsChange={setSelectedConditions}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              currency={currency}
            />
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredAndSortedListings.length} of {listings.length} listings
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAndSortedListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={handleListingClick}
                  onSave={handleSave}
                  currency={currency}
                />
              ))}
            </div>

            {/* No Listings Found */}
            {filteredAndSortedListings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No listings found</div>
                <div className="text-gray-400 text-sm mt-2">Try adjusting your filters</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <MarketplaceFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                selectedConditions={selectedConditions}
                onConditionsChange={setSelectedConditions}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                currency={currency}
              />
            </div>
          </div>
        </div>
      )}

      {/* Post Listing Modal */}
      <PostListingModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handlePostListing}
      />
    </div>
  )
}
