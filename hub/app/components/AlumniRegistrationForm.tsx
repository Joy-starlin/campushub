'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  X, 
  User,
  Briefcase,
  MapPin,
  GraduationCap,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { AlumniRegistration, Degree, Industry, MentorshipArea } from '../types/alumni'
import { ResponsiveButton } from './ResponsiveForm'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const alumniRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  graduationYear: z.number().min(1950, 'Please enter a valid year').max(new Date().getFullYear(), 'Year cannot be in the future'),
  degree: z.enum(['bachelor', 'master', 'phd', 'diploma', 'certificate', 'other']),
  course: z.string().min(1, 'Course of study is required'),
  university: z.string().min(1, 'University is required'),
  country: z.string().min(1, 'Country is required'),
  currentJobTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  industry: z.enum(['tech', 'finance', 'healthcare', 'education', 'ngo', 'consulting', 'marketing', 'sales', 'engineering', 'other']),
  linkedInProfile: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  isAvailableToMentor: z.boolean(),
  mentorshipAreas: z.array(z.enum(['career', 'academic', 'leadership', 'entrepreneurship', 'technical', 'research', 'other'])).min(1, 'Please select at least one mentorship area'),
  willPostOpportunities: z.boolean(),
  bio: z.string().optional()
})

type AlumniRegistrationFormData = z.infer<typeof alumniRegistrationSchema>

interface AlumniRegistrationFormProps {
  onSubmit: (data: AlumniRegistrationFormData & { verificationDocument?: File }) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

const countries = [
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Burundi',
  'Nigeria', 'Ghana', 'South Africa', 'Egypt', 'Morocco',
  'Ethiopia', 'Democratic Republic of Congo', 'Cameroon',
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Netherlands', 'Sweden', 'Denmark'
]

const degrees: { value: Degree; label: string }[] = [
  { value: 'bachelor', label: 'Bachelor\'s Degree' },
  { value: 'master', label: 'Master\'s Degree' },
  { value: 'phd', label: 'PhD / Doctorate' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'other', label: 'Other' }
]

const industries: { value: Industry; label: string }[] = [
  { value: 'tech', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'ngo', label: 'NGO/Non-profit' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'other', label: 'Other' }
]

const mentorshipAreas: { value: MentorshipArea; label: string }[] = [
  { value: 'career', label: 'Career Development' },
  { value: 'academic', label: 'Academic Support' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'technical', label: 'Technical Skills' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' }
]

export default function AlumniRegistrationForm({
  onSubmit,
  onCancel,
  isSubmitting = false
}: AlumniRegistrationFormProps) {
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null)
  const [selectedMentorshipAreas, setSelectedMentorshipAreas] = useState<MentorshipArea[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<AlumniRegistrationFormData>({
    resolver: zodResolver(alumniRegistrationSchema),
    defaultValues: {
      name: '',
      email: '',
      graduationYear: new Date().getFullYear() - 5,
      degree: 'bachelor',
      course: '',
      university: 'Bugema University',
      country: '',
      currentJobTitle: '',
      currentCompany: '',
      industry: 'other',
      linkedInProfile: '',
      isAvailableToMentor: false,
      mentorshipAreas: [],
      willPostOpportunities: false,
      bio: ''
    }
  })

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setVerificationDocument(acceptedFiles[0])
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  })

  const handleFormSubmit = async (data: AlumniRegistrationFormData) => {
    try {
      await onSubmit({ ...data, verificationDocument: verificationDocument || undefined })
    } catch (error) {
      console.error('Failed to submit alumni registration:', error)
    }
  }

  const removeVerificationDocument = () => {
    setVerificationDocument(null)
  }

  const toggleMentorshipArea = (area: MentorshipArea) => {
    if (selectedMentorshipAreas.includes(area)) {
      setSelectedMentorshipAreas(prev => prev.filter(a => a !== area))
    } else {
      setSelectedMentorshipAreas(prev => [...prev, area])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const currentYear = new Date().getFullYear()
  const graduationYears = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Alumni Registration
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-8">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="john.doe@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Education Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Education Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graduation Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Graduation Year *
              </label>
              <select
                {...register('graduationYear', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {graduationYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.graduationYear && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.graduationYear.message}
                </p>
              )}
            </div>

            {/* Degree */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Degree *
              </label>
              <select
                {...register('degree')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {degrees.map((degree) => (
                  <option key={degree.value} value={degree.value}>
                    {degree.label}
                  </option>
                ))}
              </select>
              {errors.degree && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.degree.message}
                </p>
              )}
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course of Study *
              </label>
              <input
                {...register('course')}
                type="text"
                placeholder="e.g., Computer Science"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.course && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.course.message}
                </p>
              )}
            </div>

            {/* University */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                University *
              </label>
              <input
                {...register('university')}
                type="text"
                placeholder="e.g., Bugema University"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.university && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.university.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Current Career */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Career Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Job Title
              </label>
              <input
                {...register('currentJobTitle')}
                type="text"
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.currentJobTitle && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.currentJobTitle.message}
                </p>
              )}
            </div>

            {/* Current Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Company
              </label>
              <input
                {...register('currentCompany')}
                type="text"
                placeholder="e.g., Tech Corp"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.currentCompany && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.currentCompany.message}
                </p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry *
              </label>
              <select
                {...register('industry')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {industries.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country *
              </label>
              <select
                {...register('country')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* LinkedIn Profile */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Professional Profile
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              LinkedIn Profile URL
            </label>
            <input
              {...register('linkedInProfile')}
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.linkedInProfile && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.linkedInProfile.message}
              </p>
            )}
          </div>
        </div>

        {/* Mentorship */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Mentorship
          </h3>
          <div className="space-y-4">
            <label className="flex items-center cursor-pointer">
              <input
                {...register('isAvailableToMentor')}
                type="checkbox"
                className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Available to mentor current students
              </span>
            </label>

            {/* Mentorship Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mentorship Areas *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mentorshipAreas.map((area) => (
                  <label key={area.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMentorshipAreas.includes(area.value)}
                      onChange={() => toggleMentorshipArea(area.value)}
                      className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {area.label}
                    </span>
                  </label>
                ))}
              </div>
              {errors.mentorshipAreas && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.mentorshipAreas.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Opportunities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Opportunities
          </h3>
          <div className="space-y-4">
            <label className="flex items-center cursor-pointer">
              <input
                {...register('willPostOpportunities')}
                type="checkbox"
                className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Interested in posting opportunities for current students
              </span>
            </label>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            About You
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio (Optional)
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              placeholder="Tell us about yourself, your career journey, and how you'd like to contribute to the Bugema community..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.bio.message}
              </p>
            )}
          </div>
        </div>

        {/* Verification Document */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Verification Document
          </h3>
          <div>
            {verificationDocument ? (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(verificationDocument)}
                    alt="Verification document"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {verificationDocument.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(verificationDocument.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeVerificationDocument}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload graduation certificate, transcript, or other verification document (PDF, PNG, JPG up to 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <ResponsiveButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </ResponsiveButton>
          <ResponsiveButton
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Registration'}
          </ResponsiveButton>
        </div>
      </form>
    </div>
  )
}
