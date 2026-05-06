'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { 
  Trophy, 
  Share2, 
  X, 
  Sparkles,
  Star
} from 'lucide-react'
import { Badge, Achievement } from '../types/gamification'
import { ResponsiveButton } from './ResponsiveForm'
import toast from 'react-hot-toast'

interface AchievementNotificationProps {
  achievement: Achievement
  badge: Badge
  userName: string
  onClose: () => void
  onShare: (shareableText: string) => void
}

export default function AchievementNotification({
  achievement,
  badge,
  userName,
  onClose,
  onShare
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      // Shoot confetti from left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      
      // Shoot confetti from right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleShare = () => {
    const shareableText = `🎉 ${userName} just earned the "${badge.name}" badge on Bugema Hub! ${badge.description} Join me in building our campus community! 🚀`
    
    if (navigator.share) {
      navigator.share({
        title: 'Achievement Unlocked!',
        text: shareableText,
        url: achievement.shareableLink
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareableText}\n\n${achievement.shareableLink}`)
        toast.success('Achievement link copied to clipboard!')
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareableText}\n\n${achievement.shareableLink}`)
      toast.success('Achievement link copied to clipboard!')
    }
    
    onShare(shareableText)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600'
      case 'rare':
        return 'from-blue-400 to-blue-600'
      case 'epic':
        return 'from-purple-400 to-purple-600'
      case 'legendary':
        return 'from-yellow-400 to-orange-600'
      default:
        return 'from-gray-400 to-gray-600'
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 dark:bg-gray-800'
      case 'rare':
        return 'bg-blue-100 dark:bg-blue-900/30'
      case 'epic':
        return 'bg-purple-100 dark:bg-purple-900/30'
      case 'legendary':
        return 'bg-yellow-100 dark:bg-yellow-900/30'
      default:
        return 'bg-gray-100 dark:bg-gray-800'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && badge && achievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              duration: 0.5
            }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className={`bg-linear-to-r ${getRarityColor(badge.rarity)} p-6 text-center relative overflow-hidden`}>
              {/* Animated background elements */}
              <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full opacity-30"
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 2 + i * 0.2,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${80 + Math.random() * 20}%`,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-4xl">{badge.icon}</span>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Achievement Unlocked!
                  </h2>
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span className="text-lg font-semibold text-white">
                      {badge.name}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className={`p-6 ${getRarityBg(badge.rarity)}`}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-6"
              >
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {badge.description}
                </p>
                
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      +{badge.points}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Points
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {badge.rarity}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Rarity
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Earned on {new Date(achievement.earnedAt).toLocaleDateString()}</span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex space-x-3"
              >
                <ResponsiveButton
                  variant="primary"
                  onClick={handleShare}
                  className="flex-1 min-h-11"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Achievement
                </ResponsiveButton>
                
                <ResponsiveButton
                  variant="secondary"
                  onClick={handleClose}
                  className="min-h-11"
                >
                  <X className="w-4 h-4" />
                </ResponsiveButton>
              </motion.div>
            </div>

            {/* Floating stars animation */}
            <div className="absolute top-4 right-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  style={{
                    top: `${i * 15}px`,
                    right: `${i * 5}px`,
                  }}
                >
                  <Star className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
