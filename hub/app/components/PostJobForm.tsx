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
  Plus, 
  Trash2,
  Globe,
  Building,
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  MapPin,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react'
import { Job, JobType, WorkMode, ExperienceLevel, Industry, CompanySize, ApplicationMethod } from '../types/jobs'
import { ResponsiveButton } from './ResponsiveForm'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const postJobSchema = z.object({
  // Company Info
  companyName: z.string().min(1, 'Company name is required'),
  companyWebsite: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  companyIndustry: z.enum(['tech', 'finance', 'healthcare', 'education', 'ngo', 'consulting', 'marketing', 'sales', 'engineering', 'other']),
  companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  companyDescription: z.string().optional(),

  // Job Info
  jobTitle: z.string().min(1, 'Job title is required'),
  jobType: z.enum(['full-time', 'part-time', 'internship', 'volunteer', 'contract']),
  workMode: z.enum(['remote', 'hybrid', 'onsite']),
  locationCity: z.string().min(1, 'City is required'),
  locationCountry: z.string().min(1, 'Country is required'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'no-experience']),

  // Salary
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryCurrency: z.string().min(1, 'Currency is required'),
  salaryHidden: z.boolean(),

  // Description
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  benefits: z.array(z.string()).optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is needed'),

  // Application
  applicationMethod: z.enum(['external', 'in-platform']),
  externalApplicationUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  applicationDeadline: z.string().min(1, 'Application deadline is required'),

  // Target
  targetUniversities: z.array(z.string()),
  isUniversityExclusive: z.boolean(),
  postingPlan: z.enum(['free', 'featured'])
}).refine((data) => {
  if (data.applicationMethod === 'external' && !data.externalApplicationUrl) {
    return false
  }
  if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
    return false
  }
  return true
}, {
  message: 'Please check your input',
  path: ['applicationMethod']
})

type PostJobFormData = z.infer<typeof postJobSchema>

interface PostJobFormProps {
  onSubmit: (data: PostJobFormData & { companyLogo?: File }) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

const industries = [
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

const companySizes = [
  { value: 'startup', label: 'Startup (1-10)' },
  { value: 'small', label: 'Small (11-50)' },
  { value: 'medium', label: 'Medium (51-200)' },
  { value: 'large', label: 'Large (201-1000)' },
  { value: 'enterprise', label: 'Enterprise (1000+)' }
]

const universities = [
  'Bugema University',
  'Makerere University',
  'University of Nairobi',
  'Kenyatta University',
  'Uganda Christian University',
  'Daystar University',
  'All Universities'
]

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'UGX', label: 'UGX (USh)' },
  { value: 'KES', label: 'KES (KSh)' },
  { value: 'TZS', label: 'TZS (TSh)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' }
]

