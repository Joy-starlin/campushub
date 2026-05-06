'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Search, 
  Target,
  BookOpen,
  ArrowLeft
} from 'lucide-react'
import { StudyGroup, GroupFilter, SortOption, User } from '../types/studyGroups'
import StudyGroupBrowse from '../components/StudyGroupBrowse'
import CreateStudyGroupForm from '../components/CreateStudyGroupForm'
import StudyGroupDetail from '../components/StudyGroupDetail'
import SmartMatching from '../components/SmartMatching'
import ResponsiveContainer from '../components/ResponsiveContainer'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import SignupModal from '../components/SignupModal'

// Mock data
const mockGroups: StudyGroup[] = [
  {
    id: '1',
    name: 'CSC 301 Study Group',
    courseName: 'Data Structures',
    courseCode: 'CSC 301',
    department: 'Computer Science',
    year: '3rd Year',
    university: 'Bugema University',
    description: 'Focused on understanding complex data structures, algorithms, and problem-solving techniques. We work through assignments together and prepare for exams.',
    goals: ['Master data structures', 'Complete assignments on time', 'Prepare for midterms'],
    maxMembers: 10,
    currentMembers: 7,
    members: [
      {
        id: '1',
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        email: 'john@example.com',
        course: 'Computer Science',
        year: '3rd Year'
      },
      {
        id: '2',
        name: 'Alice Johnson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        email: 'alice@example.com',
        course: 'Computer Science',
        year: '3rd Year'
      }
    ],
    leader: {
      id: '1',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
      email: 'john@example.com',
      course: 'Computer Science',
      year: '3rd Year'
    },
    schedule: {
      days: ['Monday', 'Wednesday'],
      time: '14:00'
    },
    location: {
      type: 'physical',
      room: 'Room 201, Science Building'
    },
    language: 'English',
    isOpen: true,
    tags: ['weekly', 'assignments', 'exam prep'],
    createdAt: '2026-04-20T10:00:00Z',
    nextMeeting: '2026-04-25T14:00:00Z'
  },
  {
    id: '2',
    name: 'BUS 201 Study Group',
    courseName: 'Business Statistics',
    courseCode: 'BUS 201',
    department: 'Business Administration',
    year: '2nd Year',
    university: 'Bugema University',
    description: 'Collaborative learning for business statistics. We focus on practical applications and problem-solving.',
    goals: ['Understand statistical concepts', 'Practice problem solving', 'Group projects'],
    maxMembers: 8,
    currentMembers: 5,
    members: [
      {
        id: '3',
        name: 'Sarah Wilson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        email: 'sarah@example.com',
        course: 'Business Administration',
        year: '2nd Year'
      }
    ],
    leader: {
      id: '3',
      name: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      email: 'sarah@example.com',
        course: 'Business Administration',
        year: '2nd Year'
    },
    schedule: {
      days: ['Tuesday', 'Thursday'],
      time: '16:00'
    },
    location: {
      type: 'online',
      meetLink: 'https://meet.google.com/xxx-xxxx-xxx'
    },
    language: 'English',
    isOpen: true,
    tags: ['projects', 'weekly'],
    createdAt: '2026-04-22T09:00:00Z',
    nextMeeting: '2026-04-24T16:00:00Z'
  },
  {
    id: '3',
    name: 'CSC 302 Database Systems',
    courseName: 'Database Systems',
    courseCode: 'CSC 302',
    department: 'Computer Science',
    year: '3rd Year',
    university: 'Bugema University',
    description: 'Deep dive into database design, SQL, and database management systems.',
    goals: ['Master SQL', 'Database design', 'Final project preparation'],
    maxMembers: 6,
    currentMembers: 6,
    members: [],
    leader: {
      id: '4',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      email: 'mike@example.com',
      course: 'Computer Science',
      year: '3rd Year'
    },
    schedule: {
      days: ['Friday'],
      time: '10:00'
    },
    location: {
      type: 'physical',
      room: 'Lab 303, Tech Building'
    },
    language: 'English',
    isOpen: false,
    tags: ['exam prep', 'projects'],
    createdAt: '2026-04-21T15:00:00Z',
    nextMeeting: '2026-04-26T10:00:00Z'
  }
]

const mockCurrentUser: User = {
  id: 'current-user',
  name: 'You',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  email: 'you@example.com',
  course: 'Computer Science',
  year: '3rd Year',
  university: 'Bugema University'
}

type ViewMode = 'browse' | 'create' | 'detail' | 'smart-matching'

