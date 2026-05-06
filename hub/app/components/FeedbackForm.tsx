'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { 
  Building, 
  BookOpen, 
  Shield, 
  Users, 
  Bug, 
  Lightbulb, 
  MoreHorizontal,
  Camera,
  AlertTriangle,
  CheckCircle,
  Upload,
  X
} from 'lucide-react'
import { FeedbackCategory, Severity, CategoryInfo } from '../types/feedback'
import ResponsiveForm, { ResponsiveTextarea, ResponsiveButton } from './ResponsiveForm'
import StarRating from './StarRating'
import toast from 'react-hot-toast'

const feedbackSchema = z.object({
  rating: z.number().min(1, 'Please provide a rating').max(5),
  category: z.enum(['campus-facilities', 'academic-issues', 'safety-concern', 'club-event', 'website-bug', 'general-suggestion', 'other']),
  title: z.string().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
  severity: z.enum(['low', 'medium', 'urgent']).optional(),
  isUrgent: z.boolean(),
  imageFile: z.instanceof(File).optional()
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

interface FeedbackFormProps {
  onSubmit: (data: FeedbackFormData) => Promise<{ referenceCode: string }>
  onCancel?: () => void
}

const categories: CategoryInfo[] = [
  {
    id: 'campus-facilities',
    name: 'Campus Facilities',
    description: 'Issues with buildings, classrooms, dorms, cafeteria',
    icon: <Building className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    darkColor: 'dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
  },
  {
    id: 'academic-issues',
    name: 'Academic Issues',
    description: 'Problems with courses, professors, exams, schedules',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    darkColor: 'dark:bg-green-900 dark:text-green-200 dark:border-green-700'
  },
  {
    id: 'safety-concern',
    name: 'Safety Concern',
    description: 'Security issues, emergencies, safety hazards',
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-red-100 text-red-800 border-red-200',
    darkColor: 'dark:bg-red-900 dark:text-red-200 dark:border-red-700'
  },
  {
    id: 'club-event',
    name: 'Club or Event',
    description: 'Issues with student clubs, events, activities',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    darkColor: 'dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700'
  },
  {
    id: 'website-bug',
    name: 'Website/App Bug',
    description: 'Technical issues, bugs, feature requests',
    icon: <Bug className="w-6 h-6" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    darkColor: 'dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
  },
  {
    id: 'general-suggestion',
    name: 'General Suggestion',
    description: 'Ideas for improvement, general feedback',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    darkColor: 'dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-700'
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Anything else not covered above',
    icon: <MoreHorizontal className="w-6 h-6" />,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    darkColor: 'dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
  }
]

export default function FeedbackForm({ onSubmit, onCancel }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [referenceCode, setReferenceCode] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      category: 'campus-facilities',
      isUrgent: false
    }
  })

  const watchedCategory = watch('category')
  const watchedIsUrgent = watch('isUrgent')
  const watchedRating = watch('rating')

  const handleCategorySelect = (categoryId: FeedbackCategory) => {
    setSelectedCategory(categoryId)
    setValue('category', categoryId)
    
    // Auto-generate title if not provided
    const category = categories.find(c => c.id === categoryId)
    if (category && !getValues('title')) {
      setValue('title', `${category.name} - ${new Date().toLocaleDateString()}`)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      setValue('imageFile', file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setValue('imageFile', undefined)
    setImagePreview(null)
    setShowImageUpload(false)
  }

  const onFormSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true)
    try {
      const result = await onSubmit(data)
      setReferenceCode(result.referenceCode)
      toast.success('Feedback submitted anonymously. Thank you!')
      reset()
      setSelectedCategory(null)
      setImagePreview(null)
      setShowImageUpload(false)
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateTitle = (categoryId: FeedbackCategory) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? `${category.name} - ${new Date().toLocaleDateString()}` : ''
  }

  if (referenceCode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Feedback Submitted Successfully
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Your feedback has been submitted anonymously. Save this reference code to track your submission.
        </p>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reference Code</p>
          <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
            {referenceCode}
          </p>
        </div>
        <div className="flex space-x-3 justify-center">
          <ResponsiveButton
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(referenceCode)
              toast.success('Reference code copied to clipboard!')
            }}
          >
            Copy Code
          </ResponsiveButton>
          <ResponsiveButton
            variant="primary"
            onClick={() => {
              setReferenceCode(null)
              reset()
            }}
          >
            Submit Another
          </ResponsiveButton>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Submit Anonymous Feedback
        </h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your name, email, and account details will <strong>NOT</strong> be attached to this submission.
            </p>
          </div>
        </div>
      </div>

      <ResponsiveForm>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Experience Rating */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">
              Overall Experience *
            </label>
            <div className="flex justify-center">
              <StarRating 
                rating={watchedRating} 
                setRating={(val) => setValue('rating', val)} 
                size="lg"
              />
            </div>
            {errors.rating && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
                {errors.rating.message}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              {watchedRating === 5 && 'Excellent! 🚀'}
              {watchedRating === 4 && 'Great! 👍'}
              {watchedRating === 3 && 'Average 😐'}
              {watchedRating === 2 && 'Below average 😕'}
              {watchedRating === 1 && 'Poor 😞'}
              {watchedRating === 0 && 'Select a rating'}
            </p>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Select Category
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedCategory === category.id
                      ? `${category.color} ${category.darkColor} border-opacity-100`
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={selectedCategory === category.id ? '' : 'text-gray-600 dark:text-gray-400'}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{category.name}</h3>
                      <p className="text-xs mt-1 opacity-80">{category.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            <input
              {...register('category')}
              type="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title (Optional)
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder={generateTitle(watchedCategory)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <ResponsiveTextarea
              label="Description"
              value={watch('description') || ''}
              onChange={(val) => setValue('description', val)}
              placeholder="Please provide detailed information about your feedback..."
              rows={5}
              error={errors.description?.message}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {watch('description')?.length || 0}/1000 characters
            </div>
          </div>

          {/* Severity (for safety concerns) */}
          {watchedCategory === 'safety-concern' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity Level
              </label>
              <div className="flex space-x-3">
                {[
                  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
                  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
                  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
                ].map((severity) => (
                  <label
                    key={severity.value}
                    className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      watch('severity') === severity.value
                        ? `${severity.color} border-opacity-100`
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      {...register('severity')}
                      type="radio"
                      value={severity.value}
                      className="sr-only"
                    />
                    <div className="text-center font-medium text-sm">{severity.label}</div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Attach Image (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowImageUpload(!showImageUpload)}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showImageUpload ? 'Cancel' : 'Add Image'}
              </button>
            </div>

            {showImageUpload && (
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer mt-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Urgent Toggle */}
          <div>
            <label className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg cursor-pointer">
              <input
                {...register('isUrgent')}
                type="checkbox"
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-amber-900 dark:text-amber-100">
                    Mark as Urgent
                  </span>
                </div>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  This will prioritize your feedback for admin review
                </p>
              </div>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-6">
            {onCancel && (
              <ResponsiveButton
                type="button"
                variant="secondary"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </ResponsiveButton>
            )}
            <ResponsiveButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </ResponsiveButton>
          </div>
        </form>
      </ResponsiveForm>
    </motion.div>
  )
}
