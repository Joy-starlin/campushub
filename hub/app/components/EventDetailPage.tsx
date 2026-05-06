'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { MapPin, Clock, Globe, Users, Share2, Calendar, MessageCircle } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  fullDescription?: string
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
    avatar?: string
  }
  googleMeetLink?: string
  timezone: string
}

interface Comment {
  id: string
  author: {
    name: string
    avatar?: string
  }
  content: string
  createdAt: Date
}

interface EventDetailPageProps {
  event: Event
  onRSVP: (eventId: string) => void
  onShare: (eventId: string) => void
}

const categoryColors = {
  Academic: 'bg-blue-100 text-blue-800',
  Social: 'bg-green-100 text-green-800',
  Sports: 'bg-orange-100 text-orange-800',
  Cultural: 'bg-purple-100 text-purple-800',
  Career: 'bg-red-100 text-red-800'
}

export default function EventDetailPage({ event, onRSVP, onShare }: EventDetailPageProps) {
  const [isRSVPed, setIsRSVPed] = useState(false)
  const [attendeesCount, setAttendeesCount] = useState(event.currentAttendees)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: { name: 'Sarah Johnson' },
      content: 'Looking forward to this event! See you all there.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      author: { name: 'Mike Chen' },
      content: 'Will there be parking available?',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  ])
  const [newComment, setNewComment] = useState('')

  const handleRSVP = () => {
    setIsRSVPed(!isRSVPed)
    setAttendeesCount(isRSVPed ? attendeesCount - 1 : attendeesCount + 1)
    onRSVP(event.id)
  }

  const handleShare = () => {
    onShare(event.id)
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: { name: 'You' },
        content: newComment,
        createdAt: new Date()
      }
      setComments([comment, ...comments])
      setNewComment('')
    }
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

  const getMapEmbedUrl = (location: string) => {
    const encodedLocation = encodeURIComponent(location)
    return `https://maps.google.com/maps?q=${encodedLocation}&t=&z=13&ie=UTF8&iwloc=&output=embed`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-64 md:h-96 bg-gray-200">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 w-full">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${categoryColors[event.category]}`}>
                    {event.category}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <p className="text-white text-opacity-90 max-w-2xl">
                  {event.description}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-3 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
              
              <div className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(event.date, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(event.time)} ({event.timezone})
                    </p>

                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-3">
                  {event.isOnline ? (
                    <Globe className="w-5 h-5 text-gray-400 mt-1" />
                  ) : (
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.isOnline ? 'Online Event' : event.location}
                    </p>
                    {event.isOnline && event.googleMeetLink && (
                      <a
                        href={event.googleMeetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Join Google Meet
                      </a>
                    )}
                  </div>
                </div>

                {/* Attendees */}
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {attendeesCount} {attendeesCount === 1 ? 'person' : 'people'} going
                    </p>
                    {event.maxAttendees && (
                      <p className="text-sm text-gray-600">
                        {event.maxAttendees - attendeesCount} spots left
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Description */}
              {event.fullDescription && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this event</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {event.fullDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Map (for in-person events) */}
            {!event.isOnline && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={getMapEmbedUrl(event.location)}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Comments ({comments.length})
              </h3>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">
                    YU
                  </div>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">
                      {(comment as any).avatar ? (
                        <img
                          src={(comment as any).avatar}
                          alt={comment.author.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(comment.author.name)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(comment.createdAt, 'h:mm a')}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h3>
              <div className="flex items-center space-x-3">
                {event.organizer.avatar ? (
                  <img
                    src={event.organizer.avatar}
                    alt={event.organizer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                    {getInitials(event.organizer.name)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{event.organizer.name}</p>
                  <p className="text-sm text-gray-500">{event.organizer.role}</p>
                </div>
              </div>
            </div>

            {/* RSVP Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRSVP}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isRSVPed
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRSVPed ? '✓ You\'re Going' : 'RSVP to Event'}
            </motion.button>

            {/* Attendee Avatars */}
            {event.attendees.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Who's Going</h3>
                <div className="space-y-3">
                  {event.attendees.slice(0, 5).map((attendee) => (
                    <div key={attendee.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
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
                      <span className="text-sm text-gray-700">{attendee.name}</span>
                    </div>
                  ))}
                  {attendeesCount > 5 && (
                    <p className="text-sm text-gray-500">
                      +{attendeesCount - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
