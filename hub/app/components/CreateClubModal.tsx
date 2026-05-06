'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon, Upload, Crown, UserCheck, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateClubModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateClubData) => void
}

interface CreateClubData {
  name: string
  category: 'Academic' | 'Sports' | 'Arts' | 'Technology' | 'Religious' | 'Community' | 'International'
  description: string
  fullDescription: string
  rules: string
  isPrivate: boolean
  logo?: File
  coverImage?: File
  president: string
  vicePresident: string
  secretary: string
}

const categories = [
  { value: 'Academic', label: 'Academic' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Religious', label: 'Religious' },
  { value: 'Community', label: 'Community' },
  { value: 'International', label: 'International' }
]

// Mock members for leader selection
const mockMembers = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@bugema.edu' },
  { id: '2', name: 'Mike Chen', email: 'mike.c@bugema.edu' },
  { id: '3', name: 'Emily Davis', email: 'emily.d@bugema.edu' },
  { id: '4', name: 'Alex Kim', email: 'alex.k@bugema.edu' },
  { id: '5', name: 'Jordan Lee', email: 'jordan.l@bugema.edu' }
]

export default function CreateClubModal({ isOpen, onClose, onSubmit }: CreateClubModalProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateClubData>()

  const watchedLogo = watch('logo')
  const watchedCover = watch('coverImage')

  // Logo dropzone
  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setValue('logo', file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setLogoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  })

  // Cover image dropzone
  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setValue('coverImage', file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setCoverPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  })

  const handleFormSubmit = async (data: CreateClubData) => {
    try {
      await onSubmit(data)
      toast.success('Club created successfully!')
      reset()
      setLogoPreview(null)
      setCoverPreview(null)
      onClose()
    } catch (error) {
      toast.error('Failed to create club')
    }
  }

  const removeLogo = () => {
    setValue('logo', undefined)
    setLogoPreview(null)
  }

  const removeCover = () => {
    setValue('coverImage', undefined)
    setCoverPreview(null)
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
            className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Club</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Club Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Club name is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter club name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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

                {/* Privacy Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Type *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('isPrivate')}
                        value="false"
                        className="mr-2"
                        defaultChecked
                      />
                      <span>Public (anyone can join)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('isPrivate')}
                        value="true"
                        className="mr-2"
                      />
                      <span>Private (approval required)</span>
                    </label>
                  </div>
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <input
                    type="text"
                    {...register('description', { required: 'Short description is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Brief description for club cards"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Full Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    {...register('fullDescription', { required: 'Full description is required' })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="Detailed information about the club..."
                  />
                  {errors.fullDescription && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullDescription.message}</p>
                  )}
                </div>

                {/* Club Rules */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Rules
                  </label>
                  <textarea
                    {...register('rules')}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="Rules and guidelines for club members (optional)"
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Logo
                  </label>
                  {!logoPreview ? (
                    <div
                      {...getLogoRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isLogoDragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input {...getLogoInputProps()} />
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {isLogoDragActive
                          ? 'Drop the logo here'
                          : 'Click to upload logo'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 200x200px
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  {!coverPreview ? (
                    <div
                      {...getCoverRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isCoverDragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input {...getCoverInputProps()} />
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {isCoverDragActive
                          ? 'Drop the image here'
                          : 'Click to upload cover image'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 1200x400px
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-32 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeCover}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Leadership Selection */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                    Club Leadership
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* President */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        President *
                      </label>
                      <select
                        {...register('president', { required: 'President is required' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select president</option>
                        {mockMembers.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                      {errors.president && (
                        <p className="mt-1 text-sm text-red-600">{errors.president.message}</p>
                      )}
                    </div>

                    {/* Vice President */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vice President *
                      </label>
                      <select
                        {...register('vicePresident', { required: 'Vice president is required' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select vice president</option>
                        {mockMembers.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                      {errors.vicePresident && (
                        <p className="mt-1 text-sm text-red-600">{errors.vicePresident.message}</p>
                      )}
                    </div>

                    {/* Secretary */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secretary *
                      </label>
                      <select
                        {...register('secretary', { required: 'Secretary is required' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select secretary</option>
                        {mockMembers.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                      {errors.secretary && (
                        <p className="mt-1 text-sm text-red-600">{errors.secretary.message}</p>
                      )}
                    </div>
                  </div>
                </div>
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
                  {isSubmitting ? 'Creating...' : 'Create Club'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
