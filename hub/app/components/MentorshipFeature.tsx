'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle, 
  X, 
  MessageCircle,
  Star,
  Award,
  Filter,
  Search
} from 'lucide-react'
import { MentorshipRequest, MentorshipSession, MentorshipArea, Industry, MentorshipAreaInfo } from '../types/alumni'
import { ResponsiveButton } from './ResponsiveForm'

interface MentorshipFeatureProps {
  mentorshipRequests: MentorshipRequest[]
  mentorshipAreas: any[]
  onRequestMentorship: (mentorId: string, message: string) => void
  onRespondToRequest: (requestId: string, status: 'accepted' | 'declined', responseMessage?: string) => void
  onScheduleSession: (requestId: string, session: Omit<MentorshipSession, 'id' | 'mentorshipRequestId' | 'createdAt'>) => void
}

const mentorshipAreaInfo: MentorshipAreaInfo[] = [
  { area: 'career', label: 'Career Development', description: 'Career guidance, job search, interview preparation', icon: 'Briefcase' },
  { area: 'academic', label: 'Academic Support', description: 'Study techniques, research guidance, academic planning', icon: 'BookOpen' },
  { area: 'leadership', label: 'Leadership', description: 'Leadership skills, team management, professional development', icon: 'Award' },
  { area: 'entrepreneurship', label: 'Entrepreneurship', description: 'Starting a business, funding, business planning', icon: 'Star' },
  { area: 'technical', label: 'Technical Skills', description: 'Programming, engineering, technical mentorship', icon: 'Code' },
  { area: 'research', label: 'Research', description: 'Research methods, academic writing, publications', icon: 'Search' },
  { area: 'other', label: 'Other', description: 'General guidance and support', icon: 'Users' }
]