export default function PostJobForm({
  onSubmit,
  onCancel,
  isSubmitting = false
}: PostJobFormProps) {
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [newRequirement, setNewRequirement] = useState('')
  const [newBenefit, setNewBenefit] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<PostJobFormData>({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      companyName: '',
      companyWebsite: '',
      companyIndustry: 'tech',
      companySize: 'small',
      companyDescription: '',
      jobTitle: '',
      jobType: 'full-time',
      workMode: 'hybrid',
      locationCity: '',
      locationCountry: '',
      experienceLevel: 'entry',
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: 'USD',
      salaryHidden: false,
      description: '',
      requirements: [],
      benefits: [],
      skills: [],
      applicationMethod: 'in-platform',
      externalApplicationUrl: '',
      applicationDeadline: '',
      targetUniversities: ['All Universities'],
      isUniversityExclusive: false,
      postingPlan: 'free'
    }
  })

  const watchedValues = watch()

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setCompanyLogo(acceptedFiles[0])
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  })

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setValue('requirements', [...getValues('requirements'), newRequirement.trim()])
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    const requirements = getValues('requirements')
    setValue('requirements', requirements.filter((_, i) => i !== index))
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setValue('benefits', [...(getValues('benefits') || []), newBenefit.trim()])
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    const benefits = getValues('benefits') || []
    setValue('benefits', benefits.filter((_, i) => i !== index))
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setValue('skills', [...getValues('skills'), newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    const skills = getValues('skills')
    setValue('skills', skills.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (data: PostJobFormData) => {
    try {
      await onSubmit({ ...data, companyLogo: companyLogo || undefined })
    } catch (error) {
      console.error('Failed to post job:', error)
    }
  }

  const removeLogo = () => {
    setCompanyLogo(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getPostingPlanInfo = (plan: 'free' | 'featured') => {
    return plan === 'featured' 
      ? { duration: 60, price: 99, features: ['Highlighted listing', '60 days duration', 'Top placement', 'Social media promotion'] }
      : { duration: 30, price: 0, features: ['Standard listing', '30 days duration'] }
  }

  const planInfo = getPostingPlanInfo(watchedValues.postingPlan)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Post a Job
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
        {/* Company Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Logo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Logo
              </label>
              {companyLogo ? (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <img
                    src={URL.createObjectURL(companyLogo)}
                    alt="Company logo"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {companyLogo.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(companyLogo.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
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
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                {...register('companyName')}
                type="text"
                placeholder="e.g., Bugema Tech Solutions"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            {/* Company Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Website
              </label>
              <input
                {...register('companyWebsite')}
                type="url"
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.companyWebsite && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.companyWebsite.message}
                </p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry *
              </label>
              <select
                {...register('companyIndustry')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {industries.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
              {errors.companyIndustry && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.companyIndustry.message}
                </p>
              )}
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Size *
              </label>
              <select
                {...register('companySize')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {companySizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
              {errors.companySize && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.companySize.message}
                </p>
              )}
            </div>

            {/* Company Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Description
              </label>
              <textarea
                {...register('companyDescription')}
                rows={3}
                placeholder="Brief description of your company..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Job Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Job Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                {...register('jobTitle')}
                type="text"
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.jobTitle && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.jobTitle.message}
                </p>
              )}
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Type *
              </label>
              <select
                {...register('jobType')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="volunteer">Volunteer</option>
                <option value="contract">Contract</option>
              </select>
              {errors.jobType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.jobType.message}
                </p>
              )}
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Mode *
              </label>
              <select
                {...register('workMode')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
              {errors.workMode && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.workMode.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City *
              </label>
              <input
                {...register('locationCity')}
                type="text"
                placeholder="e.g., Kampala"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.locationCity && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.locationCity.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country *
              </label>
              <input
                {...register('locationCountry')}
                type="text"
                placeholder="e.g., Uganda"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.locationCountry && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.locationCountry.message}
                </p>
              )}
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Level *
              </label>
              <select
                {...register('experienceLevel')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="no-experience">No Experience</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
              {errors.experienceLevel && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.experienceLevel.message}
                </p>
              )}
            </div>

            {/* Application Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Application Deadline *
              </label>
              <input
                {...register('applicationDeadline')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.applicationDeadline && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.applicationDeadline.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Salary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Salary Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Salary
              </label>
              <input
                {...register('salaryMin', { valueAsNumber: true })}
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Salary
              </label>
              <input
                {...register('salaryMax', { valueAsNumber: true })}
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency *
              </label>
              <select
                {...register('salaryCurrency')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  {...register('salaryHidden')}
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Hide salary (show "Competitive")
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Job Description
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={8}
              placeholder="Provide a detailed description of the role, responsibilities, and what you're looking for..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Requirements */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Requirements
          </h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                placeholder="Add a requirement..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addRequirement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {watchedValues.requirements?.map((requirement, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">{requirement}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {errors.requirements && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.requirements.message}
            </p>
          )}
        </div>

        {/* Benefits */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Benefits (Optional)
          </h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                placeholder="Add a benefit..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addBenefit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {watchedValues.benefits?.map((benefit, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">{benefit}</span>
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Required Skills
          </h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {watchedValues.skills?.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {errors.skills && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.skills.message}
            </p>
          )}
        </div>

        {/* Application Method */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Application Method
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors">
                <input
                  {...register('applicationMethod')}
                  type="radio"
                  value="in-platform"
                  className="sr-only"
                />
                <div className={`w-full text-center p-4 rounded-lg ${
                  watchedValues.applicationMethod === 'in-platform'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  <Briefcase className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <div className="font-medium text-gray-900 dark:text-white">In-Platform</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Candidates apply directly on Bugema Hub
                  </div>
                </div>
              </label>

              <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors">
                <input
                  {...register('applicationMethod')}
                  type="radio"
                  value="external"
                  className="sr-only"
                />
                <div className={`w-full text-center p-4 rounded-lg ${
                  watchedValues.applicationMethod === 'external'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  <ExternalLink className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <div className="font-medium text-gray-900 dark:text-white">External URL</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Redirect to your careers page
                  </div>
                </div>
              </label>
            </div>

            {watchedValues.applicationMethod === 'external' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application URL *
                </label>
                <input
                  {...register('externalApplicationUrl')}
                  type="url"
                  placeholder="https://yourcompany.com/careers/apply"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.externalApplicationUrl && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.externalApplicationUrl.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Target Universities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Target Universities
          </h3>
          <div className="space-y-4">
            <label className="flex items-center cursor-pointer">
              <input
                {...register('isUniversityExclusive')}
                type="checkbox"
                className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Make this job exclusive to selected universities
              </span>
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {universities.map((university) => (
                <label key={university} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchedValues.targetUniversities?.includes(university)}
                    onChange={(e) => {
                      const current = watchedValues.targetUniversities || []
                      if (e.target.checked) {
                        setValue('targetUniversities', [...current, university])
                      } else {
                        setValue('targetUniversities', current.filter(u => u !== university))
                      }
                    }}
                    className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{university}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Posting Plan */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Posting Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors">
              <input
                {...register('postingPlan')}
                type="radio"
                value="free"
                className="sr-only"
              />
              <div className={`w-full p-4 rounded-lg ${
                watchedValues.postingPlan === 'free'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 dark:text-white">Free</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${planInfo.price}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {planInfo.duration} days duration
                </div>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {planInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </label>

            <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors">
              <input
                {...register('postingPlan')}
                type="radio"
                value="featured"
                className="sr-only"
              />
              <div className={`w-full p-4 rounded-lg ${
                watchedValues.postingPlan === 'featured'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 dark:text-white">Featured</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${planInfo.price}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {planInfo.duration} days duration
                </div>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {planInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </label>
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
            {isSubmitting ? 'Posting...' : `Post Job (${planInfo.price > 0 ? `$${planInfo.price}` : 'Free'})`}
          </ResponsiveButton>
        </div>
      </form>
    </div>
  )
}
