'use client'

import { motion } from 'framer-motion'
import { 
  Mail, 
  TrendingUp, 
  Trophy, 
  Star, 
  Calendar,
  Award,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  Share2
} from 'lucide-react'
import { WeeklyDigest as WeeklyDigestType, Badge } from '../types/gamification'
import { ResponsiveButton } from './ResponsiveForm'

interface WeeklyDigestProps {
  digest: WeeklyDigestType
  userName: string
  userAvatar?: string
  onShare: () => void
}

export default function WeeklyDigest({ 
  digest, 
  userName, 
  userAvatar, 
  onShare 
}: WeeklyDigestProps) {
  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-500" />
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getRankChangeText = (change: number) => {
    if (change > 0) return `Moved up ${change} position${change > 1 ? 's' : ''}`
    if (change < 0) return `Moved down ${Math.abs(change)} position${Math.abs(change) > 1 ? 's' : ''}`
    return 'Maintained position'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getProgressPercentage = () => {
    return Math.min((digest.nextBadgeProgress.progress / digest.nextBadgeProgress.badge.maxProgress) * 100, 100)
  }

  const getProgressColor = (badge: Badge) => {
    switch (badge.rarity) {
      case 'common':
        return 'bg-gray-400 dark:bg-gray-500'
      case 'rare':
        return 'bg-blue-400 dark:bg-blue-500'
      case 'epic':
        return 'bg-purple-400 dark:bg-purple-500'
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-400'
      default:
        return 'bg-gray-400 dark:bg-gray-500'
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Email Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Weekly Digest</h1>
              <p className="text-blue-100">Your Bugema Hub Progress Report</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">
              {formatDate(digest.weekStart)} - {formatDate(digest.weekEnd)}
            </div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Hi {userName}! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Here's your weekly progress on Bugema Hub
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Rank Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Leaderboard Performance
            </h3>
            <div className="flex items-center space-x-2">
              {getRankChangeIcon(digest.rankChange)}
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {getRankChangeText(digest.rankChange)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                #{digest.currentRank}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Current Rank</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                #{digest.previousRank}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Previous Rank</div>
            </div>
          </div>
        </motion.div>

        {/* Points Earned */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Points This Week
              </h3>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                +{digest.pointsEarned}
              </div>
            </div>
            <div className="text-4xl">🌟</div>
          </div>
        </motion.div>

        {/* New Badges */}
        {digest.newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4"
          >
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center mb-3">
              <Award className="w-5 h-5 mr-2" />
              New Badges Earned
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {digest.newBadges.map((badge: any, index: number) => (
                <div
                  key={badge.id}
                  className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700"
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-medium text-purple-900 dark:text-purple-100">
                    {badge.name}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">
                    +{badge.points} pts
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Next Badge Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4"
        >
          <h3 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center mb-3">
            <Target className="w-5 h-5 mr-2" />
            Next Badge Progress
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{digest.nextBadgeProgress.badge.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-orange-900 dark:text-orange-100">
                  {digest.nextBadgeProgress.badge.name}
                </span>
                <span className="text-sm text-orange-700 dark:text-orange-300">
                  {digest.nextBadgeProgress.progress}/{digest.nextBadgeProgress.badge.maxProgress}
                </span>
              </div>
              <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-3">
                <motion.div
                  className={`h-3 rounded-full ${getProgressColor(digest.nextBadgeProgress.badge)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                />
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                {digest.nextBadgeProgress.badge.requirement}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Keep up the great work! Every contribution helps build our campus community.
          </p>
          <div className="flex space-x-3 justify-center">
            <ResponsiveButton
              variant="primary"
              onClick={onShare}
              className="min-h-11"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Progress
            </ResponsiveButton>
            <ResponsiveButton
              variant="secondary"
              onClick={() => window.open('/leaderboard', '_blank')}
              className="min-h-11"
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Leaderboard
            </ResponsiveButton>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            <Calendar className="w-4 h-4 inline mr-1" />
            Next digest: {formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())}
          </div>
          <div>
            Bugema Hub • Building Better Communities
          </div>
        </div>
      </div>
    </div>
  )
}
