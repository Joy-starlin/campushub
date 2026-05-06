'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  FileText
} from 'lucide-react'
import { FeedbackSubmission, FeedbackStatus } from '../types/feedback'
import { ResponsiveButton } from './ResponsiveForm'

interface AnonymousTrackingProps {
  onTrackSubmission: (referenceCode: string) => Promise<FeedbackSubmission | null>
}

const statusConfig = {
  'received': {
    label: 'Received',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: <CheckCircle className="w-4 h-4" />
  },
  'under-review': {
    label: 'Under Review',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: <Clock className="w-4 h-4" />
  },
  'resolved': {
    label: 'Resolved',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: <CheckCircle className="w-4 h-4" />
  },
  'escalated': {
    label: 'Escalated',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: <AlertTriangle className="w-4 h-4" />
  }
}

export default function AnonymousTracking({ onTrackSubmission }: AnonymousTrackingProps) {
  const [referenceCode, setReferenceCode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [submission, setSubmission] = useState<FeedbackSubmission | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async () => {
    if (!referenceCode.trim()) {
      setError('Please enter a reference code')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const result = await onTrackSubmission(referenceCode.trim().toUpperCase())
      if (result) {
        setSubmission(result)
      } else {
        setError('No feedback found with this reference code')
      }
    } catch (err) {
      setError('Failed to track submission. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatReferenceCode = (code: string) => {
    return code.toUpperCase().replace(/[^A-Z0-9-]/g, '')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatReferenceCode(e.target.value)
    setReferenceCode(formatted)
    setError(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrack()
    }
  }

  const resetSearch = () => {
    setReferenceCode('')
    setSubmission(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Track Your Feedback
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Enter your reference code to check the status of your anonymous submission
        </p>
      </div>

      {/* Search Form */}
      {!submission && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reference Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={referenceCode}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., FB-2026-0472"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  maxLength={20}
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <ResponsiveButton
              variant="primary"
              onClick={handleTrack}
              disabled={isSearching || !referenceCode.trim()}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Track Submission
                </>
              )}
            </ResponsiveButton>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {submission && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Feedback Details
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Reference Code: <span className="font-mono font-medium">{submission.referenceCode}</span>
              </p>
            </div>
            
            <ResponsiveButton
              variant="secondary"
              onClick={resetSearch}
              className="min-h-9"
            >
              Track Another
            </ResponsiveButton>
          </div>

          {/* Status */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${statusConfig[submission.status].color}`}>
                {statusConfig[submission.status].icon}
                <span>{statusConfig[submission.status].label}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {formatDate(submission.updatedAt)}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Timeline</h4>
            
            <div className="space-y-3">
              {/* Received */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">Received</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(submission.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your anonymous feedback was successfully submitted and received.
                  </p>
                </div>
              </div>

              {/* Under Review */}
              {(submission.status === 'under-review' || submission.status === 'resolved' || submission.status === 'escalated') && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">Under Review</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(submission.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Your feedback is being reviewed by the appropriate team.
                    </p>
                  </div>
                </div>
              )}

              {/* Resolved */}
              {submission.status === 'resolved' && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">Resolved</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(submission.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Your feedback has been addressed and resolved.
                    </p>
                    {submission.adminNotes && (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Admin Note:</strong> {submission.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Escalated */}
              {submission.status === 'escalated' && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">Escalated</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(submission.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Your feedback has been escalated to senior administration for further review.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Category</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {submission.category.replace('-', ' ')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Submitted</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(submission.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      {!submission && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                How to Track Your Feedback
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Submit your feedback using the form above</li>
                <li>• Save the reference code provided after submission</li>
                <li>• Enter the reference code here to check status</li>
                <li>• No login or personal information required</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
