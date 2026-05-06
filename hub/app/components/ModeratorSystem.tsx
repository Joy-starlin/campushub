'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Users, 
  MessageSquare, 
  Ban, 
  CheckCircle, 
  X, 
  AlertCircle, 
  Settings,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Calendar,
  Clock,
  UserCheck,
  Flag,
  Gavel,
  Crown,
  Globe
} from 'lucide-react'
import { ModeratorRole, BadgeType } from '../types/verification'
import toast from 'react-hot-toast'

interface ModeratorSystemProps {
  currentModeratorRole?: ModeratorRole
  userId: string
  isAdmin: boolean
  pendingApplications?: ModeratorRole[]
  onRequestRole: (data: ModeratorApplicationData) => Promise<void>
  onApproveApplication: (roleId: string) => Promise<void>
  onRejectApplication: (roleId: string, reason: string) => Promise<void>
  onUpdatePermissions: (roleId: string, permissions: ModeratorRole['permissions']) => Promise<void>
  onRevokeRole: (roleId: string) => Promise<void>
}

interface ModeratorApplicationData {
  experience: string
  availability: string
  motivation: string
  moderationAreas: string[]
  references?: string
}

export default function ModeratorSystem({
  currentModeratorRole,
  userId,
  isAdmin,
  pendingApplications = [],
  onRequestRole,
  onApproveApplication,
  onRejectApplication,
  onUpdatePermissions,
  onRevokeRole
}: ModeratorSystemProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ModeratorApplicationData>()

  const moderationAreas = [
    'Content Moderation',
    'User Management',
    'Event Moderation',
    'Chat Moderation',
    'Community Guidelines',
    'Dispute Resolution'
  ]

  const handleApplicationSubmit = async (data: ModeratorApplicationData) => {
    setIsProcessing(true)
    try {
      await onRequestRole(data)
      toast.success('Moderator application submitted successfully!')
      setShowApplicationForm(false)
      reset()
    } catch (error) {
      toast.error('Failed to submit application')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApprove = async (roleId: string) => {
    setIsProcessing(true)
    try {
      await onApproveApplication(roleId)
      toast.success('Application approved successfully!')
    } catch (error) {
      toast.error('Failed to approve application')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (roleId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setIsProcessing(true)
    try {
      await onRejectApplication(roleId, rejectionReason)
      toast.success('Application rejected')
      setShowRejectionModal(null)
      setRejectionReason('')
    } catch (error) {
      toast.error('Failed to reject application')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRevoke = async () => {
    if (!currentModeratorRole) return

    setIsProcessing(true)
    try {
      await onRevokeRole(currentModeratorRole.id)
      toast.success('Moderator role revoked')
    } catch (error) {
      toast.error('Failed to revoke role')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePermissionsUpdate = async (permissions: ModeratorRole['permissions']) => {
    if (!currentModeratorRole) return

    setIsProcessing(true)
    try {
      await onUpdatePermissions(currentModeratorRole.id, permissions)
      toast.success('Permissions updated successfully!')
      setShowPermissionsModal(false)
    } catch (error) {
      toast.error('Failed to update permissions')
    } finally {
      setIsProcessing(false)
    }
  }

  const getRoleIcon = (scope: string) => {
    switch (scope) {
      case 'global':
        return <Globe className="w-5 h-5" />
      case 'category':
        return <Flag className="w-5 h-5" />
      case 'event':
        return <Calendar className="w-5 h-5" />
      default:
        return <Shield className="w-5 h-5" />
    }
  }

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'global':
        return 'text-red-600 dark:text-red-400'
      case 'category':
        return 'text-blue-600 dark:text-blue-400'
      case 'event':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (currentModeratorRole?.isActive) {
    return (
      <div className="space-y-6">
        {/* Current Role Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Moderator Role</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentModeratorRole.scope === 'global' ? 'Global Moderator' : 
                   currentModeratorRole.scope === 'category' ? 'Category Moderator' : 'Event Moderator'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">Active</span>
            </div>
          </div>

          {/* Role Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Scope</div>
                <div className="flex items-center space-x-2">
                  {getRoleIcon(currentModeratorRole.scope)}
                  <span className={`font-medium capitalize ${getScopeColor(currentModeratorRole.scope)}`}>
                    {currentModeratorRole.scope} Moderator
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Assigned By</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {currentModeratorRole.assignedBy}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Assigned On</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(currentModeratorRole.assignedAt).toLocaleDateString()}
                </div>
              </div>
              {currentModeratorRole.expiresAt && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Expires On</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {new Date(currentModeratorRole.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Permissions */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(currentModeratorRole.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {key === 'canDeletePosts' && <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                    {key === 'canBanUsers' && <Ban className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                    {key === 'canApproveContent' && <CheckCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                    {key === 'canModerateChat' && <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                    {key === 'canManageEvents' && <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {isAdmin && (
              <button
                onClick={() => setShowPermissionsModal(true)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2 inline" />
                Manage Permissions
              </button>
            )}
            <button
              onClick={handleRevoke}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Revoke Role'}
            </button>
          </div>
        </div>

        {/* Moderator Guidelines */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Moderator Guidelines</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Be Fair and Consistent</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Apply rules consistently to all users regardless of their status or relationship with you.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Communicate Clearly</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Provide clear explanations for moderation actions and be responsive to user questions.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Stay Professional</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Maintain professional conduct even in challenging situations.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Document Actions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Keep records of significant moderation decisions for transparency.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Management Modal */}
        {showPermissionsModal && currentModeratorRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPermissionsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Manage Moderator Permissions
              </h3>
              
              <div className="space-y-4">
                {Object.entries(currentModeratorRole.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {key === 'canDeletePosts' && <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                      {key === 'canBanUsers' && <Ban className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                      {key === 'canApproveContent' && <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                      {key === 'canModerateChat' && <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                      {key === 'canManageEvents' && <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {key === 'canDeletePosts' && 'Allow user to delete posts and comments'}
                          {key === 'canBanUsers' && 'Allow user to ban and unban users'}
                          {key === 'canApproveContent' && 'Allow user to approve pending content'}
                          {key === 'canModerateChat' && 'Allow user to moderate chat messages'}
                          {key === 'canManageEvents' && 'Allow user to manage events and registrations'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePermissionsUpdate({
                        ...currentModeratorRole.permissions,
                        [key]: !value
                      })}
                      disabled={isProcessing}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      } disabled:opacity-50`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Admin View - Pending Applications */}
      {isAdmin && pendingApplications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pending Moderator Applications
          </h3>
          
          <div className="space-y-4">
            {pendingApplications.map((application) => (
              <div key={application.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      User {application.userId}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Applied {new Date(application.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">
                    Pending
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Motivation:</strong> {(application as any).data?.motivation || 'No motivation provided'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    <strong>Experience:</strong> {(application as any).data?.experience || 'No experience provided'}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(application.id)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectionModal(application.id)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Form */}
      {!showApplicationForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Become a Moderator</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Help keep Bugema Hub safe and welcoming for everyone
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Moderator Responsibilities:</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>Review and moderate user-generated content</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>Enforce community guidelines and policies</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>Assist users with questions and concerns</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>Report issues to administrators when needed</span>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Requirements:</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>Active member for at least 3 months</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>Clean moderation history</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>Strong understanding of community guidelines</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>Regular availability for moderation tasks</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setShowApplicationForm(true)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Apply to Become a Moderator
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Moderator Application
            </h3>
            <button
              onClick={() => setShowApplicationForm(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleApplicationSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience *
              </label>
              <textarea
                {...register('experience', { required: 'Experience is required' })}
                rows={4}
                placeholder="Describe any relevant experience you have with moderation, community management, or leadership roles..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none dark:bg-gray-700 dark:text-white"
              />
              {errors.experience && (
                <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Availability *
              </label>
              <textarea
                {...register('availability', { required: 'Availability is required' })}
                rows={3}
                placeholder="How much time can you dedicate to moderation each week? What are your typical availability hours?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none dark:bg-gray-700 dark:text-white"
              />
              {errors.availability && (
                <p className="mt-1 text-sm text-red-600">{errors.availability.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivation *
              </label>
              <textarea
                {...register('motivation', { required: 'Motivation is required' })}
                rows={4}
                placeholder="Why do you want to become a moderator? What makes you a good fit for this role?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none dark:bg-gray-700 dark:text-white"
              />
              {errors.motivation && (
                <p className="mt-1 text-sm text-red-600">{errors.motivation.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moderation Areas of Interest
              </label>
              <div className="grid grid-cols-2 gap-2">
                {moderationAreas.map((area) => (
                  <label key={area} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('moderationAreas')}
                      value={area}
                      className="w-4 h-4 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                References (Optional)
              </label>
              <input
                {...register('references')}
                type="text"
                placeholder="Names of users who can vouch for your character (if any)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    Your application will be reviewed by our admin team. This process typically takes 3-5 business days.
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-2">
                    Approved moderators will undergo a brief training period before receiving full permissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowApplicationForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowRejectionModal(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reject Application
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRejectionModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectionModal)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Rejecting...' : 'Reject Application'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
