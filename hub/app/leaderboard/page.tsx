'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, TrendingUp, Award } from 'lucide-react'
import { LeaderboardEntry, LeaderboardFilter, Badge, User, Achievement } from '../types/gamification'
import LeaderboardPage from '../components/LeaderboardPage'
import AchievementNotification from '../components/AchievementNotification'
import BadgeGrid from '../components/BadgeGrid'
import WeeklyDigest from '../components/WeeklyDigest'
import ResponsiveContainer from '../components/ResponsiveContainer'
import { BADGE_CONFIG } from '../lib/gamification'
import toast from 'react-hot-toast'

// Mock data
const mockCurrentUser: User = {
  id: 'current-user',
  name: 'Alex Johnson',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  university: 'Bugema University',
  country: 'Uganda',
  countryCode: 'UG',
  isVerified: true,
  totalPoints: 1250,
  currentRank: 15,
  previousRank: 18,
  rankChange: 3,
  streak: 12,
  lastActiveDate: new Date().toISOString()
}

const mockLeaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    user: {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
      university: 'Bugema University',
      country: 'Uganda',
      countryCode: 'UG',
      isVerified: true,
      totalPoints: 3450,
      currentRank: 1,
      previousRank: 2,
      rankChange: 1,
      streak: 45,
      lastActiveDate: new Date().toISOString()
    },
    points: 3450,
    topBadge: BADGE_CONFIG.topContributor,
    weeklyChange: 2,
    monthlyChange: 5
  },
  {
    rank: 2,
    user: {
      id: '2',
      name: 'Michael Okonkwo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      university: 'Makerere University',
      country: 'Uganda',
      countryCode: 'UG',
      isVerified: true,
      totalPoints: 3280,
      currentRank: 2,
      previousRank: 1,
      rankChange: -1,
      streak: 38,
      lastActiveDate: new Date().toISOString()
    },
    points: 3280,
    topBadge: BADGE_CONFIG.studyLeader,
    weeklyChange: -1,
    monthlyChange: 2
  },
  {
    rank: 3,
    user: {
      id: '3',
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      university: 'University of Nairobi',
      country: 'Kenya',
      countryCode: 'KE',
      isVerified: true,
      totalPoints: 3150,
      currentRank: 3,
      previousRank: 4,
      rankChange: 1,
      streak: 52,
      lastActiveDate: new Date().toISOString()
    },
    points: 3150,
    topBadge: BADGE_CONFIG.globalCitizen,
    weeklyChange: 3,
    monthlyChange: 8
  },
  // Add more mock users...
  ...Array.from({ length: 47 }, (_, i) => ({
    rank: i + 4,
    user: {
      id: `user-${i + 4}`,
      name: `User ${i + 4}`,
      avatar: `https://picsum.photos/seed/user${i + 4}/100/100.jpg`,
      university: ['Bugema University', 'Makerere University', 'University of Nairobi', 'Kenyatta University'][i % 4],
      country: ['Uganda', 'Kenya', 'Tanzania', 'Rwanda'][i % 4],
      countryCode: ['UG', 'KE', 'TZ', 'RW'][i % 4],
      isVerified: Math.random() > 0.3,
      totalPoints: Math.floor(Math.random() * 2000) + 500,
      currentRank: i + 4,
      previousRank: i + 4 + Math.floor(Math.random() * 5) - 2,
      rankChange: Math.floor(Math.random() * 5) - 2,
      streak: Math.floor(Math.random() * 30),
      lastActiveDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    points: Math.floor(Math.random() * 2000) + 500,
    topBadge: Object.values(BADGE_CONFIG)[Math.floor(Math.random() * Object.values(BADGE_CONFIG).length)],
    weeklyChange: Math.floor(Math.random() * 10) - 5,
    monthlyChange: Math.floor(Math.random() * 20) - 10
  }))
]

const mockUserBadges: Badge[] = [
  { ...BADGE_CONFIG.firstPost, isUnlocked: true, progress: 1, unlockedAt: '2026-03-15T10:00:00Z' },
  { ...BADGE_CONFIG.socialButterfly, isUnlocked: true, progress: 5, unlockedAt: '2026-04-01T14:30:00Z' },
  { ...BADGE_CONFIG.eventGoer, isUnlocked: true, progress: 10, unlockedAt: '2026-04-10T09:15:00Z' },
  { ...BADGE_CONFIG.verifiedScholar, isUnlocked: true, progress: 1, unlockedAt: '2026-02-20T16:45:00Z' },
  { ...BADGE_CONFIG.marketplacePro, isUnlocked: false, progress: 3 },
  { ...BADGE_CONFIG.goodSamaritan, isUnlocked: false, progress: 0 },
  { ...BADGE_CONFIG.studyLeader, isUnlocked: false, progress: 7 },
  { ...BADGE_CONFIG.globalCitizen, isUnlocked: false, progress: 2 },
  { ...BADGE_CONFIG.topContributor, isUnlocked: false, progress: 0 },
  { ...BADGE_CONFIG.pioneer, isUnlocked: false, progress: 0 }
]

