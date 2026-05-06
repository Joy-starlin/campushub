'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Calendar, 
  Briefcase, 
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Globe,
  Award,
  BookOpen,
  Users,
  MessageSquare,
  UserPlus,
  Clock,
  CheckCircle,
  Edit,
  Send
} from 'lucide-react'
import { Alumni, MentorshipRequest, AlumniAchievement, AlumniPost, AlumniJob } from '../types/alumni'
import { ResponsiveButton } from './ResponsiveForm'

interface AlumniProfileProps {
  alumni: Alumni
  mentorshipRequests: MentorshipRequest[]
  achievements: AlumniAchievement[]
  posts: AlumniPost[]
  jobsPosted: AlumniJob[]
  isOwnProfile: boolean
  onConnect: (alumniId: string) => void
  onMentorshipRequest: (mentorId: string, message: string) => void
  onEditProfile: () => void
}

export default function AlumniProfile({
  alumni,
  mentorshipRequests,
  achievements,
  posts,
  jobsPosted,
  isOwnProfile,
  onConnect,
  onMentorshipRequest,
  onEditProfile
}: AlumniProfileProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showMentorshipModal, setShowMentorshipModal] = useState(false)
  const [mentorshipMessage, setMentorshipMessage] = useState('')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'career', label: 'Career', icon: Briefcase },
    { id: 'achievements', label: 'Achievements', icon: Award, count: achievements.length },
    { id: 'posts', label: 'Posts', icon: MessageSquare, count: posts.length },
    { id: 'jobs', label: 'Jobs Posted', icon: Briefcase, count: jobsPosted.length }
  ]

  const handleMentorshipSubmit = () => {
    if (mentorshipMessage.trim()) {
      onMentorshipRequest(alumni.id, mentorshipMessage.trim())
      setShowMentorshipModal(false)
      setMentorshipMessage('')
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

  const getYearsAgo = (year: number) => {
    return new Date().getFullYear() - year
  }

  const getIndustryColor = (industry: string) => {
    const colors: Record<string, string> = {
      'tech': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'finance': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'healthcare': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'education': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'ngo': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'consulting': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'marketing': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'sales': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'engineering': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'other': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
    return colors[industry] || colors.other
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="bg-linear-to-br from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Photo */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-xl">
              {alumni.avatar ? (
                <img
                  src={alumni.avatar}
                  alt={alumni.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {alumni.name}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-green-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Class of {alumni.graduationYear}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{alumni.country}</span>
                </div>
              </div>
              
              {/* Current Position */}
              {alumni.currentJobTitle && alumni.currentCompany && (
                <div className="mt-3">
                  <div className="flex items-center space-x-2 text-white text-sm">
                    <Briefcase className="w-4 h-4" />
                    <span>{alumni.currentJobTitle}</span>
                  </div>
                  <div className="text-green-100 text-sm">
                    at {alumni.currentCompany}
                  </div>
                </div>
              )}

              {/* Industry and Mentorship */}
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIndustryColor(alumni.industry)}`}>
                  {alumni.industry.replace('-', ' ')}
                </span>
                {alumni.isAvailableToMentor && (
                  <div className="flex items-center space-x-1 text-green-100">
                    <CheckCircle className="w-4 h-4" />
                    <span>Available to mentor</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              {!isOwnProfile && (
                <>
                  <ResponsiveButton
                    variant="primary"
                    onClick={() => onConnect(alumni.id)}
                    className="min-h-10"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connect
                  </ResponsiveButton>
                  {alumni.isAvailableToMentor && (
                    <ResponsiveButton
                      variant="secondary"
                      onClick={() => setShowMentorshipModal(true)}
                      className="min-h-10"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Request Mentorship
                    </ResponsiveButton>
                  )}
                </>
              )}
              {isOwnProfile && (
                <ResponsiveButton
                  variant="secondary"
                  onClick={onEditProfile}
                  className="min-h-10"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </ResponsiveButton>
              )}
              {alumni.linkedInProfile && (
                <a
                  href={alumni.linkedInProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Bio */}
            {alumni.bio && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  About
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {alumni.bio}
                </p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Email</div>
                      <a
                        href={`mailto:${alumni.email}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {alumni.email}
                      </a>
                    </div>
                  </div>
                  {alumni.linkedInProfile && (
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <a
                        href={alumni.linkedInProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Location</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {alumni.country}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Last Active</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {formatDateTime(alumni.lastActiveAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentorship Areas */}
            {alumni.mentorshipAreas.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Mentorship Areas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {alumni.mentorshipAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium"
                    >
                      {area.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Education History
              </h2>
              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {alumni.degree.replace('-', ' ').toUpperCase()} in {alumni.course}
                    </h3>
                    <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{alumni.university}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Graduated {alumni.graduationYear}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {getYearsAgo(alumni.graduationYear)} years ago
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Career Tab */}
        {activeTab === 'career' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Career Timeline
              </h2>
              
              {/* Current Position */}
              {alumni.currentJobTitle && alumni.currentCompany && (
                <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Current Position
                      </h3>
                      <p className="text-gray-900 dark:text-white font-medium mb-1">
                        {alumni.currentJobTitle}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {alumni.currentCompany}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Career Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getYearsAgo(alumni.graduationYear)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Years Experience
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {alumni.industry.replace('-', ' ')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Industry
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {alumni.country}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Location
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Achievements
            </h2>
            {achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {achievement.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatDate(achievement.date)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            achievement.category === 'academic' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            achievement.category === 'career' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            achievement.category === 'personal' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {achievement.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No achievements yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Achievements will appear here once added.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Posts & Updates
            </h2>
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {post.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.type === 'achievement' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        post.type === 'opportunity' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {post.type}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>{formatDate(post.createdAt)}</span>
                        <div className="flex items-center space-x-1">
                          <span>{post.likes} likes</span>
                          <span>•</span>
                          <span>{post.comments} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Posts and updates will appear here once shared.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Job Opportunities Posted
            </h2>
            {jobsPosted.length > 0 ? (
              <div className="space-y-4">
                {jobsPosted.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {job.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{job.company}</span>
                          <span>{job.location}</span>
                          <span>{job.type}</span>
                        </div>
                      </div>
                      <ResponsiveButton
                        variant="primary"
                        className="min-h-9"
                      >
                        View Details
                      </ResponsiveButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No jobs posted yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Job opportunities posted by this alumni will appear here.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Mentorship Request Modal */}
      {showMentorshipModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMentorshipModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Request Mentorship
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Send a message to {alumni.name} explaining why you'd like them to be your mentor.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Message
                </label>
                <textarea
                  value={mentorshipMessage}
                  onChange={(e) => setMentorshipMessage(e.target.value)}
                  rows={4}
                  placeholder="I'm interested in learning more about your experience in..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex space-x-3">
                <ResponsiveButton
                  variant="secondary"
                  onClick={() => setShowMentorshipModal(false)}
                  className="flex-1"
                >
                  Cancel
                </ResponsiveButton>
                <ResponsiveButton
                  variant="primary"
                  onClick={handleMentorshipSubmit}
                  disabled={!mentorshipMessage.trim()}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </ResponsiveButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
