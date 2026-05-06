'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Lock, 
  Unlock, 
  Star, 
  TrendingUp,
  Eye,
  Award
} from 'lucide-react'
import { Badge } from '../types/gamification'
import { ResponsiveButton } from './ResponsiveForm'

interface BadgeGridProps {
  badges: Badge[]
  userName: string
  onBadgeClick?: (badge: Badge) => void
  showProgress?: boolean
  compact?: boolean
}

export default function BadgeGrid({ 
  badges, 
  userName, 
  onBadgeClick, 
  showProgress = true,
  compact = false 
}: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  const getRarityColor = (rarity: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
    }
    
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-500'
      case 'rare':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500'
      case 'epic':
        return 'bg-purple-100 dark:bg-purple-900/30 border-purple-400 dark:border-purple-500'
      case 'legendary':
        return 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-400 dark:border-yellow-500'
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
    }
  }

  const getRarityTextColor = (rarity: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return 'text-gray-500 dark:text-gray-400'
    }
    
    switch (rarity) {
      case 'common':
        return 'text-gray-700 dark:text-gray-300'
      case 'rare':
        return 'text-blue-700 dark:text-blue-300'
      case 'epic':
        return 'text-purple-700 dark:text-purple-300'
      case 'legendary':
        return 'text-yellow-700 dark:text-yellow-300'
      default:
        return 'text-gray-700 dark:text-gray-300'
    }
  }

  const getProgressPercentage = (badge: Badge) => {
    return Math.min((badge.progress / badge.maxProgress) * 100, 100)
  }

  const getProgressColor = (badge: Badge) => {
    if (!badge.isUnlocked) {
      return 'bg-gray-300 dark:bg-gray-600'
    }
    
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

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge)
    onBadgeClick?.(badge)
  }

  const unlockedBadges = badges.filter(b => b.isUnlocked)
  const lockedBadges = badges.filter(b => !b.isUnlocked)

  const BadgeCard = ({ badge, index }: { badge: Badge; index: number }) => {
    const isUnlocked = badge.isUnlocked
    const progressPercentage = getProgressPercentage(badge)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleBadgeClick(badge)}
        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
          getRarityColor(badge.rarity, isUnlocked)
        } ${
          isUnlocked ? 'shadow-lg hover:shadow-xl' : 'opacity-60 hover:opacity-80'
        }`}
      >
        {/* Lock/Unlock Icon */}
        <div className="absolute top-2 right-2">
          {isUnlocked ? (
            <Unlock className="w-4 h-4 text-green-500" />
          ) : (
            <Lock className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Badge Icon */}
        <div className="text-center mb-3">
          <div className={`text-3xl mb-2 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
            {badge.icon}
          </div>
          
          {/* Rarity Stars */}
          <div className="flex justify-center space-x-1 mb-2">
            {[...Array(badge.rarity === 'legendary' ? 3 : badge.rarity === 'epic' ? 2 : badge.rarity === 'rare' ? 1 : 0)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  isUnlocked 
                    ? badge.rarity === 'legendary' 
                      ? 'text-yellow-500 fill-yellow-500'
                      : badge.rarity === 'epic'
                      ? 'text-purple-500 fill-purple-500'
                      : 'text-blue-500 fill-blue-500'
                    : 'text-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Badge Info */}
        <div className="text-center">
          <h3 className={`font-semibold text-sm mb-1 ${getRarityTextColor(badge.rarity, isUnlocked)}`}>
            {badge.name}
          </h3>
          <p className={`text-xs mb-2 ${getRarityTextColor(badge.rarity, isUnlocked)} opacity-80`}>
            {badge.description}
          </p>
          
          {/* Points */}
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Award className="w-3 h-3" />
            <span className={`text-xs font-medium ${getRarityTextColor(badge.rarity, isUnlocked)}`}>
              +{badge.points} pts
            </span>
          </div>

          {/* Progress Bar */}
          {showProgress && !isUnlocked && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className={getRarityTextColor(badge.rarity, isUnlocked)}>
                  Progress
                </span>
                <span className={getRarityTextColor(badge.rarity, isUnlocked)}>
                  {badge.progress}/{badge.maxProgress}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${getProgressColor(badge)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                />
              </div>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {badge.requirement}
              </p>
            </div>
          )}

          {/* Unlocked Date */}
          {isUnlocked && badge.unlockedAt && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all rounded-xl" />
      </motion.div>
    )
  }

  if (compact) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {badges.map((badge, index) => (
          <div
            key={badge.id}
            className={`aspect-square rounded-lg border-2 flex items-center justify-center text-2xl transition-all ${
              getRarityColor(badge.rarity, badge.isUnlocked)
            } ${!badge.isUnlocked ? 'opacity-50 grayscale' : ''}`}
            title={badge.name}
          >
            {badge.icon}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Badges
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {unlockedBadges.length} of {badges.length} unlocked
          </p>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Rare</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Epic</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Legendary</span>
          </div>
        </div>
      </div>

      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <Unlock className="w-4 h-4 mr-2 text-green-500" />
            Unlocked Badges ({unlockedBadges.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {unlockedBadges.map((badge, index) => (
              <BadgeCard key={badge.id} badge={badge} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <Lock className="w-4 h-4 mr-2 text-gray-400" />
            Locked Badges ({lockedBadges.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lockedBadges.map((badge, index) => (
              <BadgeCard key={badge.id} badge={badge} index={unlockedBadges.length + index} />
            ))}
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Badge Details
              </h3>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-4">
              <div className={`text-6xl mb-3 ${!selectedBadge.isUnlocked ? 'grayscale opacity-50' : ''}`}>
                {selectedBadge.icon}
              </div>
              <h4 className={`text-xl font-bold mb-2 ${getRarityTextColor(selectedBadge.rarity, selectedBadge.isUnlocked)}`}>
                {selectedBadge.name}
              </h4>
              <p className={`text-sm mb-4 ${getRarityTextColor(selectedBadge.rarity, selectedBadge.isUnlocked)}`}>
                {selectedBadge.description}
              </p>
              
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-center">
                  <div className={`text-lg font-bold ${getRarityTextColor(selectedBadge.rarity, selectedBadge.isUnlocked)}`}>
                    +{selectedBadge.points}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Points</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold capitalize ${getRarityTextColor(selectedBadge.rarity, selectedBadge.isUnlocked)}`}>
                    {selectedBadge.rarity}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Rarity</div>
                </div>
              </div>

              {!selectedBadge.isUnlocked && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{selectedBadge.progress}/{selectedBadge.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(selectedBadge)}`}
                      style={{ width: `${getProgressPercentage(selectedBadge)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {selectedBadge.requirement}
                  </p>
                </div>
              )}

              {selectedBadge.isUnlocked && selectedBadge.unlockedAt && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Unlocked on {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <ResponsiveButton
              variant="secondary"
              onClick={() => setSelectedBadge(null)}
              className="w-full"
            >
              Close
            </ResponsiveButton>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
