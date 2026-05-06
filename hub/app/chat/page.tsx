'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Search,
  Bell,
  BellOff,
  Menu,
  X
} from 'lucide-react'
import { Channel, Message, User, TypingIndicator } from '../types/chat'
import { FirebaseChatService } from '../lib/chatService'
import ChannelList from '../components/ChannelList'
import ChatWindow from '../components/ChatWindow'
import ResponsiveContainer from '../components/ResponsiveContainer'

// Mock data
const mockCurrentUser: User = {
  id: 'current-user',
  name: 'Alex Johnson',
  email: 'alex@bugema.edu',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  role: 'member',
  isVerified: true,
  isOnline: true,
  lastSeen: new Date().toISOString()
}

const mockChannels: Channel[] = [
  {
    id: 'general',
    clubId: 'demo-club',
    name: 'general',
    description: 'General discussion and announcements',
    type: 'text',
    isPrivate: false,
    createdById: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    memberCount: 156,
    unreadCount: 3,
    lastMessage: {
      id: 'msg-1',
      channelId: 'general',
      senderId: 'user-1',
      content: 'Hey everyone! How\'s the semester going?',
      type: 'text',
      timestamp: '2024-04-22T10:30:00Z',
      isPinned: false,
      reactions: [],
      replyCount: 0
    }
  },
  {
    id: 'announcements',
    clubId: 'demo-club',
    name: 'announcements',
    description: 'Official announcements from club admins',
    type: 'announcement',
    isPrivate: false,
    createdById: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    memberCount: 156,
    unreadCount: 1,
    pinnedMessage: {
      id: 'msg-2',
      channelId: 'announcements',
      senderId: 'admin-1',
      content: 'Welcome to the Bugema Hub Chat System! Please read the community guidelines.',
      type: 'text',
      timestamp: '2024-04-20T09:00:00Z',
      isPinned: true,
      reactions: [
        { emoji: '👍', userIds: ['user-1', 'user-2'], count: 2 }
      ],
      replyCount: 0
    }
  },
  {
    id: 'events',
    clubId: 'demo-club',
    name: 'events',
    description: 'Event planning and coordination',
    type: 'text',
    isPrivate: false,
    createdById: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    memberCount: 89,
    unreadCount: 0,
    lastMessage: {
      id: 'msg-3',
      channelId: 'events',
      senderId: 'user-2',
      content: 'Don\'t forget about the tech meetup this Friday!',
      type: 'text',
      timestamp: '2024-04-22T09:15:00Z',
      isPinned: false,
      reactions: [],
      replyCount: 5
    }
  },
  {
    id: 'resources',
    clubId: 'demo-club',
    name: 'resources',
    description: 'Share study materials and resources',
    type: 'text',
    isPrivate: false,
    createdById: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    memberCount: 124,
    unreadCount: 0
  },
  {
    id: 'off-topic',
    clubId: 'demo-club',
    name: 'off-topic',
    description: 'Casual conversations and off-topic discussions',
    type: 'text',
    isPrivate: false,
    createdById: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
    memberCount: 98,
    unreadCount: 0
  }
]

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    channelId: 'general',
    senderId: 'user-1',
    content: 'Hey everyone! How\'s the semester going?',
    type: 'text',
    timestamp: '2024-04-22T10:30:00Z',
    isPinned: false,
    reactions: [
      { emoji: '👍', userIds: ['current-user'], count: 1 },
      { emoji: '😊', userIds: ['user-2'], count: 1 }
    ],
    replyCount: 2
  },
  {
    id: 'msg-4',
    channelId: 'general',
    senderId: 'current-user',
    content: 'Going pretty well! Just finished my midterms. How about you?',
    type: 'text',
    timestamp: '2024-04-22T10:32:00Z',
    isPinned: false,
    reactions: [],
    replyCount: 1
  },
  {
    id: 'msg-5',
    channelId: 'general',
    senderId: 'user-2',
    content: 'Same here! Looking forward to the break. Check out this cool resource I found: https://example.com/study-guide',
    type: 'text',
    timestamp: '2024-04-22T10:35:00Z',
    isPinned: false,
    reactions: [
      { emoji: '🔥', userIds: ['user-1', 'current-user'], count: 2 }
    ],
    replyCount: 0
  },
  {
    id: 'msg-6',
    channelId: 'general',
    senderId: 'user-1',
    content: 'Thanks for sharing! This looks really helpful.',
    type: 'text',
    timestamp: '2024-04-22T10:36:00Z',
    isPinned: false,
    reactions: [],
    replyCount: 0
  }
]

const mockTypingUsers: TypingIndicator[] = [
  {
    userId: 'user-3',
    userName: 'Sarah Chen',
    channelId: 'general',
    timestamp: new Date().toISOString()
  }
]

