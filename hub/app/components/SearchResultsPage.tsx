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
  // Events
  {
    id: 'e1',
    type: 'event',
    title: 'Bugema University Open Day',
    subtitle: 'Academic • Admissions Office',
    description: 'Explore our campus, meet faculty, and discover your future career path at Bugema University.',
    url: '/events',
    image: '/assets/events/event-main.png',
    metadata: { date: 'May 15, 2026', location: 'Main Campus Quad' }
  },
  {
    id: 'e2',
    type: 'event',
    title: 'Cultural Night: Pearl of Africa',
    subtitle: 'Cultural • Cultural Society',
    description: 'Experience the rich heritage of Uganda through traditional music, dance, and authentic cuisine.',
    url: '/events',
    image: '/assets/events/event-1.png',
    metadata: { date: 'May 20, 2026', location: 'Auditorium' }
  },
  {
    id: 'e3',
    type: 'event',
    title: 'Grand Alumni Reunion 2026',
    subtitle: 'Social • Alumni Association',
    description: 'Welcoming back all Bugema graduates for a weekend of networking and celebration.',
    url: '/events',
    image: '/assets/events/event-2.png',
    metadata: { date: 'June 12, 2026', location: 'Main Hall' }
  },
  {
    id: 'e4',
    type: 'event',
    title: 'Tech & Career Expo',
    subtitle: 'Career • Career Services',
    description: 'Connect with top industry leaders and discover the latest trends in technology and innovation.',
    url: '/events',
    image: '/assets/events/event-3.png',
    metadata: { date: 'May 25, 2026', location: 'Convention Center' }
  },
  // Clubs
  {
    id: 'c1',
    type: 'club',
    title: 'Computer Science Club',
    subtitle: 'Technology • 145 members',
    description: 'Explore the latest in tech, coding workshops, hackathons, and networking with industry professionals.',
    url: '/clubs',
    image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400&h=200&fit=crop',
    metadata: { memberCount: 145 }
  },
  {
    id: 'c2',
    type: 'club',
    title: 'Basketball Team',
    subtitle: 'Sports • 24 members',
    description: 'Join our competitive basketball team. Practices, tournaments, and building teamwork skills.',
    url: '/clubs',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=200&fit=crop',
    metadata: { memberCount: 24 }
  },
  {
    id: 'c3',
    type: 'club',
    title: 'Drama Society',
    subtitle: 'Arts • 38 members',
    description: 'Express yourself through theater. Annual productions, improv nights, and acting workshops.',
    url: '/clubs',
    image: 'https://images.unsplash.com/photo-1503095396548-807759245b35?w=400&h=200&fit=crop',
    metadata: { memberCount: 38 }
  },
  // Marketplace
  {
    id: 'm1',
    type: 'marketplace',
    title: 'Computer Science - 9th Edition',
    subtitle: 'Textbooks • UGX 45,000',
    description: 'Introduction to Computer Science textbook in good condition.',
    url: '/marketplace',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    metadata: { price: 45000, currency: 'UGX' }
  },
  {
    id: 'm2',
    type: 'marketplace',
    title: 'MacBook Pro 2020',
    subtitle: 'Electronics • UGX 1,200,000',
    description: 'MacBook Pro 2020 with M1 Chip, excellent condition.',
    url: '/marketplace',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    metadata: { price: 1200000, currency: 'UGX' }
  },
  {
    id: 'm3',
    type: 'marketplace',
    title: 'Nike Air Max 270',
    subtitle: 'Fashion • $150',
    description: 'Nike Air Max 270 shoes, Size 10, good condition.',
    url: '/marketplace',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
    metadata: { price: 150, currency: '$' }
  },
  // People
  {
    id: 'p1',
    type: 'person',
    title: 'Sarah Johnson',
    subtitle: 'CS President • 4th Year',
    description: 'Passionate developer and student leader.',
    url: '/profile',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop'
  },
  {
    id: 'p2',
    type: 'person',
    title: 'Mike Chen',
    subtitle: 'Engineering • 3rd Year',
    description: 'Algorithms enthusiast and coffee lover.',
    url: '/profile',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
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
      setIsLoading(true)
      setError(null)

      try {
        // 1. Client-side search over mock data (Fallback/Simulation)
        const mockResults = mockSearchResults.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) || 
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
        )

        // 2. Try to fetch from API
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
          const response = await fetch(`${baseUrl}/api/v1/search?q=${encodeURIComponent(query)}`)
          
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data.results && data.data.results.length > 0) {
              // Combine results, prioritizing API results but removing duplicates
              const apiResults = data.data.results
              const combined = [...apiResults]
              
              mockResults.forEach(m => {
                if (!combined.some(a => a.title === m.title)) {
                  combined.push(m)
                }
              })
              
              setResults(combined)
            } else {
              setResults(mockResults)
            }
          } else {
            console.warn('API returned error status, falling back to mock results')
            setResults(mockResults)
          }
        } catch (apiErr) {
          console.warn('API connection failed, using mock results:', apiErr)
          setResults(mockResults)
        }
      } catch (err) {
        console.error('Search unexpected error:', err)
        setError('An unexpected error occurred during search.')
      } finally {
        setIsLoading(false)
      }
    }

    if (query) {
      fetchResults()
    } else {
      setResults([])
      setIsLoading(false)
    }
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
