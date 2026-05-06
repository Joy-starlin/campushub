'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  MapPin, 
  Video, 
  Monitor, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserPlus,
  Building,
  Wifi,
  Car
} from 'lucide-react'
import { VirtualEvent, VirtualEventRSVP, RSVPType } from '../types/virtual-events'
import toast from 'react-hot-toast'

interface HybridEventRSVPProps {
  event: VirtualEvent
  userRSVP?: VirtualEventRSVP
  currentAttendees: {
    total: number
    inPerson: number
    online: number
  }
  maxAttendees?: number
  maxOnlineAttendees?: number
  onRSVP: (type: RSVPType) => Promise<void>
  onCancelRSVP: () => Promise<void>
  onChangeRSVPType: (newType: RSVPType) => Promise<void>
}

export default function HybridEventRSVP({
  event,
  userRSVP,
  currentAttendees,
  maxAttendees,
  maxOnlineAttendees,
  onRSVP,
  onCancelRSVP,
  onChangeRSVPType
}: HybridEventRSVPProps) {
  const [selectedType, setSelectedType] = useState<RSVPType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCapacityWarning, setShowCapacityWarning] = useState(false)

  const handleRSVPSubmit = async (type: RSVPType) => {
    setIsSubmitting(true)
    try {
      await onRSVP(type)
      toast.success('RSVP confirmed successfully!')
    } catch (error) {
      toast.error('Failed to RSVP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelRSVP = async () => {
    setIsSubmitting(true)
    try {
      await onCancelRSVP()
      toast.success('RSVP cancelled')
    } catch (error) {
      toast.error('Failed to cancel RSVP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangeRSVPType = async (newType: RSVPType) => {
    setIsSubmitting(true)
    try {
      await onChangeRSVPType(newType)
      toast.success('RSVP type updated successfully!')
    } catch (error) {
      toast.error('Failed to update RSVP type. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCapacityStatus = (type: RSVPType) => {
    if (type === 'in-person') {
      const inPersonCapacity = maxAttendees ? maxAttendees - currentAttendees.online : Infinity
      const remaining = inPersonCapacity - currentAttendees.inPerson
      return {
        remaining,
        total: inPersonCapacity,
        percentage: inPersonCapacity > 0 ? (currentAttendees.inPerson / inPersonCapacity) * 100 : 0,
        isFull: remaining <= 0
      }
    } else {
      const onlineCapacity = maxOnlineAttendees || Infinity
      const remaining = onlineCapacity - currentAttendees.online
      return {
        remaining,
        total: onlineCapacity,
        percentage: onlineCapacity > 0 ? (currentAttendees.online / onlineCapacity) * 100 : 0,
        isFull: remaining <= 0
      }
    }
  }

  const inPersonCapacity = getCapacityStatus('in-person')
  const onlineCapacity = getCapacityStatus('online')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  if (userRSVP?.status === 'confirmed') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">You're Registered!</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {userRSVP.type === 'in-person' ? 'Attending in person' : 'Joining online'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancelRSVP}
            disabled={isSubmitting}
            className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel RSVP
          </button>
        </div>

        {/* Event Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
          </div>

          {userRSVP.type === 'in-person' && event.physicalDetails && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Location Details</h4>
                  <p className="text-blue-800 dark:text-blue-200">{event.physicalDetails.location}</p>
                  {event.physicalDetails.address && (
                    <p className="text-blue-800 dark:text-blue-200 text-sm mt-1">{event.physicalDetails.address}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {userRSVP.type === 'online' && event.virtualDetails && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Video className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Online Access</h4>
                  <p className="text-green-800 dark:text-green-200">
                    Join link will be available 30 minutes before the event starts
                  </p>
                  <p className="text-green-800 dark:text-green-200 text-sm mt-1">
                    Platform: {event.virtualDetails.platform.replace('-', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change RSVP Type */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Change Attendance Type</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleChangeRSVPType('in-person')}
              disabled={isSubmitting || userRSVP.type === 'in-person' || inPersonCapacity.isFull}
              className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">In-Person</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {inPersonCapacity.remaining} spots left
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleChangeRSVPType('online')}
              disabled={isSubmitting || userRSVP.type === 'online' || onlineCapacity.isFull}
              className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">Online</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {onlineCapacity.remaining} spots left
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
          <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose Attendance Type</h3>
          <p className="text-gray-600 dark:text-gray-300">
            This is a hybrid event - join in person or online
          </p>
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(event.startDate)}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Clock className="w-4 h-4" />
          <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
        </div>
      </div>

      {/* Attendance Options */}
      <div className="space-y-4">
        {/* In-Person Option */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Attend In-Person</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Join us at the venue for the full experience
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentAttendees.inPerson} attending
                </div>
                {maxAttendees && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {inPersonCapacity.remaining} spots left
                  </div>
                )}
              </div>
            </div>

            {/* Location Details */}
            {event.physicalDetails && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Building className="w-4 h-4" />
                  <span>{event.physicalDetails.location}</span>
                </div>
                {event.physicalDetails.address && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {event.physicalDetails.address}
                  </div>
                )}
              </div>
            )}

            {/* Capacity Bar */}
            {maxAttendees && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Capacity</span>
                  <span className="text-gray-900 dark:text-white">
                    {currentAttendees.inPerson} / {maxAttendees - currentAttendees.online}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${inPersonCapacity.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-300">
                <Wifi className="w-3 h-3" />
                <span>WiFi Available</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-300">
                <Car className="w-3 h-3" />
                <span>Parking Available</span>
              </div>
            </div>

            <button
              onClick={() => handleRSVPSubmit('in-person')}
              disabled={isSubmitting || inPersonCapacity.isFull}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Registering...' : inPersonCapacity.isFull ? 'Full' : 'Register In-Person'}
            </button>
          </div>
        </div>

        {/* Online Option */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Join Online</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Participate remotely from anywhere
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentAttendees.online} attending
                </div>
                {maxOnlineAttendees && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {onlineCapacity.remaining} spots left
                  </div>
                )}
              </div>
            </div>

            {/* Platform Details */}
            {event.virtualDetails && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Video className="w-4 h-4" />
                  <span>Platform: {event.virtualDetails.platform.replace('-', ' ').toUpperCase()}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Join link available 30 minutes before start
                </div>
                {event.virtualDetails.recording && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    📹 This event will be recorded
                  </div>
                )}
              </div>
            )}

            {/* Capacity Bar */}
            {maxOnlineAttendees && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Online Capacity</span>
                  <span className="text-gray-900 dark:text-white">
                    {currentAttendees.online} / {maxOnlineAttendees}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${onlineCapacity.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Online Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-300">
                <Users className="w-3 h-3" />
                <span>Live Chat</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-300">
                <Monitor className="w-3 h-3" />
                <span>Screen Sharing</span>
              </div>
              {event.virtualDetails?.recording && (
                <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-300">
                  <Video className="w-3 h-3" />
                  <span>Recording Available</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleRSVPSubmit('online')}
              disabled={isSubmitting || onlineCapacity.isFull}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Registering...' : onlineCapacity.isFull ? 'Full' : 'Register Online'}
            </button>
          </div>
        </div>
      </div>

      {/* Capacity Warning */}
      {(inPersonCapacity.isFull || onlineCapacity.isFull) && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {inPersonCapacity.isFull && onlineCapacity.isFull
                  ? 'Both in-person and online attendance are full'
                  : inPersonCapacity.isFull
                  ? 'In-person attendance is full'
                  : 'Online attendance is full'}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Join the waitlist or check back later for available spots
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
