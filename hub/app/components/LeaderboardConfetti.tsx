'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { Trophy, Crown, Star, Zap } from 'lucide-react'

interface LeaderboardConfettiProps {
  isVisible: boolean
  userRank: number
  previousRank: number
  userName: string
  onClose: () => void
}

export default function LeaderboardConfetti({
  isVisible,
  userRank,
  previousRank,
  userName,
  onClose
}: LeaderboardConfettiProps) {
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (isVisible && userRank <= 10) {
      setShowCelebration(true)
      
      // Trigger confetti based on rank
      const triggerConfetti = async () => {
        const duration = 3000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min
        }

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now()

          if (timeLeft <= 0) {
            return clearInterval(interval)
          }

          const particleCount = 50 * (timeLeft / duration)
          
          // Different confetti patterns based on rank
          if (userRank === 1) {
            // Gold confetti for #1
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
              colors: ['#FFD700', '#FFA500', '#FF8C00']
            })
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              colors: ['#FFD700', '#FFA500', '#FF8C00']
            })
          } else if (userRank <= 3) {
            // Silver/bronze confetti for top 3
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
              colors: ['#C0C0C0', '#CD7F32', '#8B4513']
            })
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              colors: ['#C0C0C0', '#CD7F32', '#8B4513']
            })
          } else {
            // Regular confetti for top 10
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
              colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            })
          }
        }, 250)

        return () => clearInterval(interval)
      }

      triggerConfetti()
    }
  }, [isVisible, userRank])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500" />
      case 2:
        return <Trophy className="w-8 h-8 text-gray-400" />
      case 3:
        return <Trophy className="w-8 h-8 text-orange-600" />
      default:
        return <Star className="w-8 h-8 text-blue-500" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600'
      case 2:
        return 'from-gray-400 to-gray-600'
      case 3:
        return 'from-orange-400 to-orange-600'
      default:
        return 'from-blue-400 to-blue-600'
    }
  }

  const getRankMessage = (rank: number) => {
    switch (rank) {
      case 1:
        return "🏆 Congratulations! You're #1 on the leaderboard!"
      case 2:
        return "🥈 Amazing! You're in the top 2!"
      case 3:
        return "🥉 Great job! You're in the top 3!"
      default:
        return `⭐ Fantastic! You're #${rank} on the leaderboard!`
    }
  }

  const getRankImprovement = () => {
    const improvement = previousRank - userRank
    if (improvement > 0) {
      return `Jumped up ${improvement} position${improvement > 1 ? 's' : ''}!`
    } else if (improvement < 0) {
      return `Moved down ${Math.abs(improvement)} position${Math.abs(improvement) > 1 ? 's' : ''}`
    } else {
      return 'Maintained your position!'
    }
  }

  if (!showCelebration) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getRankColor(userRank)} opacity-10`}></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
        >
          <span className="text-gray-600 dark:text-gray-300 text-xl">×</span>
        </button>

        <div className="relative z-10 text-center">
          {/* Rank Icon */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            {getRankIcon(userRank)}
          </motion.div>

          {/* Rank Number */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2"
            style={{
              backgroundImage: userRank === 1 
                ? 'linear-gradient(to right, #FFD700, #FFA500)'
                : userRank <= 3
                ? 'linear-gradient(to right, #C0C0C0, #CD7F32)'
                : 'linear-gradient(to right, #3B82F6, #10B981)'
            }}
          >
            #{userRank}
          </motion.div>

          {/* User Name */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          >
            {userName}
          </motion.h2>

          {/* Achievement Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-700 dark:text-gray-300 mb-4"
          >
            {getRankMessage(userRank)}
          </motion.p>

          {/* Rank Improvement */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6"
          >
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {getRankImprovement()}
            </span>
          </motion.div>

          {/* Achievement Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-3 gap-4 mb-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userRank <= 10 ? '🔥' : '💪'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {userRank <= 10 ? 'Top 10' : 'Rising'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userRank === 1 ? '👑' : '⭐'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {userRank === 1 ? 'Champion' : 'Elite'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                🎯
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Achieved
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex space-x-3"
          >
            <button
              onClick={() => {
                // Share achievement
                if (navigator.share) {
                  navigator.share({
                    title: `I'm #${userRank} on the Bugema Hub leaderboard!`,
                    text: getRankMessage(userRank),
                    url: window.location.href
                  })
                }
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>

        {/* Animated sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{
              duration: 2,
              delay: 0.5 + i * 0.1,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}

// Hook for triggering confetti celebrations
export function useConfettiCelebration() {
  const triggerCelebration = (rank: number) => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      if (rank === 1) {
        // Gold confetti for #1
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF8C00']
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#FF8C00']
        })
      } else if (rank <= 3) {
        // Silver/bronze confetti for top 3
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#C0C0C0', '#CD7F32', '#8B4513']
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#C0C0C0', '#CD7F32', '#8B4513']
        })
      } else {
        // Regular confetti for top 10
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        })
      }
    }, 250)

    return () => clearInterval(interval)
  }

  return { triggerCelebration }
}