export default function LeaderboardMainPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(mockLeaderboardData)
  const [currentFilter, setCurrentFilter] = useState<LeaderboardFilter>({
    timeFrame: 'all-time',
    scope: 'all'
  })
  const [showAchievement, setShowAchievement] = useState(false)
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const [showDigest, setShowDigest] = useState(false)

  // Simulate achievement notification
  useEffect(() => {
    const timer = setTimeout(() => {
      const achievement: Achievement = {
        id: 'ach-demo',
        badgeId: 'social-butterfly',
        userId: mockCurrentUser.id,
        earnedAt: new Date().toISOString(),
        pointsAwarded: 15,
        shareableLink: 'https://bugemahub.edu/achievement/social-butterfly'
      }
      setCurrentAchievement(achievement)
      setShowAchievement(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleFilterChange = (filter: LeaderboardFilter) => {
    setCurrentFilter(filter)
    // In a real app, this would fetch filtered data from the API
    console.log('Filter changed:', filter)
  }

  const handleAchievementClose = () => {
    setShowAchievement(false)
    setCurrentAchievement(null)
  }

  const handleAchievementShare = (shareableText: string) => {
    console.log('Sharing achievement:', shareableText)
  }

  const handleDigestShare = () => {
    console.log('Sharing weekly digest')
    toast.success('Weekly digest shared!')
  }

  const handleBadgeClick = (badge: Badge) => {
    console.log('Badge clicked:', badge)
  }

  // Mock weekly digest data
  const weeklyDigest = {
    userId: mockCurrentUser.id,
    currentRank: mockCurrentUser.currentRank,
    previousRank: mockCurrentUser.previousRank,
    rankChange: mockCurrentUser.rankChange,
    pointsEarned: 85,
    newBadges: [BADGE_CONFIG.eventGoer],
    nextBadgeProgress: {
      badge: BADGE_CONFIG.marketplacePro,
      progress: 3
    },
    weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    weekEnd: new Date().toISOString()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Achievement Notification */}
      {showAchievement && currentAchievement && (
        <AchievementNotification
          achievement={currentAchievement}
          badge={BADGE_CONFIG[currentAchievement.badgeId as keyof typeof BADGE_CONFIG]}
          userName={mockCurrentUser.name}
          onClose={handleAchievementClose}
          onShare={handleAchievementShare}
        />
      )}

      <LeaderboardPage
        currentUser={mockCurrentUser}
        leaderboardData={leaderboardData}
        onFilterChange={handleFilterChange}
      />

      {/* User Stats Section */}
      <ResponsiveContainer>
        <div className="py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Your Badges */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Your Badges
              </h2>
              <BadgeGrid
                badges={mockUserBadges}
                userName={mockCurrentUser.name}
                onBadgeClick={handleBadgeClick}
                showProgress={true}
              />
            </div>

            {/* Weekly Digest Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Weekly Progress
                </h2>
                <button
                  onClick={() => setShowDigest(!showDigest)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  {showDigest ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              {!showDigest ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      #{mockCurrentUser.currentRank}
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">Current Rank</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {mockCurrentUser.totalPoints}
                    </div>
                    <div className="text-sm text-green-800 dark:text-green-200">Total Points</div>
                  </div>
                </div>
              ) : (
                <WeeklyDigest
                  digest={weeklyDigest}
                  userName={mockCurrentUser.name}
                  userAvatar={mockCurrentUser.avatar}
                  onShare={handleDigestShare}
                />
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockUserBadges.filter(b => b.isUnlocked).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Badges Earned</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockCurrentUser.rankChange > 0 ? '+' : ''}{mockCurrentUser.rankChange}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Rank Change</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockCurrentUser.streak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Day Streak</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockUserBadges.filter(b => !b.isUnlocked).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Badges Left</div>
            </div>
          </motion.div>
        </div>
      </ResponsiveContainer>
    </div>
  )
}
