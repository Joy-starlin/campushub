'use client'
import { ResponsiveButton } from '../../components/ResponsiveForm'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  GraduationCap, 
  Plus, 
  Settings,
  Users,
  Building
} from 'lucide-react'
import { University, UniversityNews, UniversityEvent, UniversityResource, UniversityClub, UniversityAnalytics } from '../../types/universities'
import UniversityDirectory from '../../components/UniversityDirectory'
import UniversityHub from '../../components/UniversityHub'
import AddUniversityForm from '../../components/AddUniversityForm'
import UniversityAdminDashboard from '../../components/UniversityAdminDashboard'
import ResponsiveContainer from '../../components/ResponsiveContainer'
import toast from 'react-hot-toast'

// Mock data
const mockUniversities: University[] = [
  {
    id: '1',
    slug: 'bugema-university',
    name: 'Bugema University',
    shortName: 'Bugema',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop',
    country: 'Uganda',
    countryCode: 'UG',
    region: 'east-africa',
    type: 'private',
    status: 'active',
    officialEmailDomain: '@bugema.ac.ug',
    website: 'https://bugema.ac.ug',
    foundingYear: 1948,
    description: 'Bugema University is a private Christian university located in Uganda, offering quality education with a focus on holistic development and moral values.',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    isOfficialPartner: true,
    activeSince: '2020-01-15',
    contactInfo: {
      name: 'Dr. John Smith',
      email: 'admin@bugema.ac.ug',
      phone: '+256 414 250 000',
      role: 'University Administrator'
    },
    stats: {
      memberCount: 5234,
      clubCount: 45,
      eventCount: 128,
      resourceCount: 892,
      jobCount: 67
    },
    settings: {
      allowPublicAccess: true,
      requireVerification: true,
      enableGlobalPromotion: true
    },
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2026-04-22T00:00:00Z'
  },
  {
    id: '2',
    slug: 'makerere-university',
    name: 'Makerere University',
    shortName: 'Makerere',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop',
    country: 'Uganda',
    countryCode: 'UG',
    region: 'east-africa',
    type: 'public',
    status: 'active',
    officialEmailDomain: '@mak.ac.ug',
    website: 'https://mak.ac.ug',
    foundingYear: 1922,
    description: 'Makerere University is Uganda\'s largest and oldest public university, renowned for academic excellence and research contributions.',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    isOfficialPartner: true,
    activeSince: '2020-03-01',
    contactInfo: {
      name: 'Prof. Jane Doe',
      email: 'admin@mak.ac.ug',
      phone: '+256 414 530 000',
      role: 'University Administrator'
    },
    stats: {
      memberCount: 8932,
      clubCount: 78,
      eventCount: 234,
      resourceCount: 1456,
      jobCount: 156
    },
    settings: {
      allowPublicAccess: true,
      requireVerification: true,
      enableGlobalPromotion: true
    },
    createdAt: '2020-03-01T00:00:00Z',
    updatedAt: '2026-04-22T00:00:00Z'
  },
  {
    id: '3',
    slug: 'university-of-nairobi',
    name: 'University of Nairobi',
    shortName: 'UoN',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop',
    country: 'Kenya',
    countryCode: 'KE',
    region: 'east-africa',
    type: 'public',
    status: 'active',
    officialEmailDomain: '@uonbi.ac.ke',
    website: 'https://uonbi.ac.ke',
    foundingYear: 1956,
    description: 'The University of Nairobi is a leading institution of higher learning in Kenya, committed to academic excellence and innovation.',
    primaryColor: '#DC2626',
    secondaryColor: '#B91C1C',
    isOfficialPartner: true,
    activeSince: '2020-06-15',
    contactInfo: {
      name: 'Dr. Michael Kimani',
      email: 'admin@uonbi.ac.ke',
      phone: '+254 20 123 456',
      role: 'University Administrator'
    },
    stats: {
      memberCount: 12456,
      clubCount: 92,
      eventCount: 312,
      resourceCount: 2341,
      jobCount: 289
    },
    settings: {
      allowPublicAccess: true,
      requireVerification: true,
      enableGlobalPromotion: true
    },
    createdAt: '2020-06-15T00:00:00Z',
    updatedAt: '2026-04-22T00:00:00Z'
  },
  {
    id: '4',
    slug: 'dar-es-salaam-university',
    name: 'University of Dar es Salaam',
    shortName: 'UDSM',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop',
    country: 'Tanzania',
    countryCode: 'TZ',
    region: 'east-africa',
    type: 'public',
    status: 'active',
    officialEmailDomain: '@udsm.ac.tz',
    website: 'https://udsm.ac.tz',
    foundingYear: 1961,
    description: 'The University of Dar es Salaam is Tanzania\'s leading public university, known for research excellence and academic innovation.',
    primaryColor: '#7C3AED',
    secondaryColor: '#6D28D9',
    isOfficialPartner: true,
    activeSince: '2020-09-01',
    contactInfo: {
      name: 'Prof. Grace Mwangi',
      email: 'admin@udsm.ac.tz',
      phone: '+255 22 241 0000',
      role: 'University Administrator'
    },
    stats: {
      memberCount: 9823,
      clubCount: 67,
      eventCount: 189,
      resourceCount: 1678,
      jobCount: 198
    },
    settings: {
      allowPublicAccess: true,
      requireVerification: true,
      enableGlobalPromotion: true
    },
    createdAt: '2020-09-01T00:00:00Z',
    updatedAt: '2026-04-22T00:00:00Z'
  }
]

