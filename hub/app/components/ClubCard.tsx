'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Check, X } from 'lucide-react'

interface Club {
  id: string
  name: string
  category: 'Academic' | 'Sports' | 'Arts' | 'Technology' | 'Religious' | 'Community' | 'International'
  description: string
  memberCount: number
  coverImage?: string
  logo?: string
  isPrivate: boolean
  isMember: boolean
}

interface ClubCardProps {
  club: Club
  onClick: (club: Club) => void
  onJoin: (clubId: string) => void
  onLeave: (clubId: string) => void
}

const categoryColors = {
  Academic: 'bg-blue-100 text-blue-800',
  Sports: 'bg-green-100 text-green-800',
  Arts: 'bg-purple-100 text-purple-800',
  Technology: 'bg-orange-100 text-orange-800',
  Religious: 'bg-yellow-100 text-yellow-800',
  Community: 'bg-red-100 text-red-800',
  International: 'bg-indigo-100 text-indigo-800'
}

export default function ClubCard({ club, onClick, onJoin, onLeave }: ClubCardProps) {
  const [isMember, setIsMember] = useState(club.isMember)
  const [showLeaveButton, setShowLeaveButton] = useState(false)
  const [memberCount, setMemberCount] = useState(club.memberCount)

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMember(true)
    setMemberCount(memberCount + 1)
    onJoin(club.id)
  }

  const handleLeave = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMember(false)
    setMemberCount(memberCount - 1)
    setShowLeaveButton(false)
    onLeave(club.id)
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200"
      onClick={() => onClick(club)}
      onMouseEnter={() => isMember && setShowLeaveButton(true)}
      onMouseLeave={() => setShowLeaveButton(false)}
    >
      {/* Cover Image with Logo Overlay */}
      <div className="relative h-32 bg-gray-200">
        {club.coverImage ? (
          <img
            src={club.coverImage}
            alt={club.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-gray-400 to-gray-600" />
        )}
        
        {/* Club Logo */}
        <div className="absolute bottom-3 left-3">
          {club.logo ? (
            <img
              src={club.logo}
              alt={club.name}
              className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-white border-2 border-gray-300 shadow-sm flex items-center justify-center">
              <span className="text-lg font-bold text-gray-700">
                {club.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Private Badge */}
        {club.isPrivate && (
          <div className="absolute top-3 right-3">
            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
              Private
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Club Name and Category */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {club.name}
          </h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${categoryColors[club.category]}`}>
            {club.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {club.description}
        </p>

        {/* Member Count */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Users className="w-4 h-4 mr-2" />
          <span>{memberCount} members</span>
        </div>

        {/* Join/Leave Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={isMember ? (showLeaveButton ? handleLeave : undefined) : handleJoin}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            isMember
              ? showLeaveButton
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isMember ? (
            showLeaveButton ? (
              <div className="flex items-center justify-center">
                <X className="w-4 h-4 mr-2" />
                Leave
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Check className="w-4 h-4 mr-2" />
                Member ✓
              </div>
            )
          ) : (
            <div className="flex items-center justify-center">
              <Plus className="w-4 h-4 mr-2" />
              Join
            </div>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
