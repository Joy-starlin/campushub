import { ref, push, set, update, remove, onValue, off, serverTimestamp, query, orderByChild, limitToLast, equalTo } from 'firebase/database'
import { realtimeDb } from './firebase'
import { Message, Channel, User, TypingIndicator, Presence, UnreadCount, Thread, MutedUser, ReportedMessage } from '../types/chat'

export class FirebaseChatService {
  // Messages
  static async sendMessage(channelId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    const messagesRef = ref(realtimeDb, `channels/${channelId}/messages`)
    const newMessageRef = push(messagesRef)
    const messageId = newMessageRef.key
    
    if (messageId) {
      await set(newMessageRef, {
        ...message,
        id: messageId,
        timestamp: serverTimestamp()
      })
      
      // Update channel's last message
      await this.updateChannelLastMessage(channelId, {
        id: messageId,
        ...message,
        timestamp: new Date().toISOString()
      } as Message)
    }
    
    return messageId || ''
  }

  static async editMessage(channelId: string, messageId: string, content: string): Promise<void> {
    const messageRef = ref(realtimeDb, `channels/${channelId}/messages/${messageId}`)
    await update(messageRef, {
      content,
      editedAt: serverTimestamp()
    })
  }

  static async deleteMessage(channelId: string, messageId: string): Promise<void> {
    const messageRef = ref(realtimeDb, `channels/${channelId}/messages/${messageId}`)
    await remove(messageRef)
  }

  static async addReaction(channelId: string, messageId: string, emoji: string, userId: string): Promise<void> {
    const reactionRef = ref(realtimeDb, `channels/${channelId}/messages/${messageId}/reactions/${emoji}`)
    const snapshot = await new Promise((resolve) => onValue(reactionRef, resolve, { onlyOnce: true }))
    
    const currentReaction = snapshot as { userIds?: string[] }
    const userIds = currentReaction?.userIds || []
    
    if (!userIds.includes(userId)) {
      await update(reactionRef, {
        userIds: [...userIds, userId],
        count: userIds.length + 1,
        emoji
      })
    }
  }

  static async removeReaction(channelId: string, messageId: string, emoji: string, userId: string): Promise<void> {
    const reactionRef = ref(realtimeDb, `channels/${channelId}/messages/${messageId}/reactions/${emoji}`)
    const snapshot = await new Promise((resolve) => onValue(reactionRef, resolve, { onlyOnce: true }))
    
    const currentReaction = snapshot as { userIds?: string[] }
    const userIds = currentReaction?.userIds || []
    
    if (userIds.includes(userId)) {
      const newUserIds = userIds.filter((id: string) => id !== userId)
      if (newUserIds.length > 0) {
        await update(reactionRef, {
          userIds: newUserIds,
          count: newUserIds.length
        })
      } else {
        await remove(reactionRef)
      }
    }
  }

  static async pinMessage(channelId: string, messageId: string): Promise<void> {
    const messageRef = ref(realtimeDb, `channels/${channelId}/messages/${messageId}`)
    const channelRef = ref(realtimeDb, `channels/${channelId}`)
    
    await update(messageRef, { isPinned: true })
    await update(channelRef, { pinnedMessageId: messageId })
  }

  static async unpinMessage(channelId: string): Promise<void> {
    const channelRef = ref(realtimeDb, `channels/${channelId}`)
    await update(channelRef, { pinnedMessageId: null })
  }

  // Channels
  static async createChannel(channel: Omit<Channel, 'id' | 'createdAt' | 'memberCount' | 'unreadCount'>): Promise<string> {
    const channelsRef = ref(realtimeDb, `channels`)
    const newChannelRef = push(channelsRef)
    const channelId = newChannelRef.key
    
    if (channelId) {
      await set(newChannelRef, {
        ...channel,
        id: channelId,
        createdAt: serverTimestamp(),
        memberCount: 0,
        unreadCount: 0
      })
    }
    
    return channelId || ''
  }

