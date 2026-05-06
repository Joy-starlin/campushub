'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  BookOpen, 
  Users, 
  Plus,
  Target,
  Sparkles,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { StudyGroup, CourseMatch, User } from '../types/studyGroups'
import ResponsiveContainer from './ResponsiveContainer'
import { ResponsiveButton } from './ResponsiveForm'
import StudyGroupCard from './StudyGroupCard'
import ResponsiveGrid from './ResponsiveGrid'
import toast from 'react-hot-toast'

interface SmartMatchingProps {
  user: User
  allGroups: StudyGroup[]
  onJoinGroup: (groupId: string) => void
  onCreateGroup: () => void
  joinedGroups: string[]
}

export default function SmartMatching({
  user,
  allGroups,
  onJoinGroup,
  onCreateGroup,
  joinedGroups
}: SmartMatchingProps) {
  const [isMatching, setIsMatching] = useState(false)
  const [matches, setMatches] = useState<CourseMatch[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const findGroupsForMyCourses = async () => {
    setIsMatching(true)
    setHasSearched(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock user's enrolled courses (in real app, this would come from user profile)
    const userCourses = [
      { name: 'Data Structures', code: 'CSC 301' },
      { name: 'Database Systems', code: 'CSC 302' },
      { name: 'Web Development', code: 'CSC 303' },
      { name: 'Business Statistics', code: 'BUS 201' }
    ]

    // Filter groups that match user's courses
    const courseMatches: CourseMatch[] = userCourses.map(course => {
      const matchingGroups = allGroups.filter(group => 
        group.courseCode === course.code && 
        group.year === user.year &&
        (group as any).department === (user as any).department
      )

      return {
        courseName: course.name,
        courseCode: course.code,
        groups: matchingGroups
      }
    }).filter(match => match.groups.length > 0)

    setMatches(courseMatches)
    setIsMatching(false)

    if (courseMatches.length === 0) {
      toast('No study groups found for your courses. Consider creating one!', { icon: 'ℹ️' })
    } else {
      const totalGroups = courseMatches.reduce((sum, match) => sum + match.groups.length, 0)
      toast.success(`Found ${totalGroups} study groups matching your courses!`)
    }
  }

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No Groups Found for Your Courses
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Be the first to create a study group for your courses and help fellow students!
      </p>
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-left">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Why Create a Study Group?
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Improve your understanding of course material</li>
                <li>• Collaborate with classmates on assignments</li>
                <li>• Prepare better for exams together</li>
                <li>• Build lasting academic connections</li>
              </ul>
            </div>
          </div>
        </div>
        
        <ResponsiveButton
          variant="primary"
          onClick={onCreateGroup}
          className="min-h-11"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create the First Study Group
        </ResponsiveButton>
      </div>
    </motion.div>
  )

  const renderMatches = () => (
    <div className="space-y-8">
      {matches.map((courseMatch, courseIndex) => (
        <motion.div
          key={courseMatch.courseCode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: courseIndex * 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {courseMatch.courseName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {courseMatch.courseCode} • {courseMatch.groups.length} group{courseMatch.groups.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          <ResponsiveGrid 
            cols={{ base: 1, lg: 2, xl: 3 }}
            gap={{ base: 4, lg: 6 }}
          >
            {courseMatch.groups.map((group) => (
              <StudyGroupCard
                key={group.id}
                group={group}
                onJoinGroup={onJoinGroup}
                isJoined={joinedGroups.includes(group.id)}
              />
            ))}
          </ResponsiveGrid>
        </motion.div>
      ))}
    </div>
  )

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Smart Study Group Matching
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find study groups that perfectly match your enrolled courses, year, and department. 
            Our smart algorithm connects you with the most relevant groups for your academic success.
          </p>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Profile
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <span>{user.course}</span>
                  <span>•</span>
                  <span>{user.year}</span>
                  <span>•</span>
                  <span>{(user as any).department || 'Computer Science'}</span>
                  <span>•</span>
                  <span>{user.university}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Study Groups Joined
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {joinedGroups.length}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Button */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <ResponsiveButton
              variant="primary"
              onClick={findGroupsForMyCourses}
              disabled={isMatching}
              className="min-h-12 px-8 text-lg"
            >
              {isMatching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Finding Groups for Your Courses...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 mr-3" />
                  Find Groups for My Courses
                </>
              )}
            </ResponsiveButton>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              We'll analyze your profile and find the best study groups for you
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {isMatching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Analyzing your courses and finding perfect matches...
            </p>
          </motion.div>
        )}

        {/* Results */}
        {!isMatching && hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {matches.length > 0 ? (
              <div>
                {/* Success Header */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <h3 className="font-medium text-green-900 dark:text-green-100">
                        Perfect Matches Found!
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        We found {matches.reduce((sum, match) => sum + match.groups.length, 0)} study groups 
                        matching your courses and academic level.
                      </p>
                    </div>
                  </div>
                </div>
                
                {renderMatches()}
              </div>
            ) : (
              renderEmptyState()
            )}
          </motion.div>
        )}

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Pro Tips for Study Group Success
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Join Early
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Join groups early in the semester to establish routines and build connections.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Be Active
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Participate actively in discussions and share resources to get the most value.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Stay Consistent
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Attend meetings regularly and contribute to maintain group momentum.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Create if Needed
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Don't hesitate to create a new group if existing ones don't meet your needs.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </ResponsiveContainer>
  )
}
