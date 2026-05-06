'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Edit, 
  MessageCircle, 
  UserPlus, 
  Calendar,
  Users,
  ShoppingBag,
  FileText,
  CheckCircle
} from 'lucide-react'

interface User {
  id: string
  username: string
  name: string
  university: string
  course: string
  year: string
  bio: string
  profilePhoto?: string
  coverPhoto?: string
  isVerified: boolean
  stats: {
    posts: number
    clubsJoined: number
    eventsAttended: number
    followers: number
    following: number
  }
  isOwnProfile: boolean
  isFollowing: boolean
}

interface UserProfilePageProps {
  user: User
  onFollow: () => void
  onUnfollow: () => void
  onMessage: () => void
  onEditProfile: () => void
}

type TabType = 'posts' | 'events' | 'clubs' | 'marketplace'

export default function UserProfilePage({ 
  user, 
  onFollow, 
  onUnfollow, 
  onMessage, 
  onEditProfile 
}: UserProfilePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [isFollowing, setIsFollowing] = useState(user.isFollowing)

  const handleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false)
      onUnfollow()
    } else {
      setIsFollowing(true)
      onFollow()
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const tabs = [
    { id: 'posts', label: 'Posts', icon: FileText, count: user.stats.posts },
    { id: 'events', label: 'Events', icon: Calendar, count: user.stats.eventsAttended },
    { id: 'clubs', label: 'Clubs', icon: Users, count: user.stats.clubsJoined },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, count: 0 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="relative h-64 bg-gray-200">
        {user.coverPhoto ? (
          <img
            src={user.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500" />
        )}
        
        {/* Edit Cover Button */}
        {user.isOwnProfile && (
          <button className="absolute top-4 right-4 p-2 bg-white bg-opacity-90 rounded-lg shadow-md hover:bg-opacity-100 transition-colors">
            <Camera className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Profile Photo */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-700">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
            
            {/* Edit Profile Photo Button */}
            {user.isOwnProfile && (
              <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* User Info */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                {user.isVerified && (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-gray-600">{user.university}</p>
              <p className="text-gray-600">{user.course} • {user.year}</p>
            </div>

            {/* Action Buttons */}
            {!user.isOwnProfile && (
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMessage}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </motion.button>
              </div>
            )}

            {user.isOwnProfile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEditProfile}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </motion.button>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 mb-6">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.stats.posts}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.stats.clubsJoined}</div>
              <div className="text-sm text-gray-500">Clubs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.stats.eventsAttended}</div>
              <div className="text-sm text-gray-500">Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.stats.followers}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{user.stats.following}</div>
              <div className="text-sm text-gray-500">Following</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No posts yet</p>
              </div>
            )}
            {activeTab === 'events' && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No events attended yet</p>
              </div>
            )}
            {activeTab === 'clubs' && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No clubs joined yet</p>
              </div>
            )}
            {activeTab === 'marketplace' && (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No marketplace listings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
