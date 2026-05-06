export type Industry = 'tech' | 'finance' | 'healthcare' | 'education' | 'ngo' | 'consulting' | 'marketing' | 'sales' | 'engineering' | 'other'
export type Degree = 'bachelor' | 'master' | 'phd' | 'diploma' | 'certificate' | 'other'
export type MentorshipStatus = 'pending' | 'accepted' | 'declined' | 'active' | 'completed' | 'cancelled'
export type MentorshipArea = 'career' | 'academic' | 'leadership' | 'entrepreneurship' | 'technical' | 'research' | 'other'

export interface Alumni {
  id: string
  userId: string
  name: string
  email: string
  avatar?: string
  graduationYear: number
  degree: Degree
  course: string
  university: string
  country: string
  countryCode: string
  currentJobTitle?: string
  currentCompany?: string
  industry: Industry
  linkedInProfile?: string
  isAvailableToMentor: boolean
  mentorshipAreas: MentorshipArea[]
  bio?: string
  achievements: AlumniAchievement[]
  posts: AlumniPost[]
  jobsPosted: AlumniJob[]
  isVerified: boolean
  joinedAt: string
  lastActiveAt: string
}

export interface AlumniAchievement {
  id: string
  alumniId: string
  title: string
  description: string
  date: string
  category: 'academic' | 'career' | 'personal' | 'community' | 'other'
  attachments?: string[]
  isPublic: boolean
  createdAt: string
}

export interface AlumniPost {
  id: string
  alumniId: string
  title: string
  content: string
  type: 'update' | 'achievement' | 'opportunity' | 'thought' | 'other'
  attachments?: string[]
  tags: string[]
  likes: number
  comments: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface AlumniJob {
  id: string
  alumniId: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'volunteer'
  description: string
  requirements: string[]
  applicationUrl?: string
  isRemote: boolean
  postedAt: string
  expiresAt?: string
  isActive: boolean
  applications: number
}

export interface MentorshipRequest {
  id: string
  mentorId: string
  menteeId: string
  message: string
  mentorshipAreas: MentorshipArea[]
  status: MentorshipStatus
  requestedAt: string
  respondedAt?: string
  respondedBy?: string
  responseMessage?: string
  scheduledSession?: MentorshipSession
}

export interface MentorshipSession {
  id: string
  mentorshipRequestId: string
  mentorId: string
  menteeId: string
  title: string
  description: string
  scheduledAt: string
  duration: number // in minutes
  meetingUrl: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

export interface AlumniFilter {
  search?: string
  graduationYear?: {
    min?: number
    max?: number
  }
  industry?: Industry
  country?: string
  isAvailableToMentor?: boolean
  sortBy?: 'name' | 'graduationYear' | 'joinedAt' | 'lastActive'
  sortOrder?: 'asc' | 'desc'
}

export interface AlumniRegistration {
  userId: string
  name: string
  email: string
  graduationYear: number
  degree: Degree
  course: string
  university: string
  country: string
  currentJobTitle?: string
  currentCompany?: string
  industry: Industry
  linkedInProfile?: string
  isAvailableToMentor: boolean
  mentorshipAreas: MentorshipArea[]
  bio?: string
  willPostOpportunities: boolean
  verificationDocument?: File
}

export interface ClassReunion {
  id: string
  title: string
  description: string
  graduationYear: number
  university: string
  date: string
  location: string
  isVirtual: boolean
  maxAttendees?: number
  currentAttendees: number
  registrationDeadline?: string
  image?: string
  tags: string[]
  organizerId: string
  status: 'draft' | 'published' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface AlumniStats {
  totalAlumni: number
  activeAlumni: number
  newAlumniThisMonth: number
  mentorshipRequests: number
  activeMentorships: number
  completedMentorships: number
  jobsPosted: number
  topIndustries: Array<{
    industry: Industry
    count: number
  }>
  topCountries: Array<{
    country: string
    count: number
  }>
  graduationYearDistribution: Record<number, number>
}

export interface MentorshipAreaInfo {
  area: MentorshipArea
  label: string
  description: string
  icon: string
}

export interface AlumniUpdate {
  id: string
  alumniId: string
  type: 'job_change' | 'promotion' | 'achievement' | 'education' | 'other'
  title: string
  description: string
  attachments?: string[]
  isPublic: boolean
  createdAt: string
}

export interface AlumniConnection {
  id: string
  requesterId: string
  requestedId: string
  status: 'pending' | 'accepted' | 'declined'
  requestedAt: string
  respondedAt?: string
}

export interface AlumniGroup {
  id: string
  name: string
  description: string
  type: 'class_year' | 'industry' | 'interest' | 'location' | 'other'
  isPrivate: boolean
  memberCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AlumniEvent {
  id: string
  title: string
  description: string
  type: 'reunion' | 'networking' | 'workshop' | 'seminar' | 'other'
  date: string
  location: string
  isVirtual: boolean
  targetAudience: 'all' | 'class_year' | 'industry' | 'other'
  targetYear?: number
  targetIndustry?: Industry
  maxAttendees?: number
  currentAttendees: number
  registrationDeadline?: string
  image?: string
  tags: string[]
  organizerId: string
  status: 'draft' | 'published' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface AlumniNewsletter {
  id: string
  title: string
  content: string
  sentAt: string
  recipientCount: number
  openRate: number
  clickRate: number
}

export interface AlumniSettings {
  userId: string
  profileVisibility: 'public' | 'alumni_only' | 'private'
  mentorshipAvailability: boolean
  mentorshipAreas: MentorshipArea[]
  emailNotifications: {
    mentorshipRequests: boolean
    connectionRequests: boolean
    classReunions: boolean
    newsletter: boolean
  }
  privacy: {
    showEmail: boolean
    showPhone: boolean
    showCurrentEmployer: boolean
  }
}
