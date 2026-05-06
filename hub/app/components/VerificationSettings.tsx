'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Star, 
  Crown, 
  Award, 
  Settings,
  RefreshCw,
  Info,
  TrendingUp,
  Calendar,
  Mail,
  CreditCard,
  UserCheck
} from 'lucide-react'
import { Badge, BadgeType, VerificationProgress, UserVerification } from '../types/verification'
import { BADGE_CONFIG, VERIFICATION_REQUIREMENTS } from '../types/verification'
import StudentVerificationFlow from './StudentVerificationFlow'
import toast from 'react-hot-toast'

interface VerificationSettingsProps {
  userVerification: UserVerification
  onReverify: (badgeType: BadgeType) => Promise<void>
  onUpgradeToPremium: () => Promise<void>
  onRequestModeratorRole: () => Promise<void>
}

export default function VerificationSettings({
  userVerification,
  onReverify,
  onUpgradeToPremium,
  onRequestModeratorRole
}: VerificationSettingsProps) {
  const [showVerificationFlow, setShowVerificationFlow] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleReverify = async (badgeType: BadgeType) => {
    setIsProcessing(true)
    try {
      await onReverify(badgeType)
      toast.success('Reverification request submitted')
    } catch (error) {
      toast.error('Failed to submit reverification request')
    } finally {
      setIsProcessing(false)
    }
  }

  const getBadgeStatus = (badgeType: BadgeType) => {
    const badge = userVerification.badges.find(b => b.type === badgeType)
    if (badge) {
      if (badge.expiresAt && new Date(badge.expiresAt) < new Date()) {
        return 'expired'
      }
      return 'earned'
    }
    return 'unearned'
  }

  const getBadgeProgress = (badgeType: BadgeType): VerificationProgress | null => {
    const badge = userVerification.badges.find(b => b.type === badgeType)
    if (badge?.progress) {
      return {
        badgeType,
        isEligible: badge.progress.current >= badge.progress.required,
        currentProgress: badge.progress.current,
        requiredProgress: badge.progress.required,
        requirements: VERIFICATION_REQUIREMENTS[badgeType],
        nextSteps: badge.progress.current < badge.progress.required 
          ? [badge.progress.description] 
          : []
      }
    }
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'earned':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'earned':
        return 'Verified'
      case 'expired':
        return 'Expired'
      case 'pending':
        return 'Pending'
      default:
        return 'Not Verified'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'earned':
        return 'text-green-600 dark:text-green-400'
      case 'expired':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'pending':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getActionButton = (badgeType: BadgeType, status: string) => {
    switch (badgeType) {
      case 'verified-student':
        if (status === 'unearned') {
          return (
            <button
              onClick={() => setShowVerificationFlow(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Verify Now
            </button>
          )
        }
        if (status === 'expired') {
          return (
            <button
              onClick={() => handleReverify(badgeType)}
              disabled={isProcessing}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Reverify'}
            </button>
          )
        }
        return null

      case 'top-contributor':
        const progress = getBadgeProgress(badgeType)
        if (progress && !progress.isEligible) {
          return (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {progress.currentProgress}/{progress.requiredProgress} posts needed
            </div>
          )
        }
        return null

      case 'premium-member':
        if (status === 'unearned') {
          return (
            <button
              onClick={onUpgradeToPremium}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Upgrade to Premium
            </button>
          )
        }
        return null

      case 'moderator':
        if (status === 'unearned') {
          return (
            <button
              onClick={onRequestModeratorRole}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Apply for Moderator
            </button>
          )
        }
        return null

      default:
        return null
    }
  }

  const badgeCards: Array<{
    type: BadgeType
    title: string
    description: string
    icon: React.ReactNode
    action?: string
  }> = [
    {
      type: 'verified-student',
      title: 'Student Verification',
      description: 'Verify your student status with university email or ID',
      icon: <Mail className="w-6 h-6" />,
      action: 'Required for full access'
    },
    {
      type: 'alumni',
      title: 'Alumni Status',
      description: 'Confirm your Bugema University graduate status',
      icon: <Award className="w-6 h-6" />,
      action: 'Connect with alumni network'
    },
    {
      type: 'top-contributor',
      title: 'Top Contributor',
      description: 'Earn by being in the top 10 of the community leaderboard',
      icon: <Crown className="w-6 h-6" />,
      action: 'Based on activity'
    },
    {
      type: 'premium-member',
      title: 'Premium Member',
      description: 'Get exclusive features and benefits with Premium plan',
      icon: <Star className="w-6 h-6" />,
      action: 'Monthly subscription'
    },
    {
      type: 'moderator',
      title: 'Moderator',
      description: 'Help moderate the community and keep it safe',
      icon: <Shield className="w-6 h-6" />,
      action: 'Apply for role'
    },
    {
      type: 'official',
      title: 'Official Account',
      description: 'Official university department or club account',
      icon: <UserCheck className="w-6 h-6" />,
      action: 'Admin approval only'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Trust Score Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trust Score</h3>
              <p className="text-gray-600 dark:text-gray-300">Your account verification level</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {userVerification.trustScore}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">out of 100</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {userVerification.badges.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Badges Earned</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {userVerification.verificationLevel}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Verification Level</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {userVerification.needsReverification ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Needs Reverification</div>
          </div>
        </div>
      </div>

      {/* Student Verification Flow */}
      {showVerificationFlow && (
        <StudentVerificationFlow
          userId={userVerification.userId}
          currentVerification={userVerification.verificationRequests.find(r => r.badgeType === 'verified-student')}
          onEmailVerification={async (email) => {
            // Simulate email verification
            await new Promise(resolve => setTimeout(resolve, 1000))
            return { success: true }
          }}
          onIDUpload={async (file) => {
            // Simulate ID upload
            await new Promise(resolve => setTimeout(resolve, 1000))
            return { success: true, documentId: 'doc-123' }
          }}
          onOTPSubmit={async (otp) => {
            // Simulate OTP verification
            await new Promise(resolve => setTimeout(resolve, 1000))
            return { success: true }
          }}
          onResendOTP={async () => {
            // Simulate resend OTP
            await new Promise(resolve => setTimeout(resolve, 1000))
            return { success: true }
          }}
        />
      )}

      {/* Badge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {badgeCards.map((card) => {
          const config = BADGE_CONFIG[card.type]
          const status = getBadgeStatus(card.type)
          const progress = getBadgeProgress(card.type)
          const badge = userVerification.badges.find(b => b.type === card.type)

          return (
            <div
              key={card.type}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: config.color }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{card.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{card.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {progress && !progress.isEligible && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300">Progress</span>
                    <span className="text-gray-900 dark:text-white">
                      {progress.currentProgress}/{progress.requiredProgress}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.currentProgress / progress.requiredProgress) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Requirements:</div>
                <ul className="space-y-1">
                  {VERIFICATION_REQUIREMENTS[card.type].map((req, index) => (
                    <li key={index} className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Info */}
              {card.action && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Info className="w-3 h-3" />
                    <span>{card.action}</span>
                  </div>
                </div>
              )}

              {/* Expiry Warning */}
              {badge?.expiresAt && new Date(badge.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        Expires: {new Date(badge.expiresAt).toLocaleDateString()}
                      </p>
                      <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                        Please reverify to maintain your status
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end">
                {getActionButton(card.type, status)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Reverification Reminder */}
      {userVerification.needsReverification && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Reverification Required
              </h4>
              <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                Some of your verifications are expiring soon. Please update your information to maintain your verification status.
              </p>
              {userVerification.reverificationDate && (
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Deadline: {new Date(userVerification.reverificationDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
