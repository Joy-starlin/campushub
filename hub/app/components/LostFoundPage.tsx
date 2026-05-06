'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter } from 'lucide-react'
import LostFoundCard from './LostFoundCard'
import PostLostFoundModal from './PostLostFoundModal'

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

// Mock data
const mockItems: LostFoundItem[] = [
  {
    id: '1',
    type: 'lost',
    itemName: 'Black Leather Wallet',
    description: 'Black leather wallet with multiple card slots. Contains student ID, debit card, and some cash. Last seen near the library.',
    category: 'Wallet',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    location: 'Main Library - 2nd Floor',
    datePosted: new Date(Date.now() - 2 * 60 * 60 * 1000),
    dateOccurred: new Date(Date.now() - 4 * 60 * 60 * 1000),
    contactMethod: 'phone',
    contactInfo: '+256 700 123 456',
    isAnonymous: false,
    postedBy: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop'
    },
    isResolved: false
  },
  {
    id: '2',
    type: 'found',
    itemName: 'iPhone 13 Pro',
    description: 'Found iPhone 13 Pro in Pacific Blue color. Locked screen with battery at 45%. Found near the student cafeteria.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
    location: 'Student Cafeteria',
    datePosted: new Date(Date.now() - 6 * 60 * 60 * 1000),
    dateOccurred: new Date(Date.now() - 8 * 60 * 60 * 1000),
    contactMethod: 'email',
    contactInfo: 'mike.chen@bugema.edu',
    isAnonymous: false,
    postedBy: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    isResolved: false
  },
  {
    id: '3',
    type: 'lost',
    itemName: 'Silver Keychain',
    description: 'Silver keychain with 3 keys and a small carabiner. Keys include dorm room, mailbox, and bike lock.',
    category: 'Keys',
    location: 'Sports Complex',
    datePosted: new Date(Date.now() - 12 * 60 * 60 * 1000),
    dateOccurred: new Date(Date.now() - 24 * 60 * 60 * 1000),
    contactMethod: 'phone',
    contactInfo: '+256 700 789 012',
    isAnonymous: true,
    postedBy: {
      name: 'Anonymous User'
    },
    isResolved: false
  },
  {
    id: '4',
    type: 'found',
    itemName: 'Blue Backpack',
    description: 'Found blue backpack with textbooks inside. Contains calculus textbook and notebook. Left in Lecture Hall B.',
    category: 'Other',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    location: 'Lecture Hall B',
    datePosted: new Date(Date.now() - 18 * 60 * 60 * 1000),
    dateOccurred: new Date(Date.now() - 20 * 60 * 60 * 1000),
    contactMethod: 'email',
    contactInfo: 'emily.davis@bugema.edu',
    isAnonymous: false,
    postedBy: {
      name: 'Emily Davis'
    },
    isResolved: false
  },
  {
    id: '5',
    type: 'lost',
    itemName: 'Student ID Card',
    description: 'Lost student ID card for John Smith. Has photo and student number 2021-CS-0456.',
    category: 'Documents',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    location: 'Campus Bookstore',
    datePosted: new Date(Date.now() - 24 * 60 * 60 * 1000),
    dateOccurred: new Date(Date.now() - 48 * 60 * 60 * 1000),
    contactMethod: 'phone',
    contactInfo: '+256 700 345 678',
    isAnonymous: false,
    postedBy: {
      name: 'Alex Kim',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    isResolved: true
  },
  {
    id: '6',
    type: 'found',
    itemName: 'Red Hoodie',
    description: 'Found red hoodie with university logo. Size Medium. Found near the parking lot after the basketball game.',
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1576871335926-309b5bba4a5c?w=400&h=300&fit=crop',
    location: 'Parking Lot A',
    datePosted: new Date(Date.now() - 36 * 60 * 60 * 1000),
    dateOccurred: new Date(Date.now() - 40 * 60 * 60 * 1000),
    contactMethod: 'email',
    contactInfo: 'jordan.lee@bugema.edu',
    isAnonymous: false,
    postedBy: {
      name: 'Jordan Lee'
    },
    isResolved: false
  }
]

type TabType = 'lost' | 'found'

export default function LostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>(mockItems)
  const [activeTab, setActiveTab] = useState<TabType>('lost')
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Filter items based on tab, search, and category
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Filter by tab
      if (item.type !== activeTab) return false

      // Filter by search
      if (searchQuery && !item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Filter by category
      if (selectedCategory && item.category !== selectedCategory) {
        return false
      }

      return true
    })
  }, [items, activeTab, searchQuery, selectedCategory])

  const handleContact = (item: LostFoundItem) => {
    console.log('Contact:', item)
    // Here you would open a contact modal or navigate to messaging
  }

  const handleResolve = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isResolved: true } : item
    ))
    console.log('Item resolved:', itemId)
    // Here you would send notifications to both parties
  }

  const handlePostItem = async (data: any) => {
    console.log('Posting item:', data)
    // Here you would normally send the data to your API
  }

  const categories = ['All', 'Electronics', 'Clothing', 'Documents', 'Keys', 'Wallet', 'Other']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Lost & Found</h1>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPostModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Post Item</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('lost')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'lost'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Lost Items ({items.filter(item => item.type === 'lost').length})
            </button>
            <button
              onClick={() => setActiveTab('found')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'found'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Found Items ({items.filter(item => item.type === 'found').length})
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab} items...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'All' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <LostFoundCard
              key={item.id}
              item={item}
              onContact={handleContact}
              onResolve={handleResolve}
            />
          ))}
        </div>

        {/* No Items Found */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No {activeTab} items found
            </div>
            <div className="text-gray-400 text-sm mt-2">
              Try adjusting your search or filters
            </div>
          </div>
        )}
      </div>

      {/* Post Item Modal */}
      <PostLostFoundModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handlePostItem}
      />
    </div>
  )
}
