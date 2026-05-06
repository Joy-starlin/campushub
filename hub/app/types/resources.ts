export type ResourceCategory = 
  | 'timetables'
  | 'forms'
  | 'study-materials'
  | 'exam-papers'
  | 'club-constitutions'
  | 'event-programs'
  | 'campus-maps'
  | 'student-handbooks'
  | 'job-templates'
  | 'scholarship-info'

export type FileType = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx'

export type VisibilityLevel = 'public' | 'members-only' | 'university-only'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  university: string
  role: 'admin' | 'club-leader' | 'student'
  isVerified: boolean
}

export interface Resource {
  id: string
  title: string
  description: string
  category: ResourceCategory
  university: string
  fileType: FileType
  fileSize: number
  fileUrl: string
  cloudinaryPublicId: string
  uploader: User
  uploadDate: string
  visibility: VisibilityLevel
  tags: string[]
  downloadCount: number
  averageRating: number
  ratingCount: number
  version: string
  isPopular: boolean
  isBookmarked: boolean
}

export interface ResourceFilter {
  search?: string
  category?: ResourceCategory
  university?: string
  fileType?: FileType
  dateRange?: {
    start: string
    end: string
  }
  visibility?: VisibilityLevel
}

export interface ResourceSort {
  by: 'most-downloaded' | 'newest' | 'highest-rated' | 'title'
  order: 'asc' | 'desc'
}

export interface DownloadRecord {
  id: string
  resourceId: string
  timestamp: string
  userAgent?: string
  ipAddress?: string
  isAnonymous: boolean
}

export interface Rating {
  id: string
  resourceId: string
  userId?: string
  rating: number
  timestamp: string
  isAnonymous: boolean
}

export interface CategoryInfo {
  id: ResourceCategory
  name: string
  description: string
  icon: React.ReactNode
  color: string
  darkColor: string
}

export interface Bookmark {
  id: string
  userId: string
  resourceId: string
  createdAt: string
}

export interface UploadFormData {
  title: string
  description: string
  category: ResourceCategory
  university: string
  file: File
  visibility: VisibilityLevel
  tags: string[]
  version: string
}

export interface ResourceStats {
  totalDownloads: number
  uniqueDownloads: number
  averageRating: number
  totalRatings: number
  bookmarkCount: number
}
