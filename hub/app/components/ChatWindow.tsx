'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Hash, 
  Pin, 
  Users, 
  Search,
  Bell,
  BellOff,
  Settings,
  Smile,
  Paperclip,
  Send,
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  Star,
  Flag,
  Crown,
  Shield,
  Check
} from 'lucide-react'
import { Message, Channel, User, TypingIndicator, MessageReaction } from '../types/chat'
import { FirebaseChatService } from '../lib/chatService'
import MessageInput from './MessageInput'
import { ResponsiveButton } from './ResponsiveForm'

interface ChatWindowProps {
  channel: Channel | null
  currentUser: User
  messages: Message[]
  typingUsers: TypingIndicator[]
  onSendMessage: (content: string, type: 'text' | 'image' | 'file', file?: File) => Promise<void>
  onEditMessage: (messageId: string, content: string) => Promise<void>
  onDeleteMessage: (messageId: string) => Promise<void>
  onAddReaction: (messageId: string, emoji: string) => Promise<void>
  onRemoveReaction: (messageId: string, emoji: string) => Promise<void>
  onPinMessage: (messageId: string) => Promise<void>
  onReplyToMessage: (messageId: string) => void
  onReportMessage: (messageId: string) => void
  onToggleNotifications: () => void
  notificationsEnabled: boolean
  soundEnabled: boolean
  onToggleSound: () => void
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '👎', '🔥', '🎉']

export default function ChatWindow({
  channel,
  currentUser,
  messages,
  typingUsers,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onAddReaction,
  onRemoveReaction,
  onPinMessage,
  onReplyToMessage,
  onReportMessage,
  onToggleNotifications,
  notificationsEnabled,
  soundEnabled,
  onToggleSound
}: ChatWindowProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const linkifyText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessage(messageId)
    setEditContent(content)
    setShowMessageMenu(null)
  }

  const handleSaveEdit = async () => {
    if (editingMessage && editContent.trim()) {
      await onEditMessage(editingMessage, editContent.trim())
      setEditingMessage(null)
      setEditContent('')
    }
  }

  const handleCancelEdit = () => {
    setEditingMessage(null)
    setEditContent('')
  }

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId)
    setShowMessageMenu(null)
  }

  const handleAddEmoji = (messageId: string, emoji: string) => {
    onAddReaction(messageId, emoji)
    setShowEmojiPicker(null)
  }

  const handleRemoveEmoji = (messageId: string, emoji: string) => {
    onRemoveReaction(messageId, emoji)
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

  const canEditMessage = (message: Message) => {
    return message.senderId === currentUser.id
  }

  const canDeleteMessage = (message: Message) => {
    return message.senderId === currentUser.id || 
           currentUser.role === 'admin' || 
           currentUser.role === 'moderator'
  }

  const canPinMessage = () => {
    return currentUser.role === 'admin' || currentUser.role === 'moderator'
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {}
    
    messages.forEach(message => {
      const date = formatDate(message.timestamp)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }

  const filteredMessages = searchQuery
    ? messages.filter(message =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages

  const messageGroups = groupMessagesByDate(filteredMessages)

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Hash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select a channel
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Choose a channel from the list to start chatting
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {channel.type === 'announcement' ? <Pin className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {channel.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {channel.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button
              onClick={onToggleNotifications}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>

            {/* Sound */}
            <button
              onClick={onToggleSound}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Member count */}
        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{channel.memberCount} members</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Pinned Message */}
        {channel.pinnedMessage && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Pin className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Pinned Message
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {channel.pinnedMessage.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message Groups */}
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-200 dark:bg-gray-700 h-px flex-1"></div>
              <span className="px-3 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                {date}
              </span>
              <div className="bg-gray-200 dark:bg-gray-700 h-px flex-1"></div>
            </div>

            {/* Messages */}
            {dateMessages.map((message) => (
              <div key={message.id} className="group">
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {message.senderId === currentUser.id ? (
                      <img
                        src={currentUser.avatar || '/default-avatar.png'}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {message.senderId === currentUser.id ? currentUser.name : 'User'}
                      </span>
                      {getRoleIcon('admin')}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.editedAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          (edited)
                        </span>
                      )}
                    </div>

                    {/* Message Text */}
                    {editingMessage === message.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit()
                            } else if (e.key === 'Escape') {
                              handleCancelEdit()
                            }
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black text-sm"
                          autoFocus
                        />
                        <ResponsiveButton
                          variant="primary"
                          onClick={handleSaveEdit}
                          className="min-h-8 px-3"
                        >
                          Save
                        </ResponsiveButton>
                        <ResponsiveButton
                          variant="secondary"
                          onClick={handleCancelEdit}
                          className="min-h-8 px-3"
                        >
                          Cancel
                        </ResponsiveButton>
                      </div>
                    ) : (
                      <div className="relative">
                        <p className="text-gray-900 dark:text-white break-words">
                          {linkifyText(message.content)}
                        </p>

                        {/* Reactions */}
                        {message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {message.reactions.map((reaction) => (
                              <button
                                key={reaction.emoji}
                                onClick={() => {
                                  if (reaction.userIds.includes(currentUser.id)) {
                                    handleRemoveEmoji(message.id, reaction.emoji)
                                  } else {
                                    handleAddEmoji(message.id, reaction.emoji)
                                  }
                                }}
                                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm transition-colors ${
                                  reaction.userIds.includes(currentUser.id)
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Message Actions */}
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setShowMessageMenu(
                              showMessageMenu === message.id ? null : message.id
                            )}
                            className="p-1 bg-gray-100 dark:bg-gray-700 rounded-full shadow-lg"
                          >
                            <MoreVertical className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>

                        {/* Message Menu */}
                        {showMessageMenu === message.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                          >
                            <div className="py-1">
                              <button
                                onClick={() => handleReply(message.id)}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Reply className="w-4 h-4" />
                                <span>Reply</span>
                              </button>
                              
                              <div className="border-t border-gray-200 dark:border-gray-700">
                                <div className="px-4 py-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick Reactions</p>
                                  <div className="flex space-x-1">
                                    {COMMON_EMOJIS.map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={() => handleAddEmoji(message.id, emoji)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {canEditMessage(message) && (
                                <button
                                  onClick={() => handleEditMessage(message.id, message.content)}
                                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                              )}

                              {canPinMessage() && (
                                <button
                                  onClick={() => onPinMessage(message.id)}
                                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Pin className="w-4 h-4" />
                                  <span>{message.isPinned ? 'Unpin' : 'Pin'}</span>
                                </button>
                              )}

                              {canDeleteMessage(message) && (
                                <button
                                  onClick={() => onDeleteMessage(message.id)}
                                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              )}

                              <button
                                onClick={() => onReportMessage(message.id)}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Flag className="w-4 h-4" />
                                <span>Report</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>
              {typingUsers.map(user => user.userName).join(', ')} 
              {typingUsers.length === 1 ? ' is' : ' are'} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        channelId={channel.id}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        disabled={channel.type === 'announcement' && currentUser.role !== 'admin'}
      />
    </div>
  )
}
