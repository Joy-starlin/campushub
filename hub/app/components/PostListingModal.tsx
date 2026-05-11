'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon, Upload, MapPin, Phone, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface PostListingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateListingData) => void
}

interface CreateListingData {
  title: string
  category: string
  price: number
  currency: 'UGX' | 'USD'
  condition: 'New' | 'Good' | 'Fair'
  description: string
  images: File[]
  location: string
  contactPreference: 'chat' | 'whatsapp' | 'phone'
}

const categories = [
  { value: 'Textbooks', label: 'Textbooks' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Food', label: 'Food' },
  { value: 'Services', label: 'Services' },
  { value: 'Accommodation', label: 'Accommodation' },
  { value: 'Transport', label: 'Transport' }
]

const conditions = [
  { value: 'New', label: 'New' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' }
]

const contactOptions = [
  { value: 'chat', label: 'In-App Chat', icon: MessageCircle },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'phone', label: 'Phone', icon: Phone }
]

export default function PostListingModal({ isOpen, onClose, onSubmit }: PostListingModalProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [detectedLocation, setDetectedLocation] = useState('Main Campus')
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateListingData>()

  const watchedImages = watch('images') || []

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      const currentImages = watchedImages || []
      const newImages = [...currentImages, ...acceptedFiles].slice(0, 5)
      setValue('images', newImages)
      
      // Generate previews for new images
      acceptedFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  })

  const handleFormSubmit = async (data: CreateListingData) => {
    try {
      await onSubmit(data)
      toast.success('Listing posted successfully!')
      reset()
      setImagePreviews([])
      onClose()
    } catch (error) {
      toast.error('Failed to post listing')
    }
  }

  const removeImage = (index: number) => {
    const newImages = watchedImages.filter((_, i) => i !== index)
    setValue('images', newImages)
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const detectLocation = () => {
    // Simulate location detection
    setDetectedLocation('Main Campus - Student Center')
    setValue('location', detectedLocation)
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
              <h2 className="text-xl font-semibold text-gray-900">Post New Listing</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="What are you selling?"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Category and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="flex space-x-2">
                    <select
                      {...register('currency')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="UGX">UGX</option>
                      <option value="USD">USD</option>
                    </select>
                    <input
                      type="number"
                      {...register('price', { required: 'Price is required', min: 0 })}
                      placeholder="0"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <div className="flex space-x-4">
                  {conditions.map(condition => (
                    <label key={condition.value} className="flex items-center">
                      <input
                        type="radio"
                        {...register('condition', { required: 'Condition is required' })}
                        value={condition.value}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{condition.label}</span>
                    </label>
                  ))}
                </div>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
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
                  placeholder="Describe your item in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (up to 5)
                </label>
                <div className="space-y-4">
                  {/* Upload Area */}
                  {(watchedImages || []).length < 5 && (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {isDragActive
                          ? 'Drop the images here'
                          : 'Drag & drop images here, or click to select'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                  )}

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                    placeholder="Enter location"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Detect
                  </button>
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              {/* Contact Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Preference *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {contactOptions.map(option => {
                    const Icon = option.icon
                    return (
                      <label key={option.value} className="relative">
                        <input
                          type="radio"
                          {...register('contactPreference', { required: 'Contact preference is required' })}
                          value={option.value}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                          <Icon className="w-5 h-5 mb-1 text-gray-600" />
                          <span className="text-xs text-gray-700">{option.label}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
                {errors.contactPreference && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPreference.message}</p>
                )}
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
                  {isSubmitting ? 'Posting...' : 'Post Listing'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
