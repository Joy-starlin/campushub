'use client'

import { formatDistanceToNow } from 'date-fns'
import { 
  Calendar, 
  Heart, 
  MessageCircle, 
  ShoppingBag, 
  Users, 
  CreditCard, 
  Megaphone 
} from 'lucide-react'

export interface Notification {
  id: string
  type: 'event' | 'like' | 'comment' | 'marketplace' | 'club_request' | 'payment' | 'announcement'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  actionUrl?: string
  metadata?: {
    eventId?: string
    postId?: string
    userId?: string
    listingId?: string
    clubId?: string
  }
}

interface NotificationItemProps {
  notification: Notification
  onClick: (notification: Notification) => void
}

const notificationConfig = {
  event: {
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  like: {
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  comment: {
    icon: MessageCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  marketplace: {
    icon: ShoppingBag,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  club_request: {
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  payment: {
    icon: CreditCard,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  announcement: {
    icon: Megaphone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  }
}

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const config = notificationConfig[notification.type]
  const Icon = config.icon

  return (
    <div
      onClick={() => onClick(notification)}
      className={`flex items-start space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
    >
      {/* Icon */}
      <div className={`shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900`}>
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            </p>
          </div>
          
          {/* Unread indicator */}
          {!notification.isRead && (
            <div className="shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
          )}
        </div>
      </div>
    </div>
  )
}
