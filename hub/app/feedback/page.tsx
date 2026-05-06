'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Shield, 
  CheckCircle,
  Users,
  ArrowRight
} from 'lucide-react'
import { FeedbackSubmission, PublicResponse, FeedbackCategory } from '../types/feedback'
import FeedbackForm from '../components/FeedbackForm'
import PublicResponses from '../components/PublicResponses'
import AnonymousTracking from '../components/AnonymousTracking'
import ResponsiveContainer from '../components/ResponsiveContainer'
import ResponsiveGrid from '../components/ResponsiveGrid'
import toast from 'react-hot-toast'

// Mock data
const mockPublicResponses: PublicResponse[] = [
  {
    id: '1',
    category: 'campus-facilities',
    response: 'We have addressed the Wi-Fi connectivity issues in the library. The network has been upgraded and should now provide stable connectivity throughout the building. Please report any continued issues to the IT helpdesk.',
    respondedBy: 'IT Department',
    respondedAt: '2024-04-20T10:00:00Z',
    upvotes: 24,
    isUpvoted: false
  },
  {
    id: '2',
    category: 'academic-issues',
    response: 'The examination schedule has been revised to reduce conflicts between courses. Updated schedules are now available on the student portal. We appreciate your feedback in helping us improve the academic experience.',
    respondedBy: 'Academic Affairs',
    respondedAt: '2024-04-18T14:30:00Z',
    upvotes: 18,
    isUpvoted: true
  },
  {
    id: '3',
    category: 'safety-concern',
    response: 'Additional lighting has been installed along the main campus pathways. Security patrols have also been increased during evening hours. Your safety is our top priority.',
    respondedBy: 'Campus Security',
    respondedAt: '2024-04-15T09:15:00Z',
    upvotes: 32,
    isUpvoted: false
  }
]

const mockSubmissions: FeedbackSubmission[] = [
  {
    id: '1',
    referenceCode: 'FB-2024-0472',
    category: 'campus-facilities',
    title: 'Library Wi-Fi Issues',
    description: 'The Wi-Fi in the library keeps disconnecting, making it difficult to study and access online resources.',
    rating: 4,
    severity: 'medium',
    isUrgent: false,
    anonymousId: 'anon-123',
    status: 'resolved',
    createdAt: '2024-04-10T10:00:00Z',
    updatedAt: '2024-04-20T10:00:00Z',
    adminNotes: 'Network upgrade completed on April 20th'
  }
]

function generateReferenceCode(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `FB-${year}-${random}`
}

function getAnonymousId(): string {
  if (typeof window === 'undefined') return 'anon-default'
  
  let anonymousId = localStorage.getItem('anonymousId')
  if (!anonymousId) {
    anonymousId = 'anon-' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('anonymousId', anonymousId)
  }
  return anonymousId
}

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'responses' | 'track'>('submit')
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>(mockSubmissions)
  const [publicResponses, setPublicResponses] = useState<PublicResponse[]>(mockPublicResponses)

  const handleSubmitFeedback = async (data: any) => {
    const referenceCode = generateReferenceCode()
    const anonymousId = getAnonymousId()
    
    const newSubmission: FeedbackSubmission = {
      id: Date.now().toString(),
      referenceCode,
      rating: data.rating,
      category: data.category,
      title: data.title,
      description: data.description,
      severity: data.severity,
      isUrgent: data.isUrgent,
      anonymousId,
      status: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Handle image upload if present
    if (data.imageFile) {
      // In a real app, this would upload to storage
      console.log('Image uploaded:', data.imageFile.name)
    }

    setSubmissions([newSubmission, ...submissions])
    
    return { referenceCode }
  }

  const handleUpvote = (responseId: string) => {
    setPublicResponses(publicResponses.map(response => 
      response.id === responseId 
        ? { ...response, upvotes: response.upvotes + 1, isUpvoted: true }
        : response
    ))
    toast.success('Upvoted response!')
  }

  const handleTrackSubmission = async (referenceCode: string) => {
    const submission = submissions.find(s => s.referenceCode === referenceCode)
    return submission || null
  }

  const tabs = [
    {
      id: 'submit',
      label: 'Submit Feedback',
      icon: <MessageSquare className="w-4 h-4" />
    },
    {
      id: 'responses',
      label: 'Public Responses',
      icon: <CheckCircle className="w-4 h-4" />
    },
    {
      id: 'track',
      label: 'Track Submission',
      icon: <Shield className="w-4 h-4" />
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ResponsiveContainer>
        <div className="py-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Anonymous Feedback System
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your voice matters. All submissions are 100% anonymous.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {submissions.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Submissions
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {publicResponses.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Public Responses
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {submissions.filter(s => s.status === 'resolved').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Resolved Issues
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'submit' && (
              <div className="max-w-2xl mx-auto">
                <FeedbackForm onSubmit={handleSubmitFeedback} />
              </div>
            )}

            {activeTab === 'responses' && (
              <PublicResponses 
                responses={publicResponses}
                onUpvote={handleUpvote}
              />
            )}

            {activeTab === 'track' && (
              <div className="max-w-2xl mx-auto">
                <AnonymousTracking onTrackSubmission={handleTrackSubmission} />
              </div>
            )}
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Why Anonymous Feedback Matters
              </h2>
              <ResponsiveGrid 
                cols={{ base: 1, md: 3 }}
                gap={{ base: 6, md: 8 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    100% Anonymous
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your identity is never revealed, allowing honest and open feedback
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Real Action
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We review and act on all submissions to improve the campus experience
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ArrowRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Track Progress
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Follow your submission status without revealing your identity
                  </p>
                </div>
              </ResponsiveGrid>
            </div>
          </motion.div>
        </div>
      </ResponsiveContainer>
    </div>
  )
}
