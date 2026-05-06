'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import NotificationPanel from './NotificationPanel'
import { Notification } from './NotificationItem'

interface NotificationBellProps {
  notifications: Notification[]
  onNotificationClick: (notification: Notification) => void
  onMarkAllAsRead: () => void
  onMarkAsRead: (notificationId: string) => void
}

export default function NotificationBell({
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
  onMarkAsRead
}: NotificationBellProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePanel}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Panel */}
      <NotificationPanel
        notifications={notifications}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onNotificationClick={onNotificationClick}
        onMarkAllAsRead={onMarkAllAsRead}
        onMarkAsRead={onMarkAsRead}
      />
    </div>
  )
}