export default function StudyGroupsPage() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('browse')
  const [groups, setGroups] = useState<StudyGroup[]>(mockGroups)
  const [joinedGroups, setJoinedGroups] = useState<string[]>(['1'])
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null)
  const [filter, setFilter] = useState<GroupFilter>({})
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showSignupModal, setShowSignupModal] = useState(false)

  const handleCreateButtonClick = () => {
    if (!user) {
      toast.error('Please sign in to create a group')
      return
    }
    if (!user.isVerified) {
      toast.error('Membership payment required to create groups')
      setShowSignupModal(true)
      return
    }
    setViewMode('create')
  }

  const handleJoinGroup = (groupId: string) => {
    setJoinedGroups([...joinedGroups, groupId])
    toast.success('Successfully joined the study group!')
  }

  const handleLeaveGroup = (groupId: string) => {
    setJoinedGroups(joinedGroups.filter(id => id !== groupId))
    toast.success('You have left the study group')
  }

  const handleCreateGroup = (data: any) => {
    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      name: data.name,
      courseName: data.courseName,
      courseCode: data.courseCode,
      department: data.department,
      year: data.year,
      university: mockCurrentUser.university || 'Bugema University',
      description: data.description,
      goals: data.goals,
      maxMembers: data.maxMembers,
      currentMembers: 1,
      members: [mockCurrentUser],
      leader: mockCurrentUser,
      schedule: {
        days: data.scheduleDays,
        time: data.scheduleTime
      },
      location: {
        type: data.locationType,
        room: data.locationType === 'physical' ? data.room : undefined,
        meetLink: data.locationType === 'online' ? data.meetLink : undefined
      },
      language: data.language,
      isOpen: data.isOpen,
      tags: data.tags,
      createdAt: new Date().toISOString()
    }

    setGroups([newGroup, ...groups])
    setJoinedGroups([...joinedGroups, newGroup.id])
    setViewMode('browse')
    toast.success('Study group created successfully!')
  }

  const handlePostDiscussion = (groupId: string, content: string) => {
    // In a real app, this would save to backend
    toast.success('Discussion post added!')
  }

  const handleReplyToPost = (postId: string, content: string) => {
    // In a real app, this would save to backend
    toast.success('Reply added!')
  }

  const handleUploadResource = (groupId: string, file: File, title: string, description: string) => {
    // In a real app, this would upload to backend
    toast.success('Resource uploaded successfully!')
  }

  const handleDownloadResource = (resourceId: string) => {
    // In a real app, this would download the file
    toast.success('Download started!')
  }

  const handleGroupClick = (group: StudyGroup) => {
    setSelectedGroup(group)
    setViewMode('detail')
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'browse':
        return (
          <StudyGroupBrowse
            groups={groups}
            joinedGroups={joinedGroups}
            onJoinGroup={handleJoinGroup}
            onFilterChange={setFilter}
            onSortChange={setSortBy}
          />
        )

      case 'create':
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CreateStudyGroupForm
                onSubmit={handleCreateGroup}
                onCancel={() => setViewMode('browse')}
              />
            </motion.div>
          </AnimatePresence>
        )

      case 'detail':
        return selectedGroup ? (
          <StudyGroupDetail
            group={selectedGroup}
            currentUser={mockCurrentUser}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onPostDiscussion={handlePostDiscussion}
            onReplyToPost={handleReplyToPost}
            onUploadResource={handleUploadResource}
            onDownloadResource={handleDownloadResource}
          />
        ) : null

      case 'smart-matching':
        return (
          <SmartMatching
            user={mockCurrentUser}
            allGroups={groups}
            onJoinGroup={handleJoinGroup}
            onCreateGroup={handleCreateButtonClick}
            joinedGroups={joinedGroups}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ResponsiveContainer>
        <div className="py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Study Groups
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect with fellow students and excel together in collaborative learning
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Smart Matching Button */}
                <button
                  onClick={() => setViewMode('smart-matching')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'smart-matching'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Smart Match</span>
                </button>

                {/* Create Group Button */}
                {viewMode !== 'create' && (
                  <button
                    onClick={handleCreateButtonClick}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Group</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Breadcrumb */}
          {viewMode === 'detail' && selectedGroup && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <button
                onClick={() => setViewMode('browse')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Groups</span>
              </button>
            </motion.div>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>

          <SignupModal 
            isOpen={showSignupModal}
            onClose={() => setShowSignupModal(false)}
            initialStep={2}
          />
        </div>
      </ResponsiveContainer>
    </div>
  )
}