export default function MentorshipFeature({
  mentorshipRequests,
  mentorshipAreas,
  onRequestMentorship,
  onRespondToRequest,
  onScheduleSession
}: MentorshipFeatureProps) {
  const [activeView, setActiveView] = useState<'browse' | 'requests' | 'sessions'>('browse')
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [showSessionModal, setShowSessionModal] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60
  })

  const filteredMentors = mentorshipAreas.filter((mentor: any) => 
    mentor.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedArea === '' || mentor.areas?.includes(selectedArea as MentorshipArea))
  )

  const pendingRequests = mentorshipRequests.filter((req: any) => req.status === 'pending')
  const activeRequests = mentorshipRequests.filter((req: any) => req.status === 'accepted')
  const completedSessions = mentorshipRequests.filter((req: any) => 
    req.status === 'completed' && req.scheduledSession
  )

  const handleBrowseMentors = () => {
    setActiveView('browse')
    setSelectedMentor(null)
  }

  const handleViewRequests = () => {
    setActiveView('requests')
  }

  const handleViewSessions = () => {
    setActiveView('sessions')
  }

  const handleMentorClick = (mentorId: string) => {
    setSelectedMentor(mentorId)
  }

  const handleRequestMentorship = (mentorId: string) => {
    onRequestMentorship(mentorId, `Hi, I'm interested in mentorship. I'd love to learn from your experience and guidance.`)
  }

  const handleScheduleSession = (requestId: string) => {
    setShowSessionModal(requestId)
  }

  const handleSessionSubmit = () => {
    if (showSessionModal) {
      const request = mentorshipRequests.find(req => req.id === showSessionModal)
      if (!request) return

      onScheduleSession(showSessionModal, {
        ...sessionData,
        mentorId: request.mentorId,
        menteeId: request.menteeId,
        meetingUrl: generateMeetLink({ ...sessionData, scheduledAt: sessionData.scheduledAt } as any),
        status: 'scheduled'
      })
      setShowSessionModal(null)
      setSessionData({
        title: '',
        description: '',
        scheduledAt: '',
        duration: 60
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'accepted':
        return 'text-green-600 dark:text-green-400'
      case 'declined':
        return 'text-red-600 dark:text-red-400'
      case 'completed':
        return 'text-blue-600 dark:text-blue-400'
      case 'cancelled':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getMentorIcon = (area: string) => {
    const iconMap: Record<string, string> = {
      'career': 'Briefcase',
      'academic': 'BookOpen',
      'leadership': 'Award',
      'entrepreneurship': 'Star',
      'technical': 'Code',
      'research': 'Search',
      'other': 'Users'
    }
    return iconMap[area] || 'Users'
  }

  const generateMeetLink = (session: MentorshipSession) => {
    // Generate a Google Meet link (in real implementation, this would be server-side)
    const meetingId = Math.random().toString(36).substring(0, 10)
    const startTime = new Date(session.scheduledAt).toISOString()
    return `https://meet.google.com/${meetingId}?authuser=0&hs=1800&pli=1&rm=${encodeURIComponent(startTime)}`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mentorship Program
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBrowseMentors}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'browse'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Browse Mentors
              </button>
              <button
                onClick={handleViewRequests}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'requests'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Requests ({pendingRequests.length})
              </button>
              <button
                onClick={handleViewSessions}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'sessions'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Sessions ({completedSessions.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Browse Mentors View */}
        {activeView === 'browse' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Mentors
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, expertise, or area..."
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Areas</option>
                    {mentorshipAreaInfo.map((area) => (
                      <option key={area.area} value={area.area}>
                        {area.label}
                      </option>
                    ))}
                  </select>
                  <Filter className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Mentor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start space-x-4">
                    {/* Mentor Avatar */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={mentor.avatar || ''}
                        alt={mentor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Mentor Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {mentor.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {mentor.description}
                      </p>
                      
                      {/* Mentorship Areas */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mentor.areas.map((area: any) => {
                          const areaInfo = mentorshipAreaInfo.find(info => info.area === area)
                          return (
                            <span
                              key={area}
                              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium"
                            >
                              {areaInfo?.label || area}
                            </span>
                          )
                        })}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 shrink-0" />
                          <span className="whitespace-nowrap">{mentor.mentorshipCount || 0} mentees</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 shrink-0" />
                          <span className="whitespace-nowrap">{mentor.rating || '4.8'} rating</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col space-y-2">
                      <ResponsiveButton
                        variant="primary"
                        onClick={() => handleRequestMentorship(mentor.id)}
                        className="w-full min-h-9"
                      >
                        Request Mentorship
                      </ResponsiveButton>
                      <ResponsiveButton
                        variant="secondary"
                        onClick={() => handleMentorClick(mentor.id)}
                        className="w-full min-h-9"
                      >
                        View Profile
                      </ResponsiveButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No mentors found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search or filters to find more mentors.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Mentorship Requests View */}
        {activeView === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Mentorship Requests
            </h2>

            {/* Request List */}
            <div className="space-y-4">
              {mentorshipRequests.length > 0 ? (
                mentorshipRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(request.status)}`}></div>
                        <span className={`font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(request.requestedAt)}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          <strong>From:</strong> {request.menteeId}
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {request.message}
                        </p>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex space-x-3">
                          <ResponsiveButton
                            variant="primary"
                            onClick={() => onRespondToRequest(request.id, 'accepted')}
                            className="min-h-9"
                          >
                            Accept
                          </ResponsiveButton>
                          <ResponsiveButton
                            variant="secondary"
                            onClick={() => onRespondToRequest(request.id, 'declined')}
                            className="min-h-9"
                          >
                            Decline
                          </ResponsiveButton>
                        </div>
                      )}

                      {request.status === 'accepted' && (
                        <div className="space-y-3">
                          <ResponsiveButton
                            variant="primary"
                            onClick={() => handleScheduleSession(request.id)}
                            className="min-h-9"
                          >
                            Schedule Session
                          </ResponsiveButton>
                          {request.scheduledSession && (
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              <Video className="w-4 h-4 inline mr-2" />
                              Meeting scheduled for {formatDateTime(request.scheduledSession.scheduledAt)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No mentorship requests
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Mentorship requests will appear here once students reach out.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Sessions View */}
        {activeView === 'sessions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Mentorship Sessions
            </h2>

            {/* Session List */}
            <div className="space-y-4">
              {completedSessions.length > 0 ? (
                completedSessions.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Mentorship Session
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          With {request.menteeId}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor('completed')}`}>
                          Completed
                        </span>
                      </div>
                    </div>

                    {request.scheduledSession && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {request.scheduledSession.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            {request.scheduledSession.description}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDateTime(request.scheduledSession.scheduledAt)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{request.scheduledSession.duration} minutes</span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={generateMeetLink(request.scheduledSession)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No completed sessions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Completed mentorship sessions will appear here.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Schedule Session Modal */}
      {showSessionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSessionModal(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Schedule Mentorship Session
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Title
                </label>
                <input
                  type="text"
                  value={sessionData.title}
                  onChange={(e) => setSessionData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Career Guidance Session"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={sessionData.description}
                  onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="What would you like to discuss in this session?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={sessionData.scheduledAt}
                    onChange={(e) => setSessionData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={sessionData.duration}
                    onChange={(e) => setSessionData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    min="15"
                    max="180"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <ResponsiveButton
                variant="secondary"
                onClick={() => setShowSessionModal(null)}
                className="flex-1"
              >
                Cancel
              </ResponsiveButton>
              <ResponsiveButton
                variant="primary"
                onClick={handleSessionSubmit}
                className="flex-1"
              >
                Schedule Session
              </ResponsiveButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
