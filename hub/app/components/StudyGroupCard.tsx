'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  Globe, 
  Briefcase,
  User,
  Video,
  DoorOpen,
  DoorClosed,
  Star
} from 'lucide-react'
import { StudyGroup } from '../types/studyGroups'
import { ResponsiveButton } from './ResponsiveForm'

interface StudyGroupCardProps {
  group: StudyGroup
  onJoinGroup?: (groupId: string) => void
  isJoined?: boolean
}

export default function StudyGroupCard({ group, onJoinGroup, isJoined = false }: StudyGroupCardProps) {
  const isFull = group.currentMembers >= group.maxMembers
  const openSpots = group.maxMembers - group.currentMembers

  const renderMemberAvatars = () => {
    const visibleMembers = group.members.slice(0, 3)
    const remainingCount = group.currentMembers - 3

    return (
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {visibleMembers.map((member, index) => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden"
              style={{ zIndex: index }}
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
        <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
          {group.currentMembers}/{group.maxMembers} members
          {remainingCount > 0 && (
            <span className="text-green-600 dark:text-green-400 ml-1">
              (+{openSpots} spots)
            </span>
          )}
        </span>
      </div>
    )
  }

  const renderSchedule = () => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const scheduleDays = group.schedule.days.map(day => 
      dayNames.indexOf(day) !== -1 ? dayNames[dayNames.indexOf(day)] : day
    ).join(', ')

    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
        <Calendar className="w-4 h-4" />
        <span>{scheduleDays}</span>
        <Clock className="w-4 h-4 ml-2" />
        <span>{group.schedule.time}</span>
      </div>
    )
  }

  const renderLocation = () => {
    if (group.location.type === 'online') {
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <Video className="w-4 h-4" />
          <span>Online via Google Meet</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <MapPin className="w-4 h-4" />
          <span>{group.location.room}</span>
        </div>
      )
    }
  }

  const renderTags = () => {
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {group.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
          >
            {tag}
          </span>
        ))}
        {group.tags.length > 3 && (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
            +{group.tags.length - 3}
          </span>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {group.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {group.courseName} • {group.courseCode}
          </p>
        </div>
        
        {/* Open/Closed Badge */}
        <div className="flex items-center space-x-2">
          {group.isOpen ? (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
              <DoorOpen className="w-3 h-3" />
              <span className="text-xs font-medium">Open</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
              <DoorClosed className="w-3 h-3" />
              <span className="text-xs font-medium">Invite Only</span>
            </div>
          )}
        </div>
      </div>

      {/* University and Department */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
        <Briefcase className="w-4 h-4" />
        <span>{group.university} • {group.department} • {group.year}</span>
      </div>

      {/* Members */}
      <div className="mb-4">
        {renderMemberAvatars()}
      </div>

      {/* Schedule */}
      <div className="mb-3">
        {renderSchedule()}
      </div>

      {/* Location */}
      <div className="mb-3">
        {renderLocation()}
      </div>

      {/* Language */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
        <Globe className="w-4 h-4" />
        <span>Language: {group.language}</span>
      </div>

      {/* Tags */}
      {renderTags()}

      {/* Group Leader */}
      <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden">
          {group.leader.avatar ? (
            <img
              src={group.leader.avatar}
              alt={group.leader.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {group.leader.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Group Leader
          </p>
        </div>
        <Star className="w-4 h-4 text-yellow-500" />
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <ResponsiveButton
          variant={isJoined ? "secondary" : "primary"}
          fullWidth
          disabled={isFull || isJoined}
          onClick={() => onJoinGroup?.(group.id)}
          className="min-h-11"
        >
          {isJoined ? 'Joined' : isFull ? 'Group Full' : 'Join Group'}
        </ResponsiveButton>
      </div>
    </motion.div>
  )
}
