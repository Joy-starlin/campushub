'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  BookOpen,
  Briefcase,
  Newspaper,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  ExternalLink,
  User,
  CheckCircle,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle
} from 'lucide-react'
import { University, UniversityNews, UniversityEvent, UniversityResource, UniversityClub } from '../types/universities'
import { ResponsiveButton } from './ResponsiveForm'

interface UniversityHubProps {
  university: University
  news: UniversityNews[]
  events: UniversityEvent[]
  resources: UniversityResource[]
  clubs: UniversityClub[]
  currentUserUniversity?: string
  onJoinUniversity: () => void
  onTabChange: (tab: string) => void
}

export default function UniversityHub({
  university,
  news,
  events,
  resources,
  clubs,
  currentUserUniversity,
  onJoinUniversity,
  onTabChange
}: UniversityHubProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'news', label: 'News', icon: Newspaper, count: news.length },
    { id: 'events', label: 'Events', icon: Calendar, count: events.length },
    { id: 'clubs', label: 'Clubs', icon: Users, count: clubs.length },
    { id: 'resources', label: 'Resources', icon: BookOpen, count: resources.length },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, count: 0 }
  ]

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange(tabId)
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

  const isCurrentUserMember = currentUserUniversity === university.id

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* University Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 bg-linear-to-br from-blue-600 to-purple-600 relative">
          {university.coverImage ? (
            <img
              src={university.coverImage}
              alt={university.name}
              className="w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        {/* University Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
            {/* Logo */}
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-xl mb-4 md:mb-0 md:mr-6">
              {university.logo ? (
                <img
                  src={university.logo}
                  alt={university.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {university.name}
                </h1>
                {university.isOfficialPartner && (
                  <span title="Official Partner"><CheckCircle className="w-6 h-6 text-blue-400" /></span>
                )}
              </div>
              <p className="text-lg text-blue-100 mb-2">
                {university.shortName}
              </p>
              <div className="flex items-center justify-center md:justify-start space-x-4 text-blue-100">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{university.country}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Website
                  </a>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col items-center md:items-end space-y-3">
              {isCurrentUserMember ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">I study here</span>
                </div>
              ) : (
                <ResponsiveButton
                  variant="primary"
                  onClick={onJoinUniversity}
                  className="min-h-12 px-8"
                >
                  <User className="w-5 h-5 mr-2" />
                  I Study Here
                </ResponsiveButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {university.stats.memberCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {university.stats.clubCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Clubs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {university.stats.eventCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {university.stats.resourceCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Resources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {university.stats.jobCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Jobs</div>
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
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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
            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                About {university.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {university.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Location</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{university.country}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Website</div>
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {university.website}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Founded</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {university.foundingYear || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Type</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {university.type.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {university.contactInfo.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {university.contactInfo.role}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a
                    href={`mailto:${university.contactInfo.email}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {university.contactInfo.email}
                  </a>
                </div>
                {university.contactInfo.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a
                      href={`tel:${university.contactInfo.phone}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {university.contactInfo.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Latest News
            </h2>
            <div className="space-y-4">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    {item.featuredImage && (
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {item.excerpt || item.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(item.publishedAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{item.viewCount}</span>
                          </div>
                        </div>
                        <ResponsiveButton
                          variant="secondary"
                          className="min-h-8 px-4 text-sm"
                        >
                          Read More
                        </ResponsiveButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                        {event.type}
                      </span>
                      {event.isVirtual && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                          Virtual
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateTime(event.startDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.isVirtual ? 'Online' : event.location}</span>
                      </div>
                      {event.maxAttendees && (
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{event.currentAttendees}/{event.maxAttendees} attending</span>
                        </div>
                      )}
                    </div>
                    <ResponsiveButton
                      variant="primary"
                      className="w-full min-h-9 mt-4"
                    >
                      Register
                    </ResponsiveButton>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Clubs Tab */}
        {activeTab === 'clubs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Student Clubs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {club.logo ? (
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {club.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {club.category}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {club.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{club.memberCount} members</span>
                    </div>
                    <ResponsiveButton
                      variant="secondary"
                      className="min-h-8 px-4 text-sm"
                    >
                      View Club
                    </ResponsiveButton>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Learning Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium">
                        {resource.type}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Eye className="w-4 h-4" />
                      <span>{resource.downloadCount}</span>
                    </div>
                    <ResponsiveButton
                      variant="primary"
                      className="min-h-8 px-4 text-sm"
                    >
                      Download
                    </ResponsiveButton>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Jobs for {university.shortName} Students
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Check out the Jobs & Internships section for opportunities targeting {university.shortName} students.
            </p>
            <ResponsiveButton
              variant="primary"
              className="min-h-10"
            >
              Browse Jobs
            </ResponsiveButton>
          </motion.div>
        )}
      </div>
    </div>
  )
}
