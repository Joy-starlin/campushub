'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Hash, 
  Plus, 
  Settings, 
  Bell,
  BellOff,
  Pin,
  Users,
  Crown,
  Shield,
  Search,
  X
} from 'lucide-react'
import { Channel, User, UnreadCount } from '../types/chat'
import { FirebaseChatService } from '../lib/chatService'
import { ResponsiveButton } from './ResponsiveForm'

interface ChannelListProps {
  channels: Channel[]
  currentChannel: Channel | null
  currentUser: User
  onChannelSelect: (channel: Channel) => void
  onCreateChannel: () => void
  onChannelSettings: (channel: Channel) => void
  unreadCounts: Record<string, number>
}

export default function ChannelList({
  channels,
  currentChannel,
  currentUser,
  onChannelSelect,
  onCreateChannel,
  onChannelSettings,
  unreadCounts
}: ChannelListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelType, setNewChannelType] = useState<'text' | 'announcement'>('text')
  const [isCreating, setIsCreating] = useState(false)
  const [mutedChannels, setMutedChannels] = useState<Set<string>>(new Set())

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const canCreateChannel = currentUser.role === 'admin' || currentUser.role === 'moderator'

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return

    setIsCreating(true)
    try {
      // This would be implemented with the actual club ID
      const clubId = 'demo-club-id'
      await FirebaseChatService.createChannel({
        clubId,
        name: newChannelName.trim(),
        description: newChannelDescription.trim(),
        type: newChannelType,
        isPrivate: false,
        createdById: currentUser.id
      })

      setNewChannelName('')
      setNewChannelDescription('')
      setNewChannelType('text')
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create channel:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const toggleMute = (channelId: string) => {
    const newMuted = new Set(mutedChannels)
    if (newMuted.has(channelId)) {
      newMuted.delete(channelId)
    } else {
      newMuted.add(channelId)
    }
    setMutedChannels(newMuted)
  }

  const getChannelIcon = (type: 'text' | 'announcement') => {
    return type === 'announcement' ? <Pin className="w-4 h-4" /> : <Hash className="w-4 h-4" />
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3 text-yellow-500" />
      case 'moderator':
        return <Shield className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Channels</h2>
          {canCreateChannel && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels..."
            className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredChannels.map((channel) => {
            const unreadCount = unreadCounts[channel.id] || 0
            const isMuted = mutedChannels.has(channel.id)
            const isActive = currentChannel?.id === channel.id

            return (
              <motion.button
                key={channel.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 2 }}
                onClick={() => onChannelSelect(channel)}
                className={`w-full flex items-center justify-between p-3 rounded-lg mb-1 transition-all ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {getChannelIcon(channel.type)}
                    {channel.type === 'announcement' && getRoleIcon('admin')}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium truncate">{channel.name}</span>
                      {channel.pinnedMessage && (
                        <Pin className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    {channel.lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {channel.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Unread count */}
                  {unreadCount > 0 && !isMuted && (
                    <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}

                  {/* Muted indicator */}
                  {isMuted && (
                    <BellOff className="w-4 h-4 text-gray-400" />
                  )}

                  {/* Time */}
                  {channel.lastMessage && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(channel.lastMessage.timestamp)}
                    </span>
                  )}

                  {/* Settings for admins */}
                  {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onChannelSettings(channel)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{channels.length} channels</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => !isCreating && setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create Channel
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g., general, events, study-group"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  placeholder="What's this channel about?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Channel Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNewChannelType('text')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      newChannelType === 'text'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Hash className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-sm font-medium">Text</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Anyone can message
                    </div>
                  </button>
                  <button
                    onClick={() => setNewChannelType('announcement')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      newChannelType === 'announcement'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <Pin className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-sm font-medium">Announcement</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Admins only
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <ResponsiveButton
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                  className="flex-1"
                >
                  Cancel
                </ResponsiveButton>
                <ResponsiveButton
                  variant="primary"
                  onClick={handleCreateChannel}
                  disabled={isCreating || !newChannelName.trim()}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </ResponsiveButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
