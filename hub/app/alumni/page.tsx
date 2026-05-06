'use client'
import { ResponsiveButton } from '../components/ResponsiveForm'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  GraduationCap, 
  Plus, 
  Users,
  Building,
  Calendar
} from 'lucide-react'
import { Alumni, MentorshipRequest, AlumniAchievement, AlumniPost, AlumniJob } from '../types/alumni'
import AlumniDirectory from '../components/AlumniDirectory'
import AlumniProfile from '../components/AlumniProfile'
import AlumniRegistrationForm from '../components/AlumniRegistrationForm'
import ResponsiveContainer from '../components/ResponsiveContainer'
import toast from 'react-hot-toast'

// Mock data
const mockAlumni: Alumni[] = [
  {
    id: '1',
    userId: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    graduationYear: 2018,
    degree: 'bachelor',
    course: 'Computer Science',
    university: 'Bugema University',
    country: 'United States',
    countryCode: 'US',
    currentJobTitle: 'Senior Software Engineer',
    currentCompany: 'Tech Corp',
    industry: 'tech',
    linkedInProfile: 'https://linkedin.com/in/sarahchen',
    isAvailableToMentor: true,
    mentorshipAreas: ['career', 'technical'],
    bio: 'Passionate about technology and mentoring the next generation of developers.',
    achievements: [],
    posts: [],
    jobsPosted: [],
    isVerified: true,
    joinedAt: '2020-01-15T00:00:00Z',
    lastActiveAt: '2026-04-22T00:00:00Z'
  },
  {
    id: '2',
    userId: '2',
    name: 'Michael Okonkwo',
    email: 'michael.okonkwo@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    graduationYear: 2019,
    degree: 'master',
    course: 'Business Administration',
    university: 'Bugema University',
    country: 'Kenya',
    countryCode: 'KE',
    currentJobTitle: 'CTO',
    currentCompany: 'StartupHub',
    industry: 'tech',
    linkedInProfile: 'https://linkedin.com/in/michaelokonkwo',
    isAvailableToMentor: true,
    mentorshipAreas: ['entrepreneurship', 'leadership'],
    achievements: [],
    posts: [],
    jobsPosted: [],
    isVerified: true,
    joinedAt: '2020-03-01T00:00:00Z',
    lastActiveAt: '2026-04-22T00:00:00Z'
  }
]

export default function AlumniPage() {
  const [currentView, setCurrentView] = useState<'directory' | 'profile' | 'register'>('directory')
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAlumniSelect = (alumni: Alumni) => {
    setSelectedAlumni(alumni)
    setCurrentView('profile')
  }

  const handleConnectRequest = (alumniId: string) => {
    toast.success('Connection request sent!')
  }

  const handleMentorshipRequest = (mentorId: string, message: string) => {
    toast.success('Mentorship request sent!')
  }

  const handleEditProfile = () => {
    toast.success('Profile editing coming soon!')
  }

  const handleRegistrationSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Alumni registration submitted successfully!')
      setShowRegistrationForm(false)
      setCurrentView('directory')
    } catch (error) {
      toast.error('Failed to submit registration')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ResponsiveContainer>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Alumni Network
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Connect with Bugema University graduates worldwide
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ResponsiveButton
                variant="primary"
                onClick={() => setShowRegistrationForm(true)}
                className="min-h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Register as Alumni
              </ResponsiveButton>
            </div>
          </div>
        </ResponsiveContainer>
      </div>

      {/* Main Content */}
      {currentView === 'directory' && (
        <AlumniDirectory
          alumni={mockAlumni}
          onAlumniSelect={handleAlumniSelect}
          onConnectRequest={handleConnectRequest}
        />
      )}

      {currentView === 'profile' && selectedAlumni && (
        <AlumniProfile
          alumni={selectedAlumni}
          mentorshipRequests={[]}
          achievements={[]}
          posts={[]}
          jobsPosted={[]}
          isOwnProfile={false}
          onConnect={handleConnectRequest}
          onMentorshipRequest={handleMentorshipRequest}
          onEditProfile={handleEditProfile}
        />
      )}

      {/* Registration Modal */}
      {showRegistrationForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setShowRegistrationForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <AlumniRegistrationForm
              onSubmit={handleRegistrationSubmit}
              onCancel={() => setShowRegistrationForm(false)}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
