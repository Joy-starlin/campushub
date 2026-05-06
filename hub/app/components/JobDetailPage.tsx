'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Briefcase,
  Building,
  Users,
  DollarSign,
  ExternalLink,
  Share2,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Globe,
  Mail,
  Phone,
  GraduationCap,
  Star
} from 'lucide-react'
import { Job, JobApplicationForm } from '../types/jobs'
import JobCard from './JobCard'
import { ResponsiveButton } from './ResponsiveForm'

interface JobDetailPageProps {
  job: Job
  similarJobs: Job[]
  onSave?: (jobId: string) => void
  onApply?: (applicationData: JobApplicationForm) => Promise<void>
  onShare?: (job: Job) => void
  isSaved?: boolean
}

export default function JobDetailPage({
  job,
  similarJobs,
  onSave,
  onApply,
  onShare,
  isSaved = false
}: JobDetailPageProps) {
  const [saved, setSaved] = useState(isSaved)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationData, setApplicationData] = useState<JobApplicationForm>({
    jobId: job.id,
    coverLetter: '',
    linkedInProfile: '',
    availabilityDate: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getTimeUntilDeadline = () => {
    const now = new Date()
    const deadline = new Date(job.applicationDeadline)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: 'Closed', isUrgent: true, color: 'text-red-600' }
    } else if (diffDays === 0) {
      return { text: 'Closes today', isUrgent: true, color: 'text-red-600' }
    } else if (diffDays === 1) {
      return { text: 'Closes tomorrow', isUrgent: true, color: 'text-orange-600' }
    } else if (diffDays <= 3) {
      return { text: `Closes in ${diffDays} days`, isUrgent: true, color: 'text-orange-600' }
    } else {
      return { text: `Closes in ${diffDays} days`, isUrgent: false, color: 'text-gray-600' }
    }
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this opportunity at ${job.company.name}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
    onShare?.(job)
  }

  const handleApply = async () => {
    if (job.applicationMethod === 'external' && job.externalApplicationUrl) {
      window.open(job.externalApplicationUrl, '_blank')
    } else {
      setShowApplicationForm(true)
    }
  }

  const submitApplication = async () => {
    setIsSubmitting(true)
    try {
      await onApply?.(applicationData)
      setShowApplicationForm(false)
      setApplicationData({
        jobId: job.id,
        coverLetter: '',
        linkedInProfile: '',
        availabilityDate: ''
      })
    } catch (error) {
      console.error('Failed to submit application:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const deadlineInfo = getTimeUntilDeadline()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Company Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 -mt-16 mb-8">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {/* Company Logo */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
                  {job.company.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 mb-3">
                    <span className="font-medium">{job.company.name}</span>
                    {job.company.isVerified && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location.city}, {job.location.country}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
                      {job.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                      {job.experienceLevel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm font-medium">
                      {job.location.workMode}
                    </span>
                    {job.isUniversityExclusive && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm font-medium flex items-center space-x-1">
                        <GraduationCap className="w-3 h-3" />
                        <span>Bugema Exclusive</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSave}
                  className={`p-3 rounded-lg transition-colors ${
                    saved 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                      : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Salary</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatSalary()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deadline</p>
                  <p className={`font-medium ${deadlineInfo.color}`}>
                    {deadlineInfo.text}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Applications</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {job.applicationCount} applied
                  </p>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-6">
              <ResponsiveButton
                variant="primary"
                onClick={handleApply}
                className="w-full md:w-auto min-h-12 px-8"
              >
                {job.applicationMethod === 'external' ? (
                  <>
                    Apply Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Easy Apply'
                )}
              </ResponsiveButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Job Description
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: job.description }} />
              </div>
            </div>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Benefits
                </h2>
                <ul className="space-y-3">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                About {job.company.name}
              </h3>
              <div className="space-y-4">
                {job.company.description && (
                  <p className="text-gray-600 dark:text-gray-300">
                    {job.company.description}
                  </p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {job.company.size.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {job.company.industry.charAt(0).toUpperCase() + job.company.industry.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {job.company.location}
                    </span>
                  </div>
                  {job.company.website && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Visit website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* How to Apply */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                How to Apply
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Application deadline: {deadlineInfo.text}
                  </span>
                </div>
                
                {job.applicationMethod === 'external' ? (
                  <p className="text-gray-600 dark:text-gray-300">
                    Click "Apply Now" to be redirected to the external application page.
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">
                    Click "Easy Apply" to submit your application directly through Bugema Hub.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Similar Jobs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarJobs.map((similarJob) => (
                <JobCard
                  key={similarJob.id}
                  job={similarJob}
                  onSave={onSave}
                  onApply={() => {}}
                  onView={() => {}}
                  isSaved={false}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setShowApplicationForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Apply for {job.title}
            </h2>

            <div className="space-y-6">
              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Letter
                </label>
                <textarea
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  rows={6}
                  placeholder="Tell us why you're interested in this position..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* LinkedIn Profile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn Profile URL (Optional)
                </label>
                <input
                  type="url"
                  value={applicationData.linkedInProfile}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, linkedInProfile: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Availability Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  When can you start?
                </label>
                <input
                  type="date"
                  value={applicationData.availabilityDate}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, availabilityDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <ResponsiveButton
                  variant="secondary"
                  onClick={() => setShowApplicationForm(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </ResponsiveButton>
                <ResponsiveButton
                  variant="primary"
                  onClick={submitApplication}
                  disabled={isSubmitting || !applicationData.coverLetter.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </ResponsiveButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