// Add more mock universities for demonstration
const additionalUniversities = Array.from({ length: 12 }, (_, i) => ({
  id: `uni-${i + 5}`,
  slug: `university-${i + 5}`,
  name: `University ${i + 5}`,
  shortName: `U${i + 5}`,
  country: ['Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Burundi', 'Nigeria', 'Ghana', 'South Africa'][i % 8],
  countryCode: ['UG', 'KE', 'TZ', 'RW', 'BI', 'NG', 'GH', 'ZA'][i % 8],
  region: ['east-africa', 'west-africa', 'southern-africa', 'central-africa'][i % 4] as any,
  type: ['public', 'private', 'international'][i % 3] as any,
  status: 'active' as any,
  officialEmailDomain: `@uni${i + 5}.edu`,
  website: `https://uni${i + 5}.edu`,
  foundingYear: 1950 + i,
  description: `University ${i + 5} is a leading institution of higher learning committed to academic excellence and innovation.`,
  primaryColor: ['#3B82F6', '#10B981', '#DC2626', '#7C3AED', '#F59E0B'][i % 5],
  secondaryColor: ['#8B5CF6', '#059669', '#B91C1C', '#6D28D9', '#D97706'][i % 5],
  isOfficialPartner: Math.random() > 0.3,
  activeSince: new Date(2020, i % 12, 15).toISOString(),
  contactInfo: {
    name: `Admin User ${i + 5}`,
    email: `admin@uni${i + 5}.edu`,
    phone: `+${256 + i * 10} 123 456`,
    role: 'University Administrator'
  },
  stats: {
    memberCount: Math.floor(Math.random() * 10000) + 1000,
    clubCount: Math.floor(Math.random() * 50) + 10,
    eventCount: Math.floor(Math.random() * 100) + 20,
    resourceCount: Math.floor(Math.random() * 500) + 100,
    jobCount: Math.floor(Math.random() * 100) + 10
  },
  settings: {
    allowPublicAccess: true,
    requireVerification: true,
    enableGlobalPromotion: true
  },
  createdAt: new Date(2020, i % 12, 15).toISOString(),
  updatedAt: new Date().toISOString()
} as University))

const allUniversities = [...mockUniversities, ...additionalUniversities]

