'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { 
  Users, 
  BookOpen, 
  Briefcase, 
  Calendar,
  Clock,
  MapPin,
  Video,
  Globe,
  Hash,
  Plus,
  X,
  Target,
  FileText,
  Lock,
  Unlock
} from 'lucide-react'
import { StudyGroup } from '../types/studyGroups'
import ResponsiveForm from './ResponsiveForm'
import ResponsiveInput from './ResponsiveForm'
import ResponsiveTextarea from './ResponsiveForm'
import ResponsiveSelect from './ResponsiveForm'
import { ResponsiveButton } from './ResponsiveForm'

const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  courseName: z.string().min(1, 'Course name is required'),
  courseCode: z.string().min(1, 'Course code is required'),
  department: z.string().min(1, 'Department is required'),
  year: z.string().min(1, 'Year is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
  maxMembers: z.number().min(2).max(20, 'Max members must be between 2 and 20'),
  scheduleDays: z.array(z.string()).min(1, 'Select at least one day'),
  scheduleTime: z.string().min(1, 'Time is required'),
  locationType: z.enum(['physical', 'online']),
  room: z.string().optional(),
  meetLink: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
  isOpen: z.boolean(),
  tags: z.array(z.string())
}).refine((data) => {
  if (data.locationType === 'physical' && !data.room) {
    return false
  }
  if (data.locationType === 'online' && !data.meetLink) {
    return false
  }
  return true
}, {
  message: 'Room or Meet link is required based on location type',
  path: ['room']
})

type CreateGroupFormData = z.infer<typeof createGroupSchema>

interface CreateStudyGroupFormProps {
  onSubmit: (data: CreateGroupFormData) => void
  onCancel: () => void
  suggestedName?: string
}

