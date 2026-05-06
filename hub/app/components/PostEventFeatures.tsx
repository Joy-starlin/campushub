'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Video, 
  Download, 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  Users,
  Share,
  Calendar,
  Award,
  TrendingUp,
  BarChart3,
  Eye,
  Heart,
  Send
} from 'lucide-react'
import { VirtualEvent, EventRecording, EventFeedback, EventAnalytics } from '../types/virtual-events'
import toast from 'react-hot-toast'

interface PostEventFeaturesProps {
  event: VirtualEvent
  recording?: EventRecording
  userFeedback?: EventFeedback
  analytics: EventAnalytics
  onSubmitFeedback: (feedback: Omit<EventFeedback, 'id' | 'eventId' | 'userId' | 'userName' | 'createdAt'>) => void
  onDownloadRecording: (recordingId: string) => void
  onShareRecording: (recordingId: string) => void
  userId: string
  userName: string
}

export default function PostEventFeatures({
  event,
  recording,
  userFeedback,
  analytics,
  onSubmitFeedback,
  onDownloadRecording,
  onShareRecording,
  userId,
  userName
}: PostEventFeaturesProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comment: '',
    aspects: {
      content: 0,
      organization: 0,
      engagement: 0,
      technical: 0
    },
    wouldRecommend: false
  })
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (feedbackData.rating === 0) {
      toast.error('Please provide a rating')
      return
    }

    setIsSubmittingFeedback(true)
    try {
      await onSubmitFeedback(feedbackData)
      toast.success('Thank you for your feedback!')
      setShowFeedbackForm(false)
      setFeedbackData({
        rating: 0,
        comment: '',
        aspects: {
          content: 0,
          organization: 0,
          engagement: 0,
          technical: 0
        },
        wouldRecommend: false
      })
    } catch (error) {
      toast.error('Failed to submit feedback')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const handleRatingClick = (rating: number) => {
    setFeedbackData(prev => ({ ...prev, rating }))
  }

  const handleAspectRating = (aspect: keyof typeof feedbackData.aspects, rating: number) => {
    setFeedbackData(prev => ({
      ...prev,
      aspects: {
        ...prev.aspects,
        [aspect]: rating
      }
    }))
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderStars = (rating: number, interactive = false, onRating?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRating && onRating(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Event Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Summary</h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Event Ended</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {analytics.confirmedRSVPs}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Attendees</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {Math.round(analytics.attendanceRate * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Attendance Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {analytics.feedbackSummary.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Average Rating</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{new Date(event.startDate).toLocaleTimeString()} - {new Date(event.endDate).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{analytics.peakAttendees} peak attendees</span>
          </div>
        </div>
      </div>

      {/* Recording Section */}
      {recording && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Event Recording</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onShareRecording(recording.id)}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Share className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDownloadRecording(recording.id)}
                className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Video Preview */}
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-white text-lg">{recording.title}</p>
                  {recording.description && (
                    <p className="text-gray-400 text-sm mt-2">{recording.description}</p>
                  )}
                </div>
              </div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                </button>
              </div>
            </div>

            {/* Recording Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Duration</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatDuration(recording.duration)}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">File Size</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatFileSize(recording.fileSize)}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Downloads</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {recording.downloadCount}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Uploaded</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(recording.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Event Feedback</h3>
          {!userFeedback && (
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Leave Feedback
            </button>
          )}
        </div>

        {/* Existing Feedback */}
        {userFeedback ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">Your Rating</span>
                  {renderStars(userFeedback.rating)}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {userFeedback.comment || 'No comment provided'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Submitted {new Date(userFeedback.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Be the first to share your feedback about this event
            </p>
          </div>
        )}

        {/* Feedback Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Community Feedback</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Average Rating</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analytics.feedbackSummary.averageRating.toFixed(1)}
                </span>
                {renderStars(Math.round(analytics.feedbackSummary.averageRating))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {analytics.feedbackSummary.totalFeedback} reviews
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {Math.round(analytics.feedbackSummary.wouldRecommendPercentage * 100)}% would recommend
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Event Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Engagement Metrics */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Engagement</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Chat Messages</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analytics.engagementMetrics.chatMessages}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Reactions</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analytics.engagementMetrics.reactions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Questions</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analytics.engagementMetrics.questions}
                </span>
              </div>
            </div>
          </div>

          {/* Attendance Stats */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Attendance</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Peak Attendees</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analytics.peakAttendees}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Avg. Attendance Time</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(analytics.averageAttendanceTime)} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Attendance Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(analytics.attendanceRate * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFeedbackForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Event Feedback
            </h3>

            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center space-x-4">
                  {renderStars(feedbackData.rating, true, handleRatingClick)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {feedbackData.rating > 0 ? `${feedbackData.rating} out of 5` : 'Please rate'}
                  </span>
                </div>
              </div>

              {/* Aspect Ratings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Rate Specific Aspects
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Content Quality</span>
                    {renderStars(feedbackData.aspects.content, true, (rating) => handleAspectRating('content', rating))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Organization</span>
                    {renderStars(feedbackData.aspects.organization, true, (rating) => handleAspectRating('organization', rating))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Engagement</span>
                    {renderStars(feedbackData.aspects.engagement, true, (rating) => handleAspectRating('engagement', rating))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Technical Quality</span>
                    {renderStars(feedbackData.aspects.technical, true, (rating) => handleAspectRating('technical', rating))}
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comments
                </label>
                <textarea
                  value={feedbackData.comment}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Share your thoughts about the event..."
                />
              </div>

              {/* Would Recommend */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedbackData.wouldRecommend}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I would recommend this event to others
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
