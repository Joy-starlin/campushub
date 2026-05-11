'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon, Upload, MapPin, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface PostLostFoundModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateLostFoundData) => void
}

interface CreateLostFoundData {
  type: 'lost' | 'found'
  itemName: string
  description: string
  category: 'Electronics' | 'Clothing' | 'Documents' | 'Keys' | 'Wallet' | 'Other'
  image?: File
  location: string
  dateOccurred: string
  contactMethod: 'email' | 'phone'
  contactInfo: string
  isAnonymous: boolean
}

const categories = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Documents', label: 'Documents' },
  { value: 'Keys', label: 'Keys' },
  { value: 'Wallet', label: 'Wallet' },
  { value: 'Other', label: 'Other' }
]

export default function PostLostFoundModal({ isOpen, onClose, onSubmit }: PostLostFoundModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showContactInfo, setShowContactInfo] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateLostFoundData>({
    defaultValues: {
      type: 'lost',
      isAnonymous: false
    }
  })

  const watchedType = watch('type')
  const watchedImage = watch('image')
  const watchedIsAnonymous = watch('isAnonymous')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setValue('image', file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  })

  const handleFormSubmit = async (data: CreateLostFoundData) => {
    try {
      await onSubmit(data)
      toast.success(`${watchedType === 'lost' ? 'Lost' : 'Found'} item posted successfully!`)
      reset()
      setImagePreview(null)
      onClose()
    } catch (error) {
      toast.error('Failed to post item')
    }
  }

  const removeImage = () => {
    setValue('image', undefined)
    setImagePreview(null)
  }

  const toggleType = () => {
    const newType = watchedType === 'lost' ? 'found' : 'lost'
    setValue('type', newType)
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
            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Post Lost & Found Item</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
              {/* Type Toggle */}
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setValue('type', 'lost')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    watchedType === 'lost'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  I lost something
                </button>
                <button
                  type="button"
                  onClick={() => setValue('type', 'found')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    watchedType === 'found'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  I found something
                </button>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  {...register('itemName', { required: 'Item name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Black leather wallet, iPhone 13, etc."
                />
                {errors.itemName && (
                  <p className="mt-1 text-sm text-red-600">{errors.itemName.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder={`Provide details about the ${watchedType} item...`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo (optional)
                </label>
                {!imagePreview ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {isDragActive
                        ? 'Drop the image here'
                        : 'Click to upload photo'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Item preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    {...register('location', { required: 'Location is required' })}
                    placeholder={watchedType === 'lost' ? 'Where you last saw it' : 'Where you found it'}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Pin on Map
                  </button>
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date {watchedType === 'lost' ? 'Lost' : 'Found'} *
                </label>
                <input
                  type="date"
                  {...register('dateOccurred', { required: 'Date is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {errors.dateOccurred && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOccurred.message}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Method *
                  </label>
                  <select
                    {...register('contactMethod', { required: 'Contact method is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select contact method</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                  {errors.contactMethod && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactMethod.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Information *
                  </label>
                  <div className="relative">
                    <input
                      type={showContactInfo ? 'text' : 'password'}
                      {...register('contactInfo', { required: 'Contact information is required' })}
                      placeholder={watch('contactMethod') === 'email' ? 'your.email@example.com' : '+256 700 000 000'}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowContactInfo(!showContactInfo)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showContactInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.contactInfo && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
                  )}
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Post Anonymously</label>
                  <p className="text-xs text-gray-500">Your name will be hidden from other users</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('isAnonymous', !watchedIsAnonymous)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      watchedIsAnonymous ? 'translate-x-6 bg-blue-600' : 'translate-x-1'
                    }`}
                  />
                  <div className={`absolute inset-0 rounded-full ${
                    watchedIsAnonymous ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : `Post ${watchedType === 'lost' ? 'Lost' : 'Found'} Item`}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
