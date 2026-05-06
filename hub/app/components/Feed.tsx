'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'
import FilterBar from './FilterBar'
import RightSidebar from './RightSidebar'

interface Post {
  id: string
  author: {
    name: string
    role: string
    avatar?: string
  }
  category: 'Event' | 'News' | 'Club' | 'Market' | 'Job' | 'Lost&Found'
  title: string
  description: string
  image?: string
  createdAt: Date
  likes: number
  comments: number
  isLiked: boolean
  isBookmarked: boolean
}

interface CreatePostData {
  title: string
  category: 'Event' | 'News' | 'Club' | 'Market' | 'Job' | 'Lost&Found'
  description: string
  image?: File
}

// Mock data
const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Sarah Johnson',
      role: 'Student Council President',
      avatar: undefined
    },
    category: 'Event',
    title: 'Spring Festival 2024 - Join Us!',
    description: 'Get ready for the biggest event of the year! The Spring Festival will feature live music, food trucks, games, and amazing prizes. Don\'t miss out on this incredible celebration of our campus community.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 45,
    comments: 12,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '2',
    author: {
      name: 'Dr. Michael Chen',
      role: 'Computer Science Professor',
      avatar: undefined
    },
    category: 'News',
    title: 'New AI Research Lab Opening',
    description: 'Exciting news! Our department is launching a state-of-the-art AI research lab equipped with the latest technology. Students interested in machine learning and artificial intelligence are encouraged to apply for research positions.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    likes: 32,
    comments: 8,
    isLiked: true,
    isBookmarked: false
  },
  {
    id: '3',
    author: {
      name: 'Emily Rodriguez',
      role: 'Photography Club',
      avatar: undefined
    },
    category: 'Club',
    title: 'Photography Club Weekly Meeting',
    description: 'Join us this Thursday for our weekly photography club meeting. We\'ll be discussing composition techniques and planning our next campus photo walk. All skill levels welcome!',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    likes: 18,
    comments: 5,
    isLiked: false,
    isBookmarked: true
  }
]

const trendingTopics = [
  'Spring Festival',
  'AI Research Lab',
  'Campus Photography',
  'Student Elections',
  'Basketball Tournament'
]

const upcomingEvents = [
  {
    id: '1',
    title: 'Spring Festival 2024',
    date: 'March 15, 2024'
  },
  {
    id: '2',
    title: 'Career Fair',
    date: 'March 20, 2024'
  },
  {
    id: '3',
    title: 'Alumni Networking',
    date: 'March 25, 2024'
  }
]

const suggestedClubs = [
  {
    id: '1',
    name: 'Photography Club',
    members: 45
  },
  {
    id: '2',
    name: 'Debate Society',
    members: 32
  },
  {
    id: '3',
    name: 'Entrepreneurship Club',
    members: 28
  }
]

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(mockPosts)
  const [activeCategory, setActiveCategory] = useState('All')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const observer = useRef<IntersectionObserver | null>(null)
  const lastPostRef = useRef<HTMLDivElement>(null)

  // Filter posts based on category
  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredPosts(posts)
    } else {
      const categoryMap: { [key: string]: Post['category'] } = {
        'Events': 'Event',
        'News': 'News',
        'Clubs': 'Club',
        'Market': 'Market',
        'Jobs': 'Job'
      }
      const filtered = posts.filter(post => post.category === categoryMap[activeCategory])
      setFilteredPosts(filtered)
    }
  }, [activeCategory, posts])

  // Infinite scroll
  const loadMorePosts = useCallback(async () => {
    if (loading) return
    
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const newPosts: Post[] = Array.from({ length: 10 }, (_, i) => ({
        id: `post-${posts.length + i + 1}`,
        author: {
          name: `User ${posts.length + i + 1}`,
          role: 'Student',
          avatar: undefined
        },
        category: ['Event', 'News', 'Club', 'Market', 'Job', 'Lost&Found'][Math.floor(Math.random() * 6)] as Post['category'],
        title: `New Post ${posts.length + i + 1}`,
        description: 'This is a sample post description for the infinite scroll functionality. It demonstrates how new posts are loaded when you reach the bottom of the feed.',
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 50),
        isLiked: false,
        isBookmarked: false
      }))
      
      setPosts(prev => [...prev, ...newPosts])
      setLoading(false)
      setHasMore(newPosts.length > 0)
    }, 1000)
  }, [loading, posts.length])

  // Setup intersection observer
  useEffect(() => {
    if (loading) return
    
    const currentObserver = observer.current
    if (currentObserver) currentObserver.disconnect()
    
    observer.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts()
        }
      },
      { threshold: 0.1 }
    )
    
    if (lastPostRef.current) {
      observer.current.observe(lastPostRef.current)
    }
    
    return () => {
      if (currentObserver) currentObserver.disconnect()
    }
  }, [loading, hasMore, loadMorePosts])

  const handleLike = (postId: string) => {
    console.log('Liked post:', postId)
  }

  const handleComment = (postId: string) => {
    console.log('Commented on post:', postId)
  }

  const handleShare = (postId: string) => {
    console.log('Shared post:', postId)
  }

  const handleBookmark = (postId: string) => {
    console.log('Bookmarked post:', postId)
  }

  const handleCreatePost = async (data: CreatePostData) => {
    console.log('Creating post:', data)
    // Here you would normally send the data to your API
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Bugema Hub</h1>
            
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Main Feed */}
          <div className="flex-1 lg:max-w-2xl">
            {/* Create Post Input - Desktop */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                  YU
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex-1 text-left text-gray-500 hover:text-gray-700 bg-gray-50 rounded-lg px-4 py-2 transition-colors"
                >
                  What's happening at Bugema?
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <div
                  key={post.id}
                  ref={index === filteredPosts.length - 1 ? lastPostRef : null}
                >
                  <PostCard
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onBookmark={handleBookmark}
                  />
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              {!hasMore && filteredPosts.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  No more posts to load
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Desktop */}
          <RightSidebar
            trendingTopics={trendingTopics}
            upcomingEvents={upcomingEvents}
            suggestedClubs={suggestedClubs}
            activeMembersCount={1234}
          />
        </div>
      </div>

      {/* Floating Create Button - Mobile */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCreateModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-20"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  )
}
