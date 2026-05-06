export type BadgeType = 'official' | 'verified-student' | 'alumni' | 'top-contributor' | 'premium-member' | 'moderator'

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired'

export type VerificationMethod = 'email' | 'id-upload' | 'admin-approval' | 'payment' | 'leaderboard'

export interface Badge {
  type: BadgeType
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  textColor: string
  isEarned: boolean
  earnedAt?: string
  expiresAt?: string
  progress?: {
    current: number
    required: number
    description: string
  }
}

export interface VerificationRequest {
  id: string
  userId: string
  badgeType: BadgeType
  method: VerificationMethod
  status: VerificationStatus
  data: {
    email?: string
    idDocument?: {
      fileName: string
      fileUrl: string
      uploadedAt: string
    }
    otp?: string
    otpExpiry?: string
    otpAttempts?: number
    rejectionReason?: string
    adminNotes?: string
  }
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  expiresAt?: string
}

export interface UserVerification {
  userId: string
  badges: Badge[]
  verificationRequests: VerificationRequest[]
  verificationLevel: 'basic' | 'verified' | 'premium'
  trustScore: number // 0-100
  lastVerifiedAt?: string
  needsReverification: boolean
  reverificationDate?: string
}

export interface VerificationSettings {
  allowedEmailDomains: string[]
  idDocumentTypes: string[]
  otpExpiryMinutes: number
  maxOtpAttempts: number
  autoApprovalEnabled: boolean
  reverificationPeriod: number // days
  topContributorThreshold: number
  premiumPlans: {
    id: string
    name: string
    price: number
    duration: number // days
    features: string[]
  }[]
}

export interface EmailVerification {
  email: string
  domain: string
  isValidDomain: boolean
  otpSent: boolean
  otp: string
  otpExpiry: string
  attempts: number
  verified: boolean
  verifiedAt?: string
}

export interface IDVerification {
  id: string
  userId: string
  documentType: string
  documentUrl: string
  fileName: string
  fileSize: number
  uploadedAt: string
  status: VerificationStatus
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  adminNotes?: string
  expiresAt?: string
}

export interface OfficialAccount {
  userId: string
  accountType: 'department' | 'club' | 'admin'
  organizationName: string
  verifiedBy: string
  verifiedAt: string
  permissions: {
    canPostAnnouncements: boolean
    canModerateContent: boolean
    canManageUsers: boolean
    canAccessAnalytics: boolean
  }
}

export interface ContributorStats {
  userId: string
  totalPosts: number
  totalComments: number
  totalReactions: number
  helpfulVotes: number
  weeklyPosts: number
  monthlyPosts: number
  rank: number
  rankChange: number // positive if moved up, negative if moved down
  lastActiveAt: string
}

export interface PremiumMembership {
  id: string
  userId: string
  planId: string
  planName: string
  startedAt: string
  expiresAt: string
  isActive: boolean
  autoRenew: boolean
  features: string[]
  paymentMethod: string
  lastPaymentAt?: string
  nextBillingDate?: string
}

export interface ModeratorRole {
  id: string
  userId: string
  assignedBy: string
  assignedAt: string
  permissions: {
    canDeletePosts: boolean
    canBanUsers: boolean
    canApproveContent: boolean
    canModerateChat: boolean
    canManageEvents: boolean
  }
  scope: 'global' | 'category' | 'event'
  scopeId?: string // category ID or event ID if scope is not global
  expiresAt?: string
  isActive: boolean
}

export interface VerificationAudit {
  id: string
  userId: string
  action: 'badge_earned' | 'badge_removed' | 'verification_requested' | 'verification_approved' | 'verification_rejected' | 'reverification_required'
  details: {
    badgeType?: BadgeType
    method?: VerificationMethod
    reason?: string
    performedBy?: string
  }
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

export interface TrustMetrics {
  userId: string
  trustScore: number
  factors: {
    verificationLevel: number
    accountAge: number // days
    activityLevel: number // posts per week
    communityStanding: number // helpful votes ratio
    moderationHistory: number // violations
    premiumStatus: number // 0 or 1
  }
  lastCalculated: string
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface BadgeTooltip {
  badgeType: BadgeType
  title: string
  description: string
  earnedDate?: string
  expiryDate?: string
  additionalInfo?: string
}

export interface VerificationProgress {
  badgeType: BadgeType
  isEligible: boolean
  currentProgress: number
  requiredProgress: number
  estimatedCompletion?: string
  requirements: string[]
  nextSteps?: string[]
}

export interface VerificationNotification {
  id: string
  userId: string
  type: 'verification_approved' | 'verification_rejected' | 'badge_earned' | 'badge_expired' | 'reverification_required'
  title: string
  message: string
  actionUrl?: string
  isRead: boolean
  createdAt: string
}

// Badge configuration
export const BADGE_CONFIG: Record<BadgeType, Omit<Badge, 'isEarned' | 'earnedAt' | 'expiresAt' | 'progress'>> = {
  'official': {
    type: 'official',
    name: 'Official',
    description: 'Official university account',
    icon: 'check-circle',
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  'verified-student': {
    type: 'verified-student',
    name: 'Verified Student',
    description: 'Verified student at Bugema University',
    icon: 'graduation-cap',
    color: '#10B981',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  'alumni': {
    type: 'alumni',
    name: 'Alumni',
    description: 'Confirmed Bugema University graduate',
    icon: 'award',
    color: '#8B5CF6',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  'top-contributor': {
    type: 'top-contributor',
    name: 'Top Contributor',
    description: 'Top 10 contributor on leaderboard',
    icon: 'crown',
    color: '#F59E0B',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  'premium-member': {
    type: 'premium-member',
    name: 'Premium',
    description: 'Premium plan subscriber',
    icon: 'star',
    color: '#F97316',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  'moderator': {
    type: 'moderator',
    name: 'Moderator',
    description: 'Community moderator',
    icon: 'shield',
    color: '#EF4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  }
}

export const VERIFICATION_REQUIREMENTS: Record<BadgeType, string[]> = {
  'official': ['Must be university department or official club', 'Approved by university admin'],
  'verified-student': ['Valid university email address OR student ID', 'Current enrollment status'],
  'alumni': ['Graduation verification', 'Alumni status confirmation'],
  'top-contributor': ['Top 10 on leaderboard', 'Minimum activity requirements'],
  'premium-member': ['Active premium subscription', 'Valid payment method'],
  'moderator': ['Appointed by admin', 'Clean moderation history']
}

export const DEFAULT_VERIFICATION_SETTINGS: VerificationSettings = {
  allowedEmailDomains: ['bugema.ac.ug', 'bugema.edu', 'bugema university'],
  idDocumentTypes: ['Student ID', 'Acceptance Letter', 'Registration Certificate'],
  otpExpiryMinutes: 10,
  maxOtpAttempts: 3,
  autoApprovalEnabled: false,
  reverificationPeriod: 365, // 1 year
  topContributorThreshold: 10,
  premiumPlans: [
    {
      id: 'basic',
      name: 'Basic Premium',
      price: 9.99,
      duration: 30,
      features: ['Ad-free experience', 'Custom profile themes', 'Priority support']
    },
    {
      id: 'pro',
      name: 'Pro Premium',
      price: 19.99,
      duration: 30,
      features: ['All Basic features', 'Advanced analytics', 'Exclusive content', 'Early access']
    }
  ]
}
