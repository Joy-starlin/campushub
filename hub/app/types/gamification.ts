export interface User {
  id: string
  name: string
  avatar?: string
  university: string
  country: string
  countryCode: string
  isVerified: boolean
  totalPoints: number
  currentRank: number
  previousRank: number
  rankChange: number
  streak: number
  lastActiveDate: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'social' | 'academic' | 'community' | 'achievement'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  isUnlocked: boolean
  unlockedAt?: string
  progress: number
  maxProgress: number
  requirement: string
}

export interface Achievement {
  id: string
  badgeId: string
  userId: string
  earnedAt: string
  pointsAwarded: number
  shareableLink: string
}

export interface PointsTransaction {
  id: string
  userId: string
  type: 'earned' | 'bonus' | 'streak'
  source: PointsSource
  points: number
  description: string
  timestamp: string
  relatedEntityId?: string
}

export type PointsSource = 
  | 'post-published'
  | 'post-likes-bonus'
  | 'event-attended'
  | 'club-joined'
  | 'study-group-help'
  | 'marketplace-sold'
  | 'lost-item-found'
  | 'account-verified'
  | 'referral-joined'
  | 'streak-bonus'
  | 'badge-earned'

export interface LeaderboardEntry {
  rank: number
  user: User
  points: number
  topBadge: Badge
  weeklyChange: number
  monthlyChange: number
}

export interface LeaderboardFilter {
  timeFrame: 'week' | 'month' | 'all-time'
  scope: 'university' | 'all' | 'country'
  universityId?: string
  country?: string
}

export interface WeeklyDigest {
  userId: string
  currentRank: number
  previousRank: number
  rankChange: number
  pointsEarned: number
  newBadges: Badge[]
  nextBadgeProgress: {
    badge: Badge
    progress: number
  }
  weekStart: string
  weekEnd: string
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  streakHistory: {
    date: string
    wasActive: boolean
  }[]
}

export interface BadgeConfig {
  firstPost: Badge
  socialButterfly: Badge
  eventGoer: Badge
  marketplacePro: Badge
  goodSamaritan: Badge
  studyLeader: Badge
  globalCitizen: Badge
  verifiedScholar: Badge
  topContributor: Badge
  pioneer: Badge
}

export interface PointsConfig {
  postPublished: number
  postLikesBonus: number
  eventAttended: number
  clubJoined: number
  studyGroupHelp: number
  marketplaceSold: number
  lostItemFound: number
  accountVerified: number
  referralJoined: number
  streakBonus: number
}
