'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Eye, 
  Bookmark,
  Star,
  Calendar,
  User,
  Shield,
  TrendingUp,
  File,
  FileSpreadsheet,
  Presentation,
  Hash
} from 'lucide-react'
import { Resource, FileType, User as UserType } from '../types/resources'
import { ResponsiveButton } from './ResponsiveForm'
import toast from 'react-hot-toast'

interface ResourceCardProps {
  resource: Resource
  currentUser?: UserType
  onDownload: (resourceId: string) => void
  onPreview: (resource: Resource) => void
  onBookmark: (resourceId: string) => void
  onRate: (resourceId: string, rating: number) => void
}

export default function ResourceCard({
  resource,
  currentUser,
  onDownload,
  onPreview,
  onBookmark,
  onRate
}: ResourceCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(resource.isBookmarked)

  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />
      case 'doc':
      case 'docx':
        return <File className="w-8 h-8 text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-8 h-8 text-green-500" />
      case 'ppt':
      case 'pptx':
        return <Presentation className="w-8 h-8 text-orange-500" />
      default:
        return <File className="w-8 h-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await onDownload(resource.id)
      toast.success('Download started!')
    } catch (error) {
      toast.error('Failed to download file')
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePreview = () => {
    onPreview(resource)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    onBookmark(resource.id)
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks!')
  }

  const handleRating = (rating: number) => {
    setUserRating(rating)
    onRate(resource.id, rating)
    toast.success('Thank you for rating!')
  }

  const renderStars = (interactive: boolean = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && handleRating(star)}
            disabled={!interactive}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-transform`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= (interactive ? userRating : resource.averageRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
          ({resource.ratingCount})
        </span>
      </div>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'timetables': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'forms': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'study-materials': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'exam-papers': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'club-constitutions': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'event-programs': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'campus-maps': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'student-handbooks': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'job-templates': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'scholarship-info': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {getFileIcon(resource.fileType)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                {resource.title}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <span>{formatFileSize(resource.fileSize)}</span>
                <span>•</span>
                <span>{resource.fileType.toUpperCase()}</span>
                {resource.version && (
                  <>
                    <span>•</span>
                    <span>v{resource.version}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Popular Badge */}
          {resource.isPopular && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-medium">Popular</span>
            </div>
          )}
        </div>

        {/* Category and University */}
        <div className="flex items-center space-x-2 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(resource.category)}`}>
            {resource.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {resource.university}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {resource.description}
        </p>

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full"
              >
                <Hash className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                +{resource.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Download className="w-3 h-3" />
              <span>{resource.downloadCount} downloads</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(resource.uploadDate)}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-4">
          {renderStars(true)}
        </div>

        {/* Uploader Info */}
        <div className="flex items-center justify-between mb-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              {resource.uploader.avatar ? (
                <img
                  src={resource.uploader.avatar}
                  alt={resource.uploader.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {resource.uploader.name}
              </span>
              {resource.uploader.isVerified && (
                <Shield className="w-3 h-3 text-blue-500" />
              )}
            </div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {resource.uploader.role}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <ResponsiveButton
            variant="primary"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 min-h-9"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download
              </>
            )}
          </ResponsiveButton>
          
          {resource.fileType === 'pdf' && (
            <ResponsiveButton
              variant="secondary"
              onClick={handlePreview}
              className="min-h-9"
            >
              <Eye className="w-4 h-4" />
            </ResponsiveButton>
          )}
          
          <ResponsiveButton
            variant="secondary"
            onClick={handleBookmark}
            className={`min-h-9 ${isBookmarked ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </ResponsiveButton>
        </div>
      </div>
    </motion.div>
  )
}