// Mock content data
const mockNews: UniversityNews[] = []
const mockEvents: UniversityEvent[] = []
const mockResources: UniversityResource[] = []
const mockClubs: UniversityClub[] = []
const mockAnalytics: UniversityAnalytics = {
  universityId: '1',
  period: 'monthly',
  date: '2026-04-01',
  metrics: {
    pageViews: 45678,
    uniqueVisitors: 8934,
    newMembers: 234,
    activeUsers: 3456,
    contentPosted: 89,
    engagementRate: 67.5,
    topPages: [
      { page: '/universities/bugema-university', views: 12345, avgTimeOnPage: 245 },
      { page: '/universities/bugema-university/news', views: 8934, avgTimeOnPage: 189 },
      { page: '/universities/bugema-university/events', views: 6789, avgTimeOnPage: 156 }
    ],
    demographics: {
      byYear: {
        '2020': 1234,
        '2021': 1567,
        '2022': 1890,
        '2023': 2123,
        '2026': 234
      },
      byFaculty: {
        'Business': 2345,
        'Education': 1890,
        'Engineering': 1567,
        'Medicine': 1234,
        'Arts': 890
      },
      byCountry: {
        'Uganda': 6789,
        'Kenya': 1234,
        'Tanzania': 567,
        'Rwanda': 234,
        'Other': 110
      }
    }
  }
}

export default function UniversitiesPage() {
  const [currentView, setCurrentView] = useState<'directory' | 'hub' | 'admin' | 'add'>('directory')
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUserUniversity, setCurrentUserUniversity] = useState<string>('1') // Mock current user's university

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university)
    setCurrentView('hub')
  }

  const handleJoinUniversity = () => {
    toast.success(`You have joined ${selectedUniversity?.name}!`)
    setCurrentUserUniversity(selectedUniversity?.id || '')
  }

  const handleContentAction = (action: 'create' | 'edit' | 'delete' | 'promote', type: string, id?: string) => {
    switch (action) {
      case 'create':
        toast.success(`Creating new ${type}...`)
        break
      case 'edit':
        toast.success(`Editing ${type} ${id}...`)
        break
      case 'delete':
        toast.success(`Deleting ${type} ${id}...`)
        break
      case 'promote':
        toast.success(`Promoting ${type} ${id} to global...`)
        break
    }
  }

  const handleTabChange = (tab: string) => {
    console.log('Tab changed to:', tab)
  }

  const handleAddUniversity = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('University partnership request submitted successfully!')
      setShowAddForm(false)
      setCurrentView('directory')
    } catch (error) {
      toast.error('Failed to submit partnership request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canAddUniversity = true // In real app, check if user has admin permissions

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ResponsiveContainer>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  University Partners
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Connect with universities worldwide
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {canAddUniversity && (
                <ResponsiveButton
                  variant="primary"
                  onClick={() => setShowAddForm(true)}
                  className="min-h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add University
                </ResponsiveButton>
              )}
              {selectedUniversity && (
                <ResponsiveButton
                  variant="secondary"
                  onClick={() => setCurrentView('admin')}
                  className="min-h-10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </ResponsiveButton>
              )}
            </div>
          </div>
        </ResponsiveContainer>
      </div>

      {/* Main Content */}
      {currentView === 'directory' && (
        <UniversityDirectory
          universities={allUniversities}
          onUniversitySelect={handleUniversitySelect}
        />
      )}

      {currentView === 'hub' && selectedUniversity && (
        <UniversityHub
          university={selectedUniversity}
          news={mockNews}
          events={mockEvents}
          resources={mockResources}
          clubs={mockClubs}
          currentUserUniversity={currentUserUniversity}
          onJoinUniversity={handleJoinUniversity}
          onTabChange={handleTabChange}
        />
      )}

      {currentView === 'admin' && selectedUniversity && (
        <UniversityAdminDashboard
          university={selectedUniversity}
          analytics={mockAnalytics}
          news={mockNews}
          events={mockEvents}
          resources={mockResources}
          clubs={mockClubs}
          onContentAction={handleContentAction}
        />
      )}

      {/* Add University Modal */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setShowAddForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <AddUniversityForm
              onSubmit={handleAddUniversity}
              onCancel={() => setShowAddForm(false)}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}



