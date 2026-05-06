'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  X, 
  AlertCircle, 
  Building, 
  Users, 
  Shield, 
  Mail, 
  Phone,
  Globe,
  FileText,
  Upload,
  Settings
} from 'lucide-react'
import { OfficialAccount, VerificationRequest } from '../types/verification'
import toast from 'react-hot-toast'

interface OfficialAccountVerificationProps {
  userId: string
  isAdmin: boolean
  officialAccount?: OfficialAccount
  onRequestVerification: (data: OfficialAccountRequestData) => Promise<void>
  onApproveRequest: (requestId: string) => Promise<void>
  onRejectRequest: (requestId: string, reason: string) => Promise<void>
  onUpdatePermissions: (accountId: string, permissions: OfficialAccount['permissions']) => Promise<void>
  pendingRequests?: VerificationRequest[]
}

interface OfficialAccountRequestData {
  accountType: 'department' | 'club'
  organizationName: string
  contactEmail: string
  contactPhone: string
  website?: string
  description: string
  verificationDocuments: File[]
  facultyAdvisor?: string
  clubMembers?: number
  departmentHead?: string
}

export default function OfficialAccountVerification({
  userId,
  isAdmin,
  officialAccount,
  onRequestVerification,
  onApproveRequest,
  onRejectRequest,
  onUpdatePermissions,
  pendingRequests = []
}: OfficialAccountVerificationProps) {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<OfficialAccountRequestData>()

  const accountType = watch('accountType')

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleRequestSubmit = async (data: OfficialAccountRequestData) => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one verification document')
      return
    }

    setIsSubmitting(true)
    try {
      await onRequestVerification({ ...data, verificationDocuments: uploadedFiles })
      toast.success('Official account request submitted successfully!')
      setShowRequestForm(false)
      reset()
      setUploadedFiles([])
    } catch (error) {
      toast.error('Failed to submit request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    setIsSubmitting(true)
    try {
      await onApproveRequest(requestId)
      toast.success('Request approved successfully!')
    } catch (error) {
      toast.error('Failed to approve request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setIsSubmitting(true)
    try {
      await onRejectRequest(requestId, rejectionReason)
      toast.success('Request rejected')
      setShowRejectionModal(null)
      setRejectionReason('')
    } catch (error) {
      toast.error('Failed to reject request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePermissionUpdate = async (permissions: OfficialAccount['permissions']) => {
    if (!officialAccount) return

    setIsSubmitting(true)
    try {
      await onUpdatePermissions(officialAccount.userId, permissions)
      toast.success('Permissions updated successfully!')
    } catch (error) {
      toast.error('Failed to update permissions')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (officialAccount) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Official Account</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {officialAccount.organizationName} - {officialAccount.accountType}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Verified</span>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Organization Type</div>
              <div className="font-medium text-gray-900 dark:text-white capitalize">
                {officialAccount.accountType}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Verified By</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {officialAccount.verifiedBy}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Verified On</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {new Date(officialAccount.verifiedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Management */}
        {isAdmin && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Permissions</h4>
            <div className="space-y-3">
              {Object.entries(officialAccount.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <button
                    onClick={() => handlePermissionUpdate({
                      ...officialAccount.permissions,
                      [key]: !value
                    })}
                    disabled={isSubmitting}
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
          </div>
        )}

        {/* Benefits */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Official Account Benefits</h5>
              <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                <li>• Blue verification badge on all posts</li>
                <li>• Ability to post to "Announcements" category</li>
                <li>• Priority visibility in search results</li>
                <li>• Access to official account analytics</li>
                <li>• Enhanced moderation tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Admin View - Pending Requests */}
      {isAdmin && pendingRequests.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pending Official Account Requests
          </h3>
          
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {(request.data as any).organizationName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {(request.data as any).accountType} • Requested {new Date(request.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">
                    Pending
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {(request.data as any).description}
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{(request.data as any).contactEmail}</span>
                  </div>
                  {(request.data as any).contactPhone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{(request.data as any).contactPhone}</span>
                    </div>
                  )}
                  {(request.data as any).website && (
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>{(request.data as any).website}</span>
                    </div>
                  )}
                </div>

                {(request.data as any).verificationDocuments && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Documents:</div>
                    <div className="flex flex-wrap gap-2">
                      {(request.data as any).verificationDocuments.map((doc: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                          <FileText className="w-3 h-3" />
                          <span>{typeof doc === 'string' ? doc : doc.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectionModal(request.id)}
                    disabled={isSubmitting}
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

      {/* Request Form */}
      {!showRequestForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Official Account Verification</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get verified as an official university department or club
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">University Department</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                For official university departments and administrative offices
              </p>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li>• Academic departments</li>
                <li>• Administrative offices</li>
                <li>• Research centers</li>
                <li>• Support services</li>
              </ul>
            </div>

            <div className="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">Student Club</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                For officially recognized student clubs and organizations
              </p>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li>• Academic clubs</li>
                <li>• Sports teams</li>
                <li>• Cultural organizations</li>
                <li>• Special interest groups</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setShowRequestForm(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Request Official Verification
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
              Request Official Verification
            </h3>
            <button
              onClick={() => setShowRequestForm(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleRequestSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type *
                </label>
                <select
                  {...register('accountType', { required: 'Account type is required' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select type</option>
                  <option value="department">University Department</option>
                  <option value="club">Student Club</option>
                </select>
                {errors.accountType && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountType.message}</p>
                )}
              </div>

              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  {...register('organizationName', { required: 'Organization name is required' })}
                  placeholder="e.g., Computer Science Department"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                />
                {errors.organizationName && (
                  <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
                )}
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  {...register('contactEmail', { required: 'Contact email is required' })}
                  placeholder="organization@bugema.ac.ug"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  {...register('contactPhone', { required: 'Contact phone is required' })}
                  placeholder="+256 123 456 789"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                )}
              </div>

              {/* Website */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  {...register('website')}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  placeholder="Describe your organization and its purpose..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none dark:bg-gray-700 dark:text-white"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Conditional Fields */}
              {accountType === 'club' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Faculty Advisor
                    </label>
                    <input
                      type="text"
                      {...register('facultyAdvisor')}
                      placeholder="Dr. John Doe"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Members
                    </label>
                    <input
                      type="number"
                      {...register('clubMembers')}
                      placeholder="25"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </>
              )}

              {accountType === 'department' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department Head
                  </label>
                  <input
                    type="text"
                    {...register('departmentHead')}
                    placeholder="Prof. Jane Smith"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Documents *
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="document-upload"
                />
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
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
              Reject Request
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Rejecting...' : 'Reject Request'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