  static async deleteChannel(channelId: string): Promise<void> {
    const channelRef = ref(realtimeDb, `channels/${channelId}`)
    await remove(channelRef)
  }

  static async updateChannelLastMessage(channelId: string, message: Message): Promise<void> {
    const channelRef = ref(realtimeDb, `channels/${channelId}`)
    await update(channelRef, {
      lastMessage: message,
      lastActivity: serverTimestamp()
    })
  }

  // Threads
  static async createThread(thread: Omit<Thread, 'id' | 'createdAt' | 'lastActivity'>): Promise<string> {
    const threadsRef = ref(realtimeDb, `threads`)
    const newThreadRef = push(threadsRef)
    const threadId = newThreadRef.key
    
    if (threadId) {
      await set(newThreadRef, {
        ...thread,
        id: threadId,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      })
    }
    
    return threadId || ''
  }

  static async addThreadMessage(threadId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    const threadMessagesRef = ref(realtimeDb, `threads/${threadId}/messages`)
    const newMessageRef = push(threadMessagesRef)
    const messageId = newMessageRef.key
    
    if (messageId) {
      await set(newMessageRef, {
        ...message,
        id: messageId,
        timestamp: serverTimestamp()
      })
      
      // Update thread's last activity
      const threadRef = ref(realtimeDb, `threads/${threadId}`)
      await update(threadRef, {
        lastActivity: serverTimestamp()
      })
    }
    
    return messageId || ''
  }

  // Typing Indicators
  static setTyping(channelId: string, userId: string, userName: string): void {
    const typingRef = ref(realtimeDb, `typing/${channelId}/${userId}`)
    set(typingRef, {
      userId,
      userName,
      channelId,
      timestamp: serverTimestamp()
    })
    
    // Remove typing indicator after 5 seconds
    setTimeout(() => {
      remove(typingRef)
    }, 5000)
  }

  static removeTyping(channelId: string, userId: string): void {
    const typingRef = ref(realtimeDb, `typing/${channelId}/${userId}`)
    remove(typingRef)
  }

  // Presence
  static updatePresence(userId: string, status: 'online' | 'away' | 'offline', currentChannel?: string): void {
    const presenceRef = ref(realtimeDb, `presence/${userId}`)
    set(presenceRef, {
      userId,
      status,
      lastSeen: serverTimestamp(),
      currentChannel
    })
  }

  // Unread Counts
  static async updateUnreadCount(userId: string, channelId: string, count: number): Promise<void> {
    const unreadRef = ref(realtimeDb, `unread/${userId}/${channelId}`)
    await set(unreadRef, {
      userId,
      channelId,
      count,
      lastReadAt: serverTimestamp()
    })
  }

  static async markAsRead(userId: string, channelId: string): Promise<void> {
    const unreadRef = ref(realtimeDb, `unread/${userId}/${channelId}`)
    await set(unreadRef, {
      userId,
      channelId,
      count: 0,
      lastReadAt: serverTimestamp()
    })
  }

  // Moderation
  static async muteUser(mute: Omit<MutedUser, 'id' | 'isActive'>): Promise<string> {
    const mutesRef = ref(realtimeDb, `mutes`)
    const newMuteRef = push(mutesRef)
    const muteId = newMuteRef.key
    
    if (muteId) {
      await set(newMuteRef, {
        ...mute,
        id: muteId,
        isActive: true
      })
    }
    
    return muteId || ''
  }

  static async unmuteUser(muteId: string): Promise<void> {
    const muteRef = ref(realtimeDb, `mutes/${muteId}`)
    await update(muteRef, { isActive: false })
  }

