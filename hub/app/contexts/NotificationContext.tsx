'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Notification } from '../components/NotificationItem'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'New Event: Computer Science Workshop',
    message: 'CS Club is hosting a React workshop tomorrow at 3 PM',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    actionUrl: '/events/1',
    metadata: { eventId: '1' }
  },
  {
    id: '2',
    type: 'like',
    title: 'Sarah liked your post',
    message: 'Sarah Johnson liked your post about the Spring Festival',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    actionUrl: '/feed/1',
    metadata: { postId: '1', userId: '2' }
  },
  {
    id: '3',
    type: 'comment',
    title: 'New comment on your post',
    message: 'Mike Chen commented: "Great post! When is the festival?"',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    actionUrl: '/feed/1',
    metadata: { postId: '1' }
  },
  {
    id: '4',
    type: 'marketplace',
    title: 'New message about your listing',
    message: 'Someone is interested in your textbook listing',
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    actionUrl: '/marketplace/1',
    metadata: { listingId: '1' }
  },
  {
    id: '5',
    type: 'club_request',
    title: 'Club request approved',
    message: 'Your request to join Photography Club has been approved',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    actionUrl: '/clubs/1',
    metadata: { clubId: '1' }
  },
  {
    id: '6',
    type: 'payment',
    title: 'Payment confirmed',
    message: 'Your payment for event registration has been confirmed',
    isRead: false,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    actionUrl: '/profile/payments',
    metadata: {}
  },
  {
    id: '7',
    type: 'announcement',
    title: 'Campus Announcement',
    message: 'Library will be closed this weekend for maintenance',
    isRead: true,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    actionUrl: '/announcements/1',
    metadata: {}
  }
]

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const removeNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    )
  }


  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
