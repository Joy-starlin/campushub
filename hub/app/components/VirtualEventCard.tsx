'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  Video,
  Monitor,
  Globe,
  Link,
  Play,
  Eye,
  Star,
  ChevronRight
} from 'lucide-react'
import { VirtualEvent, EventFormat, VirtualPlatform, EventCountdown } from '../types/virtual-events'
import { ResponsiveButton } from './ResponsiveForm'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'

interface VirtualEventCardProps {
  event: VirtualEvent
  onRSVP: (eventId: string, type: 'in-person' | 'online') => void
  onJoinEvent: (eventId: string) => void
  onViewDetails: (eventId: string) => void
  userRSVP?: { type: 'in-person' | 'online'; confirmed: boolean }
  showFullDetails?: boolean
}

const platformIcons: Record<VirtualPlatform, string> = {
  'google-meet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Google_Meet_icon_%282020%29.svg/1024px-Google_Meet_icon_%282020%29.svg.png',
  'zoom': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_logo.svg/2048px-Zoom_logo.svg.png',
  'microsoft-teams': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Teams_%282018%E2%80%93present%29.svg/2048px-Microsoft_Teams_%282018%E2%80%93present%29.svg.png',
  'custom': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Link_icon.svg/2048px-Link_icon.svg.png'
}

const platformColors: Record<VirtualPlatform, string> = {
  'google-meet': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'zoom': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'microsoft-teams': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'custom': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

export default function VirtualEventCard({
  event,
  onRSVP,
  onJoinEvent,
  onViewDetails,
  userRSVP,
  showFullDetails = false
}: VirtualEventCardProps) {
  const [countdown, setCountdown] = useState<EventCountdown | null>(null)
  const [canJoin, setCanJoin] = useState(false)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const startTime = new Date(event.startDate)
      const endTime = new Date(event.endDate)
      
      const timeUntil = {
        days: differenceInDays(startTime, now),
        hours: differenceInHours(startTime, now) % 24,
        minutes: differenceInMinutes(startTime, now) % 60,
        seconds: differenceInSeconds(startTime, now) % 60
      }

      const isLive = now >= startTime && now <= endTime
      const hasEnded = now > endTime
      const thirtyMinutesBefore = new Date(startTime.getTime() - 30 * 60 * 1000)
      const canJoinNow = now >= thirtyMinutesBefore && !hasEnded

      setCountdown({
        eventId: event.id,
        startTime: event.startDate,
        currentTime: now.toISOString(),
        timeUntil,
        isLive,
        hasEnded,
        canJoin: canJoinNow
      })

      setCanJoin(canJoinNow)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [event.startDate, event.endDate, event.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCountdown = (timeUntil: EventCountdown['timeUntil']) => {
    if (timeUntil.days > 0) {
      return `${timeUntil.days}d ${timeUntil.hours}h ${timeUntil.minutes}m`
    } else if (timeUntil.hours > 0) {
      return `${timeUntil.hours}h ${timeUntil.minutes}m`
    } else if (timeUntil.minutes > 0) {
      return `${timeUntil.minutes}m ${timeUntil.seconds}s`
    } else {
      return `${timeUntil.seconds}s`
    }
  }

  const getPlatformName = (platform: VirtualPlatform) => {
    const names: Record<VirtualPlatform, string> = {
      'google-meet': 'Google Meet',
      'zoom': 'Zoom',
      'microsoft-teams': 'Microsoft Teams',
      'custom': 'Custom'
    }
    return names[platform]
  }

  const getEventStatusColor = () => {
    if (countdown?.isLive) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (countdown?.hasEnded) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }

  const getEventStatusText = () => {
    if (countdown?.isLive) return 'LIVE NOW'
    if (countdown?.hasEnded) return 'ENDED'
    return 'UPCOMING'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
    >
      {/* Event Header */}
      <div className="relative">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
        ) : (
          <div className="w-full h-48 bg-linear-to-br from-blue-500 to-purple-600 rounded-t-xl flex items-center justify-center">
            <Calendar className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventStatusColor()}`}>
            {getEventStatusText()}
          </span>
        </div>

        {/* Format Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center space-x-2">
            {event.format === 'online' && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                <Video className="w-3 h-3" />
                <span>Online</span>
              </div>
            )}
            {event.format === 'hybrid' && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium">
                <Monitor className="w-3 h-3" />
                <span>Hybrid</span>
              </div>
            )}
            {event.format === 'physical' && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                <MapPin className="w-3 h-3" />
                <span>In-Person</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6">
        {/* Title and Category */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {event.title}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs font-medium">
              {event.category}
            </span>
            {event.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        {showFullDetails && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Date and Time */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">({event.timezone})</span>
          </div>
        </div>

        {/* Location/Platform */}
        <div className="space-y-2 mb-4">
          {event.format === 'physical' && event.physicalDetails && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4" />
              <span>{event.physicalDetails.location}</span>
            </div>
          )}

          {(event.format === 'online' || event.format === 'hybrid') && event.virtualDetails && (
            <div className="flex items-center space-x-2">
              <img
                src={platformIcons[event.virtualDetails.platform]}
                alt={getPlatformName(event.virtualDetails.platform)}
                className="w-4 h-4"
              />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[event.virtualDetails.platform]}`}>
                {getPlatformName(event.virtualDetails.platform)}
              </span>
              {event.virtualDetails.recording && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Eye className="w-3 h-3" />
                  <span>Recording</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        {countdown && !countdown.hasEnded && (
          <div className="mb-4">
            {countdown.isLive ? (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Event is live now!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4" />
                <span>Starts in {formatCountdown(countdown.timeUntil)}</span>
              </div>
            )}
          </div>
        )}

        {/* Attendees */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Users className="w-4 h-4" />
            <span>{event.currentAttendees.total} attending</span>
            {event.format === 'hybrid' && (
              <span className="text-xs">
                ({event.currentAttendees.inPerson} in-person, {event.currentAttendees.online} online)
              </span>
            )}
          </div>
          {event.maxAttendees && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {event.currentAttendees.total}/{event.maxAttendees}
            </span>
          )}
        </div>

        {/* Organizer */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Organized by {event.organizerName}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {countdown?.isLive || canJoin ? (
            <button
              onClick={() => onJoinEvent(event.id)}
              className={`w-full min-h-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${countdown?.isLive ? 'animate-pulse' : ''}`}
            >
              <Play className="w-4 h-4 mr-2 inline" />
              {countdown?.isLive ? 'Join Now' : 'Join Event'}
            </button>
          ) : userRSVP?.confirmed ? (
            <div className="w-full px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg text-center font-medium">
              <div className="flex items-center justify-center space-x-2">
                <Star className="w-4 h-4" />
                <span>RSVP Confirmed ({userRSVP.type === 'in-person' ? 'In-Person' : 'Online'})</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onViewDetails(event.id)}
              className="w-full min-h-10 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 mr-2 inline" />
              View Details & RSVP
            </button>
          )}

          {/* Join Link (for online events 30 mins before) */}
          {(event.format === 'online' || event.format === 'hybrid') && canJoin && (
            <div className="text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Join link available 30 minutes before start
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
