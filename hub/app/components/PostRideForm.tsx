'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Car, 
  Bike, 
  Bus, 
  Truck,
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Repeat,
  MessageCircle,
  Phone,
  AlertCircle
} from 'lucide-react'
import { Ride, VehicleType, RecurringType } from '../types/rides'
import ResponsiveForm from './ResponsiveForm'
import ResponsiveInput from './ResponsiveForm'
import ResponsiveTextarea from './ResponsiveForm'
import ResponsiveSelect from './ResponsiveForm'
import { ResponsiveButton } from './ResponsiveForm'

const offeringSchema = z.object({
  from: z.string().min(1, 'From location is required'),
  to: z.string().min(1, 'To location is required'),
  date: z.string().min(1, 'Date is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  seatsAvailable: z.number().min(1).max(7, 'Seats must be between 1 and 7'),
  pricePerSeatUGX: z.number().min(0, 'Price must be positive'),
  vehicleType: z.enum(['car', 'boda', 'matatu', 'bus']),
  recurring: z.enum(['one-time', 'daily', 'weekly']),
  contactMethod: z.enum(['whatsapp', 'in-app']),
  contactNumber: z.string().optional(),
  notes: z.string().optional()
})

const requestingSchema = z.object({
  from: z.string().min(1, 'From location is required'),
  to: z.string().min(1, 'To location is required'),
  date: z.string().min(1, 'Date is required'),
  departureTime: z.string().optional(),
  seatsNeeded: z.number().min(1).max(7, 'Seats must be between 1 and 7'),
  maxPriceUGX: z.number().min(0, 'Price must be positive'),
  isFlexible: z.boolean(),
  notes: z.string().optional()
})

type OfferingFormData = z.infer<typeof offeringSchema>
type RequestingFormData = z.infer<typeof requestingSchema>

interface PostRideFormProps {
  mode: 'offering' | 'requesting'
  onSubmit: (data: OfferingFormData | RequestingFormData) => void
  onCancel: () => void
}

export default function PostRideForm({ mode, onSubmit, onCancel }: PostRideFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {mode === 'offering' ? 'Offer a Ride' : 'Request a Ride'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </button>
      </div>

      <ResponsiveForm>
        {mode === 'offering' ? (
          <OfferingForm onSubmit={onSubmit} onCancel={onCancel} />
        ) : (
          <RequestingForm onSubmit={onSubmit} onCancel={onCancel} />
        )}
      </ResponsiveForm>
    </motion.div>
  )
}

function OfferingForm({ onSubmit, onCancel }: Omit<PostRideFormProps, 'mode'>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<OfferingFormData>({
    resolver: zodResolver(offeringSchema),
    defaultValues: {
      from: '',
      to: '',
      date: '',
      departureTime: '',
      seatsAvailable: 1,
      pricePerSeatUGX: 0,
      vehicleType: 'car',
      recurring: 'one-time',
      contactMethod: 'whatsapp',
      contactNumber: '',
      notes: ''
    }
  })

  const handleFormSubmit = async (data: OfferingFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            From
          </label>
          <input
            {...register('from')}
            type="text"
            placeholder="Enter pickup location"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.from && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.from.message}</p>
          )}
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            To
          </label>
          <input
            {...register('to')}
            type="text"
            placeholder="Enter destination"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.to && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.to.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 mr-1" />
            Date
          </label>
          <input
            {...register('date')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>
          )}
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4 mr-1" />
            Departure Time
          </label>
          <input
            {...register('departureTime')}
            type="time"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.departureTime && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.departureTime.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Users className="w-4 h-4 mr-1" />
            Seats Available
          </label>
          <input
            {...register('seatsAvailable', { valueAsNumber: true })}
            type="number"
            min="1"
            max="7"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.seatsAvailable && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.seatsAvailable.message}</p>
          )}
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Car className="w-4 h-4 mr-1" />
            Vehicle Type
          </label>
          <select
            {...register('vehicleType')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="car">Car</option>
            <option value="boda">Boda (Motorcycle)</option>
            <option value="matatu">Matatu (Minibus)</option>
            <option value="bus">Bus</option>
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <DollarSign className="w-4 h-4 mr-1" />
          Price per Seat (UGX)
        </label>
        <input
          {...register('pricePerSeatUGX', { valueAsNumber: true })}
          type="number"
          min="0"
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.pricePerSeatUGX && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pricePerSeatUGX.message}</p>
        )}
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Repeat className="w-4 h-4 mr-1" />
          Trip Type
        </label>
        <select
          {...register('recurring')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="one-time">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Contact Method
        </label>
        <select
          {...register('contactMethod')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="in-app">In-app messaging</option>
        </select>
        {watch('contactMethod') === 'whatsapp' && (
          <input
            {...register('contactNumber')}
            type="tel"
            placeholder="WhatsApp number (optional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Special Notes (Optional)
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="e.g., Meet at main gate, no smoking, music preference"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex space-x-3">
        <ResponsiveButton type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </ResponsiveButton>
        <ResponsiveButton type="submit" variant="primary" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Posting...' : 'Post Ride'}
        </ResponsiveButton>
      </div>
    </form>
  )
}

function RequestingForm({ onSubmit, onCancel }: Omit<PostRideFormProps, 'mode'>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RequestingFormData>({
    resolver: zodResolver(requestingSchema),
    defaultValues: {
      from: '',
      to: '',
      date: '',
      departureTime: '',
      seatsNeeded: 1,
      maxPriceUGX: 0,
      isFlexible: false,
      notes: ''
    }
  })

  const handleFormSubmit = async (data: RequestingFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            From
          </label>
          <input
            {...register('from')}
            type="text"
            placeholder="Enter pickup location"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.from && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.from.message}</p>
          )}
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            To
          </label>
          <input
            {...register('to')}
            type="text"
            placeholder="Enter destination"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.to && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.to.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 mr-1" />
            Date
          </label>
          <input
            {...register('date')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>
          )}
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4 mr-1" />
            Preferred Time (Optional)
          </label>
          <input
            {...register('departureTime')}
            type="time"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Users className="w-4 h-4 mr-1" />
            Seats Needed
          </label>
          <input
            {...register('seatsNeeded', { valueAsNumber: true })}
            type="number"
            min="1"
            max="7"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.seatsNeeded && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.seatsNeeded.message}</p>
          )}
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 mr-1" />
            Max Price (UGX)
          </label>
          <input
            {...register('maxPriceUGX', { valueAsNumber: true })}
            type="number"
            min="0"
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.maxPriceUGX && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxPriceUGX.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          {...register('isFlexible')}
          type="checkbox"
          id="flexible"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="flexible" className="text-sm text-gray-700 dark:text-gray-300">
          Time and price are flexible
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Special Notes (Optional)
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="e.g., Need space for luggage, prefer quiet ride"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex space-x-3">
        <ResponsiveButton type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </ResponsiveButton>
        <ResponsiveButton type="submit" variant="primary" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Posting...' : 'Post Request'}
        </ResponsiveButton>
      </div>
    </form>
  )
}

