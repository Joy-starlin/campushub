'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Star, 
  Users, 
  MessageSquare, 
  ThumbsUp,
  Calendar,
  Target,
  Zap,
  Trophy,
  Medal,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { ContributorStats, BadgeType } from '../types/verification'
import toast from 'react-hot-toast'

interface TopContributorSystemProps {
  userStats: ContributorStats
  leaderboard: ContributorStats[]
  currentThreshold: number
  onRefreshStats: () => Promise<void>
}

export default function TopContributorSystem({
  userStats,
  leaderboard,
  currentThreshold,
  onRefreshStats
}: TopContributorSystemProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('all-time')
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefreshStats()
      toast.success('Stats refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh stats')
    } finally {
      setIsRefreshing(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
      {rank}
    </div>
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 dark:text-yellow-400'
    if (rank === 2) return 'text-gray-600 dark:text-gray-400'
    if (rank === 3) return 'text-orange-600 dark:text-orange-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getProgressPercentage = () => {
    if (userStats.rank <= currentThreshold) return 100
    const maxRank = Math.max(...leaderboard.map(s => s.rank))
    const range = maxRank - currentThreshold
    const userRange = userStats.rank - currentThreshold
    return Math.max(0, Math.min(100, ((range - userRange) / range) * 100))
  }

  const getPostsNeeded = () => {
    return Math.max(0, currentThreshold - userStats.totalPosts)
  }

  const getEstimatedTime = () => {
    const weeklyRate = userStats.weeklyPosts
    if (weeklyRate === 0) return 'Not available'
    const weeksNeeded = Math.ceil(getPostsNeeded() / weeklyRate)
    return `~${weeksNeeded} week${weeksNeeded !== 1 ? 's' : ''}`
  }

  const isTopContributor = userStats.rank <= currentThreshold
  const isNearTop = userStats.rank <= currentThreshold + 5

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isTopContributor 
                ? 'bg-yellow-100 dark:bg-yellow-900/20' 
                : isNearTop 
                ? 'bg-orange-100 dark:bg-orange-900/20'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Crown className={`w-6 h-6 ${
                isTopContributor 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : isNearTop
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Contributor</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {isTopContributor 
                  ? 'You\'re in the top 10 contributors!'
                  : isNearTop
                  ? 'Almost there! Keep contributing!'
                  : 'Keep contributing to earn this badge'
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getRankColor(userStats.rank)}`}>
              #{userStats.rank}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Current Rank</div>
          </div>
        </div>

        {/* Progress Bar */}
        {!isTopContributor && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-300">Progress to Top 10</span>
              <span className="text-gray-900 dark:text-white">
                {getPostsNeeded()} more posts needed
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-yellow-500 h-3 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>Estimated time: {getEstimatedTime()}</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {userStats.totalPosts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Posts</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {userStats.totalComments}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Comments</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {userStats.helpfulVotes}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Helpful Votes</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {userStats.weeklyPosts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Weekly Posts</div>
          </div>
        </div>

        {/* Rank Change */}
        {userStats.rankChange !== 0 && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            userStats.rankChange > 0 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {userStats.rankChange > 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {userStats.rankChange > 0 ? 'Moved up' : 'Moved down'} {Math.abs(userStats.rankChange)} positions this week
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Stats'}
          </button>
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showLeaderboard ? 'Hide' : 'View'} Leaderboard
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leaderboard</h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all-time">All Time</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboard.map((contributor, index) => {
              const isCurrentUser = contributor.userId === userStats.userId
              const isTopThree = index < 3
              
              return (
                <motion.div
                  key={contributor.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isCurrentUser 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : isTopThree
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isTopThree ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      {getRankIcon(contributor.rank)}
                    </div>
                    <div>
                      <div className={`font-medium ${
                        isCurrentUser 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {contributor.userId === userStats.userId ? 'You' : `User ${contributor.userId}`}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {contributor.totalPosts} posts • {contributor.helpfulVotes} helpful votes
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`font-bold ${getRankColor(contributor.rank)}`}>
                        #{contributor.rank}
                      </div>
                      {contributor.rankChange !== 0 && (
                        <div className={`flex items-center space-x-1 text-xs ${
                          contributor.rankChange > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {contributor.rankChange > 0 ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                          <span>{Math.abs(contributor.rankChange)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Top Contributor Benefits */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Top Contributor Benefits</h4>
                <ul className="text-yellow-800 dark:text-yellow-200 text-sm space-y-1">
                  <li>• Gold crown badge on profile and posts</li>
                  <li>• Priority visibility in search results</li>
                  <li>• Access to exclusive contributor features</li>
                  <li>• Special recognition in community events</li>
                  <li>• Enhanced moderation privileges</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contribution Tips */}
      {!isTopContributor && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How to Become a Top Contributor</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Post Quality Content</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Share helpful, informative posts that benefit the community
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Get Helpful Votes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Create content that others find valuable and helpful
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Engage with Others</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Comment thoughtfully and participate in discussions
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Be Consistent</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Maintain regular activity to build your reputation
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Your Current Goal</h4>
                <div className="text-blue-800 dark:text-blue-200">
                  <p className="mb-2">
                    You're currently <strong>#{userStats.rank}</strong> on the leaderboard.
                    Need <strong>{getPostsNeeded()}</strong> more posts to reach the top 10.
                  </p>
                  <p className="text-sm">
                    At your current rate, you'll reach the goal in <strong>{getEstimatedTime()}</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
