'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Users, 
  MessageCircle, 
  Search, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Circle,
  Check,
  CheckCheck,
  Clock,
  Ban,
  Volume2,
  VolumeX
} from 'lucide-react'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, onValue, off, update, remove, serverTimestamp } from 'firebase/database'

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://demo.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  senderAvatar?: string
  timestamp: number
  status: 'sending' | 'sent' | 'delivered' | 'read'
  type: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  replyTo?: string
  reactions?: Record<string, string>
}

interface User {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  lastSeen?: number
  typing?: boolean
}

interface ChatRoom {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'direct'
  participants: string[]
  createdAt: number
  lastMessage?: Message
  unreadCount?: number
}

interface RealTimeChatProps {
  roomId: string
  currentUserId: string
  currentUser: User
  className?: string
}

export default function RealTimeChat({
  roomId,
  currentUserId,
  currentUser,
  className = ''
}: RealTimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Emojis list
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😴', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']

  // Listen for messages
  useEffect(() => {
    const messagesRef = ref(database, `chatRooms/${roomId}/messages`)
    
    const handleNewMessage = (snapshot: any) => {
      const data = snapshot.val()
      if (data) {
        const messagesList = Object.entries(data).map(([id, message]: [string, any]) => ({
          id,
          ...message
        })).sort((a, b) => a.timestamp - b.timestamp)
        setMessages(messagesList)
      }
    }

    onValue(messagesRef, handleNewMessage)
    
    return () => {
      off(messagesRef, 'value', handleNewMessage)
    }
  }, [roomId])

  // Listen for online users
  useEffect(() => {
    const usersRef = ref(database, `chatRooms/${roomId}/users`)
    
    const handleUsersUpdate = (snapshot: any) => {
      const data = snapshot.val()
      if (data) {
        const usersList = Object.entries(data).map(([id, user]: [string, any]) => ({
          id,
          ...user
        }))
        setOnlineUsers(usersList.filter(user => user.isOnline))
      }
    }

    onValue(usersRef, handleUsersUpdate)
    
    return () => {
      off(usersRef, 'value', handleUsersUpdate)
    }
  }, [roomId])

  // Update user online status
  useEffect(() => {
    if (!currentUserId) return

    const userRef = ref(database, `chatRooms/${roomId}/users/${currentUserId}`)
    update(userRef, {
      ...currentUser,
      isOnline: true,
      lastSeen: Date.now()
    })

    // Set offline when component unmounts
    return () => {
      update(userRef, {
        isOnline: false,
        lastSeen: Date.now()
      })
    }
  }, [currentUserId, currentUser, roomId])

  // Handle typing indicator
  const handleTypingStart = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true)
      const typingRef = ref(database, `chatRooms/${roomId}/typing/${currentUserId}`)
      update(typingRef, {
        isTyping: true,
        timestamp: Date.now()
      })
    }

    // Clear typing indicator after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      const typingRef = ref(database, `chatRooms/${roomId}/typing/${currentUserId}`)
      remove(typingRef)
    }, 3000)
  }, [currentUserId, roomId, isTyping])

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return

    const messageData: Omit<Message, 'id'> = {
      text: newMessage.trim(),
      senderId: currentUserId,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      timestamp: Date.now(),
      status: 'sending',
      type: 'text',
      replyTo: replyingTo?.id
    }

    // Add message to database
    const messagesRef = ref(database, `chatRooms/${roomId}/messages`)
    const newMessageRef = push(messagesRef)
    
    try {
      await update(newMessageRef, {
        ...messageData,
        id: newMessageRef.key,
        status: 'sent'
      })
      
      setNewMessage('')
      setReplyingTo(null)
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Add reaction to message
  const addReaction = async (messageId: string, emoji: string) => {
    const reactionRef = ref(database, `chatRooms/${roomId}/messages/${messageId}/reactions/${currentUserId}`)
    update(reactionRef, {
      emoji,
      timestamp: Date.now()
    })
  }

  // Delete message
  const deleteMessage = async (messageId: string) => {
    const messageRef = ref(database, `chatRooms/${roomId}/messages/${messageId}`)
    remove(messageRef)
  }

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get message status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Community Chat</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {onlineUsers.length} online
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                message.senderId === currentUserId ? 'order-2' : 'order-1'
              }`}>
                {/* Reply indicator */}
                {message.replyTo && (
                  <div className="mb-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300">
                    Replying to {message.replyTo}
                  </div>
                )}
                
                <div
                  className={`p-3 rounded-lg ${
                    message.senderId === currentUserId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {message.senderId !== currentUserId && (
                    <div className="font-medium text-sm mb-1">
                      {message.senderName}
                    </div>
                  )}
                  <p className="text-sm break-words">{message.text}</p>
                  
                  {/* Message info */}
                  <div className={`flex items-center justify-between mt-1 text-xs ${
                    message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.senderId === currentUserId && (
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(message.status)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Reactions */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(message.reactions || {}).map(([userId, reaction]: [string, any]) => (
                      <button
                        key={userId}
                        onClick={() => addReaction(message.id, reaction.emoji)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {reaction.emoji} {Object.keys(message.reactions || {}).length}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Someone is typing...</span>
          </div>
        </div>
      )}

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Replying to:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {replyingTo.senderName}
              </span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Paperclip className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTypingStart()
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            
            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setNewMessage(prev => prev + emoji)
                        setShowEmojiPicker(false)
                        inputRef.current?.focus()
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Smile className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Online users indicator component
export function OnlineUsersIndicator({ users }: { users: User[] }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.id}
            className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
            title={user.name}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        ))}
        {users.length > 5 && (
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              +{users.length - 5}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-1">
        <Circle className="w-2 h-2 text-green-500 fill-current" />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {users.length} online
        </span>
      </div>
    </div>
  )
}
