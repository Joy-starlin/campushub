export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'moderator' | 'member'
  isVerified: boolean
  isOnline: boolean
  lastSeen: string
}

export interface Club {
  id: string
  name: string
  description: string
  avatar?: string
  memberId: string[]
  adminId: string[]
  moderatorId: string[]
}

export interface Channel {
  id: string
  clubId: string
  name: string
  description: string
  type: 'text' | 'announcement'
  isPrivate: boolean
  createdById: string
  createdAt: string
  memberCount: number
  unreadCount: number
  lastMessage?: Message
  pinnedMessage?: Message
}

export interface Message {
  id: string
  channelId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  timestamp: string
  editedAt?: string
  isPinned: boolean
  replyToId?: string
  threadId?: string
  reactions: MessageReaction[]
  replyCount: number
}

export interface MessageReaction {
  emoji: string
  userIds: string[]
  count: number
}

export interface Thread {
  id: string
  messageId: string
  channelId: string
  messages: Message[]
  participantIds: string[]
  createdAt: string
  lastActivity: string
}

export interface TypingIndicator {
  userId: string
  userName: string
  channelId: string
  timestamp: string
}

export interface Presence {
  userId: string
  status: 'online' | 'away' | 'offline'
  lastSeen: string
  currentChannel?: string
}

export interface UnreadCount {
  userId: string
  channelId: string
  count: number
  lastReadAt: string
}

export interface MutedUser {
  userId: string
  mutedBy: string
  channelId: string
  reason: string
  expiresAt: string
  isActive: boolean
}

export interface ReportedMessage {
  id: string
  messageId: string
  reportedBy: string
  reason: string
  description: string
  timestamp: string
  status: 'pending' | 'reviewed' | 'resolved'
  reviewedBy?: string
  reviewedAt?: string
}

export interface ChatNotification {
  id: string
  userId: string
  type: 'message' | 'mention' | 'thread_reply'
  channelId: string
  messageId: string
  content: string
  senderName: string
  timestamp: string
  isRead: boolean
}

export interface MessageSearch {
  query: string
  channelId?: string
  userId?: string
  dateRange?: {
    start: string
    end: string
  }
  results: Message[]
  totalCount: number
}

export interface ChatSettings {
  userId: string
  soundEnabled: boolean
  desktopNotifications: boolean
  emailNotifications: boolean
  showOnlineStatus: boolean
  showTypingIndicators: boolean
  theme: 'light' | 'dark' | 'auto'
}

export interface FileUpload {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedBy: string
  uploadedAt: string
}

export interface EmojiPicker {
  isOpen: boolean
  position: { x: number; y: number }
  onSelect: (emoji: string) => void
}

export interface ChatState {
  currentChannel: Channel | null
  channels: Channel[]
  messages: Message[]
  users: User[]
  typingUsers: TypingIndicator[]
  isSearchOpen: boolean
  searchQuery: string
  searchResults: Message[]
  isThreadOpen: boolean
  currentThread: Thread | null
  unreadCounts: Record<string, number>
  presence: Record<string, Presence>
  settings: ChatSettings
}

export interface ChatActions {
  setCurrentChannel: (channel: Channel | null) => void
  sendMessage: (content: string, type: 'text' | 'image' | 'file', file?: File) => Promise<void>
  editMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  addReaction: (messageId: string, emoji: string) => Promise<void>
  removeReaction: (messageId: string, emoji: string) => Promise<void>
  pinMessage: (messageId: string) => Promise<void>
  unpinMessage: (messageId: string) => Promise<void>
  startThread: (messageId: string) => void
  replyToThread: (threadId: string, content: string) => Promise<void>
  createChannel: (name: string, description: string, type: 'text' | 'announcement') => Promise<void>
  deleteChannel: (channelId: string) => Promise<void>
  muteUser: (userId: string, channelId: string, reason: string, duration: number) => Promise<void>
  unmuteUser: (userId: string, channelId: string) => Promise<void>
  reportMessage: (messageId: string, reason: string, description: string) => Promise<void>
  searchMessages: (query: string, channelId?: string) => Promise<void>
  markAsRead: (channelId: string) => Promise<void>
  updateSettings: (settings: Partial<ChatSettings>) => Promise<void>
  setTyping: (channelId: string, isTyping: boolean) => void
  updatePresence: (status: 'online' | 'away' | 'offline') => void
}