export default function CreateStudyGroupForm({ 
  onSubmit, 
  onCancel, 
  suggestedName = '' 
}: CreateStudyGroupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentGoal, setCurrentGoal] = useState('')
  const [currentTag, setCurrentTag] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: suggestedName,
      courseName: '',
      courseCode: '',
      department: '',
      year: '',
      description: '',
      goals: [],
      maxMembers: 10,
      scheduleDays: [],
      scheduleTime: '',
      locationType: 'physical',
      room: '',
      meetLink: '',
      language: 'English',
      isOpen: true,
      tags: []
    }
  })

  const locationType = watch('locationType')

  const departments = [
    'Computer Science',
    'Business Administration',
    'Education',
    'Nursing',
    'Engineering',
    'Agriculture',
    'Theology'
  ]

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']
  const languages = ['English', 'Luganda', 'Swahili']
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const commonTags = ['exam prep', 'assignments', 'weekly', 'projects', 'review', 'homework']

  const handleAddGoal = () => {
    if (currentGoal.trim()) {
      const currentGoals = getValues('goals')
      setValue('goals', [...currentGoals, currentGoal.trim()])
      setCurrentGoal('')
    }
  }

  const handleRemoveGoal = (index: number) => {
    const currentGoals = getValues('goals')
    setValue('goals', currentGoals.filter((_, i) => i !== index))
  }

  const handleAddTag = () => {
    if (currentTag.trim()) {
      const currentTags = getValues('tags')
      setValue('tags', [...currentTags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (index: number) => {
    const currentTags = getValues('tags')
    setValue('tags', currentTags.filter((_, i) => i !== index))
  }

  const handleAddCommonTag = (tag: string) => {
    const currentTags = getValues('tags')
    if (!currentTags.includes(tag)) {
      setValue('tags', [...currentTags, tag])
    }
  }

  const handleFormSubmit = async (data: CreateGroupFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCourseCodeChange = (value: string) => {
    const upperCode = value.toUpperCase()
    setValue('courseCode', upperCode)
    
    // Auto-suggest group name if not already set
    if (!getValues('name') || getValues('name') === suggestedName) {
      const courseName = getValues('courseName')
      if (courseName && upperCode) {
        setValue('name', `${upperCode} Study Group`)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Study Group
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <ResponsiveForm>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4 mr-1" />
                Group Name
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="e.g., CSC 301 Study Group"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <BookOpen className="w-4 h-4 mr-1" />
                Course Name
              </label>
              <input
                {...register('courseName')}
                type="text"
                placeholder="e.g., Data Structures"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.courseName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.courseName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Hash className="w-4 h-4 mr-1" />
                Course Code
              </label>
              <input
                {...register('courseCode')}
                type="text"
                placeholder="e.g., CSC 301"
                onChange={(e) => handleCourseCodeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.courseCode && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.courseCode.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Briefcase className="w-4 h-4 mr-1" />
                Department
              </label>
              <select
                {...register('department')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.department.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4 mr-1" />
                Year Level
              </label>
              <select
                {...register('year')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.year.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 mr-1" />
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Describe your study group and what you'll be working on..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Goals */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Target className="w-4 h-4 mr-1" />
              Study Goals
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentGoal}
                  onChange={(e) => setCurrentGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())}
                  placeholder="Add a study goal..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddGoal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {getValues('goals').map((goal, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                  >
                    <span className="text-sm">{goal}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(index)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            {errors.goals && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.goals.message}
              </p>
            )}
          </div>

          {/* Max Members */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4 mr-1" />
              Maximum Members
            </label>
            <input
              {...register('maxMembers', { valueAsNumber: true })}
              type="number"
              min="2"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.maxMembers && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.maxMembers.message}
              </p>
            )}
          </div>

          {/* Schedule */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              <Calendar className="w-4 h-4 inline mr-1" />
              Meeting Schedule
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Days</label>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <label
                      key={day}
                      className="flex items-center space-x-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <input
                        {...register('scheduleDays')}
                        type="checkbox"
                        value={day}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
                {errors.scheduleDays && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.scheduleDays.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Time
                </label>
                <input
                  {...register('scheduleTime')}
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.scheduleTime && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.scheduleTime.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location Type
            </label>
            <div className="flex space-x-4 mb-3">
              <label className="flex items-center space-x-2">
                <input
                  {...register('locationType')}
                  type="radio"
                  value="physical"
                  className="text-blue-600"
                />
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Physical</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  {...register('locationType')}
                  type="radio"
                  value="online"
                  className="text-blue-600"
                />
                <Video className="w-4 h-4" />
                <span className="text-sm">Online</span>
              </label>
            </div>

            {locationType === 'physical' ? (
              <div>
                <input
                  {...register('room')}
                  type="text"
                  placeholder="e.g., Room 201, Science Building"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.room && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    Room is required for physical meetings
                  </p>
                )}
              </div>
            ) : (
              <div>
                <input
                  {...register('meetLink')}
                  type="url"
                  placeholder="e.g., https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.meetLink && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    Meet link is required for online meetings
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Language */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="w-4 h-4 mr-1" />
              Language of Instruction
            </label>
            <select
              {...register('language')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            {errors.language && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.language.message}
              </p>
            )}
          </div>

          {/* Open/Invite Only */}
          <div>
            <label className="flex items-center space-x-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                {...register('isOpen')}
                type="checkbox"
                className="rounded text-blue-600"
              />
              {watch('isOpen') ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Open Group (anyone can join)</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Invite Only (requires approval)</span>
                </>
              )}
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              <Hash className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Common Tags */}
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddCommonTag(tag)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2">
                {getValues('tags').map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full"
                  >
                    <span className="text-sm">#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-6">
            <ResponsiveButton
              type="button"
              variant="secondary"
              onClick={onCancel}
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
              {isSubmitting ? 'Creating...' : 'Create Study Group'}
            </ResponsiveButton>
          </div>
        </form>
      </ResponsiveForm>
    </motion.div>
  )
}
