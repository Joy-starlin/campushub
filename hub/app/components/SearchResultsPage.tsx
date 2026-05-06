'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, 
  Calendar, 
  Users, 
  User, 
  MessageSquare, 
  ShoppingBag,
  ArrowLeft,
  Filter
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'event' | 'club' | 'post' | 'person' | 'marketplace'
  title: string
  subtitle: string
  description?: string
  url: string
  image?: string
  metadata?: {
    date?: string
    location?: string
    memberCount?: number
    price?: number
    currency?: string
    author?: string
  }
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'event',
    title: 'React Workshop',
    subtitle: 'Computer Science Club',
    description: 'Learn the fundamentals of React.js including components, state management, and hooks.',
    url: '/events/1',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
    metadata: {
      date: 'March 25, 2024',
      location: 'Tech Building, Room 201'
    }
  },
  {
    id: '2',
    type: 'club',
    title: 'Computer Science Club',
    subtitle: 'Technology • 145 members',
    description: 'Explore the latest in tech, coding workshops, hackathons, and networking with professionals.',
    url: '/clubs/1',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop',
    metadata: {
      memberCount: 145
    }
  },
  {
    id: '3',
    type: 'person',
    title: 'Sarah Johnson',
    subtitle: 'Computer Science • 3rd Year',
    description: 'Passionate about technology and innovation. President of the Computer Science Club.',
    url: '/profile/sarahjohnson',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop'
  },
  {
    id: '4',
    type: 'post',
    title: 'Looking for study partners',
    subtitle: 'Posted by Mike Chen • 2 hours ago',
    description: 'Hey everyone! I\'m looking for study partners for the upcoming algorithms exam. Anyone interested in forming a study group?',
    url: '/feed/1',
    metadata: {
      author: 'Mike Chen',
      date: '2 hours ago'
    }
  },
  {
    id: '5',
    type: 'marketplace',
    title: 'MacBook Pro 2020',
    subtitle: 'Electronics • UGX 1,200,000',
    description: 'Excellent condition MacBook Pro with M1 chip, 16GB RAM, 512GB SSD. Barely used, selling because I got a work laptop.',
    url: '/marketplace/1',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    metadata: {
      price: 1200000,
      currency: 'UGX'
    }
  },
  {
    id: '6',
    type: 'event',
    title: 'Spring Festival 2024',
    subtitle: 'Student Council',
    description: 'Join us for the biggest campus event of the year! Live music, food stalls, games, and more.',
    url: '/events/2',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
    metadata: {
      date: 'March 30, 2024',
      location: 'Main Campus Field'
    }
  }
]

const typeIcons = {
  event: Calendar,
  club: Users,
  person: User,
  post: MessageSquare,
  marketplace: ShoppingBag
}

const typeColors = {
  event: { textColor: 'text-blue-600', bgColor: 'bg-blue-100' },
  club: { textColor: 'text-purple-600', bgColor: 'bg-purple-100' },
  person: { textColor: 'text-green-600', bgColor: 'bg-green-100' },
  post: { textColor: 'text-orange-600', bgColor: 'bg-orange-100' },
  marketplace: { textColor: 'text-red-600', bgColor: 'bg-red-100' }
}

type TabType = 'all' | 'events' | 'clubs' | 'people' | 'posts' | 'marketplace'

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('all')

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
        const response = await fetch(`${baseUrl}/api/v1/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (data.success) {
          setResults(data.data.results)
        } else {
          setError(data.message || 'Failed to fetch results')
        }
      } catch (err) {
        console.error('Search error:', err)
        setError('Connection error. Please check if the backend is running.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query])

  const tabs = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'clubs', label: 'Clubs', icon: Users },
    { id: 'people', label: 'People', icon: User },
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag }
  ]

  // Filter results based on active tab
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return results

    return results.filter(result => {
      if (activeTab === 'events') return result.type === 'event'
      if (activeTab === 'clubs') return result.type === 'club'
      if (activeTab === 'people') return result.type === 'person'
      if (activeTab === 'posts') return result.type === 'post'
      if (activeTab === 'marketplace') return result.type === 'marketplace'
      return true
    })
  }, [results, activeTab])

  const getResultCount = (type: TabType) => {
    if (type === 'all') return results.length
    const typeMap: Record<string, string> = {
      events: 'event',
      clubs: 'club',
      people: 'person',
      posts: 'post',
      marketplace: 'marketplace'
    }
    return results.filter(r => r.type === typeMap[type]).length
  }

  const renderResultCard = (result: SearchResult) => {
    const Icon = typeIcons[result.type]
    const colors = typeColors[result.type]

    switch (result.type) {
      case 'event':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            {result.image && (
              <div className="h-32 bg-gray-200">
                <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-6 h-6 rounded ${colors.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-3 h-3 ${colors.textColor}`} />
                </div>
                <span className={`text-xs font-medium ${colors.textColor}`}>Event</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{result.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{result.subtitle}</p>
              {result.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{result.description}</p>
              )}
              <div className="flex items-center text-xs text-gray-500 space-x-4">
                {result.metadata?.date && <span>📅 {result.metadata.date}</span>}
                {result.metadata?.location && <span>📍 {result.metadata.location}</span>}
              </div>
            </div>
          </div>
        )

      case 'club':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex">
              {result.image && (
                <div className="w-24 h-24 bg-gray-200 shrink-0">
                  <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-6 h-6 rounded ${colors.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-3 h-3 ${colors.textColor}`} />
                  </div>
                  <span className={`text-xs font-medium ${colors.textColor}`}>Club</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{result.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{result.subtitle}</p>
                {result.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{result.description}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'person':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              {result.image ? (
                <img src={result.image} alt={result.title} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-6 h-6 rounded ${colors.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-3 h-3 ${colors.textColor}`} />
                  </div>
                  <span className={`text-xs font-medium ${colors.textColor}`}>Person</span>
                </div>
                <h3 className="font-semibold text-gray-900">{result.title}</h3>
                <p className="text-sm text-gray-600">{result.subtitle}</p>
                {result.description && (
                  <p className="text-sm text-gray-500 line-clamp-1 mt-1">{result.description}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'post':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-6 h-6 rounded ${colors.bgColor} flex items-center justify-center`}>
                <Icon className={`w-3 h-3 ${colors.textColor}`} />
              </div>
              <span className={`text-xs font-medium ${colors.textColor}`}>Post</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{result.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{result.subtitle}</p>
            {result.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{result.description}</p>
            )}
          </div>
        )

      case 'marketplace':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            {result.image && (
              <div className="h-40 bg-gray-200">
                <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded ${colors.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-3 h-3 ${colors.textColor}`} />
                  </div>
                  <span className={`text-xs font-medium ${colors.textColor}`}>Marketplace</span>
                </div>
                {result.metadata?.price && (
                  <span className="text-lg font-bold text-gray-900">
                    {result.metadata.currency} {result.metadata.price.toLocaleString()}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{result.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{result.subtitle}</p>
              {result.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{result.description}</p>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 animate-pulse font-medium">Searching the campus...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Search Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredResults.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Search Results for "{query}"
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => router.push(result.url)}
                >
                  {renderResultCard(result)}
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find anything matching "{query}"
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Try different keywords or check your spelling
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