  static async reportMessage(report: Omit<ReportedMessage, 'id' | 'timestamp' | 'status'>): Promise<string> {
    const reportsRef = ref(realtimeDb, `reports`)
    const newReportRef = push(reportsRef)
    const reportId = newReportRef.key
    
    if (reportId) {
      await set(newReportRef, {
        ...report,
        id: reportId,
        timestamp: serverTimestamp(),
        status: 'pending'
      })
    }
    
    return reportId || ''
  }

  // Real-time Listeners
  static listenToMessages(channelId: string, callback: (messages: Message[]) => void): () => void {
    const messagesRef = query(
      ref(realtimeDb, `channels/${channelId}/messages`),
      orderByChild('timestamp'),
      limitToLast(100)
    )
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      const messages: Message[] = data ? Object.values(data) : []
      callback(messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
    })
    
    return unsubscribe
  }

  static listenToChannels(clubId: string, callback: (channels: Channel[]) => void): () => void {
    const channelsRef = query(
      ref(realtimeDb, `channels`),
      orderByChild('clubId'),
      equalTo(clubId)
    )
    
    const unsubscribe = onValue(channelsRef, (snapshot) => {
      const data = snapshot.val()
      const channels: Channel[] = data ? Object.values(data) : []
      callback(channels)
    })
    
    return unsubscribe
  }

  static listenToTyping(channelId: string, callback: (typingUsers: TypingIndicator[]) => void): () => void {
    const typingRef = ref(realtimeDb, `typing/${channelId}`)
    
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const data = snapshot.val()
      const typingUsers: TypingIndicator[] = data ? Object.values(data) : []
      
      // Filter out old typing indicators (older than 5 seconds)
      const now = Date.now()
      const filteredTyping = typingUsers.filter(user => 
        now - new Date(user.timestamp).getTime() < 5000
      )
      
      callback(filteredTyping)
    })
    
    return unsubscribe
  }

  static listenToPresence(userIds: string[], callback: (presence: Record<string, Presence>) => void): () => void {
    const presenceRefs = userIds.map(userId => ref(realtimeDb, `presence/${userId}`))
    const unsubscribers = presenceRefs.map(presenceRef => 
      onValue(presenceRef, () => {
        // Re-fetch all presence data when any user's presence changes
        const allPresenceRef = ref(realtimeDb, 'presence')
        onValue(allPresenceRef, (snapshot) => {
          const data = snapshot.val()
          callback(data || {})
        })
      })
    )
    
    return () => unsubscribers.forEach(unsubscribe => unsubscribe())
  }

  static listenToUnreadCounts(userId: string, callback: (unreadCounts: Record<string, number>) => void): () => void {
    const unreadRef = ref(realtimeDb, `unread/${userId}`)
    
    const unsubscribe = onValue(unreadRef, (snapshot) => {
      const data = snapshot.val()
      const unreadCounts: Record<string, number> = {}
      
      if (data) {
        const unreadData = data as Record<string, { channelId: string; count: number }>
        Object.values(unreadData).forEach((unread) => {
          unreadCounts[unread.channelId] = unread.count
        })
      }
      
      callback(unreadCounts)
    })
    
    return unsubscribe
  }

  // Search
  static async searchMessages(channelId: string, query: string): Promise<Message[]> {
    // In a real implementation, you'd use a search service like Algolia
    // For now, we'll do a basic client-side search
    const messagesRef = ref(realtimeDb, `channels/${channelId}/messages`)
    const snapshot = await new Promise((resolve) => onValue(messagesRef, resolve, { onlyOnce: true }))
    const data = snapshot as Record<string, Message>
    
    if (!data) return []
    
    const messages: Message[] = Object.values(data)
    const searchResults = messages.filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase())
    )
    
    return searchResults
  }

  // File Upload (placeholder - would integrate with Firebase Storage)
  static async uploadFile(file: File): Promise<string> {
    // In a real implementation, this would upload to Firebase Storage
    // For now, return a mock URL
    return `https://mock-storage.com/files/${file.name}`
  }
}

export { ref, push, set, update, remove, onValue, off, serverTimestamp }
