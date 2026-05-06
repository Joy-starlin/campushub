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
  Building,
  Globe,
  Mail,
  Phone,
  User,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { UniversityType, Region, UniversityPartnershipRequest } from '../types/universities'
import { ResponsiveButton } from './ResponsiveForm'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const addUniversitySchema = z.object({
  universityName: z.string().min(1, 'University name is required'),
  country: z.string().min(1, 'Country is required'),
  type: z.enum(['public', 'private', 'international']),
  officialEmailDomain: z.string().min(1, 'Official email domain is required'),
  website: z.string().url('Please enter a valid website URL'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Please enter a valid email'),
  contactPhone: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  proposedStartDate: z.string().min(1, 'Proposed start date is required'),
  agreementAccepted: z.boolean().refine(val => val === true, 'You must accept the partnership agreement')
})

type AddUniversityFormData = z.infer<typeof addUniversitySchema>

interface AddUniversityFormProps {
  onSubmit: (data: AddUniversityFormData & { documents: { logo?: File; coverImage?: File; verificationDocument?: File } }) => Promise<void>
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

const regions: { value: Region; label: string }[] = [
  { value: 'east-africa', label: 'East Africa' },
  { value: 'west-africa', label: 'West Africa' },
  { value: 'north-africa', label: 'North Africa' },
  { value: 'southern-africa', label: 'Southern Africa' },
  { value: 'central-africa', label: 'Central Africa' },
  { value: 'other', label: 'Other' }
]

const universityTypes: { value: UniversityType; label: string }[] = [
  { value: 'public', label: 'Public University' },
  { value: 'private', label: 'Private University' },
  { value: 'international', label: 'International University' }
]

export default function AddUniversityForm({
  onSubmit,
  onCancel,
  isSubmitting = false
}: AddUniversityFormProps) {
  const [documents, setDocuments] = useState<{
    logo?: File
    coverImage?: File
    verificationDocument?: File
  }>({})

  const [primaryColor, setPrimaryColor] = useState('#3B82F6')
  const [showColorPicker, setShowColorPicker] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<AddUniversityFormData>({
    resolver: zodResolver(addUniversitySchema),
    defaultValues: {
      universityName: '',
      country: '',
      type: 'public',
      officialEmailDomain: '',
      website: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      description: '',
      proposedStartDate: '',
      agreementAccepted: false
    }
  })

  const { getRootProps: getLogoProps, getInputProps: getLogoInput } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setDocuments(prev => ({ ...prev, logo: acceptedFiles[0] }))
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  })

  const { getRootProps: getCoverProps, getInputProps: getCoverInput } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setDocuments(prev => ({ ...prev, coverImage: acceptedFiles[0] }))
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  })

  const { getRootProps: getVerificationProps, getInputProps: getVerificationInput } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setDocuments(prev => ({ ...prev, verificationDocument: acceptedFiles[0] }))
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  })

  const handleFormSubmit = async (data: AddUniversityFormData) => {
    try {
      await onSubmit({ ...data, documents })
    } catch (error) {
      console.error('Failed to submit university request:', error)
    }
  }

  const removeDocument = (type: 'logo' | 'coverImage' | 'verificationDocument') => {
    setDocuments(prev => {
      const newDocs = { ...prev }
      delete newDocs[type]
      return newDocs
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const colorPresets = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add University Partner
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
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* University Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                University Name *
              </label>
              <input
                {...register('universityName')}
                type="text"
                placeholder="e.g., Bugema University"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.universityName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.universityName.message}
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

            {/* University Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                University Type *
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {universityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Official Email Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Official Email Domain *
              </label>
              <input
                {...register('officialEmailDomain')}
                type="text"
                placeholder="e.g., bugema.ac.ug"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.officialEmailDomain && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.officialEmailDomain.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This will be used for automatic email verification of university members
              </p>
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website *
              </label>
              <input
                {...register('website')}
                type="url"
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Contact Name *
              </label>
              <input
                {...register('contactName')}
                type="text"
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.contactName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.contactName.message}
                </p>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email *
              </label>
              <input
                {...register('contactEmail')}
                type="email"
                placeholder="contact@university.edu"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.contactEmail.message}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Phone
              </label>
              <input
                {...register('contactPhone')}
                type="tel"
                placeholder="+256 123 456 789"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.contactPhone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            University Description
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Provide a brief description of your university..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Branding */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Branding
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                University Logo
              </label>
              {documents.logo ? (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(documents.logo)}
                      alt="University logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {documents.logo.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(documents.logo.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument('logo')}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div
                  {...getLogoProps()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <input {...getLogoInput()} />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Image
              </label>
              {documents.coverImage ? (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(documents.coverImage)}
                      alt="Cover image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {documents.coverImage.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(documents.coverImage.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument('coverImage')}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div
                  {...getCoverProps()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <input {...getCoverInput()} />
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>

            {/* Primary Color */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: primaryColor }}
                  >
                  </button>
                  {showColorPicker && (
                    <div className="absolute top-14 left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 z-10">
                      <div className="grid grid-cols-6 gap-2 mb-3">
                        {colorPresets.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setPrimaryColor(color)
                              setShowColorPicker(false)
                            }}
                            className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Verification Document */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Verification Document
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              University Verification Document
            </label>
            {documents.verificationDocument ? (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FileText className="w-8 h-8 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {documents.verificationDocument.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(documents.verificationDocument.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument('verificationDocument')}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                {...getVerificationProps()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
              >
                <input {...getVerificationInput()} />
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  PDF, PNG, JPG up to 5MB
                </p>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Upload a verification document such as university registration certificate, accreditation letter, or official letterhead.
            </p>
          </div>
        </div>

        {/* Partnership Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Partnership Details
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proposed Start Date *
            </label>
            <input
              {...register('proposedStartDate')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.proposedStartDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.proposedStartDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Agreement */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Partnership Agreement
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
              Partnership Terms and Conditions
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>The university agrees to maintain accurate and up-to-date information on Bugema Hub</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>The university will designate an official administrator for their hub section</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Content posted by the university must comply with Bugema Hub community guidelines</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>The university partnership can be terminated by either party with 30 days notice</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Official university email domains will be used for automatic member verification</span>
              </li>
            </ul>
          </div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              {...register('agreementAccepted')}
              type="checkbox"
              className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I have read and agree to the partnership terms and conditions. I confirm that I am authorized to submit this partnership request on behalf of the university.
            </span>
          </label>
          {errors.agreementAccepted && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.agreementAccepted.message}
            </p>
          )}
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
            {isSubmitting ? 'Submitting...' : 'Submit Partnership Request'}
          </ResponsiveButton>
        </div>
      </form>
    </div>
  )
}
