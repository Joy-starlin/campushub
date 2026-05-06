export type JobType = 'full-time' | 'part-time' | 'internship' | 'volunteer' | 'contract'
export type WorkMode = 'remote' | 'hybrid' | 'onsite'
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'no-experience'
export type Industry = 'tech' | 'finance' | 'healthcare' | 'education' | 'ngo' | 'consulting' | 'marketing' | 'sales' | 'engineering' | 'other'
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
export type ApplicationMethod = 'external' | 'in-platform'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  university?: string
  graduationYear?: number
  isAlumni: boolean
  isVerifiedEmployer: boolean
}

export interface Company {
  id: string
  name: string
  logo?: string
  website?: string
  industry: Industry
  size: CompanySize
  description?: string
  location: string
  isVerified: boolean
}

export interface Job {
  id: string
  title: string
  companyId: string
  company: Company
  location: {
    city: string
    country: string
    isRemote: boolean
    workMode: WorkMode
  }
  type: JobType
  experienceLevel: ExperienceLevel
  salary?: {
    min?: number
    max?: number
    currency: string
    isHidden: boolean
  }
  description: string
  requirements: string[]
  benefits: string[]
  skills: string[]
  postedAt: string
  applicationDeadline: string
  applicationMethod: ApplicationMethod
  externalApplicationUrl?: string
  targetUniversities: string[]
  isUniversityExclusive: boolean
  isFeatured: boolean
  isActive: boolean
  viewCount: number
  applicationCount: number
  savedBy: string[]
}

export interface JobApplication {
  id: string
  jobId: string
  userId: string
  cvUrl?: string
  coverLetter?: string
  linkedInProfile?: string
  availabilityDate?: string
  submittedAt: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  notes?: string
}

export interface JobFilter {
  search?: string
  location?: string
  jobTypes: JobType[]
  workModes: WorkMode[]
  industries: Industry[]
  experienceLevels: ExperienceLevel[]
  salaryRange?: {
    min: number
    max: number
  }
  datePosted: 'any' | 'week' | 'month'
  universityExclusive: boolean
  targetUniversity?: string
}

export interface JobAlert {
  id: string
  userId: string
  keywords: string[]
  jobTypes: JobType[]
  locations: string[]
  industries: Industry[]
  experienceLevels: ExperienceLevel[]
  frequency: 'daily' | 'weekly'
  isActive: boolean
  createdAt: string
}

export interface Alumni {
  id: string
  userId: string
  graduationYear: number
  degree: string
  currentRole: string
  currentCompany: string
  linkedInProfile?: string
  isHiring: boolean
  postedJobs: string[]
  bio?: string
  achievements: string[]
}

export interface JobPostingPlan {
  type: 'free' | 'featured'
  duration: number // in days
  price: number
  features: string[]
}

export interface JobStats {
  totalViews: number
  totalApplications: number
  viewsToday: number
  applicationsToday: number
  averageTimeToApply: number
  conversionRate: number
}

export interface SavedJob {
  id: string
  userId: string
  jobId: string
  savedAt: string
}

export interface JobShare {
  id: string
  jobId: string
  sharedBy: string
  sharedAt: string
  platform: 'link' | 'email' | 'social'
}

export interface CompanyReview {
  id: string
  companyId: string
  userId: string
  rating: number // 1-5
  review: string
  pros: string[]
  cons: string[]
  wouldRecommend: boolean
  createdAt: string
  isVerifiedEmployee: boolean
}

export interface JobApplicationForm {
  jobId: string
  cvFile?: File
  coverLetter: string
  linkedInProfile: string
  availabilityDate: string
  additionalInfo?: string
}

export interface JobSearchResult {
  jobs: Job[]
  totalCount: number
  currentPage: number
  totalPages: number
  facets: {
    industries: Record<Industry, number>
    jobTypes: Record<JobType, number>
    locations: Record<string, number>
    experienceLevels: Record<ExperienceLevel, number>
  }
}

export interface JobDigest {
  id: string
  userId: string
  frequency: 'daily' | 'weekly'
  jobs: Job[]
  sentAt: string
  openedAt?: string
  clickedJobs: string[]
}
