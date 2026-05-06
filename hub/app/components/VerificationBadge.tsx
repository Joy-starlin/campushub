'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  GraduationCap, 
  Award, 
  Crown, 
  Star, 
  Shield,
  Info
} from 'lucide-react'
import { BadgeType, BadgeTooltip } from '../types/verification'
import { BADGE_CONFIG } from '../types/verification'

interface VerificationBadgeProps {
  badge: BadgeType
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  earnedAt?: string
  expiresAt?: string
}

export default function VerificationBadge({
  badge,
  size = 'md',
  showTooltip = true,
  tooltipPosition = 'top',
  className = '',
  earnedAt,
  expiresAt
}: VerificationBadgeProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  
  const config = BADGE_CONFIG[badge]
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const getIcon = (badgeType: BadgeType) => {
    switch (badgeType) {
      case 'official':
        return <CheckCircle className="w-full h-full" />
      case 'verified-student':
        return <GraduationCap className="w-full h-full" />
      case 'alumni':
        return <Award className="w-full h-full" />
      case 'top-contributor':
        return <Crown className="w-full h-full" />
      case 'premium-member':
        return <Star className="w-full h-full" />
      case 'moderator':
        return <Shield className="w-full h-full" />
      default:
        return <CheckCircle className="w-full h-full" />
    }
  }

  const getTooltipContent = (): BadgeTooltip => {
    const baseTooltip = {
      badgeType: badge,
      title: config.name,
      description: config.description,
      earnedDate: earnedAt,
      expiryDate: expiresAt
    }

    switch (badge) {
      case 'official':
        return {
          ...baseTooltip,
          additionalInfo: 'Official university account verified by administration'
        }
      case 'verified-student':
        return {
          ...baseTooltip,
          additionalInfo: 'Verified student at Bugema University'
        }
      case 'alumni':
        return {
          ...baseTooltip,
          additionalInfo: 'Confirmed Bugema University graduate'
        }
      case 'top-contributor':
        return {
          ...baseTooltip,
          additionalInfo: 'Top 10 contributor on the community leaderboard'
        }
      case 'premium-member':
        return {
          ...baseTooltip,
          additionalInfo: 'Premium plan subscriber with exclusive benefits'
        }
      case 'moderator':
        return {
          ...baseTooltip,
          additionalInfo: 'Community moderator with content management privileges'
        }
      default:
        return baseTooltip
    }
  }

  const tooltipContent = getTooltipContent()

  const formatTooltipText = () => {
    let text = tooltipContent.title
    if (tooltipContent.earnedDate) {
      text += `\nEarned: ${new Date(tooltipContent.earnedDate).toLocaleDateString()}`
    }
    if (tooltipContent.expiryDate) {
      text += `\nExpires: ${new Date(tooltipContent.expiryDate).toLocaleDateString()}`
    }
    if (tooltipContent.additionalInfo) {
      text += `\n${tooltipContent.additionalInfo}`
    }
    return text
  }

  const getTooltipPositionClasses = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    }
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center cursor-help transition-colors`}
        style={{ backgroundColor: config.color }}
        onMouseEnter={() => showTooltip && setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {getIcon(badge)}
      </motion.div>

      <AnimatePresence>
        {isTooltipVisible && showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute z-50 ${getTooltipPositionClasses()} w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700 dark:border-gray-600`}
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color }}>
                  {getIcon(badge)}
                </div>
                <h4 className="font-semibold text-sm">{tooltipContent.title}</h4>
              </div>
              
              <p className="text-xs text-gray-300">{tooltipContent.description}</p>
              
              {tooltipContent.earnedDate && (
                <div className="text-xs text-gray-400">
                  Earned: {new Date(tooltipContent.earnedDate).toLocaleDateString()}
                </div>
              )}
              
              {tooltipContent.expiryDate && (
                <div className="text-xs text-yellow-400">
                  Expires: {new Date(tooltipContent.expiryDate).toLocaleDateString()}
                </div>
              )}
              
              {tooltipContent.additionalInfo && (
                <div className="text-xs text-gray-400 pt-1 border-t border-gray-700">
                  {tooltipContent.additionalInfo}
                </div>
              )}
            </div>
            
            {/* Tooltip arrow */}
            <div className={`absolute ${tooltipPosition === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 -mt-1' : 
              tooltipPosition === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 -mt-1' :
              tooltipPosition === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 -ml-1' :
              'right-full top-1/2 transform -translate-y-1/2 -mr-1'
            } w-2 h-2 bg-gray-900 dark:bg-gray-800 border-r border-b border-gray-700 dark:border-gray-600 rotate-45`}></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Component for displaying multiple badges
export function BadgeList({ 
  badges, 
  size = 'md', 
  className = '',
  maxDisplay = 3 
}: { 
  badges: BadgeType[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
  maxDisplay?: number
}) {
  const displayBadges = badges.slice(0, maxDisplay)
  const remainingCount = badges.length - maxDisplay

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {displayBadges.map((badge, index) => (
        <VerificationBadge
          key={badge}
          badge={badge}
          size={size}
          showTooltip={true}
        />
      ))}
      {remainingCount > 0 && (
        <div className={`flex items-center justify-center ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} bg-gray-200 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300`}>
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

// Component for displaying badges with user name
export function UserWithBadges({ 
  userName, 
  badges, 
  size = 'md', 
  className = '',
  showAllBadges = false 
}: { 
  userName: string
  badges: BadgeType[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showAllBadges?: boolean
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="font-medium text-gray-900 dark:text-white">{userName}</span>
      <BadgeList 
        badges={badges} 
        size={size} 
        maxDisplay={showAllBadges ? badges.length : 2}
      />
    </div>
  )
}

// Component for badge section on profile page
export function ProfileBadgesSection({ 
  badges, 
  className = '' 
}: { 
  badges: Array<{ type: BadgeType; earnedAt?: string; expiresAt?: string }>
  className?: string
}) {
  const earnedBadges = badges.filter(badge => BADGE_CONFIG[badge.type])
  
  if (earnedBadges.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification Badges</h3>
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">No badges earned yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Complete verification to earn your first badge
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification Badges</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {earnedBadges.map((badge) => {
          const config = BADGE_CONFIG[badge.type]
          return (
            <div
              key={badge.type}
              className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: config.color }}
              >
                {(() => {
                  switch (badge.type) {
                    case 'official':
                      return <CheckCircle className="w-6 h-6 text-white" />
                    case 'verified-student':
                      return <GraduationCap className="w-6 h-6 text-white" />
                    case 'alumni':
                      return <Award className="w-6 h-6 text-white" />
                    case 'top-contributor':
                      return <Crown className="w-6 h-6 text-white" />
                    case 'premium-member':
                      return <Star className="w-6 h-6 text-white" />
                    case 'moderator':
                      return <Shield className="w-6 h-6 text-white" />
                    default:
                      return <CheckCircle className="w-6 h-6 text-white" />
                  }
                })()}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{config.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{config.description}</p>
                {badge.earnedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
                {badge.expiresAt && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Expires: {new Date(badge.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Component for post card with official border
export function OfficialPostCard({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-blue-200 dark:border-blue-800 ${className}`}>
      <div className="absolute top-2 right-2">
        <VerificationBadge badge="official" size="sm" />
      </div>
      {children}
    </div>
  )
}
