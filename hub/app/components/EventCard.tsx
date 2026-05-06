'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { MapPin, Clock, Users, Check } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  date: Date
  time: string
  location: string
  isOnline: boolean
  category: 'Academic' | 'Social' | 'Sports' | 'Cultural' | 'Career'
  bannerImage?: string
  maxAttendees?: number
  currentAttendees: number
  attendees: Array<{
    id: string
    name: string
    avatar?: string
  }>
  organizer: {
    name: string
    role: string
  }
}

interface EventCardProps {
  event: Event
  onClick: (event: Event) => void
  onRSVP: (eventId: string) => void
}

const categoryColors = {
  Academic: 'bg-blue-100 text-blue-800',
  Social: 'bg-green-100 text-green-800',
  Sports: 'bg-orange-100 text-orange-800',
  Cultural: 'bg-purple-100 text-purple-800',
  Career: 'bg-red-100 text-red-800'
}

export default function EventCard({ event, onClick, onRSVP }: EventCardProps) {
  const [isRSVPed, setIsRSVPed] = useState(false)
  const [attendeesCount, setAttendeesCount] = useState(event.currentAttendees)

  const handleRSVP = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRSVPed(!isRSVPed)
    setAttendeesCount(isRSVPed ? attendeesCount - 1 : attendeesCount + 1)
    onRSVP(event.id)
  }

  const formatDateBadge = (date: Date) => {
    return format(date, 'EEE d').toUpperCase()
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const displayAttendees = event.attendees.slice(0, 3)
  const remainingAttendees = attendeesCount - displayAttendees.length

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200"
      onClick={() => onClick(event)}
    >
      {/* Banner Image with Date Badge */}
      <div className="relative h-48 bg-gray-200">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500" />
        )}
        
        {/* Date Badge */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {formatDateBadge(event.date)}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${categoryColors[event.category]}`}>
            {event.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {event.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="truncate">
            {event.isOnline ? 'Online Event' : event.location}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="w-4 h-4 mr-2" />
          <span>{formatTime(event.time)}</span>
        </div>

        {/* Attendees */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {displayAttendees.map((attendee, index) => (
                <div
                  key={attendee.id}
                  className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700"
                  style={{ zIndex: displayAttendees.length - index }}
                >
                  {attendee.avatar ? (
                    <img
                      src={attendee.avatar}
                      alt={attendee.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(attendee.name)
                  )}
                </div>
              ))}
            </div>
            {remainingAttendees > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                +{remainingAttendees} going
              </span>
            )}
          </div>

          {/* Max Attendees */}
          {event.maxAttendees && (
            <span className="text-xs text-gray-500">
              {attendeesCount}/{event.maxAttendees}
            </span>
          )}
        </div>

        {/* RSVP Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRSVP}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isRSVPed
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRSVPed ? (
            <div className="flex items-center justify-center">
              <Check className="w-4 h-4 mr-2" />
              Going
            </div>
          ) : (
            'RSVP'
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
