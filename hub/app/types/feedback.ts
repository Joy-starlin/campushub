export type FeedbackCategory = 
  | 'campus-facilities'
  | 'academic-issues'
  | 'safety-concern'
  | 'club-event'
  | 'website-bug'
  | 'general-suggestion'
  | 'other'

export type Severity = 'low' | 'medium' | 'urgent'

export type FeedbackStatus = 'received' | 'under-review' | 'resolved' | 'escalated'

export interface FeedbackSubmission {
  id: string
  referenceCode: string
  rating: number
  category: FeedbackCategory
  title?: string
  description: string
  severity?: Severity
  isUrgent: boolean
  imageUrl?: string
  anonymousId: string
  status: FeedbackStatus
  createdAt: string
  updatedAt: string
  adminNotes?: string
}

export interface PublicResponse {
  id: string
  category: FeedbackCategory
  response: string
  respondedBy: string
  respondedAt: string
  upvotes: number
  isUpvoted: boolean
}

export interface FeedbackFilter {
  category?: FeedbackCategory
  severity?: Severity
  status?: FeedbackStatus
  dateRange?: {
    start: string
    end: string
  }
}

export interface CategoryInfo {
  id: FeedbackCategory
  name: string
  description: string
  icon: React.ReactNode
  color: string
  darkColor: string
}

export interface AnonymousTracking {
  anonymousId: string
  submissions: string[]
  lastActivity: string
}
