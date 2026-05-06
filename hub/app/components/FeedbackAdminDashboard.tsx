'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Filter, 
  Search, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  ArrowUpRight,
  Download,
  RefreshCw,
  X
} from 'lucide-react'
import { FeedbackSubmission, FeedbackFilter, FeedbackStatus, FeedbackCategory, Severity } from '../types/feedback'
import { ResponsiveButton } from './ResponsiveForm'

interface FeedbackAdminDashboardProps {
  submissions: FeedbackSubmission[]
  onUpdateStatus: (id: string, status: FeedbackStatus, adminNotes?: string) => void
  onRespondPublicly: (id: string, response: string) => void
  onEscalate: (id: string) => void
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

const severityConfig = {
  'low': {
    label: 'Low',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  },
  'medium': {
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  'urgent': {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
}

const categories: { value: FeedbackCategory; label: string }[] = [
  { value: 'campus-facilities', label: 'Campus Facilities' },
  { value: 'academic-issues', label: 'Academic Issues' },
  { value: 'safety-concern', label: 'Safety Concern' },
  { value: 'club-event', label: 'Club or Event' },
  { value: 'website-bug', label: 'Website/App Bug' },
  { value: 'general-suggestion', label: 'General Suggestion' },
  { value: 'other', label: 'Other' }
]

export default function FeedbackAdminDashboard({
  submissions,
  onUpdateStatus,
  onRespondPublicly,
  onEscalate
}: FeedbackAdminDashboardProps) {
  const [filter, setFilter] = useState<FeedbackFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState<FeedbackSubmission | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [newStatus, setNewStatus] = useState<FeedbackStatus>('received')
  const [adminNotes, setAdminNotes] = useState('')
  const [publicResponse, setPublicResponse] = useState('')

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (
        !submission.referenceCode.toLowerCase().includes(searchLower) &&
        !submission.description.toLowerCase().includes(searchLower) &&
        !submission.title?.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    // Category filter
    if (filter.category && submission.category !== filter.category) {
      return false
    }

    // Severity filter
    if (filter.severity && submission.severity !== filter.severity) {
      return false
    }

    // Status filter
    if (filter.status && submission.status !== filter.status) {
      return false
    }

    // Date range filter
    if (filter.dateRange) {
      const submissionDate = new Date(submission.createdAt)
      const startDate = new Date(filter.dateRange.start)
      const endDate = new Date(filter.dateRange.end)
      
      if (submissionDate < startDate || submissionDate > endDate) {
        return false
      }
    }

    return true
  }).sort((a, b) => {
    // Sort urgent items first
    if (a.isUrgent && !b.isUrgent) return -1
    if (!a.isUrgent && b.isUrgent) return 1
    
    // Then by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const urgentCount = filteredSubmissions.filter(s => s.isUrgent).length
  const escalatedCount = filteredSubmissions.filter(s => s.status === 'escalated').length

  const handleStatusUpdate = () => {
    if (selectedSubmission) {
      onUpdateStatus(selectedSubmission.id, newStatus, adminNotes)
      setShowStatusModal(false)
      setAdminNotes('')
      setSelectedSubmission(null)
    }
  }

  const handlePublicResponse = () => {
    if (selectedSubmission && publicResponse.trim()) {
      onRespondPublicly(selectedSubmission.id, publicResponse)
      setShowResponseModal(false)
      setPublicResponse('')
      setSelectedSubmission(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const clearFilters = () => {
    setFilter({})
    setSearchTerm('')
  }

  const hasActiveFilters = Object.values(filter).some(value => value !== undefined) || searchTerm

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Feedback Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and respond to anonymous feedback submissions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Urgent Badge */}
          {urgentCount > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{urgentCount} Urgent</span>
            </div>
          )}
          
          {/* Escalated Badge */}
          {escalatedCount > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-medium">{escalatedCount} Escalated</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by reference code, title, or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filter.category || ''}
            onChange={(e) => setFilter({ ...filter, category: e.target.value as FeedbackCategory | undefined })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filter.status || ''}
            onChange={(e) => setFilter({ ...filter, status: e.target.value as FeedbackStatus | undefined })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="received">Received</option>
            <option value="under-review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <ResponsiveButton
              variant="secondary"
              onClick={clearFilters}
              className="min-h-10"
            >
              Clear Filters
            </ResponsiveButton>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubmissions.map((submission) => (
                <motion.tr
                  key={submission.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={submission.isUrgent ? 'bg-red-50 dark:bg-red-900/10' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {submission.referenceCode}
                      </span>
                      {submission.isUrgent && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white capitalize">
                      {submission.category.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {submission.title || submission.description}
                      </p>
                      {submission.title && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                          {submission.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig[submission.status].color}`}>
                      {statusConfig[submission.status].icon}
                      <span>{statusConfig[submission.status].label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.severity && (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${severityConfig[submission.severity].color}`}>
                        {severityConfig[submission.severity].label}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(submission.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setShowStatusModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Update Status"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setShowResponseModal(true)
                        }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Public Response"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      {submission.status !== 'escalated' && (
                        <button
                          onClick={() => onEscalate(submission.id)}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                          title="Escalate"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No submissions found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedSubmission && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowStatusModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Update Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as FeedbackStatus)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="received">Received</option>
                  <option value="under-review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this status update..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <ResponsiveButton
                  variant="secondary"
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1"
                >
                  Cancel
                </ResponsiveButton>
                <ResponsiveButton
                  variant="primary"
                  onClick={handleStatusUpdate}
                  className="flex-1"
                >
                  Update Status
                </ResponsiveButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Public Response Modal */}
      {showResponseModal && selectedSubmission && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowResponseModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Post Public Response
              </h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response
                </label>
                <textarea
                  value={publicResponse}
                  onChange={(e) => setPublicResponse(e.target.value)}
                  rows={4}
                  placeholder="Write a public response to this feedback..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <ResponsiveButton
                  variant="secondary"
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1"
                >
                  Cancel
                </ResponsiveButton>
                <ResponsiveButton
                  variant="primary"
                  onClick={handlePublicResponse}
                  disabled={!publicResponse.trim()}
                  className="flex-1"
                >
                  Post Response
                </ResponsiveButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