export default function ChatPage() {
  const [channels, setChannels] = useState<Channel[]>(mockChannels)
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(mockChannels[0])
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({
    'general': 3,
    'announcements': 1
  })
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showChannelList, setShowChannelList] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mock real-time updates
  useEffect(() => {
    // Simulate receiving new messages
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          channelId: currentChannel?.id || 'general',
          senderId: 'user-4',
          content: 'This is a simulated real-time message!',
          type: 'text',
          timestamp: new Date().toISOString(),
          isPinned: false,
          reactions: [],
          replyCount: 0
        }
        
        if (currentChannel && newMessage.channelId === currentChannel.id) {
          setMessages(prev => [...prev, newMessage])
        }
        
        // Update unread count if not in the channel
        if (!currentChannel || newMessage.channelId !== currentChannel.id) {
          setUnreadCounts(prev => ({
            ...prev,
            [newMessage.channelId]: (prev[newMessage.channelId] || 0) + 1
          }))
        }
      }
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [currentChannel])

  // Mock typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const typingUser: TypingIndicator = {
          userId: 'user-5',
          userName: 'Mike Wilson',
          channelId: currentChannel?.id || 'general',
          timestamp: new Date().toISOString()
        }
        setTypingUsers([typingUser])
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers([])
        }, 3000)
      }
    }, 15000) // Every 15 seconds

    return () => clearInterval(interval)
  }, [currentChannel])

  const handleChannelSelect = (channel: Channel) => {
    setCurrentChannel(channel)
    setShowChannelList(false)
    
    // Mark channel as read
    setUnreadCounts(prev => ({
      ...prev,
      [channel.id]: 0
    }))
    
    // Load messages for the channel (mock)
    setMessages(mockMessages.filter(msg => msg.channelId === channel.id))
  }

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'file', file?: File) => {
    if (!currentChannel) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId: currentChannel.id,
      senderId: mockCurrentUser.id,
      content,
      type,
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      fileName: file?.name,
      fileSize: file?.size,
      timestamp: new Date().toISOString(),
      isPinned: false,
      reactions: [],
      replyCount: 0
    }

    setMessages(prev => [...prev, newMessage])
    
    // Update channel's last message
    setChannels(prev => prev.map(channel =>
      channel.id === currentChannel.id
        ? { ...channel, lastMessage: newMessage }
        : channel
    ))
  }

  const handleEditMessage = async (messageId: string, content: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, content, editedAt: new Date().toISOString() }
        : msg
    ))
  }

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  const handleAddReaction = async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji)
        if (existingReaction) {
          if (!existingReaction.userIds.includes(mockCurrentUser.id)) {
            return {
              ...msg,
              reactions: msg.reactions.map(r =>
                r.emoji === emoji
                  ? { ...r, userIds: [...r.userIds, mockCurrentUser.id], count: r.count + 1 }
                  : r
              )
            }
          }
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, userIds: [mockCurrentUser.id], count: 1 }]
          }
        }
      }
      return msg
    }))
  }

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          reactions: msg.reactions.map(r =>
            r.emoji === emoji
              ? { ...r, userIds: r.userIds.filter(id => id !== mockCurrentUser.id), count: r.count - 1 }
              : r
          ).filter(r => r.count > 0)
        }
      }
      return msg
    }))
  }

  const handlePinMessage = async (messageId: string) => {
    setMessages(prev => prev.map(msg => ({
      ...msg,
      isPinned: !msg.isPinned
    })))
  }

  const handleReplyToMessage = (messageId: string) => {
    console.log('Reply to message:', messageId)
  }

  const handleReportMessage = (messageId: string) => {
    console.log('Report message:', messageId)
  }

  const handleCreateChannel = () => {
    console.log('Create channel')
  }

  const handleChannelSettings = (channel: Channel) => {
    console.log('Channel settings:', channel)
  }

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled)
  }

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile Channel List */}
      {isMobile && (
        <AnimatePresence>
          {showChannelList && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 z-30 w-80 bg-white dark:bg-gray-800 shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">Channels</h2>
                <button
                  onClick={() => setShowChannelList(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ChannelList
                channels={channels}
                currentChannel={currentChannel}
                currentUser={mockCurrentUser}
                onChannelSelect={handleChannelSelect}
                onCreateChannel={handleCreateChannel}
                onChannelSettings={handleChannelSettings}
                unreadCounts={unreadCounts}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Desktop Channel List */}
      {!isMobile && (
        <div className="w-80 flex-shrink-0">
          <ChannelList
            channels={channels}
            currentChannel={currentChannel}
            currentUser={mockCurrentUser}
            onChannelSelect={handleChannelSelect}
            onCreateChannel={handleCreateChannel}
            onChannelSettings={handleChannelSettings}
            unreadCounts={unreadCounts}
          />
        </div>
      )}

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        {isMobile && currentChannel && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowChannelList(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    #{currentChannel.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {currentChannel.memberCount} members
                  </p>
                </div>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <ChatWindow
          channel={currentChannel}
          currentUser={mockCurrentUser}
          messages={messages}
          typingUsers={typingUsers}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          onPinMessage={handlePinMessage}
          onReplyToMessage={handleReplyToMessage}
          onReportMessage={handleReportMessage}
          onToggleNotifications={handleToggleNotifications}
          notificationsEnabled={notificationsEnabled}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      </div>
    </div>
  )
}
