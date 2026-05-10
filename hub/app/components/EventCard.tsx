'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { MapPin, Clock, Users, Check } from 'lucide-react'

export interface Event {
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
  requiresBooking?: boolean
  price?: number
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
  onBook: (event: Event) => void
}

const categoryColors = {
  Academic: 'bg-blue-100 text-blue-800',
  Social: 'bg-green-100 text-green-800',
  Sports: 'bg-orange-100 text-orange-800',
  Cultural: 'bg-purple-100 text-purple-800',
  Career: 'bg-red-100 text-red-800'
}

export default function EventCard({ event, onClick, onRSVP, onBook }: EventCardProps) {
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
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl"
      onClick={() => onClick(event)}
    >
      {/* Banner Image with Date Badge */}
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
        )}
        
        {/* Date Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-bold tracking-wide">
          {formatDateBadge(event.date)}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-sm bg-white/90 ${categoryColors[event.category]}`}>
            {event.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 leading-tight">
          {event.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-4" />

        {/* Location */}
        <div className="flex items-center text-sm text-gray-700 mb-3 font-medium">
          <div className="bg-blue-50 p-2 rounded-lg mr-3">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <span className="truncate">
            {event.isOnline ? 'Online Event' : event.location}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center text-sm text-gray-700 mb-4 font-medium">
          <div className="bg-purple-50 p-2 rounded-lg mr-3">
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <span>{formatTime(event.time)}</span>
        </div>

        {/* Attendees Section */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {displayAttendees.map((attendee, index) => (
                <div
                  key={attendee.id}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm"
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
            <div className="ml-3">
              <span className="text-sm font-semibold text-gray-800">
                {attendeesCount}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                going
              </span>
            </div>
          </div>

          {/* Max Attendees */}
          {event.maxAttendees && (
            <div className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200">
              {attendeesCount}/{event.maxAttendees}
            </div>
          )}
        </div>

        {/* RSVP/Book Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation()
            if (event.requiresBooking) {
              onBook(event)
            } else {
              handleRSVP(e)
            }
          }}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg ${
            isRSVPed
              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-200'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-blue-200'
          }`}
        >
          {event.requiresBooking ? (
            <div className="flex items-center justify-center">
              Book Now {event.price ? `(UGX ${event.price.toLocaleString()})` : ''}
            </div>
          ) : isRSVPed ? (
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
