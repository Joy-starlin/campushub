'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Clock, 
  Calendar,
  Bookmark,
  ExternalLink,
  Building,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Star,
  Briefcase,
  GraduationCap
} from 'lucide-react'
import { Job, JobType, WorkMode, ExperienceLevel } from '../types/jobs'
import { ResponsiveButton } from './ResponsiveForm'

interface JobCardProps {
  job: Job
  onSave?: (jobId: string) => void
  onApply?: (job: Job) => void
  onView?: (job: Job) => void
  isSaved?: boolean
  compact?: boolean
}

export default function JobCard({ 
  job, 
  onSave, 
  onApply, 
  onView, 
  isSaved = false,
  compact = false 
}: JobCardProps) {
  const [saved, setSaved] = useState(isSaved)

  const getTimeUntilDeadline = () => {
    const now = new Date()
    const deadline = new Date(job.applicationDeadline)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: 'Closed', isUrgent: true }
    } else if (diffDays === 0) {
      return { text: 'Closes today', isUrgent: true }
    } else if (diffDays === 1) {
      return { text: 'Closes tomorrow', isUrgent: true }
    } else if (diffDays <= 2) {
      return { text: `Closes in ${diffDays} days`, isUrgent: true }
    } else if (diffDays <= 7) {
      return { text: `Closes in ${diffDays} days`, isUrgent: false }
    } else {
      return { text: `Closes in ${diffDays} days`, isUrgent: false }
    }
  }

  const getTimeAgo = () => {
    const now = new Date()
    const posted = new Date(job.postedAt)
    const diffTime = now.getTime() - posted.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    } else {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''} ago`
    }
  }

  const getJobTypeColor = (type: JobType) => {
    const colors = {
      'full-time': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'part-time': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'internship': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'volunteer': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'contract': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  const getWorkModeColor = (mode: WorkMode) => {
    const colors = {
      'remote': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'hybrid': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'onsite': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
    return colors[mode]
  }

  const getExperienceColor = (level: ExperienceLevel) => {
    const colors = {
      'entry': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'mid': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'senior': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'no-experience': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
    return colors[level]
  }

  const formatSalary = () => {
    if (!job.salary) return 'Competitive'
    if (job.salary.isHidden) return 'Competitive'
    
    const { min, max, currency } = job.salary
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    } else if (min) {
      return `${currency} ${min.toLocaleString()}+`
    } else if (max) {
      return `Up to ${currency} ${max.toLocaleString()}`
    }
    return 'Competitive'
  }

  const handleSave = () => {
    setSaved(!saved)
    onSave?.(job.id)
  }

  const handleApply = () => {
    onApply?.(job)
  }

  const handleView = () => {
    onView?.(job)
  }

  const deadlineInfo = getTimeUntilDeadline()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${
        job.isFeatured 
          ? 'border-yellow-400 dark:border-yellow-500 shadow-lg' 
          : 'border-gray-200 dark:border-gray-700'
      } hover:shadow-lg transition-all duration-200 ${compact ? 'p-4' : 'p-6'}`}
    >
      {/* Featured Badge */}
      {job.isFeatured && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Featured Job
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
            {job.company.logo ? (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
              {job.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-2">
              {job.company.name}
              {job.company.isVerified && (
                <CheckCircle className="w-3 h-3 inline ml-1 text-blue-500" />
              )}
            </p>

            {/* Location and Work Mode */}
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{job.location.city}, {job.location.country}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkModeColor(job.location.workMode)}`}>
                {job.location.workMode}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`p-2 rounded-lg transition-colors ${
            saved 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
              : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        {/* Job Type and Experience */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.type)}`}>
            {job.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getExperienceColor(job.experienceLevel)}`}>
            {job.experienceLevel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          {job.isUniversityExclusive && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex items-center space-x-1">
              <GraduationCap className="w-3 h-3" />
              <span>Bugema Exclusive</span>
            </span>
          )}
        </div>

        {/* Salary */}
        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {formatSalary()}
          </span>
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, compact ? 3 : 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > (compact ? 3 : 5) && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                +{job.skills.length - (compact ? 3 : 5)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{getTimeAgo()}</span>
          </div>
          <div className={`flex items-center space-x-1 ${deadlineInfo.isUrgent ? 'text-red-600 dark:text-red-400' : ''}`}>
            <Calendar className="w-3 h-3" />
            <span>{deadlineInfo.text}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {compact ? (
            <ResponsiveButton
              variant="primary"
              onClick={handleView}
              className="min-h-8 px-3 text-sm"
            >
              View
            </ResponsiveButton>
          ) : (
            <>
              {job.applicationMethod === 'in-platform' ? (
                <ResponsiveButton
                  variant="primary"
                  onClick={handleApply}
                  className="min-h-9 px-4"
                >
                  Easy Apply
                </ResponsiveButton>
              ) : (
                <ResponsiveButton
                  variant="primary"
                  onClick={handleApply}
                  className="min-h-9 px-4"
                >
                  Apply Now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </ResponsiveButton>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      {!compact && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{job.applicationCount} applications</span>
            </div>
            <div className="flex items-center space-x-1">
              <Briefcase className="w-3 h-3" />
              <span>{job.viewCount} views</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
