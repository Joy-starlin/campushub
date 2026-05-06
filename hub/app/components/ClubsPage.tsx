'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import ClubCard from './ClubCard'
import ClubFilters from './ClubFilters'
import CreateClubModal from './CreateClubModal'
import { useAuth } from '../contexts/AuthContext'
import SignupModal from './SignupModal'
import toast from 'react-hot-toast'

interface Club {
  id: string
  name: string
  category: 'Academic' | 'Sports' | 'Arts' | 'Technology' | 'Religious' | 'Community' | 'International'
  description: string
  memberCount: number
  coverImage?: string
  logo?: string
  isPrivate: boolean
  isMember: boolean
}

// Mock data
const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Computer Science Club',
    category: 'Technology',
    description: 'Explore the latest in tech, coding workshops, hackathons, and networking with industry professionals.',
    memberCount: 145,
    coverImage: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400&h=200&fit=crop',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    isPrivate: false,
    isMember: true
  },
  {
    id: '2',
    name: 'Basketball Team',
    category: 'Sports',
    description: 'Join our competitive basketball team. Practices, tournaments, and building teamwork skills.',
    memberCount: 24,
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=200&fit=crop',
    isPrivate: false,
    isMember: false
  },
  {
    id: '3',
    name: 'Drama Society',
    category: 'Arts',
    description: 'Express yourself through theater. Annual productions, improv nights, and acting workshops.',
    memberCount: 38,
    coverImage: 'https://images.unsplash.com/photo-1503095396548-807759245b35?w=400&h=200&fit=crop',
    isPrivate: false,
    isMember: false
  },
  {
    id: '4',
    name: 'Debate Club',
    category: 'Academic',
    description: 'Sharpen your argumentation skills. Regular debates, competitions, and public speaking practice.',
    memberCount: 56,
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop',
    isPrivate: false,
    isMember: true
  },
  {
    id: '5',
    name: 'Christian Fellowship',
    category: 'Religious',
    description: 'A community for Christian students. Weekly meetings, Bible study, and community service projects.',
    memberCount: 89,
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    isPrivate: false,
    isMember: false
  },
  {
    id: '6',
    name: 'Environmental Club',
    category: 'Community',
    description: 'Making our campus greener. Campus cleanups, recycling initiatives, and environmental awareness campaigns.',
    memberCount: 67,
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=200&fit=crop',
    isPrivate: false,
    isMember: false
  },
  {
    id: '7',
    name: 'International Student Association',
    category: 'International',
    description: 'Celebrating cultural diversity. Cultural festivals, language exchange, and supporting international students.',
    memberCount: 112,
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=200&fit=crop',
    isPrivate: false,
    isMember: true
  },
  {
    id: '8',
    name: 'Photography Club',
    category: 'Arts',
    description: 'Capture moments and tell stories through images. Photo walks, exhibitions, and technique workshops.',
    memberCount: 43,
    coverImage: 'https://images.unsplash.com/photo-1502780402662-acc01917ac92?w=400&h=200&fit=crop',
    isPrivate: false,
    isMember: false
  },
  {
    id: '9',
    name: 'Honor Society',
    category: 'Academic',
    description: 'Recognizing academic excellence. Scholarships, tutoring programs, and academic leadership opportunities.',
    memberCount: 78,
    isPrivate: true, // Private club
    isMember: false
  }
]

export default function ClubsPage() {
  const { user } = useAuth()
  const [clubs, setClubs] = useState<Club[]>(mockClubs)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Filter clubs
  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      // Search filter
      if (searchQuery && !club.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !club.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter
      if (selectedCategory && club.category !== selectedCategory) {
        return false
      }

      return true
    })
  }, [clubs, searchQuery, selectedCategory])

  const handleClubClick = (club: Club) => {
    // Navigate to club detail page
    console.log('Navigate to club:', club.id)
  }

  const handleJoin = (clubId: string) => {
    console.log('Join club:', clubId)
  }

  const handleLeave = (clubId: string) => {
    console.log('Leave club:', clubId)
  }

  const handleCreateButtonClick = () => {
    if (!user) {
      toast.error('Please sign in to create a club')
      return
    }
    if (!user.isVerified) {
      toast.error('Membership payment required to create clubs')
      setShowSignupModal(true)
      return
    }
    setIsCreateModalOpen(true)
  }

  const handleCreateClub = async (data: any) => {
    console.log('Creating club:', data)
    // Here you would normally send the data to your API
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Clubs & Organizations</h1>
            
            {/* Create Club Button (for admins/verified users) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateButtonClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Club</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <ClubFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onClick={handleClubClick}
              onJoin={handleJoin}
              onLeave={handleLeave}
            />
          ))}
        </div>

        {/* No Clubs Found */}
        {filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No clubs found</div>
            <div className="text-gray-400 text-sm mt-2">Try adjusting your filters</div>
          </div>
        )}
      </div>

      <CreateClubModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClub}
      />

      <SignupModal 
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        initialStep={2}
      />
    </div>
  )
}
