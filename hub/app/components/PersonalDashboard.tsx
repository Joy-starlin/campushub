'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Calendar, 
  Users, 
  ShoppingBag, 
  MessageCircle,
  FileText,
  Bell,
  TrendingUp,
  Clock
} from 'lucide-react'

interface DashboardData {
  user: {
    name: string
    username: string
    profilePhoto?: string
  }
  stats: {
    postsThisMonth: number
    eventsRsvpd: number
    clubMemberships: number
    unreadMessages: number
  }
  upcomingEvents: Array<{
    id: string
    title: string
    date: string
    time: string
    club: string
  }>
  clubs: Array<{
    id: string
    name: string
    logo?: string
    memberCount: number
    latestActivity: string
  }>
  recentActivity: Array<{
    id: string
    type: 'post' | 'event_rsvp' | 'club_join' | 'marketplace_post'
    message: string
    timestamp: string
  }>
}

interface PersonalDashboardProps {
  data: DashboardData
  onNewPost: () => void
  onBrowseEvents: () => void
  onFindClub: () => void
  onPostListing: () => void
}

export default function PersonalDashboard({ 
  data, 
  onNewPost, 
  onBrowseEvents, 
  onFindClub, 
  onPostListing 
}: PersonalDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useState(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  })

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const statCards = [
    {
      title: 'Posts this month',
      value: data.stats.postsThisMonth,
      icon: FileText,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      title: "Events RSVP'd",
      value: data.stats.eventsRsvpd,
      icon: Calendar,
      color: 'bg-green-500',
      trend: '+3'
    },
    {
      title: 'Club memberships',
      value: data.stats.clubMemberships,
      icon: Users,
      color: 'bg-purple-500',
      trend: '+1'
    },
    {
      title: 'Unread messages',
      value: data.stats.unreadMessages,
      icon: MessageCircle,
      color: 'bg-orange-500',
      trend: null
    }
  ]

  const quickActions = [
    {
      label: 'New Post',
      icon: FileText,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: onNewPost
    },
    {
      label: 'Browse Events',
      icon: Calendar,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: onBrowseEvents
    },
    {
      label: 'Find Club',
      icon: Users,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: onFindClub
    },
    {
      label: 'Post Listing',
      icon: ShoppingBag,
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: onPostListing
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {data.user.profilePhoto ? (
                <img
                  src={data.user.profilePhoto}
                  alt={data.user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-700">
                    {getInitials(data.user.name)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getGreeting()}, {data.user.name}!
                </h1>
                <p className="text-gray-600">Welcome back to your dashboard</p>
              </div>
            </div>
            
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Bell className="w-6 h-6" />
              {data.stats.unreadMessages > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.trend && (
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>{stat.trend}</span>
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.title}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.onClick}
                  className={`${action.color} text-white rounded-lg p-4 transition-colors`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{action.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Upcoming Events</h2>
              {data.upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {data.upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500">{event.club}</p>
                        <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming events</p>
                  <button
                    onClick={onBrowseEvents}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Browse Events
                  </button>
                </div>
              )}
            </div>

            {/* Your Clubs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Clubs</h2>
              {data.clubs.length > 0 ? (
                <div className="space-y-4">
                  {data.clubs.map((club) => (
                    <div key={club.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      {club.logo ? (
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{club.name}</h4>
                        <p className="text-sm text-gray-500">{club.memberCount} members</p>
                        <p className="text-sm text-gray-500">{club.latestActivity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No clubs joined yet</p>
                  <button
                    onClick={onFindClub}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Find Clubs
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
