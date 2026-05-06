'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  MessageCircle, 
  Send, 
  Heart, 
  ThumbsUp, 
  Laugh, 
  Eye,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  Share,
  Volume2,
  VolumeX,
  Monitor,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { VirtualEvent, EventChatMessage, LiveEventSession } from '../types/virtual-events'
import toast from 'react-hot-toast'

interface LiveEventFeaturesProps {
  event: VirtualEvent
  currentSession: LiveEventSession | null
  userId: string
  userName: string
  isModerator: boolean
  onSendMessage: (message: string) => void
  onReactToMessage: (messageId: string, reaction: string) => void
  onToggleAudio: () => void
  onToggleVideo: () => void
  onShareScreen: () => void
  onLeaveEvent: () => void
}

export default function LiveEventFeatures({
  event,
  currentSession,
  userId,
  userName,
  isModerator,
  onSendMessage,
  onReactToMessage,
  onToggleAudio,
  onToggleVideo,
  onShareScreen,
  onLeaveEvent
}: LiveEventFeaturesProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  const reactions = [
    { type: 'like', icon: ThumbsUp, label: 'Like' },
    { type: 'love', icon: Heart, label: 'Love' },
    { type: 'laugh', icon: Laugh, label: 'Laugh' },
    { type: 'wow', icon: Eye, label: 'Wow' },
    { type: 'sad', icon: Heart, label: 'Sad' },
    { type: 'angry', icon: Heart, label: 'Angry' }
  ]

  useEffect(() => {
    // Scroll to bottom of chat when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [currentSession?.chatMessages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
      messageInputRef.current?.focus()
    }
  }

  const handleReaction = (reactionType: string) => {
    setSelectedReaction(reactionType)
    setTimeout(() => setSelectedReaction(null), 1000)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReactionCount = (message: EventChatMessage, type: string) => {
    return message.reactions.filter(r => r.type === type).length
  }

  const hasUserReacted = (message: EventChatMessage, type: string) => {
    return message.reactions.some(r => r.type === type && r.userId === userId)
  }

  return (
    <div className="h-screen bg-gray-900 dark:bg-black flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-800 dark:bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">LIVE</span>
          </div>
          <div className="text-white">
            <h1 className="font-semibold">{event.title}</h1>
            <p className="text-sm text-gray-400">{event.organizerName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Attendee Count */}
          <div className="flex items-center space-x-2 text-white">
            <Users className="w-5 h-5" />
            <span className="font-medium">{currentSession?.attendeeCount || 0}</span>
          </div>

          {/* Event Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isChatOpen ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <button
              onClick={onLeaveEvent}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Leave Event
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video/Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Container */}
          <div className={`flex-1 bg-black relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Main Video */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Monitor className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                <p className="text-white text-lg">Event Content</p>
                <p className="text-gray-400">Main video or screen share will appear here</p>
              </div>
            </div>

            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
              {/* Audio Toggle */}
              <button
                onClick={() => {
                  setIsAudioEnabled(!isAudioEnabled)
                  onToggleAudio()
                }}
                className={`p-3 rounded-full transition-colors ${
                  isAudioEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Video Toggle */}
              <button
                onClick={() => {
                  setIsVideoEnabled(!isVideoEnabled)
                  onToggleVideo()
                }}
                className={`p-3 rounded-full transition-colors ${
                  isVideoEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Screen Share */}
              <button
                onClick={() => {
                  setIsScreenSharing(!isScreenSharing)
                  onShareScreen()
                }}
                className={`p-3 rounded-full transition-colors ${
                  isScreenSharing ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <Monitor className="w-5 h-5" />
              </button>
            </div>

            {/* Reaction Overlay */}
            <AnimatePresence>
              {selectedReaction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 50 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="text-6xl animate-bounce">
                    {selectedReaction === 'like' && '👍'}
                    {selectedReaction === 'love' && '❤️'}
                    {selectedReaction === 'laugh' && '😂'}
                    {selectedReaction === 'wow' && '😮'}
                    {selectedReaction === 'sad' && '😢'}
                    {selectedReaction === 'angry' && '😠'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reaction Bar */}
          <div className="bg-gray-800 dark:bg-gray-900 border-t border-gray-700 px-4 py-3">
            <div className="flex items-center justify-center space-x-4">
              {reactions.map((reaction) => {
                const Icon = reaction.icon
                return (
                  <button
                    key={reaction.type}
                    onClick={() => handleReaction(reaction.type)}
                    className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all hover:scale-110"
                    title={reaction.label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-800 dark:bg-gray-900 border-l border-gray-700 flex flex-col"
            >
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">Event Chat</h3>
                  <span className="text-gray-400 text-sm">
                    {currentSession?.chatMessages.length || 0} messages
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              >
                {currentSession?.chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`space-y-2 ${
                      message.userId === userId ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className={`flex items-start space-x-2 ${
                      message.userId === userId ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {message.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className={`max-w-xs ${
                        message.userId === userId ? 'text-right' : ''
                      }`}>
                        <div className={`text-xs text-gray-400 mb-1 ${
                          message.userId === userId ? 'text-right' : ''
                        }`}>
                          {message.userName} • {formatTime(message.timestamp)}
                        </div>
                        <div className={`px-3 py-2 rounded-lg ${
                          message.userId === userId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}>
                          {message.message}
                        </div>
                        
                        {/* Reactions */}
                        {message.reactions.length > 0 && (
                          <div className={`flex flex-wrap gap-1 mt-2 ${
                            message.userId === userId ? 'justify-end' : 'justify-start'
                          }`}>
                            {reactions.map((reaction) => {
                              const count = getReactionCount(message, reaction.type)
                              const userReacted = hasUserReacted(message, reaction.type)
                              if (count === 0) return null
                              
                              const Icon = reaction.icon
                              return (
                                <button
                                  key={reaction.type}
                                  onClick={() => onReactToMessage(message.id, reaction.type)}
                                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                                    userReacted
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  }`}
                                >
                                  <Icon className="w-3 h-3" />
                                  <span>{count}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="px-4 py-3 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
