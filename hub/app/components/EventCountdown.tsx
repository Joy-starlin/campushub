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
  Zap,
  Bell,
  Share,
  ExternalLink
} from 'lucide-react'
import Countdown from 'react-countdown'
import { VirtualEvent } from '../types/virtual-events'

interface EventCountdownProps {
  event: VirtualEvent
  className?: string
  onJoin?: () => void
  onSetReminder?: () => void
  onShare?: () => void
  showActions?: boolean
}

export default function EventCountdown({
  event,
  className = '',
  onJoin,
  onSetReminder,
  onShare,
  showActions = true
}: EventCountdownProps) {
  const [timeUntilEvent, setTimeUntilEvent] = useState<ReturnType<typeof calculateTimeUntil> | null>(null)
  const [isEventLive, setIsEventLive] = useState(false)
  const [hasEventEnded, setHasEventEnded] = useState(false)
  const [reminderSet, setReminderSet] = useState(false)

  function calculateTimeUntil(eventDate: string, eventTime: string) {
    const now = new Date()
    const eventDateTime = new Date(`${eventDate}T${eventTime}`)
    
    if (eventDateTime <= now) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isPast: true
      }
    }
    
    const diff = eventDateTime.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    return {
      days,
      hours,
      minutes,
      seconds,
      total: diff,
      isPast: false
    }
  }

  useEffect(() => {
    const updateTime = () => {
      const timeData = calculateTimeUntil(event.startDate, event.startTime)
      setTimeUntilEvent(timeData)
      
      // Check if event is live
      const now = new Date()
      const eventStart = new Date(`${event.startDate}T${event.startTime}`)
      const eventEnd = new Date(`${event.endDate}T${event.endTime}`)
      
      setIsEventLive(now >= eventStart && now <= eventEnd)
      setHasEventEnded(now > eventEnd)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [event])

  const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return <div className="text-center">Event has ended</div>
    }

    return (
      <div className="flex items-center justify-center space-x-4">
        {days > 0 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{days}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">days</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{hours}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{minutes}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">minutes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{seconds}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">seconds</div>
        </div>
      </div>
    )
  }

  const getEventStatus = () => {
    if (hasEventEnded) return 'ended'
    if (isEventLive) return 'live'
    if (timeUntilEvent && timeUntilEvent.total < 30 * 60 * 1000) return 'starting-soon'
    return 'upcoming'
  }

  const getStatusColor = () => {
    switch (getEventStatus()) {
      case 'live':
        return 'bg-red-500 text-white'
      case 'starting-soon':
        return 'bg-orange-500 text-white'
      case 'ended':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-blue-500 text-white'
    }
  }

  const getStatusText = () => {
    switch (getEventStatus()) {
      case 'live':
        return 'LIVE NOW'
      case 'starting-soon':
        return 'STARTING SOON'
      case 'ended':
        return 'ENDED'
      default:
        return 'UPCOMING'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google-meet':
        return <Video className="w-4 h-4" />
      case 'zoom':
        return <Monitor className="w-4 h-4" />
      case 'microsoft-teams':
        return <Users className="w-4 h-4" />
      default:
        return <Video className="w-4 h-4" />
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header with status */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              {event.format === 'online' || event.format === 'hybrid' ? (
                getPlatformIcon(event.virtualDetails?.platform || 'google-meet')
              ) : (
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {event.organizerName}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            <div className="flex items-center space-x-1">
              {getEventStatus() === 'live' && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
              <span>{getStatusText()}</span>
            </div>
          </div>
        </div>

        {/* Event details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          {event.format === 'physical' || event.format === 'hybrid' ? (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4" />
              <span>{event.physicalDetails?.location}</span>
            </div>
          ) : null}
          {event.format === 'online' || event.format === 'hybrid' ? (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Video className="w-4 h-4" />
              <span>{event.virtualDetails?.platform?.replace('-', ' ').toUpperCase()}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Countdown */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6">
        {getEventStatus() === 'ended' ? (
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              This event has ended
            </div>
            {event.virtualDetails?.recording && (
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <Video className="w-4 h-4" />
                <span>Recording available</span>
              </div>
            )}
          </div>
        ) : isEventLive ? (
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 dark:text-red-400 font-medium">Event is LIVE</span>
              </div>
            </div>
            {showActions && onJoin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onJoin}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <div className="flex items-center space-x-2">
                  <Video className="w-5 h-5" />
                  <span>Join Now</span>
                </div>
              </motion.button>
            )}
          </div>
        ) : timeUntilEvent ? (
          <div>
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {timeUntilEvent.days > 0 ? 'Starts in:' : 'Starts today in:'}
              </h4>
              <Countdown
                date={new Date(`${event.startDate}T${event.startTime}`)}
                renderer={renderer}
              />
            </div>
            
            {showActions && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {timeUntilEvent.total < 30 * 60 * 1000 && onJoin && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onJoin}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Join Now</span>
                    </div>
                  </motion.button>
                )}
                
                {onSetReminder && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSetReminder}
                    className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                      reminderSet
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>{reminderSet ? 'Reminder Set' : 'Set Reminder'}</span>
                    </div>
                  </motion.button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Loading countdown...
          </div>
        )}
      </div>

      {/* Footer with actions */}
      {showActions && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{event.currentAttendees?.total || 0} attending</span>
              </div>
              {event.format === 'online' || event.format === 'hybrid' ? (
                <div className="flex items-center space-x-1">
                  <Video className="w-4 h-4" />
                  <span>Virtual</span>
                </div>
              ) : null}
            </div>
            
            <div className="flex items-center space-x-2">
              {onShare && (
                <button
                  onClick={onShare}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Share event"
                >
                  <Share className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              {event.virtualDetails?.joinLink && (
                <a
                  href={event.virtualDetails.joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact countdown component for cards
export function CompactEventCountdown({
  event,
  className = ''
}: {
  event: VirtualEvent
  className?: string
}) {
  const [timeUntilEvent, setTimeUntilEvent] = useState<ReturnType<typeof calculateTimeUntil> | null>(null)
  const [isEventLive, setIsEventLive] = useState(false)

  function calculateTimeUntil(eventDate: string, eventTime: string) {
    const now = new Date()
    const eventDateTime = new Date(`${eventDate}T${eventTime}`)
    
    if (eventDateTime <= now) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isPast: true
      }
    }
    
    const diff = eventDateTime.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return {
      days,
      hours,
      minutes,
      seconds: 0,
      total: diff,
      isPast: false
    }
  }

  useEffect(() => {
    const updateTime = () => {
      const timeData = calculateTimeUntil(event.startDate, event.startTime)
      setTimeUntilEvent(timeData)
      
      const now = new Date()
      const eventStart = new Date(`${event.startDate}T${event.startTime}`)
      const eventEnd = new Date(`${event.endDate}T${event.endTime}`)
      
      setIsEventLive(now >= eventStart && now <= eventEnd)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [event])

  if (!timeUntilEvent) return null

  const formatTimeLeft = () => {
    if (isEventLive) return 'LIVE NOW'
    if (timeUntilEvent.isPast) return 'ENDED'
    
    if (timeUntilEvent.days > 0) {
      return `${timeUntilEvent.days}d ${timeUntilEvent.hours}h`
    } else if (timeUntilEvent.hours > 0) {
      return `${timeUntilEvent.hours}h ${timeUntilEvent.minutes}m`
    } else {
      return `${timeUntilEvent.minutes}m`
    }
  }

  const getStatusColor = () => {
    if (isEventLive) return 'text-red-600 dark:text-red-400'
    if (timeUntilEvent.isPast) return 'text-gray-500'
    if (timeUntilEvent.total < 30 * 60 * 1000) return 'text-orange-600 dark:text-orange-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${getStatusColor()} ${className}`}>
      <Clock className="w-4 h-4" />
      <span className="font-medium">{formatTimeLeft()}</span>
    </div>
  )
}
