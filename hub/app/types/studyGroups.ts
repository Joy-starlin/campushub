export interface User {
  id: string
  name: string
  avatar?: string
  email: string
  course?: string
  year?: string
  university?: string
}

export interface StudyGroup {
  id: string
  name: string
  courseName: string
  courseCode: string
  department: string
  year: string
  university: string
  description: string
  goals: string[]
  maxMembers: number
  currentMembers: number
  members: User[]
  leader: User
  schedule: {
    days: string[]
    time: string
  }
  location: {
    type: 'physical' | 'online'
    room?: string
    meetLink?: string
  }
  language: string
  isOpen: boolean
  tags: string[]
  createdAt: string
  nextMeeting?: string
}

export interface GroupFilter {
  search?: string
  department?: string
  year?: string
  meetingType?: 'physical' | 'online'
  language?: string
  day?: string
}

export interface DiscussionPost {
  id: string
  groupId: string
  author: User
  content: string
  createdAt: string
  replies: DiscussionReply[]
  likes: number
  isLiked: boolean
}

export interface DiscussionReply {
  id: string
  author: User
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
}

export interface SharedResource {
  id: string
  groupId: string
  title: string
  description: string
  fileUrl: string
  fileName: string
  fileSize: number
  uploadedBy: User
  uploadedAt: string
  downloads: number
}

export type SortOption = 'newest' | 'most-members' | 'meeting-soonest'

export interface CourseMatch {
  courseName: string
  courseCode: string
  groups: StudyGroup[]
}
