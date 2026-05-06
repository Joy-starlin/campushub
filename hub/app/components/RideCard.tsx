'use client'

import { motion } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  Bike, 
  Bus, 
  Truck,
  Repeat,
  CheckCircle,
  MessageCircle,
  Phone
} from 'lucide-react'
import { Ride, User } from '../types/rides'
import { ResponsiveButton } from './ResponsiveForm'

interface RideCardProps {
  ride: Ride
  onRequestSeat?: (rideId: string) => void
}

export default function RideCard({ ride, onRequestSeat }: RideCardProps) {
  const user = ride.type === 'offering' ? ride.driver : ride.passenger
  const isDriver = ride.type === 'offering'

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <Car className="w-4 h-4" />
      case 'boda':
        return <Bike className="w-4 h-4" />
      case 'matatu':
        return <Truck className="w-4 h-4" />
      case 'bus':
        return <Bus className="w-4 h-4" />
      default:
        return <Car className="w-4 h-4" />
    }
  }

  const getVehicleColor = (type: string) => {
    switch (type) {
      case 'car':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'boda':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'matatu':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'bus':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getRecurringColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'weekly':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return ''
    }
  }

  const renderSeatIndicators = () => {
    const totalSeats = ride.seatsAvailable + ride.seatsTaken
    const seats = []
    
    for (let i = 0; i < totalSeats; i++) {
      const isTaken = i < ride.seatsTaken
      seats.push(
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            isTaken 
              ? 'bg-gray-400 dark:bg-gray-600' 
              : 'bg-green-500 dark:bg-green-400'
          }`}
          title={isTaken ? 'Taken' : 'Available'}
        />
      )
    }
    
    return (
      <div className="flex items-center space-x-1">
        <Users className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
        {seats}
        <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
          {ride.seatsAvailable} left
        </span>
      </div>
    )
  }

  const formatPrice = (price: { UGX: number; USD?: number }) => {
    if (price.USD) {
      return `UGX ${price.UGX.toLocaleString()} (~$${price.USD})`
    }
    return `UGX ${price.UGX.toLocaleString()}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow"
    >
      {/* Header with user info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
            )}
            {user?.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {user?.name}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isDriver ? 'Driver' : 'Passenger'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              {ride.contactMethod === 'whatsapp' ? (
                <Phone className="w-3 h-3" />
              ) : (
                <MessageCircle className="w-3 h-3" />
              )}
              <span>{ride.contactMethod === 'whatsapp' ? 'WhatsApp' : 'In-app'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Vehicle type badge */}
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getVehicleColor(ride.vehicleType)}`}>
            {getVehicleIcon(ride.vehicleType)}
            <span className="ml-1 capitalize">{ride.vehicleType}</span>
          </span>
          
          {/* Recurring badge */}
          {ride.recurring && ride.recurring !== 'one-time' && (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRecurringColor(ride.recurring)}`}>
              <Repeat className="w-3 h-3 mr-1" />
              {ride.recurring}
            </span>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-900 dark:text-white font-medium">
              {ride.from.address}
            </span>
          </div>
        </div>
        <div className="flex items-center text-gray-400 dark:text-gray-500">
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mx-1"></div>
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end space-x-2 text-sm">
            <span className="text-gray-900 dark:text-white font-medium">
              {ride.to.address}
            </span>
            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </div>

      {/* Date, time, and seats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(ride.date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{ride.departureTime}</span>
          </div>
        </div>
        
        {ride.type === 'offering' && renderSeatIndicators()}
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {isDriver ? formatPrice(ride.pricePerSeat) : 
           ride.maxPrice ? `Max: ${formatPrice(ride.maxPrice)}` : 'Price negotiable'}
        </div>
        {ride.type === 'requesting' && ride.isFlexible && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Time and price flexible
          </div>
        )}
      </div>

      {/* Notes */}
      {ride.notes && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {ride.notes}
          </p>
        </div>
      )}

      {/* Action button */}
      <ResponsiveButton
        variant="primary"
        fullWidth
        onClick={() => onRequestSeat?.(ride.id)}
        className="min-h-11"
      >
        {isDriver ? 'Request Seat' : 'Offer Ride'}
      </ResponsiveButton>
    </motion.div>
  )
}
