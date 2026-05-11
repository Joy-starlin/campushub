'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Image as ImageIcon, 
  Calendar, 
  Clock, 
  MapPin, 
  Globe, 
  Users, 
  Video, 
  Monitor, 
  Settings,
  Link,
  Shield,
  Camera,
  Plus,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { EventFormat, VirtualPlatform } from '../types/virtual-events'

interface VirtualEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: VirtualEventData) => void
}

interface VirtualEventData {
  title: string
  description: string
  fullDescription: string
  date: string
  time: string
  timezone: string
  category: 'Academic' | 'Social' | 'Sports' | 'Cultural' | 'Career'
  format: EventFormat
  physicalLocation?: string
  virtualPlatform?: VirtualPlatform
  googleMeetLink?: string
  zoomLink?: string
  zoomMeetingId?: string
  zoomPasscode?: string
  customLink?: string
  waitingRoom: boolean
  recording: boolean
  maxOnlineAttendees?: number
  maxAttendees?: number
  bannerImage?: File
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Africa/Nairobi'
]

const categories = [
  { value: 'Academic', label: 'Academic' },
  { value: 'Social', label: 'Social' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Cultural', label: 'Cultural' },
  { value: 'Career', label: 'Career' }
]

const virtualPlatforms: { value: VirtualPlatform; label: string; icon: string }[] = [
  { value: 'google-meet', label: 'Google Meet', icon: 'google' },
  { value: 'zoom', label: 'Zoom', icon: 'zoom' },
  { value: 'microsoft-teams', label: 'Microsoft Teams', icon: 'microsoft' },
  { value: 'custom', label: 'Custom Link', icon: 'link' }
]

export default function VirtualEventModal({ isOpen, onClose, onSubmit }: VirtualEventModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isGeneratingMeet, setIsGeneratingMeet] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<VirtualEventData>({
    defaultValues: {
      format: 'physical',
      waitingRoom: false,
      recording: false
    }
  })

  const format = watch('format')
  const virtualPlatform = watch('virtualPlatform')
  const watchedImage = watch('bannerImage')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setValue('bannerImage', file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  })

  const handleFormSubmit = async (data: VirtualEventData) => {
    try {
      await onSubmit(data)
      toast.success('Event created successfully!')
      reset()
      setImagePreview(null)
      onClose()
    } catch (error) {
      toast.error('Failed to create event')
    }
  }

  const generateGoogleMeetLink = async () => {
    setIsGeneratingMeet(true)
    try {
      // Simulate API call to Google Calendar API
      await new Promise(resolve => setTimeout(resolve, 2000))
      const meetLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`
      setValue('googleMeetLink', meetLink)
      toast.success('Google Meet link generated successfully!')
    } catch (error) {
      toast.error('Failed to generate Google Meet link')
    } finally {
      setIsGeneratingMeet(false)
    }
  }

  const removeImage = () => {
    setValue('bannerImage', undefined)
    setImagePreview(null)
  }

  const getPlatformIcon = (platform: VirtualPlatform) => {
    const platformData = virtualPlatforms.find(p => p.value === platform)
    return platformData?.icon || 'video'
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Event</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                    placeholder="Enter event title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of your event"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Full Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Description
                  </label>
                  <textarea
                    {...register('fullDescription')}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none dark:bg-gray-700 dark:text-white"
                    placeholder="Detailed description of your event"
                  />
                </div>

                {/* Date and Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    {...register('time', { required: 'Time is required' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                  />
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                  )}
                </div>

                {/* Timezone */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone *
                  </label>
                  <select
                    {...register('timezone', { required: 'Timezone is required' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select timezone</option>
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                  {errors.timezone && (
                    <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                {/* Event Format */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Format *
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="relative flex items-center justify-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="radio"
                        {...register('format', { required: 'Format is required' })}
                        value="physical"
                        className="sr-only"
                      />
                      <div className="text-center">
                        <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Physical</span>
                      </div>
                    </label>
                    <label className="relative flex items-center justify-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="radio"
                        {...register('format', { required: 'Format is required' })}
                        value="online"
                        className="sr-only"
                      />
                      <div className="text-center">
                        <Video className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Online</span>
                      </div>
                    </label>
                    <label className="relative flex items-center justify-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="radio"
                        {...register('format', { required: 'Format is required' })}
                        value="hybrid"
                        className="sr-only"
                      />
                      <div className="text-center">
                        <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Hybrid</span>
                      </div>
                    </label>
                  </div>
                  {errors.format && (
                    <p className="mt-1 text-sm text-red-600">{errors.format.message}</p>
                  )}
                </div>

                {/* Physical Location */}
                {(format === 'physical' || format === 'hybrid') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Physical Location *
                    </label>
                    <input
                      type="text"
                      {...register('physicalLocation', { required: 'Physical location is required' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                      placeholder="Enter physical location"
                    />
                    {errors.physicalLocation && (
                      <p className="mt-1 text-sm text-red-600">{errors.physicalLocation.message}</p>
                    )}
                  </div>
                )}

                {/* Virtual Platform */}
                {(format === 'online' || format === 'hybrid') && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Virtual Platform *
                      </label>
                      <select
                        {...register('virtualPlatform', { required: 'Virtual platform is required' })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select platform</option>
                        {virtualPlatforms.map((platform) => (
                          <option key={platform.value} value={platform.value}>{platform.label}</option>
                        ))}
                      </select>
                      {errors.virtualPlatform && (
                        <p className="mt-1 text-sm text-red-600">{errors.virtualPlatform.message}</p>
                      )}
                    </div>

                    {/* Platform-specific fields */}
                    {virtualPlatform === 'google-meet' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Google Meet Link
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            {...register('googleMeetLink')}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                          />
                          <button
                            type="button"
                            onClick={generateGoogleMeetLink}
                            disabled={isGeneratingMeet}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGeneratingMeet ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Generating...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Plus className="w-4 h-4" />
                                <span>Generate</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {virtualPlatform === 'zoom' && (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Zoom Link *
                          </label>
                          <input
                            type="url"
                            {...register('zoomLink', { required: 'Zoom link is required' })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="https://zoom.us/j/xxxxxxxxx"
                          />
                          {errors.zoomLink && (
                            <p className="mt-1 text-sm text-red-600">{errors.zoomLink.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Meeting ID
                          </label>
                          <input
                            type="text"
                            {...register('zoomMeetingId')}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="123 456 7890"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Passcode
                          </label>
                          <input
                            type="text"
                            {...register('zoomPasscode')}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                            placeholder="Optional passcode"
                          />
                        </div>
                      </>
                    )}

                    {virtualPlatform === 'custom' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Custom Link *
                        </label>
                        <input
                          type="url"
                          {...register('customLink', { required: 'Custom link is required' })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                          placeholder="https://example.com/meeting"
                        />
                        {errors.customLink && (
                          <p className="mt-1 text-sm text-red-600">{errors.customLink.message}</p>
                        )}
                      </div>
                    )}

                    {/* Virtual Event Settings */}
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Virtual Event Settings</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            {...register('waitingRoom')}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Enable Waiting Room</span>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            {...register('recording')}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-2">
                            <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Record Event</span>
                          </div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Online Attendees
                        </label>
                        <input
                          type="number"
                          {...register('maxOnlineAttendees')}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                          placeholder="Leave empty for unlimited"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Max Attendees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    {...register('maxAttendees')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                {/* Banner Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banner Image
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Banner preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-300">
                            {isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
