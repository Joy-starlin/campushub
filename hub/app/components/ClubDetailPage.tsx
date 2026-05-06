'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Plus, 
  Check, 
  MessageCircle, 
  MapPin, 
  Crown,
  UserCheck,
  FileText,
  Send,
  Heart
} from 'lucide-react'

interface Club {
  id: string
  name: string
  category: 'Academic' | 'Sports' | 'Arts' | 'Technology' | 'Religious' | 'Community' | 'International'
  description: string
  fullDescription: string
  rules: string
  memberCount: number
  eventCount: number
  postCount: number
  coverImage?: string
  logo?: string
  isPrivate: boolean
  isMember: boolean
  leadership: {
    president: { name: string; avatar?: string; role: string }
    vicePresident: { name: string; avatar?: string; role: string }
    secretary: { name: string; avatar?: string; role: string }
  }
  upcomingEvents: Array<{
    id: string
    title: string
    date: string
    time: string
  }>
  posts: Array<{
    id: string
    author: string
    content: string
    createdAt: string
    likes: number
    comments: number
  }>
}

interface ClubDetailPageProps {
  club: Club
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

export default function ClubDetailPage({ club, onJoin, onLeave }: ClubDetailPageProps) {
  const [isMember, setIsMember] = useState(club.isMember)
  const [showLeaveButton, setShowLeaveButton] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to the club chat!', sender: 'A', color: 'bg-blue-500' },
    { id: 2, text: 'Looking forward to the next meeting!', sender: 'B', color: 'bg-green-500' }
  ])
  const [localPosts, setLocalPosts] = useState(club.posts.map(p => ({...p, isLiked: false})))

  const handleLikePost = (postId: string) => {
    setLocalPosts(localPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        }
      }
      return post
    }))
  }

  const handleJoin = () => {
    setIsMember(true)
    onJoin(club.id)
  }

  const handleLeave = () => {
    setIsMember(false)
    setShowLeaveButton(false)
    onLeave(club.id)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        text: newMessage,
        sender: 'ME',
        color: 'bg-indigo-500'
      }])
      setNewMessage('')
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Header */}
      <div className="relative h-64 bg-gray-200">
        {club.coverImage ? (
          <img
            src={club.coverImage}
            alt={club.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-gray-400 to-gray-600" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 w-full">
            <div className="flex items-end space-x-4">
              {/* Club Logo */}
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={club.name}
                  className="w-20 h-20 rounded-lg object-cover border-3 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-white border-3 border-gray-300 shadow-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">
                    {club.name.charAt(0)}
                  </span>
                </div>
              )}
              
              {/* Club Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{club.name}</h1>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${categoryColors[club.category]}`}>
                    {club.category}
                  </span>
                  {club.isPrivate && (
                    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                      Private
                    </span>
                  )}
                </div>
                <p className="text-white text-opacity-90">{club.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Row */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{club.memberCount}</div>
                  <div className="text-sm text-gray-500">Members</div>
                </div>
                <div>
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{club.eventCount}</div>
                  <div className="text-sm text-gray-500">Events</div>
                </div>
                <div>
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{club.postCount}</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap mb-6">
                {club.fullDescription}
              </p>
              
              {club.rules && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Club Rules</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{club.rules}</p>
                </div>
              )}
            </div>

            {/* Leadership Team */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Leadership Team</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {club.leadership.president.avatar ? (
                      <img
                        src={club.leadership.president.avatar}
                        alt={club.leadership.president.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                        {getInitials(club.leadership.president.name)}
                      </div>
                    )}
                    <Crown className="absolute -bottom-1 -right-1 w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{club.leadership.president.name}</p>
                    <p className="text-sm text-gray-500">{club.leadership.president.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {club.leadership.vicePresident.avatar ? (
                    <img
                      src={club.leadership.vicePresident.avatar}
                      alt={club.leadership.vicePresident.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                      {getInitials(club.leadership.vicePresident.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{club.leadership.vicePresident.name}</p>
                    <p className="text-sm text-gray-500">{club.leadership.vicePresident.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {club.leadership.secretary.avatar ? (
                    <img
                      src={club.leadership.secretary.avatar}
                      alt={club.leadership.secretary.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                      {getInitials(club.leadership.secretary.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{club.leadership.secretary.name}</p>
                    <p className="text-sm text-gray-500">{club.leadership.secretary.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Club Posts/Updates Feed */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Club Updates</h2>
              <div className="space-y-4">
                {localPosts.map((post) => (
                  <div key={post.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
                        {getInitials(post.author)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{post.author}</span>
                          <span className="text-xs text-gray-500">{post.createdAt}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{post.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button 
                            onClick={() => alert("Comments view coming soon!")}
                            className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </button>
                          <button 
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center space-x-1 transition-colors ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
              <div className="space-y-3">
                {club.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join/Leave Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => isMember && setShowLeaveButton(true)}
              onMouseLeave={() => setShowLeaveButton(false)}
              onClick={isMember ? (showLeaveButton ? handleLeave : undefined) : handleJoin}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                isMember
                  ? showLeaveButton
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isMember ? (
                showLeaveButton ? 'Leave Club' : '✓ Member'
              ) : (
                'Join Club'
              )}
            </motion.button>

            {/* Private Chat (for members) */}
            {isMember && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Club Chat
                </h3>
                <div className="space-y-3">
                  <div className="h-48 bg-gray-50 rounded-lg p-3 overflow-y-auto">
                    <div className="space-y-2">
                      {messages.map((msg) => (
                        <div key={msg.id} className="flex items-start space-x-2">
                          <div className={`w-6 h-6 rounded-full ${msg.color} flex items-center justify-center text-xs text-white shrink-0`}>
                            {msg.sender}
                          </div>
                          <div className="bg-white rounded-lg p-2 max-w-xs text-black shadow-sm">
                            <p className="text-sm truncate whitespace-normal break-words">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-black"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => alert("Members view coming soon!")}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center active:bg-gray-100"
                >
                  <Users className="w-4 h-4 mr-3 text-gray-400" />
                  View All Members
                </button>
                <button 
                  onClick={() => alert("Calendar view coming soon!")}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center active:bg-gray-100"
                >
                  <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                  View Calendar
                </button>
                <button 
                  onClick={() => alert("Documents view coming soon!")}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center active:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3 text-gray-400" />
                  Club Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
