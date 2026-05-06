import { 
  PointsTransaction, 
  PointsSource, 
  Badge, 
  Achievement, 
  User, 
  StreakData,
  BadgeConfig,
  PointsConfig 
} from '../types/gamification'

export const POINTS_CONFIG: PointsConfig = {
  postPublished: 10,
  postLikesBonus: 5,
  eventAttended: 15,
  clubJoined: 5,
  studyGroupHelp: 8,
  marketplaceSold: 10,
  lostItemFound: 20,
  accountVerified: 25,
  referralJoined: 30,
  streakBonus: 20
}

export const BADGE_CONFIG: BadgeConfig = {
  firstPost: {
    id: 'first-post',
    name: 'First Post',
    description: 'Publish your first post',
    icon: '📝',
    category: 'social',
    rarity: 'common',
    points: 5,
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    requirement: 'Publish 1 post'
  },
  socialButterfly: {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Join 5 clubs',
    icon: '🦋',
    category: 'social',
    rarity: 'rare',
    points: 15,
    isUnlocked: false,
    progress: 0,
    maxProgress: 5,
    requirement: 'Join 5 clubs'
  },
  eventGoer: {
    id: 'event-goer',
    name: 'Event Goer',
    description: 'Attend 10 events',
    icon: '🎉',
    category: 'social',
    rarity: 'rare',
    points: 20,
    isUnlocked: false,
    progress: 0,
    maxProgress: 10,
    requirement: 'Attend 10 events'
  },
  marketplacePro: {
    id: 'marketplace-pro',
    name: 'Marketplace Pro',
    description: 'Sell 5 items',
    icon: '💼',
    category: 'community',
    rarity: 'rare',
    points: 15,
    isUnlocked: false,
    progress: 0,
    maxProgress: 5,
    requirement: 'Sell 5 items'
  },
  goodSamaritan: {
    id: 'good-samaritan',
    name: 'Good Samaritan',
    description: 'Return a lost item',
    icon: '🤝',
    category: 'community',
    rarity: 'epic',
    points: 25,
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    requirement: 'Return 1 lost item'
  },
  studyLeader: {
    id: 'study-leader',
    name: 'Study Leader',
    description: 'Create a study group with 10+ members',
    icon: '📚',
    category: 'academic',
    rarity: 'epic',
    points: 30,
    isUnlocked: false,
    progress: 0,
    maxProgress: 10,
    requirement: 'Create study group with 10+ members'
  },
  globalCitizen: {
    id: 'global-citizen',
    name: 'Global Citizen',
    description: 'Connect with members from 5 countries',
    icon: '🌍',
    category: 'social',
    rarity: 'epic',
    points: 25,
    isUnlocked: false,
    progress: 0,
    maxProgress: 5,
    requirement: 'Connect with members from 5 countries'
  },
  verifiedScholar: {
    id: 'verified-scholar',
    name: 'Verified Scholar',
    description: 'Get student ID verified',
    icon: '✅',
    category: 'achievement',
    rarity: 'rare',
    points: 25,
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    requirement: 'Verify student ID'
  },
  topContributor: {
    id: 'top-contributor',
    name: 'Top Contributor',
    description: 'Reach top 10 on leaderboard',
    icon: '🏆',
    category: 'achievement',
    rarity: 'legendary',
    points: 50,
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    requirement: 'Reach top 10 on leaderboard'
  },
  pioneer: {
    id: 'pioneer',
    name: 'Pioneer',
    description: 'One of first 100 members',
    icon: '🚀',
    category: 'achievement',
    rarity: 'legendary',
    points: 40,
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    requirement: 'Be among first 100 members'
  }
}

export class GamificationService {
  static createPointsTransaction(
    userId: string,
    source: PointsSource,
    points: number,
    description: string,
    relatedEntityId?: string
  ): PointsTransaction {
    return {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: source === 'streak-bonus' ? 'bonus' : 'earned',
      source,
      points,
      description,
      timestamp: new Date().toISOString(),
      relatedEntityId
    }
  }

  static calculatePostLikesBonus(likes: number): number {
    const bonusThresholds = [10, 25, 50, 100, 250]
    let totalBonus = 0
    
    for (const threshold of bonusThresholds) {
      if (likes >= threshold) {
        totalBonus += POINTS_CONFIG.postLikesBonus
      }
    }
    
    return totalBonus
  }

  static calculateStreakBonus(streak: number): number {
    if (streak >= 7) {
      return POINTS_CONFIG.streakBonus
    }
    return 0
  }

