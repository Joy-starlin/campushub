'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, GraduationCap, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import ResponsiveContainer from '../../components/ResponsiveContainer'
import ResponsiveForm from '../../components/ResponsiveForm'

const completeProfileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  university: z.string().min(2, 'Please enter your university'),
  course: z.string().min(2, 'Please enter your course'),
  year: z.string().min(1, 'Please select your year')
})

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>

const universities = [
  'Bugema University',
  'Makerere University',
  'Uganda Christian University',
  'Kampala International University',
  'Ndejje University',
  'Uganda Martyrs University',
  'Other'
]

const years = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Graduate',
  'Faculty'
]

export default function CompleteProfilePage() {
  const router = useRouter()
  const { user, updateUserProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      university: '',
      course: '',
      year: ''
    }
  })

  const selectedUniversity = watch('university')

  const onSubmit = async (data: CompleteProfileFormData) => {
    setIsSubmitting(true)
    try {
      await updateUserProfile({
        ...data,
        isProfileComplete: true
      })
      setIsSuccess(true)
      toast.success('Profile completed successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
        <ResponsiveContainer maxWidth="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-8 sm:p-12">
              {/* Success Icon */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Bugema Hub!</h1>
                <p className="text-gray-600">
                  Your profile has been set up successfully. You're ready to connect with your campus community.
                </p>
              </div>

              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">What's next?</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Explore clubs and events on campus</li>
                      <li>• Connect with fellow students</li>
                      <li>• Buy and sell items in the marketplace</li>
                      <li>• Share your thoughts and experiences</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGoToDashboard}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors min-h-11"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <ResponsiveContainer maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
              <p className="text-gray-600">
                Tell us a bit about yourself to get started with Bugema Hub
              </p>
            </div>

            {/* Profile Form */}
            <ResponsiveForm>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('displayName')}
                      type="text"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-11 ${
                        errors.displayName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.displayName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.displayName.message}
                    </p>
                  )}
                </div>

                {/* University */}
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                    University
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...register('university')}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-11 appearance-none bg-white ${
                        errors.university ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select your university</option>
                      {universities.map((university) => (
                        <option key={university} value={university}>
                          {university}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.university && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.university.message}
                    </p>
                  )}
                </div>

                {/* Course */}
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                    Course of Study
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('course')}
                      type="text"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-11 ${
                        errors.course ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Computer Science, Business Administration"
                    />
                  </div>
                  {errors.course && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.course.message}
                    </p>
                  )}
                </div>

                {/* Year */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...register('year')}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-11 appearance-none bg-white ${
                        errors.year ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select your year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.year && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.year.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-11"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Complete Profile'
                  )}
                </button>
              </form>
            </ResponsiveForm>

            {/* Help Text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                You can update this information later in your profile settings.
              </p>
            </div>
          </div>
        </motion.div>
      </ResponsiveContainer>
    </div>
  )
}
