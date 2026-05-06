export type EventFormat = 'physical' | 'online' | 'hybrid'
export type VirtualPlatform = 'google-meet' | 'zoom' | 'microsoft-teams' | 'custom'
export type ReminderType = 'email-24h' | 'email-15m' | 'in-app-30m' | 'push-10m'
export type EventStatus = 'draft' | 'published' | 'live' | 'ended' | 'cancelled'
export type RSVPType = 'in-person' | 'online' | 'both'

export interface VirtualEvent {
  id: string
  title: string
  description: string
  format: EventFormat
  platform?: VirtualPlatform
  virtualDetails?: {
    platform: VirtualPlatform
    meetingLink: string
    meetingId?: string
    passcode?: string
    waitingRoom: boolean
    recording: boolean
    maxOnlineAttendees?: number
    joinLink?: string
  }
  physicalDetails?: {
    location: string
    address: string
    capacity?: number
  }
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  timezone: string
  organizerId: string
  organizerName: string
  category: string
  tags: string[]
  maxAttendees?: number
  currentAttendees: {
    total: number
    inPerson: number
    online: number
  }
  rsvpStatus: 'open' | 'closed'
  rsvpDeadline?: string
  isPublic: boolean
  status: EventStatus
  coverImage?: string
  createdAt: string
  updatedAt: string
}

export interface VirtualEventRSVP {
  id: string
  eventId: string
  userId: string
  userName: string
  userEmail: string
  type: RSVPType
  status: 'pending' | 'confirmed' | 'cancelled'
  joinedAt?: string
  leftAt?: string
  createdAt: string
}

export interface EventReminder {
  id: string
  eventId: string
  userId: string
  type: ReminderType
  scheduledFor: string
  sent: boolean
  sentAt?: string
  message: string
  joinLink?: string
  createdAt: string
}

export interface LiveEventSession {
  id: string
  eventId: string
  startTime: string
  endTime?: string
  attendeeCount: number
  chatMessages: EventChatMessage[]
  isRecording: boolean
  recordingUrl?: string
  createdAt: string
}

export interface EventChatMessage {
  id: string
  eventId: string
  userId: string
  userName: string
  message: string
  timestamp: string
  isModerator: boolean
  reactions: {
    userId: string
    type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
    timestamp: string
  }[]
}

export interface EventRecording {
  id: string
  eventId: string
  title: string
  description?: string
  url: string
  duration: number // in seconds
  fileSize: number // in bytes
  thumbnail?: string
  isPublic: boolean
  uploadedAt: string
  uploadedBy: string
  downloadCount: number
}

export interface EventFeedback {
  id: string
  eventId: string
  userId: string
  userName: string
  rating: number // 1-5 stars
  comment?: string
  aspects: {
    content: number
    organization: number
    engagement: number
    technical: number
  }
  wouldRecommend: boolean
  createdAt: string
}

export interface EventAnalytics {
  eventId: string
  totalRSVPs: number
  confirmedRSVPs: number
  attendanceRate: number
  averageAttendanceTime: number // in minutes
  peakAttendees: number
  engagementMetrics: {
    chatMessages: number
    reactions: number
    questions: number
  }
  feedbackSummary: {
    averageRating: number
    totalFeedback: number
    wouldRecommendPercentage: number
  }
  demographics: {
    byRole: Record<string, number>
    byYear: Record<string, number>
    byDepartment: Record<string, number>
  }
}

export interface VirtualEventTemplate {
  id: string
  name: string
  description: string
  format: EventFormat
  platform?: VirtualPlatform
  defaultSettings: {
    waitingRoom: boolean
    recording: boolean
    maxOnlineAttendees?: number
    reminderSettings: ReminderType[]
  }
  category: string
  tags: string[]
  createdBy: string
  createdAt: string
  isPublic: boolean
}

export interface EventNotification {
  id: string
  userId: string
  eventId: string
  type: 'reminder' | 'start' | 'end' | 'update' | 'recording'
  title: string
  message: string
  actionUrl?: string
  read: boolean
  createdAt: string
}

export interface EventAttendee {
  userId: string
  userName: string
  userEmail: string
  rsvpType: RSVPType
  joinedAt?: string
  leftAt?: string
  isModerator: boolean
  canRecord: boolean
  chatEnabled: boolean
  videoEnabled: boolean
  audioEnabled: boolean
}

export interface EventPlatformConfig {
  platform: VirtualPlatform
  name: string
  icon: string
  color: string
  features: {
    waitingRoom: boolean
    recording: boolean
    chat: boolean
    breakoutRooms: boolean
    polls: boolean
    screenShare: boolean
    reactions: boolean
  }
  apiConfig?: {
    apiKey: string
    webhookUrl: string
    scopes: string[]
  }
}

export interface EventCountdown {
  eventId: string
  startTime: string
  currentTime: string
  timeUntil: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
  isLive: boolean
  hasEnded: boolean
  canJoin: boolean
}

export interface EventJoinLink {
  eventId: string
  userId: string
  link: string
  expiresAt?: string
  isActive: boolean
  generatedAt: string
  platform: VirtualPlatform
}

export interface EventModeration {
  eventId: string
  moderatorId: string
  permissions: {
    canMute: boolean
    canRemove: boolean
    canLockChat: boolean
    canStartRecording: boolean
    canEndEvent: boolean
  }
  assignedAt: string
  assignedBy: string
}

export interface EventPoll {
  id: string
  eventId: string
  question: string
  options: {
    id: string
    text: string
    votes: number
    voters: string[]
  }[]
  isActive: boolean
  createdBy: string
  createdAt: string
  endsAt?: string
}

export interface EventBreakoutRoom {
  id: string
  eventId: string
  name: string
  description?: string
  capacity: number
  currentAttendees: number
  attendees: string[]
  createdBy: string
  createdAt: string
}

export interface EventReport {
  id: string
  eventId: string
  reporterId: string
  reason: string
  description: string
  status: 'pending' | 'reviewed' | 'resolved'
  reviewedBy?: string
  reviewedAt?: string
  resolution?: string
  createdAt: string
}
