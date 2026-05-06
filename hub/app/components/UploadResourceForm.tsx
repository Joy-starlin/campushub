'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileText, 
  X, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { ResourceCategory, VisibilityLevel, UploadFormData } from '../types/resources'
import { ResponsiveButton } from './ResponsiveForm'
import toast from 'react-hot-toast'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
}

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.enum(['timetables', 'forms', 'study-materials', 'exam-papers', 'club-constitutions', 'event-programs', 'campus-maps', 'student-handbooks', 'job-templates', 'scholarship-info']),
  university: z.string().min(1, 'University is required'),
  visibility: z.enum(['public', 'members-only', 'university-only']),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  version: z.string().min(1, 'Version is required').max(20, 'Version must be less than 20 characters'),
  file: z.any().optional()
}).refine((data) => data.file, {
  message: 'File is required',
  path: ['file']
})

type UploadFormDataSchema = z.infer<typeof uploadSchema>

interface UploadResourceFormProps {
  onSubmit: (data: UploadFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

const universities = [
  'Bugema University',
  'Makerere University',
  'University of Nairobi',
  'Kenyatta University',
  'Uganda Christian University',
  'Daystar University'
]

const categories = [
  { value: 'timetables', label: 'Timetables & Schedules' },
  { value: 'forms', label: 'Official University Forms' },
  { value: 'study-materials', label: 'Study Materials & Notes' },
  { value: 'exam-papers', label: 'Past Exam Papers' },
  { value: 'club-constitutions', label: 'Club Constitutions' },
  { value: 'event-programs', label: 'Event Programs' },
  { value: 'campus-maps', label: 'Campus Maps' },
  { value: 'student-handbooks', label: 'Student Handbooks' },
  { value: 'job-templates', label: 'Job Application Templates' },
  { value: 'scholarship-info', label: 'Scholarship Information' }
]

const commonTags = [
  'academic', 'exam', 'schedule', 'form', 'guide', 'template',
  'undergraduate', 'graduate', 'research', 'application', 'registration'
]

export default function UploadResourceForm({
  onSubmit,
  onCancel,
  isSubmitting = false
}: UploadResourceFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [currentTag, setCurrentTag] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues
  } = useForm<UploadFormDataSchema>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'study-materials',
      university: 'Bugema University',
      visibility: 'public',
      tags: [],
      version: '1.0'
    }
  })

  const watchedTags = watch('tags')

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setFileError(null)

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.some((error: any) => error.code === 'file-too-large')) {
        setFileError('File size must be less than 10MB')
      } else if (rejection.errors.some((error: any) => error.code === 'file-invalid-type')) {
        setFileError('Invalid file type. Please upload PDF, DOC, DOCX, XLS, XLSX, PPT, or PPTX files')
      } else {
        setFileError('File upload failed')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      setValue('file', file)
      
      // Auto-generate title from filename if title is empty
      if (!getValues('title')) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '')
        setValue('title', nameWithoutExtension.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
      }
    }
  }, [setValue, getValues])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false
  })

  const handleAddTag = () => {
    if (currentTag.trim() && !watchedTags.includes(currentTag.trim())) {
      setValue('tags', [...watchedTags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove))
  }

  const handleAddCommonTag = (tag: string) => {
    if (!watchedTags.includes(tag)) {
      setValue('tags', [...watchedTags, tag])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFileError(null)
    setValue('file', null)
  }

  const onFormSubmit = async (data: UploadFormDataSchema) => {
    if (!selectedFile) {
      setFileError('Please select a file to upload')
      return
    }

    try {
      await onSubmit({
        ...data,
        file: selectedFile
      })
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Upload Resource
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            File Upload *
          </label>
          
          {selectedFile ? (
            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-900 dark:text-white mb-2">
                {isDragActive ? 'Drop the file here' : 'Drag and drop a file here, or click to select'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max 10MB)
              </p>
            </div>
          )}
          
          {fileError && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{fileError}</span>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Enter resource title"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Version *
            </label>
            <input
              {...register('version')}
              type="text"
              placeholder="e.g., 1.0, 2.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.version && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.version.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Describe the resource content and purpose..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Category and University */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              University *
            </label>
            <select
              {...register('university')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {universities.map((university) => (
                <option key={university} value={university}>
                  {university}
                </option>
              ))}
            </select>
            {errors.university && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.university.message}
              </p>
            )}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Visibility *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'public', label: 'Public', description: 'Anyone can view' },
              { value: 'members-only', label: 'Members Only', description: 'Logged in users only' },
              { value: 'university-only', label: 'University Only', description: 'Your university only' }
            ].map((option) => (
              <label
                key={option.value}
                className="relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors"
              >
                <input
                  {...register('visibility')}
                  type="radio"
                  value={option.value}
                  className="sr-only"
                />
                <div className={`w-full text-center ${
                  watch('visibility') === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } border rounded-lg p-3`}>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags *
          </label>
          <div className="space-y-3">
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
                Add
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
              {watchedTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                >
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          {errors.tags && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.tags.message}
            </p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
            disabled={isSubmitting || !selectedFile}
            className="flex-1"
          >
            {isSubmitting ? 'Uploading...' : 'Upload Resource'}
          </ResponsiveButton>
        </div>
      </form>
    </motion.div>
  )
}
