export type UniversityType = 'public' | 'private' | 'international'
export type Region = 'east-africa' | 'west-africa' | 'north-africa' | 'southern-africa' | 'central-africa' | 'other'
export type UniversityStatus = 'active' | 'pending' | 'suspended'

export interface University {
  id: string
  slug: string
  name: string
  shortName: string
  logo?: string
  coverImage?: string
  country: string
  countryCode: string
  region: Region
  type: UniversityType
  status: UniversityStatus
  officialEmailDomain: string
  website: string
  foundingYear?: number
  description: string
  primaryColor: string
  secondaryColor: string
  isOfficialPartner: boolean
  activeSince: string
  contactInfo: {
    name: string
    email: string
    phone?: string
    role: string
  }
  stats: {
    memberCount: number
    clubCount: number
    eventCount: number
    resourceCount: number
    jobCount: number
  }
  settings: {
    allowPublicAccess: boolean
    requireVerification: boolean
    enableGlobalPromotion: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface UniversityAdmin {
  id: string
  userId: string
  universityId: string
  role: 'admin' | 'moderator'
  permissions: string[]
  assignedAt: string
  assignedBy: string
  isActive: boolean
}

export interface UniversityContent {
  id: string
  universityId: string
  type: 'news' | 'event' | 'resource' | 'job'
  title: string
  content: string
  authorId: string
  isGlobal: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  status: 'draft' | 'published' | 'archived'
  metadata?: {
    eventDate?: string
    resourceType?: string
    applicationDeadline?: string
    location?: string
  }
}

export interface UniversityAnalytics {
  universityId: string
  period: 'daily' | 'weekly' | 'monthly'
  date: string
  metrics: {
    pageViews: number
    uniqueVisitors: number
    newMembers: number
    activeUsers: number
    contentPosted: number
    engagementRate: number
    topPages: Array<{
      page: string
      views: number
      avgTimeOnPage: number
    }>
    demographics: {
      byYear: Record<string, number>
      byFaculty: Record<string, number>
      byCountry: Record<string, number>
    }
  }
}

export interface UniversityFilter {
  search?: string
  country?: string
  region?: Region
  type?: UniversityType
  isOfficialPartner?: boolean
  sortBy?: 'name' | 'members' | 'activeSince' | 'country'
  sortOrder?: 'asc' | 'desc'
}

export interface UniversityInvite {
  id: string
  universityId: string
  invitedEmail: string
  invitedBy: string
  role: 'admin' | 'moderator'
  token: string
  expiresAt: string
  acceptedAt?: string
  status: 'pending' | 'accepted' | 'expired'
}

export interface UniversityTheme {
  universityId: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  customCSS?: string
  logoVariants?: {
    light?: string
    dark?: string
    favicon?: string
  }
}

export interface UniversityPartnershipRequest {
  id: string
  universityName: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  country: string
  website: string
  type: UniversityType
  officialEmailDomain: string
  description: string
  proposedStartDate: string
  status: 'pending' | 'approved' | 'rejected' | 'needs-info'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
  documents?: {
    logo?: File
    coverImage?: File
    verificationDocument?: File
  }
}

export interface UniversityStats {
  id: string
  universityId: string
  date: string
  members: {
    total: number
    active: number
    new: number
    byYear: Record<string, number>
    byFaculty: Record<string, number>
  }
  content: {
    total: number
    published: number
    byType: Record<string, number>
  }
  engagement: {
    pageViews: number
    uniqueVisitors: number
    avgSessionDuration: number
    bounceRate: number
  }
  jobs: {
    posted: number
    applications: number
    filled: number
  }
}

export interface UniversityMember {
  id: string
  userId: string
  universityId: string
  role: 'student' | 'faculty' | 'staff' | 'alumni'
  year?: number
  faculty?: string
  department?: string
  isVerified: boolean
  verificationMethod?: 'email' | 'document' | 'admin'
  joinedAt: string
  lastActiveAt: string
  permissions: string[]
}

export interface UniversityClub {
  id: string
  universityId: string
  name: string
  description: string
  category: string
  logo?: string
  coverImage?: string
  isOfficial: boolean
  memberCount: number
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface UniversityEvent {
  id: string
  universityId: string
  title: string
  description: string
  type: 'academic' | 'social' | 'sports' | 'career' | 'cultural' | 'other'
  startDate: string
  endDate: string
  location: string
  isVirtual: boolean
  maxAttendees?: number
  currentAttendees: number
  registrationDeadline?: string
  image?: string
  tags: string[]
  organizerId: string
  isGlobal: boolean
  status: 'draft' | 'published' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface UniversityResource {
  id: string
  universityId: string
  title: string
  description: string
  type: 'document' | 'video' | 'link' | 'tool' | 'template'
  category: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  externalUrl?: string
  thumbnail?: string
  downloadCount: number
  isPublic: boolean
  tags: string[]
  uploadedBy: string
  createdAt: string
  updatedAt: string
}

export interface UniversityNews {
  id: string
  universityId: string
  title: string
  content: string
  excerpt?: string
  featuredImage?: string
  authorId: string
  category: 'announcement' | 'news' | 'achievement' | 'event' | 'other'
  tags: string[]
  isGlobal: boolean
  isFeatured: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export interface UniversitySettings {
  universityId: string
  general: {
    name: string
    shortName: string
    description: string
    website: string
    email: string
    phone?: string
    address?: string
  }
  branding: {
    logo?: string
    coverImage?: string
    primaryColor: string
    secondaryColor: string
    customCSS?: string
  }
  features: {
    allowPublicAccess: boolean
    requireVerification: boolean
    enableGlobalPromotion: boolean
    allowClubCreation: boolean
    allowEventCreation: boolean
    allowResourceUpload: boolean
  }
  moderation: {
    requireContentApproval: boolean
    autoModeration: boolean
    blockedWords: string[]
    moderatorIds: string[]
  }
}