  static updateStreak(streakData: StreakData, wasActiveToday: boolean): StreakData {
    const today = new Date().toISOString().split('T')[0]
    const lastActive = new Date(streakData.lastActiveDate).toISOString().split('T')[0]
    
    let newStreak = streakData.currentStreak
    let newLongestStreak = streakData.longestStreak
    
    if (wasActiveToday) {
      if (lastActive === today) {
        // Already active today, no change
        return streakData
      }
      
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      if (lastActive === yesterdayStr) {
        // Continuing streak
        newStreak++
      } else {
        // New streak
        newStreak = 1
      }
      
      newLongestStreak = Math.max(newLongestStreak, newStreak)
    } else {
      // Streak broken
      newStreak = 0
    }
    
    return {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: wasActiveToday ? today : streakData.lastActiveDate,
      streakHistory: [
        ...streakData.streakHistory.slice(-29), // Keep last 30 days
        { date: today, wasActive: wasActiveToday }
      ]
    }
  }

  static checkBadgeProgress(
    userId: string,
    currentBadges: Badge[],
    userStats: {
      postsCount: number
      clubsJoined: number
      eventsAttended: number
      itemsSold: number
      lostItemsReturned: number
      studyGroupMembers: number
      countriesConnected: number
      isVerified: boolean
      leaderboardRank: number
      memberNumber: number
    }
  ): { updatedBadges: Badge[], newAchievements: Achievement[] } {
    const updatedBadges = [...currentBadges]
    const newAchievements: Achievement[] = []

    const checkAndUnlockBadge = (badgeKey: keyof BadgeConfig, progress: number) => {
      const badge = { ...BADGE_CONFIG[badgeKey] }
      const existingBadge = updatedBadges.find(b => b.id === badge.id)
      
      if (existingBadge) {
        // Update progress
        existingBadge.progress = Math.min(progress, badge.maxProgress)
        
        // Check if should unlock
        if (!existingBadge.isUnlocked && existingBadge.progress >= badge.maxProgress) {
          existingBadge.isUnlocked = true
          existingBadge.unlockedAt = new Date().toISOString()
          
          const achievement: Achievement = {
            id: `ach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            badgeId: badge.id,
            userId,
            earnedAt: new Date().toISOString(),
            pointsAwarded: badge.points,
            shareableLink: `https://bugemahub.edu/achievement/${existingBadge.id}`
          }
          
          newAchievements.push(achievement)
        }
      } else {
        // Add new badge
        badge.progress = Math.min(progress, badge.maxProgress)
        badge.isUnlocked = progress >= badge.maxProgress
        if (badge.isUnlocked) {
          badge.unlockedAt = new Date().toISOString()
        }
        updatedBadges.push(badge)
        
        if (badge.isUnlocked) {
          const achievement: Achievement = {
            id: `ach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            badgeId: badge.id,
            userId,
            earnedAt: new Date().toISOString(),
            pointsAwarded: badge.points,
            shareableLink: `https://bugemahub.edu/achievement/${badge.id}`
          }
          
          newAchievements.push(achievement)
        }
      }
    }

    // Check each badge
    checkAndUnlockBadge('firstPost', userStats.postsCount)
    checkAndUnlockBadge('socialButterfly', userStats.clubsJoined)
    checkAndUnlockBadge('eventGoer', userStats.eventsAttended)
    checkAndUnlockBadge('marketplacePro', userStats.itemsSold)
    checkAndUnlockBadge('goodSamaritan', userStats.lostItemsReturned)
    checkAndUnlockBadge('studyLeader', userStats.studyGroupMembers)
    checkAndUnlockBadge('globalCitizen', userStats.countriesConnected)
    checkAndUnlockBadge('verifiedScholar', userStats.isVerified ? 1 : 0)
    checkAndUnlockBadge('topContributor', userStats.leaderboardRank <= 10 ? 1 : 0)
    checkAndUnlockBadge('pioneer', userStats.memberNumber <= 100 ? 1 : 0)

    return { updatedBadges, newAchievements }
  }

  static generateShareableText(badge: Badge, userName: string): string {
    return `🎉 I just earned the "${badge.name}" badge on Bugema Hub! ${badge.description} Join me in building our campus community!`
  }

  static calculateRankChange(previousRank: number, currentRank: number): number {
    return previousRank - currentRank
  }

  static getRankChangeEmoji(change: number): string {
    if (change > 0) return '📈'
    if (change < 0) return '📉'
    return '➡️'
  }

  static getRankChangeText(change: number): string {
    if (change > 0) return `Moved up ${change} position${change > 1 ? 's' : ''}`
    if (change < 0) return `Moved down ${Math.abs(change)} position${Math.abs(change) > 1 ? 's' : ''}`
    return 'No change'
  }
}
