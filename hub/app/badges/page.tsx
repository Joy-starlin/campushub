'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Medal, Trophy, Award, Star } from 'lucide-react'
import { BADGE_CONFIG } from '../lib/gamification'
import { Badge } from '../types/gamification'
import BadgeGrid from '../components/BadgeGrid'
import ResponsiveContainer from '../components/ResponsiveContainer'

// Mock Data
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

export default function BadgesPage() {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge)
  }

  const unlockedCount = mockUserBadges.filter(b => b.isUnlocked).length
  const totalCount = mockUserBadges.length
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ResponsiveContainer>
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-sm">
                <Medal className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Badges & Achievements
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Track your progress and showcase your academic and community achievements
                </p>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </div>

      <ResponsiveContainer>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{unlockedCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1,250</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount - unlockedCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Badges Remaining</div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Badges</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Complete interactions around the platform to earn more badges
            </p>
          </div>
          
          <BadgeGrid
            badges={mockUserBadges}
            userName="You"
            onBadgeClick={handleBadgeClick}
            showProgress={true}
          />
        </motion.div>
      </ResponsiveContainer>
    </div>
  )
}
